import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { data: tenantData } = await supabase
      .from("user_tenants")
      .select("tenant_id")
      .eq("user_id", session.user.id)
      .single()

    if (tenantData?.tenant_id) {
      redirect(`/dashboard/${tenantData.tenant_id}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Barbearias App</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
