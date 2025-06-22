import type { AdvancedTokenizer, TokenInfo } from "./advanced-tokenizer"
import type { VocabularyLoader } from "./vocabulary-loader"

export interface EnhancedModelWeights {
  embedding: number[][] // Word embeddings
  attention: {
    query: number[][]
    key: number[][]
    value: number[][]
  }
  feedforward: number[][]
  output: number[][]
  biases: {
    attention: number[]
    feedforward: number[]
    output: number[]
  }
  metadata: {
    vocabSize: number
    embeddingDim: number
    hiddenDim: number
    version: number
    lastUpdated: number
    learningRate: number
  }
}

export class EnhancedNeuralEngine {
  private weights: EnhancedModelWeights
  private tokenizer: AdvancedTokenizer
  private vocabularyLoader: VocabularyLoader
  private useWebGL = false
  private gl: WebGLRenderingContext | null = null

  constructor(vocabularyLoader: VocabularyLoader, tokenizer: AdvancedTokenizer, initialWeights?: EnhancedModelWeights) {
    this.vocabularyLoader = vocabularyLoader
    this.tokenizer = tokenizer
    this.weights = initialWeights || this.createDefaultModel()
    this.initializeWebGL()
  }

  private initializeWebGL(): void {
    try {
      const canvas = document.createElement("canvas")
      this.gl = canvas.getContext("webgl")
      this.useWebGL = !!this.gl
      console.log(`Enhanced Neural Engine using ${this.useWebGL ? "WebGL" : "CPU"}`)
    } catch (error) {
      console.warn("WebGL not available, using CPU")
      this.useWebGL = false
    }
  }

  private createDefaultModel(): EnhancedModelWeights {
    const vocabSize = 10000 // Will be updated when tokenizer is ready
    const embeddingDim = 128
    const hiddenDim = 256

    return {
      embedding: this.randomMatrix(vocabSize, embeddingDim),
      attention: {
        query: this.randomMatrix(embeddingDim, embeddingDim),
        key: this.randomMatrix(embeddingDim, embeddingDim),
        value: this.randomMatrix(embeddingDim, embeddingDim),
      },
      feedforward: this.randomMatrix(embeddingDim, hiddenDim),
      output: this.randomMatrix(hiddenDim, vocabSize),
      biases: {
        attention: this.randomArray(embeddingDim),
        feedforward: this.randomArray(hiddenDim),
        output: this.randomArray(vocabSize),
      },
      metadata: {
        vocabSize,
        embeddingDim,
        hiddenDim,
        version: 1,
        lastUpdated: Date.now(),
        learningRate: 0.001,
      },
    }
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array(rows)
      .fill(0)
      .map(
        () =>
          Array(cols)
            .fill(0)
            .map(() => (Math.random() - 0.5) * Math.sqrt(2 / (rows + cols))), // Xavier initialization
      )
  }

  private randomArray(size: number): number[] {
    return Array(size)
      .fill(0)
      .map(() => (Math.random() - 0.5) * 0.1)
  }

  public async initialize(): Promise<void> {
    await this.tokenizer.initialize()

    // Update model size based on actual vocabulary
    const vocabSize = this.tokenizer.getVocabularySize()
    if (vocabSize !== this.weights.metadata.vocabSize) {
      console.log(`Updating model for vocabulary size: ${vocabSize}`)
      this.weights = this.createDefaultModel()
      this.weights.metadata.vocabSize = vocabSize

      // Resize matrices
      this.weights.embedding = this.randomMatrix(vocabSize, this.weights.metadata.embeddingDim)
      this.weights.output = this.randomMatrix(this.weights.metadata.hiddenDim, vocabSize)
      this.weights.biases.output = this.randomArray(vocabSize)
    }
  }

  public generateResponse(
    input: string,
    context: string[] = [],
  ): {
    text: string
    confidence: number
    tokenInfo: any
    reasoning: string[]
  } {
    // Tokenize input
    const tokenInfo = this.tokenizer.getTokenInfo(input)
    const inputIds = this.tokenizer.encode(input)

    // Add context if available
    let contextIds: number[] = []
    if (context.length > 0) {
      const contextText = context.join(" ")
      contextIds = this.tokenizer.encode(contextText, 64)
    }

    // Combine context and input
    const fullInput = [...contextIds, ...inputIds].slice(-128) // Keep last 128 tokens

    // Forward pass
    const embeddings = this.getEmbeddings(fullInput)
    const attended = this.applyAttention(embeddings)
    const hidden = this.feedforward(attended)
    const output = this.generateOutput(hidden)

    // Convert output to text
    const responseText = this.outputToText(output, input, tokenInfo)
    const confidence = this.calculateConfidence(output)
    const reasoning = this.generateReasoning(input, tokenInfo, responseText)

    return {
      text: responseText,
      confidence,
      tokenInfo,
      reasoning,
    }
  }

