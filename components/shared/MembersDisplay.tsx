"use client"

import { motion } from "framer-motion"

import { Crown, Eye, MessageSquare } from "lucide-react"

interface Member {
    id: string
    name: string
    avatar: string
    image: string
    role: "owner" | "reviewer" | "viewer"
}

interface MembersDisplayProps {
    members: Member[]
    maxVisible?: number
    onViewMore?: () => void
    showCount?: boolean
    compact?: boolean
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

export function MembersDisplay({
    members,
    maxVisible = 2,
    onViewMore,
    showCount = false,
    compact = false,
}: MembersDisplayProps) {

    const visibleMembers = members.slice(0, maxVisible)
    const hiddenCount = Math.max(0, members.length - maxVisible)

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()

    if (compact) {
        return (
            <div className='flex items-center gap-1'>
                {visibleMembers.map((member) => (
                    <motion.div key={member.id} whileHover={{ scale: 1.2, zIndex: 10 }} className='relative group'>
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white border 
                                border-white ${
                                roleConfig[member.role].badge
                            }`}>
                            {member.image ? (
                                <img
                                    alt='user-dp'
                                    src={member.image}
                                    className='w-8 h-auto rounded-full object-cover'
                                />
                            ) : (
                                getInitials(member.name)
                            )}
                        </div>
                        <div className='absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-slate-900 text-white 
                            text-xs px-2 py-1 rounded whitespace-nowrap'>
                            {member.name}
                            <div className='text-xs opacity-80'>{roleConfig[member.role].label}</div>
                        </div>
                    </motion.div>
                ))}
                {hiddenCount > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={onViewMore}
                        className='w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs 
                            font-semibold hover:bg-slate-400 transition-colors'
                        title={`+${hiddenCount} more`}>
                        +{hiddenCount}
                    </motion.button>
                )}
            </div>
        )
    }

    return (
        <div className='space-y-2'>
            {visibleMembers.map((member) => {
                const Icon = roleConfig[member.role].icon
                return (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className='flex items-center gap-2'>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white 
                                ${roleConfig[member.role].badge}`}>
                            {member.image ? (
                                <img
                                    alt='user-dp'
                                    src={member.image}
                                    className='w-8 h-auto rounded-full object-cover'
                                />
                            ) : (
                                getInitials(member.name)
                            )}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-slate-900 truncate'>{member.name}</p>
                            <p className='text-xs text-slate-500'>{roleConfig[member.role].label}</p>
                        </div>
                        {member.role === "owner" && <Crown size={16} className='text-amber-600 flex-shrink-0' />}
                    </motion.div>
                )
            })}
            {hiddenCount > 0 && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onViewMore}
                    className='w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 
                        hover:bg-slate-50 transition-colors'>
                    +{hiddenCount} more member{hiddenCount !== 1 ? "s" : ""}
                </motion.button>
            )}
            {showCount && (
                <p className='text-xs text-slate-500 text-center pt-2'>
                    Total: {members.length} member{members.length !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    )
}
