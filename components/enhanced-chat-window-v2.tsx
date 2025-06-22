"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { EnhancedAISystemV2, type EnhancedChatMessage, type EnhancedLearningStats } from "../lib/enhanced-ai-system-v2"
import { ThumbsUp, ThumbsDown, Brain, BookOpen, TrendingUp, Lightbulb, Search, Target } from "lucide-react"

export default function EnhancedChatWindowV2() {
  const [aiSystem] = useState(() => new EnhancedAISystemV2())
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [stats, setStats] = useState<EnhancedLearningStats>({
    totalInteractions: 0,
    vocabularySize: 0,
    knownWordsPercentage: 0,
    modelVersion: 2,
    avgConfidence: 0,
    intentStats: {},
    learningProgress: {
      wordsLearned: 0,
      conversationsHad: 0,
      feedbackReceived: 0,
      patternsMatched: 0,
    },
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [randomWords, setRandomWords] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeSystem()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSystem = async () => {
    try {
      setError(null)
      await aiSystem.initialize()
      const history = aiSystem.getConversationHistory()
      setMessages(history)
      updateStats()
      updateRandomWords()
    } catch (error) {
      console.error("Failed to initialize AI system:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize AI system")
    } finally {
      setIsInitializing(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    const newStats = aiSystem.getEnhancedStats()
    setStats(newStats)
  }

  const updateRandomWords = () => {
    const words = aiSystem.getRandomWords(5)
    setRandomWords(words)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await aiSystem.processMessage(userInput)
      const updatedHistory = aiSystem.getConversationHistory()
      setMessages(updatedHistory)
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
      setError("Failed to process message. Please try again.")
      setInput(userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    aiSystem.provideFeedback(messageId, feedback)
    updateStats()
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = aiSystem.searchVocabulary(searchQuery.trim())
      setSearchResults(results)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-500"
    if (confidence > 0.7) return "bg-green-500"
    if (confidence > 0.4) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Brain className="w-12 h-12 mb-4 animate-pulse text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Initializing Enhanced AI V2</h2>
            <p className="text-gray-600 text-center mb-4">
              Loading comprehensive vocabulary, patterns, and knowledge base...
            </p>
            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2 w-full">
                  Refresh Page
                </Button>
              </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "75%" }} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Enhanced Browser AI V2
              <Badge variant="outline" className="ml-auto">
                {stats.vocabularySize.toLocaleString()} words
              </Badge>
              <Badge variant="secondary">v{stats.modelVersion}</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to Enhanced Browser AI V2!</p>
                  <p>I now start with comprehensive vocabulary, conversational patterns, and knowledge!</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Try:</strong> "Hello, how are you?"
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <strong>Ask:</strong> "What can you do?"
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <strong>Learn:</strong> "How do you learn?"
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <strong>Explain:</strong> "Tell me about AI"
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                    }`}
                  >
                    <div className="text-sm mb-2">{message.content}</div>

                    {/* Intent and Follow-up for Assistant Messages */}
                    {message.role === "assistant" && (message.intent || message.followUp) && (
                      <div className="text-xs opacity-70 mt-2 space-y-1">
                        {message.intent && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>Intent: {message.intent}</span>
                          </div>
                        )}
                        {message.followUp && <div className="text-blue-600 italic">💭 {message.followUp}</div>}
                      </div>
                    )}

                    {/* Token Analysis for User Messages */}
                    {message.role === "user" && message.tokenInfo && (
                      <div className="text-xs opacity-70 mt-2 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {message.knownWords} known
                        </Badge>
                        {message.unknownWords! > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {message.unknownWords} new
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* AI Reasoning */}
                    {message.role === "assistant" && message.reasoning && (
                      <details className="mt-2 text-xs opacity-70">
                        <summary className="cursor-pointer hover:opacity-100">View AI Reasoning</summary>
                        <div className="mt-1 space-y-1">
                          {message.reasoning.map((reason, index) => (
                            <div key={index} className="flex items-start gap-1">
                              <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    <div className="flex items-center justify-between text-xs opacity-70 mt-2">
                      <span>{formatTimestamp(message.timestamp)}</span>

                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          {message.confidence && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`} />
                              <span>{Math.round(message.confidence * 100)}%</span>
                            </div>
                          )}

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleFeedback(message.id, "positive")}
                              className="hover:bg-green-100 p-1 rounded"
                              title="Good response"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, "negative")}
                              className="hover:bg-red-100 p-1 rounded"
                              title="Poor response"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-500">AI is analyzing patterns and generating response...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything! I understand context and can have meaningful conversations..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </form>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Sidebar */}
      <div className="w-96 p-4">
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="vocab">Vocab</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
                    <div className="text-xs text-gray-500">Total Messages</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.vocabularySize.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Vocabulary Size</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.learningProgress.wordsLearned}</div>
                    <div className="text-xs text-gray-500">Words Learned</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgConfidence * 100)}%</div>
                    <div className="text-xs text-gray-500">Avg Confidence</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Known Words</span>
                    <span>{stats.knownWordsPercentage}%</span>
                  </div>
                  <Progress value={stats.knownWordsPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Learning Milestones</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Conversations</span>
                      <span>{stats.learningProgress.conversationsHad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patterns Matched</span>
                      <span>{stats.learningProgress.patternsMatched}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Feedback Received</span>
                      <span>{stats.learningProgress.feedbackReceived}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vocab" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Vocabulary Explorer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vocabulary..."
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Search Results</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.map((word, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">{word.word}</div>
                          <div className="text-gray-600">{word.definitions[0]}</div>
                          {word.synonyms.length > 0 && (
                            <div className="text-blue-600">Synonyms: {word.synonyms.slice(0, 3).join(", ")}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Random Words</div>
                    <Button onClick={updateRandomWords} size="sm" variant="outline">
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {randomWords.map((word, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium text-blue-800">{word.word}</div>
                        <div className="text-blue-600">{word.definitions[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Conversation Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Intent Recognition</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(stats.intentStats).map(([intent, count]) => (
                      <div key={intent} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                        <span className="font-medium capitalize">{intent.replace("_", " ")}</span>
                        <Badge variant="secondary">{count} patterns</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">V2 Enhancements</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <strong>Pattern Matching:</strong> I now recognize conversation intents and respond with
                        contextually appropriate templates
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <strong>Knowledge Base:</strong> I have built-in knowledge about AI, learning, communication,
                        and more
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <strong>Comprehensive Vocabulary:</strong> I start with detailed word definitions, synonyms, and
                        examples
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <strong>Context Awareness:</strong> I consider conversation history to avoid repetitive
                        responses
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Current Capabilities</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Intent recognition</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Pattern responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Knowledge integration</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Context awareness</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Emotional understanding</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Complex reasoning</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
