import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Buscar amistades donde el usuario es remitente o destinatario
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            include: {
                sender: { select: { id: true, username: true, name: true, globalXp: true, levelTitle: true } },
                receiver: { select: { id: true, username: true, name: true, globalXp: true, levelTitle: true } },
            },
        });

        // Formatear para el frontend
        const friends = friendships
            .filter((f: any) => f.status === "ACCEPTED")
            .map((f: any) => {
                const friendUser = f.senderId === userId ? f.receiver : f.sender;
                return {
                    id: f.id, // ID de la amistad
                    userId: friendUser.id,
                    username: friendUser.username,
                    name: friendUser.name,
                    xp: friendUser.globalXp,
                    levelTitle: friendUser.levelTitle,
                };
            });

        const pendingRequests = friendships
            .filter((f: any) => f.status === "PENDING" && f.receiverId === userId)
            .map((f: any) => ({
                id: f.id,
                senderId: f.sender.id,
                username: f.sender.username,
                name: f.sender.name,
            }));

        return NextResponse.json({ friends, pendingRequests });
    } catch (error) {
        console.error("Error Obteniendo Amigos:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { targetUsername } = await req.json();

        if (!targetUsername) {
            return NextResponse.json({ message: "Nombre de usuario objetivo no proporcionado" }, { status: 400 });
        }

        if (targetUsername === (session.user as any).username) {
            return NextResponse.json({ message: "No puedes agregarte a ti mismo" }, { status: 400 });
        }

        // Buscar al usuario destino
        const receiver = await prisma.user.findUnique({
            where: { username: targetUsername.toLowerCase() },
        });

        if (!receiver) {
            return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
        }

        // Verificar si ya existe una solicitud o amistad
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: receiver.id },
                    { senderId: receiver.id, receiverId: userId },
                ],
            },
        });

        if (existing) {
            return NextResponse.json({ message: "Ya existe una solicitud o ya son amigos" }, { status: 400 });
        }

        const newFriendship = await prisma.friendship.create({
            data: {
                senderId: userId,
                receiverId: receiver.id,
                status: "PENDING",
            },
        });

        return NextResponse.json({ message: "Solicitud enviada", friendshipId: newFriendship.id }, { status: 201 });
    } catch (error) {
        console.error("Error Enviando Solicitud:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
