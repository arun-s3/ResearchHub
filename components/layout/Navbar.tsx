"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { useSession, signIn, signOut } from "next-auth/react"

import { TextSearch, ChevronDown, LogOut } from "lucide-react"

export function Navbar() {
    const [showMenu, setShowMenu] = useState(false)
    const [showHomeNav, setShowHomeNav] = useState(false)

    const { data: session } = useSession()

    const userInitials =
        session?.user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() ?? ""

    const pathname = usePathname()

    useEffect(() => {
        if (pathname === "/") {
            setShowHomeNav(true)
        } else {
            setShowHomeNav(false)
        }
    }, [pathname])

    const isAuthenticated = !!session

    const userName = session?.user?.name ?? ""
    const userEmail = session?.user?.email ?? ""
    const userDp = session?.user?.image ?? ""

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='sticky top-0 z-50 border-b border-zinc-200 backdrop-blur-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>

                    {/* Logo */}
                    <motion.div whileHover={{ scale: 1.05 }} className='flex items-center gap-2 cursor-pointer'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-[7px] bg-teal-600'>
                            <TextSearch size={20} className='text-white' />
                        </div>

                        <span className='font-bold text-lg text-zinc-900'>ResearchHub</span>
                    </motion.div>

                    {/* Nav links only shown at home page*/}
                    {showHomeNav && (
                        <div className='hidden md:flex items-center gap-8'>
                            <motion.a
                                whileHover={{ color: "#f59e0b" }}
                                href='#features'
                                className='text-sm text-zinc-600 hover:text-amber-500 transition-colors'>
                                Features
                            </motion.a>

                            <motion.a
                                whileHover={{ color: "#f59e0b" }}
                                href='#workflow'
                                className='text-sm text-zinc-600 hover:text-amber-500 transition-colors'>
                                Workflow
                            </motion.a>

                            <motion.a
                                whileHover={{ color: "#f59e0b" }}
                                href='#security'
                                className='text-sm text-zinc-600 hover:text-amber-500 transition-colors'>
                                Security
                            </motion.a>
                        </div>
                    )}

                    {/* Auth Button */}
                    <div className='flex items-center gap-3'>
                        {isAuthenticated ? (
                            <>
                                <div className='relative flex items-center gap-3'>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowMenu(!showMenu)}
                                        className='flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-2 shadow-sm 
                                            transition-colors hover:bg-teal-50 cursor-pointer'
                                        >
                                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br 
                                            from-teal-400 to-teal-600'
                                        >
                                            {userDp ? (
                                                <img
                                                    alt='user-dp'
                                                    src={userDp}
                                                    className='w-8 h-auto rounded-full object-cover'
                                                />
                                            ) : (
                                                <span className='text-xs font-semibold text-white'>{userInitials}</span>
                                            )}
                                        </div>
                                        <div className='hidden text-left sm:flex items-center'>
                                            <p className='text-sm font-medium text-slate-900'>{userName}</p>
                                            <ChevronDown size={15} className='ml-[5px]' />
                                        </div>
                                    </motion.button>

                                    {/* auth menu */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={
                                            showMenu
                                                ? { opacity: 1, scale: 1, y: 0 }
                                                : { opacity: 0, scale: 0.95, y: -10, pointerEvents: "none" }
                                        }
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 top-full mt-2 w-56 rounded-lg border border-teal-100 
                                            bg-white shadow-lg ${showMenu ? "block" : "hidden"
                                        }`}>
                                        <div className='border-b border-teal-100 p-4'>
                                            <p className='text-sm font-semibold text-slate-900'>{userName}</p>
                                            <p className='text-xs text-slate-500'>{userEmail}</p>
                                        </div>
                                        <div>
                                            <motion.button
                                                whileHover={{ backgroundColor: "#fee2e2" }}
                                                onClick={() =>
                                                    signOut({
                                                        callbackUrl: "/",
                                                    })
                                                }
                                                className='flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors 
                                                    cursor-pointer'>
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    {/* Close menu when clicking outside */}
                                    {showMenu && (
                                        <div className='fixed inset-0 z-40' onClick={() => setShowMenu(false)} />
                                    )}
                                </div>
                            </>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => signIn()}
                                className='px-4 py-2 rounded-[7px] bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 
                                    transition-colors cursor-pointer'
                            >
                                Login
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
