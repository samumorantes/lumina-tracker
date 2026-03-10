import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "tu_usuario" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Credenciales inválidas");
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                });

                if (!user) {
                    throw new Error("No se encontró el usuario");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) {
                    throw new Error("Contraseña incorrecta");
                }

                return {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                } as any;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "default_super_secret_lumina_key",
};
