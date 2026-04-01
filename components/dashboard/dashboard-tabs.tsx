"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname } from "next/navigation"

interface DashboardTabsProps {
  children: React.ReactNode
  defaultView: string
}

export function DashboardTabs({ children, defaultView }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("view", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs defaultValue={defaultView} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="monthly">📅 รายเดือน</TabsTrigger>
        <TabsTrigger value="total">📊 รวมทั้งหมด (ตั้งแต่เข้าอยู่หอ)</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}
