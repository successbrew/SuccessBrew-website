import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
import { cleanTagNames, normalizeTagName, renderPost } from "./blog";

describe("tag names", () => {
  it("tidies spacing and casing but keeps acronyms", () => {
    expect(normalizeTagName("  personal   branding ")).toBe("Personal Branding");
    expect(normalizeTagName("D2C growth")).toBe("D2C Growth");
    expect(normalizeTagName("AI")).toBe("AI");
  });

  it("drops duplicates that only differ by case or spacing, and caps the count", () => {
    const tags = cleanTagNames(["Fundraising", "fundraising", " Fundraising ", "D2C", "a", "b", "c", "d", "e"]);
    expect(tags.map((t) => t.slug)).toEqual(["fundraising", "d2c", "a", "b", "c", "d"]);
  });

  it("ignores names with no letters or numbers", () => {
    expect(cleanTagNames(["!!!", "  "])).toEqual([]);
  });
});

describe("renderPost", () => {
  const doc = (content: unknown[]) => ({ type: "doc", content });
  const p = (text: string, marks?: unknown[]) => ({ type: "paragraph", content: [{ type: "text", text, marks }] });

  it("strips javascript: links and keeps safe ones", () => {
    const { html } = renderPost(doc([
      p("bad", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]),
      p("good", [{ type: "link", attrs: { href: "https://successbrew.in" } }]),
    ]));
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://successbrew.in"');
  });

  it("builds a table of contents from H2s with unique ids", () => {
    const h2 = (text: string) => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
    const { html, toc } = renderPost(doc([h2("Why it matters"), p("x"), h2("Why it matters")]));
    expect(toc).toEqual([{ id: "why-it-matters", text: "Why it matters" }, { id: "why-it-matters-2", text: "Why it matters" }]);
    expect(html).toContain('<h2 id="why-it-matters">');
    expect(html).toContain('<h2 id="why-it-matters-2">');
  });

  it("estimates at least one minute of reading", () => {
    expect(renderPost(doc([p("short")])).readingMinutes).toBe(1);
  });
});
