import { redirect } from "next/navigation"

import { authOptions } from "@/app/lib/auth"
import { getServerSession } from "next-auth"

import { getDashboardOrganizations } from "@/services/dashboard.service"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect("/")
    }

    const organizations = await getDashboardOrganizations( session.user.id )

    return (
        <DashboardClient organizations={organizations as any} />
    )
}