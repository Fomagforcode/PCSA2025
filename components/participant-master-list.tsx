"use client"

import { useEffect, useState, useCallback } from "react"
import { getAllParticipants, getAllParticipantsAll, type Participant } from "@/lib/registrations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"

interface ParticipantMasterListProps {
  fieldOfficeId?: number
}

function formatName(name: string) {
  // Remove any leading numbers, periods, or whitespace then trim
  const cleaned = name.replace(/^[\d\.\s]+/, "").trim()
  if (!cleaned) return ""

  // Check if name is in "Surname, First Middle" format
  if (cleaned.includes(',')) {
    const [surname, firstMiddle] = cleaned.split(',').map(part => part.trim())
    if (surname && firstMiddle) {
      // Convert "Doe, john A." to "JOHN A. DOE" (all caps)
      const properFirstMiddle = firstMiddle.split(' ')
        .map(part => {
          // Convert to uppercase
          const formatted = part.toUpperCase()
          // Add dot to single letters (middle initials) that don't have one
          if (formatted.length === 1 || (formatted.length === 2 && !formatted.endsWith('.'))) {
            return formatted.length === 1 ? formatted + '.' : formatted
          }
          return formatted
        })
        .join(' ')
      return `${properFirstMiddle} ${surname.toUpperCase()}`
    }
  }

  // Split into parts and move surname (last part) to the front
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return cleaned.toUpperCase()
  }
  const surname = parts.pop() as string // pop always returns a string here since length > 1
  const rearranged = `${surname} ${parts.join(" ")}`
  return rearranged.toUpperCase()
}

function extractSurname(name: string) {
  const cleaned = name.replace(/^[\d\.\s]+/, "").trim()
  if (!cleaned) return ""

  // Check if name is in "Surname, First Middle" format
  if (cleaned.includes(',')) {
    const [surname] = cleaned.split(',').map(part => part.trim())
    return surname.toUpperCase()
  }

  // For names like "First Middle Surname", extract the first word as surname
  // This matches the formatName logic that moves surname to front
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return cleaned.toUpperCase()
  }
  
  // Take the last part as surname (this is what formatName moves to front)
  return parts[parts.length - 1].toUpperCase()
}

export function ParticipantMasterList({ fieldOfficeId }: ParticipantMasterListProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "group">("all")
  const [nameSort, setNameSort] = useState<"asc" | "desc">("asc")

  // Export to Excel using template
  const handleExportExcel = async () => {
    if (sorted.length === 0) {
      alert("No participants to export")
      return
    }

    try {
      // Attempt to fetch the provided template (should be placed under /public)
      let wb: XLSX.WorkBook
      try {
        const res = await fetch("/Export Excel Template/Masterlist of Participants.xlsx")
        const buf = await res.arrayBuffer()
        wb = XLSX.read(buf, { type: "array" })
      } catch {
        // Fallback: create new workbook if template not found
        wb = XLSX.utils.book_new()
        const headers = [["ID", "Name", "Age", "Gender", "Source", "Agency", "OR #", "Remarks"]]
        const ws = XLSX.utils.aoa_to_sheet(headers)
        XLSX.utils.book_append_sheet(wb, ws, "Master List")
      }

      // Use first sheet
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]

      // Find where to start adding data (look for existing data or start after row 1)
      let startRow = 2
      if (ws["!ref"]) {
        const range = XLSX.utils.decode_range(ws["!ref"] as string)
        // Check if there's existing data beyond headers
        let lastDataRow = 1
        for (let row = 2; row <= range.e.r; row++) {
          let hasData = false
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            if (ws[cellAddress] && ws[cellAddress].v) {
              hasData = true
              break
            }
          }
          if (hasData) {
            lastDataRow = row
          }
        }
        startRow = lastDataRow + 1
      }

      // Add participant rows (preserve template formatting)
      const rows = sorted.map((p, idx) => [idx + 1, formatName(p.full_name), p.age, p.gender, p.source, p.agency_name || "", p.or_number || "", p.status || ""])
      XLSX.utils.sheet_add_aoa(ws, rows, { origin: `A${startRow}` })

      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([out], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Master_List_${Date.now()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting Excel", error)
      alert("Failed to export Excel file")
    }
  }

  const fetchParticipants = useCallback(async () => {
    try {
      let data: Participant[] = []
      if (fieldOfficeId !== undefined) {
        console.log("Fetching participants for field office:", fieldOfficeId)
        data = await getAllParticipants(fieldOfficeId)
      } else {
        console.log("Fetching all participants across all field offices")
        // @ts-ignore - function will be added in registrations.ts
        data = await getAllParticipantsAll()
      }
      console.log("Fetched participant count:", data.length)
      setParticipants(data)
    } catch (error) {
      console.error("Error fetching participants", error)
    } finally {
      setLoading(false)
    }
  }, [fieldOfficeId])

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  const filtered = participants.filter((p) => {
    const matchesSearch = p.full_name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || p.source === typeFilter
    return matchesSearch && matchesType
  })

  const sorted = [...filtered].sort((a, b) => {
    const surnameA = extractSurname(a.full_name)
    const surnameB = extractSurname(b.full_name)
    return nameSort === "asc"
      ? surnameA.localeCompare(surnameB)
      : surnameB.localeCompare(surnameA)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Participant List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-input h-10 rounded px-2 text-sm bg-transparent"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>
          <div>
            <select
              value={nameSort}
              onChange={(e) => setNameSort(e.target.value as any)}
              className="border border-input h-10 rounded px-2 text-sm bg-transparent"
            >
              <option value="asc">Surname A → Z</option>
              <option value="desc">Surname Z → A</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleExportExcel}
              className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-10 rounded px-4 text-sm"
            >
              Export Excel
            </button>
          </div>
        </div>
        {loading ? (
          <p>Loading participants...</p>
        ) : (
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>OR #</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p, idx) => (
                  <TableRow key={`${p.source}-${p.id}`}> {/* id unique per table */}
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{formatName(p.full_name)}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell className="capitalize">{p.gender}</TableCell>
                    <TableCell className="capitalize">{p.source}</TableCell>
                    <TableCell>{p.agency_name || ""}</TableCell>
                    <TableCell>{p.or_number || ""}</TableCell>
                    <TableCell>{p.status === "approved" ? "Approved" : (p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "")}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No participants found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
