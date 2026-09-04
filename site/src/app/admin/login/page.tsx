import { redirect } from "next/navigation";
import { currentAdmin, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin/docket");
  const { error } = await searchParams;
  const configured = !!process.env.AUTH_GOOGLE_ID;

  return (
    <main className="login">
      <div className="login-card">
        <div className="brand">
          <b>Press Docket</b>
        </div>
        <h1>Studio sign-in</h1>
        <p>Quotes, proforma invoices, rates and clients. Sign in with the studio Google account.</p>
        {error && (
          <p className="login-err" role="alert">
            {error === "AccessDenied"
              ? "That Google account is not on the studio list."
              : "Sign-in did not complete. Try again."}
          </p>
        )}
        {configured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin/docket" });
            }}
          >
            <button className="btn btn-go" type="submit">
              Continue with Google
            </button>
          </form>
        ) : (
          <p className="login-err">
            Google sign-in is not configured yet. Set AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET and ADMIN_EMAILS
            (see site/.env.example).
          </p>
        )}
      </div>
    </main>
  );
}
