"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProjectData } from "@/lib/types";

export default function MemeProfile({ project }: { project: ProjectData }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (project.image && project.image !== "none") {
      // is Base 64 Check
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(project.image);

      if (isBase64) {
        const dataUrl = `data:image/png;base64,${project.image}`;
        setImageUrl(dataUrl);
      } else {
        setImageUrl(project.image);
      }
    }
  }, [project.image]);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl && (
          <Image src={imageUrl} alt={project.name} width={96} height={96} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {project.status === "live" ? "LIVE" : project.status.toUpperCase()}
          </div>
        </div>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
    </div>
  );
}
