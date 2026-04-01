import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Zap, Clock, Plug, Activity, Cpu } from "lucide-react"

interface Stats {
  totalCost: number
  totalKwh: number
  monthCost: number
  monthKwh: number
  totalLogs: number
  deviceCount: number
  selectedMonth?: number
  selectedYear?: number
  highestCostDevices?: Array<{
    name: string
    cost: number
    hours: number
    kwh: number
  }>
  efficientDevices?: Array<{
    name: string
    cost: number
    hours: number
    watt: number
  }>
}

interface StatsCardsProps {
  stats: Stats | null
  view?: "monthly" | "total"
}

export function StatsCards({ stats, view = "monthly" }: StatsCardsProps) {
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ]

  const displayMonth = stats?.selectedMonth && stats?.selectedYear
    ? `${monthNames[stats.selectedMonth - 1]} ${stats.selectedYear + 543}`
    : monthNames[new Date().getMonth()] + " " + (new Date().getFullYear() + 543)

  // In total view, show different cards
  if (view === "total") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ค่าไฟรวมทั้งหมด
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats?.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">ตั้งแต่เข้าอยู่หอ</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              หน่วยไฟฟ้ารวม
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalKwh.toFixed(2)} หน่วย</div>
            <p className="text-xs text-muted-foreground">บันทึก {stats?.totalLogs} ครั้ง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              อุปกรณ์
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deviceCount}</div>
            <p className="text-xs text-muted-foreground">อุปกรณ์ที่ลงทะเบียน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              เดือนปัจจุบัน
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats?.monthCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats?.monthKwh.toFixed(2)} หน่วย</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Monthly view with top 5 lists
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Month Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {displayMonth}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">฿{stats?.monthCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{stats?.monthKwh.toFixed(2)} หน่วย</p>
        </CardContent>
      </Card>

      {/* Top 5 Highest Cost Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            กินไฟเยอะสุด (Top 5)
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {stats?.highestCostDevices && stats.highestCostDevices.length > 0 ? (
              stats.highestCostDevices.map((device, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{index + 1}. {device.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ฿{device.cost.toFixed(2)} ({device.hours.toFixed(1)} ชม.)
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Efficient Devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            ใช้งานนาน กินไฟน้อย (Top 5)
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {stats?.efficientDevices && stats.efficientDevices.length > 0 ? (
              stats.efficientDevices.map((device, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{index + 1}. {device.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {device.hours.toFixed(1)} ชม. ({device.watt}W)
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            อุปกรณ์
          </CardTitle>
          <Plug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.deviceCount}</div>
          <p className="text-xs text-muted-foreground">อุปกรณ์ที่ลงทะเบียน</p>
        </CardContent>
      </Card>
    </div>
  )
}
