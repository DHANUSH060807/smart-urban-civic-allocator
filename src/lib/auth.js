import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "civicflow_demo_secret";

export function verifyToken(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return {
        success: false,
        message: "Authentication token is required",
        status: 401,
      };
    }

    const token = authorization.substring(7);

    const user = jwt.verify(token, JWT_SECRET);

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Invalid or expired authentication token",
      status: 401,
    };
  }
}

export function authorizeRoles(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      message: "You do not have permission to perform this action",
      status: 403,
    };
  }

  return {
    success: true,
  };
}