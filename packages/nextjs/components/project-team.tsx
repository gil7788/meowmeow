import { Card, CardContent } from "@/components/ui/card"

interface TeamMember {
  name: string
  role: string
  image: string
}

interface ProjectTeamProps {
  team: TeamMember[]
}

export function ProjectTeam({ team }: ProjectTeamProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {team.map((member, index) => (
        <Card key={index}>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-semibold">{member.name}</h4>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
