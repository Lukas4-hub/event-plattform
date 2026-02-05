import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { redirect } from "next/navigation";
import { createEdition, createEvent, togglePublishEvent } from "./actions";

export default async function OrganizerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ORGANIZER") redirect("/dashboard/attendee");

  const events = await prisma.event.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      published: true,
      createdAt: true,
      editions: {
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          name: true,
          startsAt: true,
          endsAt: true,
          capacity: true,
          status: true,
          _count: { select: { registrations: true } },
        },
      },
    },
  });

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Dashboard Organizador</h1>
      <p style={{ marginTop: 8, color: "#444" }}>
        Creá eventos, publicalos y agregá ediciones.
      </p>

      <section style={{ marginTop: 20, border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Crear evento</h2>

        <form action={createEvent} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input name="title" placeholder="Título" style={inputStyle} />
          <input name="category" placeholder="Categoría (opcional)" style={inputStyle} />
          <textarea name="description" placeholder="Descripción" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          <button style={buttonStyle}>Crear</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Mis eventos</h2>

        {events.length === 0 ? (
          <p>No tenés eventos todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {events.map((e) => (
              <article key={e.id} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{e.title}</h3>
                    <p style={{ marginTop: 6, color: "#444" }}>{e.description}</p>
                    <p style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
                      Categoría: {e.category ?? "—"} · Estado:{" "}
                      <strong style={{ color: e.published ? "#0a7" : "#a60" }}>
                        {e.published ? "Publicado" : "Borrador"}
                      </strong>
                    </p>
                  </div>

                  <form action={togglePublishEvent}>
                    <input type="hidden" name="eventId" value={e.id} />
                    <button style={buttonStyle}>
                      {e.published ? "Despublicar" : "Publicar"}
                    </button>
                  </form>
                </div>

                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700 }}>Agregar edición</summary>

                  <form action={createEdition} style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <input type="hidden" name="eventId" value={e.id} />
                    <input name="name" placeholder="Nombre (ej: Edición 2026)" style={inputStyle} />
                    <label style={labelStyle}>
                      Inicio
                      <input name="startsAt" type="datetime-local" style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Fin
                      <input name="endsAt" type="datetime-local" style={inputStyle} />
                    </label>
                    <input name="location" placeholder="Lugar / plataforma (opcional)" style={inputStyle} />
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input name="isOnline" type="checkbox" />
                      Es online
                    </label>
                    <input name="capacity" type="number" min={1} placeholder="Cupos" style={inputStyle} />
                    <button style={buttonStyle}>Crear edición</button>
                  </form>
                </details>

                <div style={{ marginTop: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Ediciones</h4>
                  {e.editions.length === 0 ? (
                    <p style={{ marginTop: 6 }}>Todavía no hay ediciones.</p>
                  ) : (
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {e.editions.map((ed) => (
                        <li key={ed.id} style={{ marginBottom: 6 }}>
                          <strong>{ed.name}</strong> — {fmt(ed.startsAt)} a {fmt(ed.endsAt)} ·{" "}
                          {ed._count.registrations}/{ed.capacity} inscriptos · {String(ed.status)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "short", timeStyle: "short" }).format(d);
}

const inputStyle: React.CSSProperties = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
  width: "100%",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  color: "#333",
};
