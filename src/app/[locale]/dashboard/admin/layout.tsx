import { getSessionProfile } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * The gate for every /dashboard/admin route. `notFound()` rather than a
 * redirect: a student probing this URL learns only that it does not exist,
 * which is the honest answer for them.
 *
 * This is the second lock, not the only one — the RLS admin policies mean that
 * even if this file were deleted, a non-admin reaching the page would render an
 * empty roster rather than someone else's data.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") notFound();

  return <>{children}</>;
}
