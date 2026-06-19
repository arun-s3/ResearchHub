"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

import { X } from "lucide-react"
import { toast } from "sonner"

import { createOrganization } from "@/app/actions/organization.actions"
import { createProject } from "@/app/actions/project.actions"

interface CreateResourceModalProps {
    isOpen: boolean
    onClose: () => void
    organizationId: string | null
    organizationName: string | null
    resourceType: "organization" | "project"
}

interface errorObj {
    success: boolean
    message: string
}

export function CreateResourceModal({
    isOpen,
    onClose,
    organizationId,
    organizationName,
    resourceType,
}: CreateResourceModalProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError(`${resourceType} name is required`)
            return
        }

        if (name.trim().length < 3) {
            setError(`${resourceType} name must be at least 3 characters`)
            return
        }

        if (description && description.length > 200) {
            setError(`Description must be under 200 characters`)
            return
        }

        try {
            if (resourceType === "organization") {
                await createOrganization(name, description)
            } else {
                const result = await createProject(organizationId as string, name, description)
                if (!result.success) {
                    toast.error(result.message)
                }
            }
            setName("")
            router.refresh()
            onClose()
        } catch {
            setError("Failed to create organization")
        } finally {
            setIsSubmitting(false)
        }

        setName("")
        setIsSubmitting(false)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 z-50 bg-black/50'
                    />

                    <div className='fixed inset-0 z-500 flex items-center justify-center p-4'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className='w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl'>
                            <div className='flex items-center justify-between border-b border-slate-200 px-6 py-4'>
                                <div>
                                    <h2 className='text-lg capitalize font-semibold text-slate-900'>
                                        {`Create New ${resourceType}`}
                                    </h2>
                                    {resourceType === "project" && (
                                        <p className='text-sm text-slate-600'>{organizationName}</p>
                                    )}
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className='rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 
                                        disabled:opacity-50 cursor-pointer'>
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className='p-6'>
                                <div>
                                    <label className='block text-sm font-medium capitalize text-slate-900'>
                                        {`${resourceType} Name`}
                                    </label>
                                    <input
                                        type='text'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={`Enter ${resourceType} name`}
                                        disabled={isSubmitting}
                                        className='mt-2 w-full text-[14px] rounded-[8px] border border-slate-300 bg-white px-4 py-2.5 
                                            text-slate-900 placeholder-slate-500 transition-colors focus:border-teal-500 
                                            focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 
                                            disabled:text-slate-500'
                                    />
                                </div>

                                <div className='mt-4'>
                                    <label className='block text-sm font-medium capitalize text-slate-900'>
                                        {`Description`}
                                    </label>
                                    <textarea
                                        value={description}
                                        rows={3}
                                        cols={3}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder='Enter description (optional)'
                                        disabled={isSubmitting}
                                        className='mt-2 w-full text-[14px] resize-none rounded-[8px] border border-slate-300 bg-white 
                                            px-4 py-2.5 text-slate-900 placeholder-slate-500 transition-colors focus:border-teal-500 
                                            focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 
                                            disabled:text-slate-500'
                                    />
                                    <span
                                        className={`mt-[7px] text-[12px] ${description.length > 200 ? "text-red-500" : "text-gray-400 "} 
                                            font-medium`}>
                                        {`${description.length}/200`}
                                    </span>
                                </div>

                                {/* Valdation error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='mt-3 rounded-[8px] bg-red-50 p-3'>
                                        <p className='text-sm text-red-600'>{error}</p>
                                    </motion.div>
                                )}

                                <div className='mt-6 flex gap-3'>
                                    <button
                                        type='button'
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className='flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 
                                            transition-colors hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-md'>
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='flex-1 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white transition-colors 
                                            hover:bg-teal-700 disabled:opacity-50 cursor-pointer shadow-md'>
                                        {isSubmitting ? "Creating..." : "Create"}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
