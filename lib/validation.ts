import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(50, "Nombre muy largo").optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72, "Máximo 72 caracteres"),
  role: z.enum(["ATTENDEE", "ORGANIZER"]),
});

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Título mínimo 3 caracteres").max(80, "Título muy largo"),
  description: z.string().trim().min(10, "Descripción mínima 10 caracteres").max(2000, "Descripción muy larga"),
  category: z.string().trim().max(40, "Categoría muy larga").optional().or(z.literal("")),
});

export const createEditionSchema = z.object({
  eventId: z.string().min(1, "Falta eventId"),
  name: z.string().trim().min(3, "Nombre mínimo 3 caracteres").max(80, "Nombre muy largo"),
  startsAt: z.string().min(1, "Falta inicio"),
  endsAt: z.string().min(1, "Falta fin"),
  location: z.string().trim().max(120, "Lugar muy largo").optional().or(z.literal("")),
  isOnline: z.boolean(),
  capacity: z.coerce.number().int("Cupos debe ser entero").min(1, "Cupos mínimo 1").max(100000, "Cupos demasiado grande"),
}).superRefine((data, ctx) => {
  const s = new Date(data.startsAt);
  const e = new Date(data.endsAt);
  if (isNaN(s.getTime())) {
    ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Fecha inicio inválida" });
  }
  if (isNaN(e.getTime())) {
    ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Fecha fin inválida" });
  }
  if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e <= s) {
    ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Fin debe ser posterior al inicio" });
  }
});
