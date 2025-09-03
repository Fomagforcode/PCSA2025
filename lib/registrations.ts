import { supabase } from "@/lib/supabase/client"
import { createClient } from "@/lib/supabase/server"
import { uploadFile } from "./file-upload"

export interface IndividualRegistration {
  or_number?: string
  id: number
  full_name: string
  age: number
  gender: string
  contact_number: string
  email_address: string
  address: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  field_office_id: number
  receipt_url?: string
  field_offices?: {
    id: number
    name: string
    code: string
  }
}

export interface GroupRegistration {
  or_number?: string
  id: number
  agency_name: string
  contact_number: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  field_office_id: number
  excel_file_url?: string
  receipt_url?: string
  participant_count?: number
  field_offices?: {
    id: number
    name: string
    code: string
  }
}

export interface Participant {
  id: number
  full_name: string
  age: number
  gender: string
  source: "individual" | "group"
  or_number?: string | null
  status?: "pending" | "approved" | "rejected"
}

export interface GroupParticipant {
  or_number?: string | null
  status?: "pending" | "approved" | "rejected"
  id: number
  group_registration_id: number
  full_name: string
  age: number
  gender: string
  email_address?: string
  created_at: string
}

export interface RegistrationStats {
  individual: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  group: {
    total: number
    pending: number
    approved: number
    rejected: number
    participants: number
  }
  totals: {
    registrations: number
    participants: number
    pending: number
    approved: number
    rejected: number
  }
}

export interface IndividualRegistrationWithOffice extends IndividualRegistration {
  field_offices: {
    id: number
    name: string
    code: string
  }
}

export interface GroupRegistrationWithOffice extends GroupRegistration {
  field_offices: {
    id: number
    name: string
    code: string
  }
  group_participants?: GroupParticipant[]
}

export interface IndividualRegistrationData {
  fullName: string
  age: number
  gender: string
  contactNumber: string
  emailAddress: string
  address: string
  fieldOfficeCode: string
  receiptFile?: File
}

export interface GroupRegistrationData {
  agencyName: string
  contactNumber: string
  fieldOfficeCode: string
  excelFile?: File
  receiptFile?: File
  participants?: Array<{
    fullName: string
    age: number
    gender: string;
    email: string
  }>
}

