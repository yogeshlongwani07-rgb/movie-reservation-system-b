async function issueSessionTokens(doc, repository) {
  const accessToken = generateAccessToken(doc);
  const refreshToken = generateRefreshToken(doc);
  doc.refreshToken = refreshToken;
  await repository.save(doc);
  return { accessToken, refreshToken };
}

module.exports = { issueSessionTokens };
