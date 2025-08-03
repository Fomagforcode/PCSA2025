import * as XLSX from "xlsx"

export interface ParticipantData {
  fullName: string
  age: number
  gender: string
  email: string
}

export interface GroupRegistrationTemplate {
  organizationName: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  participants: Array<{
    fullName: string
    age: number
    gender: string
    email: string
  }>
}

// Helper function to safely convert Excel cell values to strings
function safeToString(value: any): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value.toString()
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

// Helper function to safely convert Excel cell values to numbers
function safeToNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export function generateExcelTemplate(fieldOfficeName: string): ArrayBuffer {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Create organization info sheet
  const orgData = [
    ["FUNRUN REGISTRATION - GROUP TEMPLATE"],
    [""],
    ["Field Office:", fieldOfficeName],
    [""],
    ["ORGANIZATION INFORMATION"],
    ["Organization Name:", ""],
    ["Contact Person:", ""],
    ["Contact Number:", ""],
    ["Contact Email:", ""],
    [""],
    ["INSTRUCTIONS:"],
    ["1. Fill in the organization information above"],
    ['2. Go to the "Participants" sheet to add participant details'],
    ["3. Save the file and upload it back to the system"],
    ["4. Make sure all required fields are filled"],
  ]

  const orgSheet = XLSX.utils.aoa_to_sheet(orgData)

  // Set column widths
  orgSheet["!cols"] = [{ width: 20 }, { width: 30 }]

  // Create participants sheet
  const participantHeaders = [
    ["PARTICIPANT LIST"],
    [""],
    ["Full Name", "Age", "Gender", "Email Address"],
    ["John Doe", 25, "Male", "john@example.com"],
    ["Jane Smith", 30, "Female", "jane@example.com"],
    [""],
    [""],
    [""],
    [""],
    [""],
  ]

  const participantSheet = XLSX.utils.aoa_to_sheet(participantHeaders)

  // Set column widths for participants sheet
  participantSheet["!cols"] = [{ width: 25 }, { width: 10 }, { width: 15 }, { width: 30 }]

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(wb, orgSheet, "Organization Info")
  XLSX.utils.book_append_sheet(wb, participantSheet, "Participants")

  // Generate buffer
  return XLSX.write(wb, { bookType: "xlsx", type: "array" })
}

export function parseExcelTemplate(file: File): Promise<GroupRegistrationTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Parse organization info
        const orgSheet = workbook.Sheets["Organization Info"]
        if (!orgSheet) {
          throw new Error("Organization Info sheet not found")
        }

        const orgData = XLSX.utils.sheet_to_json(orgSheet, { header: 1 }) as any[][]

        let organizationName = ""
        let contactPerson = ""
        let contactNumber = ""
        let contactEmail = ""

        // Extract organization information
        for (const row of orgData) {
          if (row[0] && row[1]) {
            const key = safeToString(row[0]).toLowerCase()
            const value = safeToString(row[1])

            if (key.includes("organization name")) {
              organizationName = value
            } else if (key.includes("contact person")) {
              contactPerson = value
            } else if (key.includes("contact number")) {
              contactNumber = value
            } else if (key.includes("contact email")) {
              contactEmail = value
            }
          }
        }

        // Parse participants
        const participantSheet = workbook.Sheets["Participants"]
        if (!participantSheet) {
          throw new Error("Participants sheet not found")
        }

        const participantData = XLSX.utils.sheet_to_json(participantSheet, { header: 1 }) as any[][]
        const participants: ParticipantData[] = []
        const invalidEmails: string[] = []

        // Find the header row (should contain "Full Name", "Age", "Gender", "Email")
        let headerRowIndex = -1
        for (let i = 0; i < participantData.length; i++) {
          const row = participantData[i]
          if (row && row.length >= 4) {
            const col1 = safeToString(row[0]).toLowerCase()
            const col2 = safeToString(row[1]).toLowerCase()
            const col3 = safeToString(row[2]).toLowerCase()
            const col4 = safeToString(row[3]).toLowerCase()

            if (col1.includes("full name") && col2.includes("age") && col3.includes("gender") && col4.includes("email")) {
              headerRowIndex = i
              break
            }
          }
        }

        if (headerRowIndex === -1) {
          throw new Error(
            "Participant header row not found. Please ensure the Participants sheet has columns: Full Name, Age, Gender, Email Address",
          )
        }

        // Parse participant rows (skip header and example rows)
        // Reset invalidEmails for each parse
        invalidEmails.length = 0;

        for (let i = headerRowIndex + 1; i < participantData.length; i++) {
          const row = participantData[i]
          if (row && row.length >= 4) {
            const fullName = safeToString(row[0])
            const age = safeToNumber(row[1])
            const gender = safeToString(row[2])
            const email = safeToString(row[3])

            // Skip empty rows and example data
            if (fullName && fullName !== "John Doe" && fullName !== "Jane Smith" && age > 0 && gender && email) {
              // Validate gender
              const normalizedGender = gender.toLowerCase()
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(email)) {
                invalidEmails.push(`${fullName} (${email})`)
                continue
              }

              if (normalizedGender === "male" || normalizedGender === "m") {
                participants.push({ fullName, age, gender: "Male", email })
              } else if (normalizedGender === "female" || normalizedGender === "f") {
                participants.push({ fullName, age, gender: "Female", email })
              } else {
                console.warn(`Invalid gender "${gender}" for participant "${fullName}". Skipping.`)
              }
            }
          }
        }

        // Validation
        if (!organizationName) {
          throw new Error("Organization name is required")
        }
        if (!contactNumber) {
          throw new Error("Contact number is required")
        }
        if (invalidEmails.length > 0) {
           throw new Error(`Invalid email addresses found: ${invalidEmails.join(", ")}`)
         }

        if (participants.length === 0) {
          throw new Error("At least one participant is required")
        }

        resolve({
          organizationName,
          contactPerson,
          contactNumber,
          contactEmail,
          participants,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Direct download URL (OneDrive) for the master group-registration template
const TEMPLATE_DOWNLOAD_URL = "https://1drv.ms/x/c/7bf8a54d69800819/EWTLN1pvUu9AutSNL_pK0xkBhClEeVPdkwSn875Ii6_aEw?e=rVy4Zs"

export async function downloadExcelTemplate(fieldOfficeName: string): Promise<boolean> {
  try {
    // If the link is a trusted direct-download URL we can simply trigger the browser download.
    // For OneDrive links, appending "&download=1" forces direct download.
    const directUrl = TEMPLATE_DOWNLOAD_URL.includes("download=1")
      ? TEMPLATE_DOWNLOAD_URL
      : `${TEMPLATE_DOWNLOAD_URL}${TEMPLATE_DOWNLOAD_URL.includes("?") ? "&" : "?"}download=1`

    const link = document.createElement("a")
    link.href = directUrl
    link.target = "_blank"
    link.rel = "noopener"
    link.download = `Funrun_2025_Group_Registration_Template_${fieldOfficeName.replace(/\s+/g, "_")}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error("Error downloading Excel template:", error)
    return false
  }
}
