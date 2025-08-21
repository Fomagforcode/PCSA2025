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
  const parts = cleaned.split(/\s+/)
  return parts[parts.length - 1] // Last part is surname
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
        const res = await fetch("/Export Excel Template/Masters List Template Export.xlsx")
        const buf = await res.arrayBuffer()
        wb = XLSX.read(buf, { type: "array" })
      } catch {
        // Fallback: create new workbook if template not found
        wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.aoa_to_sheet([["ID", "Name", "Age", "Gender", "Source", "OR #", "Remarks"]]),
          "Master List"
        )
      }

      // Use first sheet
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]

      // Starting row after headers (row 2 if template, row 2 for fallback)
      let startRow = 2
      // Find last used row
      if (ws["!ref"]) {
        const range = XLSX.utils.decode_range(ws["!ref"] as string)
        startRow = range.e.r + 1
      }

      // Add participant rows
      const rows = sorted.map((p, idx) => [idx + 1, formatName(p.full_name), p.age, p.gender, p.source, p.or_number || "", p.status || ""])
      XLSX.utils.sheet_add_aoa(ws, rows, { origin: `A${startRow + 1}` })

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
        data = await getAllParticipants(fieldOfficeId)
      } else {
        // @ts-ignore - function will be added in registrations.ts
        data = await getAllParticipantsAll()
      }
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
                    <TableCell>{p.or_number || ""}</TableCell>
                    <TableCell>{p.status === "approved" ? "Approved" : (p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "")}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
