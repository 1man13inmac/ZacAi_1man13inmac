export interface WordEntry {
  word: string
  definitions: string[]
  partOfSpeech: string[]
  synonyms: string[]
  antonyms: string[]
  frequency: number
  examples: string[]
}

export interface VocabularyData {
  words: Map<string, WordEntry>
  totalWords: number
  lastUpdated: number
}

export class VocabularyLoader {
  private vocabularyData: VocabularyData
  private isLoaded = false

  constructor() {
    this.vocabularyData = {
      words: new Map(),
      totalWords: 0,
      lastUpdated: Date.now(),
    }
  }

  public async loadVocabulary(): Promise<void> {
    if (this.isLoaded) return

    try {
      // Try to load from cache first
      const cached = this.loadFromCache()
      if (cached && cached.totalWords > 100) {
        // Lower threshold for testing
        this.vocabularyData = cached
        this.isLoaded = true
        console.log(`Loaded ${this.vocabularyData.totalWords} words from cache`)
        return
      }

      // Try to load from public JSON file
      console.log("Loading vocabulary from dictionary file...")
      try {
        const response = await fetch("/dictionary.json")
        if (response.ok) {
          const text = await response.text()
          if (text.trim()) {
            const data = JSON.parse(text)
            await this.processVocabularyData(data)
            console.log("Successfully loaded external dictionary")
          } else {
            throw new Error("Empty dictionary file")
          }
        } else {
          throw new Error(`Dictionary file not found: ${response.status}`)
        }
      } catch (fetchError) {
        console.log("External dictionary not available, using built-in vocabulary")
        await this.loadBuiltInVocabulary()
      }

      this.saveToCache()
      this.isLoaded = true
      console.log(`Vocabulary loaded: ${this.vocabularyData.totalWords} words`)
    } catch (error) {
      console.error("Error in loadVocabulary:", error)
      // Ensure we always have some vocabulary
      await this.loadBuiltInVocabulary()
      this.isLoaded = true
      console.log("Fallback vocabulary loaded successfully")
    }
  }

  private async processVocabularyData(data: any): Promise<void> {
    try {
      // Process different dictionary formats with better error handling
      if (Array.isArray(data)) {
        // Array format: [{ word, definition, ... }, ...]
        for (const entry of data) {
          try {
            this.addWordEntry(entry)
          } catch (entryError) {
            console.warn(`Skipping malformed entry:`, entry, entryError)
          }
        }
      } else if (data && typeof data === "object" && data.words) {
        // Object format: { words: [...] }
        if (Array.isArray(data.words)) {
          for (const entry of data.words) {
            try {
              this.addWordEntry(entry)
            } catch (entryError) {
              console.warn(`Skipping malformed entry:`, entry, entryError)
            }
          }
        }
      } else if (data && typeof data === "object") {
        // Key-value format: { "word": { definition, ... }, ... }
        for (const [word, entry] of Object.entries(data)) {
          try {
            this.addWordEntry({ word, ...entry })
          } catch (entryError) {
            console.warn(`Skipping malformed entry for word ${word}:`, entry, entryError)
          }
        }
      } else {
        throw new Error("Unrecognized dictionary format")
      }

      this.vocabularyData.totalWords = this.vocabularyData.words.size
      this.vocabularyData.lastUpdated = Date.now()
    } catch (error) {
      console.error("Error processing vocabulary data:", error)
      throw error
    }
  }

  private addWordEntry(entry: any): void {
    if (!entry || typeof entry !== "object") {
      throw new Error("Invalid entry: not an object")
    }

    const word = entry.word?.toString()?.toLowerCase()?.trim()
    if (!word || word.length === 0) {
      throw new Error("Invalid entry: missing or empty word")
    }

    const wordEntry: WordEntry = {
      word: word,
      definitions: this.normalizeArray(entry.definitions || entry.definition || ["No definition available"]),
      partOfSpeech: this.normalizeArray(entry.partOfSpeech || entry.pos || ["unknown"]),
      synonyms: this.normalizeArray(entry.synonyms || []),
      antonyms: this.normalizeArray(entry.antonyms || []),
      frequency: typeof entry.frequency === "number" && entry.frequency > 0 ? entry.frequency : 1,
      examples: this.normalizeArray(entry.examples || []),
    }

    this.vocabularyData.words.set(wordEntry.word, wordEntry)
  }

