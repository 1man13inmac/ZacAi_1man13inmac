import type { ConversationalPattern, KnowledgeEntry } from "./vocabulary-seeder"

export interface MatchResult {
  intent: string
  confidence: number
  pattern: ConversationalPattern
  extractedEntities?: string[]
}

export class PatternMatcher {
  private patterns: ConversationalPattern[]
  private knowledgeBase: KnowledgeEntry[]

  constructor(patterns: ConversationalPattern[], knowledgeBase: KnowledgeEntry[]) {
    this.patterns = patterns
    this.knowledgeBase = knowledgeBase
  }

  public matchIntent(input: string): MatchResult | null {
    const inputLower = input.toLowerCase().trim()
    let bestMatch: MatchResult | null = null
    let highestConfidence = 0

    for (const pattern of this.patterns) {
      const confidence = this.calculatePatternMatch(inputLower, pattern)

      if (confidence > highestConfidence && confidence > 0.3) {
        highestConfidence = confidence
        bestMatch = {
          intent: pattern.intent,
          confidence,
          pattern,
          extractedEntities: this.extractEntities(inputLower, pattern),
        }
      }
    }

    return bestMatch
  }

  private calculatePatternMatch(input: string, pattern: ConversationalPattern): number {
    let maxScore = 0

    for (const patternText of pattern.patterns) {
      const score = this.calculateStringMatch(input, patternText.toLowerCase())
      maxScore = Math.max(maxScore, score)
    }

    return maxScore
  }

  private calculateStringMatch(input: string, pattern: string): number {
    // Exact match
    if (input === pattern) return 1.0

    // Contains pattern
    if (input.includes(pattern)) return 0.9

    // Pattern contains input
    if (pattern.includes(input)) return 0.8

    // Word-level matching
    const inputWords = input.split(/\s+/)
    const patternWords = pattern.split(/\s+/)

    let matchingWords = 0
    for (const word of inputWords) {
      if (patternWords.includes(word)) {
        matchingWords++
      }
    }

    const wordMatchScore = matchingWords / Math.max(inputWords.length, patternWords.length)

    // Fuzzy matching for similar words
    let fuzzyScore = 0
    for (const inputWord of inputWords) {
      for (const patternWord of patternWords) {
        const similarity = this.calculateLevenshteinSimilarity(inputWord, patternWord)
        fuzzyScore = Math.max(fuzzyScore, similarity)
      }
    }

    return Math.max(wordMatchScore, fuzzyScore * 0.7)
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1.0

    const distance = this.levenshteinDistance(str1, str2)
    return 1 - distance / maxLength
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  private extractEntities(input: string, pattern: ConversationalPattern): string[] {
    const entities: string[] = []

    // Extract potential topics from knowledge base
    for (const knowledge of this.knowledgeBase) {
      if (input.includes(knowledge.topic.toLowerCase())) {
        entities.push(knowledge.topic)
      }
    }

    return entities
  }

  public generateContextualResponse(
    matchResult: MatchResult,
    input: string,
    conversationHistory: string[] = [],
  ): {
    response: string
    reasoning: string[]
    followUp?: string
  } {
    const reasoning: string[] = []
    reasoning.push(`Matched intent: ${matchResult.intent} (confidence: ${Math.round(matchResult.confidence * 100)}%)`)

    // Select response based on confidence and context
    const responses = matchResult.pattern.responses
    let selectedResponse: string

    if (conversationHistory.length > 0) {
      // Consider conversation history for response selection
      const recentContext = conversationHistory.slice(-3).join(" ").toLowerCase()

      // Avoid repetitive responses
      const usedResponses = conversationHistory.filter((msg) =>
        responses.some((resp) => msg.includes(resp.substring(0, 20))),
      )

      const availableResponses = responses.filter(
        (resp) => !usedResponses.some((used) => used.includes(resp.substring(0, 20))),
      )

      selectedResponse =
        availableResponses.length > 0
          ? availableResponses[Math.floor(Math.random() * availableResponses.length)]
          : responses[Math.floor(Math.random() * responses.length)]

      reasoning.push("Selected response considering conversation history to avoid repetition")
    } else {
      selectedResponse = responses[Math.floor(Math.random() * responses.length)]
      reasoning.push("Selected random response from pattern templates")
    }

    // Enhance response with knowledge if entities were found
    if (matchResult.extractedEntities && matchResult.extractedEntities.length > 0) {
      const relevantKnowledge = this.findRelevantKnowledge(matchResult.extractedEntities[0])
      if (relevantKnowledge) {
        const fact = relevantKnowledge.facts[Math.floor(Math.random() * relevantKnowledge.facts.length)]
        selectedResponse += ` Here's something interesting: ${fact}`
        reasoning.push(`Enhanced response with knowledge about: ${relevantKnowledge.topic}`)
      }
    }

    // Select follow-up question
    const followUp =
      matchResult.pattern.followUp && matchResult.pattern.followUp.length > 0
        ? matchResult.pattern.followUp[Math.floor(Math.random() * matchResult.pattern.followUp.length)]
        : undefined

    return {
      response: selectedResponse,
      reasoning,
      followUp,
    }
  }

  private findRelevantKnowledge(topic: string): KnowledgeEntry | null {
    return (
      this.knowledgeBase.find(
        (entry) =>
          entry.topic.toLowerCase() === topic.toLowerCase() ||
          entry.relatedTopics.some((related) => related.toLowerCase() === topic.toLowerCase()),
      ) || null
    )
  }

  public getIntentStats(): { [intent: string]: number } {
    const stats: { [intent: string]: number } = {}
    for (const pattern of this.patterns) {
      stats[pattern.intent] = pattern.patterns.length
    }
    return stats
  }
}
