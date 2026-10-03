import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ permission: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/auth/dal", () => ({ requirePermission: mocks.permission }));
vi.mock("@/lib/prisma", () => ({ prisma: { communityEvent: { update: mocks.update } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { updateEventPartners } from "./partners-actions";
it("requires community permission before changing event relationships", async () => {
  mocks.permission.mockRejectedValue(new Error("Forbidden"));
  await expect(updateEventPartners("event", new FormData())).rejects.toThrow("Forbidden");
  expect(mocks.permission).toHaveBeenCalledWith("community:manage");
  expect(mocks.update).not.toHaveBeenCalled();
});
