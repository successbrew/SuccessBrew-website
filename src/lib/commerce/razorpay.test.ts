import { createHmac } from "crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyWebhookSignature } from "./razorpay";

const SECRET = "test-webhook-secret";

function sign(body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyWebhookSignature", () => {
  const original = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = original;
  });

  it("accepts a signature computed with the correct secret", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a signature computed with the wrong secret (a forged webhook)", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature(body, sign(body, "wrong-secret"))).toBe(false);
  });

  it("rejects if the body was tampered with after signing", () => {
    const original = JSON.stringify({ event: "payment.captured", amount: 500000 });
    const signature = sign(original);
    const tampered = JSON.stringify({ event: "payment.captured", amount: 10000000 });
    expect(verifyWebhookSignature(tampered, signature)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature(body, null)).toBe(false);
  });

  it("rejects when the webhook secret isn't configured at all", () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature(body, sign(body))).toBe(false);
  });
});
