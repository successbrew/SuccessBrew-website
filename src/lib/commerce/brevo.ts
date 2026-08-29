/** Thrown when BREVO_API_KEY isn't set yet — callers should catch this and queue
 * the sync as PENDING instead of treating it as a hard failure. */
export class BrevoNotConfiguredError extends Error {
  constructor() {
    super("Brevo API key is not configured.");
    this.name = "BrevoNotConfiguredError";
  }
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

/** Creates or updates a Brevo contact. Throws BrevoNotConfiguredError (no network
 * call) when BREVO_API_KEY is unset — see upsertLead()/queueBrevoSync() for how
 * that's handled without blocking the caller's own transaction. */
export async function upsertBrevoContact(
  email: string,
  attributes: Record<string, unknown>
): Promise<{ id: number | string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new BrevoNotConfiguredError();

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({ email, attributes, updateEnabled: true }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo contact upsert failed (${res.status}): ${body}`);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: number | string };
  return { id: data.id ?? email };
}
