"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { useSession } from "next-auth/react"

import { AlertCircle, CheckCircle, Plus, Search as SearchIcon, X, ChevronDown } from "lucide-react"

import { CreateResourceModal } from "@/components/shared/CreateResourceModal"
import { OrganizationCard } from "@/components/dashboard/OrganizationCard"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"


interface Project {
    id: string
    name: string
    totalArticles: number
    reviewedArticles: number
    lastOpenedAt?: Date
    members?: Member[]
}

interface Member {
    id: string
    name: string
    avatar: string
    image: string
    role: "owner" | "reviewer" | "viewer"
}

interface Organization {
    id: string
    name: string
    description: string
    projects: Project[]
    memberCount: number
    isStarred: boolean
    createdAt: Date
    members: Member[]
}

interface DashboardProps {
    organizations: Organization[]
}


type SortOption = "starred" | "a-z" | "z-a" | "recent" | "oldest"

export default function DashboardClient({ organizations }: DashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<{
        orgId: string
        projId: string
    } | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>("starred")
    const [showSortMenu, setShowSortMenu] = useState(false)

    const router = useRouter()

    const { data: session } = useSession()

    const userName = session?.user?.name ?? ""
    const userEmail = session?.user?.email ?? ""

    // For widget data on attention needing projects
    const needsAttention = useMemo(() => {
        const projects: Array<{
            id: string
            name: string
            organizationName: string
            pendingCount: number
        }> = []

        organizations.forEach((org) => {
            org.projects.forEach((proj) => {
                const pending = proj.totalArticles - proj.reviewedArticles
                if (pending > 0) {
                    projects.push({
                        id: proj.id,
                        name: proj.name,
                        organizationName: org.name,
                        pendingCount: pending,
                    })
                }
            })
        })

        return projects.sort((a, b) => b.pendingCount - a.pendingCount).slice(0, 3)
    }, [organizations])

    const recentlyOpenedProjects = useMemo(() => {
        const projects: Array<{
            id: string
            name: string
            organizationName: string
            pendingCount: number
        }> = []

        organizations.forEach((org) => {
            org.projects.forEach((proj) => {
                if (proj.lastOpenedAt) {
                    projects.push({
                        id: proj.id,
                        name: proj.name,
                        organizationName: org.name,
                        pendingCount: proj.totalArticles - proj.reviewedArticles,
                    })
                }
            })
        })

        return projects.sort((a, b) => (b as any).lastOpenedAt - (a as any).lastOpenedAt).slice(0, 3)
    }, [organizations])

    // Filtering & sorting organizations
    const filteredAndSortedOrganizations = useMemo(() => {
        const filtered = organizations.filter((org) => org.name.toLowerCase().includes(searchQuery.toLowerCase()))

        const sorted = [...filtered]

        switch (sortBy) {
            case "starred":
                sorted.sort((a, b) => {
                    if (a.isStarred === b.isStarred) {
                        return a.name.localeCompare(b.name)
                    }
                    return a.isStarred ? -1 : 1
                })
                break

            case "a-z":
                sorted.sort((a, b) => a.name.localeCompare(b.name))
                break

            case "z-a":
                sorted.sort((a, b) => b.name.localeCompare(a.name))
                break

            case "recent":
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break

            case "oldest":
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                break
        }

        return sorted
    }, [organizations, searchQuery, sortBy])

    const handleOpenProject = useCallback(
        (projectId: string) => {
            organizations.forEach((org) => {
                org.projects.forEach((proj) => {
                    if (proj.id === projectId) {
                        setSelectedProject({ orgId: org.id, projId: projectId })
                        router.push(`/org/${org.id}/projects/${projectId}`)
                    }
                })
            })
        },
        [organizations],
    )

    // For calculating stats for the top part
    const totalProjects = organizations.reduce((sum, org) => sum + org.projects.length, 0)
    const totalArticles = organizations.reduce(
        (sum, org) => sum + org.projects.reduce((pSum, proj) => pSum + proj.totalArticles, 0),
        0,
    )
    const totalReviewed = organizations.reduce(
        (sum, org) => sum + org.projects.reduce((pSum, proj) => pSum + proj.reviewedArticles, 0),
        0,
    )

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "starred", label: "Starred First" },
        { value: "a-z", label: "Alphabetical A-Z" },
        { value: "z-a", label: "Alphabetical Z-A" },
        { value: "recent", label: "Recently Created" },
        { value: "oldest", label: "Oldest First" },
    ]

    return (
        <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50'>
            <main className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
                <div className='grid gap-8 lg:grid-cols-3'>
                    <div className='lg:col-span-2 space-y-8'>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}>
                            <div className='mb-6 flex justify-between items-center'>
                                <div>
                                    <h1 className='text-4xl font-bold text-slate-900'>Organizations</h1>
                                    <p className='mt-2 text-slate-600'>
                                        Manage organizations and article review projects
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className='flex items-center gap-2 rounded-[8px] bg-teal-600 p-[10px] font-medium text-white 
                                        transition-colors hover:bg-teal-700 disabled:opacity-50 shadow-lg cursor-pointer'>
                                    <Plus size={25} />
                                    <span className='sm:hidden'>New</span>
                                </motion.button>
                            </div>

                            <div className='grid gap-4 sm:grid-cols-3'>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className='rounded-lg border border-amber-100 bg-white p-4 shadow-sm'>
                                    <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide'>
                                        Total Projects
                                    </p>
                                    <p className='mt-3 text-3xl font-bold text-slate-900'>{totalProjects}</p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 }}
                                    className='rounded-lg border border-amber-100 bg-white p-4 shadow-sm'>
                                    <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide'>
                                        Total Articles
                                    </p>
                                    <p className='mt-3 text-3xl font-bold text-slate-900'>{totalArticles}</p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className='rounded-lg border border-amber-100 bg-white p-4 shadow-sm'>
                                    <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide'>
                                        Reviewed Articles
                                    </p>
                                    <p className='mt-3 text-3xl font-bold text-slate-900'>{totalReviewed}</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='relative flex-1'>
                                <SearchIcon
                                    size={18}
                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                                />
                                <input
                                    type='text'
                                    placeholder='Search organizations...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full rounded-lg border border-amber-100 bg-white py-2 pl-10 pr-4 text-sm 
                                        text-slate-900 placeholder-slate-500 transition-colors focus:border-teal-300 
                                        focus:outline-none focus:ring-2 focus:ring-teal-200'
                                />
                            </div>

                            <div className='relative w-full sm:w-auto'>
                                <motion.button
                                    whileHover={{ backgroundColor: "#fef3c7" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className='flex w-full items-center justify-between rounded-lg border border-amber-100 
                                        bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors 
                                        hover:bg-amber-50 sm:w-auto'>
                                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                                    <ChevronDown
                                        size={16}
                                        className={`ml-2 transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                                    />
                                </motion.button>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={
                                        showSortMenu
                                            ? { opacity: 1, scale: 1, y: 0 }
                                            : {
                                                  opacity: 0,
                                                  scale: 0.95,
                                                  y: -10,
                                                  pointerEvents: "none",
                                              }
                                    }
                                    transition={{ duration: 0.15 }}
                                    className={`absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-amber-100 bg-white 
                                        shadow-lg ${showSortMenu ? "block" : "hidden"}`}>
                                    {sortOptions.map((option) => (
                                        <motion.button
                                            key={option.value}
                                            whileHover={{ backgroundColor: "#fef3c7" }}
                                            onClick={() => {
                                                setSortBy(option.value)
                                                setShowSortMenu(false)
                                            }}
                                            className={`block w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg 
                                                last:rounded-b-lg ${
                                                    sortBy === option.value
                                                        ? "bg-teal-50 font-semibold text-teal-600"
                                                        : "text-slate-700"
                                                }`}>
                                            {option.label}
                                        </motion.button>
                                    ))}
                                </motion.div>

                                {/* To close menu when clicking outside */}
                                {showSortMenu && (
                                    <div className='fixed inset-0 z-40' onClick={() => setShowSortMenu(false)} />
                                )}
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                                <AlertCircle size={20} className='text-red-600' />
                                <div>
                                    <p className='font-medium text-red-900'>Error</p>
                                    <p className='text-sm text-red-700'>{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className='ml-auto text-red-600 hover:text-red-700'>
                                    ×
                                </button>
                            </motion.div>
                        )}

                        {/* For project Previewing alert */}
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                <CheckCircle size={20} className='text-blue-600' />
                                <div>
                                    <p className='font-medium text-blue-900'>Project Selected</p>
                                    <p className='text-sm text-blue-700'>
                                        {organizations
                                            .find((org) => org.id === selectedProject.orgId)
                                            ?.projects.find((p) => p.id === selectedProject.projId)?.name ||
                                            "Unknown Project"}{" "}
                                        is ready for review. (Full project view coming in next screen)
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className='ml-auto text-blue-600 hover:text-blue-700'>
                                    ×
                                </button>
                            </motion.div>
                        )}

                        <div className='space-y-6'>
                            {filteredAndSortedOrganizations.length > 0 ? (
                                filteredAndSortedOrganizations.map((organization, index) => (
                                    <motion.div
                                        key={organization.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}>
                                        <OrganizationCard
                                            key={`${organization.id}-${organization.projects.length}`}
                                            organizationId={organization.id}
                                            organizationName={organization.name}
                                            organizationDesc={organization.description}
                                            projects={organization.projects}
                                            members={organization.members}
                                            currentUserId={userName}
                                            memberCount={organization.memberCount}
                                            isStarred={organization.isStarred}
                                            onOpenProject={handleOpenProject}
                                            isLoading={loadingOrgId === organization.id}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className='rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center'>
                                    <div className='flex justify-center mb-4'>
                                        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-200'>
                                            <AlertCircle size={32} className='text-slate-500' />
                                        </div>
                                    </div>
                                    <h3 className='text-lg font-semibold text-slate-900'>No organizations found</h3>
                                    <p className='mt-2 text-slate-600'>
                                        {searchQuery
                                            ? "Try adjusting your search terms"
                                            : "You don't have access to any organizations yet."}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar for those projects that needs urgent attention*/}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className='space-y-6'>
                        <DashboardSidebar
                            needsAttention={needsAttention}
                            recentlyOpenedProjects={recentlyOpenedProjects}
                            organizations={filteredAndSortedOrganizations as any}
                        />
                    </motion.div>
                </div>
            </main>

            <CreateResourceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organizationId={null}
                organizationName={null}
                resourceType='organization'
            />
        </div>
    )
}