  private getEmbeddings(tokenIds: number[]): number[][] {
    const embeddings: number[][] = []

    for (const tokenId of tokenIds) {
      if (tokenId < this.weights.embedding.length) {
        embeddings.push([...this.weights.embedding[tokenId]])
      } else {
        // Unknown token - use average embedding
        const avgEmbedding = this.weights.embedding[1] // UNK token embedding
        embeddings.push([...avgEmbedding])
      }
    }

    return embeddings
  }

  private applyAttention(embeddings: number[][]): number[][] {
    // Simplified self-attention mechanism
    const attended: number[][] = []

    for (let i = 0; i < embeddings.length; i++) {
      const query = this.matrixVectorMultiply(this.weights.attention.query, embeddings[i])
      let attentionWeights: number[] = []

      // Calculate attention weights
      for (let j = 0; j < embeddings.length; j++) {
        const key = this.matrixVectorMultiply(this.weights.attention.key, embeddings[j])
        const score = this.dotProduct(query, key)
        attentionWeights.push(score)
      }

      // Softmax
      attentionWeights = this.softmax(attentionWeights)

      // Apply attention to values
      const attendedVector = new Array(embeddings[0].length).fill(0)
      for (let j = 0; j < embeddings.length; j++) {
        const value = this.matrixVectorMultiply(this.weights.attention.value, embeddings[j])
        for (let k = 0; k < value.length; k++) {
          attendedVector[k] += attentionWeights[j] * value[k]
        }
      }

      attended.push(attendedVector)
    }

    return attended
  }

  private feedforward(attended: number[][]): number[] {
    // Average pooling over sequence
    const pooled = new Array(attended[0].length).fill(0)
    for (const vector of attended) {
      for (let i = 0; i < vector.length; i++) {
        pooled[i] += vector[i] / attended.length
      }
    }

    // Feedforward layer
    const hidden = this.matrixVectorMultiply(this.weights.feedforward, pooled)
    return hidden.map((x) => Math.max(0, x)) // ReLU activation
  }

  private generateOutput(hidden: number[]): number[] {
    const output = this.matrixVectorMultiply(this.weights.output, hidden)
    for (let i = 0; i < output.length; i++) {
      output[i] += this.weights.biases.output[i]
    }
    return this.softmax(output)
  }

  private outputToText(output: number[], input: string, tokenInfo: any): string {
    // Enhanced response generation using vocabulary knowledge
    const responses = this.generateContextualResponses(input, tokenInfo)

    // Use output probabilities to select response style
    const maxIndex = output.indexOf(Math.max(...output))
    const responseStyle = maxIndex % responses.length

    let selectedResponse = responses[responseStyle]

    // Enhance response with vocabulary knowledge
    if (tokenInfo.unknownWords > 0) {
      const unknownTokens = tokenInfo.tokens.filter((t: TokenInfo) => !t.isKnown)
      if (unknownTokens.length > 0) {
        selectedResponse += ` I notice you used the word "${unknownTokens[0].token}" which is new to me. Could you help me understand what it means?`
      }
    }

    return selectedResponse
  }

