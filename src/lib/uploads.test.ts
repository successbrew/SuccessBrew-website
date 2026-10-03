import { afterEach, expect, it, vi } from "vitest";
import sharp from "sharp";
import { validateUpload } from "./uploads";
afterEach(() => vi.unstubAllEnvs());
it("rejects HTML disguised as an image", async () => {
  await expect(validateUpload(new File(["<script>alert(1)</script>"], "x.png", { type: "image/png" }))).rejects.toThrow();
});
it("rejects SVG", async () => {
  await expect(validateUpload(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" }))).rejects.toThrow();
});
it("re-encodes a genuine image and removes appended content", async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } }).png().toBuffer();
  const result = await validateUpload(new File([new Uint8Array(png), "<script>bad</script>"], "x.png", { type: "image/png" }));
  expect(result.type).toBe("image/webp");
  expect(result.bytes.includes(Buffer.from("<script>"))).toBe(false);
});
it("refuses PDFs when scanning is not configured", async () => {
  vi.stubEnv("DOCUMENT_SCAN_URL", "");
  await expect(validateUpload(new File(["%PDF-1.7\n%%EOF"], "x.pdf", { type: "application/pdf" }))).rejects.toThrow("scanning");
});
