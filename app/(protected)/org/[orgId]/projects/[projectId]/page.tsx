import { getProjectWorkspaceData } from "@/services/project.service"

import { ProjectWorkspaceClient } from "./ProjectWorkspaceClient"

interface PageProps {
    params: Promise<{
        orgId: string
        projectId: string
    }>
}

export default async function ProjectPage({ params }: PageProps) {

    const { projectId, orgId } = await params

    const data = await getProjectWorkspaceData(projectId)

    return (
        <ProjectWorkspaceClient orgId={orgId} project={data.project} articles={data.articles} projectMembers={data.projectMembers as any} />
    )
}


