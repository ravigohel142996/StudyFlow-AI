import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";
  const userEmail = user.email;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="flex-1 md:overflow-auto">
        <div className="md:hidden h-14" /> {/* Mobile header offset */}
        {children}
      </main>
    </div>
  );
}
