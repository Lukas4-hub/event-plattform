import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cancelMyRegistration } from "./actions";

export default async function AttendeeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ATTENDEE") redirect("/dashboard/organizer");

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      edition: {
        select: {
          id: true,
          name: true,
          startsAt: true,
          endsAt: true,
          location: true,
          isOnline: true,
          capacity: true,
          _count: { select: { registrations: true } },
          event: {
            select: {
              id: true,
              title: true,
              published: true,
              category: true,
            },
          },
        },
      },
    },
  });

  const visible = registrations.filter((r) => r.edition.event.published);

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Mis registros</h1>
      <p style={{ marginTop: 8, color: "#444" }}>
        Acá ves las ediciones a las que estás anotado.
      </p>

      {visible.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <p>No tenés registros todavía.</p>
          <Link href="/events" style={linkStyle}>
            Ver eventos →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {visible.map((r) => {
            const ed = r.edition;
            const regs = ed._count.registrations;
            const remaining = ed.capacity - regs;

            return (
              <article
                key={r.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                      <Link href={`/events/${ed.event.id}`}>{ed.event.title}</Link>
                    </h2>

                    <p style={{ marginTop: 6, color: "#444" }}>
                      <strong>Edición:</strong> {ed.name}
                    </p>

                    <div style={{ marginTop: 8, color: "#444" }}>
                      <div>
                        <strong>Fecha:</strong> {fmt(ed.startsAt)} — {fmt(ed.endsAt)}
                      </div>
                      <div>
                        <strong>Modalidad:</strong> {ed.isOnline ? "Online" : "Presencial"}{" "}
                        {ed.location ? `(${ed.location})` : ""}
                      </div>
                      <div>
                        <strong>Cupos:</strong> {regs}/{ed.capacity} (restantes: {remaining})
                      </div>
                    </div>

                    <p style={{ marginTop: 10, fontSize: 13, color: "#777" }}>
                      Registrado el {new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(r.createdAt)}
                    </p>
                  </div>

                  <form action={cancelMyRegistration}>
                    <input type="hidden" name="registrationId" value={r.id} />
                    <input type="hidden" name="eventId" value={ed.event.id} />
                    <button style={btnStyle}>Cancelar</button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  textDecoration: "none",
  color: "#111",
  fontWeight: 700,
};
