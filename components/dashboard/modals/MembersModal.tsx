"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, Eye, MessageSquare } from "lucide-react"

interface Member {
    id: string
    name: string
    avatar: string
    role: "owner" | "reviewer" | "viewer"
}

interface MembersModalProps {
    isOpen: boolean
    onClose: () => void
    members: Member[]
    organizationName?: string
}

const roleConfig = {
    owner: {
        label: "Owner",
        icon: Crown,
        color: "bg-amber-100 text-amber-700",
        badge: "bg-amber-500",
    },
    reviewer: {
        label: "Reviewer",
        icon: MessageSquare,
        color: "bg-blue-100 text-blue-700",
        badge: "bg-blue-500",
    },
    viewer: {
        label: "Viewer",
        icon: Eye,
        color: "bg-slate-100 text-slate-700",
        badge: "bg-slate-500",
    },
}

export function MembersModal({ isOpen, onClose, members, organizationName }: MembersModalProps) {
    // To show count of group members by role
    const owner = members.find((m) => m.role === "owner")
    const reviewers = members.filter((m) => m.role === "reviewer")
    const viewers = members.filter((m) => m.role === "viewer")

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 z-40 bg-black/20'
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border
                            border-amber-100 bg-white shadow-xl'>
                        <div className='flex items-center justify-between border-b border-amber-100 px-6 py-4'>
                            <div>
                                <h3 className='text-lg font-bold text-slate-900'>Organization Members</h3>
                                {organizationName && <p className='text-xs text-slate-500'>{organizationName}</p>}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={onClose}
                                className='p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer'>
                                <X size={20} className='text-slate-600' />
                            </motion.button>
                        </div>

                        <div className='p-6 max-h-96 overflow-y-auto space-y-6'>
                            {/* Owner Info */}
                            {owner && (
                                <div>
                                    <h4 className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3'>
                                        Owner
                                    </h4>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className='flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100'>
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold 
                                                text-white ${roleConfig.owner.badge}`}>
                                            {owner.avatar}
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-sm font-semibold text-slate-900'>{owner.name}</p>
                                        </div>
                                        <Crown size={18} className='text-amber-600' />
                                    </motion.div>
                                </div>
                            )}

                            {/* Shows Reviewers Info*/}
                            {reviewers.length > 0 && (
                                <div>
                                    <h4 className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3'>
                                        Reviewers ({reviewers.length})
                                    </h4>
                                    <div className='space-y-2'>
                                        {reviewers.map((member, idx) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border 
                                                    border-slate-200 transition-colors'>
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold 
                                                        text-white ${roleConfig.reviewer.badge}`}>
                                                    {member.avatar}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium text-slate-900'>{member.name}</p>
                                                </div>
                                                <MessageSquare size={16} className='text-blue-600' />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Viewers Infos*/}
                            {viewers.length > 0 && (
                                <div>
                                    <h4 className='text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3'>
                                        Viewers ({viewers.length})
                                    </h4>
                                    <div className='space-y-2'>
                                        {viewers.map((member, idx) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border 
                                                    border-slate-200 transition-colors'>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold 
                                                    text-white ${roleConfig.viewer.badge}`}>
                                                    {member.avatar}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-sm font-medium text-slate-900'>{member.name}</p>
                                                </div>
                                                <Eye size={16} className='text-slate-600' />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
