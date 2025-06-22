"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISystem, type ChatMessage, type LearningStats } from "../lib/ai-system"
import { ThumbsUp, ThumbsDown, Brain, Database, MessageSquare } from "lucide-react"

export default function ChatWindow() {
  const [aiSystem] = useState(() => new AISystem())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<LearningStats>({
    totalInteractions: 0,
    knowledgeItems: 0,
    modelVersion: 1,
    avgConfidence: 0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load conversation history
    const history = aiSystem.getConversationHistory()
    setMessages(history)
    updateStats()
  }, [aiSystem])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStats = () => {
    const newStats = aiSystem.getLearningStats()
    setStats(newStats)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiSystem.processMessage(userInput)
      const updatedHistory = aiSystem.getConversationHistory()
      setMessages(updatedHistory)
      updateStats()
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    aiSystem.provideFeedback(messageId, feedback)
    updateStats()
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Standalone Browser AI
              <Badge variant="outline" className="ml-auto">
                v{stats.modelVersion}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to begin training your AI!</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                    }`}
                  >
                    <div className="text-sm mb-1">{message.content}</div>

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
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, "negative")}
                              className="hover:bg-red-100 p-1 rounded"
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
                  <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-sm text-gray-500">AI is thinking...</span>
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
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Stats Sidebar */}
      <div className="w-80 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-4 h-4" />
              Learning Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
                <div className="text-xs text-gray-500">Interactions</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.knowledgeItems}</div>
                <div className="text-xs text-gray-500">Knowledge Items</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.modelVersion}</div>
                <div className="text-xs text-gray-500">Model Version</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgConfidence * 100)}%</div>
                <div className="text-xs text-gray-500">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Continuous Learning:</strong> Every conversation updates the neural network weights
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Knowledge Base:</strong> Conversations are stored and categorized for future reference
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Browser-Only:</strong> All processing happens locally, no external APIs
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <strong>Feedback Loop:</strong> Use 👍/👎 to improve response quality
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
