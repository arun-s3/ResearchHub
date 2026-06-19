import { prisma } from "@/app/lib/prisma"


export async function getProjectWorkspaceData(projectId: string) {

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                },
            },

            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },

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
                orderBy: {
                    updatedAt: "desc",
                },
            },
        },
    })

    if (!project) {
        throw new Error("Project not found")
    }

    const owner = {
        id: project.owner.id,
        name: project.owner?.name || null,
        image: project.owner.image,
        avatar:
            project.owner.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() ?? "",

        role: "owner",
    }

    const reviewers = project.members
        .filter((member) => member.role === "REVIEWER")
        .slice(0, 2)
        .map((member) => ({
            id: member.user.id,
            name: member.user?.name || null,
            image: member.user.image,
            avatar:
                member.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() ?? "",

            role: "reviewer",
        }))

    const viewers = project.members
        .filter((member) => member.role === "VIEWER")
        .slice(0, 2)
        .map((member) => ({
            id: member.user.id,
            name: member.user?.name || null,
            image: member.user.image,
            avatar:
                member.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() ?? "",

            role: "viewer",
        }))

    const projectMembers = [owner, ...reviewers, ...viewers]

    const articles = project.articles.map((article) => ({
        id: article.id,
        title: article.title,
        firstAuthor: article.firstAuthor,
        journal: article.journalBook,
        publicationYear: article.publicationYear,
        doi: article.doi,
        status: article.status.toLowerCase() as "pending" | "included" | "excluded" | "maybe",
        priority: article.priority.toLowerCase() as "high" | "medium" | "low",
        updatedAt: article.updatedAt,
        pmid: article.pmid,
        authors: article.authors,
        citation: article.citation,
        createDate: article.createDate,
        pmcid: article.pmcid,
        nihmsId: article.nihmsId,
        reviewerNotes: article.reviewerNotes,
        decisionReason: article.decisionReason
    }))

    return {
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
            organizationId: project.organization.id,
            organizationName: project.organization.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        },

        articles,

        projectMembers,
    }
}
