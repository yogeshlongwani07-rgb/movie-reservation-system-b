jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const { isLoggedIn, isAdmin, isUser } = require("../../src/middleware/auth");

describe("auth middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("isLoggedIn blocks request when token is missing", async () => {
    isLoggedIn(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please log in first",
      success: false,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("isLoggedIn attaches user when token is valid", () => {
    req.cookies.accessToken = "valid-token";
    jwt.verify.mockReturnValue({ _id: "123", role: "user" });

    isLoggedIn(req, res, next);

    expect(req.user).toEqual({ _id: "123", role: "user" });
    expect(next).toHaveBeenCalled();
  });

  test("isAdmin blocks non-admin users", () => {
    req.user = { role: "user" };

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("isUser blocks non-user roles", () => {
    req.user = { role: "admin" };

    isUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