// Get field office ID from code - Fixed to handle multiple/no results
async function getFieldOfficeId(code: string): Promise<number | null> {
  try {
    const { data, error } = await supabase.from("field_offices").select("id").eq("code", code).limit(1)

    if (error) {
      console.error("Error getting field office ID:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.error("No field office found with code:", code)
      return null
    }

    return data[0].id
  } catch (error) {
    console.error("Error in getFieldOfficeId:", error)
    return null
  }
}

// Alternative function to get field office ID by ID (for admin dashboard)
async function getFieldOfficeById(id: number): Promise<number | null> {
  try {
    const { data, error } = await supabase.from("field_offices").select("id").eq("id", id).limit(1)

    if (error) {
      console.error("Error getting field office by ID:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.error("No field office found with ID:", id)
      return null
    }

    return data[0].id
  } catch (error) {
    console.error("Error in getFieldOfficeById:", error)
    return null
  }
}

export async function getAllParticipants(fieldOfficeId: number): Promise<Participant[]> {

  try {
    // Fetch individual registrations
    const { data: individuals, error: indErr } = await supabase
      .from("individual_registrations")
      .select("id, full_name, age, gender, status, or_number")
      .eq("field_office_id", fieldOfficeId)
      .limit(10000)

    if (indErr) {
      console.error("Error fetching individual participants", indErr)
    }

    const individualParticipants: Participant[] = (individuals || []).map((i) => ({
      id: i.id,
      full_name: i.full_name,
      age: i.age,
      gender: i.gender,
      source: "individual",
      status: i.status,
      or_number: i.or_number,
    }))

    // Fetch group registrations for this field office to ensure accurate participant filtering
    const { data: groupRegs, error: grpRegErr } = await supabase
      .from("group_registrations")
      .select("id")
      .eq("field_office_id", fieldOfficeId)

    if (grpRegErr) {
      console.error("Error fetching group registrations", grpRegErr)
    }

    let groupParticipants: Participant[] = []

    if (groupRegs && groupRegs.length > 0) {
      const groupRegIds = groupRegs.map((gr) => gr.id)

      // Fetch participants that belong only to the retrieved group registration IDs
      const { data: grpParts, error: grpPartErr } = await supabase
        .from("group_participants")
        .select("id, full_name, age, gender, or_number")
        .in("group_registration_id", groupRegIds)
        .limit(10000)

      if (grpPartErr) {
        console.error("Error fetching group participants", grpPartErr)
      }

      groupParticipants = (grpParts || []).map((g) => ({
        id: g.id,
        full_name: g.full_name,
        age: g.age,
        gender: g.gender,
        source: "group",
        status: "approved", // group participants are considered approved alongside their parent registration
        or_number: g.or_number,
      }))
    }


    return [...individualParticipants, ...groupParticipants]
  } catch (error) {
    console.error("getAllParticipants error", error)
    return []
  }
}

// Fetch all participants across all field offices (used by main admin master list)
export async function getAllParticipantsAll(): Promise<Participant[]> {
  try {
    // Individual registrations (no filter) - use pagination to get all records
    let allIndividuals: any[] = []
    let from = 0
    const batchSize = 1000
    
    while (true) {
      const { data: individuals, error: indErr } = await supabase
        .from("individual_registrations")
        .select("id, full_name, age, gender, status, or_number")
        .range(from, from + batchSize - 1)

      if (indErr) {
        console.error("Error fetching individual participants", indErr)
        break
      }

      if (!individuals || individuals.length === 0) break
      
      allIndividuals = [...allIndividuals, ...individuals]
      
      if (individuals.length < batchSize) break
      from += batchSize
    }

    const individualParticipants: Participant[] = allIndividuals.map((i) => ({
      id: i.id,
      full_name: i.full_name,
      age: i.age,
      gender: i.gender,
      source: "individual",
      status: i.status,
      or_number: i.or_number,
    }))

    // Group participants - use pagination to get all records
    let allGroupParticipants: any[] = []
    from = 0
    
    while (true) {
      const { data: grpParts, error: grpErr } = await supabase
        .from("group_participants")
        .select("id, full_name, age, gender, or_number")
        .range(from, from + batchSize - 1)

      if (grpErr) {
        console.error("Error fetching group participants", grpErr)
        break
      }

      if (!grpParts || grpParts.length === 0) break
      
      allGroupParticipants = [...allGroupParticipants, ...grpParts]
      
      if (grpParts.length < batchSize) break
      from += batchSize
    }

    const groupParticipants: Participant[] = allGroupParticipants.map((g) => ({
      id: g.id,
      full_name: g.full_name,
      age: g.age,
      gender: g.gender,
      source: "group",
      status: "approved",
      or_number: g.or_number,
    }))

    console.log("Individual participants count:", individualParticipants.length)
    console.log("Group participants count:", groupParticipants.length)
    console.log("Total participants being returned:", individualParticipants.length + groupParticipants.length)
    
    return [...individualParticipants, ...groupParticipants]
  } catch (error) {
    console.error("getAllParticipantsAll error", error)
    return []
  }
}


export async function submitIndividualRegistration(data: IndividualRegistrationData) {
  try {
    const fieldOfficeId = await getFieldOfficeId(data.fieldOfficeCode)
    if (!fieldOfficeId) {
      throw new Error("Invalid field office")
    }

    let receiptUrl = null

    // Upload receipt file if provided
    if (data.receiptFile) {
      receiptUrl = await uploadFile(data.receiptFile, "receipts", `individual/${fieldOfficeId}`)
    }

    // Use RPC function for secure registration
    const { error } = await supabase.rpc('register_individual', {
      p_full_name: data.fullName,
      p_age: data.age,
      p_gender: data.gender,
      p_field_office_id: fieldOfficeId,
      p_contact: data.contactNumber,
      p_email: data.emailAddress,
      p_address: data.address,
      p_or_number: null
    })

    if (error) {
      console.error("Registration error:", error)
      throw new Error(`Registration failed: ${error.message}`)
    }

    // If we need to update with receipt URL, do it separately
    if (receiptUrl) {
      const { error: updateError } = await supabase
        .from("individual_registrations")
        .update({ receipt_url: receiptUrl })
        .eq("full_name", data.fullName)
        .eq("field_office_id", fieldOfficeId)
        .order("submitted_at", { ascending: false })
        .limit(1)

      if (updateError) {
        console.warn("Could not update receipt URL:", updateError.message)
      }
    }

    return { success: true, data: { message: "Registration submitted successfully" } }
  } catch (error) {
    console.error("Submit individual registration error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function submitGroupRegistration(data: GroupRegistrationData) {
  try {
    let fieldOfficeId: number | null = null

    // Try to get field office ID by code first
    if (data.fieldOfficeCode) {
      fieldOfficeId = await getFieldOfficeId(data.fieldOfficeCode)
    }

    // If no field office ID found and we have a numeric field office code, try by ID
    if (!fieldOfficeId && data.fieldOfficeCode) {
      const numericId = Number.parseInt(data.fieldOfficeCode, 10)
      if (!isNaN(numericId)) {
        fieldOfficeId = await getFieldOfficeById(numericId)
      }
    }

    // If still no field office ID, default to first available field office
    if (!fieldOfficeId) {
      console.warn("No field office found, using default field office")
      const { data: defaultOffice, error } = await supabase.from("field_offices").select("id").limit(1)

      if (error || !defaultOffice || defaultOffice.length === 0) {
        throw new Error("No field offices available in the system")
      }

      fieldOfficeId = defaultOffice[0].id
    }

    let excelFileUrl = null
    let receiptUrl = null

    // Upload excel file if provided
    if (data.excelFile) {
      excelFileUrl = await uploadFile(data.excelFile, "registrations", `group/${fieldOfficeId}`)
    }

    // Upload receipt file if provided
    if (data.receiptFile) {
      receiptUrl = await uploadFile(data.receiptFile, "receipts", `group/${fieldOfficeId}`)
    }

    // Insert group registration data
    const { data: groupRegistration, error } = await supabase
      .from("group_registrations")
      .insert({
        agency_name: data.agencyName,
        contact_number: data.contactNumber,
        field_office_id: fieldOfficeId,
        excel_file_url: excelFileUrl,
        receipt_url: receiptUrl,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Group registration error:", error)
      throw new Error(`Group registration failed: ${error.message}`)
    }

    // Insert participants if provided
    if (data.participants && data.participants.length > 0) {
      const participantsData = data.participants.map((participant) => ({
        full_name: participant.fullName,
        age: participant.age,
        gender: participant.gender,
        group_registration_id: groupRegistration.id,
         email_address: participant.email
      }))

      const { error: participantsError } = await supabase.from("group_participants").insert(participantsData)

      if (participantsError) {
        console.error("Participant insertion error:", participantsError)
        throw new Error(`Participant insertion failed: ${participantsError.message}`)
      }
    }

    return { success: true, data: groupRegistration }
  } catch (error) {
    console.error("Submit group registration error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getIndividualRegistrations(fieldOfficeId?: number): Promise<IndividualRegistrationWithOffice[]> {
  try {
    let query = supabase
      .from("individual_registrations")
      .select(`
        *,
        field_offices!inner(id, name, code)
      `)
      .order("submitted_at", { ascending: false })

    if (fieldOfficeId) {
      query = query.eq("field_office_id", fieldOfficeId)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching individual registrations:", error)
    return []
  }
}

export async function getGroupRegistrations(fieldOfficeId?: number): Promise<GroupRegistrationWithOffice[]> {
  try {
    let query = supabase
      .from("group_registrations")
      .select(`
        *,
        field_offices(id, name, code)
      `)
      .order("submitted_at", { ascending: false })

    if (fieldOfficeId) {
      query = query.eq("field_office_id", fieldOfficeId)
    }

    const { data, error } = await query

    if (error) throw error

    // Get participant counts for each group
    const groupsWithParticipants = await Promise.all(
      (data || []).map(async (group) => {
        const participants = await getGroupParticipants(group.id)
        return {
          ...group,
          participant_count: participants.length,
          group_participants: participants,
        }
      }),
    )

    return groupsWithParticipants
  } catch (error) {
    console.error("Error fetching group registrations:", error)
    return []
  }
}

export async function getGroupParticipants(groupRegistrationId: number): Promise<GroupParticipant[]> {
  try {
    const { data, error } = await supabase
      .from("group_participants")
      .select("*")
      .eq("group_registration_id", groupRegistrationId)
      .order("full_name")

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching group participants:", error)
    return []
  }
}

export async function getRegistrationStats(fieldOfficeId?: number): Promise<RegistrationStats> {
  const logGroup = `getRegistrationStats (${fieldOfficeId || 'all'})`;
  console.group(logGroup);
  console.log('Fetching stats with fieldOfficeId:', fieldOfficeId);
  
  try {
    // Build queries with field office filtering
    const buildIndividualQuery = () => {
      let query = supabase.from("individual_registrations").select("*", { count: "exact", head: true })
      if (fieldOfficeId) {
        console.log('Filtering individual registrations by field_office_id:', fieldOfficeId);
        query = query.eq("field_office_id", fieldOfficeId)
      }
      return query
    }

    const buildGroupQuery = () => {
      let query = supabase.from("group_registrations").select("*", { count: "exact", head: true })
      if (fieldOfficeId) {
        console.log('Filtering group registrations by field_office_id:', fieldOfficeId);
        query = query.eq("field_office_id", fieldOfficeId)
      }
      return query
    }

    // Get counts for different statuses
    const [
      totalIndividual,
      pendingIndividual,
      approvedIndividual,
      rejectedIndividual,
      totalGroup,
      pendingGroup,
      approvedGroup,
      rejectedGroup,
    ] = await Promise.all([
      buildIndividualQuery(),
      buildIndividualQuery().eq("status", "pending"),
      buildIndividualQuery().eq("status", "approved"),
      buildIndividualQuery().eq("status", "rejected"),
      buildGroupQuery(),
      buildGroupQuery().eq("status", "pending"),
      buildGroupQuery().eq("status", "approved"),
      buildGroupQuery().eq("status", "rejected"),
    ])

    // Get participant count from group registrations
    let participantQuery = supabase.from("group_participants").select("*", { count: "exact", head: true })
    if (fieldOfficeId) {
      // Join with group_registrations to filter by field office
      const { data: groupRegs } = await supabase
        .from("group_registrations")
        .select("id")
        .eq("field_office_id", fieldOfficeId)

      if (groupRegs && groupRegs.length > 0) {
        const groupIds = groupRegs.map((g) => g.id)
        participantQuery = supabase
          .from("group_participants")
          .select("*", { count: "exact", head: true })
          .in("group_registration_id", groupIds)
      } else {
        participantQuery = supabase
          .from("group_participants")
          .select("*", { count: "exact", head: true })
          .eq("group_registration_id", -1) // No results
      }
    }

    const { count: totalParticipants } = await participantQuery

    console.groupEnd();
    return {
      individual: {
        total: totalIndividual.count || 0,
        pending: pendingIndividual.count || 0,
        approved: approvedIndividual.count || 0,
        rejected: rejectedIndividual.count || 0,
      },
      group: {
        total: totalGroup.count || 0,
        pending: pendingGroup.count || 0,
        approved: approvedGroup.count || 0,
        rejected: rejectedGroup.count || 0,
        participants: totalParticipants || 0,
      },
      totals: {
        registrations: (totalIndividual.count || 0) + (totalGroup.count || 0),
        participants: (totalIndividual.count || 0) + (totalParticipants || 0),
        pending: (pendingIndividual.count || 0) + (pendingGroup.count || 0),
        approved: (approvedIndividual.count || 0) + (approvedGroup.count || 0),
        rejected: (rejectedIndividual.count || 0) + (rejectedGroup.count || 0),
      },
    }
  } catch (error) {
    console.error("Error fetching registration stats:", error)
    console.groupEnd();
    return {
      individual: { total: 0, pending: 0, approved: 0, rejected: 0 },
      group: { total: 0, pending: 0, approved: 0, rejected: 0, participants: 0 },
      totals: { registrations: 0, participants: 0, pending: 0, approved: 0, rejected: 0 },
    }
  }
}

function isValidOR(orNum?: string) {
  return !!orNum && /^\d{8}$/.test(orNum)
}

export async function updateRegistrationStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  type: "individual" | "group",
  or_number?: string,
): Promise<boolean> {
  try {
    const table = type === "individual" ? "individual_registrations" : "group_registrations"
    if (status === "approved" && !isValidOR(or_number)) {
      throw new Error("Invalid OR Number. Must be exactly 8 digits.")
    }
    const updatePayload: Record<string, any> = { status }
    if (status === "approved") updatePayload.or_number = or_number

    const { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error
    
    // Check if any rows were actually updated
    if (!data) {
      console.error("No rows updated - RLS policy may be blocking the update")
      throw new Error("Update blocked by database policy")
    }

    // If approving a group registration, propagate OR number to its participants
    if (type === "group" && status === "approved" && or_number) {
      const { error: partErr } = await supabase
        .from("group_participants")
        .update({ or_number })
        .eq("group_registration_id", id)
      if (partErr) throw partErr
    }

    return true
  } catch (error) {
    console.error("Error updating registration status:", error)
    return false
  }
}

export async function deleteRegistration(id: number, type: "individual" | "group"): Promise<boolean> {
  try {
    if (type === "group") {
      // First delete participants
      await supabase.from("group_participants").delete().eq("group_registration_id", id)
    }

    const table = type === "individual" ? "individual_registrations" : "group_registrations"
    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting registration:", error)
    return false
  }
}

export async function getFileUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from("registrations").createSignedUrl(path, 3600) // 1 hour expiry

    if (error) throw error

    return data.signedUrl
  } catch (error) {
    console.error("Error getting file URL:", error)
    return null
  }
}
