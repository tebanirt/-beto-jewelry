import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";
import WorkspaceNav from "./WorkspaceNav";

export const dynamic = "force-dynamic";

export default async function LaurenLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <section className="min-h-screen bg-beto-offwhite pb-24" style={{ paddingTop: "1.5rem" }}>
      <div className="max-w-2xl mx-auto px-4">
        <WorkspaceNav name={session.name} isOwner={session.role === "owner"} />
        {children}
      </div>
    </section>
  );
}
