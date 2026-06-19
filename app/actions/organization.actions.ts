"use server"

import { revalidatePath } from "next/cache"

import { getServerSession } from "next-auth"
import { prisma } from "@/app/lib/prisma"

import { authOptions } from "@/app/lib/auth"

import { verifyOrganizationOwner } from "@/app/lib/authorization"


export async function createOrganization(name: string, description: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return {
            success: false,
            message: "Unauthorized",
        }
    }

    const organization = await prisma.organization.create({
        data: {
            name,
            description,
            ownerId: session.user.id,
        },
    })

    revalidatePath("/dashboard")

    return organization
}


interface ToggleOrganizationStarInput {
    organizationId: string
}

export async function toggleOrganizationStar({
    organizationId,
}: ToggleOrganizationStarInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
        }
    }

    const access = await verifyOrganizationOwner(
        organizationId,
        session.user.id
    )

    if (!access.success) {
        return access
    }

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
        select: {
            starred: true,
        },
    })

    if (!organization) {
        return {
            success: false,
            message: "Organization not found",
        }
    }

    const updatedOrganization =
        await prisma.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                starred: !organization.starred,
            },
        })

    revalidatePath("/dashboard") 
    
    return {
        success: true,
        message: updatedOrganization.starred
            ? "Organization starred"
            : "Organization unstarred",
    }
}