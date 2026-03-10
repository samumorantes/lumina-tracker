// Definición de las cadenas de texto (Diccionarios)
export const dictionaries = {
    es: {
        dashboard: {
            title: "Progreso de un vistazo",
            subtitle: "Sigue construyendo tu mejor versión hoy. ✨",
            noHabits: "No tienes hábitos configurados.",
            completedTitle: "Marcar como completado",
            streakDays: "días seguidos",
            streakBadge: "¡Racha!",
            weeklyTrend: "Tendencia de Éxito Diario (%)",
            productivity: "Productividad",
            globalSuccess: "Éxito Mensual Global",
            monthCurrent: "Mes",
            coachCardTitle: "Tu Coach IA",
            coachCardDesc: "Obtén retroalimentación personalizada de tu progreso con algoritmos avanzados.",
            coachCardBtn: "Ir al Coach",
            welcomeTitle: "¡Hola! ¿Cómo te llamas?",
            welcomeDesc: "Ingresa tu nombre para comenzar a trackear y subir de nivel.",
            welcomeBtn: "Comenzar",
        },
        nav: {
            today: "Hoy",
            stats: "Estadísticas",
            coach: "IA Coach",
            profile: "Perfil",
        },
        coach: {
            title: "Coach Inteligente",
            subtitle: "Análisis de patrones basado en IA.",
            readyTitle: "¿Listo para revisar tus métricas?",
            readyDesc: "Enviaré un reporte de tus rachas semanales y globales a nuestro modelo LLM para encontrar patrones ocultos en tu rutina.",
            btnLoading: "Analizando Patrones...",
            btnGenerate: "Generar Plan de Acción"
        },
        stats: {
            title: "Analíticas por Hábito",
            subtitle: "Desglosa tu consistencia (Modo GitHub).",
            noHabits: "Aún no hay hábitos. Regresa al inicio para agregar algunos.",
            freqDaily: "Objetivo Diario",
            freqWeekly: "Objetivo Semanal",
            currentStreak: "Racha Actual",
            bestStreak: "Mejor Racha",
            totalDays: "Días Totales",
            retention: "Retención",
            calendarTotal: "días marcados en este periodo",
            calendarLess: "Menos",
            calendarMore: "Más",
        }
    },
    fr: {
        dashboard: {
            title: "Vos Progrès en un coup d'œil",
            subtitle: "Continuez à construire votre meilleure version aujourd'hui. ✨",
            noHabits: "Vous n'avez pas configuré d'habitudes.",
            completedTitle: "Marquer comme terminé",
            streakDays: "jours consécutifs",
            streakBadge: "Série!",
            weeklyTrend: "Tendance de Réussite Quotidienne (%)",
            productivity: "Productivité",
            globalSuccess: "Réussite Mensuelle Globale",
            monthCurrent: "Mois",
            coachCardTitle: "Votre Coach IA",
            coachCardDesc: "Obtenez des commentaires personnalisés sur vos progrès avec des algorithmes avancés.",
            coachCardBtn: "Aller au Coach",
            welcomeTitle: "Bonjour! Comment tu t'appelles?",
            welcomeDesc: "Entrez votre nom pour commencer à suivre et monter de niveau.",
            welcomeBtn: "Commencer",
        },
        nav: {
            today: "Auj.",
            stats: "Statistiques",
            coach: "Coach IA",
            profile: "Profil",
        },
        coach: {
            title: "Coach Intelligent",
            subtitle: "Analyse des modèles basée sur l'IA.",
            readyTitle: "Prêt à vérifier vos métriques ?",
            readyDesc: "J'enverrai un rapport de vos séries au LLM pour trouver des modèles cachés dans votre routine.",
            btnLoading: "Analyse des modèles...",
            btnGenerate: "Générer un Plan d'Action"
        },
        stats: {
            title: "Analyses par Habitude",
            subtitle: "Décomposez votre cohérence (Mode GitHub).",
            noHabits: "Pas encore d'habitudes. Retournez à l'accueil pour en ajouter.",
            freqDaily: "Objectif Quotidien",
            freqWeekly: "Objectif Hebdomadaire",
            currentStreak: "Série Actuelle",
            bestStreak: "Meilleure Série",
            totalDays: "Jours Totaux",
            retention: "Rétention",
            calendarTotal: "jours marqués pendant cette période",
            calendarLess: "Moins",
            calendarMore: "Plus",
        }
    }
};

export type Language = 'es' | 'fr';

export function getDictionary(lang: Language) {
    return dictionaries[lang];
}
