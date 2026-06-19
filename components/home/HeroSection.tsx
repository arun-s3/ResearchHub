"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"

interface HeroSectionProps {
    onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
    return (
        <section className='relative overflow-hidden bg-gradient-to-b from-white via-white to-zinc-100/30 py-20 '>
            <div className='absolute inset-0 overflow-hidden'>
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className='absolute top-10 right-10 h-72 w-72 rounded-full bg-teal-600/10 blur-3xl'
                />
            </div>

            <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className='mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-amber-100 
                                px-4 py-2'>
                            <BookOpen size={16} className='text-teal-600' />

                            <span className='text-sm font-medium text-zinc-900'>
                                Built for Research Teams
                            </span>
                        </motion.div>

                        <h1 className='mb-6 text-5xl font-bold leading-tight text-zinc-900 sm:text-6xl'>
                            Collaborative Research{" "}
                            <span className='bg-gradient-to-r from-teal-600 via-teal-600 to-teal-600/70 bg-clip-text text-transparent'>
                                Review, Simplified
                            </span>
                        </h1>

                        <p className='mb-8 max-w-xl text-lg leading-relaxed text-zinc-500'>
                            Import research articles from Excel, organize them into projects, collaborate with
                            reviewers, and track review progress with a modern workflow built for research teams.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className='flex flex-col gap-4 sm:flex-row'>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onGetStarted}
                                className='inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-8 py-4 
                                    font-semibold cursor-pointer text-white transition-colors hover:bg-teal-700'
                            >
                                Get Started
                                <ArrowRight size={20} />
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Hero section image*/}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className='relative h-96 sm:h-full'>
                        <div className='relative flex h-full items-center justify-center overflow-hidden rounded-2xl border 
                            border-zinc-200 bg-gradient-to-br from-teal-600/10 via-teal-600/5 to-transparent'>
                            <motion.div
                                animate={{
                                    opacity: [0.2, 0.5, 0.2],
                                }}
                                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                                className='h-96 w-96 overflow-hidden rounded-full'>
                                <Image src='/home-img.jpg' alt='Research workspace' fill className='object-cover' />
                            </motion.div>{" "}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
