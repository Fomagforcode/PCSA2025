import { supabase } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

export interface AdminUser {
  id: string
  username: string
  fieldOffice: string
  fieldOfficeId: number
  fieldOfficeName: string
  role: "field_admin" | "main_admin" | "rd_ard"
  name: string
  isMainAdmin: boolean
}

// Field office mapping
const FIELD_OFFICE_MAP = {
  cotabato: { id: 1, name: "Cotabato City" },
  sulu_station: { id: 21, name: "FO - Sulu/Basilan (Sulu Station)" },
  basilan_station: { id: 22, name: "FO - Sulu/Basilan (Basilan Station)" },
  lanao: { id: 3, name: "Lanao Del Sur" },
  tawi: { id: 4, name: "Tawi-Tawi" },
  maguindanao: { id: 5, name: "Maguindanao" },
  monitor: { id: 99, name: "RD/ARD Monitoring" },
} as const

// Demo credentials with proper field office mapping
interface DemoCred {
  passwordHash: string
  fieldOffice: keyof typeof FIELD_OFFICE_MAP
  role: "field_admin" | "main_admin" | "rd_ard"
  name: string
}

const DEMO_CREDENTIALS: Record<string, DemoCred> = {
  admin_cotabato: {
    passwordHash: bcrypt.hashSync("Cotabato2025!", 10),
    fieldOffice: "cotabato",
    role: "field_admin" as const,
    name: "Cotabato Field Office Admin",
  },
  admin_sulu_station: {
    passwordHash: bcrypt.hashSync("FieldAdmin2025!", 10),
    fieldOffice: "sulu_station",
    role: "field_admin" as const,
    name: "Sulu Station Field Office Admin",
  },
  admin_basilan_station: {
    passwordHash: bcrypt.hashSync("FieldAdmin2025!", 10),
    fieldOffice: "basilan_station",
    role: "field_admin" as const,
    name: "Basilan Station Field Office Admin",
  },
  admin_lanao: {
    passwordHash: bcrypt.hashSync("Lanao2025!", 10),
    fieldOffice: "lanao",
    role: "field_admin" as const,
    name: "Lanao Del Sur Field Office Admin",
  },
  admin_tawi: {
    passwordHash: bcrypt.hashSync("Tawi2025!", 10),
    fieldOffice: "tawi",
    role: "field_admin" as const,
    name: "Tawi-Tawi Field Office Admin",
  },
  main_admin: {
    passwordHash: bcrypt.hashSync("MainAdmin2025!", 10),
    fieldOffice: "maguindanao",
    role: "main_admin" as const,
    name: "Main Administrator",
  },
  rd_ard: {
    passwordHash: bcrypt.hashSync("RDARD2025!", 10),
    fieldOffice: "monitor", // Changed to "monitor"
    role: "rd_ard" as const,
    name: "RD/ARD Monitor",
  },
  monitor: {
    passwordHash: bcrypt.hashSync("Monitor2025!", 10),
    fieldOffice: "monitor",
    role: "rd_ard" as const,
    name: "RD/ARD Monitor",
  }
} as const

export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  try {
    // Check demo credentials first
    const credentials = DEMO_CREDENTIALS[username as keyof typeof DEMO_CREDENTIALS]

    if (credentials && bcrypt.compareSync(password, credentials.passwordHash)) {
      // Get the field office info from credentials
      const fieldOfficeCode = credentials.fieldOffice
      const fieldOfficeInfo = FIELD_OFFICE_MAP[fieldOfficeCode as keyof typeof FIELD_OFFICE_MAP]
      
      if (!fieldOfficeInfo) {
        throw new Error("Invalid field office in credentials")
      }

      const adminUser: AdminUser = {
        id: username,
        username,
        fieldOffice: fieldOfficeCode,
        fieldOfficeId: fieldOfficeInfo.id,
        fieldOfficeName: fieldOfficeInfo.name,
        role: credentials.role,
        name: credentials.name,
        isMainAdmin: credentials.role === "main_admin",
      }

      storeAuth(adminUser)
      return adminUser
    }

    // Try database authentication as fallback (username/password only)
    const { data: admin, error: userError } = await supabase
      .from("admin_users")
      .select("*, field_offices(id, code, name)")
      .eq("username", username)
      .single()

    if (userError || !admin) {
      return null
    }

    // Type assertion to ensure admin has the expected structure
    const typedAdmin = admin as { 
      id: number; 
      username: string; 
      password_hash: string;
      is_main_admin: boolean;
      field_offices: { id: number; code: string; name: string }
    }

    // Verify hashed password
    if (!bcrypt.compareSync(password, typedAdmin.password_hash)) {
      return null
    }

    const fieldOffice = typedAdmin.field_offices
    const adminUser: AdminUser = {
      id: typedAdmin.id.toString(),
      username: typedAdmin.username,
      fieldOffice: fieldOffice.code,
      fieldOfficeId: fieldOffice.id,
      fieldOfficeName: fieldOffice.name,
      role: typedAdmin.is_main_admin ? "main_admin" : "field_admin",
      name: typedAdmin.username.replace("admin_", "").replace("_", " ").toUpperCase() + " Admin",
      isMainAdmin: typedAdmin.is_main_admin,
    }

    storeAuth(adminUser)
    return adminUser
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export function storeAuth(user: AdminUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem(
    "adminAuth",
    JSON.stringify({
      ...user,
      loginTime: new Date().toISOString(),
    }),
  )
}

export function getStoredAuth(): AdminUser | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("adminAuth")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("adminAuth")
}

// Helper functions
export function isMainAdmin(user: AdminUser | null): boolean {
  return user?.isMainAdmin === true
}

export function isFieldAdmin(user: AdminUser | null): boolean {
  return user?.role === "field_admin"
}

export function getFieldOfficeInfo(code: string) {
  return FIELD_OFFICE_MAP[code as keyof typeof FIELD_OFFICE_MAP] || null
}

// Legacy aliases for backward compatibility
export const getStoredAdmin = getStoredAuth
export const storeAdmin = storeAuth
export const clearStoredAdmin = clearAuth
