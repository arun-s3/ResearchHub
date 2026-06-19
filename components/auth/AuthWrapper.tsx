"use client"

import { SessionProvider } from "next-auth/react"


const AuthWrapper = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>)=> {

    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

export default AuthWrapper