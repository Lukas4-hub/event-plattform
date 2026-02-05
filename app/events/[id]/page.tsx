import { prisma } from "lib/prisma";
import { notFound } from "next/navigation";
import { EditionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { cancelRegistration, registerToEdition } from "./actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user as any | undefined;
  const userId = user?.id as string | undefined;
  const role = user?.role as string | undefined;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      published: true,
      owner: { select: { name: true, email: true } },
      editions: {
        where: { status: EditionStatus.PUBLISHED },
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          name: true,
          startsAt: true,
          endsAt: true,
          location: true,
          isOnline: true,
          capacity: true,
          _count: { select: { registrations: true } },
          registrations: userId
            ? { where: { userId }, select: { id: true } }
            : { select: { id: true }, take: 0 },
        },
      },
    },
  });

  if (!event || !event.published) return notFound();

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 30, fontWeight: 900 }}>{event.title}</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 12, color: "#666" }}>
        <span>Categoría: {event.category ?? "—"}</span>
        <span>Creador: {event.owner.name ?? event.owner.email}</span>
      </div>

      <p style={{ marginTop: 16, lineHeight: 1.5 }}>{event.description}</p>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Ediciones</h2>

        {event.editions.length === 0 ? (
          <p style={{ marginTop: 8 }}>No hay ediciones publicadas.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {event.editions.map((ed) => {
              const regs = ed._count.registrations;
              const remaining = ed.capacity - regs;
              const isRegistered = (ed.registrations?.length ?? 0) > 0;

              return (
                <article key={ed.id} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{ed.name}</h3>

                  <div style={{ marginTop: 8, color: "#444" }}>
                    <div>
                      <strong>Fecha:</strong> {formatDate(ed.startsAt)} — {formatDate(ed.endsAt)}
                    </div>
                    <div>
                      <strong>Modalidad:</strong> {ed.isOnline ? "Online" : "Presencial"}{" "}
                      {ed.location ? `(${ed.location})` : ""}
                    </div>
                    <div>
                      <strong>Cupos:</strong> {regs}/{ed.capacity} (restantes: {remaining})
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    {!session ? (
                      <span style={{ color: "#a60" }}>Iniciá sesión para registrarte.</span>
                    ) : role !== "ATTENDEE" ? (
                      <span style={{ color: "#a60" }}>Solo un asistente puede registrarse.</span>
                    ) : isRegistered ? (
                      <>
                        <span style={{ color: "#0a7", fontWeight: 700 }}>Ya estás registrado ✅</span>
                        <form action={cancelRegistration}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <input type="hidden" name="editionId" value={ed.id} />
                          <button style={btnStyle}>Cancelar registro</button>
                        </form>
                      </>
                    ) : remaining <= 0 ? (
                      <span style={{ color: "crimson", fontWeight: 700 }}>Sin cupos</span>
                    ) : (
                      <form action={registerToEdition}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="editionId" value={ed.id} />
                        <button style={btnStyle}>Registrarme</button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};
