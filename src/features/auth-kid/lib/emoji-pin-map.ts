export interface EmojiPinEntry {
  emoji: string;
  value: string;
}

export const EMOJI_PIN_ENTRIES: EmojiPinEntry[] = [
  { emoji: '😀', value: '0' },
  { emoji: '🎉', value: '1' },
  { emoji: '❤️', value: '2' },
  { emoji: '⭐', value: '3' },
  { emoji: '🌈', value: '4' },
  { emoji: '🔥', value: '5' },
  { emoji: '🎵', value: '6' },
  { emoji: '🌸', value: '7' },
  { emoji: '🍕', value: '8' },
  { emoji: '🎮', value: '9' }
];

export const DIGIT_TO_EMOJI = new Map(EMOJI_PIN_ENTRIES.map((entry) => [entry.value, entry.emoji]));

export const EMOJI_TO_DIGIT = new Map(EMOJI_PIN_ENTRIES.map((entry) => [entry.emoji, entry.value]));
