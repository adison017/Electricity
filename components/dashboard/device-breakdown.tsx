"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { PieChartIcon } from "lucide-react"

interface DeviceData {
  name: string
  cost: number
  hours: number
}

interface DeviceBreakdownProps {
  data: DeviceData[]
}

const COLORS = [
  "oklch(0.7 0.18 200)",
  "oklch(0.75 0.15 160)",
  "oklch(0.7 0.15 60)",
  "oklch(0.65 0.2 25)",
  "oklch(0.7 0.15 280)",
]

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  const filteredData = data.filter((d) => d.cost > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          ค่าใช้จ่ายตามอุปกรณ์
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <Empty className="h-[200px]">
            <EmptyDescription>ยังไม่มีข้อมูลอุปกรณ์</EmptyDescription>
          </Empty>
        ) : (
          <div className="h-[200px] flex items-center gap-4">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="cost"
                  >
                    {filteredData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.005 285)",
                      border: "1px solid oklch(0.3 0.005 285)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number) => [`฿${value.toFixed(2)}`, "ค่าใช้จ่าย"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {filteredData.map((device, index) => (
                <div key={device.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate max-w-[100px]">
                    {device.name}
                  </span>
                  <span className="font-medium">${device.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
