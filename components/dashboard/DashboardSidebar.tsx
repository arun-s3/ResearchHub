"use client"

import { motion } from "framer-motion"
import { AlertCircle, Clock, Users } from "lucide-react"

interface ProjectWithOrg {
    id: string
    name: string
    organizationName: string
    pendingCount: number
}

interface Member {
    id: string
    name: string
    avatar: string
    image: string
    isOwner: boolean
}

interface Organization {
    id: string
    name: string
    members: Member[]
}

interface DashboardSidebarProps {
    needsAttention: ProjectWithOrg[]
    recentlyOpenedProjects: ProjectWithOrg[]
    organizations: Organization[]
}

export function DashboardSidebar({ needsAttention, recentlyOpenedProjects, organizations }: DashboardSidebarProps) {
    
    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()

    return (
        <div className='space-y-6'>

            {/* Needs more attention widget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-50'>
                        <AlertCircle size={18} className='text-red-600' />
                    </div>
                    <h3 className='text-sm font-semibold text-slate-900'>Needs More Attention</h3>
                </div>

                <div className='space-y-3'>
                    {needsAttention.length > 0 ? (
                        needsAttention.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className='rounded-lg border border-red-50 bg-red-50 p-3 hover:border-red-100 hover:bg-red-100 
                                    transition-colors cursor-pointer'
                            >
                                <p className='text-xs font-medium text-slate-600'>{project.organizationName}</p>
                                <p className='mt-1 text-sm font-semibold text-slate-900'>{project.name}</p>
                                <div className='mt-2 flex items-center justify-between'>
                                    <span className='text-xs text-red-600 font-medium'>
                                        {project.pendingCount} pending/maybe
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className='text-center py-4'>
                            <p className='text-xs text-slate-500'>All projects caught up!</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Recently opened projects widget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50'>
                        <Clock size={18} className='text-blue-600' />
                    </div>
                    <h3 className='text-sm font-semibold text-slate-900'>Recently Opened</h3>
                </div>

                <div className='space-y-2'>
                    {recentlyOpenedProjects.length > 0 ? (
                        recentlyOpenedProjects.map((project, index) => (
                            <motion.button
                                key={project.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className='w-full rounded-lg border border-slate-100 bg-slate-50 p-3 text-left 
                                    hover:bg-slate-100 transition-colors'
                            >
                                <p className='text-xs font-medium text-slate-600'>{project.organizationName}</p>
                                <p className='mt-1 text-sm font-medium text-slate-900 truncate'>{project.name}</p>
                            </motion.button>
                        ))
                    ) : (
                        <div className='text-center py-4'>
                            <p className='text-xs text-slate-500'>No recently opened projects</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Organization Members */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50'>
                        <Users size={18} className='text-teal-600' />
                    </div>
                    <h3 className='text-sm font-semibold text-slate-900'>Members</h3>
                </div>

                <div className='space-y-3'>
                    {organizations.length > 0 ? (
                        organizations.map((org) => (
                            <div key={org.id} className='border-b border-amber-50 pb-3 last:border-0 last:pb-0'>
                                <p className='text-xs font-medium text-slate-600 mb-2'>{org.name}</p>
                                <div className='flex items-center gap-2'>
                                    {org.members.slice(0, 4).map((member, idx) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className='relative group'>
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full 
                                                ${!member?.image && 'bg-gradient-to-br from-teal-400 to-teal-600'} 
                                                border-2 border-white shadow-sm`}
                                            >
                                                {member.image ? (
                                                    <img
                                                        alt={getInitials(member.name)}
                                                        src={member.image}
                                                        className='w-8 h-auto rounded-full object-cover'
                                                    />
                                                ) : (
                                                    getInitials(member.name)
                                                )}
                                            </div>
                                            {member.isOwner && (
                                                <div className='absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-amber-400 border 
                                                    border-white' />
                                            )}
                                            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block 
                                                bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50'
                                            >
                                                {member.name}
                                                {member.isOwner && " (Owner)"}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {org.members.length > 4 && (
                                        <div className='text-xs font-medium text-slate-500'>
                                            +{org.members.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-4'>
                            <p className='text-xs text-slate-500'>No members</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
