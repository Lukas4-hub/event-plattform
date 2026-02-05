import Link from "next/link";
import { prisma } from "lib/prisma";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      imageUrl: true,
      createdAt: true,
      owner: { select: { name: true, email: true } },
      _count: { select: { editions: true } },
    },
  });

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Eventos</h1>
      <p style={{ marginTop: 8, color: "#444" }}>
        Listado de eventos publicados.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {events.length === 0 ? (
          <p>No hay eventos publicados todavía.</p>
        ) : (
          events.map((e) => (
            <article
              key={e.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    <Link href={`/events/${e.id}`}>{e.title}</Link>
                  </h2>

                  <p style={{ marginTop: 6, color: "#444" }}>
                    {truncate(e.description, 140)}
                  </p>

                  <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 14, color: "#666" }}>
                    <span>Categoría: {e.category ?? "—"}</span>
                    <span>Ediciones: {e._count.editions}</span>
                    <span>
                      Creador: {e.owner.name ?? e.owner.email}
                    </span>
                  </div>
                </div>

                <div style={{ alignSelf: "center" }}>
                  <Link
                    href={`/events/${e.id}`}
                    style={{
                      display: "inline-block",
                      padding: "10px 12px",
                      border: "1px solid #333",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "#111",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}
