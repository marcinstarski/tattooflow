import type { DefaultSession, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";
import { env, isDevMode } from "@/server/env";
import { Resend } from "resend";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login"
  },
  providers: [
    EmailProvider({
      from: env.EMAIL_FROM || "no-reply@inkflow.pl",
      sendVerificationRequest: async ({ identifier, url }) => {
        if (!resend || !env.EMAIL_FROM) {
          console.log("[DEV MODE] Magic link:", url);
          return;
        }
        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: identifier,
          subject: "Taflo: magic link do logowania",
          html: `<p>Użyj linku, aby zalogować się do Taflo:</p><p><a href="${url}">${url}</a></p>`
        });
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Hasło", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { memberships: true }
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: true }
        });
        const membership = dbUser?.memberships[0];
        token.orgId = membership?.orgId;
        token.role = membership?.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.orgId = token.orgId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.id = token.sub as string | undefined;
      }
      return session;
    }
  },
  debug: isDevMode
};

declare module "next-auth" {
  interface Session {
    user: {
      orgId?: string;
      role?: string;
      id?: string;
    } & DefaultSession["user"];
  }
}
