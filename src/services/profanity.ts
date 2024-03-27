import wordlist from '../lib/data/bad-words.js';

type Configuration = {
  level?: number;
  enabled?: boolean;
  placeHolder?: string;
  replaceRegex?: RegExp;
  separatorRegex?: RegExp;
  excludeWords?: string[];
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
      replaceRegex: /[\wÀ-ž]/g,
      separatorRegex: /[\w\-ÁÃÍÓAÂÊáíúóãàâê]+|[^\w\s]|\s+/g,
      excludeWords: []
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
    const separatorRegex = this.config?.separatorRegex ?? /[\w\-ÁÃÍÓAÂÊáíúóãàâê]+|[^\w\s]|\s+/g;
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
      const regex = new RegExp(`\\b${word.replace(/(\W)/g, '\\$1')}\\b`, 'gi');
      return !this.config?.excludeWords?.includes(word.toLowerCase()) && regex.test(value);
    }).length > 0;
  }
}

export default Profanity;
