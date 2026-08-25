"use client";

import { Link, localizeHref, usePathname } from "@/i18n/routing";
import {
  Column,
  Dialog,
  Flex,
  Line,
  IconButton,
  NavIcon,
  Option,
  Row,
  Tag,
  Text,
  ToggleButton,
  UserMenu,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useEffect, useState } from "react";

export type NavCopy = {
  overview: string;
  semana0: string;
  cohorte: string;
  comingSoon: string;
  inProgress: string;
  /** Which seat the viewer is in — coach or student. */
  roleLabel: string;
  collapse: string;
  expand: string;
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
  // next-intl's Link adds the locale itself, so localizeHref() here produced
  // /es/es — a 404 on the one link that is on every dashboard screen.
  <Link href="/" style={{ textDecoration: "none" }}>
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
  collapsed = false,
  onNavigate,
}: {
  locale: string;
  nav: NavCopy;
  isAdmin: boolean;
  isEntitled: boolean;
  /** Icon-only rail. The labels go, the targets stay the same size. */
  collapsed?: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname() ?? "";
  const inAdmin = pathname.startsWith("/dashboard/admin");

  return (
    <Column fillWidth gap="4">
      <ToggleButton
        fillWidth
        justifyContent={collapsed ? "center" : "flex-start"}
        prefixIcon="home"
        selected={pathname === "/dashboard"}
        href={localizeHref(locale, "/dashboard")}
        onClick={onNavigate}
        label={collapsed ? undefined : nav.overview}
        aria-label={nav.overview}
        title={collapsed ? nav.overview : undefined}
      />
      <ToggleButton
        fillWidth
        justifyContent={collapsed ? "center" : "flex-start"}
        prefixIcon="rocket"
        // Every lesson lives at /dashboard/<slug>, so this matches on the
        // prefix — but /dashboard/admin is a sibling, not a lesson, and would
        // otherwise light up Semana 0 while the admin section is open.
        selected={pathname.startsWith("/dashboard/") && !inAdmin}
        href={localizeHref(locale, "/dashboard")}
        onClick={onNavigate}
        label={collapsed ? undefined : nav.semana0}
        aria-label={nav.semana0}
        title={collapsed ? nav.semana0 : undefined}
      />
      {/* Dimmed while it is still a promise; plain once it is hers. Not a link
          in either case — no lesson declares `module: cohorte` yet. Dropped
          when collapsed: it is a text row with no icon, and four rems of rail
          cannot say anything useful about it. */}
      {!collapsed && (
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
      )}
      {isAdmin && (
        <>
          <Line background="neutral-alpha-weak" marginY="8" />
          <ToggleButton
            fillWidth
            justifyContent={collapsed ? "center" : "flex-start"}
            prefixIcon="team"
            selected={inAdmin}
            href={localizeHref(locale, "/dashboard/admin")}
            onClick={onNavigate}
            label={collapsed ? undefined : nav.admin}
            aria-label={nav.admin}
            title={collapsed ? nav.admin : undefined}
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
const AccountMenu = ({
  locale,
  user,
  nav,
  isAdmin,
  onSignOut,
  compact = false,
}: Props & { compact?: boolean }) => (
  <UserMenu
    // Collapsed, the avatar alone is the account: a name and an email have
    // nowhere to go in four rems, and squeezing them in is what produced the
    // overlap in the first place.
    name={compact ? undefined : user.name}
    subline={compact ? undefined : user.email}
    className={brand.account}
    // User reads the label off tagProps, not off a `tag` prop.
    tagProps={compact ? {} : { label: nav.roleLabel, variant: isAdmin ? "accent" : "brand" }}
    avatarProps={{ value: user.name.charAt(0).toUpperCase() }}
    dropdown={
      <Column padding="4" gap="2" minWidth={10}>
        <Option value="site" label={nav.backToSite} href={localizeHref(locale, "/")} />
        <Option value="signout" label={nav.signOut} onClick={onSignOut} />
      </Column>
    }
  />
);

const COLLAPSE_KEY = "dashboard-rail-collapsed";

/** Desktop rail. Hidden below the `s` breakpoint, where the top bar takes over. */
export const DashboardRail = (props: Props) => {
  // Starts expanded and corrects itself after mount rather than reading
  // localStorage during render: the server has no idea what this user chose,
  // and guessing would hydrate against a rail of a different width.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Private mode, or storage disabled. Expanded is the safe default.
    }
  }, []);

  const toggle = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <Column
      hide="s"
      paddingY="l"
      paddingX={collapsed ? "8" : "16"}
      gap="20"
      background="surface"
      borderRight="neutral-medium"
      className={brand.rail}
      style={{
        width: collapsed ? "4.5rem" : "16rem",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      <Row fillWidth vertical="center" horizontal={collapsed ? "center" : "space-between"} gap="8">
        {!collapsed && <Wordmark locale={props.locale} />}
        <IconButton
          size="s"
          variant="tertiary"
          className={collapsed ? undefined : brand.railToggle}
          icon={collapsed ? "chevronRight" : "chevronLeft"}
          onClick={toggle}
          aria-label={collapsed ? props.nav.expand : props.nav.collapse}
          tooltip={collapsed ? props.nav.expand : props.nav.collapse}
          tooltipPosition="right"
        />
      </Row>
      <Line background="neutral-alpha-weak" />
      <NavItems
        locale={props.locale}
        nav={props.nav}
        isAdmin={props.isAdmin}
        isEntitled={props.isEntitled}
        collapsed={collapsed}
      />
      <Flex flex={1} />
      <Line background="neutral-alpha-weak" />
      <AccountMenu {...props} compact={collapsed} />
    </Column>
  );
};

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
        {/* Avatar only: on a 390px bar the name, the email and the role badge
            share the row with the wordmark and the menu button, and the badge
            was being clipped against the edge. The menu behind the avatar
            still carries everything. */}
        <AccountMenu {...props} compact />
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
