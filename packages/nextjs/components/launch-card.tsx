import Link from "next/link"
import { CalendarClock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LaunchCardProps {
  id: string
  name: string
  description: string
  image: string
  raised: string
  goal: string
  progress: number
  startDate: string
  endDate: string
  status: "upcoming" | "live" | "completed"
}

export function LaunchCard({
  id,
  name,
  description,
  image,
  raised,
  goal,
  progress,
  startDate,
  endDate,
  status,
}: LaunchCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Upcoming
          </Badge>
        )
      case "live":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Live
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            Completed
          </Badge>
        )
    }
  }

  // Format date in a consistent way for both server and client
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative">
          <img src={image || "/placeholder.svg"} alt={name} className="w-full h-48 object-cover" />
          <div className="absolute top-2 right-2">{getStatusBadge()}</div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: {raised}</span>
              <span>Goal: {goal}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-right text-muted-foreground">{progress}% Complete</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            {status === "upcoming" ? (
              <span>Starts {formatDate(startDate)}</span>
            ) : status === "live" ? (
              <span>Ends {formatDate(endDate)}</span>
            ) : (
              <span>Ended {formatDate(endDate)}</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/projects/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
