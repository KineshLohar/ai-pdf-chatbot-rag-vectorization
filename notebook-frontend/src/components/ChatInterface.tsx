import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import MessageBubble from "./MessageBubble";
import { instance } from "@/api";

type Message = {
  role: "user" | "ai"
  text: string,
  page?: number,
  citations?: number[] | null | []
}

export default function ChatInterface({ pdfId, onMentionPage }: { pdfId: string, onMentionPage: (page: number | null) => void  }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMessages([]);
  },[pdfId])

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessage: Message = { role: "user", text: input }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await instance.post("/ask", { pdfId, question: input });
      console.log("RES of ask ", res);

      const data = await res.data;
      setMessages((prev) => [...prev, { role: "ai", text: data.answer, page: data?.mentionedPage, citations: data?.citations  }])
      onMentionPage(data.mentionedPage || null)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  console.log("MESAGES ", messages);
  

  return (
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} page={msg?.page} onMentionPage={onMentionPage} citations={msg?.citations} />
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
