"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BarChart3 } from "lucide-react"

interface UsageData {
  date: string
  cost: number
  kwh: number
}

interface UsageChartProps {
  data: UsageData[]
}

export function UsageChart({ data }: UsageChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          การใช้ไฟฟ้ารายวัน (7 วันที่ผ่านมา)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <Empty className="h-[200px]">
            <EmptyDescription>ยังไม่มีข้อมูลการใช้งาน</EmptyDescription>
          </Empty>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.7 0.18 200)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.7 0.18 200)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="oklch(0.65 0 0)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.65 0 0)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} หน่วย`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.18 0.005 285)",
                    border: "1px solid oklch(0.3 0.005 285)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(2)} หน่วย`,
                    "การใช้",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="kwh"
                  stroke="oklch(0.7 0.18 200)"
                  fillOpacity={1}
                  fill="url(#colorKwh)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
