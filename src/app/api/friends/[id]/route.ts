import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { id: friendshipId } = await params;

        // Buscar la solicitud (debe estar en PENDING y el usuario debe ser el receiver)
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship || friendship.receiverId !== userId) {
            return NextResponse.json({ message: "Solicitud no encontrada o no autorizada" }, { status: 404 });
        }

        if (friendship.status === "ACCEPTED") {
            return NextResponse.json({ message: "Ya aceptaste esta solicitud" }, { status: 400 });
        }

        // Aceptar
        await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: "ACCEPTED" },
        });

        return NextResponse.json({ message: "Solicitud aceptada" });
    } catch (error) {
        console.error("Error Aceptando Solicitud:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { id: friendshipId } = await params;

        // Buscar la relación (el usuario debe ser sender o receiver)
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship || (friendship.senderId !== userId && friendship.receiverId !== userId)) {
            return NextResponse.json({ message: "Amistad no encontrada o no autorizada" }, { status: 404 });
        }

        // Borrar (rechazar eliminar amigo)
        await prisma.friendship.delete({
            where: { id: friendshipId },
        });

        return NextResponse.json({ message: "Amistad/Solicitud eliminada" });
    } catch (error) {
        console.error("Error Eliminando Solicitud/Amigo:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
