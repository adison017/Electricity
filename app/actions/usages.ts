"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function getUsages() {
  const user = await getCurrentUser()
  if (!user) return []

  const usages = await sql`
    SELECT u.id, u.device_id, u.hours, u.date, d.name as device_name, d.watt
    FROM usages u
    JOIN devices d ON u.device_id = d.id
    WHERE d.user_id = ${user.id}
    ORDER BY u.date DESC, u.created_at DESC
    LIMIT 50
  `
  return usages
}

export async function addUsage(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const deviceId = formData.get("device_id") as string
  const hours = parseFloat(formData.get("hours") as string)
  const usageDate = formData.get("usage_date") as string

  if (!deviceId || !hours || !usageDate) {
    return { error: "All fields are required" }
  }

  if (hours <= 0) {
    return { error: "Hours must be positive" }
  }

  // Get electricity rate from dorm
  const dormData = await sql`
    SELECT d.rate FROM devices dev
    JOIN users u ON dev.user_id = u.id
    JOIN dorms d ON u.dorm_id = d.id
    WHERE dev.id = ${deviceId} AND u.id = ${user.id}
  `

  if (dormData.length === 0) {
    return { error: "Device not found" }
  }

  const rate = parseFloat(dormData[0].rate)

  // Verify device belongs to user and get wattage
  const devices = await sql`
    SELECT 
      COALESCE(gd.watt, d.watt) as watt
    FROM devices d
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    WHERE d.id = ${deviceId} AND d.user_id = ${user.id}
  `

  if (devices.length === 0) {
    return { error: "Device not found" }
  }

  const watt = devices[0].watt
  const kWh = (watt * hours) / 1000
  const cost = kWh * rate

  await sql`
    INSERT INTO usages (device_id, hours, date)
    VALUES (${deviceId}, ${hours}, ${usageDate})
  `

  // Increment usage_count for the global device
  await sql`
    UPDATE global_devices gd
    SET usage_count = usage_count + 1
    FROM devices d
    WHERE d.global_device_id = gd.id AND d.id = ${deviceId}
  `

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteUsage(usageId: number) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  // Verify usage belongs to user's device
  const usages = await sql`
    SELECT u.id FROM usages u
    JOIN devices d ON u.device_id = d.id
    WHERE u.id = ${usageId} AND d.user_id = ${user.id}
  `

  if (usages.length === 0) {
    return { error: "Usage not found" }
  }

  await sql`DELETE FROM usages WHERE id = ${usageId}`

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getStats(month?: number, year?: number) {
  const user = await getCurrentUser()
  if (!user) return null

  // Debug logging
  console.log('getStats called with:', { month, year })

  // Total cost and usage
  const totalStats = await sql`
    SELECT 
      COALESCE(SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate), 0) as total_cost,
      COALESCE(SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000), 0) as total_kwh,
      COUNT(u.id) as total_logs
    FROM usages u
    JOIN devices d ON u.device_id = d.id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
  `

  // Selected month's stats (or current month if not specified)
  const monthFilter = month && year 
    ? sql`AND u.date >= ${`${year}-${String(month).padStart(2, '0')}-01`} 
          AND u.date < (${`${year}-${String(month).padStart(2, '0')}-01`}::date + INTERVAL '1 month')`
    : sql``

  console.log('Month filter:', monthFilter)

  const monthStats = await sql`
    SELECT 
      COALESCE(SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate), 0) as month_cost,
      COALESCE(SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000), 0) as month_kwh
    FROM usages u
    JOIN devices d ON u.device_id = d.id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
    ${monthFilter}
  `

  // Daily usage for chart (last 7 days)
  const dailyUsage = await sql`
    SELECT 
      u.date::text as date,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate) as cost,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000) as kwh
    FROM usages u
    JOIN devices d ON u.device_id = d.id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
    AND u.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY u.date
    ORDER BY u.date
  `

  // Device breakdown
  const deviceBreakdown = await sql`
    SELECT 
      COALESCE(gd.name, d.name) as name,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate) as cost,
      SUM(u.hours) as hours
    FROM devices d
    LEFT JOIN usages u ON d.id = u.device_id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
    GROUP BY d.id, gd.name, d.name
    ORDER BY cost DESC NULLS LAST
    LIMIT 5
  `

  // Top 5 highest cost devices (most power consuming) - ordered by total kWh consumption
  const highestCostDevices = await sql`
    SELECT 
      COALESCE(gd.name, d.name) as name,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate) as cost,
      SUM(u.hours) as total_hours,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000) as total_kwh
    FROM devices d
    LEFT JOIN usages u ON d.id = u.device_id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
    AND u.date IS NOT NULL
    ${monthFilter}
    GROUP BY d.id, gd.name, d.name
    ORDER BY total_kwh DESC NULLS LAST
    LIMIT 10
  `

  // Top 5 lowest cost but high usage devices (energy efficient but used often) - ordered by total usage hours
  const efficientDevices = await sql`
    SELECT 
      COALESCE(gd.name, d.name) as name,
      SUM(u.hours * COALESCE(gd.watt, d.watt) / 1000 * dr.rate) as cost,
      SUM(u.hours) as total_hours,
      COALESCE(gd.watt, d.watt) as watt
    FROM devices d
    LEFT JOIN usages u ON d.id = u.device_id
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    JOIN users usr ON d.user_id = usr.id
    JOIN dorms dr ON usr.dorm_id = dr.id
    WHERE d.user_id = ${user.id}
    AND u.date IS NOT NULL
    ${monthFilter}
    GROUP BY d.id, gd.name, d.name, gd.watt, d.watt
    HAVING SUM(u.hours) > 0
    ORDER BY 
      total_hours DESC,
      cost ASC
    LIMIT 10
  `

  // Device count
  const deviceCount = await sql`
    SELECT COUNT(*) as count FROM devices WHERE user_id = ${user.id}
  `

  return {
    totalCost: parseFloat(totalStats[0].total_cost) || 0,
    totalKwh: parseFloat(totalStats[0].total_kwh) || 0,
    totalLogs: parseInt(totalStats[0].total_logs) || 0,
    monthCost: parseFloat(monthStats[0].month_cost) || 0,
    monthKwh: parseFloat(monthStats[0].month_kwh) || 0,
    selectedMonth: month,
    selectedYear: year,
    highestCostDevices: highestCostDevices.map((d) => ({
      name: d.name,
      cost: parseFloat(d.cost) || 0,
      hours: parseFloat(d.total_hours) || 0,
      kwh: parseFloat(d.total_kwh) || 0,
    })),
    efficientDevices: efficientDevices.map((d) => ({
      name: d.name,
      cost: parseFloat(d.cost) || 0,
      hours: parseFloat(d.total_hours) || 0,
      watt: parseFloat(d.watt) || 0,
    })),
    dailyUsage: dailyUsage.map((d) => ({
      date: d.date,
      cost: parseFloat(d.cost) || 0,
      kwh: parseFloat(d.kwh) || 0,
    })),
    deviceBreakdown: deviceBreakdown.map((d) => ({
      name: d.name,
      cost: parseFloat(d.cost) || 0,
      hours: parseFloat(d.hours) || 0,
    })),
    deviceCount: parseInt(deviceCount[0].count) || 0,
  }
}
