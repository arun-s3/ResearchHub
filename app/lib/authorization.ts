import { prisma } from "@/app/lib/prisma"
import { ProjectRole } from "@prisma/client"


export async function verifyOrganizationOwner(
    organizationId: string,
    userId: string
) {
    const organization = await prisma.organization.findFirst({
        where: {
            id: organizationId,
            ownerId: userId,
        },
        select: {
            id: true,
            name: true,
        },
    })

    if (!organization) {
        return {
            success: false,
            message: "You do not have permission to perform this action",
            data: null
        } 
    }

    return {
        success: true,
        message: "Access granted",
        data: organization,
    }
}


export async function verifyProjectAccess(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                {
                    ownerId: userId,
                },
                {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
        },
    })

    if (!project) {
        return {
            success: false,
            message: "Access denied",
        }
    }

    return {
        success: true,
        project,
    }
}

export async function verifyProjectEditAccess(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                {
                    ownerId: userId,
                },
                {
                    members: {
                        some: {
                            userId,
                            role: ProjectRole.REVIEWER,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
        },
    })

    if (!project) {
        return {
            success: false,
            message: "You do not have permission to modify articles",
        }
    }

    return {
        success: true,
        project,
    }
}
