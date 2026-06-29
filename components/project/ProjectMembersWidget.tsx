"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { useSession } from "next-auth/react"

import { toast } from "sonner"
import { Crown, Eye, MessageSquare } from "lucide-react"

import { AddMemberModal } from "./modals/AddMemberModal"

interface Member {
    id: string
    name: string | null
    image: string | null
    avatar: string
    role: "owner" | "reviewer" | "viewer"
}

interface ProjectMembersWidgetProps {
    orgId: string
    projectId: string
    members: Member[]
    projectName?: string
}

export function ProjectMembersWidget({ orgId, projectId, members, projectName }: ProjectMembersWidgetProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const { data: session } = useSession()

    // Group members by role
    const owner = members.find((m) => m.role === "owner")
    const reviewers = members.filter((m) => m.role === "reviewer" && m.id !== owner?.id)
    const viewers = members.filter((m) => m.role === "viewer")

    const isOwner = owner?.id === session?.user.id

    const handleAddNewMember = () => {
        if (!isOwner) {
            toast.error("Sorry, only the owner of this project can add new members.")
            return
        }
        setIsAddModalOpen(true)
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-lg border border-amber-100 bg-white p-4 shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold text-slate-900'>Project Members</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewMember}
                        className='px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 
                            transition-colors cursor-pointer'>
                        + Add Member
                    </motion.button>
                </div>

                {/* Shows owner */}
                {owner && (
                    <div className='mb-4'>
                        <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2'>Owner</p>
                        <div className='flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100'>
                            <div
                                className={`w-8 h-8 rounded-full ${!owner?.image && "bg-amber-500"} flex items-center justify-center 
                                    text-xs font-semibold text-white`}>
                                {owner?.image ? (
                                    <img
                                        alt='user-dp'
                                        src={owner.image}
                                        className='w-8 h-auto rounded-full object-cover'
                                    />
                                ) : (
                                    <span className='text-xs font-semibold text-white'>{owner?.avatar}</span>
                                )}
                            </div>
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-slate-900'>{owner.name}</p>
                                <p className='text-xs text-slate-600'>Owner</p>
                            </div>
                            <Crown size={16} className='text-amber-600' />
                        </div>
                    </div>
                )}

                {/* Shows reviewers */}
                {reviewers.length > 0 && (
                    <div className='mb-4'>
                        <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2'>
                            Reviewers ({reviewers.length})
                        </p>
                        <div className='space-y-2'>
                            {reviewers.map((member) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className='flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 
                                        transition-colors'>
                                    <div
                                        className={`w-8 h-8 rounded-full ${!member?.image && "bg-blue-500"} flex items-center 
                                            justify-center text-xs font-semibold text-white`}>
                                        {member?.image ? (
                                            <img
                                                alt='user-dp'
                                                src={member.image}
                                                className='w-8 h-auto rounded-full object-cover'
                                            />
                                        ) : (
                                            <span className='text-xs font-semibold text-white'>{member?.avatar}</span>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium text-slate-900'>{member.name}</p>
                                        <p className='text-xs text-slate-600'>Reviewer</p>
                                    </div>
                                    <MessageSquare size={16} className='text-blue-600' />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shows viewers */}
                {viewers.length > 0 && (
                    <div>
                        <p className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2'>
                            Viewers ({viewers.length})
                        </p>
                        <div className='space-y-2'>
                            {viewers.map((member) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className='flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 
                                        transition-colors'>
                                    <div
                                        className={`w-8 h-8 rounded-full ${!member?.image && "bg-slate-500"} flex items-center 
                                            justify-center text-xs font-semibold text-white`}>
                                        {member?.image ? (
                                            <img
                                                alt='user-dp'
                                                src={member.image}
                                                className='w-8 h-auto rounded-full object-cover'
                                            />
                                        ) : (
                                            <span className='text-xs font-semibold text-white'>{member?.avatar}</span>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium text-slate-900'>{member.name}</p>
                                        <p className='text-xs text-slate-600'>Viewer</p>
                                    </div>
                                    <Eye size={16} className='text-slate-600' />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            <AddMemberModal
                orgId={orgId}
                projectId={projectId}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </>
    )
}
