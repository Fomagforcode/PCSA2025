"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { IndividualRegistrationWithOffice, GroupRegistrationWithOffice } from "@/lib/registrations"

interface Props {
  individual: IndividualRegistrationWithOffice[]
  group: GroupRegistrationWithOffice[]
}

export default function OfficeBarChart({ individual, group }: Props) {
  // Accumulate counts per office name
  const counts: Record<string, number> = {}
  individual.forEach((r) => {
    const name = r.field_offices?.name || "Unknown"
    counts[name] = (counts[name] || 0) + 1
  })
  group.forEach((r) => {
    const name = r.field_offices?.name || "Unknown"
    counts[name] = (counts[name] || 0) + 1
  })

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#f472b6"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} dy={10} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
