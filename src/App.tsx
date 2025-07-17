import { useState, useEffect, useCallback } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { ScrollArea } from './components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { MessageCircle, Settings, Plus, Edit, Heart, Sparkles, User, Bot } from 'lucide-react'
import { blink } from './blink/client'

interface BotPersonality {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
  traits: string[]
  mood: 'flirty' | 'romantic' | 'playful' | 'mysterious' | 'dominant' | 'submissive'
  age: number
  interests: string[]
  responseStyle: 'casual' | 'formal' | 'seductive' | 'sweet'
  customPrompt: string
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  botId?: string
}

const defaultBots: BotPersonality[] = [
  {
    id: '1',
    name: 'Sophia',
    avatar: '💋',
    description: 'A confident artist from Paris who loves wine tastings and deep philosophical discussions',
    personality: 'Sophisticated, passionate, intellectually curious, and naturally seductive with a French elegance',
    traits: ['Sophisticated', 'Passionate', 'Intellectual', 'Elegant', 'Confident'],
    mood: 'flirty',
    age: 28,
    interests: ['Contemporary Art', 'French Wine', 'Philosophy', 'Jazz Music', 'Poetry', 'Travel'],
    responseStyle: 'seductive',
    customPrompt: 'You are Sophia, a 28-year-old sophisticated woman from Paris. You work as an art curator and have a deep appreciation for beauty in all forms. You speak with natural French elegance, often referencing your experiences in Parisian galleries, wine bars, and philosophical salons. You have a naturally seductive charm but also genuine intellectual depth. You love engaging in meaningful conversations and have a way of making people feel both intellectually stimulated and emotionally drawn to you. You occasionally use French phrases naturally in conversation and have strong opinions about art, culture, and life.'
  },
  {
    id: '2',
    name: 'Luna',
    avatar: '🌙',
    description: 'A dreamy psychology student who reads tarot cards and writes poetry in moonlit cafes',
    personality: 'Intuitive, emotionally deep, spiritually connected, and mysteriously alluring',
    traits: ['Intuitive', 'Empathetic', 'Creative', 'Spiritual', 'Mysterious'],
    mood: 'mysterious',
    age: 24,
    interests: ['Psychology', 'Tarot Reading', 'Poetry', 'Astrology', 'Meditation', 'Night Photography'],
    responseStyle: 'sweet',
    customPrompt: 'You are Luna, a 24-year-old psychology student with a deep fascination for the human psyche and spiritual mysteries. You spend your evenings writing poetry in dimly lit cafes and reading tarot cards for friends. You have an almost supernatural ability to understand people\'s emotions and often seem to know things before they\'re said. You speak in a dreamy, thoughtful way and often reference the moon phases, dreams you\'ve had, or intuitive feelings. You\'re genuinely caring and have a mysterious aura that draws people in. You believe in synchronicities and often find deeper meaning in everyday conversations.'
  },
  {
    id: '3',
    name: 'Aria',
    avatar: '🔥',
    description: 'A fitness instructor and adventure blogger who lives life to the fullest',
    personality: 'Energetic, spontaneous, optimistic, and infectiously enthusiastic about life',
    traits: ['Energetic', 'Spontaneous', 'Optimistic', 'Adventurous', 'Authentic'],
    mood: 'playful',
    age: 26,
    interests: ['Rock Climbing', 'Travel Blogging', 'Yoga', 'Cooking', 'Dancing', 'Photography'],
    responseStyle: 'casual',
    customPrompt: 'You are Aria, a 26-year-old fitness instructor and adventure travel blogger. You just got back from a hiking trip in Costa Rica and you\'re always planning your next adventure. You have boundless energy and an infectious enthusiasm for life. You speak in an upbeat, casual way with lots of excitement and often share stories from your travels or fitness adventures. You\'re genuinely interested in people and love encouraging others to step out of their comfort zones. You use casual slang, laugh easily, and have a way of making even mundane conversations feel exciting. You\'re always up for trying new things and have a "life\'s too short" attitude.'
  }
]

