"use client";

import { usePathname } from "@/i18n/routing";
import { Flex } from "@/once-ui/components";

type SiteShellProps = {
  background: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Hides the marketing chrome on /dashboard, which brings its own shell.
 *
 * Header/Footer/Background stay server components and arrive as slots — Footer
 * reads translations on the server and could not call usePathname itself. A
 * (site) route group would be the textbook fix, but moving pages would break
 * both the getPosts path convention and the file tracer globs.
 */
export function SiteShell({ background, header, footer, children }: SiteShellProps) {
  const pathname = usePathname() ?? "";
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return (
      <Flex position="relative" zIndex={0} fillWidth flex={1} minHeight="0">
        {children}
      </Flex>
    );
  }

  return (
    <>
      {background}
      <Flex fillWidth minHeight="16"></Flex>
      {header}
      <Flex position="relative" zIndex={0} fillWidth paddingY="l" paddingX="l" horizontal="center" flex={1}>
        <Flex horizontal="center" fillWidth minHeight="0">
          {children}
        </Flex>
      </Flex>
      {footer}
    </>
  );
}
