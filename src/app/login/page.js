"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Store login information for the project demo
      localStorage.setItem("civicflow_token", data.token);
      localStorage.setItem("civicflow_user", JSON.stringify(data.user));

      setMessage(`Login successful! Welcome, ${data.user.full_name}`);

      // Redirect based on the user's role
      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          router.push("/");
        } else {
          router.push("/issues");
        }
      }, 700);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Could not connect to the login service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
        padding: "20px",
        color: "#111827",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          color: "#111827",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          CivicFlow Login
        </h1>

        <p
          style={{
            color: "#1f2937",
            marginBottom: "24px",
          }}
        >
          Sign in to access the Smart Urban Management System
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              color: "#111827",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #94a3b8",
              borderRadius: "6px",
              boxSizing: "border-box",
              color: "#111827",
              background: "#ffffff",
              fontSize: "15px",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#111827",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #94a3b8",
              borderRadius: "6px",
              boxSizing: "border-box",
              color: "#111827",
              background: "#ffffff",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#059669",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: message.includes("successful")
                ? "#047857"
                : "#b91c1c",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#111827",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "#111827" }}>Demo Accounts</strong>
          <br />
          Admin: admin@gmail.com
          <br />
          Officer: road@gmail.com
          <br />
          Citizen: citizen@gmail.com
        </div>
      </div>
    </main>
  );
}