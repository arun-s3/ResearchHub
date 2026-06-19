import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { Toaster } from "sonner"

import AuthWrapper from "@/components/auth/AuthWrapper"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "ResearchHub",
    description: "Article Review Platform",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
            <body className='font-sans antialiased'>
                <AuthWrapper>
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster position='top-right' richColors closeButton />
                </AuthWrapper>
            </body>
        </html>
    )
}
