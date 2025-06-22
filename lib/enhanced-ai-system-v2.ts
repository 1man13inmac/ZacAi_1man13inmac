import { VocabularyLoader } from "./vocabulary-loader"
import { AdvancedTokenizer } from "./advanced-tokenizer"
import { EnhancedNeuralEngine } from "./enhanced-neural-engine"
import { VocabularySeeder } from "./vocabulary-seeder"
import { PatternMatcher, type MatchResult } from "./pattern-matcher"

export interface EnhancedChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
  reasoning?: string[]
  tokenInfo?: any
  knownWords?: number
  unknownWords?: number
  intent?: string
  followUp?: string
}

export interface EnhancedLearningStats {
  totalInteractions: number
  vocabularySize: number
  knownWordsPercentage: number
  modelVersion: number
  avgConfidence: number
  intentStats: { [intent: string]: number }
  learningProgress: {
    wordsLearned: number
    conversationsHad: number
    feedbackReceived: number
    patternsMatched: number
  }
}

export class EnhancedAISystemV2 {
  private vocabularyLoader: VocabularyLoader
  private tokenizer: AdvancedTokenizer
  private neuralEngine: EnhancedNeuralEngine
  private patternMatcher: PatternMatcher
  private conversationHistory: EnhancedChatMessage[] = []
  private isInitialized = false
  private learningStats = {
    wordsLearned: 0,
    conversationsHad: 0,
    feedbackReceived: 0,
    patternsMatched: 0,
  }

  constructor() {
    this.vocabularyLoader = new VocabularyLoader()
    this.tokenizer = new AdvancedTokenizer(this.vocabularyLoader)
    this.neuralEngine = new EnhancedNeuralEngine(this.vocabularyLoader, this.tokenizer)

    // Initialize pattern matcher with comprehensive patterns
    const patterns = VocabularySeeder.getConversationalPatterns()
    const knowledgeBase = VocabularySeeder.getKnowledgeBase()
    this.patternMatcher = new PatternMatcher(patterns, knowledgeBase)
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("Initializing Enhanced AI System V2...")

    try {
      // Load comprehensive vocabulary
      await this.loadComprehensiveVocabulary()
      console.log("✓ Comprehensive vocabulary loaded")

      await this.tokenizer.initialize()
      console.log("✓ Advanced tokenizer initialized")

      await this.neuralEngine.initialize()
      console.log("✓ Neural engine initialized")

      // Load conversation history (non-critical)
      try {
        this.loadConversationHistory()
        this.loadLearningStats()
        console.log("✓ Previous session data loaded")
      } catch (historyError) {
        console.warn("Could not load previous session data:", historyError)
        this.clearCorruptedData()
      }

      this.isInitialized = true
      console.log("✅ Enhanced AI System V2 initialized successfully!")
      console.log(`📚 Vocabulary size: ${this.vocabularyLoader.getVocabularyStats().totalWords}`)
      console.log(`🎯 Conversation patterns: ${Object.keys(this.patternMatcher.getIntentStats()).length}`)
    } catch (error) {
      console.error("❌ Failed to initialize Enhanced AI System V2:", error)
      throw new Error("Failed to initialize AI system. Please refresh the page.")
    }
  }

  private async loadComprehensiveVocabulary(): Promise<void> {
    // Load built-in comprehensive vocabulary
    const comprehensiveVocab = VocabularySeeder.getComprehensiveVocabulary()

    for (const entry of comprehensiveVocab) {
      // Convert comprehensive entry to standard format
      const standardEntry = {
        word: entry.word,
        definitions: entry.definitions.map((def) => def.meaning),
        partOfSpeech: entry.definitions.map((def) => def.partOfSpeech),
        synonyms: entry.synonyms,
        antonyms: entry.antonyms,
        frequency: entry.frequency,
        examples: entry.definitions.map((def) => def.example).filter(Boolean) as string[],
      }

      this.vocabularyLoader.addWord(standardEntry)
    }

    // Also load the standard vocabulary
    await this.vocabularyLoader.loadVocabulary()
  }

  public async processMessage(userMessage: string): Promise<EnhancedChatMessage> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Add user message to history
    const userMsg: EnhancedChatMessage = {
      id: this.generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }

    // Analyze user input
    const tokenInfo = this.tokenizer.getTokenInfo(userMessage)
    userMsg.tokenInfo = tokenInfo
    userMsg.knownWords = tokenInfo.knownWords
    userMsg.unknownWords = tokenInfo.unknownWords

    this.conversationHistory.push(userMsg)

    // Learn new words from user input
    await this.learnNewWords(tokenInfo.tokens)

    // Try pattern matching first for more natural responses
    const patternMatch = this.patternMatcher.matchIntent(userMessage)
    let response: any

    if (patternMatch && patternMatch.confidence > 0.5) {
      // Use pattern-based response
      response = this.generatePatternResponse(userMessage, patternMatch)
      this.learningStats.patternsMatched++
    } else {
      // Fall back to neural network response
      const context = this.getRecentContext(5)
      response = this.neuralEngine.generateResponse(userMessage, context)
      response.reasoning = response.reasoning || []
      response.reasoning.unshift("No strong pattern match found, using neural network generation")
    }

