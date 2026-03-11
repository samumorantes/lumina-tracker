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
        const { id: habitId } = await params;
        const { dateStr, isCompleted } = await req.json();

        // Validar que el hábito pertenece al usuario
        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
        });

        if (!habit || habit.userId !== userId) {
            return NextResponse.json({ message: "Hábito no encontrado" }, { status: 404 });
        }

        if (isCompleted) {
            // Registrar completion date
            await prisma.habitLog.upsert({
                where: {
                    habitId_dateStr: {
                        habitId,
                        dateStr,
                    },
                },
                update: {},
                create: {
                    habitId,
                    dateStr,
                },
            });
        } else {
            // Eliminar completion date
            await prisma.habitLog.deleteMany({
                where: {
                    habitId,
                    dateStr,
                },
            });
        }

        // --- NEW: Sync globalXp for Social View ---
        const totalLogs = await prisma.habitLog.count({
            where: {
                habit: { userId: userId }
            }
        });

        // Determine level based on totalLogs (same logic as getLevelFromXP frontend)
        let levelTitle = "NPC Base 😐";
        if (totalLogs >= 60) levelTitle = "Gigachad Supremo 🚀";
        else if (totalLogs >= 30) levelTitle = "Looksmaxxer Letal 🤫🧏‍♂️";
        else if (totalLogs >= 15) levelTitle = "Chad Respetable 🗿";
        else if (totalLogs >= 5) levelTitle = "Sigma En Proceso 🍷";

        await prisma.user.update({
            where: { id: userId },
            data: { 
                globalXp: totalLogs,
                levelTitle: levelTitle
            }
        });
        // -----------------------------------------

        return NextResponse.json({ message: "Actualizado correctamente" });
    } catch (error) {
        console.error("Error Actualizando Hábito:", error);
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
        const { id: habitId } = await params;

        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
        });

        if (!habit || habit.userId !== userId) {
            return NextResponse.json({ message: "Hábito no encontrado" }, { status: 404 });
        }

        await prisma.habit.delete({
            where: { id: habitId },
        });

        return NextResponse.json({ message: "Borrado correctamente" });
    } catch (error) {
        console.error("Error Borrando Hábito:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
