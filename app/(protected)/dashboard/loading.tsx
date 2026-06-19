
export default function DashboardLoading() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
            <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    
\                    <div className="lg:col-span-2 space-y-8">

                        <div>
                            <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
                            <div className="mt-3 h-5 w-80 animate-pulse rounded bg-slate-200" />

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-lg border border-amber-100 bg-white p-4 shadow-sm"
                                    >
                                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                                        <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Search area */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="h-10 flex-1 animate-pulse rounded-lg bg-white border border-slate-200" />

                            <div className="h-10 w-56 animate-pulse rounded-lg bg-white border border-slate-200" />
                        </div>

                        {/* Organization Cards */}
                        <div className="space-y-6">
                            {[1, 2, 3].map((card) => (
                                <div
                                    key={card}
                                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
                                            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-200" />
                                        </div>

                                        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
                                    </div>

                                    <div className="mt-6 flex gap-2">
                                        {[1, 2, 3].map((avatar) => (
                                            <div
                                                key={avatar}
                                                className="h-8 w-8 animate-pulse rounded-full bg-slate-200"
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {[1, 2].map((project) => (
                                            <div
                                                key={project}
                                                className="rounded-lg border border-slate-100 p-4"
                                            >
                                                <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
                                                <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-200" />
                                                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {[1, 2].map((section) => (
                            <div
                                key={section}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

                                <div className="mt-5 space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item}>
                                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                                            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    )
}