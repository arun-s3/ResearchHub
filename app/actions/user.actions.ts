"use server"

import { prisma } from "@/app/lib/prisma"

export async function searchUsers(query: string, projectId: string) {
    if (!query.trim()) {
        return []
    }

    return prisma.user.findMany({
        where: {
            AND: [
                {
                    OR: [
                        {
                            name: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                {
                    projectMemberships: {
                        none: {
                            projectId,
                        },
                    },
                },
            ],
        },
    })
}
