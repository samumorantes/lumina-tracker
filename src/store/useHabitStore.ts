import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit } from '../lib/habit-stats';
export type Language = 'es' | 'fr';

export interface Friend {
    id: string;
    name: string;
    xp: number;
    levelTitle: string;
}

interface HabitStore {
    habits: Habit[];
    language: Language;
    userName: string | null;
    friends: Friend[];

    // Gamificación / Perfil
    setUserName: (name: string) => void;
    addFriend: (name: string, xp: number, levelTitle: string) => void;

    // Sincronización Server-Side
    loadHabits: () => Promise<void>;

    // Acciones CRUD
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => Promise<void>;

    // Acciones de progreso
    toggleCompletion: (id: string, dateStr: string) => Promise<void>;

    // App Config
    toggleLanguage: () => void;
}

export const useHabitStore = create<HabitStore>()(
    persist(
        (set, get) => ({
            habits: [],
            language: 'es',
            userName: null,
            friends: [
                { id: 'f1', name: 'PepeElPro', xp: 45, levelTitle: "Chad Dios Griego 🗿" },
                { id: 'f2', name: 'AnaGains', xp: 72, levelTitle: "Gigachad Intergaláctico 🚀" }
            ],

            setUserName: (name) => set({ userName: name }),

            addFriend: (name, xp, levelTitle) => set((state) => ({
                friends: [...state.friends, { id: `fr_${Date.now()}`, name, xp, levelTitle }]
            })),

            loadHabits: async () => {
                try {
                    const res = await fetch('/api/habits');
                    if (res.ok) {
                        const data = await res.json();
                        set({ habits: data });
                    }
                } catch (error) {
                    console.error("Error cargando hábitos globales:", error);
                }
            },

            addHabit: async (newHabitData) => {
                try {
                    // Optimizacion en DB real primero
                    const res = await fetch('/api/habits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newHabitData)
                    });

                    if (res.ok) {
                        const verifiedHabit = await res.json();
                        set((state) => ({
                            habits: [...state.habits, verifiedHabit]
                        }));
                    }
                } catch (error) {
                    console.error("Error guardando hábito en DB:", error);
                }
            },

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map((h) => h.id === id ? { ...h, ...updates } : h)
            })),

            deleteHabit: async (id) => {
                set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })); // Optimistic UI
                try {
                    await fetch(`/api/habits/${id}`, { method: 'DELETE' });
                } catch (error) {
                    console.error("Error eliminando en servidor", error);
                    get().loadHabits(); // Rollback en fallo
                }
            },

            toggleCompletion: async (id, dateStr) => {
                const habit = get().habits.find(h => h.id === id);
                if (!habit) return;

                const isCompleted = habit.completedDates.includes(dateStr);

                // Optimistic Update
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id === id) {
                            return {
                                ...h,
                                completedDates: isCompleted
                                    ? h.completedDates.filter(d => d !== dateStr)
                                    : [...h.completedDates, dateStr]
                            };
                        }
                        return h;
                    })
                }));

                try {
                    await fetch(`/api/habits/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dateStr, isCompleted: !isCompleted })
                    });
                } catch (error) {
                    console.error("Fallback de red, re-sincronizando...", error);
                    get().loadHabits(); // Rollback en fallo
                }
            },

            toggleLanguage: () => set((state) => ({
                language: state.language === 'es' ? 'fr' : 'es'
            }))
        }),
        {
            name: 'habit-storage', // Mantenemos caché persistente en local también
        }
    )
);
