import { NeuralEngine, type ModelWeights } from "./neural-engine"
import { KnowledgeManager } from "./knowledge-manager"
import { SimpleTokenizer } from "./tokenizer"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export interface LearningStats {
  totalInteractions: number
  knowledgeItems: number
  modelVersion: number
  avgConfidence: number
}

export class AISystem {
  private neuralEngine: NeuralEngine
  private knowledgeManager: KnowledgeManager
  private tokenizer: SimpleTokenizer
  private conversationHistory: ChatMessage[] = []

  constructor() {
    this.tokenizer = new SimpleTokenizer()
    this.knowledgeManager = new KnowledgeManager()

    // Try to load existing model
    const savedModel = this.loadModelFromStorage()
    this.neuralEngine = new NeuralEngine(savedModel)

    this.loadConversationHistory()
  }

  public async processMessage(userMessage: string): Promise<ChatMessage> {
    // Add user message to history
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.conversationHistory.push(userMsg)

    // Search knowledge base for relevant information
    const relevantKnowledge = this.knowledgeManager.searchKnowledge(userMessage, 3)

    // Generate response using neural network
    const response = await this.generateResponse(userMessage, relevantKnowledge)

    // Create assistant message
    const assistantMsg: ChatMessage = {
      id: this.generateId(),
      role: "assistant",
      content: response.text,
      timestamp: Date.now(),
      confidence: response.confidence,
    }
    this.conversationHistory.push(assistantMsg)

    // Learn from this interaction
    await this.learnFromInteraction(userMessage, response.text)

    // Save state
    this.saveConversationHistory()
    this.saveModelToStorage()

    return assistantMsg
  }

  private async generateResponse(input: string, knowledge: any[]): Promise<{ text: string; confidence: number }> {
    // Encode input
    const inputTokens = this.tokenizer.encode(input)
    const inputVector = this.tokensToVector(inputTokens)

    // Get neural network output
    const output = this.neuralEngine.forward(inputVector)

    // Convert output to text (simplified approach)
    const responseText = this.generateTextFromOutput(output, input, knowledge)
    const confidence = this.calculateConfidence(output)

    return { text: responseText, confidence }
  }

  private tokensToVector(tokens: number[]): number[] {
    // Simple embedding: one-hot encoding averaged
    const vector = new Array(100).fill(0)
    tokens.forEach((token) => {
      const index = token % 100
      vector[index] += 1 / tokens.length
    })
    return vector
  }

  private generateTextFromOutput(output: number[], input: string, knowledge: any[]): string {
    // Simplified response generation
    const responses = [
      "I understand what you're saying about that.",
      "That's an interesting point. Let me think about it.",
      "Based on what I know, I would say that's worth considering.",
      "I can see why you might think that way.",
      "That reminds me of something I learned recently.",
      "I'm still learning about this topic, but here's what I think:",
      "From my understanding, that could be related to several things.",
      "I appreciate you sharing that with me.",
    ]

    // Use knowledge if available
    if (knowledge.length > 0) {
      const relevantInfo = knowledge[0].content
      return `Based on what I've learned: ${relevantInfo}. What do you think about that?`
    }

    // Use output to select response
    const maxIndex = output.indexOf(Math.max(...output))
    const responseIndex = maxIndex % responses.length

    return responses[responseIndex]
  }

  private calculateConfidence(output: number[]): number {
    const max = Math.max(...output)
    const sum = output.reduce((a, b) => a + b, 0)
    return sum > 0 ? max / sum : 0.5
  }

  private async learnFromInteraction(input: string, output: string): Promise<void> {
    // Add to knowledge base
    const category = this.categorizeInput(input)
    this.knowledgeManager.addKnowledge(
      `User said: "${input}" and I responded: "${output}"`,
      category,
      this.extractTags(input),
    )

    // Train neural network
    const inputVector = this.tokensToVector(this.tokenizer.encode(input))
    const targetVector = this.tokensToVector(this.tokenizer.encode(output))
    const actualOutput = this.neuralEngine.forward(inputVector)

    this.neuralEngine.backward(inputVector, targetVector, actualOutput)
  }

  private categorizeInput(input: string): string {
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("question") || lowerInput.includes("?")) return "questions"
    if (lowerInput.includes("help") || lowerInput.includes("how")) return "help"
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) return "greetings"
    return "general"
  }

  private extractTags(input: string): string[] {
    const words = input.toLowerCase().split(/\s+/)
    return words.filter((word) => word.length > 3 && !["the", "and", "for", "are", "but"].includes(word))
  }

  public getLearningStats(): LearningStats {
    const knowledgeStats = this.knowledgeManager.getKnowledgeStats()
    const modelWeights = this.neuralEngine.getWeights()

    const confidenceSum = this.conversationHistory
      .filter((msg) => msg.role === "assistant" && msg.confidence)
      .reduce((sum, msg) => sum + (msg.confidence || 0), 0)

    const assistantMessages = this.conversationHistory.filter((msg) => msg.role === "assistant").length
    const avgConfidence = assistantMessages > 0 ? confidenceSum / assistantMessages : 0

    return {
      totalInteractions: this.conversationHistory.length,
      knowledgeItems: knowledgeStats.totalItems,
      modelVersion: modelWeights.metadata.version,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public provideFeedback(messageId: string, feedback: "positive" | "negative"): void {
    // Find the message and update knowledge reliability
    const message = this.conversationHistory.find((msg) => msg.id === messageId)
    if (message && message.role === "assistant") {
      // This is simplified - in practice, you'd track which knowledge items contributed to each response
      const recentKnowledge = this.knowledgeManager.searchKnowledge(message.content, 1)
      if (recentKnowledge.length > 0) {
        this.knowledgeManager.updateReliability(recentKnowledge[0].id, feedback)
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveModelToStorage(): void {
    try {
      const weights = this.neuralEngine.getWeights()
      localStorage.setItem("ai-model", JSON.stringify(weights))
    } catch (error) {
      console.warn("Failed to save model:", error)
    }
  }

  private loadModelFromStorage(): ModelWeights | undefined {
    try {
      const stored = localStorage.getItem("ai-model")
      return stored ? JSON.parse(stored) : undefined
    } catch (error) {
      console.warn("Failed to load model:", error)
      return undefined
    }
  }

  private saveConversationHistory(): void {
    try {
      localStorage.setItem("ai-conversation", JSON.stringify(this.conversationHistory))
    } catch (error) {
      console.warn("Failed to save conversation:", error)
    }
  }

  private loadConversationHistory(): void {
    try {
      const stored = localStorage.getItem("ai-conversation")
      if (stored) {
        this.conversationHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.warn("Failed to load conversation:", error)
    }
  }
}
