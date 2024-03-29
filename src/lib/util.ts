import Profanity from "../services/profanity.js";

export type FilteredWord = {
  word: string;
  censored: boolean;
}

export const isProfane = (word: string): boolean => {
  const profanity = new Profanity();
  return profanity.isProfane(word);
}

export const censorWord = (word: string): FilteredWord => {
  const profanity = new Profanity();
  if (profanity.isProfane(word)) {
    return {
      word: profanity.censor(word),
      censored: true
    }
  }
  return { word, censored: false};
}
