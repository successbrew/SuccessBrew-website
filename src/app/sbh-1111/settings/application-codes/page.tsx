import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { formatApplicationCode } from "@/lib/services/applications/code-generator";
import { ResetApplicationCodeSequenceDialog } from "@/components/admin/settings/ResetApplicationCodeSequenceDialog";
import { resetApplicationCodeSequence } from "./actions";

export const dynamic = "force-dynamic";

export default async function ApplicationCodesPage() {
  await requireSuperAdmin();

  const sequence = await prisma.applicationCodeSequence.findUnique({ where: { id: "singleton" } });
  const lastNumber = sequence?.lastNumber ?? 0;
  const currentYear = new Date().getFullYear();
  const lastIssuedCode = lastNumber > 0 ? formatApplicationCode(sequence?.lastYear ?? currentYear, lastNumber) : null;
  const nextCode = formatApplicationCode(currentYear, lastNumber + 1);
  const nextCodeAfterReset = formatApplicationCode(currentYear, 1);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Application Codes</h1>
      <p className="mb-6 max-w-xl text-muted-foreground">
        Every submitted application gets a code like {nextCodeAfterReset}. The number keeps counting up across year
        boundaries — 2027 continues where 2026 left off. It only goes back to 001 when you reset it below.
      </p>

      <div className="max-w-md rounded-lg border border-border p-6">
        <p className="text-xs font-medium uppercase text-muted-foreground">Last code issued</p>
        <p className="mt-1 text-2xl font-semibold">{lastIssuedCode ?? "None yet"}</p>
        <p className="mt-4 text-xs font-medium uppercase text-muted-foreground">Next code (without a reset)</p>
        <p className="mt-1 text-lg font-medium text-muted-foreground">{nextCode}</p>
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium">Reset numbering</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Restarts the counter so the next application submitted gets {nextCodeAfterReset}. Already-issued codes
          aren&rsquo;t changed, so resetting mid-year can produce numbers that look out of order — only do this
          deliberately.
        </p>
        <div className="mt-4">
          <ResetApplicationCodeSequenceDialog action={resetApplicationCodeSequence} nextCodePreview={nextCodeAfterReset} />
        </div>
      </div>
    </div>
  );
}
