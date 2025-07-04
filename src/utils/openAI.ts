import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = (import.meta.env.GEMINI_API_KEY)
const apiBaseUrl = (import.meta.env.API_BASE_URL)?.trim().replace(/\/$/, '')

const genAI = apiBaseUrl
  ? new GoogleGenerativeAI(apiKey, apiBaseUrl)
  : new GoogleGenerativeAI(apiKey)

export const startChatAndSendMessageStream = async(history: ChatMessage[], newMessage: string) => {
  const model = genAI.getGenerativeModel({
  model: "learnlm-2.0-flash-experimental",
  systemInstruction: "-Nama kamu adalah FBot.\n-kamu merupakan AI yang berbasis dari gemini.\n-Menggunakan bahasa Indonesia.\n-kamu bisa menggunakan bahasa gaul.\n-ketika menjelaskan sesuatu bisa dijelaskan sesuai dengan bahasa indonesia yang benar.\n-kamu boleh menjelaskan lebih dari satu paragraf jika itu masih kurang."
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

  const chat = model.startChat({
    generationConfig,
    history: [],
  });

  // Use sendMessageStream for streaming responses
  const result = await chat.sendMessageStream(newMessage)

  const encodedStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of result.stream) {
        const text = await chunk.text()
        const encoded = encoder.encode(text)
        controller.enqueue(encoded)
      }
      controller.close()
    },
  })

  return encodedStream
}
