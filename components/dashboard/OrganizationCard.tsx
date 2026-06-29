"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { Plus, Building2, Star } from "lucide-react"

import { ProjectCard } from "./ProjectCard"
import { CreateResourceModal } from "../shared/CreateResourceModal"
import { MembersDisplay } from "../shared/MembersDisplay"
import { MembersModal } from "./modals/MembersModal"

import { toggleOrganizationStar } from "@/app/actions/organization.actions"

import { useSession } from "next-auth/react"
import { toast } from "sonner"


interface Member {
    id: string
    name: string
    avatar: string
    image: string
    role: "owner" | "reviewer" | "viewer"
}

interface Project {
    id: string
    name: string
    totalArticles: number
    reviewedArticles: number
    members?: Member[]
}

interface OrganizationCardProps {
    organizationId: string
    organizationName: string
    organizationDesc: string
    projects: Project[]
    members?: Member[]
    memberCount?: number
    isStarred?: boolean
    onOpenProject: (projectId: string) => void
    isLoading?: boolean
}

export function OrganizationCard({
    organizationId,
    organizationName,
    organizationDesc,
    projects,
    members = [],
    memberCount = 0,
    isStarred = false,
    onOpenProject,
    isLoading = false,
}: OrganizationCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [starred, setStarred] = useState(isStarred)
    const [showMembersModal, setShowMembersModal] = useState(false)

    const { data: session } = useSession()

    const isOrgOwner = members.some((m) => m.id === session?.user.id && m.role.toLowerCase() === "owner")

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const handleToggleStar = async() => {
        const result = await toggleOrganizationStar({ organizationId })

        if (!result.success) {
            toast.error(result.message)
            return
        }

        setStarred(!starred)
    }

    const handleCreateProject = ()=> {
        if (!isOrgOwner) {
            toast.error("You don't have permissions to create any project under this organization!")
            return
        }
        setIsModalOpen(true)
    }


    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow'>

                <div className='mb-6 flex items-center justify-between'>
                    <div className='flex items-center gap-3 flex-1'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 
                            to-teal-50'>
                            <Building2 size={20} className='text-teal-600' />
                        </div>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-lg font-bold text-slate-900'>{organizationName}</h2>
                                {isOrgOwner && (
                                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 
                                        text-amber-700 text-xs font-semibold'
                                    >
                                        Owner
                                    </span>
                                )}
                            </div>
                            {memberCount > 0 && (
                                <p className='text-xs text-slate-500'>
                                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggleStar}
                            className='p-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer'>
                            <Star size={20} className={starred ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreateProject}
                            disabled={isLoading}
                            className='flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white 
                                transition-colors hover:bg-teal-700 disabled:opacity-50 shadow-md cursor-pointer'>
                            <Plus size={16} />
                            <span className='hidden sm:inline'>Create Project</span>
                            <span className='sm:hidden'>New</span>
                        </motion.button>
                    </div>
                </div>

                {/* Shows team members */}
                {members.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4'>
                        <div className='flex items-center justify-between mb-3'>
                            <h3 className='text-sm font-semibold text-slate-900'>Team Members</h3>
                            {members.length > 4 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowMembersModal(true)}
                                    className='text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors'>
                                    View all
                                </motion.button>
                            )}
                        </div>
                        <MembersDisplay
                            members={members}
                            maxVisible={4}
                            onViewMore={() => setShowMembersModal(true)}
                            compact={true}
                        />
                    </motion.div>
                )}

                {isLoading ? (
                    <div className='grid gap-4 sm:grid-cols-2'>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className='h-64 animate-pulse rounded-lg bg-slate-200'
                            />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className='rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-12 text-center'>
                        <div className='flex justify-center mb-3'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-200'>
                                <Building2 size={24} className='text-slate-500' />
                            </div>
                        </div>
                        <h3 className='font-semibold text-slate-900'>No projects yet</h3>
                        <p className='mt-1 text-sm text-slate-600'>
                            Create your first project to get started with article reviews.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreateProject}
                            className='mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white 
                                transition-colors hover:bg-blue-700 cursor-pointer shadow-md'>
                            <Plus size={16} />
                            Create First Project
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial='hidden'
                        animate='show'
                        className='grid gap-4 sm:grid-cols-2'>
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.3 },
                                    },
                                }}>
                                <ProjectCard
                                    projectId={project.id}
                                    projectName={project.name}
                                    totalArticles={project.totalArticles}
                                    reviewedArticles={project.reviewedArticles}
                                    members={project.members}
                                    onOpenClick={() => onOpenProject(project.id)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <p className="mt-4 ml-[6px] text-[13px] text-gray-400 pl-[7px] border-l-3 border-teal-600">{organizationDesc}</p>

            </motion.div>

            <MembersModal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                members={members}
                organizationName={organizationName}
            />

            {/* To create new organization or new project under an organization */}
            <CreateResourceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organizationId={organizationId}
                organizationName={organizationName}
                resourceType='project'
            />
        </>
    )
}
