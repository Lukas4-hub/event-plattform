import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "lib/prisma";
import { Role } from "@prisma/client";
import { registerSchema } from "lib/validation";
import { fieldErrors } from "lib/zodErrors";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod parse
    const parsed = registerSchema.parse({
      name: body?.name,
      email: body?.email,
      password: body?.password,
      role: body?.role,
    });

    const email = parsed.email;
    const role = parsed.role === "ORGANIZER" ? Role.ORGANIZER : Role.ATTENDEE;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, errors: { email: "Ese email ya está registrado" } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    await prisma.user.create({
      data: {
        name: parsed.name && parsed.name.trim() !== "" ? parsed.name.trim() : null,
        email,
        passwordHash,
        role,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    // Errores de Zod -> 400 con errors por campo
    const errors = fieldErrors(err);
    if (errors._form || Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, errors: { _form: "Error al registrar" } }, { status: 500 });
  }
}
