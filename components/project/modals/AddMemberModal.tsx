"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { X, Search, MessageSquare, Eye } from "lucide-react"

import { toast } from "sonner"

import Portal from "@/components/ui/Portal"

import { searchUsers } from "@/app/actions/user.actions"
import { ProjectRole } from "@prisma/client"
import { assignProjectMember } from "@/app/actions/project.actions"

interface AddMemberModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    orgId: string
    onAddMember?: (userId: string, role: "reviewer" | "viewer") => void
}

interface UserType {
    name: string | null
    id: string
    email: string
    image: string | null
    createdAt: Date
    updatedAt: Date
}

export function AddMemberModal({ isOpen, onClose, orgId, projectId, onAddMember }: AddMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState<UserType[]>([])
    const [selectedRole, setSelectedRole] = useState<"reviewer" | "viewer">("reviewer")
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [addedMembers, setAddedMembers] = useState<Set<string>>(new Set())

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setUsers([])
                return
            }

            const result = await searchUsers(searchQuery, projectId)

            setUsers(result as any)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const getInitials = (name: string | null) => {
        if (!name) return name
        else {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
        }
    }

    const handleAddMember = async (userId: string) => {
        const access = await assignProjectMember({
            orgId,
            projectId,
            userId,
            role: ProjectRole.VIEWER,
        })
        if (!access.success) {
            toast.error(access.message)
        }
        setAddedMembers((prev) => new Set([...prev, userId]))
        onAddMember?.(userId, selectedRole)
        setSelectedUser(null)
        setSearchQuery("")
    }

    const handleClose = () => {
        setSearchQuery("")
        setSelectedUser(null)
        setAddedMembers(new Set())
        onClose()
    }

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className='fixed inset-0 z-200 bg-black/20'
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-900 w-full max-w-md 
                                rounded-xl border border-amber-100 bg-white shadow-xl'
                        >
                            <div className='flex items-center justify-between border-b border-amber-100 px-6 py-4'>
                                <h3 className='text-lg font-bold text-slate-900'>Add Project Member</h3>
                                <motion.button
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    onClick={handleClose}
                                    className='p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer'>
                                    <X size={20} className='text-slate-600' />
                                </motion.button>
                            </div>

                            <div className='p-6 space-y-4'>
                                {/* Search users*/}
                                <div>
                                    <label className='text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2'>
                                        Search User
                                    </label>
                                    <div className='relative'>
                                        <Search size={16} className='absolute left-3 top-3 text-slate-400' />
                                        <input
                                            type='text'
                                            placeholder='Search by name...'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='w-full pl-10 pr-4 py-2 text-[14px] rounded-lg border border-slate-200 
                                                bg-white text-slate-900 placeholder-slate-500 focus:border-teal-500 
                                                focus:outline-none transition-colors'
                                        />
                                    </div>
                                </div>

                                {/* Role Selection- reviwer or viewer */}
                                <div>
                                    <label className='text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2'>
                                        Assign Role
                                    </label>
                                    <div className='flex gap-2'>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedRole("reviewer")}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center 
                                                justify-center gap-2 ${
                                                selectedRole === "reviewer"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                                            } cursor-pointer`}>
                                            <MessageSquare size={16} />
                                            Reviewer
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedRole("viewer")}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center 
                                                justify-center gap-2 ${
                                                selectedRole === "viewer"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                                            } cursor-pointer`}>
                                            <Eye size={16} />
                                            Viewer
                                        </motion.button>
                                    </div>
                                </div>

                                {/* User list */}
                                <div>
                                    <label className='text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2'>
                                        Select User
                                    </label>
                                    <div className='max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50'>
                                        {users.length === 0 ? (
                                            <p className='text-sm text-slate-500 text-center py-4'>
                                                {searchQuery ? "No users found" : "No available users"}
                                            </p>
                                        ) : (
                                            users.map((user) => (
                                                <motion.button
                                                    key={user.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAddMember(user.id)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                        selectedUser === user.id
                                                            ? "bg-teal-100 text-teal-900"
                                                            : "hover:bg-white border border-slate-200"
                                                    } cursor-pointer`}>
                                                    <div
                                                        className={`w-8 h-8 rounded-full ${!user?.image && "bg-teal-500"}  
                                                            flex items-center justify-center text-xs font-semibold text-white`}>
                                                        {user.image ? (
                                                            <img
                                                                alt='user-dp'
                                                                src={user.image}
                                                                className='w-8 h-auto rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            <span className='text-xs font-semibold text-white'>
                                                                {getInitials(user.name)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className='flex-1 text-left'>
                                                        <p className='text-sm font-medium text-slate-900'>
                                                            {user.name}
                                                        </p>
                                                    </div>
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {addedMembers.size > 0 && (
                                    <div>
                                        <p className='text-xs font-semibold text-green-600 mb-2'>
                                            {addedMembers.size} member{addedMembers.size !== 1 ? "s" : ""} added
                                        </p>
                                    </div>
                                )}

                                <div className='flex gap-3 pt-4 border-t border-slate-200'>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleClose}
                                        className='flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 
                                            font-medium hover:bg-slate-100 transition-colors cursor-pointer'
                                    >
                                        Done
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </Portal>
    )
}
