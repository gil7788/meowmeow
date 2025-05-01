import Link from "next/link"
import { ArrowRight, Calendar, Clock, ExternalLink, Globe, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CountdownTimer } from "@/components/countdown-timer"

export function FeaturedLaunch() {
  // This would normally come from a database or API
  const project = {
    id: "1",
    name: "MeowZircuit",
    description: "The ultimate meme coin for the Zircuit Network ecosystem with purr-fect tokenomics.",
    image: "/placeholder.svg?height=400&width=400",
    raised: "$1.8M",
    goal: "$2.5M",
    progress: 72,
    startDate: "2023-06-15T10:00:00Z",
    endDate: "2023-06-30T10:00:00Z",
    status: "live",
    website: "https://meowzircuit.example",
    whitepaper: "https://meowzircuit.example/whitepaper",
    audit: "Audited by CertiK",
  }

  // Format date in a consistent way for both server and client
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="p-6 flex items-center justify-center bg-muted/50">
          <img src={project.image || "/placeholder.svg"} alt={project.name} className="w-full max-w-[300px] h-auto" />
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{project.name}</h3>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: {project.raised}</span>
              <span>Goal: {project.goal}</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            <div className="text-xs text-right text-muted-foreground">{project.progress}% Complete</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Ends in</div>
            <CountdownTimer targetDate={project.endDate} />
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={project.website}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              Website
            </Link>
            <Link
              href={project.whitepaper}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Whitepaper
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              {project.audit}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Start Date</span>
              <span className="ml-auto">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Duration</span>
              <span className="ml-auto">15 days</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link href={`/projects/${project.id}`}>Participate Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}`}>
                <span className="sr-only">View Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
