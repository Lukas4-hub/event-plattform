"use server";

import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EditionStatus } from "@prisma/client";

async function requireOrganizer() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ORGANIZER") redirect("/dashboard/attendee");

  return user.id as string;
}

export async function createEvent(formData: FormData) {
  const ownerId = await requireOrganizer();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!title || !description) {
    revalidatePath("/dashboard/organizer");
    return;
  }

  await prisma.event.create({
    data: {
      ownerId,
      title,
      description,
      category: category || null,
      published: false,
    },
  });

  revalidatePath("/dashboard/organizer");
}

export async function togglePublishEvent(formData: FormData) {
  const ownerId = await requireOrganizer();
  const eventId = String(formData.get("eventId") ?? "");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, ownerId: true, published: true },
  });

  if (!event || event.ownerId !== ownerId) {
    revalidatePath("/dashboard/organizer");
    return;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { published: !event.published },
  });

  revalidatePath("/dashboard/organizer");
  revalidatePath("/events"); 
}

export async function createEdition(formData: FormData) {
  const ownerId = await requireOrganizer();

  const eventId = String(formData.get("eventId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const endsAtRaw = String(formData.get("endsAt") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const isOnline = String(formData.get("isOnline") ?? "") === "on";
  const capacity = Number(formData.get("capacity") ?? 0);

  if (!eventId || !name || !startsAtRaw || !endsAtRaw || !Number.isFinite(capacity) || capacity <= 0) {
    revalidatePath("/dashboard/organizer");
    return;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { ownerId: true },
  });

  if (!event || event.ownerId !== ownerId) {
    revalidatePath("/dashboard/organizer");
    return;
  }

  const startsAt = new Date(startsAtRaw);
  const endsAt = new Date(endsAtRaw);
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    revalidatePath("/dashboard/organizer");
    return;
  }

  await prisma.edition.create({
    data: {
      eventId,
      name,
      startsAt,
      endsAt,
      location: location || null,
      isOnline,
      capacity,
      status: EditionStatus.PUBLISHED, 
    },
  });

  revalidatePath("/dashboard/organizer");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}
