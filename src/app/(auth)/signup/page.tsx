"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.replace("/admin");
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      style={{
        maxWidth: 320,
        margin: "4rem auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <button
        type="submit"
        style={{
          padding: 10,
          borderRadius: 4,
          background: "#38b2ac",
          color: "white",
          border: "none",
        }}
      >
        Sign Up
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
