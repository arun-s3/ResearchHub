"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

import { ProjectRole } from "@prisma/client"

import { verifyOrganizationOwner } from "@/app/lib/authorization"
import { verifyProjectAccess } from "@/app/lib/authorization"

interface errorObj {
    success: boolean
    message: string
}

export async function createProject(organizationId: string, name: string, description: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
        }
    }

    const access = await verifyOrganizationOwner(organizationId, session.user.id)

    if (!access.success) {
        return access as errorObj
    }

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    })

    if (!organization) {
        return {
            success: false,
            message: "Organization not found",
        }
    }

    if (organization.ownerId !== session.user.id) {
        return {
            success: false,
            message: "You are not allowed to create projects in this organization",
        }
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            organizationId,
            ownerId: session.user.id,
        },
    })

    await prisma.projectMember.create({
        data: {
            projectId: project.id,
            userId: session.user.id,
            role: "REVIEWER",
        },
    })

    revalidatePath("/dashboard")

    return {
        success: true,
        message: null,
        data: project,
    }
}

interface AssignProjectMemberInput {
    orgId: string
    projectId: string
    userId: string
    role: ProjectRole
}

export async function verifyProjectAccessAction(projectId: string) {

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
            data: null
        }
    }

    return await verifyProjectAccess( projectId, session.user.id )
}

export async function assignProjectMember(input: AssignProjectMemberInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
            data: null
        }
    }

    const project = await prisma.project.findUnique({
        where: {
            id: input.projectId,
        },
        select: {
            id: true,
            ownerId: true,
        },
    })

    if (!project) {
        return {
            success: false,
            message: "Project not found",
            data: null
        }
    }

    if (project.ownerId !== session.user.id) {
        return {
            success: false,
            message: "Only the project owner can assign members",
            data: null
        }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: input.userId,
        },
        select: {
            id: true,
        },
    })

    if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    data: null,
                }
    }

    const existingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId: input.projectId,
                userId: input.userId,
            },
        },
    })

    if (existingMember) {
        return {
            success: false,
            message: "User is already a project member",
            data: null
        }
    }

    const member = await prisma.projectMember.create({
        data: {
            projectId: input.projectId,
            userId: input.userId,
            role: input.role,
        },
    })

    revalidatePath(`/org/${input.orgId}/projects/${input.projectId}`)

    return {
        success: true,
        data: member,
    }
}
