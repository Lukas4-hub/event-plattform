"use server";

import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAttendee() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ATTENDEE") redirect("/dashboard/organizer");

  return user.id as string;
}

export async function cancelMyRegistration(formData: FormData) {
  const userId = await requireAttendee();
  const registrationId = String(formData.get("registrationId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");

  if (!registrationId) {
    revalidatePath("/dashboard/attendee");
    return;
  }

  await prisma.registration.deleteMany({
    where: { id: registrationId, userId },
  });

  revalidatePath("/dashboard/attendee");
  if (eventId) revalidatePath(`/events/${eventId}`);
}
