"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Column, Row } from "@/once-ui/components";

type ShellProps = {
  locale: string;
  user: { name: string; email: string };
  nav: React.ComponentProps<typeof DashboardSidebar>["nav"];
  children: React.ReactNode;
};

export const DashboardShell = ({ locale, user, nav, children }: ShellProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Row fillWidth minHeight="0" style={{ minHeight: "100vh" }}>
      <DashboardSidebar locale={locale} user={user} nav={nav} onSignOut={handleSignOut} />
      <Column flex={1} minWidth="0">
        <Column
          fillWidth
          maxWidth="m"
          paddingX="l"
          paddingY="xl"
          gap="xl"
          style={{ marginInline: "auto" }}
        >
          {children}
        </Column>
      </Column>
    </Row>
  );
};
