import {beforeEach, describe, it, expect} from "vitest";
import Profanity from "./profanity.js";
import badWords from "../lib/data/bad-words.js";

describe("Profanity", () => {
  let profanity: Profanity;
  beforeEach(() => {
    profanity = new Profanity();
  })
  it("should censure a word", () => {
    const word = badWords[Math.floor(Math.random() * badWords.length)];
    const censored = profanity.isProfane(word);
    expect(censored).toBe(true);
    const expectedCensored = '*'.repeat(word.length);
    expect(profanity.censor(word)).toBe(expectedCensored);
  })
  it("should maintain not profane words in a sentence", () => {
    const word = badWords[Math.floor(Math.random() * badWords.length)];
    const phrase = `This is a phrase with a ${word} in it`;
    const expectedCensoredWord = '*'.repeat(word.length);
    const expectedCensoredPhrase = `This is a phrase with a ${expectedCensoredWord} in it`;
    expect(profanity.censor(phrase)).toBe(expectedCensoredPhrase);
  })
})
