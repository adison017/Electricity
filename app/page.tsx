import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import { Zap } from "lucide-react"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">ระบบติดตามการใช้ไฟฟ้า</h1>
          <p className="text-muted-foreground mt-2">
            ติดตามและจัดการการใช้ไฟฟ้าในหอพักของคุณ
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
