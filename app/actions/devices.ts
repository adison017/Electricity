"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function getDevices() {
  const user = await getCurrentUser()
  if (!user) return []

  // Get user's personal devices with global device info
  const devices = await sql`
    SELECT 
      d.id,
      COALESCE(gd.name, d.name) as name,
      COALESCE(gd.watt, d.watt) as watt,
      d.created_at,
      COALESCE(gd.usage_count, 0) as usage_count,
      CASE WHEN d.user_id = ${user.id} THEN true ELSE false END as is_owner
    FROM devices d
    LEFT JOIN global_devices gd ON d.global_device_id = gd.id
    WHERE d.user_id = ${user.id}
    ORDER BY d.created_at DESC
  `
  return devices
}

// Search for global devices (fuzzy search)
export async function searchGlobalDevices(query: string) {
  const user = await getCurrentUser()
  if (!user) return []

  // Use trigram similarity for fuzzy search
  const devices = await sql`
    SELECT 
      id,
      name,
      watt,
      COALESCE(usage_count, 0) as usage_count
    FROM global_devices
    WHERE 
      LOWER(TRIM(name)) LIKE LOWER(TRIM(${query})) || '%'
      OR name ILIKE ${`%${query}%`}
    ORDER BY 
      usage_count DESC
    LIMIT 20
  `
  
  return devices
}

// Get popular devices (for suggestions)
export async function getPopularDevices() {
  const devices = await sql`
    SELECT 
      id,
      name,
      watt,
      COALESCE(usage_count, 0) as usage_count
    FROM global_devices
    ORDER BY usage_count DESC
    LIMIT 10
  `
  
  return devices
}

export async function addDevice(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  const wattage = parseFloat(formData.get("wattage") as string)

  if (!name || !wattage) {
    return { error: "ชื่อและกำลังไฟจำเป็นต้องกรอก" }
  }

  if (wattage <= 0) {
    return { error: "กำลังไฟต้องมากกว่า 0" }
  }

  const normalizedName = name.toLowerCase().trim()

  // Check if this device already exists using LOWER(TRIM(name)) for backward compatibility
  let globalDeviceId: string | null = null
  const existingGlobal = await sql`
    SELECT id FROM global_devices 
    WHERE LOWER(TRIM(name)) = ${normalizedName} AND watt = ${wattage}
  `

  if (existingGlobal.length > 0) {
    globalDeviceId = existingGlobal[0].id
  } else {
    // Create new global device
    const newGlobal = await sql`
      INSERT INTO global_devices (name, watt, created_by, usage_count)
      VALUES (${name}, ${wattage}, ${user.id}, 0)
      RETURNING id
    `
    globalDeviceId = newGlobal[0].id
  }

  // Create user's personal device linked to global device
  await sql`
    INSERT INTO devices (user_id, name, watt, global_device_id)
    VALUES (${user.id}, ${name}, ${wattage}, ${globalDeviceId})
  `

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteDevice(deviceId: number) {
  const user = await getCurrentUser()
  if (!user) return { error: "Not authenticated" }

  // First delete all usages for this device
  await sql`
    DELETE FROM usages WHERE device_id = ${deviceId}
  `

  // Get the device to find global_device_id
  const device = await sql`
    SELECT global_device_id FROM devices 
    WHERE id = ${deviceId} AND user_id = ${user.id}
  `

  if (device.length === 0) {
    return { error: "ไม่พบอุปกรณ์นี้" }
  }

  const globalDeviceId = device[0].global_device_id

  // Delete user's personal device
  await sql`
    DELETE FROM devices
    WHERE id = ${deviceId} AND user_id = ${user.id}
  `

  revalidatePath("/dashboard")
  return { success: true }
}
