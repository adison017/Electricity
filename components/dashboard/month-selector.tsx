"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MonthSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Get current month/year from URL or default to current
  const currentMonth = searchParams.get("month") 
    ? parseInt(searchParams.get("month")!) 
    : new Date().getMonth() + 1
  const currentYear = searchParams.get("year") 
    ? parseInt(searchParams.get("year")!) 
    : new Date().getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Generate last 5 months + current month
  const getAvailableMonths = () => {
    const months: { month: number; year: number; label: string }[] = []
    const currentDate = new Date()
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
        "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
        "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ]
      
      months.push({
        month,
        year,
        label: `${monthNames[month - 1]} ${year + 543}` // Thai Buddhist year
      })
    }
    
    return months
  }

  const availableMonths = getAvailableMonths()

  const handlePreviousMonth = () => {
    const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
    const newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
    
    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
    
    // Update URL immediately with new values
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", newMonth.toString())
    params.set("year", newYear.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1
    const newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear
    
    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
    
    // Update URL immediately with new values
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", newMonth.toString())
    params.set("year", newYear.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousMonth}
        disabled={selectedMonth === availableMonths[0].month && selectedYear === availableMonths[0].year}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select
        value={`${selectedYear}-${selectedMonth}`}
        onValueChange={(value) => {
          const [year, month] = value.split("-").map(Number)
          setSelectedMonth(month)
          setSelectedYear(year)
          
          // Update URL immediately
          const params = new URLSearchParams(searchParams.toString())
          params.set("month", month.toString())
          params.set("year", year.toString())
          router.push(`${pathname}?${params.toString()}`)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="เลือกเดือน" />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map(({ month, year, label }) => (
            <SelectItem key={`${year}-${month}`} value={`${year}-${month}`}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextMonth}
        disabled={selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
