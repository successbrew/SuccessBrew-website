import { createHmac, timingSafeEqual } from "crypto";

/** Thrown when RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET aren't set yet — callers should
 * degrade gracefully (e.g. show "checkout isn't live yet") rather than 500. */
export class RazorpayNotConfiguredError extends Error {
  constructor() {
    super("Razorpay keys are not configured.");
    this.name = "RazorpayNotConfiguredError";
  }
}

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new RazorpayNotConfiguredError();
  return { keyId, keySecret };
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

/** Creates a Razorpay order via the REST API (Basic Auth) — no SDK dependency needed. */
export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getCredentials();

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${body}`);
  }

  return (await res.json()) as RazorpayOrder;
}

/** Verifies a Razorpay webhook's HMAC-SHA256 signature against RAZORPAY_WEBHOOK_SECRET.
 * Must be called with the *raw* request body — parsing to JSON first breaks the signature. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
