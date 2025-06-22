import type { VocabularyLoader, WordEntry } from "./vocabulary-loader"

export interface TokenInfo {
  token: string
  id: number
  wordEntry?: WordEntry
  isKnown: boolean
  subwords?: string[]
}

export class AdvancedTokenizer {
  private vocabularyLoader: VocabularyLoader
  private tokenToId: Map<string, number> = new Map()
  private idToToken: Map<number, string> = new Map()
  private nextId = 0
  private specialTokens = {
    PAD: 0,
    UNK: 1,
    START: 2,
    END: 3,
  }

  constructor(vocabularyLoader: VocabularyLoader) {
    this.vocabularyLoader = vocabularyLoader
    this.initializeSpecialTokens()
  }

  private initializeSpecialTokens(): void {
    const tokens = ["<PAD>", "<UNK>", "<START>", "<END>"]
    tokens.forEach((token, index) => {
      this.tokenToId.set(token, index)
      this.idToToken.set(index, token)
    })
    this.nextId = tokens.length
  }

  public async initialize(): Promise<void> {
    await this.vocabularyLoader.loadVocabulary()
    console.log("Advanced tokenizer initialized with vocabulary")
  }

  public tokenize(text: string): TokenInfo[] {
    const words = this.preprocessText(text)
    const tokens: TokenInfo[] = []

    for (const word of words) {
      const tokenInfo = this.processWord(word)
      tokens.push(tokenInfo)
    }

    return tokens
  }

  private preprocessText(text: string): string[] {
    // Advanced text preprocessing
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, " ") // Keep apostrophes and hyphens
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)
  }

  private processWord(word: string): TokenInfo {
    // Check if word exists in vocabulary
    const wordEntry = this.vocabularyLoader.getWord(word)

    if (wordEntry) {
      // Known word
      const id = this.getOrCreateTokenId(word)
      return {
        token: word,
        id,
        wordEntry,
        isKnown: true,
      }
    }

    // Unknown word - try subword tokenization
    const subwords = this.subwordTokenize(word)
    if (subwords.length > 1) {
      const id = this.getOrCreateTokenId(word)
      return {
        token: word,
        id,
        isKnown: false,
        subwords,
      }
    }

    // Completely unknown
    return {
      token: word,
      id: this.specialTokens.UNK,
      isKnown: false,
    }
  }

  private subwordTokenize(word: string): string[] {
    const subwords: string[] = []
    let remaining = word

    // Try to break down unknown words into known parts
    while (remaining.length > 0) {
      let found = false

      // Try progressively shorter prefixes
      for (let i = Math.min(remaining.length, 8); i >= 2; i--) {
        const prefix = remaining.substring(0, i)
        if (this.vocabularyLoader.getWord(prefix)) {
          subwords.push(prefix)
          remaining = remaining.substring(i)
          found = true
          break
        }
      }

      if (!found) {
        // If no prefix found, take first character and continue
        subwords.push(remaining[0])
        remaining = remaining.substring(1)
      }
    }

    return subwords
  }

  private getOrCreateTokenId(token: string): number {
    if (this.tokenToId.has(token)) {
      return this.tokenToId.get(token)!
    }

    const id = this.nextId++
    this.tokenToId.set(token, id)
    this.idToToken.set(id, token)
    return id
  }

  public encode(text: string, maxLength = 128): number[] {
    const tokens = this.tokenize(text)
    const encoded = [this.specialTokens.START]

    for (const tokenInfo of tokens) {
      if (encoded.length >= maxLength - 1) break

      if (tokenInfo.subwords && tokenInfo.subwords.length > 1) {
        // Add subword tokens
        for (const subword of tokenInfo.subwords) {
          const subwordEntry = this.vocabularyLoader.getWord(subword)
          if (subwordEntry) {
            encoded.push(this.getOrCreateTokenId(subword))
          } else {
            encoded.push(this.specialTokens.UNK)
          }
          if (encoded.length >= maxLength - 1) break
        }
      } else {
        encoded.push(tokenInfo.id)
      }
    }

    encoded.push(this.specialTokens.END)

    // Pad to maxLength
    while (encoded.length < maxLength) {
      encoded.push(this.specialTokens.PAD)
    }

    return encoded.slice(0, maxLength)
  }

  public decode(tokenIds: number[]): string {
    const tokens = tokenIds
      .filter((id) => id !== this.specialTokens.PAD && id !== this.specialTokens.START && id !== this.specialTokens.END)
      .map((id) => this.idToToken.get(id) || "<UNK>")

    return tokens.join(" ")
  }

  public getTokenInfo(text: string): {
    tokens: TokenInfo[]
    knownWords: number
    unknownWords: number
    totalTokens: number
  } {
    const tokens = this.tokenize(text)
    const knownWords = tokens.filter((t) => t.isKnown).length
    const unknownWords = tokens.filter((t) => !t.isKnown).length

    return {
      tokens,
      knownWords,
      unknownWords,
      totalTokens: tokens.length,
    }
  }

  public getVocabularySize(): number {
    return this.nextId
  }
}
