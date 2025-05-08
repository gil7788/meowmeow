import { use } from "react";
import MemeClientPage from "~~/components/MemeClientPage";

export default function ProjectPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  return <MemeClientPage hash={hash} />;
}
