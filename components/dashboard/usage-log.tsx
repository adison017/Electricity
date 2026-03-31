"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteUsage } from "@/app/actions/usages"
import { Trash2, Clock, Calendar } from "lucide-react"
import { useTransition } from "react"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface Usage {
  id: number
  device_id: number
  device_name: string
  watt: number
  hours: number
  date: string
}

interface UsageLogProps {
  usages: Usage[]
}

export function UsageLog({ usages }: UsageLogProps) {
  if (usages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <Clock className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีบันทึกการใช้งาน</EmptyTitle>
            <EmptyDescription>
              บันทึกการใช้พลังงานของอุปกรณ์เพื่อติดตามค่าไฟฟ้า
            </EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {usages.map((usage) => (
            <UsageItem key={usage.id} usage={usage} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UsageItem({ usage }: { usage: Usage }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("ลบบันทึกการใช้งานนี้?")) {
      startTransition(async () => {
        await deleteUsage(usage.id)
      })
    }
  }

  const formattedDate = new Date(usage.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const kwh = (usage.watt * usage.hours) / 1000

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{usage.device_name}</p>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {usage.watt}W
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {usage.hours}h
          </span>
          <span>{kwh.toFixed(2)} kWh</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
