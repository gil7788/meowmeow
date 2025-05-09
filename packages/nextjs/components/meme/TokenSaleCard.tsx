"use client";

import { CountdownTimer } from "@/components/countdown-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ProjectData } from "@/lib/types";
import { Calendar, Clock, Users } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function TokenSaleCard({ project }: { project: ProjectData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Sale</CardTitle>
          <CardDescription>
            {project.status === "upcoming"
              ? "Starting soon"
              : project.status === "live"
                ? "Sale in progress"
                : "Sale completed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: {project.raised}</span>
              <span>Goal: {project.goal}</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            <div className="text-xs text-right text-muted-foreground">{project.progress}% Complete</div>
          </div>

          <div className="space-y-2">
            {project.status === "live" ? (
              <>
                <div className="text-sm font-medium">Ends in</div>
                <CountdownTimer targetDate={project.endDate} />
              </>
            ) : project.status === "upcoming" ? (
              <>
                <div className="text-sm font-medium">Starts in</div>
                <CountdownTimer targetDate={project.startDate} />
              </>
            ) : (
              <div className="text-sm font-medium text-muted-foreground">Sale completed</div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start Date</span>
              </div>
              <div className="text-right">{formatDate(project.startDate)}</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>End Date</span>
              </div>
              <div className="text-right">{formatDate(project.endDate)}</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Duration</span>
              </div>
              <div className="text-right">
                {Math.ceil(
                  (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Participants</span>
              </div>
              <div className="text-right">1,245</div>
            </div>

            <Button className="w-full" disabled={project.status === "completed"}>
              {project.status === "upcoming"
                ? "Remind Me"
                : project.status === "live"
                  ? "Participate Now"
                  : "Sale Ended"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
