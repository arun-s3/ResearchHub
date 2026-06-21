"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { toast } from "sonner"
import { X, BookOpen, Users, Calendar, FileText } from "lucide-react"

import { updateArticleReview } from "@/app/actions/article.actions"


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

interface ReviewDrawerProps {
    orgId: string
    projectId: string
    article: Article 
    isProjectReviewer: boolean
    isOpen: boolean
    onClose: () => void
}

export function ReviewDrawer({ orgId, projectId, article, isProjectReviewer, isOpen, onClose }: ReviewDrawerProps) {
    const [notes, setNotes] = useState("")
    const [reason, setReason] = useState("")

    useEffect(() => {
        if (article) {
            setNotes(article.reviewerNotes || "")
            setReason(article.decisionReason || "")
        }
    }, [article])

    const handleSaveNotes = async()=> {
        try {
                if (!isProjectReviewer) {
                    toast.error("You don't have permission to perform this action")
                    return
                }
            await updateArticleReview({
                orgId,
                projectId,
                articleId: article.id as string,
                reviewerNotes: notes,
                decisionReason: reason
            })
        } catch (error) {
            console.error(error)
        }  finally {
            onClose()
        }
    }
    

    return (
        <AnimatePresence>
            {isOpen && article && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 z-30 bg-black/20'
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className='fixed right-0 top-0 bottom-0 z-100 w-full max-w-md bg-white shadow-xl overflow-y-auto'>
                        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-amber-100 bg-white px-6 py-4'>
                            <h3 className='text-[25px] text-teal-500 font-bold'>Review Article</h3>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className='p-2 hover:bg-slate-100 rounded-lg transition-colors'>
                                <X size={20} className='text-slate-600' />
                            </motion.button>
                        </div>

                        <div className='p-6 space-y-6'>
                            <div>
                                <h4 className='text-base font-semibold text-slate-900 mb-2'>{article.title}</h4>
                            </div>

                            {/* All left over metadata from the articles table*/}
                            <div className='space-y-3 border-t border-slate-200 pt-4'>
                                <div className='text-sm font-semibold text-slate-900 mb-3'>Metadata</div>

                                {article.pmid && (
                                    <div className='flex items-start gap-3'>
                                        <FileText size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>PMID</p>
                                            <p className='text-sm font-medium text-slate-900'>{article.pmid || '--'}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-slate-600'>NIHMS ID</p>
                                            <p className='text-sm font-medium text-slate-900'>{article.nimsId || '--'}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-slate-600'>PMCID</p>
                                            <p className='text-sm font-medium text-slate-900'>{article.pmcid || '--'}</p>
                                        </div>
                                    </div>
                                )}

                                {article.authors && (
                                    <div className='flex items-start gap-3'>
                                        <Users size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>Authors</p>
                                            <p className='text-sm text-slate-900'>{article.authors}</p>
                                        </div>
                                    </div>
                                )}

                                {article.citation && (
                                    <div className='flex items-start gap-3'>
                                        <BookOpen size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>Citation</p>
                                            <p className='text-sm text-slate-900'>{article.citation}</p>
                                        </div>
                                    </div>
                                )}

                                {article.createDate && (
                                    <div className='flex items-start gap-3'>
                                        <Calendar size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>Created</p>
                                            <p className='text-sm text-slate-900'>
                                                {new Date(article.createDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {article.pmcid && (
                                    <div className='flex items-start gap-3'>
                                        <FileText size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>PMCID</p>
                                            <p className='text-sm font-medium text-slate-900'>{article.pmcid}</p>
                                        </div>
                                    </div>
                                )}

                                {article.nimsId && (
                                    <div className='flex items-start gap-3'>
                                        <FileText size={16} className='text-slate-500 mt-1' />
                                        <div>
                                            <p className='text-xs text-slate-600'>NIHMS ID</p>
                                            <p className='text-sm font-medium text-slate-900'>{article.nimsId}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reviewer Notes */}
                            <div className='space-y-3 border-t border-slate-200 pt-4'>
                                <div className='text-sm font-semibold text-slate-900'>Reviewer Notes</div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder='Add your notes here...'
                                    className='w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 
                                        placeholder-slate-500 focus:border-teal-500 focus:outline-none resize-none h-24 transition-colors'
                                />
                            </div>

                            {/* Review Reason */}
                            <div className='space-y-3'>
                                <label className='text-sm font-semibold text-slate-900'>
                                    Reason for{" "}
                                    {article.status === "included"
                                        ? "Including"
                                        : article.status === "excluded"
                                          ? "Excluding"
                                          : "Marking"}
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder='Explain your decision...'
                                    className='w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm 
                                        text-slate-900 placeholder-slate-500 focus:border-teal-500 focus:outline-none 
                                        resize-none h-24 transition-colors'
                                />
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveNotes}
                                className='w-full px-4 py-2 rounded-lg bg-teal-600 text-white font-medium 
                                    hover:bg-teal-700 transition-colors cursor-pointer'>
                                Save Notes
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
