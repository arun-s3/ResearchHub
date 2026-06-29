"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

import { Search, ChevronUp, ChevronDown, CheckCircle, XCircle, Clock, HelpCircle, MessageSquare } from "lucide-react"
import { toast } from "sonner";

import { Priority, ReviewStatus } from "@prisma/client"

import { updateArticleReview, bulkUpdateArticleReview } from "@/app/actions/article.actions"

import { ReviewDrawer } from "./ReviewDrawer"

interface Article {
    id: string
    title: string
    firstAuthor: string
    journal: string
    publicationYear: number
    doi: string
    status: "pending" | "included" | "excluded" | "maybe"
    priority: "high" | "medium" | "low"
    updatedAt: Date
    pmid?: string
    authors?: string
    citation?: string
    createDate?: Date | null
    pmcid?: string | null
    nimsId?: string | null
    reviewerNotes?: string | null
    decisionReason?: string | null
}

type SortField = "year" | "title" | "status"
type FilterStatus = "all" | "pending" | "included" | "excluded" | "maybe"

const ITEMS_PER_PAGE = 10

const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border border-red-200",
    medium: "bg-orange-100 text-orange-700 border border-orange-200",
    low: "bg-lime-100 text-lime-700 border border-lime-200",
}

const statusIcons: Record<string, React.ReactNode> = {
    included: <CheckCircle size={16} className='text-green-600' />,
    excluded: <XCircle size={16} className='text-red-600' />,
    pending: <Clock size={16} className='text-amber-600' />,
    maybe: <HelpCircle size={16} className='text-blue-600' />,
}


interface ArticlesTabProps {
    orgId: string
    projectId: string
    isProjectReviewer: boolean
    articles: Article[]
}

