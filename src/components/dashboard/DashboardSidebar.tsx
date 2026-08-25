"use client";

import { Link, localizeHref, usePathname } from "@/i18n/routing";
import {
  Column,
  Dialog,
  Flex,
  Line,
  NavIcon,
  Option,
  Row,
  Tag,
  Text,
  ToggleButton,
  UserMenu,
} from "@/once-ui/components";
import { useEffect, useState } from "react";

export type NavCopy = {
  overview: string;
  semana0: string;
  cohorte: string;
  comingSoon: string;
  inProgress: string;
  /** Which seat the viewer is in — coach or student. */
  roleLabel: string;
  admin: string;
  backToSite: string;
  signOut: string;
  menu: string;
};

type Props = {
  locale: string;
  user: { name: string; email: string };
  nav: NavCopy;
  /** Hides the admin entry for everyone else. Cosmetic only — the route itself
   *  is gated server-side and by RLS, so a hand-typed URL still gets nothing. */
  isAdmin: boolean;
  /** Anyone past the waitlist. The cohort entry stops being a padlock for
   *  them — it is not clickable yet either way, but telling someone who paid
   *  that the thing she paid for is "locked" is a different sentence. */
  isEntitled: boolean;
  onSignOut: () => void;
};

const Wordmark = ({ locale }: { locale: string }) => (
  <Link href={localizeHref(locale, "/")} style={{ textDecoration: "none" }}>
    <Text variant="label-strong-s" onBackground="neutral-strong" style={{ letterSpacing: "0.16em" }}>
      RULO
      <Text as="span" onBackground="brand-weak">
        {" · "}
      </Text>
      <Text as="span" variant="label-default-s" onBackground="neutral-weak">
        AI SHIFT
      </Text>
    </Text>
  </Link>
);

const NavItems = ({
  locale,
  nav,
  isAdmin,
  isEntitled,
  onNavigate,
}: {
  locale: string;
  nav: NavCopy;
  isAdmin: boolean;
  isEntitled: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname() ?? "";
  const inAdmin = pathname.startsWith("/dashboard/admin");

  return (
    <Column fillWidth gap="4">
      <ToggleButton
        fillWidth
        justifyContent="flex-start"
        prefixIcon="home"
        selected={pathname === "/dashboard"}
        href={localizeHref(locale, "/dashboard")}
        onClick={onNavigate}
        label={nav.overview}
      />
      <ToggleButton
        fillWidth
        justifyContent="flex-start"
        prefixIcon="rocket"
        // Every lesson lives at /dashboard/<slug>, so this matches on the
        // prefix — but /dashboard/admin is a sibling, not a lesson, and would
        // otherwise light up Semana 0 while the admin section is open.
        selected={pathname.startsWith("/dashboard/") && !inAdmin}
        href={localizeHref(locale, "/dashboard")}
        onClick={onNavigate}
        label={nav.semana0}
      />
      {/* Dimmed while it is still a promise; plain once it is hers. Not a link
          in either case — no lesson declares `module: cohorte` yet. */}
      <Flex
        fillWidth
        paddingX="8"
        paddingY="8"
        gap="8"
        vertical="center"
        style={{ opacity: isEntitled ? 1 : 0.55 }}
      >
        <Text
          variant="label-default-s"
          onBackground={isEntitled ? "neutral-medium" : "neutral-weak"}
          style={{ paddingLeft: "1.5rem" }}
        >
          {nav.cohorte}
        </Text>
        {isEntitled ? (
          <Tag size="s" variant="brand" label={nav.inProgress} />
        ) : (
          <Tag size="s" variant="neutral" prefixIcon="lock" label={nav.comingSoon} />
        )}
      </Flex>
      {isAdmin && (
        <>
          <Line background="neutral-alpha-weak" marginY="8" />
          <ToggleButton
            fillWidth
            justifyContent="flex-start"
            prefixIcon="team"
            selected={inAdmin}
            href={localizeHref(locale, "/dashboard/admin")}
            onClick={onNavigate}
            label={nav.admin}
          />
        </>
      )}
    </Column>
  );
};

/**
 * Whose seat you are in, said out loud. The coach and his students look at the
 * same shell, and while testing both accounts side by side the only difference
 * on screen used to be whether "Estudiantes" was in the nav — too subtle to
 * catch in a shared-screen moment.
 */
const AccountMenu = ({ locale, user, nav, isAdmin, onSignOut }: Props) => (
  <UserMenu
    name={user.name}
    subline={user.email}
    // User reads the label off tagProps, not off a `tag` prop.
    tagProps={{ label: nav.roleLabel, variant: isAdmin ? "accent" : "brand" }}
    avatarProps={{ value: user.name.charAt(0).toUpperCase() }}
    dropdown={
      <Column padding="4" gap="2" minWidth={10}>
        <Option value="site" label={nav.backToSite} href={localizeHref(locale, "/")} />
        <Option value="signout" label={nav.signOut} onClick={onSignOut} />
      </Column>
    }
  />
);

/** Desktop rail. Hidden below the `s` breakpoint, where the top bar takes over. */
export const DashboardRail = (props: Props) => (
  <Column
    hide="s"
    paddingY="l"
    paddingX="16"
    gap="20"
    background="surface"
    borderRight="neutral-medium"
    style={{ width: "16rem", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}
  >
    <Wordmark locale={props.locale} />
    <Line background="neutral-alpha-weak" />
    <NavItems
      locale={props.locale}
      nav={props.nav}
      isAdmin={props.isAdmin}
      isEntitled={props.isEntitled}
    />
    <Flex flex={1} />
    <Line background="neutral-alpha-weak" />
    <AccountMenu {...props} />
  </Column>
);

/**
 * Mobile bar. Must be stacked above the content, never a flex sibling of it —
 * inside the desktop Row it would sit beside the content and push it off-screen.
 */
export const DashboardTopBar = (props: Props) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <Row
        show="s"
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="12"
        vertical="center"
        horizontal="space-between"
        background="surface"
        borderBottom="neutral-medium"
        style={{ position: "sticky", top: 0, zIndex: 8 }}
      >
        <Flex gap="12" vertical="center">
          <NavIcon
            isActive={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={props.nav.menu}
          />
          <Wordmark locale={props.locale} />
        </Flex>
        <AccountMenu {...props} />
      </Row>
      <Dialog isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={props.nav.menu}>
        <NavItems
          locale={props.locale}
          nav={props.nav}
          isAdmin={props.isAdmin}
          isEntitled={props.isEntitled}
          onNavigate={() => setMenuOpen(false)}
        />
      </Dialog>
    </>
  );
};
