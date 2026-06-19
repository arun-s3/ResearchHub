"use client"

import { motion } from "framer-motion"
import { Building2, FolderPlus, Upload, Eye, Users, Download, ArrowRight } from "lucide-react"

const workflowSteps = [
    {
        number: 1,
        title: "Create Organization",
        description: "Set up your organization and invite team members",
        icon: Building2,
    },
    {
        number: 2,
        title: "Create Project",
        description: "Start a new research review project",
        icon: FolderPlus,
    },
    {
        number: 3,
        title: "Import Articles",
        description: "Upload your research articles from Excel",
        icon: Upload,
    },
    {
        number: 4,
        title: "Review & Categorize",
        description: "Evaluate and categorize each article",
        icon: Eye,
    },
    {
        number: 5,
        title: "Collaborate with Team",
        description: "Share decisions and manage workflows together",
        icon: Users,
    },
    {
        number: 6,
        title: "Export Results",
        description: "Download your complete review results",
        icon: Download,
    },
]

interface WorkflowSectionProps {
  onStartReviewing: () => void
}


export function WorkflowSection({ onStartReviewing }: WorkflowSectionProps) {
    return (
        <section id='workflow' className='bg-zinc-100/30 py-10 sm:py-10'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-16 text-center'>
                    <h2 className='mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl'>
                        From Import to Decision
                    </h2>

                    <p className='mx-auto max-w-2xl text-lg text-zinc-500'>
                        From setup to results in just 6 steps
                    </p>
                </motion.div>

                {/* Workflow steps */}
                <div className='relative'>
                    {/* Connecting lines between each step */}
                    <div className='absolute left-0 right-0 top-24 hidden h-1 bg-gradient-to-r from-teal-600/20 
                        via-teal-600/40 to-teal-600/20 lg:block' />

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {workflowSteps.map((step, index) => {
                            const Icon = step.icon

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className='relative'>
                                    {/* Each step card */}
                                    <div className='relative h-full rounded-xl border border-zinc-200 bg-white/50 p-8 backdrop-blur 
                                        transition-all hover:border-teal-600/50'>
                                        {/* Step number badge on card */}
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                            className='absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full
                                                 bg-teal-600 text-lg font-bold text-white shadow-lg'
                                        >
                                            {step.number}
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.15, rotate: -5 }}
                                            className='mt-4 mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-teal-600/10'>
                                            <Icon size={28} className='text-teal-600' />
                                        </motion.div>

                                        <h3 className='mb-2 text-xl font-semibold text-zinc-900'>
                                            {step.title}
                                        </h3>

                                        <p className='text-zinc-500'>{step.description}</p>
                                    </div>

                                    {/* Arrow connector for the steps */}
                                    {index < workflowSteps.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            className='absolute top-24 -right-4 hidden h-1 w-8 bg-gradient-to-r 
                                                from-teal-600/60 to-transparent lg:block'
                                        />
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="relative mt-12 bg-amber-50 overflow-hidden py-20 sm:py-20 border-t border-zinc-200">
                {/* bg glow */}
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.03]' />

                <div className='absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />

                <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='text-center'>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6'>
                            Ready to Organize Your Next Literature Review?
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className='text-lg sm:text-xl text-[#75797f] leading-relaxed mb-10 max-w-2xl mx-auto'>
                            Create projects, collaborate with your team, and manage research reviews from one powerful
                            workspace.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}>
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onStartReviewing}
                                className='inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-teal-600 
                                    cursor-pointer text-white font-semibold text-lg shadow-lg shadow-primary/20 transition-all 
                                    duration-300 hover:shadow-xl hover:shadow-primary/30'
                            >
                                Start Reviewing
                                <ArrowRight size={22} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
