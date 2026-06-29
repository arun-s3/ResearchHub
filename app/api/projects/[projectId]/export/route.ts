import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { authOptions } from "@/app/lib/auth"
import { getServerSession } from "next-auth"

import { prisma } from "@/app/lib/prisma"
import { verifyProjectAccess } from "@/app/lib/authorization"


interface RouteProps {
    params: Promise<{
        projectId: string
    }>
}

export async function GET(request: Request, { params }: RouteProps) {
    
    const { projectId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await verifyProjectAccess(projectId, session.user.id)

    if (!project) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const articles = await prisma.article.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    const worksheet = XLSX.utils.json_to_sheet(
        articles.map((article) => ({
            PMID: article.pmid,
            Title: article.title,
            Authors: article.authors,
            "First Author": article.firstAuthor,
            "Journal/Book": article.journalBook,
            "Publication Year": article.publicationYear,
            Citation: article.citation,
            DOI: article.doi,
            PMCID: article.pmcid,
            "NIHMS ID": article.nihmsId,
        })),
    )

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Articles")

    const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    })

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="articles.xlsx"`,
        },
    })
}
