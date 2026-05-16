import { useState } from "react";

export default function LoginPopup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
    if (!username.trim()) return;
    (window as any).electronAPI?.sendLogin(username.trim());
  }

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: 20,
      height: "100vh", display: "flex", flexDirection: "column",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 400,
        margin: "0 0 16px", color: "var(--text)", textAlign: "center",
      }}>
        Sign in to inklet
      </p>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        placeholder="Username or email"
        autoFocus
        style={{
          width: "100%", fontSize: 13, padding: "8px 10px",
          borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--bg-input)", outline: "none",
          color: "var(--text)", marginBottom: 8,
        }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        placeholder="Password"
        style={{
          width: "100%", fontSize: 13, padding: "8px 10px",
          borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--bg-input)", outline: "none",
          color: "var(--text)", marginBottom: 14,
        }}
      />
      <button onClick={handleSubmit} style={{
        width: "100%", padding: "8px", borderRadius: 8,
        background: "var(--accent)", color: "var(--bg)",
        border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
        fontFamily: "var(--font-sans)",
      }}>
        Sign in
      </button>
      <p style={{
        fontSize: 11, color: "var(--text-muted)", textAlign: "center",
        margin: "10px 0 0",
      }}>
        Don't have an account?{" "}
        <span
          onClick={() => (window as any).electronAPI?.openExternal("https://www.iminklet.com")}
          style={{ color: "var(--text-secondary)", textDecoration: "underline", cursor: "pointer" }}
        >Sign up</span>
      </p>
    </div>
  );
}
