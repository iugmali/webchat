import wordlist from '../lib/data/bad-words.js';

type Configuration = {
  enabled?: boolean;
  placeHolder?: string;
  replaceRegex?: RegExp;
  separatorRegex?: RegExp;
}

class Profanity {
  private phrase: string;
  private config?: Configuration;
  private censuredPhrase: string = '';
  private readonly wordlist: string[] = wordlist;

  constructor(inputStr: string = '', config?: Configuration) {
    const configDefaults: Configuration = {
      enabled: true,
      placeHolder: '*',
      replaceRegex: /[\w\-À-ž]/g,
      separatorRegex: /[\w\-À-ž]+|[^\w\s]|\s+/g
    };
    this.phrase = inputStr;
    this.config = { ...configDefaults, ...config };
  }

  private scan() {
    const separatorRegex = this.config?.separatorRegex ?? /[\w\-À-ž]+|[^\w\s]|\s+/g;
    this.censuredPhrase = this.phrase
      .match(separatorRegex)
      ?.map((value) => {
        return this.isProfane(value) ? this.censureWord(value) : value;
      })
      .reduce((current, next) => current + next, '') as string;
    return this;
  }

  censureWord(word: string) {
    return word[0] + word.substring(1).replace(this.config?.replaceRegex!, this.config?.placeHolder!);
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
    return this.wordlist.filter((word) => {
      const regex = new RegExp(`\\b${word.replace(/([^\wÀ-ź\-])/, '')}\\b`, 'gi');
      return regex.test(value);
    }).length > 0;
  }
}

export default Profanity;
