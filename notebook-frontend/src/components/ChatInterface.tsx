import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "ai"
  text: string
}

export default function ChatInterface({ pdfId }: { pdfId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessage: Message = { role: "user", text: input }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, pdfId }),
      })

      const data = await res.json()
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Input
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button disabled={loading} onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  )
}
