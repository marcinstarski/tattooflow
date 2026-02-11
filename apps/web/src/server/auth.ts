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
        const html = `
          <div style="background:#0b0b12;padding:32px;font-family:Arial,sans-serif;color:#f3f4f6">
            <div style="max-width:520px;margin:0 auto;background:#111827;border-radius:16px;padding:24px;border:1px solid #1f2937">
              <div style="font-size:20px;font-weight:700;letter-spacing:0.2px;margin-bottom:12px">TaFlo CRM</div>
              <div style="font-size:14px;color:#d1d5db;margin-bottom:16px">
                Kliknij przycisk, aby zalogować się i dokończyć onboarding.
              </div>
              <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#f9fafb;text-decoration:none;font-size:14px">
                Przejdź do TaFlo
              </a>
              <div style="font-size:12px;color:#9ca3af;margin-top:16px">
                Jeśli przycisk nie działa, skopiuj link: ${url}
              </div>
            </div>
          </div>
        `;
        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: identifier,
          subject: "TaFlo: link do onboardingu",
          html
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
