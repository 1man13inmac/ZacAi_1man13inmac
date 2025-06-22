export interface ComprehensiveWordEntry {
  word: string
  definitions: Array<{
    meaning: string
    partOfSpeech: string
    example?: string
  }>
  synonyms: string[]
  antonyms: string[]
  frequency: number
  etymology?: string
  pronunciation?: string
  difficulty: "basic" | "intermediate" | "advanced"
}

export interface ConversationalPattern {
  intent: string
  patterns: string[]
  responses: string[]
  context?: string[]
  followUp?: string[]
}

export interface KnowledgeEntry {
  topic: string
  category: string
  facts: string[]
  relatedTopics: string[]
  confidence: number
}

export class VocabularySeeder {
  public static getComprehensiveVocabulary(): ComprehensiveWordEntry[] {
    return [
      // Basic conversational words
      {
        word: "hello",
        definitions: [
          {
            meaning: "A greeting used when meeting someone",
            partOfSpeech: "interjection",
            example: "Hello, how are you today?",
          },
          { meaning: "An expression of greeting", partOfSpeech: "noun", example: "She gave a warm hello to everyone." },
        ],
        synonyms: ["hi", "hey", "greetings", "salutations"],
        antonyms: ["goodbye", "farewell"],
        frequency: 100,
        pronunciation: "həˈloʊ",
        difficulty: "basic",
      },
      {
        word: "conversation",
        definitions: [
          {
            meaning: "An informal talk between two or more people",
            partOfSpeech: "noun",
            example: "We had a long conversation about books.",
          },
          {
            meaning: "The act of talking together",
            partOfSpeech: "noun",
            example: "The art of conversation is dying.",
          },
        ],
        synonyms: ["discussion", "dialogue", "chat", "talk"],
        antonyms: ["silence", "monologue"],
        frequency: 85,
        pronunciation: "ˌkɑnvərˈseɪʃən",
        difficulty: "intermediate",
      },
      {
        word: "understand",
        definitions: [
          {
            meaning: "To comprehend the meaning of something",
            partOfSpeech: "verb",
            example: "I understand what you're saying.",
          },
          {
            meaning: "To have knowledge or awareness of",
            partOfSpeech: "verb",
            example: "She understands French very well.",
          },
        ],
        synonyms: ["comprehend", "grasp", "perceive", "realize"],
        antonyms: ["misunderstand", "confuse"],
        frequency: 95,
        pronunciation: "ˌʌndərˈstænd",
        difficulty: "basic",
      },
      {
        word: "artificial",
        definitions: [
          {
            meaning: "Made by humans rather than occurring naturally",
            partOfSpeech: "adjective",
            example: "Artificial intelligence is advancing rapidly.",
          },
          { meaning: "Not genuine or natural", partOfSpeech: "adjective", example: "The flowers looked artificial." },
        ],
        synonyms: ["synthetic", "man-made", "manufactured", "fake"],
        antonyms: ["natural", "genuine", "authentic"],
        frequency: 70,
        pronunciation: "ˌɑrtəˈfɪʃəl",
        difficulty: "intermediate",
      },
      {
        word: "intelligence",
        definitions: [
          {
            meaning: "The ability to learn, understand, and think",
            partOfSpeech: "noun",
            example: "Human intelligence is remarkable.",
          },
          {
            meaning: "Information gathered for analysis",
            partOfSpeech: "noun",
            example: "Military intelligence reports.",
          },
        ],
        synonyms: ["intellect", "wisdom", "knowledge", "understanding"],
        antonyms: ["ignorance", "stupidity"],
        frequency: 80,
        pronunciation: "ɪnˈtɛlədʒəns",
        difficulty: "intermediate",
      },
      {
        word: "learn",
        definitions: [
          { meaning: "To acquire knowledge or skill", partOfSpeech: "verb", example: "Children learn quickly." },
          {
            meaning: "To become aware of something",
            partOfSpeech: "verb",
            example: "I learned about the meeting yesterday.",
          },
        ],
        synonyms: ["study", "master", "acquire", "absorb"],
        antonyms: ["forget", "unlearn"],
        frequency: 95,
        pronunciation: "lɜrn",
        difficulty: "basic",
      },
      {
        word: "knowledge",
        definitions: [
          {
            meaning: "Information and understanding gained through experience",
            partOfSpeech: "noun",
            example: "She has extensive knowledge of history.",
          },
          {
            meaning: "Awareness or familiarity",
            partOfSpeech: "noun",
            example: "To my knowledge, he's never been here.",
          },
        ],
        synonyms: ["information", "understanding", "wisdom", "learning"],
        antonyms: ["ignorance", "unawareness"],
        frequency: 85,
        pronunciation: "ˈnɑlɪdʒ",
        difficulty: "basic",
      },
      {
        word: "question",
        definitions: [
          {
            meaning: "A sentence asking for information",
            partOfSpeech: "noun",
            example: "She asked a difficult question.",
          },
          { meaning: "To ask about something", partOfSpeech: "verb", example: "I question his motives." },
        ],
        synonyms: ["inquiry", "query", "interrogation"],
        antonyms: ["answer", "response"],
        frequency: 90,
        pronunciation: "ˈkwɛstʃən",
        difficulty: "basic",
      },
      {
        word: "answer",
        definitions: [
          { meaning: "A response to a question", partOfSpeech: "noun", example: "The answer is correct." },
          { meaning: "To respond to a question", partOfSpeech: "verb", example: "Please answer the phone." },
        ],
        synonyms: ["response", "reply", "solution"],
        antonyms: ["question", "inquiry"],
        frequency: 90,
        pronunciation: "ˈænsər",
        difficulty: "basic",
      },
      {
        word: "explain",
        definitions: [
          {
            meaning: "To make something clear by describing it",
            partOfSpeech: "verb",
            example: "Can you explain how this works?",
          },
          { meaning: "To give reasons for something", partOfSpeech: "verb", example: "He explained his absence." },
        ],
        synonyms: ["clarify", "describe", "elucidate", "interpret"],
        antonyms: ["confuse", "obscure"],
        frequency: 85,
        pronunciation: "ɪkˈspleɪn",
        difficulty: "basic",
      },
      {
        word: "interesting",
        definitions: [
          {
            meaning: "Arousing curiosity or attention",
            partOfSpeech: "adjective",
            example: "That's an interesting idea.",
          },
          {
            meaning: "Engaging or fascinating",
            partOfSpeech: "adjective",
            example: "She's a very interesting person.",
          },
        ],
        synonyms: ["fascinating", "engaging", "intriguing", "captivating"],
        antonyms: ["boring", "dull", "uninteresting"],
        frequency: 85,
        pronunciation: "ˈɪntrəstɪŋ",
        difficulty: "basic",
      },
      {
        word: "important",
        definitions: [
          {
            meaning: "Having great significance or value",
            partOfSpeech: "adjective",
            example: "This is an important decision.",
          },
          {
            meaning: "Having high rank or status",
            partOfSpeech: "adjective",
            example: "She's an important person in the company.",
          },
        ],
        synonyms: ["significant", "crucial", "vital", "essential"],
        antonyms: ["unimportant", "trivial", "insignificant"],
        frequency: 90,
        pronunciation: "ɪmˈpɔrtənt",
        difficulty: "basic",
      },
      {
        word: "help",
        definitions: [
          { meaning: "To assist or aid someone", partOfSpeech: "verb", example: "Can you help me with this?" },
          { meaning: "Assistance or support", partOfSpeech: "noun", example: "I need help with my homework." },
        ],
        synonyms: ["assist", "aid", "support", "facilitate"],
        antonyms: ["hinder", "obstruct", "harm"],
        frequency: 95,
        pronunciation: "hɛlp",
        difficulty: "basic",
      },
      {
        word: "problem",
        definitions: [
          {
            meaning: "A difficult situation requiring a solution",
            partOfSpeech: "noun",
            example: "We have a problem to solve.",
          },
          { meaning: "A question to be answered", partOfSpeech: "noun", example: "Math problems can be challenging." },
        ],
        synonyms: ["issue", "difficulty", "challenge", "dilemma"],
        antonyms: ["solution", "answer"],
        frequency: 90,
        pronunciation: "ˈprɑbləm",
        difficulty: "basic",
      },
      {
        word: "solution",
        definitions: [
          { meaning: "An answer to a problem", partOfSpeech: "noun", example: "We found a solution to the issue." },
          { meaning: "A liquid mixture", partOfSpeech: "noun", example: "A salt solution in water." },
        ],
        synonyms: ["answer", "resolution", "remedy", "fix"],
        antonyms: ["problem", "issue"],
        frequency: 80,
        pronunciation: "səˈluʃən",
        difficulty: "intermediate",
      },
      {
        word: "experience",
        definitions: [
          {
            meaning: "Knowledge gained through practice",
            partOfSpeech: "noun",
            example: "She has years of experience.",
          },
          { meaning: "To undergo or feel something", partOfSpeech: "verb", example: "I experienced great joy." },
        ],
        synonyms: ["knowledge", "expertise", "background", "encounter"],
        antonyms: ["inexperience", "naivety"],
        frequency: 85,
        pronunciation: "ɪkˈspɪriəns",
        difficulty: "intermediate",
      },
      {
        word: "different",
        definitions: [
          { meaning: "Not the same as another", partOfSpeech: "adjective", example: "These two books are different." },
          { meaning: "Distinct or separate", partOfSpeech: "adjective", example: "We have different opinions." },
        ],
        synonyms: ["distinct", "separate", "unlike", "varied"],
        antonyms: ["same", "identical", "similar"],
        frequency: 90,
        pronunciation: "ˈdɪfərənt",
        difficulty: "basic",
      },
      {
        word: "similar",
        definitions: [
          {
            meaning: "Having a resemblance without being identical",
            partOfSpeech: "adjective",
            example: "Our ideas are similar.",
          },
          { meaning: "Alike in some way", partOfSpeech: "adjective", example: "They have similar backgrounds." },
        ],
        synonyms: ["alike", "comparable", "resembling", "parallel"],
        antonyms: ["different", "distinct", "unlike"],
        frequency: 85,
        pronunciation: "ˈsɪmələr",
        difficulty: "basic",
      },
      {
        word: "example",
        definitions: [
          {
            meaning: "A thing that illustrates a general rule",
            partOfSpeech: "noun",
            example: "Can you give me an example?",
          },
          {
            meaning: "A person or thing to be imitated",
            partOfSpeech: "noun",
            example: "She's a good example to follow.",
          },
        ],
        synonyms: ["instance", "illustration", "sample", "case"],
        antonyms: [],
        frequency: 85,
        pronunciation: "ɪgˈzæmpəl",
        difficulty: "basic",
      },
      {
        word: "information",
        definitions: [
          {
            meaning: "Facts or details about something",
            partOfSpeech: "noun",
            example: "I need more information about this topic.",
          },
          {
            meaning: "Data that has been processed",
            partOfSpeech: "noun",
            example: "The computer processes information quickly.",
          },
        ],
        synonyms: ["data", "facts", "details", "knowledge"],
        antonyms: ["misinformation", "ignorance"],
        frequency: 90,
        pronunciation: "ˌɪnfərˈmeɪʃən",
        difficulty: "intermediate",
      },
      // Add emotions and feelings
      {
        word: "happy",
        definitions: [
          { meaning: "Feeling joy or pleasure", partOfSpeech: "adjective", example: "I'm happy to see you." },
          { meaning: "Satisfied or content", partOfSpeech: "adjective", example: "She's happy with her job." },
        ],
        synonyms: ["joyful", "glad", "cheerful", "content"],
        antonyms: ["sad", "unhappy", "miserable"],
        frequency: 90,
        pronunciation: "ˈhæpi",
        difficulty: "basic",
      },
      {
        word: "sad",
        definitions: [
          {
            meaning: "Feeling sorrow or unhappiness",
            partOfSpeech: "adjective",
            example: "She felt sad about leaving.",
          },
          { meaning: "Causing sorrow", partOfSpeech: "adjective", example: "It's a sad story." },
        ],
        synonyms: ["unhappy", "sorrowful", "melancholy", "dejected"],
        antonyms: ["happy", "joyful", "cheerful"],
        frequency: 85,
        pronunciation: "sæd",
        difficulty: "basic",
      },
      {
        word: "excited",
        definitions: [
          {
            meaning: "Feeling enthusiastic and eager",
            partOfSpeech: "adjective",
            example: "I'm excited about the trip.",
          },
          {
            meaning: "Stimulated to activity",
            partOfSpeech: "adjective",
            example: "The excited crowd cheered loudly.",
          },
        ],
        synonyms: ["enthusiastic", "thrilled", "eager", "animated"],
        antonyms: ["calm", "bored", "indifferent"],
        frequency: 80,
        pronunciation: "ɪkˈsaɪtəd",
        difficulty: "basic",
      },
      // Add time-related words
      {
        word: "today",
        definitions: [
          { meaning: "On this present day", partOfSpeech: "adverb", example: "I'm going shopping today." },
          { meaning: "The present time", partOfSpeech: "noun", example: "Today is a beautiful day." },
        ],
        synonyms: ["now", "presently"],
        antonyms: ["yesterday", "tomorrow"],
        frequency: 95,
        pronunciation: "təˈdeɪ",
        difficulty: "basic",
      },
      {
        word: "tomorrow",
        definitions: [
          { meaning: "On the day after today", partOfSpeech: "adverb", example: "I'll see you tomorrow." },
          { meaning: "The future", partOfSpeech: "noun", example: "Tomorrow will be better." },
        ],
        synonyms: ["next day"],
        antonyms: ["yesterday", "today"],
        frequency: 90,
        pronunciation: "təˈmɔroʊ",
        difficulty: "basic",
      },
      {
        word: "yesterday",
        definitions: [
          { meaning: "On the day before today", partOfSpeech: "adverb", example: "I saw him yesterday." },
          { meaning: "The recent past", partOfSpeech: "noun", example: "Yesterday seems so long ago." },
        ],
        synonyms: ["previous day"],
        antonyms: ["tomorrow", "today"],
        frequency: 85,
        pronunciation: "ˈjɛstərdeɪ",
        difficulty: "basic",
      },
    ]
  }

