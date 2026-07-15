"use client";

import { routes } from "@/app/resources";
import NotFound from "@/app/[locale]/not-found";
import { usePathname } from "@/i18n/routing";

interface RouteGuardProps {
  children: React.ReactNode;
}

// Routes whose children are also enabled when the parent is (e.g. /blog/my-post).
const DYNAMIC_ROUTES = ["/blog", "/work", "/dashboard"] as const;

const isRouteEnabled = (pathname: string | null): boolean => {
  if (!pathname) return false;

  if (pathname in routes) {
    return routes[pathname as keyof typeof routes];
  }

  return DYNAMIC_ROUTES.some(
    (route) => pathname.startsWith(route) && routes[route as keyof typeof routes],
  );
};

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  // next-intl's usePathname strips the locale prefix, so checks against
  // the `routes` config work for both /work and /es/work.
  // Kept synchronous on purpose: any state here would leave the server render
  // showing a placeholder instead of the page.
  const pathname = usePathname();

  return isRouteEnabled(pathname) ? <>{children}</> : <NotFound />;
};

export { RouteGuard };
