import { describe, it, expect } from "vitest";
import {
  PRODUCTS,
  OFFER_PRODUCT,
  COMMUNITY_GROWTH_PRODUCT,
  COMMUNITY_FOUNDER_PRODUCT,
  getProductByKey,
} from "./product";

describe("product registry", () => {
  it("every product has a positive integer amount in paise", () => {
    for (const product of Object.values(PRODUCTS)) {
      expect(Number.isInteger(product.amount)).toBe(true);
      expect(product.amount).toBeGreaterThan(0);
    }
  });

  it("no two products share the same key (would silently collide in the registry)", () => {
    const keys = Object.values(PRODUCTS).map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("getProductByKey resolves each known product and rejects unknown keys", () => {
    expect(getProductByKey(OFFER_PRODUCT.key)?.key).toBe(OFFER_PRODUCT.key);
    expect(getProductByKey(COMMUNITY_GROWTH_PRODUCT.key)?.key).toBe(COMMUNITY_GROWTH_PRODUCT.key);
    expect(getProductByKey(COMMUNITY_FOUNDER_PRODUCT.key)?.key).toBe(COMMUNITY_FOUNDER_PRODUCT.key);
    expect(getProductByKey("not-a-real-product-key")).toBeNull();
  });

  it("the Founder tier costs more than the Growth tier (pricing sanity check)", () => {
    expect(COMMUNITY_FOUNDER_PRODUCT.amount).toBeGreaterThan(COMMUNITY_GROWTH_PRODUCT.amount);
  });
});