export function ArticlesTab({ orgId, projectId, isProjectReviewer, articles }: ArticlesTabProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
    const [yearFilter, setYearFilter] = useState<number | null>(null)
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
    const [sortField, setSortField] = useState<SortField>("title")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [hoveredTitle, setHoveredTitle] = useState<string | null>(null)

    const availableYears = useMemo(() => {
        return Array.from(new Set(articles.map((a) => a.publicationYear))).sort((a, b) => b - a)
    }, [articles])

    // Filteriing and sorting articles
    const filteredAndSortedArticles = useMemo(() => {
        let filtered = articles.filter((article) => {
            const matchesSearch =
                searchTerm === "" ||
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.doi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.firstAuthor.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || article.status === statusFilter

            const matchesYear = yearFilter === null || article.publicationYear === yearFilter

            const matchesPriority = priorityFilter === null || article.priority === priorityFilter

            return matchesSearch && matchesStatus && matchesYear && matchesPriority
        })

        filtered.sort((a, b) => {
            let compareValue = 0

            if (sortField === "year") {
                compareValue = a.publicationYear - b.publicationYear
            } else if (sortField === "title") {
                compareValue = a.title.localeCompare(b.title)
            } else if (sortField === "status") {
                compareValue = a.status.localeCompare(b.status)
            }

            return sortDirection === "asc" ? compareValue : -compareValue
        })

        return filtered
    }, [articles, searchTerm, statusFilter, yearFilter, priorityFilter, sortField, sortDirection])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedArticles.length / ITEMS_PER_PAGE)
    const paginatedArticles = filteredAndSortedArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    )

    const handleToggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
        setCurrentPage(1)
    }

    const handleToggleRow = (articleId: string) => {
        const newSelected = new Set(selectedRows)
        if (newSelected.has(articleId)) {
            newSelected.delete(articleId)
        } else {
            newSelected.add(articleId)
        }
        setSelectedRows(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedRows.size === paginatedArticles.length) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(paginatedArticles.map((a) => a.id)))
        }
    }

    const handleStatusChange = async (articleId: string, status: ReviewStatus) => {
        try {
            if(!isProjectReviewer) {
                toast.error("You don't have permission to perform this action")
                return
            }
            const result = await updateArticleReview({
                orgId,
                projectId,
                articleId,
                status,
            })
            if (!result.success) {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handlePriorityChange = async (articleId: string, priority: Priority) => {
        try {
            if(!isProjectReviewer) {
                toast.error("You don't have permission to perform this action")
                return
            }
            const result = await updateArticleReview({
                orgId,
                projectId,
                articleId,
                priority,
            })
            if (!result.success) {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleBulkStatus = async (status: ReviewStatus) => {
        try {
            if(!isProjectReviewer) {
                toast.error("You don't have permission to perform this action")
                return
            }
            const articleIds = Array.from(selectedRows)
            const result = await bulkUpdateArticleReview({
                orgId,
                projectId,
                articleIds,
                status,
            })
            if (!result.success) {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleBulkPriority = async (priority: Priority) => {
        try {
            if(!isProjectReviewer) {
                toast.error("You don't have permission to perform this action")
                return
            }
            const articleIds = Array.from(selectedRows)
            const result = await bulkUpdateArticleReview({
                orgId,
                projectId,
                articleIds,
                priority,
            })
            if (!result.success) {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleOpenArticle = (article: Article) => {
        setSelectedArticle(article)
        setIsDrawerOpen(true)
    }

    const SortButton = ({ field, label }: { field: SortField; label: string }) => (
        <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleToggleSort(field)}
            className='flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors'>
            {label}
            {sortField === field && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </motion.button>
    )

    return (
        <div className='space-y-4'>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-xl border border-amber-100 bg-white p-4 shadow-sm'>
                <div className='mb-4'>
                    <div className='relative'>
                        <Search size={18} className='absolute left-3 top-3 text-slate-400' />
                        <input
                            type='text'
                            placeholder='Search by title, DOI, or author...'
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className='w-full pl-10 pr-4 py-2 placeholder:text-[14px] rounded-lg border border-slate-200 
                                bg-slate-50 text-slate-900 placeholder-slate-500 focus:border-teal-500 
                                focus:bg-white focus:outline-none transition-colors'
                        />
                    </div>
                </div>

                {/* Filter tools */}
                <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-wrap'>
                    <div className='flex items-center gap-2'>
                        <label className='text-xs font-medium text-gray-400'>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as FilterStatus)
                                setCurrentPage(1)
                            }}
                            className='px-3 py-1 rounded-[7px] border border-slate-200 bg-white text-sm text-slate-700 
                                focus:border-teal-500 focus:outline-none transition-colors'>
                            <option value='all'>All</option>
                            <option value='pending'>Pending</option>
                            <option value='included'>Included</option>
                            <option value='excluded'>Excluded</option>
                            <option value='maybe'>Maybe</option>
                        </select>
                    </div>

                    <div className='flex items-center gap-2'>
                        <label className='text-xs font-medium text-gray-400'>Year:</label>
                        <select
                            value={yearFilter || ""}
                            onChange={(e) => {
                                setYearFilter(e.target.value ? Number(e.target.value) : null)
                                setCurrentPage(1)
                            }}
                            className='px-3 py-1 rounded-[7px] border border-slate-200 bg-white text-sm text-slate-700 
                                focus:border-teal-500 focus:outline-none transition-colors'>
                            <option value=''>All Years</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex items-center gap-2'>
                        <label className='text-xs font-medium text-gray-400'>Priority:</label>
                        <select
                            value={priorityFilter || ""}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value || null)
                                setCurrentPage(1)
                            }}
                            className='px-3 py-1 rounded-[7px] border border-slate-200 bg-white text-sm text-slate-700 
                                focus:border-teal-500 focus:outline-none transition-colors'
                        >
                            <option value=''>All Priorities</option>
                            <option value='high'>High</option>
                            <option value='medium'>Medium</option>
                            <option value='low'>Low</option>
                        </select>
                    </div>

                    {/* To clear filters */}
                    {(searchTerm || statusFilter !== "all" || yearFilter || priorityFilter) && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                                setYearFilter(null)
                                setPriorityFilter(null)
                                setCurrentPage(1)
                            }}
                            className='px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium 
                                text-slate-700 hover:bg-slate-100 transition-colors'
                        >
                            Clear Filters
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Bulk Actions */}
            {selectedRows.size > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='rounded-xl border border-teal-200 bg-teal-50 p-4 shadow-sm'>
                    <div className='flex items-center justify-between gap-4 flex-wrap'>
                        <p className='text-sm font-medium text-teal-900'>
                            {selectedRows.size} article{selectedRows.size !== 1 ? "s" : ""} selected
                        </p>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <div className='flex items-center gap-2 border-l border-teal-200 pl-4'>
                                <span className='text-xs font-medium text-slate-600'>Set as:</span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkStatus("INCLUDED")}
                                    className='px-3 py-1 rounded-lg bg-green-100 text-xs font-medium text-green-700 
                                        hover:bg-green-200 transition-colors'
                                >
                                    Include
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkStatus("EXCLUDED")}
                                    className='px-3 py-1 rounded-lg bg-red-100 text-xs font-medium text-red-700 hover:bg-red-200 
                                        transition-colors'
                                >
                                    Exclude
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkStatus("MAYBE")}
                                    className='px-3 py-1 rounded-lg bg-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-200 
                                        transition-colors'
                                >
                                    Maybe
                                </motion.button>
                            </div>

                            {/* Priority Buttons */}
                            <div className='flex items-center gap-2 border-l border-teal-200 pl-4'>
                                <span className='text-xs font-medium text-slate-600'>Priority:</span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkPriority("HIGH")}
                                    className='px-3 py-1 rounded-lg bg-red-100 text-xs font-medium text-red-700 
                                        hover:bg-red-200 transition-colors'>
                                    High
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkPriority("MEDIUM")}
                                    className='px-3 py-1 rounded-lg bg-orange-100 text-xs font-medium text-orange-700 
                                        hover:bg-orange-200 transition-colors'>
                                    Medium
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBulkPriority("LOW")}
                                    className='px-3 py-1 rounded-lg bg-lime-100 text-xs font-medium text-lime-700 
                                        hover:bg-lime-200 transition-colors'>
                                    Low
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-xl border border-amber-100 bg-white shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead className='sticky top-0 bg-slate-50 border-b border-slate-200'>
                            <tr>
                                <th className='px-4 py-3 text-left'>
                                    <input
                                        type='checkbox'
                                        checked={
                                            selectedRows.size > 0 && selectedRows.size === paginatedArticles.length
                                        }
                                        onChange={handleSelectAll}
                                        className='w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer'
                                    />
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700'>
                                    <SortButton field='title' label='Title' />
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap'>
                                    First Author
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap'>
                                    Journal/Book
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700'>
                                    <SortButton field='year' label='Year' />
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700'>DOI</th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700'>
                                    <SortButton field='status' label='Status' />
                                </th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700'>Priority</th>
                                <th className='px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap'>
                                    Updated
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className='px-4 py-12 text-center'>
                                        <p className='text-slate-500'>No articles found</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedArticles.map((article) => (
                                    <motion.tr
                                        key={article.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`border-b border-slate-100 transition-colors ${
                                            article.priority === "high"
                                                ? "bg-red-50 hover:bg-red-100"
                                                : "hover:bg-amber-50"
                                        }`}>
                                        <td className='px-4 py-3'>
                                            <input
                                                type='checkbox'
                                                checked={selectedRows.has(article.id)}
                                                onChange={() => handleToggleRow(article.id)}
                                                className='w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 
                                                    cursor-pointer'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='relative group'>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => handleOpenArticle(article)}
                                                    className='font-medium text-slate-900 max-w-xs truncate hover:text-teal-600 
                                                        transition-colors text-left cursor-pointer'>
                                                    {article.title}
                                                </motion.button>
                                                {article.reviewerNotes && (
                                                    <div className='absolute -left-[3.5rem] -top-4 transform -translate-x-1'>
                                                        <MessageSquare
                                                            size={14}
                                                            className='text-blue-500 fill-blue-500'
                                                        />
                                                    </div>
                                                )}
                                                {/* Tooltip */}
                                                <div className='absolute left-0 top-full mt-1 hidden group-hover:block z-50 
                                                    bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
                                                    {article.reviewerNotes
                                                        ? "Click to see more metadatas & see/edit notes"
                                                        : "Click to see more metadatas & add notes"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3 text-slate-600 whitespace-nowrap'>
                                            {article.firstAuthor}
                                        </td>
                                        <td className='px-4 py-3 text-slate-600 whitespace-nowrap'>
                                            {article.journal}
                                        </td>
                                        <td className='px-4 py-3 text-slate-600'>{article.publicationYear}</td>
                                        <td className='px-4 py-3'>
                                            <code className='px-2 py-1 rounded bg-slate-100 text-xs text-slate-600 font-mono'>
                                                {article.doi.split("/")[article.doi.split("/").length - 1]}
                                            </code>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center gap-2'>
                                                {statusIcons[article.status]}
                                                <select
                                                    value={article.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            article.id,
                                                            e.target.value.toUpperCase() as ReviewStatus,
                                                        )
                                                    }
                                                    className='px-2 py-1 rounded text-xs bg-white border border-slate-200 
                                                        text-slate-700 focus:border-teal-500 focus:outline-none transition-colors'>
                                                    <option value='pending'>Pending</option>
                                                    <option value='included'>Included</option>
                                                    <option value='excluded'>Excluded</option>
                                                    <option value='maybe'>Maybe</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <select
                                                value={article.priority}
                                                onChange={(e) =>
                                                    handlePriorityChange(
                                                        article.id,
                                                        e.target.value.toUpperCase() as Priority,
                                                    )
                                                }
                                                className={`px-2 py-1 rounded text-xs font-medium focus:outline-none transition-colors ${
                                                    priorityColors[article.priority]
                                                }`}>
                                                <option value='high'>High</option>
                                                <option value='medium'>Medium</option>
                                                <option value='low'>Low</option>
                                            </select>
                                        </td>
                                        <td className='px-4 py-3 text-slate-600 whitespace-nowrap text-xs'>
                                            {new Date(article.updatedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className='flex items-center justify-between px-4 py-4 border-t border-slate-200 bg-slate-50'>
                        <p className='text-xs text-slate-600'>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedArticles.length)} of{" "}
                            {filteredAndSortedArticles.length} articles
                        </p>
                        <div className='flex items-center gap-2'>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className='px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 
                                    hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer'>
                                Previous
                            </motion.button>
                            <div className='flex items-center gap-1'>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <motion.button
                                        key={page}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                            currentPage === page
                                                ? "bg-teal-600 text-white"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                        }`}>
                                        {page}
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className='px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm font-medium 
                                    text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed 
                                    transition-colors cursor-pointer'>
                                Next
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>

            {selectedArticle && (
                <ReviewDrawer
                    orgId={orgId}
                    projectId={projectId}
                    article={selectedArticle}
                    isProjectReviewer={isProjectReviewer}
                    isOpen={isDrawerOpen}
                    onClose={() => {
                        setIsDrawerOpen(false)
                        setSelectedArticle(null)
                    }}
                />
            )}
        </div>
    )
}
