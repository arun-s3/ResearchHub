import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"

import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"


export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_ID!,
        //     clientSecret: process.env.GOOGLE_SECRET!,
        // }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: user.email,
                },
            })

            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    },
                })
            }
            return true
        },

        async jwt({ token }) {
            if (!token.email) return token

            const dbUser = await prisma.user.findUnique({
                where: {
                    email: token.email,
                },
            })

            if (dbUser) {
                token.id = dbUser.id
            }

            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }

            return session
        },
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
}
