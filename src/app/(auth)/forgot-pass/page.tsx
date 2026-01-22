"use client";

import Link from "next/link";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PageForgotPass() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess("Password reset email sent! Please check your inbox.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleReset}
      style={{
        maxWidth: 320,
        margin: "4rem auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: 10,
          borderRadius: 4,
          background: "#38b2ac",
          color: "white",
          border: "none",
        }}
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
      {formError && <div style={{ color: "red" }}>{formError}</div>}
      {formSuccess && <div style={{ color: "green" }}>{formSuccess}</div>}
      <span style={{ textAlign: "center", color: "#555" }}>
        Go back for{" "}
        <Link href="/login" style={{ color: "#38b2ac" }}>
          Sign in
        </Link>
        {" / "}
        <Link href="/signup" style={{ color: "#38b2ac" }}>
          Sign up
        </Link>
      </span>
    </form>
  );
}
