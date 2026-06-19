"use client"

import { motion } from "framer-motion"
import { Upload, FolderOpen, Users, CheckSquare, Search, BarChart3 } from "lucide-react"

const features = [
    {
        id: 1,
        title: "Import Research Articles",
        description:
            "Upload PubMed-style Excel exports and validate records before importing. Detect invalid and duplicate entries automatically.",
        icon: Upload,
    },
    {
        id: 2,
        title: "Organize by Projects",
        description:
            "Group articles into projects and organizations. Keep research efforts structured and easy to navigate.",
        icon: FolderOpen,
    },
    {
        id: 3,
        title: "Collaborative Review Workflow",
        description: "Assign reviewers, track decisions, and manage article screening collaboratively.",
        icon: Users,
    },
    {
        id: 4,
        title: "Review Decisions",
        description:
            "Mark articles as Included, Excluded, Maybe, or Pending. Mark priority levels. Track review progress in real time.",
        icon: CheckSquare,
    },
    {
        id: 5,
        title: "Powerful Filtering",
        description: "Search by title, author, DOI, publication year, priority, or review status.",
        icon: Search,
    },
    {
        id: 6,
        title: "Analytics & Progress",
        description: "Monitor review progress, article distribution and team activity through visual dashboards.",
        icon: BarChart3,
    },
]

export function FeaturesSection() {
    return (
        <section
            id='features'
            className='border-t border-gray-200 bg-gradient-to-t from-amber-50 via-amber-50 via-25% to-white py-20'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-16 text-center'>
                    <h2 className='mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl'>
                        Review Workflow Features
                    </h2>

                    <p className='mx-auto max-w-2xl text-lg text-zinc-500'>
                        Tools designed to support literature review and article screening workflows efficiently and
                        collaboratively.
                    </p>
                </motion.div>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {features.map((feature, index) => {
                        const Icon = feature.icon

                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className='rounded-xl border border-zinc-200 bg-zinc-100 p-8 transition-all 
                                 hover:border-teal-600/50'>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600/10'>
                                    <Icon size={24} className='text-teal-600' />
                                </motion.div>

                                <h3 className='mb-3 text-xl font-semibold text-zinc-900'>
                                    {feature.title}
                                </h3>

                                <p className='leading-relaxed text-zinc-500'>
                                    {feature.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
