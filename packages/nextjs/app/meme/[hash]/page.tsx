import { use } from "react";
import ProjectClientPage from "@/components/ProjectClientPage";

export default function ProjectPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  return <ProjectClientPage hash={hash} />;
}
