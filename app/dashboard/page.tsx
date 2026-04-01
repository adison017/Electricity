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
import { MonthSelectorClient } from "@/components/dashboard/month-selector-client"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { TabsContent } from "@/components/ui/tabs"

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string; view?: string }> }) {
  const params = await searchParams
  const month = params.month ? parseInt(params.month) : undefined
  const year = params.year ? parseInt(params.year) : undefined
  const view = params.view || "monthly"

  const [stats, devices, usages] = await Promise.all([
    getStats(month, year),
    getDevices() as any,
    getUsages() as any,
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">แดชบอร์ด</h2>
          <p className="text-muted-foreground">
            ภาพรวมการใช้ไฟฟ้าและค่าใช้จ่ายของคุณ
          </p>
        </div>
        <MonthSelectorClient />
      </div>

      <DashboardTabs defaultView={view}>
        {/* Monthly View */}
        <TabsContent value="monthly" className="space-y-6">
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
        </TabsContent>

        {/* Total View */}
        <TabsContent value="total" className="space-y-6">
          <StatsCards stats={stats} view="total" />
          
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">สถิติการใช้ไฟฟ้าทั้งหมด</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">ค่าไฟรวมทั้งหมด</p>
                  <p className="text-2xl font-bold">฿{stats?.totalCost.toFixed(2)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">หน่วยไฟฟ้ารวม</p>
                  <p className="text-2xl font-bold">{stats?.totalKwh.toFixed(2)} หน่วย</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">จำนวนครั้งบันทึก</p>
                  <p className="text-2xl font-bold">{stats?.totalLogs} ครั้ง</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">อุปกรณ์ทั้งหมด</p>
                  <p className="text-2xl font-bold">{stats?.deviceCount} ชิ้น</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </DashboardTabs>
    </div>
  )
}
