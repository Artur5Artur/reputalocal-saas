import { env } from "@/lib/env";

export async function sendTelegramAlert(input: { chatId?: string | null; text: string }) {
  const chatId = input.chatId || env.telegramDefaultChatId;
  if (!env.telegramBotToken || !chatId) {
    console.info("[telegram:simulated]", input.text);
    return false;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: input.text,
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    console.error("Telegram send failed", await response.text());
    return false;
  }

  return true;
}
