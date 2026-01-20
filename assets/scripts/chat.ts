export interface Message {
  role: "user" | "bot";
  content: string;
}

export type Language = "ru" | "kz";

export const translations = {
  ru: {
    title: "Scroll",
    subtitle: "Информационный помощник",
    login: "Вход",
    welcome: "Добро пожаловать!",
    welcomeText: "Задайте вопрос и получите ответ",
    placeholder: "Введите ваш вопрос...",
    footer: "© 2026 Информационный портал полицейского департамента СКО",
  },
  kz: {
    title: "Scroll",
    subtitle: "Ақпараттық көмекші",
    login: "Кіру",
    welcome: "Қош келдіңіз!",
    welcomeText: "Сұрақ қойып, жауап алыңыз",
    placeholder: "Сұрағыңызды енгізіңіз...",
    footer: "© 2026 СКО полиция департаментінің ақпараттық порталы",
  },
};

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storedSessionId = localStorage.getItem('chat_session_id');
  if (storedSessionId) {
    return storedSessionId;
  }
  
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chat_session_id', newSessionId);
  return newSessionId;
}

export async function sendChatMessage(
  message: string,
  language: Language,
  sessionId: string
): Promise<{ response: string }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language, sessionId }),
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }

  return res.json();
}

