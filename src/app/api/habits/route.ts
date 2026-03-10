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

        const habits = await prisma.habit.findMany({
            where: { userId },
            include: {
                logs: true,
            },
        });

        // Mapear al formato frontend
        const formattedHabits = habits.map((h: any) => ({
            id: h.id,
            name: h.name,
            frequency: h.frequency,
            categoryColor: h.categoryColor,
            createdAt: h.createdAt.toISOString(),
            completedDates: h.logs.map((log: any) => log.dateStr),
        }));

        return NextResponse.json(formattedHabits);
    } catch (error) {
        console.error("Error Obteniendo Hábitos:", error);
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
        const { name, frequency, categoryColor } = await req.json();

        if (!name || !frequency || !categoryColor) {
            return NextResponse.json({ message: "Datos faltantes" }, { status: 400 });
        }

        const newHabit = await prisma.habit.create({
            data: {
                name,
                frequency,
                categoryColor,
                userId,
            },
        });

        return NextResponse.json(
            {
                id: newHabit.id,
                name: newHabit.name,
                frequency: newHabit.frequency,
                categoryColor: newHabit.categoryColor,
                createdAt: newHabit.createdAt.toISOString(),
                completedDates: [],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error Creando Hábito:", error);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
