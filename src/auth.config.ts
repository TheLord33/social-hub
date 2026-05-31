import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null };
  }
}

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
};
