import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user }) {
      // Check ALLOWED_EMAILS whitelist
      const allowed = process.env.ALLOWED_EMAILS;
      if (allowed) {
        const emails = allowed.split(",").map((e) => e.trim().toLowerCase());
        if (emails.includes(user.email?.toLowerCase() ?? "")) return true;
      }

      // Check if user already exists (returning user)
      if (user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) return true;
      }

      // New user — require invitation code
      const cookieStore = await cookies();
      const code = cookieStore.get("invitation_code")?.value;
      if (!code) return false;

      const invitation = await prisma.invitation.findUnique({ where: { code } });
      if (!invitation) return false;
      // Single-use: maxUses is null or 1 — check usedAt. Multi-use: check useCount < maxUses.
      const maxUses = invitation.maxUses ?? 1;
      if (invitation.useCount >= maxUses) return false;

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Link new user to invitation
      const cookieStore = await cookies();
      const code = cookieStore.get("invitation_code")?.value;
      if (!code || !user.id) return;

      const invitation = await prisma.invitation.findUnique({ where: { code } });
      if (!invitation) return;
      const maxUses = invitation.maxUses ?? 1;
      if (invitation.useCount >= maxUses) return;

      const newCount = invitation.useCount + 1;
      await prisma.$transaction([
        prisma.invitation.update({
          where: { id: invitation.id },
          data: {
            useCount: newCount,
            usedByEmail: user.email,
            usedAt: newCount >= maxUses ? new Date() : undefined,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { invitedById: invitation.inviterId },
        }),
      ]);

      cookieStore.delete("invitation_code");
    },
  },
});
