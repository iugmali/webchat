import wordlist from '../lib/data/bad-words.js';

type Configuration = {
  level?: number;
  enabled?: boolean;
  placeHolder?: string;
  replaceRegex?: RegExp;
  separatorRegex?: RegExp;
  wordsList?: string[];
}

class Profanity {
  private phrase!: string;
  private config?: Configuration;
  private readonly wordlist?: string[];
  private censuredPhrase: string = '';

  constructor(inputStr: string = '', config?: Configuration) {
    const configDefaults: Configuration = {
      level: 1,
      enabled: true,
      placeHolder: '*',
      replaceRegex: /[\w\-À-ž]/g,
      separatorRegex: /[\w\-À-ž]+|[^\w\s]|\s+/g
    };
    this.phrase = !inputStr || inputStr.length < 1 ? '' : inputStr;
    this.config = { ...configDefaults, ...config };
    this.wordlist = wordlist;
  }

  private scan() {
    if (this.phrase.length < 1) {
      this.censuredPhrase = this.phrase;
      return this;
    }
    const separatorRegex = this.config?.separatorRegex ?? /[\w\-À-ž]+|[^\w\s]|\s+/g;
    this.censuredPhrase = this.phrase
      .match(separatorRegex)
      ?.map((value) => {
        return this.isProfane(value) ? this.censureWord(value) : value;
      })
      .reduce((current, next) => current + next, '');

    return this;
  }

  censureWord(word: any) {
    if (word === undefined) {
      return;
    }
    return word.replace(this.config?.replaceRegex, this.config?.placeHolder);
  }

  censor(str?: string) {
    if (!this.config?.enabled) {
      return this.phrase;
    }
    if (str?.trim()) this.phrase = str;
    this.scan();
    return this.censuredPhrase;
  }

  isProfane(value: string) {
    if (this.wordlist === undefined) {
      return;
    }
    return this.wordlist.filter((word) => {
      const regex = new RegExp(`\\b${word.replace(/([^\wÀ-ź])/, '')}\\b`, 'gi');
      return regex.test(value);
    }).length > 0;
  }
}

export default Profanity;
