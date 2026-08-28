const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function buildAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const fallback = process.env.FRONTEND_URL || "http://localhost:5173";
  return new Set(fromEnv.length ? fromEnv : [fallback]);
}

function getOriginFromReferer(referer) {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function csrfGuard(req, res, next) {
  if (!unsafeMethods.has(req.method)) {
    return next();
  }

  const allowedOrigins = buildAllowedOrigins();
  const origin = req.get("origin") || getOriginFromReferer(req.get("referer"));

  if (!origin || !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  next();
}

module.exports = csrfGuard;
