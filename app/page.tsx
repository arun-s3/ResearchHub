"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"


import { useSession, signIn } from "next-auth/react"

import { HeroSection } from "@/components/home/HeroSection"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { WorkflowSection } from "@/components/home/WorkflowSection"
import { SecuritySection } from "@/components/home/SecuritySection"

export default function LandingPage({ onAuthenticated }: { onAuthenticated?: () => void }) {

    const { data: session } = useSession()

    useEffect(() => {
        if (session) {
            redirect("/dashboard")
        } 
    }, [session])

    const handleLogin = () => {
        signIn()
    }


    return (
        <div className='min-h-screen bg-background'>
            <HeroSection onGetStarted={handleLogin} />
            <FeaturesSection />
            <WorkflowSection onStartReviewing={handleLogin} />
            <SecuritySection />
        </div>
    )
}
