const mongoose = require("mongoose");

async function withTransaction(fn, { maxRetries = 3 } = {}) {
  const session = await mongoose.startSession();
  try {
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        session.startTransaction();
        const result = await fn(session);
        await commitWithRetry(session);
        return result;
      } catch (err) {
        await safeAbort(session);

        const isTransient =
          err.errorLabels &&
          err.errorLabels.includes("TransientTransactionError");

        if (isTransient && attempt < maxRetries) {
          continue;
        }
        throw err;
      }
    }
  } finally {
    await session.endSession();
  }
}

async function commitWithRetry(session) {
  while (true) {
    try {
      await session.commitTransaction();
      return;
    } catch (err) {
      const isRetryableCommit =
        err.errorLabels &&
        err.errorLabels.includes("UnknownTransactionCommitResult");
      if (isRetryableCommit) {
        continue;
      }
      throw err;
    }
  }
}

async function safeAbort(session) {
  try {
    await session.abortTransaction();
  } catch (err) {
    console.log("error", err);
  }
}

module.exports = { withTransaction };
