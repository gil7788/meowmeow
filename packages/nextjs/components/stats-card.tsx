import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: ReactNode
  positive: boolean
}

export function StatsCard({ title, value, change, icon, positive }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${positive ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>{change}</p>
      </CardContent>
    </Card>
  )
}
