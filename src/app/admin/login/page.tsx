import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLangSwitch } from "@/components/admin/AdminLangSwitch";
import { LoginForm } from "@/components/admin/LoginForm";
import { isValidSession, SESSION_COOKIE } from "@/server/auth";

export default async function LoginPage() {
  if (await isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/admin");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <LoginForm />
      <AdminLangSwitch />
    </main>
  );
}
