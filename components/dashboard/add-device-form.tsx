"use client"

import { useState, useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addDevice, getPopularDevices } from "@/app/actions/devices"
import { Plus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface PopularDevice {
  id: string
  name: string
  watt: number
  usage_count: number
}

export function AddDeviceForm() {
  const [open, setOpen] = useState(false)
  const [popularDevices, setPopularDevices] = useState<PopularDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [useExisting, setUseExisting] = useState<boolean>(true)
  const [customName, setCustomName] = useState<string>("")
  const [customWattage, setCustomWattage] = useState<string>("")

  // Load popular devices when dialog opens
  useEffect(() => {
    if (open) {
      getPopularDevices().then(setPopularDevices)
    }
  }, [open])

  const [state, action, isPending] = useActionState(
    async (_: { error?: string; success?: boolean } | null, formData: FormData) => {
      // If using existing device, get name and watt from selected device
      if (useExisting && selectedDevice) {
        const device = popularDevices.find(d => d.id === selectedDevice)
        if (device) {
          formData.set("name", device.name)
          formData.set("wattage", device.watt.toString())
        }
      }
      
      const result = await addDevice(formData)
      if (result.success) {
        setOpen(false)
        setSelectedDevice("")
        setCustomName("")
        setCustomWattage("")
        return { success: true }
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มอุปกรณ์
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มอุปกรณ์ใหม่</DialogTitle>
          <DialogDescription>
            เลือกอุปกรณ์ที่มีอยู่แล้ว หรือเพิ่มอุปกรณ์ใหม่เพื่อแชร์ให้ผู้อื่น
          </DialogDescription>
        </DialogHeader>
        
        {/* Toggle between existing and new device */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={useExisting ? "default" : "outline"}
            size="sm"
            onClick={() => setUseExisting(true)}
            className="flex-1"
          >
            เลือกจากที่มี
          </Button>
          <Button
            type="button"
            variant={!useExisting ? "default" : "outline"}
            size="sm"
            onClick={() => setUseExisting(false)}
            className="flex-1"
          >
            เพิ่มใหม่เอง
          </Button>
        </div>

        <form action={action}>
          <FieldGroup>
            {useExisting ? (
              <Field>
                <FieldLabel htmlFor="existing-device">เลือกอุปกรณ์ที่มีอยู่แล้ว</FieldLabel>
                <Select value={selectedDevice} onValueChange={setSelectedDevice} required>
                  <SelectTrigger id="existing-device">
                    <SelectValue placeholder="เลือกอุปกรณ์ยอดนิยม" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularDevices.length === 0 ? (
                      <SelectItem value="none" disabled>
                        ยังไม่มีอุปกรณ์ยอดนิยม
                      </SelectItem>
                    ) : (
                      popularDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.watt}W) - {device.usage_count} ครั้ง
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedDevice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 อุปกรณ์นี้จะถูกเพิ่มในรายการของคุณและแบ่งปันให้ผู้อื่นใช้
                  </p>
                )}
              </Field>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="device-name">ชื่ออุปกรณ์</FieldLabel>
                  <Input
                    id="device-name"
                    name="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="เช่น แอร์, ทีวี, ตู้เย็น"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="device-watt">กำลังไฟ (วัตต์)</FieldLabel>
                  <Input
                    id="device-watt"
                    name="wattage"
                    value={customWattage}
                    onChange={(e) => setCustomWattage(e.target.value)}
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="เช่น 65"
                    required
                  />
                </Field>
                <p className="text-xs text-muted-foreground -mt-3">
                  🌟 อุปกรณ์ใหม่ของคุณจะถูกแชร์ให้ผู้ใช้คนอื่นๆ สามารถใช้ได้ทันที
                </p>
              </>
            )}
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2" />}
              {useExisting ? "เลือกอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
