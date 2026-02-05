
"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  const user = session?.user as any;
  const role = user?.role as string | undefined;

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e5e5",
        padding: "12px 16px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <nav
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ fontWeight: 800 }}>
            EventPlatform
          </Link>

          <Link href="/events">Eventos</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {status === "loading" ? (
            <span>Cargando...</span>
          ) : session ? (
            <>
              <span style={{ fontSize: 14, color: "#444" }}>
                {user?.name ?? user?.email} {role ? `(${role})` : ""}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #333",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Registro</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
