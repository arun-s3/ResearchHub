"use client"

import { motion } from "framer-motion"

import { TextSearch, Shield, FileSpreadsheet, Users } from "lucide-react"

export function Footer() {
    return (
        <footer className='border-t border-zinc-200 bg-white'>
            <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='space-y-8'>
                    <div className='flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
                        <div className='max-w-md'>
                            <div className='mb-3 flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-[7px] bg-gradient-to-br 
                                    from-teal-500 to-teal-600'
                                >
                                    <TextSearch size={20} className='text-white' />
                                </div>

                                <div>
                                    <h3 className='font-semibold text-zinc-900'>ResearchHub</h3>
                                    <p className='text-xs text-zinc-500'>Collaborative Literature Review Workspace</p>
                                </div>
                            </div>

                            <p className='text-sm leading-relaxed text-zinc-600'>
                                Import, organize and review research articles collaboratively through a modern workflow
                                built for research teams.
                            </p>
                        </div>

                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                            <div className='flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3'>
                                <FileSpreadsheet size={18} className='text-teal-600' />
                                <span className='text-sm font-medium text-zinc-700'>Excel Import</span>
                            </div>

                            <div className='flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3'>
                                <Users size={18} className='text-amber-600' />
                                <span className='text-sm font-medium text-zinc-700'>Team Review</span>
                            </div>

                            <div className='flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3'>
                                <Shield size={18} className='text-indigo-600' />
                                <span className='text-sm font-medium text-zinc-700'>Secure Access</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className='flex flex-col gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center 
                            sm:justify-between'>
                        <p>© 2026 ResearchHub. All rights reserved.</p>

                        <p>Built for systematic literature review workflows.</p>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
