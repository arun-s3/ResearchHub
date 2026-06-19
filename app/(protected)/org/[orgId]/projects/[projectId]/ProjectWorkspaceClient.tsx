"use client"

import { useState, useMemo, useEffect } from "react"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"

import { motion } from "framer-motion"

import { ChevronLeft, Download} from "lucide-react"

import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { ProjectOverviewTab } from "@/components/project/OverviewTab"
import { ArticlesTab } from "@/components/project/ArticlesTab"
import { ReviewQueueTab } from "@/components/project/ReviewQueueTab"
import { ImportTab } from "@/components/project/ImportTab"
import { ProjectMembersWidget } from "@/components/project/ProjectMembersWidget"


export interface ProjectMember {
    id: string
    name: string | null
    image: string | null
    avatar: string
    role: "owner" | "reviewer" | "viewer"
}

export interface ProjectInfo {
    id: string
    name: string
    description: string | null
    organizationId: string
    organizationName: string
    createdAt: Date 
    updatedAt: Date
}

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

interface ProjectWorkspaceClientProps {
    orgId: string
    project: ProjectInfo
    articles: Article[]
    projectMembers: ProjectMember[]
}


type TabType = "overview" | "articles" | "review-queue" | "import"


export function ProjectWorkspaceClient({
    orgId,
    project,
    articles,
    projectMembers,
}: ProjectWorkspaceClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview")

    const stats = useMemo(() => {
        const totalArticles = articles.length
        const totalIncluded = articles.filter((a) => a.status === "included").length
        const totalExcluded = articles.filter((a) => a.status === "excluded").length
        const totalPending = articles.filter((a) => a.status === "pending" || a.status === "maybe").length
        const reviewedCount = totalIncluded + totalExcluded
        const progressPercentage = totalArticles > 0 ? Math.round((reviewedCount / totalArticles) * 100) : 0

        return {
            totalArticles,
            totalIncluded,
            totalExcluded,
            totalPending,
            reviewedCount,
            progressPercentage,
        }
    }, [articles])

    const { data: session } = useSession()

    const router = useRouter()

    const isProjectReviewer = projectMembers.some((m) => m.id === session?.user.id && m.role.toLowerCase() === "reviewer")

    useEffect(()=> {
        if(session) {
            const member = projectMembers.some((m) => m.id === session?.user.id)
            if(!member) {
                toast.error("You are not a member of this project!")
                router.replace("/dashboard")
            }
        }
    }, [session])

    const tabs: { id: TabType; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "articles", label: "Articles" },
        { id: "review-queue", label: "Review Queue" },
        { id: "import", label: "Import" },
    ]
    
    const handleExport = ()=> {
        window.location.href = "/api/articles/export"
    }


    return (
        <div className='min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50'>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='border-b border-amber-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={()=> redirect("/dashboard")}
                                className='p-2 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer'>
                                <ChevronLeft size={20} className='text-slate-600' />
                            </motion.button>
                            <div>
                                <div className='flex items-center gap-2'>
                                    <h1 className='text-2xl font-bold text-slate-900'>{project.name}</h1>
                                </div>
                                <p className='text-sm text-slate-500'>{project.organizationName}</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExport}
                                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium 
                                    hover:bg-teal-700 transition-colors cursor-pointer'>
                                <Download size={16} />
                                <span className='hidden sm:inline'>Export</span>
                            </motion.button>

                        </div>
                    </div>

                    {/* Shows tabs for navigtaion- Overview, Article, Review and Import*/}
                    <div className='flex items-center gap-6 border-t border-amber-100 pt-4 overflow-x-auto'>
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ color: "#1e293b" }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                                    activeTab === tab.id ? "text-slate-900" : "text-slate-600 hover:text-slate-900 cursor-pointer"
                                }`}>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId='tab-indicator'
                                        className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-600'
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    <div className='lg:col-span-3'>
                        {activeTab === "overview" && (
                            <ProjectOverviewTab stats={stats} articles={articles} projectName={project.name} />
                        )}
                        {activeTab === "articles" && (
                            <ArticlesTab
                                orgId={orgId}
                                projectId={project.id}
                                isProjectReviewer={isProjectReviewer}
                                articles={articles}
                                onArticleSelected={(articleId) => {
                                }}
                            />
                        )}
                        {activeTab === "review-queue" && (
                            <ReviewQueueTab
                                articles={articles}
                                onArticleClick={(article) => {
                                    setActiveTab("articles")
                                }}
                            />
                        )}
                        {
                            activeTab === "import" && 
                            <ImportTab orgId={project.organizationId} projectId={project.id} members={projectMembers}/>
                        }
                    </div>

                    {/* Sidebar with Members Widget */}
                    <div className='lg:col-span-1'>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='sticky top-8'>
                            <ProjectMembersWidget
                                orgId={project.organizationId}
                                projectId={project.id}
                                members={projectMembers}
                                projectName={project.name}
                            />
                        </motion.div>
                        <p className="mt-6 ml-[6px] text-[13px] text-gray-400 pl-[7px] border-l-3 border-teal-600">
                            {project.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
