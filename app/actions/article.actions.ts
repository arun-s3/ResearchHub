"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/app/lib/prisma"

import { authOptions } from "@/app/lib/auth"
import { getServerSession } from "next-auth"

import { verifyProjectEditAccess } from "@/app/lib/authorization"
import { verifyOrganizationOwner } from "@/app/lib/authorization"

import { Priority, ReviewStatus } from "@prisma/client"

interface ImportArticleInput {
    pmid: string
    title: string
    authors: string
    citation: string
    firstAuthor: string
    journalBook: string
    publicationYear: number
    createDate?: Date | null
    pmcid?: string
    nihmsId?: string
    doi?: string
}

export async function importArticles(orgId: string, projectId: string, articles: ImportArticleInput[]) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        }
    }

    const access = await verifyOrganizationOwner(orgId, session.user.id)

    if (!access.success) {
        return access
    }

    const existingArticles = await prisma.article.findMany({
        where: {
            projectId,
            pmid: {
                in: articles.map((a) => a.pmid),
            },
        },
        select: {
            pmid: true,
        },
    })

    const existingPmids = new Set(existingArticles.map((a) => a.pmid))

    const newArticles = articles.filter((a) => !existingPmids.has(a.pmid))

    const dataToInsert = newArticles.map((article) => ({
        ...article,
        projectId,
    }))

    // console.log("DATA TO INSERT:")
    // console.dir(dataToInsert[0], { depth: null })

    // console.log({
    //     totalIncoming: articles.length,
    //     existing: existingPmids.size,
    //     newArticles: newArticles.length,
    // })

    await prisma.article.createMany({
        data: dataToInsert as any,
    })

    revalidatePath(`/org/${orgId}/projects/${projectId}`)

    const data = {
        imported: newArticles.length,
        skipped: existingPmids.size,
    }

    return {
        success: true,
        message: null,
        data,
    } as {
        success: true
        message: null
        data: {
            imported: number
            skipped: number
        }
    }
}

interface UpdateArticleReviewInput {
    orgId: string
    projectId: string
    articleId: string

    status?: ReviewStatus
    priority?: Priority
    reviewerNotes?: string
    decisionReason?: string
}

export async function updateArticleReview(input: UpdateArticleReviewInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
            data: null
        }
    }

    const access = await verifyProjectEditAccess(input.projectId, session.user.id)

    if (!access.success) {
        return access
    }

    const updatedArticle = await prisma.article.update({
        where: {
            id: input.articleId,
            projectId: input.projectId,
        },
        data: {
            ...(input.status !== undefined && {
                status: input.status,
            }),

            ...(input.priority !== undefined && {
                priority: input.priority,
            }),

            ...(input.reviewerNotes !== undefined && {
                reviewerNotes: input.reviewerNotes,
            }),

            ...(input.decisionReason !== undefined && {
                decisionReason: input.decisionReason,
            }),
        },
    })

    revalidatePath(`/org/${input.orgId}/projects/${input.projectId}`)

    return {
        success: true,
        messae: null,
        data: updatedArticle,
    }
}

interface BulkUpdateArticleReviewInput {
    orgId: string
    projectId: string

    articleIds: string[]

    status?: ReviewStatus
    priority?: Priority
}

export async function bulkUpdateArticleReview(input: BulkUpdateArticleReviewInput) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            message: "Unauthorized",
            data: null
        }
    }

    const access = await verifyProjectEditAccess(input.projectId, session.user.id)

    if (!access.success) {
        return access
    }

    const result = await prisma.article.updateMany({
        where: {
            id: {
                in: input.articleIds,
            },
            projectId: input.projectId,
        },
        data: {
            ...(input.status !== undefined && {
                status: input.status,
            }),

            ...(input.priority !== undefined && {
                priority: input.priority,
            }),
        },
    })

    revalidatePath(`/org/${input.orgId}/projects/${input.projectId}`)

    return {
        success: true,
        messae: null,
        data: result.count,
    }
}
