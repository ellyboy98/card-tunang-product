import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isValidSession, SESSION_COOKIE } from "@/server/auth";

export default async function LoginPage() {
  if (await isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
