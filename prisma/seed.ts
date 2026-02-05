import { PrismaClient, Role, EditionStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.registration.deleteMany();
  await prisma.edition.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const organizerPass = await bcrypt.hash("organizer123", 10);
  const attendeePass = await bcrypt.hash("attendee123", 10);

  const organizer = await prisma.user.create({
    data: {
      name: "Organizador Demo",
      email: "org@demo.com",
      passwordHash: organizerPass,
      role: Role.ORGANIZER,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      name: "Asistente Demo",
      email: "att@demo.com",
      passwordHash: attendeePass,
      role: Role.ATTENDEE,
    },
  });

  const event = await prisma.event.create({
    data: {
      ownerId: organizer.id,
      title: "Conferencia Full Stack",
      description: "Evento demo para portfolio. Next.js + Prisma + Postgres.",
      category: "Tech",
      published: true,
      editions: {
        create: [
          {
            name: "Edición Marzo 2026",
            startsAt: new Date("2026-03-20T14:00:00.000Z"),
            endsAt: new Date("2026-03-20T18:00:00.000Z"),
            location: "Montevideo",
            isOnline: false,
            capacity: 50,
            status: EditionStatus.PUBLISHED,
          },
          {
            name: "Edición Online Abril 2026",
            startsAt: new Date("2026-04-10T20:00:00.000Z"),
            endsAt: new Date("2026-04-10T22:00:00.000Z"),
            location: "Zoom",
            isOnline: true,
            capacity: 200,
            status: EditionStatus.PUBLISHED,
          },
        ],
      },
    },
    include: { editions: true },
  });

  await prisma.registration.create({
    data: {
      userId: attendee.id,
      editionId: event.editions[0].id,
    },
  });

  console.log("Seed listo ✅");
  console.log("Organizer login: org@demo.com / organizer123");
  console.log("Attendee login:  att@demo.com / attendee123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
