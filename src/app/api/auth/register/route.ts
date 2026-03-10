import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { username, password, name } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ message: "Usuario y contraseña son requeridos" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ message: "El usuario ya existe" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                username,
                passwordHash,
                name: name || username,
                levelTitle: "NPC Base 😐",
                globalXp: 0,
            },
        });

        return NextResponse.json(
            { message: "Usuario creado exitosamente", user: { id: newUser.id, username: newUser.username } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error Registrando Usuario:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}
