import { getStats } from "@/app/actions/usages"
import { getDevices } from "@/app/actions/devices"
import { getUsages } from "@/app/actions/usages"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UsageChart } from "@/components/dashboard/usage-chart"
import { DeviceBreakdown } from "@/components/dashboard/device-breakdown"
import { DeviceList } from "@/components/dashboard/device-list"
import { UsageLog } from "@/components/dashboard/usage-log"
import { AddDeviceForm } from "@/components/dashboard/add-device-form"
import { AddUsageForm } from "@/components/dashboard/add-usage-form"

export default async function DashboardPage() {
  const [stats, devices, usages] = await Promise.all([
    getStats(),
    getDevices(),
    getUsages(),
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">แดชบอร์ด</h2>
        <p className="text-muted-foreground">
          ภาพรวมการใช้ไฟฟ้าและค่าใช้จ่ายของคุณ
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UsageChart data={stats?.dailyUsage || []} />
        <DeviceBreakdown data={stats?.deviceBreakdown || []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">อุปกรณ์</h3>
            <AddDeviceForm />
          </div>
          <DeviceList devices={devices} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">บันทึกการใช้งาน</h3>
            <AddUsageForm devices={devices} />
          </div>
          <UsageLog usages={usages} />
        </div>
      </div>
    </div>
  )
}
