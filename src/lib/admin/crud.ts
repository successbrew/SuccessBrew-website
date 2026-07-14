import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";

/**
 * `any` here is a deliberate escape hatch: this engine is shared across 10
 * structurally-different Prisma delegates (prisma.service, prisma.blog, ...),
 * each with its own generated input type. Per-type safety comes from each
 * content type's Zod schema, not from this generic adapter's parameter types.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Delegate = {
  create: (args: { data: any }) => Promise<any>;
  update: (args: { where: { id: string }; data: any }) => Promise<any>;
  delete: (args: { where: { id: string } }) => Promise<any>;
};

export type ActionResult = { success: true } | { error: string };

function formatIssues(error: { issues: { message: string }[] }) {
  return error.issues.map((i) => i.message).join(", ");
}

export async function runCreate<T>(
  delegate: Delegate,
  schema: ZodType<T>,
  raw: Record<string, unknown>,
  revalidatePaths: string[]
): Promise<ActionResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: formatIssues(parsed.error) };

  await delegate.create({ data: parsed.data as any });
  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function runUpdate<T>(
  delegate: Delegate,
  schema: ZodType<T>,
  id: string,
  raw: Record<string, unknown>,
  revalidatePaths: string[]
): Promise<ActionResult> {
  if (!id) return { error: "Missing id." };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: formatIssues(parsed.error) };

  await delegate.update({ where: { id }, data: parsed.data as any });
  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function runDelete(
  delegate: Delegate,
  id: string,
  revalidatePaths: string[]
): Promise<ActionResult> {
  if (!id) return { error: "Missing id." };
  await delegate.delete({ where: { id } });
  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function runReorder(
  delegate: Delegate,
  id: string,
  order: number,
  revalidatePaths: string[]
): Promise<ActionResult> {
  if (!id) return { error: "Missing id." };
  await delegate.update({ where: { id }, data: { order } });
  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