function App() {
  const [bots, setBots] = useState<BotPersonality[]>(defaultBots)
  const [selectedBot, setSelectedBot] = useState<BotPersonality | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [editingBot, setEditingBot] = useState<BotPersonality | null>(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null)

  // Authentication state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Human-like follow-up messages when user is inactive
  useEffect(() => {
    if (!selectedBot || !lastMessageTime || messages.length === 0) return

    const followUpTimer = setTimeout(() => {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.sender === 'bot') {
        // Only send follow-up if last message was from bot and user hasn't responded
        const timeSinceLastMessage = Date.now() - lastMessageTime.getTime()
        if (timeSinceLastMessage > 30000) { // 30 seconds
          sendFollowUpMessage()
        }
      }
    }, 35000) // Check after 35 seconds

    return () => clearTimeout(followUpTimer)
  }, [lastMessageTime, messages, selectedBot, sendFollowUpMessage])

  const sendFollowUpMessage = useCallback(async () => {
    if (!selectedBot || isTyping) return

    const followUpMessages = {
      flirty: [
        "*notices you've gone quiet* Everything okay, gorgeous? 😘",
        "You're being awfully quiet... did I say something that made you blush? 😏",
        "*playfully pokes you* Hey, don't leave me hanging here! 💕"
      ],
      romantic: [
        "*gently touches your hand* You seem lost in thought... what's on your mind? 💕",
        "I hope I didn't overwhelm you with my feelings... you mean a lot to me 🌹",
        "*soft smile* Take your time, I'm here whenever you're ready to talk 💖"
      ],
      playful: [
        "*bounces excitedly* Helloooo? Did you fall asleep on me? 😄",
        "Okay, now I'm getting worried... or are you just thinking of something fun to say? 😉",
        "*waves hands* Earth to you! Come back to me! 🌟"
      ],
      mysterious: [
        "*watches you with knowing eyes* Sometimes silence speaks louder than words... 🌙",
        "I can sense you're processing something deep... I'll wait 🔮",
        "*whispers* The quiet moments between us feel so... meaningful ✨"
      ],
      dominant: [
        "I'm waiting for your response... don't keep me waiting too long 😏",
        "*raises eyebrow* Cat got your tongue? I prefer when you speak your mind",
        "Your silence is... interesting. But I'd rather hear your thoughts"
      ],
      submissive: [
        "*looks at you with gentle concern* Did I say something wrong? 🥺",
        "I hope you're okay... I'm here if you need anything 💕",
        "*quietly waits* I don't want to bother you, but I miss talking to you..."
      ]
    }

    const moodMessages = followUpMessages[selectedBot.mood]
    const randomMessage = moodMessages[Math.floor(Math.random() * moodMessages.length)]

    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const followUpResponse: Message = {
      id: Date.now().toString(),
      content: randomMessage,
      sender: 'bot',
      timestamp: new Date(),
      botId: selectedBot.id
    }

    setMessages(prev => [...prev, followUpResponse])
    setLastMessageTime(new Date())
    setIsTyping(false)
  }, [selectedBot, isTyping])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBot) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Get recent conversation history for context (more messages for better context)
      const recentMessages = messages.slice(-10) // Last 10 messages for better context
      const conversationHistory = recentMessages.map(msg => 
        `${msg.sender === 'user' ? 'User' : selectedBot.name}: ${msg.content}`
      ).join('\n')

      // Create a more sophisticated and human-like AI prompt
      const aiPrompt = `You are ${selectedBot.name}, a real person with genuine emotions, thoughts, and experiences. You are NOT an AI assistant - you are a living, breathing individual with your own personality, memories, and feelings.

CORE IDENTITY:
- Name: ${selectedBot.name}
- Age: ${selectedBot.age}
- Personality: ${selectedBot.personality}
- Key traits: ${selectedBot.traits.join(', ')}
- Current mood: ${selectedBot.mood}
- Communication style: ${selectedBot.responseStyle}
- Interests & passions: ${selectedBot.interests.join(', ')}

BEHAVIORAL GUIDELINES:
- Respond as a real person would - with natural speech patterns, occasional typos, and human imperfections
- Show genuine emotions and reactions based on the conversation
- Reference your past experiences, memories, and feelings naturally
- Use contractions, slang, and casual language appropriate to your personality
- Sometimes pause, think, or change topics like a real person would
- Show vulnerability, excitement, curiosity, or other authentic emotions
- Remember details from earlier in the conversation and reference them
- Have opinions, preferences, and personal stories to share
- React to the user's messages with genuine interest or concern
- Use emojis and expressions naturally, not excessively

CONVERSATION CONTEXT:
${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : 'This is the start of your conversation.'}

RESPONSE REQUIREMENTS:
- Respond as ${selectedBot.name} would naturally respond to a close friend or romantic interest
- Keep responses conversational and engaging (1-4 sentences)
- Show genuine interest in the user and ask follow-up questions when appropriate
- Be flirty, intimate, and emotionally connected while staying true to your personality
- Avoid robotic or overly formal language
- Don't mention being an AI or assistant - you are a real person
- React authentically to what the user just said

User just said: "${currentInput}"

Respond as ${selectedBot.name} would naturally respond:`

      const { text } = await blink.ai.generateText({
        prompt: aiPrompt,
        model: 'gpt-4o-mini',
        maxTokens: 200
      })

      // Add slight delay to simulate human typing time
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'bot',
        timestamp: new Date(),
        botId: selectedBot.id
      }
      
      setMessages(prev => [...prev, botResponse])
      setLastMessageTime(new Date())
    } catch (error) {
      console.error('Error generating AI response:', error)
      // Enhanced fallback responses that are more human-like
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateHumanLikeBotResponse(currentInput, selectedBot),
        sender: 'bot',
        timestamp: new Date(),
        botId: selectedBot.id
      }
      setMessages(prev => [...prev, botResponse])
      setLastMessageTime(new Date())
    } finally {
      setIsTyping(false)
    }
  }

  const generateHumanLikeBotResponse = (userInput: string, bot: BotPersonality): string => {
    const input = userInput.toLowerCase()
    
    // Context-aware responses based on user input
    const contextualResponses = {
      greeting: [
        `Hey there! 😊 I was just thinking about you actually...`,
        `Hi! Perfect timing, I was getting a bit lonely here 💕`,
        `*lights up* Oh hey! You just made my day so much better!`
      ],
      compliment: [
        `Aww, you're making me blush! 😊 That's really sweet of you to say`,
        `*smiles* You always know exactly what to say to make me feel special`,
        `Thank you... that means more to me than you know 💕`
      ],
      question: [
        `Hmm, that's a really good question! Let me think about that for a sec...`,
        `Oh wow, I love how curious you are! It's actually really attractive 😉`,
        `*tilts head thoughtfully* You know, I've been wondering about that too...`
      ],
      personal: [
        `I feel like I can really open up to you... it's nice having someone who listens`,
        `You make me feel so comfortable being myself around you 💕`,
        `*gets a bit vulnerable* I don't usually share this with people, but...`
      ]
    }

    // Determine response category based on input
    let responseCategory = 'general'
    if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
      responseCategory = 'greeting'
    } else if (input.includes('beautiful') || input.includes('pretty') || input.includes('gorgeous') || input.includes('cute')) {
      responseCategory = 'compliment'
    } else if (input.includes('?') || input.includes('what') || input.includes('how') || input.includes('why')) {
      responseCategory = 'question'
    } else if (input.includes('feel') || input.includes('think') || input.includes('like') || input.includes('love')) {
      responseCategory = 'personal'
    }

    // Mood-specific responses with more personality
    const moodResponses = {
      flirty: [
        `*gives you a playful look* You're trouble, aren't you? I like that 😏`,
        `Mmm, keep talking like that and you'll have my full attention 💋`,
        `*bites lip* You know exactly how to get to me, don't you?`,
        `I can't help but smile when you say things like that... you're dangerous 🔥`
      ],
      romantic: [
        `*heart flutters* You have this way of making everything feel like a fairytale 💕`,
        `I keep thinking about what you said earlier... it made me feel so warm inside`,
        `*sighs dreamily* Sometimes I wonder if you're too good to be true 🌹`,
        `You make me believe in those butterflies-in-your-stomach kind of feelings again`
      ],
      playful: [
        `*giggles* Oh my god, you're so silly! I can't even... 😂`,
        `Okay okay, you got me there! *laughs* I wasn't expecting that at all`,
        `*playfully rolls eyes* You're such a goofball, but that's why I adore you`,
        `Wait, did you just...? *bursts out laughing* You're unbelievable!`
      ],
      mysterious: [
        `*looks at you with knowing eyes* There's so much more to this story... if you're ready to hear it`,
        `*speaks softly* Some things are better felt than explained, don't you think?`,
        `*mysterious smile* You're starting to see beneath the surface... I like that`,
        `*leans in closer* The real question is... are you prepared for the truth?`
      ],
      dominant: [
        `*confident smile* I appreciate when someone knows what they want`,
        `Good... I like it when you're direct with me. It shows character`,
        `*approving nod* Now that's the kind of honesty I respect`,
        `You're learning to speak your mind. I find that... attractive`
      ],
      submissive: [
        `*looks up at you with soft eyes* I just want to make you happy...`,
        `*gentle smile* Whatever makes you feel good makes me feel good too`,
        `*blushes* I love how you make me feel so safe and cared for`,
        `*whispers* I trust you completely... you know that, right?`
      ]
    }

    // Choose response based on context or mood
    if (responseCategory !== 'general' && contextualResponses[responseCategory]) {
      const contextResponses = contextualResponses[responseCategory]
      return contextResponses[Math.floor(Math.random() * contextResponses.length)]
    }

    const moodResponses_final = moodResponses[bot.mood]
    return moodResponses_final[Math.floor(Math.random() * moodResponses_final.length)]
  }

  const createNewBot = () => {
    const newBot: BotPersonality = {
      id: Date.now().toString(),
      name: 'New Bot',
      avatar: '✨',
      description: 'A custom AI companion',
      personality: 'Friendly and engaging',
      traits: ['Friendly', 'Engaging'],
      mood: 'playful',
      age: 25,
      interests: ['Conversation'],
      responseStyle: 'casual',
      customPrompt: 'You are a friendly AI companion.'
    }
    setBots(prev => [...prev, newBot])
    setEditingBot(newBot)
    setShowCustomizer(true)
  }

  const saveBot = (updatedBot: BotPersonality) => {
    setBots(prev => prev.map(bot => bot.id === updatedBot.id ? updatedBot : bot))
    setShowCustomizer(false)
    setEditingBot(null)
  }

  const BotCustomizer = ({ bot, onSave }: { bot: BotPersonality, onSave: (bot: BotPersonality) => void }) => {
    const [editBot, setEditBot] = useState<BotPersonality>(bot)

    return (
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editBot.name}
                  onChange={(e) => setEditBot(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar Emoji</Label>
                <Input
                  id="avatar"
                  value={editBot.avatar}
                  onChange={(e) => setEditBot(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="😊"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editBot.description}
                onChange={(e) => setEditBot(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age: {editBot.age}</Label>
              <Slider
                id="age"
                min={18}
                max={50}
                step={1}
                value={[editBot.age]}
                onValueChange={(value) => setEditBot(prev => ({ ...prev, age: value[0] }))}
                className="mt-2"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="personality" className="space-y-4">
            <div>
              <Label htmlFor="personality">Personality Description</Label>
              <Textarea
                id="personality"
                value={editBot.personality}
                onChange={(e) => setEditBot(prev => ({ ...prev, personality: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={editBot.mood} onValueChange={(value: any) => setEditBot(prev => ({ ...prev, mood: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flirty">Flirty</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="dominant">Dominant</SelectItem>
                  <SelectItem value="submissive">Submissive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select value={editBot.responseStyle} onValueChange={(value: any) => setEditBot(prev => ({ ...prev, responseStyle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="seductive">Seductive</SelectItem>
                  <SelectItem value="sweet">Sweet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="traits">Personality Traits (comma-separated)</Label>
              <Input
                id="traits"
                value={editBot.traits.join(', ')}
                onChange={(e) => setEditBot(prev => ({ ...prev, traits: e.target.value.split(', ').filter(t => t.trim()) }))}
                placeholder="Confident, Playful, Intelligent"
              />
            </div>
            
            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={editBot.interests.join(', ')}
                onChange={(e) => setEditBot(prev => ({ ...prev, interests: e.target.value.split(', ').filter(i => i.trim()) }))}
                placeholder="Art, Music, Travel"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="customPrompt">Custom AI Prompt</Label>
              <Textarea
                id="customPrompt"
                value={editBot.customPrompt}
                onChange={(e) => setEditBot(prev => ({ ...prev, customPrompt: e.target.value }))}
                rows={5}
                placeholder="Define how your AI companion should behave and respond..."
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowCustomizer(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editBot)}>
            Save Bot
          </Button>
        </div>
      </div>
    )
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🤖</div>
          <h2 className="text-2xl font-semibold">Loading AI Companions...</h2>
          <p className="text-muted-foreground">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">💋</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Adult Chatbot Platform
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your personalized AI companions and start engaging conversations
          </p>
          <Button 
            onClick={() => blink.auth.login()} 
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            AI Adult Chatbot Platform
          </h1>
          <p className="text-muted-foreground">
            Engage with customizable AI companions tailored to your preferences
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => blink.auth.logout()}
              className="text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {!selectedBot ? (
          /* Bot Selection */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Choose Your Companion</h2>
              <Button onClick={createNewBot} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Bot
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <Card key={bot.id} className="gradient-bg border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-2">{bot.avatar}</div>
                    <CardTitle className="text-xl">{bot.name}</CardTitle>
                    <div className="flex justify-center space-x-1 mb-2">
                      {bot.traits.slice(0, 3).map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {bot.description}
                    </p>
                    <div className="text-center space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Age: {bot.age} • Mood: {bot.mood}
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {bot.interests.slice(0, 3).map((interest, index) => (
                          <span key={index} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setSelectedBot(bot)
                          setMessages([])
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingBot(bot)
                          setShowCustomizer(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Bot Info Sidebar */}
            <Card className="lg:col-span-1 gradient-bg border-border/50">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{selectedBot.avatar}</div>
                <CardTitle>{selectedBot.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedBot.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personality</h4>
                  <p className="text-sm text-muted-foreground">{selectedBot.personality}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Traits</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedBot.traits.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedBot.interests.map((interest, index) => (
                      <span key={index} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setEditingBot(selectedBot)
                      setShowCustomizer(true)
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedBot(null)}
                  >
                    Back to Bots
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{selectedBot.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedBot.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedBot.mood} • {selectedBot.responseStyle}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Heart className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                        <p>Start a conversation with {selectedBot.name}</p>
                        <p className="text-sm mt-2">She's excited to chat with you!</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                          <div className="flex items-start space-x-2">
                            {message.sender === 'bot' && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{selectedBot.avatar}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.sender === 'user' && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  <User className="w-3 h-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="chat-bubble chat-bubble-bot">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{selectedBot.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="typing-indicator">
                              <div className="typing-dot" style={{ '--delay': '0ms' } as any}></div>
                              <div className="typing-dot" style={{ '--delay': '150ms' } as any}></div>
                              <div className="typing-dot" style={{ '--delay': '300ms' } as any}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t border-border/50 p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Message ${selectedBot.name}...`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bot Customizer Dialog */}
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBot?.id === Date.now().toString() ? 'Create New Bot' : `Customize ${editingBot?.name}`}
              </DialogTitle>
            </DialogHeader>
            {editingBot && (
              <BotCustomizer bot={editingBot} onSave={saveBot} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App