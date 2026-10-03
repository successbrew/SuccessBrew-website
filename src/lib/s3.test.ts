import { afterEach, expect, it, vi } from "vitest";
import { privateObjectKey, privateBucket } from "./s3";
afterEach(() => vi.unstubAllEnvs());
it("rejects arbitrary URLs instead of returning permanent external links", () => {
  expect(() => privateObjectKey("https://attacker.example/private.pdf")).toThrow();
});
it("accepts private keys but refuses public marketing and traversal keys", () => {
  expect(privateObjectKey("applications/uploads/file.pdf")).toBe("applications/uploads/file.pdf");
  expect(() => privateObjectKey("uploads/logo.png")).toThrow();
  expect(() => privateObjectKey("digests/../secret")).toThrow();
});
it("requires a separate private bucket", () => {
  vi.stubEnv("AWS_S3_PRIVATE_BUCKET_NAME", "");
  expect(() => privateBucket()).toThrow();
});
