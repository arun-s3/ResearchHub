"use client"

import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, ChevronRight, Filter } from "lucide-react"
import { useState } from "react"

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

interface ReviewQueueTabProps {
    articles: Article[]
    onArticleClick: (article: Article) => void
}

export function ReviewQueueTab({ articles, onArticleClick }: ReviewQueueTabProps) {
    const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("high")

    // Filter only Pending and Maybe articles, prioritized by high Priority first
    const queueArticles = articles
        .filter((a) => a.status === "pending" || a.status === "maybe")
        .sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 }
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
            if (priorityDiff !== 0) return priorityDiff

            const statusOrder: Record<Article["status"], number> = {
                pending: 0,
                maybe: 1,
                included: 2,
                excluded: 3,
            }

            return statusOrder[a.status] - statusOrder[b.status]
        })
        .filter((a) => filterPriority === "all" || a.priority === filterPriority)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    }

    if (queueArticles.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center'>
                <CheckCircle size={48} className='mx-auto mb-3 text-green-600' />
                <h3 className='text-lg font-semibold text-slate-900'>All caught up!</h3>
                <p className='mt-2 text-slate-600'>All articles have been reviewed. Great work!</p>
            </motion.div>
        )
    }

    const highPriorityCount = queueArticles.filter((a) => a.priority === "high").length
    const pendingCount = queueArticles.filter((a) => a.status === "pending").length

    return (
        <motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                    <h2 className='text-lg font-bold text-slate-900 mb-2'>
                        Articles Pending Review ({queueArticles.length})
                    </h2>
                    <p className='text-sm text-slate-600'>
                        {highPriorityCount > 0 && (
                            <>
                                <span className='font-semibold text-red-600'>{highPriorityCount}</span>
                                <span> high-priority article{highPriorityCount !== 1 ? "s" : ""}</span>
                            </>
                        )}
                        {highPriorityCount === 0 && pendingCount > 0 && (
                            <>
                                <span className='font-semibold text-amber-600'>{pendingCount}</span>
                                <span> pending article{pendingCount !== 1 ? "s" : ""}</span>
                            </>
                        )}
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Filter size={16} className='text-slate-600' />
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as "all" | "high" | "medium" | "low")}
                        className='px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-teal-500 focus:outline-none transition-colors'>
                        <option value='all'>All Priorities</option>
                        <option value='high'>High Priority Only</option>
                        <option value='medium'>Medium Priority</option>
                        <option value='low'>Low Priority</option>
                    </select>
                </div>
            </div>

            <div className='space-y-3'>
                {queueArticles.map((article) => (
                    <motion.button
                        key={article.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onArticleClick(article)}
                        className='w-full rounded-lg border border-amber-100 bg-white p-4 hover:shadow-md transition-all text-left group'>
                        <div className='flex items-start justify-between gap-4'>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-start gap-3 mb-2'>
                                    {/* Priority Badge */}
                                    <div
                                        className={`mt-0.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            article.priority === "high"
                                                ? "bg-red-100 text-red-700"
                                                : article.priority === "medium"
                                                  ? "bg-orange-100 text-orange-700"
                                                  : "bg-lime-100 text-lime-700"
                                        }`}>
                                        {article.priority.charAt(0).toUpperCase() + article.priority.slice(1)} Priority
                                    </div>

                                    {article.status === "pending" && (
                                        <div className='mt-0.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 
                                            text-amber-700 whitespace-nowrap'>
                                            Pending
                                        </div>
                                    )}
                                    {article.status === "maybe" && (
                                        <div className='mt-0.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 
                                            text-blue-700 whitespace-nowrap'
                                        >
                                            Needs Decision
                                        </div>
                                    )}
                                </div>

                                <h3 className='font-semibold text-slate-900 group-hover:text-teal-600 transition-colors 
                                    line-clamp-2 mb-2'
                                >
                                    {article.title}
                                </h3>

                                <div className='flex flex-wrap items-center gap-3 text-xs text-slate-600'>
                                    <span className='font-medium'>{article.firstAuthor}</span>
                                    <span>•</span>
                                    <span>{article.journal}</span>
                                    <span>•</span>
                                    <span className='font-medium'>{article.publicationYear}</span>
                                </div>

                                {article.reviewerNotes && (
                                    <div className='mt-2 p-2 rounded bg-blue-50 border border-blue-100'>
                                        <p className='text-xs text-blue-700 font-medium'>
                                            <span className='inline-block mr-1'>📝</span>
                                            Notes: {article.reviewerNotes.substring(0, 50)}
                                            {article.reviewerNotes.length > 50 ? "..." : ""}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <motion.div
                                whileHover={{ x: 4 }}
                                className='flex-shrink-0 text-slate-400 group-hover:text-teal-600 transition-colors mt-1'>
                                <ChevronRight size={20} />
                            </motion.div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-lg border border-teal-200 bg-teal-50 p-4'>
                <div className='flex items-start gap-3'>
                    <AlertCircle size={18} className='text-teal-600 mt-0.5 flex-shrink-0' />
                    <div>
                        <p className='text-sm font-semibold text-teal-900'>How to prioritize your review</p>
                        <p className='text-xs text-teal-800 mt-1'>
                            Click on any article to open the review drawer where you can add notes, set the review
                            status, and save your decisions.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
