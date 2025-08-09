export default function MessageBubble({ role, text }: { role: "user" | "ai"; text: string }) {
    const isUser = role === "user"
  
    return (
      <div
        className={`max-w-[75%] p-3 rounded-xl text-sm ${
          isUser
            ? "bg-blue-500 text-white self-end ml-auto"
            : "bg-gray-200 text-black self-start mr-auto"
        }`}
      >
        {text}
      </div>
    )
  }
  