import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { prisma } from "@/app/lib/prisma"

export async function GET() {
    const articles = await prisma.article.findMany({
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
            "Content-Disposition": 'attachment; filename="articles.xlsx"',
        },
    })
}
