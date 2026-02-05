import { ZodError } from "zod";

export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ZodError)) return { _form: "Error inesperado" };

  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
