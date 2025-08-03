"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { IndividualRegistrationWithOffice, GroupRegistrationWithOffice } from "@/lib/registrations"

interface Props {
  individual: IndividualRegistrationWithOffice[]
  group: GroupRegistrationWithOffice[]
}

export default function StatusPieChart({ individual, group }: Props) {
  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
  }

  individual.forEach((r) => {
    counts[r.status as keyof typeof counts]++
  })
  group.forEach((r) => {
    counts[r.status as keyof typeof counts]++
  })

  const data = [
    { name: "Pending", value: counts.pending, fill: "#facc15" },
    { name: "Approved", value: counts.approved, fill: "#4ade80" },
    { name: "Rejected", value: counts.rejected, fill: "#f87171" },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
