import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "admin" | "user";
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      if (user?.email) {
        token.email = user.email;
        token.role = adminEmails.includes(user.email.toLowerCase())
          ? "admin"
          : "user";
      } else if (token.email && typeof token.email === "string") {
        // Refresh role on every JWT cycle so adding/removing admins via env var takes effect on next sign-in
        token.role = adminEmails.includes(token.email.toLowerCase())
          ? "admin"
          : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const id = (token.userId as string | undefined) ?? token.sub;
        if (!id) throw new Error("Invalid session: missing user id");
        session.user.id = id;
        session.user.role = (token.role as "admin" | "user") ?? "user";
      }
      return session;
    },
  },
});
