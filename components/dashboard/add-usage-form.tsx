"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addUsage } from "@/app/actions/usages"
import { Plus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Device {
  id: number
  name: string
  watt: number
}

interface AddUsageFormProps {
  devices: Device[]
}

export function AddUsageForm({ devices }: AddUsageFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  const [state, action, isPending] = useActionState(
    async (_: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await addUsage(formData)
      if (result.success) {
        setOpen(false)
        setSelectedDevice("")
        return { success: true }
      }
      return result
    },
    null
  )

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={devices.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          บันทึกการใช้
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>บันทึกการใช้ไฟฟ้าของอุปกรณ์</DialogTitle>
          <DialogDescription>
            บันทึกเวลาที่คุณใช้อุปกรณ์
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="usage-device">อุปกรณ์</FieldLabel>
              <Select 
                value={selectedDevice} 
                onValueChange={setSelectedDevice} 
                name="device_id"
                required
              >
                <SelectTrigger id="usage-device">
                  <SelectValue placeholder="เลือกอุปกรณ์" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name} ({device.watt}W)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="usage-hours">จำนวนชั่วโมงที่ใช้</FieldLabel>
              <Input
                id="usage-hours"
                name="hours"
                type="number"
                step="0.25"
                min="0.25"
                placeholder="เช่น 2.5"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="usage-date">วันที่</FieldLabel>
              <Input
                id="usage-date"
                name="usage_date"
                type="date"
                defaultValue={today}
                max={today}
                required
              />
            </Field>
          </FieldGroup>
          {state?.error && (
            <p className="text-sm text-destructive mt-2">{state.error}</p>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending || !selectedDevice}>
              {isPending && <Spinner className="mr-2" />}
              บันทึกการใช้
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
