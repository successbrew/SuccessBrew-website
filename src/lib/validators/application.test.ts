import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
import { professionalInfoSchema } from "./application";

const base = { companyName: "Acme", currentRole: "Founder", yearsExperience: 3, industry: "SaaS" };

describe("professional info links", () => {
  it("accepts links pasted without https:// and ignores cleared optional fields", () => {
    const parsed = professionalInfoSchema.parse({
      ...base,
      companyWebsite: "",
      socials: { linkedin: " linkedin.com/in/someone ", instagram: "", website: "www.acme.com", articles: ["medium.com/@a/post"] },
    });
    expect(parsed.companyWebsite).toBeUndefined();
    expect(parsed.socials.linkedin).toBe("https://linkedin.com/in/someone");
    expect(parsed.socials.instagram).toBeUndefined();
    expect(parsed.socials.website).toBe("https://www.acme.com");
    expect(parsed.socials.articles).toEqual(["https://medium.com/@a/post"]);
  });

  it("names the field in the error and rejects non-web links", () => {
    const result = professionalInfoSchema.safeParse({
      ...base,
      socials: { linkedin: "linkedin.com/in/someone", youtube: "javascript://alert(1)", twitter: "not a link" },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toEqual(["Enter a valid Twitter / X link", "Enter a valid YouTube link"]);
  });

  it("still requires LinkedIn", () => {
    const result = professionalInfoSchema.safeParse({ ...base, socials: { linkedin: "  " } });
    expect(result.error?.issues[0]?.message).toBe("Enter a valid LinkedIn link");
  });
});
