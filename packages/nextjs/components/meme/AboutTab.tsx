"use client";

import React from "react";
import { ProjectData } from "~~/lib/types";

export function AboutTab({ project }: { project: ProjectData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Meme Overview</h3>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
    </div>
  );
}