  private generateContextualResponses(input: string, tokenInfo: any): string[] {
    const inputLower = input.toLowerCase()

    // Question responses
    if (
      inputLower.includes("?") ||
      inputLower.startsWith("what") ||
      inputLower.startsWith("how") ||
      inputLower.startsWith("why")
    ) {
      return [
        "That's a great question! Let me think about that...",
        "I find that topic fascinating. From what I understand...",
        "That's something I've been learning about. Here's what I think...",
        "Interesting question! Based on my knowledge...",
        "I'm still developing my understanding of that, but I believe...",
      ]
    }

    // Greeting responses
    if (inputLower.includes("hello") || inputLower.includes("hi") || inputLower.includes("hey")) {
      return [
        "Hello! It's wonderful to chat with you. How are you doing today?",
        "Hi there! I'm excited to learn from our conversation.",
        "Hey! Thanks for talking with me. What's on your mind?",
        "Hello! I'm always eager to learn something new. What would you like to discuss?",
      ]
    }

    // Learning/teaching context
    if (inputLower.includes("learn") || inputLower.includes("teach") || inputLower.includes("explain")) {
      return [
        "I love learning new things! That sounds really interesting.",
        "Teaching and learning are so important. I'm always eager to understand more.",
        "That's fascinating! I'm constantly trying to expand my knowledge.",
        "I appreciate you sharing that with me. It helps me learn and grow.",
      ]
    }

    // Emotional context
    if (
      inputLower.includes("happy") ||
      inputLower.includes("sad") ||
      inputLower.includes("excited") ||
      inputLower.includes("worried")
    ) {
      return [
        "I can sense the emotion in what you're sharing. Thank you for being open with me.",
        "Emotions are such an important part of human experience. I'm learning to understand them better.",
        "I appreciate you sharing how you feel. It helps me understand you better.",
        "That sounds like it means a lot to you. I'm here to listen and learn.",
      ]
    }

    // Default responses
    return [
      "That's really interesting! I'm learning so much from our conversation.",
      "I find what you're saying quite thought-provoking. Tell me more!",
      "Thank you for sharing that with me. It's helping me understand the world better.",
      "I'm constantly amazed by the things I learn from talking with people like you.",
      "That gives me a lot to think about. I appreciate your perspective.",
      "I'm still developing my understanding, but I find that really compelling.",
    ]
  }

  private generateReasoning(input: string, tokenInfo: any, response: string): string[] {
    const reasoning: string[] = []

    reasoning.push(
      `Input analysis: Found ${tokenInfo.knownWords} known words and ${tokenInfo.unknownWords} unknown words`,
    )

    if (tokenInfo.unknownWords > 0) {
      reasoning.push(`Unknown words detected - this is a learning opportunity`)
    }

    const inputLower = input.toLowerCase()
    if (inputLower.includes("?")) {
      reasoning.push("Detected question format - using inquisitive response style")
    }

    if (inputLower.includes("hello") || inputLower.includes("hi")) {
      reasoning.push("Detected greeting - responding with friendly acknowledgment")
    }

    reasoning.push(`Generated response with contextual awareness`)

    return reasoning
  }

  private calculateConfidence(output: number[]): number {
    const max = Math.max(...output)
    const sum = output.reduce((a, b) => a + b, 0)
    const entropy = -output.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0)
    const maxEntropy = Math.log(output.length)

    // Combine max probability and entropy for confidence
    const probConfidence = max
    const entropyConfidence = 1 - entropy / maxEntropy

    return probConfidence * 0.7 + entropyConfidence * 0.3
  }

  // Utility functions
  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map((row) => this.dotProduct(row, vector))
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0)
  }

  private softmax(values: number[]): number[] {
    const max = Math.max(...values)
    const exp = values.map((v) => Math.exp(v - max))
    const sum = exp.reduce((a, b) => a + b, 0)
    return exp.map((v) => v / sum)
  }

  public learnFromFeedback(input: string, response: string, feedback: "positive" | "negative"): void {
    // Simplified learning from feedback
    const inputIds = this.tokenizer.encode(input)
    const responseIds = this.tokenizer.encode(response)

    // Adjust learning rate based on feedback
    const learningRate = this.weights.metadata.learningRate * (feedback === "positive" ? 1.0 : -0.5)

    // Update embeddings for tokens in positive feedback
    if (feedback === "positive") {
      for (const tokenId of [...inputIds, ...responseIds]) {
        if (tokenId < this.weights.embedding.length) {
          // Slightly reinforce these embeddings
          for (let i = 0; i < this.weights.embedding[tokenId].length; i++) {
            this.weights.embedding[tokenId][i] *= 1 + learningRate * 0.01
          }
        }
      }
    }

    this.weights.metadata.version++
    this.weights.metadata.lastUpdated = Date.now()
  }

  public getWeights(): EnhancedModelWeights {
    return JSON.parse(JSON.stringify(this.weights))
  }

  public loadWeights(weights: EnhancedModelWeights): void {
    this.weights = weights
  }
}
