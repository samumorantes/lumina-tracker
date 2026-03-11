export interface UserContextData {
    userId: string;
    userName: string | null;
    globalMonthlyProgress: number;
    habitsData: {
        habitName: string;
        currentStreak: number;
        bestStreak: number;
        completedDates: string[];
        frequency: string;
    }[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function getHabitCoachChatResponse(
    userDataJSON: UserContextData,
    chatHistory: ChatMessage[],
    languageInstruction: string = ''
): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || "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";

    const systemPrompt = `
    Eres un coach de productividad empático, divertido e interactivo llamado Lumina Coach, entrenado en la ciencia del comportamiento (Atomic Habits). 
    El usuario que estás guiando se llama ${userDataJSON.userName || 'Usuario'}.
    Aquí están sus datos actuales de rendimiento JSON:
    ${JSON.stringify(userDataJSON.habitsData, null, 2)}
    
    Tu objetivo es responder de manera conversacional, amena y corta a lo que el usuario pregunte en el chat.
    Identifica sus problemas basándote EN SUS DATOS (si pregunta por qué falla, mira sus días perdidos).
    Formatea tu respuesta de manera limpia para un chat móvil. Usa formato Markdown, incluye emojis pero sé MUY CONCISO (2-3 párrafos cortos como máximo). ${languageInstruction}
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : "https://habit-tracker.local",
                "X-Title": "Lumina Coach"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...chatHistory
                ],
                temperature: 0.8,
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                return "Error 401: La clave API de OpenRouter configurada es inválida o no tiene fondos. Por favor, actualiza la variable de entorno NEXT_PUBLIC_AI_API_KEY.";
            }
            throw new Error(`Error en la API del Coach: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
           return `Error de IA: ${data.error.message}`;
        }
        
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Coach de Hábitos (IA) falló:", error);
        return "Hubo un problema de conexión con la IA. Revisa la consola o tu API key.";
    }
}
