import { getUser } from "@/actions";
import { getProject } from "@/actions/get-project";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const MainContent = dynamic(
  async () => (await import("@/app/main-content")).MainContent,
  { ssr: false }
);

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  let project;
  try {
    project = await getProject(projectId);
  } catch (error) {
    // If project not found or user doesn't have access, redirect to home
    redirect("/");
  }

  return <MainContent user={user} project={project} />;
}
