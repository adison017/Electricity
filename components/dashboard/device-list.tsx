"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteDevice } from "@/app/actions/devices"
import { Trash2, Cpu } from "lucide-react"
import { useTransition } from "react"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface Device {
  id: number
  name: string
  watt: number
  created_at: string
}

interface DeviceListProps {
  devices: Device[]
}

export function DeviceList({ devices }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <Cpu className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>ยังไม่มีอุปกรณ์</EmptyTitle>
            <EmptyDescription>
              เพิ่มอุปกรณ์ชิ้นแรกเพื่อเริ่มติดตามการใช้ไฟฟ้า
            </EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {devices.map((device) => (
            <DeviceItem key={device.id} device={device} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DeviceItem({ device }: { device: Device }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`ลบ ${device.name}? การกระทำนี้จะลบบันทึกการใช้งานทั้งหมดของอุปกรณ์นี้`)) {
      startTransition(async () => {
        await deleteDevice(device.id)
      })
    }
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
          <Cpu className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{device.name}</p>
          <p className="text-sm text-muted-foreground">{device.watt}W</p>
        </div>
      </div>
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
  )
}
