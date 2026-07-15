import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { redirect } from "@/i18n/routing";
import { getSessionProfile } from "@/lib/auth/session";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

// This subtree reads cookies, so it can never be prerendered. cookies() would
// force this implicitly; being explicit documents that /dashboard is the only
// dynamic route in a codebase where every other page is SSG.
export const dynamic = "force-dynamic";

interface LayoutParams {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function DashboardLayout({ children, params: { locale } }: LayoutParams) {
  unstable_setRequestLocale(locale);

  // The authoritative gate. Middleware only refreshes the session — the role
  // lives in the DB, which doesn't belong in edge middleware on every request.
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
    return null;
  }

  const t = await getTranslations({ locale, namespace: "dashboard.nav" });
  const email = profile.email ?? "";

  return (
    <DashboardShell
      locale={locale}
      user={{ name: profile.fullName || email.split("@")[0] || "", email }}
      nav={{
        overview: t("overview"),
        semana0: t("semana0"),
        cohorte: t("cohorte"),
        comingSoon: t("comingSoon"),
        backToSite: t("backToSite"),
        signOut: t("signOut"),
        menu: t("menu"),
      }}
    >
      {children}
    </DashboardShell>
  );
}
