"use client"

import { motion } from "framer-motion"
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Calendar } from "lucide-react"
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

interface Article {
    id: string
    title: string
    firstAuthor: string
    journal: string
    publicationYear: number
    doi: string
    status: "pending" | "included" | "excluded" | "maybe"
    priority: "high" | "medium" | "low"
    updatedAt: Date
    pmid?: string
    authors?: string
    citation?: string
    createDate?: Date | null
    pmcid?: string | null
    nimsId?: string | null
    reviewerNotes?: string | null
    decisionReason?: string | null
}

interface OverviewTabProps {
    stats: {
        totalArticles: number
        totalIncluded: number
        totalExcluded: number
        totalPending: number
        reviewedCount: number
        progressPercentage: number
    }
    articles: Article[]
}

const COLORS = {
    included: "#10b981",
    excluded: "#ef4444",
    pending: "#f59e0b",
    maybe: "#3b82f6",
    high: "#dc2626",
    medium: "#f97316",
    low: "#84cc16",
}

export function ProjectOverviewTab({ stats, articles }: OverviewTabProps) {
    const reviewStatusData = [
        {
            name: "Included",
            value: stats.totalIncluded,
            color: COLORS.included,
        },
        {
            name: "Excluded",
            value: stats.totalExcluded,
            color: COLORS.excluded,
        },
        {
            name: "Pending",
            value: articles.filter((a) => a.status === "pending").length,
            color: COLORS.pending,
        },
        {
            name: "Maybe",
            value: articles.filter((a) => a.status === "maybe").length,
            color: COLORS.maybe,
        },
    ]

    const yearData = articles.reduce(
        (acc, article) => {
            const existing = acc.find((d) => d.year === article.publicationYear)
            if (existing) {
                existing.count += 1
            } else {
                acc.push({ year: article.publicationYear, count: 1 })
            }
            return acc
        },
        [] as { year: number; count: number }[],
    )
    yearData.sort((a, b) => a.year - b.year)

    const priorityData = [
        {
            name: "High",
            value: articles.filter((a) => a.priority === "high").length,
            color: COLORS.high,
        },
        {
            name: "Medium",
            value: articles.filter((a) => a.priority === "medium").length,
            color: COLORS.medium,
        },
        {
            name: "Low",
            value: articles.filter((a) => a.priority === "low").length,
            color: COLORS.low,
        },
    ]

    // To get last review date
    const lastReviewDate = articles
        .filter((a) => a.status !== "pending")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

    const lastReviewText = lastReviewDate
        ? new Date(lastReviewDate.updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "No reviews yet"

    // All Count stats reviewed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reviewedToday = articles.filter((a) => {
        const reviewDate = new Date(a.updatedAt)
        reviewDate.setHours(0, 0, 0, 0)
        return reviewDate.getTime() === today.getTime() && a.status !== "pending"
    }).length

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    }

    return (
        <motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-6'>
            {/* Stats cards project related stats*/}
            <motion.div variants={itemVariants} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                <div className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <p className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Total Articles</p>
                            <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.totalArticles}</p>
                            <p className='mt-1 text-xs text-slate-500'>for review</p>
                        </div>
                        <div className='rounded-lg bg-blue-100 p-3'>
                            <FileText size={20} className='text-blue-600' />
                        </div>
                    </div>
                </div>

                <div className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <p className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Total Included</p>
                            <p className='mt-2 text-3xl font-bold text-green-600'>{stats.totalIncluded}</p>
                            <p className='mt-1 text-xs text-slate-500'>selected</p>
                        </div>
                        <div className='rounded-lg bg-green-100 p-3'>
                            <CheckCircle size={20} className='text-green-600' />
                        </div>
                    </div>
                </div>

                <div className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <p className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Total Excluded</p>
                            <p className='mt-2 text-3xl font-bold text-red-600'>{stats.totalExcluded}</p>
                            <p className='mt-1 text-xs text-slate-500'>rejected</p>
                        </div>
                        <div className='rounded-lg bg-red-100 p-3'>
                            <XCircle size={20} className='text-red-600' />
                        </div>
                    </div>
                </div>

                <div className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <p className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Total Pending</p>
                            <p className='mt-2 text-3xl font-bold text-amber-600'>{stats.totalPending}</p>
                            <p className='mt-1 text-xs text-slate-500'>waiting</p>
                        </div>
                        <div className='rounded-lg bg-amber-100 p-3'>
                            <Clock size={20} className='text-amber-600' />
                        </div>
                    </div>
                </div>

                <div className='rounded-xl border border-amber-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <p className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Progress</p>
                            <p className='mt-2 text-3xl font-bold text-teal-600'>{stats.progressPercentage}%</p>
                            <p className='mt-1 text-xs text-slate-500'>reviewed</p>
                        </div>
                        <div className='rounded-lg bg-teal-100 p-3'>
                            <TrendingUp size={20} className='text-teal-600' />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Progress bar & Info */}
            <motion.div variants={itemVariants} className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm'>
                <div className='space-y-4'>
                    <div>
                        <div className='flex items-center justify-between mb-2'>
                            <p className='text-sm font-bold text-slate-900'>Review Progress</p>
                            <p className='text-sm font-bold text-teal-600'>
                                {stats.reviewedCount} / {stats.totalArticles}
                            </p>
                        </div>
                        <div className='h-3 w-full rounded-full bg-slate-200 overflow-hidden'>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className='h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-lg bg-amber-100 p-3'>
                                <Calendar size={18} className='text-amber-600' />
                            </div>
                            <div>
                                <p className='text-xs text-slate-600'>Articles Reviewed Today</p>
                                <p className='text-xl font-bold text-slate-900'>{reviewedToday}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-lg bg-blue-100 p-3'>
                                <Clock size={18} className='text-blue-600' />
                            </div>
                            <div>
                                <p className='text-xs text-slate-600'>Last Review</p>
                                <p className='text-sm font-bold text-slate-900'>{lastReviewText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Review status bar chart */}
                <div className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm'>
                    <h3 className='text-sm font-semibold text-slate-900 mb-4'>Review Status Distribution</h3>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={reviewStatusData}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f3e8d4' />
                            <XAxis
                                dataKey='name'
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #fef3c7",
                                    backgroundColor: "#fffbf0",
                                }}
                                cursor={{ fill: "rgba(15, 118, 110, 0.1)" }}
                            />
                            <Bar dataKey='value' radius={[8, 8, 0, 0]} fill='#0f766e'>
                                {reviewStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority distribution pie chart */}
                <div className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm'>
                    <h3 className='text-sm font-semibold text-slate-900 mb-4'>Priority Distribution</h3>
                    <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill='#8884d8'
                                dataKey='value'>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #fef3c7",
                                    backgroundColor: "#fffbf0",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Publication year area chart */}
            <motion.div variants={itemVariants} className='rounded-xl border border-amber-100 bg-white p-6 shadow-sm'>
                <h3 className='text-sm font-semibold text-slate-900 mb-4'>Publication Year Distribution</h3>
                <ResponsiveContainer width='100%' height={300}>
                    <AreaChart data={yearData}>
                        <defs>
                            <linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#0f766e' stopOpacity={0.8} />
                                <stop offset='95%' stopColor='#0f766e' stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f3e8d4' />
                        <XAxis
                            dataKey='year'
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #fef3c7",
                                backgroundColor: "#fffbf0",
                            }}
                            cursor={{ fill: "rgba(15, 118, 110, 0.1)" }}
                        />
                        <Area
                            type='monotone'
                            dataKey='count'
                            stroke='#0f766e'
                            strokeWidth={2}
                            fillOpacity={1}
                            fill='url(#colorCount)'
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    )
}