  private normalizeArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string" && item.trim().length > 0)
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()]
    }
    return []
  }

  private async loadBuiltInVocabulary(): Promise<void> {
    // Comprehensive built-in vocabulary for bootstrapping
    const builtInWords = [
      // Basic conversation words
      {
        word: "hello",
        definitions: ["A greeting used when meeting someone"],
        partOfSpeech: ["interjection"],
        synonyms: ["hi", "greetings"],
        frequency: 100,
      },
      {
        word: "goodbye",
        definitions: ["A farewell expression"],
        partOfSpeech: ["interjection"],
        synonyms: ["bye", "farewell"],
        frequency: 90,
      },
      {
        word: "please",
        definitions: ["Used to make a polite request"],
        partOfSpeech: ["adverb"],
        synonyms: ["kindly"],
        frequency: 95,
      },
      {
        word: "thank",
        definitions: ["To express gratitude"],
        partOfSpeech: ["verb"],
        synonyms: ["appreciate"],
        frequency: 98,
      },
      {
        word: "sorry",
        definitions: ["An expression of regret or apology"],
        partOfSpeech: ["adjective", "interjection"],
        synonyms: ["apologetic"],
        frequency: 85,
      },

      // Common verbs
      {
        word: "be",
        definitions: ["To exist", "To have the quality of"],
        partOfSpeech: ["verb"],
        synonyms: ["exist"],
        frequency: 100,
      },
      {
        word: "have",
        definitions: ["To possess", "To experience"],
        partOfSpeech: ["verb"],
        synonyms: ["possess", "own"],
        frequency: 100,
      },
      {
        word: "do",
        definitions: ["To perform an action", "To complete"],
        partOfSpeech: ["verb"],
        synonyms: ["perform", "execute"],
        frequency: 100,
      },
      {
        word: "say",
        definitions: ["To speak words", "To express"],
        partOfSpeech: ["verb"],
        synonyms: ["speak", "utter"],
        frequency: 95,
      },
      {
        word: "get",
        definitions: ["To obtain", "To receive"],
        partOfSpeech: ["verb"],
        synonyms: ["obtain", "acquire"],
        frequency: 95,
      },
      {
        word: "make",
        definitions: ["To create", "To cause"],
        partOfSpeech: ["verb"],
        synonyms: ["create", "produce"],
        frequency: 95,
      },
      {
        word: "go",
        definitions: ["To move from one place to another"],
        partOfSpeech: ["verb"],
        synonyms: ["travel", "move"],
        frequency: 95,
      },
      {
        word: "know",
        definitions: ["To be aware of", "To understand"],
        partOfSpeech: ["verb"],
        synonyms: ["understand", "comprehend"],
        frequency: 90,
      },
      {
        word: "take",
        definitions: ["To grasp", "To accept"],
        partOfSpeech: ["verb"],
        synonyms: ["grasp", "seize"],
        frequency: 90,
      },
      {
        word: "see",
        definitions: ["To perceive with eyes", "To understand"],
        partOfSpeech: ["verb"],
        synonyms: ["observe", "view"],
        frequency: 90,
      },

      // Common nouns
      {
        word: "time",
        definitions: ["The indefinite continued progress of existence"],
        partOfSpeech: ["noun"],
        synonyms: ["duration", "period"],
        frequency: 95,
      },
      {
        word: "person",
        definitions: ["An individual human being"],
        partOfSpeech: ["noun"],
        synonyms: ["individual", "human"],
        frequency: 90,
      },
      {
        word: "year",
        definitions: ["A period of 365 days"],
        partOfSpeech: ["noun"],
        synonyms: ["annum"],
        frequency: 85,
      },
      {
        word: "way",
        definitions: ["A method or manner", "A path"],
        partOfSpeech: ["noun"],
        synonyms: ["method", "path"],
        frequency: 85,
      },
      { word: "day", definitions: ["A 24-hour period"], partOfSpeech: ["noun"], synonyms: ["date"], frequency: 90 },
      {
        word: "thing",
        definitions: ["An object or entity"],
        partOfSpeech: ["noun"],
        synonyms: ["object", "item"],
        frequency: 85,
      },
      {
        word: "man",
        definitions: ["An adult male human"],
        partOfSpeech: ["noun"],
        synonyms: ["male", "gentleman"],
        frequency: 80,
      },
      {
        word: "world",
        definitions: ["The earth and all its inhabitants"],
        partOfSpeech: ["noun"],
        synonyms: ["earth", "globe"],
        frequency: 80,
      },
      {
        word: "life",
        definitions: ["The condition of living"],
        partOfSpeech: ["noun"],
        synonyms: ["existence"],
        frequency: 85,
      },
      { word: "hand", definitions: ["The end part of the arm"], partOfSpeech: ["noun"], synonyms: [], frequency: 75 },

      // Common adjectives
      {
        word: "good",
        definitions: ["Having positive qualities"],
        partOfSpeech: ["adjective"],
        synonyms: ["excellent", "fine"],
        antonyms: ["bad"],
        frequency: 95,
      },
      {
        word: "new",
        definitions: ["Recently created or discovered"],
        partOfSpeech: ["adjective"],
        synonyms: ["fresh", "recent"],
        antonyms: ["old"],
        frequency: 90,
      },
      {
        word: "first",
        definitions: ["Coming before all others"],
        partOfSpeech: ["adjective"],
        synonyms: ["initial"],
        antonyms: ["last"],
        frequency: 90,
      },
      {
        word: "last",
        definitions: ["Coming after all others"],
        partOfSpeech: ["adjective"],
        synonyms: ["final"],
        antonyms: ["first"],
        frequency: 85,
      },
      {
        word: "long",
        definitions: ["Having great length"],
        partOfSpeech: ["adjective"],
        synonyms: ["lengthy"],
        antonyms: ["short"],
        frequency: 80,
      },
      {
        word: "great",
        definitions: ["Very good or impressive"],
        partOfSpeech: ["adjective"],
        synonyms: ["excellent", "wonderful"],
        frequency: 85,
      },
      {
        word: "little",
        definitions: ["Small in size"],
        partOfSpeech: ["adjective"],
        synonyms: ["small", "tiny"],
        antonyms: ["big"],
        frequency: 85,
      },
      {
        word: "own",
        definitions: ["Belonging to oneself"],
        partOfSpeech: ["adjective"],
        synonyms: ["personal"],
        frequency: 80,
      },
      {
        word: "other",
        definitions: ["Different from the one mentioned"],
        partOfSpeech: ["adjective"],
        synonyms: ["different", "alternative"],
        frequency: 85,
      },
      {
        word: "old",
        definitions: ["Having lived for a long time"],
        partOfSpeech: ["adjective"],
        synonyms: ["aged", "elderly"],
        antonyms: ["young"],
        frequency: 80,
      },

      // Question words
      {
        word: "what",
        definitions: ["Used to ask for information"],
        partOfSpeech: ["pronoun"],
        synonyms: [],
        frequency: 95,
      },
      {
        word: "who",
        definitions: ["Used to ask about a person"],
        partOfSpeech: ["pronoun"],
        synonyms: [],
        frequency: 90,
      },
      {
        word: "where",
        definitions: ["Used to ask about location"],
        partOfSpeech: ["adverb"],
        synonyms: [],
        frequency: 90,
      },
      { word: "when", definitions: ["Used to ask about time"], partOfSpeech: ["adverb"], synonyms: [], frequency: 90 },
      { word: "why", definitions: ["Used to ask for a reason"], partOfSpeech: ["adverb"], synonyms: [], frequency: 90 },
      {
        word: "how",
        definitions: ["Used to ask about manner or method"],
        partOfSpeech: ["adverb"],
        synonyms: [],
        frequency: 90,
      },

      // Emotions and feelings
      {
        word: "happy",
        definitions: ["Feeling joy or pleasure"],
        partOfSpeech: ["adjective"],
        synonyms: ["joyful", "glad"],
        antonyms: ["sad"],
        frequency: 80,
      },
      {
        word: "sad",
        definitions: ["Feeling sorrow"],
        partOfSpeech: ["adjective"],
        synonyms: ["sorrowful", "unhappy"],
        antonyms: ["happy"],
        frequency: 75,
      },
      {
        word: "angry",
        definitions: ["Feeling strong displeasure"],
        partOfSpeech: ["adjective"],
        synonyms: ["mad", "furious"],
        frequency: 70,
      },
      {
        word: "love",
        definitions: ["Deep affection", "To feel deep affection"],
        partOfSpeech: ["noun", "verb"],
        synonyms: ["adore", "cherish"],
        antonyms: ["hate"],
        frequency: 85,
      },
      {
        word: "like",
        definitions: ["To find agreeable", "Similar to"],
        partOfSpeech: ["verb", "preposition"],
        synonyms: ["enjoy"],
        antonyms: ["dislike"],
        frequency: 90,
      },
      { word: "want", definitions: ["To desire"], partOfSpeech: ["verb"], synonyms: ["desire", "wish"], frequency: 90 },
      { word: "need", definitions: ["To require"], partOfSpeech: ["verb"], synonyms: ["require"], frequency: 85 },

      // Learning and knowledge
      {
        word: "learn",
        definitions: ["To acquire knowledge"],
        partOfSpeech: ["verb"],
        synonyms: ["study", "master"],
        frequency: 80,
      },
      {
        word: "teach",
        definitions: ["To impart knowledge"],
        partOfSpeech: ["verb"],
        synonyms: ["instruct", "educate"],
        frequency: 75,
      },
      {
        word: "understand",
        definitions: ["To comprehend"],
        partOfSpeech: ["verb"],
        synonyms: ["comprehend", "grasp"],
        frequency: 85,
      },
      {
        word: "think",
        definitions: ["To use one's mind"],
        partOfSpeech: ["verb"],
        synonyms: ["ponder", "consider"],
        frequency: 90,
      },
      {
        word: "remember",
        definitions: ["To recall"],
        partOfSpeech: ["verb"],
        synonyms: ["recall", "recollect"],
        antonyms: ["forget"],
        frequency: 80,
      },
      {
        word: "forget",
        definitions: ["To fail to remember"],
        partOfSpeech: ["verb"],
        synonyms: [],
        antonyms: ["remember"],
        frequency: 75,
      },

      // Technology and AI related
      {
        word: "computer",
        definitions: ["An electronic device for processing data"],
        partOfSpeech: ["noun"],
        synonyms: ["machine"],
        frequency: 70,
      },
      {
        word: "artificial",
        definitions: ["Made by humans, not natural"],
        partOfSpeech: ["adjective"],
        synonyms: ["synthetic"],
        antonyms: ["natural"],
        frequency: 60,
      },
      {
        word: "intelligence",
        definitions: ["The ability to learn and understand"],
        partOfSpeech: ["noun"],
        synonyms: ["intellect"],
        frequency: 65,
      },
      { word: "learn", definitions: ["To gain knowledge"], partOfSpeech: ["verb"], synonyms: ["study"], frequency: 80 },
      {
        word: "chat",
        definitions: ["To talk in a friendly way"],
        partOfSpeech: ["verb", "noun"],
        synonyms: ["converse"],
        frequency: 70,
      },
      {
        word: "conversation",
        definitions: ["A talk between people"],
        partOfSpeech: ["noun"],
        synonyms: ["discussion", "dialogue"],
        frequency: 75,
      },

      // Add more comprehensive vocabulary...
      // Colors
      {
        word: "red",
        definitions: ["The color of blood"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: ["crimson"],
        frequency: 70,
      },
      {
        word: "blue",
        definitions: ["The color of the sky"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: ["azure"],
        frequency: 70,
      },
      {
        word: "green",
        definitions: ["The color of grass"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: [],
        frequency: 70,
      },
      {
        word: "yellow",
        definitions: ["The color of the sun"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: [],
        frequency: 65,
      },
      {
        word: "black",
        definitions: ["The darkest color"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: [],
        antonyms: ["white"],
        frequency: 75,
      },
      {
        word: "white",
        definitions: ["The lightest color"],
        partOfSpeech: ["adjective", "noun"],
        synonyms: [],
        antonyms: ["black"],
        frequency: 75,
      },

      // Numbers
      { word: "one", definitions: ["The number 1"], partOfSpeech: ["number"], synonyms: [], frequency: 95 },
      { word: "two", definitions: ["The number 2"], partOfSpeech: ["number"], synonyms: [], frequency: 90 },
      { word: "three", definitions: ["The number 3"], partOfSpeech: ["number"], synonyms: [], frequency: 85 },
      { word: "four", definitions: ["The number 4"], partOfSpeech: ["number"], synonyms: [], frequency: 80 },
      { word: "five", definitions: ["The number 5"], partOfSpeech: ["number"], synonyms: [], frequency: 80 },

      // Family
      {
        word: "family",
        definitions: ["A group of related people"],
        partOfSpeech: ["noun"],
        synonyms: ["relatives"],
        frequency: 80,
      },
      { word: "mother", definitions: ["A female parent"], partOfSpeech: ["noun"], synonyms: ["mom"], frequency: 75 },
      { word: "father", definitions: ["A male parent"], partOfSpeech: ["noun"], synonyms: ["dad"], frequency: 75 },
      { word: "child", definitions: ["A young human"], partOfSpeech: ["noun"], synonyms: ["kid"], frequency: 80 },
      {
        word: "friend",
        definitions: ["A person you like and trust"],
        partOfSpeech: ["noun"],
        synonyms: ["buddy"],
        frequency: 85,
      },
    ]

    // Process built-in words
    for (const entry of builtInWords) {
      this.addWordEntry(entry)
    }

    this.vocabularyData.totalWords = this.vocabularyData.words.size
  }

  public getWord(word: string): WordEntry | undefined {
    return this.vocabularyData.words.get(word.toLowerCase())
  }

  public addWord(entry: WordEntry): void {
    this.vocabularyData.words.set(entry.word.toLowerCase(), entry)
    this.vocabularyData.totalWords = this.vocabularyData.words.size
    this.saveToCache()
  }

  public searchWords(query: string, limit = 10): WordEntry[] {
    const results: WordEntry[] = []
    const queryLower = query.toLowerCase()

    for (const entry of this.vocabularyData.words.values()) {
      if (entry.word.includes(queryLower) || entry.synonyms.some((syn) => syn.includes(queryLower))) {
        results.push(entry)
        if (results.length >= limit) break
      }
    }

    return results.sort((a, b) => b.frequency - a.frequency)
  }

  public getRandomWords(count = 10): WordEntry[] {
    const words = Array.from(this.vocabularyData.words.values())
    const shuffled = words.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  public getVocabularyStats() {
    return {
      totalWords: this.vocabularyData.totalWords,
      lastUpdated: this.vocabularyData.lastUpdated,
      isLoaded: this.isLoaded,
    }
  }

  private saveToCache(): void {
    try {
      const data = {
        words: Array.from(this.vocabularyData.words.entries()),
        totalWords: this.vocabularyData.totalWords,
        lastUpdated: this.vocabularyData.lastUpdated,
      }
      const jsonString = JSON.stringify(data)
      localStorage.setItem("vocabulary-cache", jsonString)
    } catch (error) {
      console.warn("Failed to save vocabulary to cache:", error)
      // Try to clear some space and retry once
      try {
        localStorage.removeItem("vocabulary-cache")
        localStorage.removeItem("enhanced-ai-conversation")
        const data = {
          words: Array.from(this.vocabularyData.words.entries()),
          totalWords: this.vocabularyData.totalWords,
          lastUpdated: this.vocabularyData.lastUpdated,
        }
        localStorage.setItem("vocabulary-cache", JSON.stringify(data))
        console.log("Successfully saved vocabulary after clearing space")
      } catch (retryError) {
        console.warn("Failed to save vocabulary even after clearing space:", retryError)
      }
    }
  }

  private loadFromCache(): VocabularyData | null {
    try {
      const cached = localStorage.getItem("vocabulary-cache")
      if (cached && cached.trim()) {
        const data = JSON.parse(cached)
        if (data && data.words && Array.isArray(data.words)) {
          return {
            words: new Map(data.words),
            totalWords: data.totalWords || 0,
            lastUpdated: data.lastUpdated || Date.now(),
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load vocabulary from cache, clearing corrupted cache:", error)
      // Clear corrupted cache
      try {
        localStorage.removeItem("vocabulary-cache")
      } catch (clearError) {
        console.warn("Failed to clear corrupted cache:", clearError)
      }
    }
    return null
  }
}
