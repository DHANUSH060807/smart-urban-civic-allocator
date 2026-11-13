import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find the user
    const result = await pool.query(
      `SELECT user_id, full_name, email, password_hash, role, department_id
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "civicflow_demo_secret",
      { expiresIn: "1h" }
    );

    return Response.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 }
    );
  }
}