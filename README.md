# Event Platform (Full Stack)

Plataforma para publicar eventos, crear ediciones y registrar asistentes.

## Características
- Auth (Credentials) + roles: ORGANIZER / ATTENDEE
- Organizador: crear eventos, publicar/despublicar, crear ediciones
- Asistente: registrarse/cancelar, ver “Mis registros”
- Control de cupos + evita doble registro

## Tech
Next.js (App Router), NextAuth, Prisma, PostgreSQL, Tailwind/CSS

## Usuarios demo
- Organizer: org@demo.com / organizer123
- Attendee:  att@demo.com / attendee123

## Correrlo localmente
1) DB:
   - `docker compose up -d`
2) App:
   - `npm install`
   - `npx prisma migrate dev`
   - `npx prisma db seed`
   - `npm run dev`
