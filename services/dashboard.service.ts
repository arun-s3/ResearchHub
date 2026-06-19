import { prisma } from "@/app/lib/prisma"


export async function getDashboardOrganizations(userId: string) {
    
    const organizations = await prisma.organization.findMany({
        where: {
            OR: [
                {
                    ownerId: userId,
                },
                {
                    projects: {
                        some: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                },
            ],
        },

        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },

            projects: {
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },

                    articles: {
                        select: {
                            status: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    })

    return organizations.map((org) => {
        const uniqueMembers = new Map()

        // Add organization owner first
        uniqueMembers.set(org.owner.id, {
            id: org.owner.id,
            name: org.owner.name,
            image: org.owner.image,

            avatar:
                org.owner.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() ?? "",

            role: "owner",
        })

        // Add all unique project members
        for (const project of org.projects) {
            for (const member of project.members) {
                uniqueMembers.set(member.user.id, {
                    id: member.user.id,
                    name: member.user.name,
                    image: member.user.image,

                    avatar:
                        member.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() ?? "",

                    role: member.role.toLowerCase(),
                })
            }
        }

        const members = Array.from(uniqueMembers.values())

        const projects = org.projects.map((project) => ({
            id: project.id,
            name: project.name,
            lastOpenedAt: project.updatedAt,
            totalArticles: project.articles.length,
            reviewedArticles: project.articles.filter(
                (article) => article.status !== "PENDING"
            ).length,

            members: project.members.map((member) => ({
                id: member.user.id,
                name: member.user.name,
                image: member.user.image,

                avatar:
                    member.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() ?? "",

                role: member.role.toLowerCase(),
            })),
        }))

        return {
            id: org.id,
            name: org.name,
            description: org.description,
            isStarred: org.starred,
            createdAt: org.createdAt,
            memberCount: members.length,
            members,
            projects,
        }
    })
}