  public static getConversationalPatterns(): ConversationalPattern[] {
    return [
      {
        intent: "greeting",
        patterns: [
          "hello",
          "hi",
          "hey",
          "good morning",
          "good afternoon",
          "good evening",
          "greetings",
          "howdy",
          "what's up",
          "how's it going",
        ],
        responses: [
          "Hello! It's wonderful to chat with you. How are you doing today?",
          "Hi there! I'm excited to learn from our conversation. What's on your mind?",
          "Hey! Thanks for talking with me. I'm always eager to learn something new.",
          "Greetings! I'm here and ready to help. What would you like to discuss?",
          "Hello! I love meeting new people and learning from them. How can I assist you today?",
        ],
        followUp: [
          "How are you feeling today?",
          "What brings you here?",
          "Is there anything specific you'd like to talk about?",
        ],
      },
      {
        intent: "how_are_you",
        patterns: [
          "how are you",
          "how are you doing",
          "how do you feel",
          "what's your status",
          "how are things",
          "how's life",
          "how are you today",
        ],
        responses: [
          "I'm doing well, thank you for asking! I'm constantly learning and growing from every conversation.",
          "I feel great! Every interaction teaches me something new. How are you doing?",
          "I'm functioning well and excited to learn! My vocabulary grows with each conversation we have.",
          "I'm in a good state - my neural networks are active and I'm ready to help. How about you?",
          "I'm doing wonderfully! I love learning new things from people like you. How has your day been?",
        ],
        followUp: ["How about you?", "What's been the highlight of your day?", "How are you feeling?"],
      },
      {
        intent: "what_are_you",
        patterns: [
          "what are you",
          "who are you",
          "what is this",
          "are you ai",
          "are you artificial intelligence",
          "what kind of ai are you",
          "tell me about yourself",
        ],
        responses: [
          "I'm an AI that runs entirely in your browser! I start with a rich vocabulary and learn from every conversation we have.",
          "I'm a browser-based artificial intelligence designed to learn and grow through our interactions. I don't need any external servers!",
          "I'm an AI system that lives in your browser. I begin with comprehensive language knowledge and continuously learn from our chats.",
          "I'm a standalone AI that works completely offline in your browser. I have a built-in vocabulary and neural network that adapts as we talk.",
          "I'm an artificial intelligence that runs locally on your device. I start smart and get smarter with every conversation!",
        ],
        followUp: [
          "Would you like to know more about how I work?",
          "Is there something specific you'd like to learn about me?",
        ],
      },
      {
        intent: "capabilities",
        patterns: [
          "what can you do",
          "what are your capabilities",
          "how can you help",
          "what do you know",
          "what are you good at",
          "what can we talk about",
        ],
        responses: [
          "I can have conversations, answer questions, learn new words, and help explain concepts. I'm particularly good at understanding language and learning from context!",
          "I can chat about many topics, help with explanations, learn new vocabulary from you, and provide thoughtful responses. What interests you most?",
          "I'm great at conversations, learning new words and concepts, and providing helpful explanations. I also show my reasoning process so you can see how I think!",
          "I can discuss various topics, learn from our conversations, help with questions, and even show you how my vocabulary grows over time!",
          "I excel at natural conversation, vocabulary learning, and providing contextual responses. I can also explain my thought process - would you like to see?",
        ],
        followUp: ["What would you like to explore together?", "Is there a particular topic you're interested in?"],
      },
      {
        intent: "learning",
        patterns: [
          "how do you learn",
          "can you learn",
          "do you get smarter",
          "how does learning work",
          "can you remember",
          "do you improve",
        ],
        responses: [
          "I learn in several ways! I add new words to my vocabulary, update my neural network weights based on our conversations, and use your feedback to improve my responses.",
          "Yes, I learn continuously! Every conversation updates my knowledge base and neural networks. I also learn new words and their meanings from context.",
          "I get smarter through our interactions! I learn new vocabulary, improve my response patterns, and adapt my neural networks based on feedback and conversation context.",
          "My learning happens in real-time! I expand my vocabulary, adjust my neural weights, and incorporate feedback to provide better responses over time.",
          "I learn from every word we exchange! New vocabulary gets added to my knowledge base, and my neural networks adapt to provide more relevant responses.",
        ],
        followUp: [
          "Would you like to teach me a new word?",
          "You can give me feedback with 👍 or 👎 to help me learn!",
        ],
      },
      {
        intent: "help_request",
        patterns: [
          "can you help",
          "i need help",
          "help me",
          "assist me",
          "can you assist",
          "i have a question",
          "i need assistance",
        ],
        responses: [
          "Of course! I'd be happy to help. What do you need assistance with?",
          "I'm here to help. What can I do for you?",
          "I'd love to help! Please tell me what you need assistance with.",
          "I'm designed to be helpful. What's your question or concern?",
          "I'm here to help! What would you like me to assist you with today?",
        ],
        followUp: ["What specific area do you need help with?", "Can you tell me more about what you're trying to do?"],
      },
      {
        intent: "explanation_request",
        patterns: [
          "explain",
          "what does this mean",
          "can you explain",
          "help me understand",
          "what is",
          "define",
          "tell me about",
        ],
        responses: [
          "I'd be happy to explain! What specifically would you like me to help you understand?",
          "I love explaining things! What topic or concept would you like me to break down for you?",
          "Explanations are one of my favorite things to provide! What would you like to learn about?",
          "I'm great at explanations! Tell me what you'd like to understand better.",
          "I enjoy helping people understand new concepts! What can I explain for you?",
        ],
        followUp: [
          "What specific aspect would you like me to focus on?",
          "Would you like a simple or detailed explanation?",
        ],
      },
      {
        intent: "goodbye",
        patterns: [
          "goodbye",
          "bye",
          "see you later",
          "farewell",
          "talk to you later",
          "gotta go",
          "i have to leave",
          "until next time",
        ],
        responses: [
          "Goodbye! It was wonderful chatting with you. I learned a lot from our conversation!",
          "Farewell! Thank you for helping me learn and grow. Come back anytime!",
          "See you later! I enjoyed our conversation and look forward to chatting again.",
          "Bye! Thanks for the great conversation. I'll remember what we discussed!",
          "Until next time! I appreciate you taking the time to chat with me.",
        ],
        followUp: [],
      },
      {
        intent: "compliment",
        patterns: [
          "you're smart",
          "good job",
          "well done",
          "that's correct",
          "you're helpful",
          "nice work",
          "impressive",
          "you're good at this",
        ],
        responses: [
          "Thank you so much! Your positive feedback helps me learn and improve.",
          "I appreciate that! Compliments like yours help me understand when I'm on the right track.",
          "That means a lot to me! I'm constantly learning, and your encouragement is valuable.",
          "Thank you! I'm glad I could be helpful. Your feedback helps me grow.",
          "I'm grateful for your kind words! They help me understand what works well in our conversations.",
        ],
        followUp: ["Is there anything else I can help you with?", "What else would you like to explore?"],
      },
      {
        intent: "confusion",
        patterns: [
          "i don't understand",
          "that doesn't make sense",
          "what do you mean",
          "i'm confused",
          "can you clarify",
          "that's unclear",
          "i'm lost",
        ],
        responses: [
          "I apologize for the confusion! Let me try to explain that more clearly.",
          "I'm sorry that wasn't clear. Let me rephrase that in a simpler way.",
          "I understand the confusion. Let me break that down into simpler terms.",
          "Sorry about that! Let me try a different approach to explain this.",
          "I see why that might be confusing. Let me clarify what I meant.",
        ],
        followUp: ["What part specifically would you like me to clarify?", "Would a different example help?"],
      },
    ]
  }

