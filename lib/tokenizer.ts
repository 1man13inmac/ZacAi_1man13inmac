export class SimpleTokenizer {
  private vocabulary: Map<string, number> = new Map()
  private reverseVocab: Map<number, string> = new Map()
  private vocabSize = 0

  constructor() {
    this.initializeBasicVocab()
  }

  private initializeBasicVocab(): void {
    // Basic vocabulary with common words and special tokens
    const basicWords = [
      "<PAD>",
      "<UNK>",
      "<START>",
      "<END>",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "must",
      "shall",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "this",
      "that",
      "these",
      "those",
      "what",
      "where",
      "when",
      "why",
      "how",
      "who",
      "which",
    ]

    basicWords.forEach((word, index) => {
      this.vocabulary.set(word, index)
      this.reverseVocab.set(index, word)
    })

    this.vocabSize = basicWords.length
  }

  public tokenize(text: string): number[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0)

    return words.map((word) => {
      if (!this.vocabulary.has(word)) {
        // Add new word to vocabulary
        this.vocabulary.set(word, this.vocabSize)
        this.reverseVocab.set(this.vocabSize, word)
        this.vocabSize++
      }
      return this.vocabulary.get(word)!
    })
  }

  public detokenize(tokens: number[]): string {
    return tokens.map((token) => this.reverseVocab.get(token) || "<UNK>").join(" ")
  }

  public encode(text: string, maxLength = 100): number[] {
    const tokens = this.tokenize(text)
    const encoded = tokens.slice(0, maxLength)

    // Pad to maxLength
    while (encoded.length < maxLength) {
      encoded.push(0) // PAD token
    }

    return encoded
  }

  public getVocabSize(): number {
    return this.vocabSize
  }
}
