"use client"

import { motion } from "framer-motion"

import { ArrowRight, FileText, Users } from "lucide-react"

import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { verifyProjectAccessAction } from "@/app/actions/project.actions"


interface Member {
    id: string
    name: string
    avatar: string
    role: "owner" | "reviewer" | "viewer"
}

interface ProjectCardProps {
    projectId: string
    projectName: string
    totalArticles: number
    reviewedArticles: number
    members?: Member[]
    onOpenClick?: (projectId: string) => void
}

export function ProjectCard({
    projectId,
    projectName,
    totalArticles,
    reviewedArticles,
    members = [],
    onOpenClick,
}: ProjectCardProps) {
    const progressPercentage = totalArticles > 0 ? Math.round((reviewedArticles / totalArticles) * 100) : 0
    const pendingArticles = totalArticles - reviewedArticles

    // To help determine progress bar color based on completion
    let progressColor = "bg-slate-300"
    if (progressPercentage > 0 && progressPercentage < 50) {
        progressColor = "bg-amber-400"
    } else if (progressPercentage >= 50 && progressPercentage < 100) {
        progressColor = "bg-blue-500"
    } else if (progressPercentage === 100 && totalArticles > 0) {
        progressColor = "bg-green-500"
    }

    const { data: session } = useSession()

    const handleOpenProject = async() => {

        const result = await verifyProjectAccessAction(projectId)

        if (!result.success) {
            toast.error(result.message)
            return
        }
        onOpenClick?.(projectId)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
            className='flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'>
            <div className='mb-4 flex items-start justify-between'>
                <div className='flex items-center gap-3 flex-1'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50'>
                        <FileText size={20} className='text-blue-600' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-semibold text-slate-900'>{projectName}</h3>
                        <p className='text-xs text-slate-500'>Project</p>
                    </div>
                </div>
                {members.length > 0 && (
                    <div className='flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg ml-2 whitespace-nowrap'>
                        <Users size={14} />
                        <span className='font-medium'>{members.length}</span>
                    </div>
                )}
            </div>

            {/* Stats & numbers */}
            <div className='mb-4 grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-slate-50 p-3'>
                    <p className='text-xs font-medium text-slate-600'>Total Articles</p>
                    <p className='mt-1 text-lg font-bold text-slate-900'>{totalArticles}</p>
                </div>
                <div className='rounded-lg bg-slate-50 p-3'>
                    <p className='text-xs font-medium text-slate-600'>Reviewed</p>
                    <p className='mt-1 text-lg font-bold text-slate-900'>{reviewedArticles}</p>
                </div>
            </div>

            {pendingArticles > 0 && (
                <p className='mb-3 text-xs text-slate-600'>
                    <span className='font-semibold text-slate-700'>{pendingArticles}</span> pending review
                </p>
            )}

            {/* Progress bar */}
            <div className='mb-4 flex items-center gap-3'>
                <div className='flex-1 overflow-hidden rounded-full bg-slate-200 h-2'>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full transition-colors ${progressColor}`}
                    />
                </div>
                <p className='text-xs font-semibold text-slate-700 w-10 text-right'>{progressPercentage}%</p>
            </div>

            <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenProject}
                className='flex items-center justify-between rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors
                    hover:bg-blue-700 active:bg-blue-800 cursor-pointer'>
                <span>Open Project</span>
                <ArrowRight size={16} />
            </motion.button>
        </motion.div>
    )
}
