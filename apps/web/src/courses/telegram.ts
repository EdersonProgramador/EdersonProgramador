export type TelegramConfig = {
  enabled: boolean;
  baseUrl: string;
  startMessageId: number;
  sumarioMessageId?: number;
  overrides?: Record<string, number>;
};

export type TelegramLessonRef = {
  order: number;
  id: string;
  slug: string;
};

export function telegramMessageId(
  item: TelegramLessonRef,
  telegram: TelegramConfig,
  messageMap: Record<string, number>
): number {
  const overrides = telegram.overrides ?? {};
  if (overrides[item.slug] != null) return overrides[item.slug];
  if (overrides[item.id] != null) return overrides[item.id];
  if (messageMap[item.id] != null) return messageMap[item.id];
  return telegram.startMessageId + item.order;
}

export function telegramLessonUrl(
  item: TelegramLessonRef,
  telegram: TelegramConfig,
  messageMap: Record<string, number>
): string | null {
  if (!telegram.enabled || !telegram.baseUrl) return null;
  const id = telegramMessageId(item, telegram, messageMap);
  return `${telegram.baseUrl.replace(/\/$/, "")}/${id}`;
}

export function telegramSumarioUrl(telegram: TelegramConfig): string | null {
  if (!telegram.enabled || !telegram.baseUrl || !telegram.sumarioMessageId) return null;
  return `${telegram.baseUrl.replace(/\/$/, "")}/${telegram.sumarioMessageId}`;
}
