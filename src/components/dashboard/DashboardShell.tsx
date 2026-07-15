"use client";

import {
  DashboardRail,
  DashboardTopBar,
  type NavCopy,
} from "@/components/dashboard/DashboardSidebar";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Column, Row } from "@/once-ui/components";

type ShellProps = {
  locale: string;
  user: { name: string; email: string };
  nav: NavCopy;
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

  const navProps = { locale, user, nav, onSignOut: handleSignOut };

  return (
    // Column at the top level so the mobile bar stacks above the content. As a
    // sibling inside the Row it would sit beside it and push the page sideways.
    <Column fillWidth minHeight="0" style={{ minHeight: "100vh" }}>
      <DashboardTopBar {...navProps} />
      <Row fillWidth flex={1} minHeight="0">
        <DashboardRail {...navProps} />
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
    </Column>
  );
};
