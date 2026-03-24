import { getInvitationByCode } from "@/lib/actions/invitation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteLanding } from "./invite-landing";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();

  // Already logged in — go home
  if (session?.user) redirect("/");

  const invitation = await getInvitationByCode(code);

  if (!invitation || invitation.used) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Invitación no válida</h1>
        <p className="text-muted-foreground">Este enlace de invitación no existe o ya fue utilizado.</p>
      </div>
    );
  }

  return <InviteLanding invitation={invitation} code={code} />;
}
