"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ATTENDEE" | "ORGANIZER">("ATTENDEE");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMsg(data?.error ?? "Error.");
      return;
    }

    // auto-login
    const login = await signIn("credentials", { email, password, redirect: false });
    if (login?.error) {
      setMsg("Registrado, pero no pude iniciar sesión automáticamente.");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Registro</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          type="password"
          placeholder="password (>=6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        >
          <option value="ATTENDEE">Asistente</option>
          <option value="ORGANIZER">Organizador</option>
        </select>

        {msg && <p style={{ color: resColor(msg) }}>{msg}</p>}

        <button style={{ padding: 10, borderRadius: 8, border: "1px solid #333" }}>
          Crear cuenta
        </button>
      </form>
    </main>
  );
}

function resColor(text: string) {
  return text.toLowerCase().includes("error") ? "crimson" : "green";
}
