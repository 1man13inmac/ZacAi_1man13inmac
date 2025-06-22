export interface KnowledgeItem {
  id: string
  content: string
  category: string
  reliability: number
  recency: number
  frequency: number
  tags: string[]
  timestamp: number
}

export class KnowledgeManager {
  private knowledge: Map<string, KnowledgeItem> = new Map()
  private categories: Set<string> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  public addKnowledge(content: string, category: string, tags: string[] = []): string {
    const id = this.generateId()
    const item: KnowledgeItem = {
      id,
      content,
      category,
      reliability: 0.5, // Start with neutral reliability
      recency: 1.0,
      frequency: 1,
      tags,
      timestamp: Date.now(),
    }

    this.knowledge.set(id, item)
    this.categories.add(category)
    this.saveToStorage()
    return id
  }

  public updateReliability(id: string, feedback: "positive" | "negative"): void {
    const item = this.knowledge.get(id)
    if (item) {
      const adjustment = feedback === "positive" ? 0.1 : -0.1
      item.reliability = Math.max(0, Math.min(1, item.reliability + adjustment))
      item.frequency++
      this.knowledge.set(id, item)
      this.saveToStorage()
    }
  }

  public searchKnowledge(query: string, limit = 10): KnowledgeItem[] {
    const queryLower = query.toLowerCase()
    const results: Array<{ item: KnowledgeItem; score: number }> = []

    for (const item of this.knowledge.values()) {
      let score = 0

      // Content matching
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 0.4
      }

      // Tag matching
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 0.3
        }
      }

      // Category matching
      if (item.category.toLowerCase().includes(queryLower)) {
        score += 0.2
      }

      // Apply reliability and recency weights
      score *= item.reliability * 0.7 + item.recency * 0.3

      if (score > 0) {
        results.push({ item, score })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.item)
  }

  public getCategories(): string[] {
    return Array.from(this.categories)
  }

  public getKnowledgeStats(): {
    totalItems: number
    categories: number
    avgReliability: number
  } {
    const items = Array.from(this.knowledge.values())
    const avgReliability = items.length > 0 ? items.reduce((sum, item) => sum + item.reliability, 0) / items.length : 0

    return {
      totalItems: items.length,
      categories: this.categories.size,
      avgReliability: Math.round(avgReliability * 100) / 100,
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private saveToStorage(): void {
    try {
      const data = {
        knowledge: Array.from(this.knowledge.entries()),
        categories: Array.from(this.categories),
      }
      localStorage.setItem("ai-knowledge", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save knowledge to storage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("ai-knowledge")
      if (stored) {
        const data = JSON.parse(stored)
        this.knowledge = new Map(data.knowledge)
        this.categories = new Set(data.categories)
      }
    } catch (error) {
      console.warn("Failed to load knowledge from storage:", error)
    }
  }
}