    // Create assistant message
    const assistantMsg: EnhancedChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: response.text || response.response,
      timestamp: Date.now(),
      confidence: response.confidence || 0.8,
      reasoning: response.reasoning,
      tokenInfo: response.tokenInfo,
      intent: patternMatch?.intent,
      followUp: response.followUp,
    }

    this.conversationHistory.push(assistantMsg)

    // Update learning stats
    this.learningStats.conversationsHad++
    this.saveConversationHistory()
    this.saveLearningStats()

    return assistantMsg
  }

  private generatePatternResponse(input: string, matchResult: MatchResult): any {
    const conversationContext = this.conversationHistory.slice(-6).map((msg) => msg.content)

    const result = this.patternMatcher.generateContextualResponse(matchResult, input, conversationContext)

    return {
      response: result.response,
      reasoning: result.reasoning,
      followUp: result.followUp,
      confidence: matchResult.confidence,
    }
  }

  private async learnNewWords(tokens: any[]): Promise<void> {
    for (const token of tokens) {
      if (!token.isKnown && token.token.length > 2) {
        // This is a new word - add it to vocabulary with basic info
        const newWordEntry = {
          word: token.token,
          definitions: ["User-introduced word - meaning to be learned"],
          partOfSpeech: ["unknown"],
          synonyms: [],
          antonyms: [],
          frequency: 1,
          examples: [],
        }

        this.vocabularyLoader.addWord(newWordEntry)
        this.learningStats.wordsLearned++
        console.log(`Learned new word: ${token.token}`)
      }
    }
  }

  private getRecentContext(messageCount: number): string[] {
    return this.conversationHistory.slice(-messageCount * 2).map((msg) => msg.content)
  }

  public provideFeedback(messageId: string, feedback: "positive" | "negative"): void {
    const message = this.conversationHistory.find((msg) => msg.id === messageId)
    if (message && message.role === "assistant") {
      const messageIndex = this.conversationHistory.findIndex((msg) => msg.id === messageId)
      const userMessage = messageIndex > 0 ? this.conversationHistory[messageIndex - 1] : null

      if (userMessage) {
        this.neuralEngine.learnFromFeedback(userMessage.content, message.content, feedback)
        this.learningStats.feedbackReceived++
        this.saveLearningStats()
        console.log(`Received ${feedback} feedback for message: ${messageId}`)
      }
    }
  }

  public getEnhancedStats(): EnhancedLearningStats {
    const vocabStats = this.vocabularyLoader.getVocabularyStats()
    const totalWords = this.conversationHistory.reduce((sum, msg) => {
      return sum + (msg.tokenInfo?.totalTokens || 0)
    }, 0)
    const knownWords = this.conversationHistory.reduce((sum, msg) => {
      return sum + (msg.knownWords || 0)
    }, 0)

    const knownWordsPercentage = totalWords > 0 ? (knownWords / totalWords) * 100 : 0

    const assistantMessages = this.conversationHistory.filter((msg) => msg.role === "assistant" && msg.confidence)
    const avgConfidence =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / assistantMessages.length
        : 0

    return {
      totalInteractions: this.conversationHistory.length,
      vocabularySize: vocabStats.totalWords,
      knownWordsPercentage: Math.round(knownWordsPercentage * 100) / 100,
      modelVersion: 2,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      intentStats: this.patternMatcher.getIntentStats(),
      learningProgress: { ...this.learningStats },
    }
  }

  public getConversationHistory(): EnhancedChatMessage[] {
    return [...this.conversationHistory]
  }

  public searchVocabulary(query: string): any[] {
    return this.vocabularyLoader.searchWords(query, 10)
  }

  public getRandomWords(count = 5): any[] {
    return this.vocabularyLoader.getRandomWords(count)
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveConversationHistory(): void {
    try {
      localStorage.setItem("enhanced-ai-conversation-v2", JSON.stringify(this.conversationHistory))
    } catch (error) {
      console.warn("Failed to save conversation:", error)
    }
  }

  private loadConversationHistory(): void {
    try {
      const stored = localStorage.getItem("enhanced-ai-conversation-v2")
      if (stored && stored.trim()) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.conversationHistory = parsed.filter(
            (msg) =>
              msg &&
              typeof msg === "object" &&
              msg.id &&
              msg.role &&
              msg.content &&
              (msg.role === "user" || msg.role === "assistant"),
          )
          console.log(`Loaded ${this.conversationHistory.length} previous messages`)
        }
      }
    } catch (error) {
      console.warn("Failed to load conversation history:", error)
      this.conversationHistory = []
    }
  }

  private saveLearningStats(): void {
    try {
      localStorage.setItem("enhanced-ai-learning-stats-v2", JSON.stringify(this.learningStats))
    } catch (error) {
      console.warn("Failed to save learning stats:", error)
    }
  }

  private loadLearningStats(): void {
    try {
      const stored = localStorage.getItem("enhanced-ai-learning-stats-v2")
      if (stored && stored.trim()) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === "object") {
          this.learningStats = {
            wordsLearned: typeof parsed.wordsLearned === "number" ? parsed.wordsLearned : 0,
            conversationsHad: typeof parsed.conversationsHad === "number" ? parsed.conversationsHad : 0,
            feedbackReceived: typeof parsed.feedbackReceived === "number" ? parsed.feedbackReceived : 0,
            patternsMatched: typeof parsed.patternsMatched === "number" ? parsed.patternsMatched : 0,
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load learning stats:", error)
      this.learningStats = {
        wordsLearned: 0,
        conversationsHad: 0,
        feedbackReceived: 0,
        patternsMatched: 0,
      }
    }
  }

  private clearCorruptedData(): void {
    try {
      localStorage.removeItem("enhanced-ai-conversation-v2")
      localStorage.removeItem("enhanced-ai-learning-stats-v2")
    } catch (error) {
      console.warn("Could not clear corrupted data:", error)
    }
  }
}
