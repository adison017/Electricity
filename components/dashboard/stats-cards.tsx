import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Zap, Activity, Cpu } from "lucide-react"

interface Stats {
  totalCost: number
  totalKwh: number
  monthCost: number
  monthKwh: number
  totalLogs: number
  deviceCount: number
}

interface StatsCardsProps {
  stats: Stats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "เดือนนี้",
      value: `฿${stats?.monthCost.toFixed(2) || "0.00"}`,
      description: `${stats?.monthKwh.toFixed(2) || "0"} หน่วย`,
      icon: DollarSign,
    },
    {
      title: "ค่าใช้จ่ายรวม",
      value: `฿${stats?.totalCost.toFixed(2) || "0.00"}`,
      description: "ทั้งหมด",
      icon: Activity,
    },
    {
      title: "การใช้ไฟฟ้ารวม",
      value: `${stats?.totalKwh.toFixed(2) || "0"} หน่วย`,
      description: `บันทึก ${stats?.totalLogs || 0} ครั้ง`,
      icon: Zap,
    },
    {
      title: "อุปกรณ์",
      value: stats?.deviceCount?.toString() || "0",
      description: "อุปกรณ์ที่ลงทะเบียน",
      icon: Cpu,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
