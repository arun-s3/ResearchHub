"use client"

import { useState, useRef } from "react"
import * as XLSX from "xlsx"

import { motion } from "framer-motion"

import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Upload, CheckCircle, AlertCircle, TriangleAlert, Copy } from "lucide-react"

import { importArticles } from "@/app/actions/article.actions"


interface ImportRow {
    rowIndex: number
    data: Record<string, string>
    status: "valid" | "invalid" | "duplicate"
    errors: string[]
}

export interface Member {
    id: string
    name: string | null
    image: string | null
    avatar: string
    role: string
}

interface ImportTabProps {
    orgId: string
    projectId: string
    members: Member[]
}

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

const REQUIRED_COLUMNS = ["PMID", "Title", "Authors", "First Author", "Journal/Book", "Publication Year", "DOI"]

export function ImportTab({ orgId, projectId, members }: ImportTabProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [importStep, setImportStep] = useState<"upload" | "preview" | "complete" | "notImported">("upload")
    const [importedRows, setImportedRows] = useState<ImportRow[]>([])

    const [importedArticles, setImportedArticles] = useState(0)
    const [skippedArticles, setSkippedArticles] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: session } = useSession()

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const owner = members.find((m) => m.role === "owner")
    const isOwner = owner?.id === session?.user.id

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isOwner) {
            toast.error("Sorry, only the owner of this project are allowed to upload!")
            return
        }
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    const processFile = (file: File) => {
        const reader = new FileReader()

        reader.onload = (event) => {
            try {
                const data = event.target?.result

                const workbook = XLSX.read(data, {
                    type: "array",
                })

                const worksheet = workbook.Sheets[workbook.SheetNames[0]]

                const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[]

                // Empty file validation
                if (jsonData.length === 0) {
                    alert("The uploaded file is empty.")
                    return
                }

                // Required columns validation
                const headers = Object.keys(jsonData[0])

                const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))

                if (missingColumns.length > 0) {
                    alert(`Missing required columns: ${missingColumns.join(", ")}`)
                    return
                }

                const processedRows: ImportRow[] = []
                const seenPmids = new Set<string>()
                const seenDois = new Set<string>()

                jsonData.forEach((row, index) => {
                    const errors: string[] = []
                    const cleanRow: Record<string, string> = {}

                    // Required field validation
                    REQUIRED_COLUMNS.forEach((column) => {
                        const value = row[column]

                        if (!String(value ?? "").trim()) {
                            errors.push(`Missing ${column}`)
                        }
                    })

                    // Copy all available columns
                    Object.entries(row).forEach(([key, value]) => {
                        cleanRow[key] = String(value ?? "").trim()
                    })

                    // PMID validation
                    const pmid = cleanRow["PMID"]

                    if (pmid && !/^\d+$/.test(pmid)) {
                        errors.push("Invalid PMID")
                    }

                    // Duplicate PMID validation
                    let isDuplicatePmid = false

                    if (pmid && seenPmids.has(pmid)) {
                        isDuplicatePmid = true
                        errors.push("Duplicate PMID")
                    } else if (pmid) {
                        seenPmids.add(pmid)
                    }

                    // Publication Year validation
                    const yearString = cleanRow["Publication Year"]

                    if (yearString) {
                        if (!/^\d{4}$/.test(yearString)) {
                            errors.push("Invalid year")
                        } else {
                            const year = Number(yearString)

                            if (year < 1900 || year > new Date().getFullYear() + 1) {
                                errors.push("Invalid year")
                            }
                        }
                    }

                    // DOI validation
                    const doi = cleanRow["DOI"]?.toLowerCase()

                    if (doi && !/^10\.\d{4,}\/[-._;()/:A-Z0-9]+$/i.test(doi)) {
                        errors.push("Invalid DOI")
                    }

                    // Duplicate DOI validation
                    let isDuplicateDoi = false

                    if (doi && seenDois.has(doi)) {
                        isDuplicateDoi = true
                        errors.push("Duplicate DOI")
                    } else if (doi) {
                        seenDois.add(doi)
                    }

                    const isDuplicate = isDuplicatePmid || isDuplicateDoi

                    const status: "valid" | "invalid" | "duplicate" = isDuplicate
                        ? "duplicate"
                        : errors.length > 0
                          ? "invalid"
                          : "valid"

                    processedRows.push({
                        rowIndex: index + 2, 
                        data: cleanRow,
                        status,
                        errors,
                    })
                })

                setImportedRows(processedRows)
                setImportStep("preview")
            } catch (error) {
                console.error("Error reading file:", error)

                alert("Error reading file. Please ensure it is a valid Excel (.xlsx) file.")
            }
        }

        reader.readAsArrayBuffer(file)
    }

    const validRows = importedRows.filter((row) => row.status === "valid")

    const invalidRows = importedRows.filter((row) => row.status !== "valid")

    const articlesToImport: ImportArticleInput[] = validRows.map((row) => ({
        pmid: row.data["PMID"],
        title: row.data["Title"],
        authors: row.data["Authors"],
        citation: Object.entries(row.data).find(([key]) => key.trim().toLowerCase() === "citation")?.[1] as string,

        pmcid: Object.entries(row.data).find(([key]) => key.trim().toLowerCase() === "pmcid")?.[1] as string,

        nihmsId: Object.entries(row.data).find(([key]) => key.trim().toLowerCase() === "nihms id")?.[1] as string,
        firstAuthor: row.data["First Author"],
        journalBook: row.data["Journal/Book"],
        publicationYear: Number(row.data["Publication Year"]),
        createDate: row.data["Create Date"] ? new Date(row.data["Create Date"]) : null,
        doi: row.data["DOI"] || undefined,
    }))


    const handleImportValid = async () => {
        try {
            const result = await importArticles(orgId, projectId, articlesToImport)

            setImportedArticles(result.imported)
            setSkippedArticles(result.skipped)

            if (result.imported === 0) {
                setImportStep("notImported")
            } else setImportStep("complete")
        } catch (error) {
            console.error(error)
        }
    }

    if (importStep === "upload") {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='max-w-2xl mx-auto'>
                <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                        isDragging
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }`}>
                    <motion.div animate={{ y: isDragging ? -5 : 0 }} className='flex justify-center mb-4'>
                        <div className='rounded-lg bg-teal-100 p-4'>
                            <Upload size={32} className='text-teal-600' />
                        </div>
                    </motion.div>
                    <h3 className='text-lg font-semibold text-slate-900 mb-2'>Import Articles from Excel</h3>
                    <p className='text-slate-600 mb-6'>Upload an Excel file (.xlsx) containing article metadata</p>
                    <div className='space-y-3'>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className='inline-block px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 
                                transition-colors cursor-pointer'>
                            Select File
                        </motion.button>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='.xlsx,.xls'
                            onChange={handleFileSelect}
                            className='hidden'
                        />
                        <p className='text-xs text-slate-500'>or drag and drop your Excel file here</p>
                    </div>

                    <div className='mt-8 pt-8 border-t border-slate-300'>
                        <h4 className='text-sm font-semibold text-slate-900 mb-4'>🛡️ Validation checks</h4>
                        
                        <p className='text-xs text-slate-600 tracking-[0.2px]' style={{ wordSpacing: "0.7px" }}>
                            File structure, required columns, missing values, duplicate DOIs, PMID/DOI formats, and
                            publication year validity. Invalid or duplicate records are automatically highlighted in the
                            preview before import.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    if (importStep === "preview") {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm'>
                    <h3 className='text-lg font-bold text-slate-900 mb-4'>Import Summary</h3>
                    <div className='grid grid-cols-2 sm:grid-cols-5 gap-4'>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-slate-900'>{importedRows.length}</p>
                            <p className='text-xs text-slate-600 mt-1'>Total Rows</p>
                        </div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-green-600'>{validRows.length}</p>
                            <p className='text-xs text-slate-600 mt-1'>Valid</p>
                        </div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-red-600'>
                                {importedRows.filter((r) => r.status === "invalid").length}
                            </p>
                            <p className='text-xs text-slate-600 mt-1'>Invalid</p>
                        </div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-orange-600'>
                                {importedRows.filter((r) => r.status === "duplicate").length}
                            </p>
                            <p className='text-xs text-slate-600 mt-1'>Duplicates</p>
                        </div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-slate-900'>
                                {Math.round((validRows.length / importedRows.length) * 100)}%
                            </p>
                            <p className='text-xs text-slate-600 mt-1'>Success Rate</p>
                        </div>
                    </div>
                </motion.div>

                {/* Previewing Table */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-xl border border-amber-100 bg-white overflow-hidden shadow-sm'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-slate-50 border-b border-slate-200'>
                                <tr>
                                    <th className='px-4 py-3 text-left font-semibold text-slate-700'>Row</th>
                                    <th className='px-4 py-3 text-left font-semibold text-slate-700'>Title</th>
                                    <th className='px-4 py-3 text-left font-semibold text-slate-700'>First Author</th>
                                    <th className='px-4 py-3 text-left font-semibold text-slate-700'>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importedRows.map((row) => (
                                    <motion.tr
                                        key={row.rowIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`border-b border-slate-100 ${
                                            row.status === "valid"
                                                ? "hover:bg-green-50"
                                                : row.status === "invalid"
                                                  ? "bg-red-50 hover:bg-red-100"
                                                  : "bg-orange-50 hover:bg-orange-100"
                                        }`}>
                                        <td className='px-4 py-3 text-slate-600 font-medium'>{row.rowIndex}</td>
                                        <td className='px-4 py-3 max-w-xs truncate'>
                                            {row.status === "valid" ? (
                                                <span className='text-slate-900'>{row.data["Title"]}</span>
                                            ) : (
                                                <span className='text-slate-600'>{row.data["Title"]}</span>
                                            )}
                                        </td>
                                        <td className='px-4 py-3 text-slate-600 whitespace-nowrap'>
                                            {row.data["First Author"]}
                                        </td>
                                        <td className='px-4 py-3'>
                                            {row.status === "valid" && (
                                                <div className='flex items-center gap-2'>
                                                    <CheckCircle size={16} className='text-green-600' />
                                                    <span className='text-xs font-medium text-green-700'>Valid</span>
                                                </div>
                                            )}
                                            {row.status === "invalid" && (
                                                <div className='space-y-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <AlertCircle size={16} className='text-red-600' />
                                                        <span className='text-xs font-medium text-red-700'>
                                                            Invalid
                                                        </span>
                                                    </div>
                                                    <div className='ml-6 space-y-0.5'>
                                                        {row.errors.map((error, idx) => (
                                                            <p key={idx} className='text-xs text-red-600 font-mono'>
                                                                {error}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {row.status === "duplicate" && (
                                                <div className='space-y-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <Copy size={16} className='text-orange-600' />
                                                        <span className='text-xs font-medium text-orange-700'>
                                                            Duplicate
                                                        </span>
                                                    </div>
                                                    <div className='ml-6 space-y-0.5'>
                                                        {row.errors.map((error, idx) => (
                                                            <p key={idx} className='text-xs text-orange-600 font-mono'>
                                                                {error}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='px-4 py-4 bg-slate-50 border-t border-slate-200'>
                        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between'>
                            <p className='text-xs text-slate-600'>
                                {validRows.length} valid row{validRows.length !== 1 ? "s" : ""} ready to import
                                {invalidRows.length > 0 &&
                                    ` • ${invalidRows.length} row${invalidRows.length !== 1 ? "s" : ""} will be excluded`}
                            </p>
                            <div className='flex gap-3'>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setImportStep("upload")}
                                    className='px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium 
                                        hover:bg-slate-100 transition-colors'>
                                    Back
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleImportValid}
                                    disabled={validRows.length === 0}
                                    className='px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 
                                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'>
                                    Import {validRows.length} Valid Article{validRows.length !== 1 ? "s" : ""}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='max-w-2xl mx-auto text-center py-12'>
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='flex justify-center mb-6'>
                <div className={`rounded-full ${importStep === 'complete' ? 'bg-green-100' : 'bg-yellow-100'} p-6`}> 
                    {
                        importStep === 'complete' 
                            ? <CheckCircle size={48} className='text-green-600' />
                            : importStep === 'notImported'
                            && <TriangleAlert size={48} className='text-yellow-300' />
                    }
                </div>
            </motion.div>
            <h3 className='text-2xl font-bold text-slate-900 mb-2'>
                {
                    importStep === 'complete' 
                        ? 'Import Complete!'
                        : importStep === 'notImported' && 'All Articles Already Exist'
                }
            </h3>
            <p className='text-slate-600 mb-8'>
                {
                    importStep === 'complete' 
                        ?  `Successfully imported ${importedArticles} article${importedArticles !== 1 ? "s" : ""}.
                            ${skippedArticles > 0 ? `${skippedArticles} articles already exist in this project and were skipped.` : ''} 
                            They are now available in the Articles tab for review.`
                        : importStep === 'notImported' 
                        && `All ${skippedArticles} articles in the uploaded file already exist in this project`
                }
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setImportStep("upload")
                    setImportedRows([])
                }}
                className='px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors'>
                {
                    importStep === 'complete' 
                        ? 'Import More Articles'
                        : importStep === 'notImported' && 'Import New Articles'
                }
            </motion.button>
        </motion.div>
    )
}
