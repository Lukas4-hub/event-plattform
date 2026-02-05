"use server";

import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAttendee() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ATTENDEE") redirect("/dashboard/organizer");

  return user.id as string;
}

export async function registerToEdition(formData: FormData) {
  const userId = await requireAttendee();

  const eventId = String(formData.get("eventId") ?? "");
  const editionId = String(formData.get("editionId") ?? "");
  if (!eventId || !editionId) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  // 1) ¿Ya está registrado?
  const existing = await prisma.registration.findUnique({
    where: { editionId_userId: { editionId, userId } },
    select: { id: true },
  });
  if (existing) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  // 2) Traemos capacity y registros actuales
  const edition = await prisma.edition.findUnique({
    where: { id: editionId },
    select: {
      id: true,
      eventId: true,
      capacity: true,
      _count: { select: { registrations: true } },
    },
  });

  if (!edition || edition.eventId !== eventId) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  // 3) Control de cupos
  if (edition._count.registrations >= edition.capacity) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  // 4) Crear registro (si otro se registra al mismo tiempo puede fallar por unique o por cupo en edge cases)
  try {
    await prisma.registration.create({
      data: { editionId, userId },
    });
  } catch {
    // sin throw, solo revalidamos
  }

  revalidatePath(`/events/${eventId}`);
}

export async function cancelRegistration(formData: FormData) {
  const userId = await requireAttendee();

  const eventId = String(formData.get("eventId") ?? "");
  const editionId = String(formData.get("editionId") ?? "");
  if (!eventId || !editionId) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  await prisma.registration.deleteMany({
    where: { editionId, userId },
  });

  revalidatePath(`/events/${eventId}`);
}
