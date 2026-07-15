import { LoginForm } from "@/components/LoginForm";
import { routing } from "@/i18n/routing";
import { Column } from "@/once-ui/components";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale, namespace: "login" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function Login({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "login" });

  return (
    <Column maxWidth="xs" horizontal="center" paddingY="xl" fillWidth>
      <LoginForm
        copy={{
          title: t("title"),
          description: t("description"),
          placeholder: t("placeholder"),
          button: t("button"),
          invalidEmail: t("invalidEmail"),
          error: t("error"),
          sentTitle: t("sentTitle"),
          sentDescription: t("sentDescription"),
          resend: t("resend"),
          note: t("note"),
        }}
      />
    </Column>
  );
}