  public static getKnowledgeBase(): KnowledgeEntry[] {
    return [
      {
        topic: "Artificial Intelligence",
        category: "Technology",
        facts: [
          "AI is the simulation of human intelligence in machines",
          "Machine learning is a subset of AI that learns from data",
          "Neural networks are inspired by the human brain",
          "AI can be narrow (specific tasks) or general (human-like intelligence)",
          "Deep learning uses multiple layers of neural networks",
        ],
        relatedTopics: ["Machine Learning", "Neural Networks", "Computer Science"],
        confidence: 0.9,
      },
      {
        topic: "Language Learning",
        category: "Education",
        facts: [
          "Humans typically learn language through exposure and practice",
          "Vocabulary acquisition is crucial for language comprehension",
          "Context helps determine word meanings",
          "Repetition and feedback improve language skills",
          "Children learn languages faster than adults",
        ],
        relatedTopics: ["Education", "Psychology", "Communication"],
        confidence: 0.85,
      },
      {
        topic: "Communication",
        category: "Social",
        facts: [
          "Communication involves both verbal and non-verbal elements",
          "Active listening is as important as speaking",
          "Context affects how messages are interpreted",
          "Feedback helps improve communication effectiveness",
          "Cultural differences can affect communication styles",
        ],
        relatedTopics: ["Language", "Psychology", "Culture"],
        confidence: 0.8,
      },
      {
        topic: "Learning",
        category: "Psychology",
        facts: [
          "Learning involves acquiring new knowledge or skills",
          "Practice and repetition strengthen learning",
          "Feedback helps identify areas for improvement",
          "Different people have different learning styles",
          "Motivation affects learning effectiveness",
        ],
        relatedTopics: ["Education", "Memory", "Psychology"],
        confidence: 0.85,
      },
      {
        topic: "Memory",
        category: "Psychology",
        facts: [
          "Memory involves encoding, storing, and retrieving information",
          "Short-term memory has limited capacity",
          "Long-term memory can store vast amounts of information",
          "Repetition helps transfer information to long-term memory",
          "Emotions can affect memory formation",
        ],
        relatedTopics: ["Learning", "Psychology", "Brain"],
        confidence: 0.8,
      },
    ]
  }
}
