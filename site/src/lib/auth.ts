import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google sign-in for the studio's private tools.
 * Only the addresses in ADMIN_EMAILS (comma-separated) may sign in.
 * Env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ADMIN_EMAILS.
 */
const allowed = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedEmail(email?: string | null): boolean {
  return !!email && allowed.includes(email.toLowerCase());
}

/** Local-only bypass so the tool can be developed without Google credentials. */
export const DEV_BYPASS = process.env.NODE_ENV !== "production" && process.env.ADMIN_DEV_BYPASS === "1";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    signIn({ profile }) {
      return isAllowedEmail(profile?.email);
    },
    session({ session }) {
      return session;
    },
  },
});

/** Resolve the signed-in admin, honouring the dev bypass. */
export async function currentAdmin(): Promise<{ email: string; name: string; image?: string } | null> {
  if (DEV_BYPASS) return { email: allowed[0] ?? "dev@local", name: "Dev bypass" };
  const session = await auth();
  const email = session?.user?.email;
  if (!isAllowedEmail(email)) return null;
  return { email: email!, name: session?.user?.name ?? email!, image: session?.user?.image ?? undefined };
}
