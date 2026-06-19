"use client"

import { motion } from "framer-motion"
import { Lock, Eye, Shield } from "lucide-react"

const securityFeatures = [
    {
        id: 1,
        title: "Role-Based Access Control",
        description:
            "Owners, reviewers and viewers only see the projects they are assigned to. Granular permissions ensure data security.",
        icon: Lock,
    },
    {
        id: 2,
        title: "Project-Level Visibility",
        description:
            "Articles remain accessible only to authorized project members. Your research data stays protected.",
        icon: Eye,
    },
    {
        id: 3,
        title: "Secure Authentication",
        description:
            "Authentication powered through modern OAuth providers. Enterprise-grade security for your peace of mind.",
        icon: Shield,
    },
]

export function SecuritySection() {
    return (
        <section id='security' className='relative py-20 sm:pt-10 sm:pb-28 bg-background overflow-hidden'>
            {/* For bg glow */}
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)_0%,transparent_70%)] opacity-[0.025]' />

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='text-center mb-16'>
                    <h2 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6'>
                        Security & Trust
                    </h2>

                    <p className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                        Your research data is protected with enterprise-grade security
                    </p>
                </motion.div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {securityFeatures.map((feature, index) => {
                        const Icon = feature.icon

                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                                whileHover={{
                                    y: -6,
                                }}
                                className='group rounded-2xl bg-amber-50 backdrop-blur-sm p-8 transition-all duration-300 
                                    hover:border-primary/30 hover:shadow-lg'>
                                <motion.div
                                    whileHover={{
                                        scale: 1.08,
                                        rotate: 5,
                                    }}
                                    className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600/10'>
                                    <Icon size={28} className='text-teal-600' />
                                </motion.div>

                                <h3 className='text-xl font-semibold text-foreground mb-3'>{feature.title}</h3>

                                <p className='text-[#746e6e] leading-relaxed'>{feature.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
