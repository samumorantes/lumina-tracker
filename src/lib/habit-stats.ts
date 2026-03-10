export interface Habit {
    id: string;
    name: string;
    categoryColor: string;
    frequency: 'daily' | 'weekly' | 'specific_days';
    frequencyDays?: number[];
    completedDates: string[];
    createdAt: string;
}

export function calculateStreaks(completedDates: string[]): { currentStreak: number, bestStreak: number } {
    if (!completedDates || completedDates.length === 0) {
        return { currentStreak: 0, bestStreak: 0 };
    }

    const sortedDates = [...new Set(completedDates)]
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompletedDate = new Date(sortedDates[0]);
    lastCompletedDate.setHours(0, 0, 0, 0);

    const diffDaysFromToday = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 3600 * 24));

    if (diffDaysFromToday <= 1) {
        currentStreak = 1;

        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const previous = new Date(sortedDates[i + 1]);
            current.setHours(0, 0, 0, 0);
            previous.setHours(0, 0, 0, 0);

            const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 3600 * 24));

            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                break;
            }
        }
    }

    if (sortedDates.length > 0) {
        bestStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const previous = new Date(sortedDates[i + 1]);
            current.setHours(0, 0, 0, 0);
            previous.setHours(0, 0, 0, 0);

            const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 3600 * 24));

            if (diff === 1) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else if (diff > 1) {
                tempStreak = 1;
            }
        }
    }

    return { currentStreak, bestStreak };
}

export function calculateDailySuccessPercentage(habits: Habit[], targetDate: string): number {
    const targetDateObj = new Date(targetDate);
    const dayOfWeek = targetDateObj.getDay();

    const applicableHabits = habits.filter(habit => {
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'specific_days' && habit.frequencyDays?.includes(dayOfWeek)) return true;
        return false;
    });

    if (applicableHabits.length === 0) return 0;

    const completedCount = applicableHabits.filter(h => h.completedDates.includes(targetDate)).length;

    return Math.round((completedCount / applicableHabits.length) * 100);
}

export function calculateMonthlyGlobalProgress(habits: Habit[], yearMonth: string): number {
    if (habits.length === 0) return 0;

    let totalCompletions = 0;

    habits.forEach(habit => {
        const monthCompletions = habit.completedDates.filter(date => date.startsWith(yearMonth)).length;
        totalCompletions += monthCompletions;
    });

    const daysInMonth = 30;
    const totalPossible = habits.filter(h => h.frequency === 'daily').length * daysInMonth;

    if (totalPossible === 0) return 0;

    const percentage = Math.round((totalCompletions / totalPossible) * 100);
    return Math.min(percentage, 100);
}
