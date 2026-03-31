"use client"

import { User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { Zap, LogOut, User as UserIcon } from "lucide-react"

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold">ระบบติดตามการใช้ไฟฟ้า</h1>
            <p className="text-xs text-muted-foreground">
              หอพัก: {user.dorm_name || "ไม่ระบุ"} 
              <span className="mx-2">•</span>
              อัตราค่าไฟฟ้า: ฿{user.dorm_rate?.toFixed(2) || "0.00"}/หน่วย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">{user.email}</span>
          </div>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">ออกจากระบบ</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
