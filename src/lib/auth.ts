import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  callbacks: {
    signIn({ user }) {
      const allowed = process.env.ALLOWED_EMAILS;
      if (!allowed) return true;
      const emails = allowed.split(",").map((e) => e.trim().toLowerCase());
      return emails.includes(user.email?.toLowerCase() ?? "");
    },
  },
});
