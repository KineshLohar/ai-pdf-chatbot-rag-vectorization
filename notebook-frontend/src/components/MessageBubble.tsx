import { Button } from "./ui/button";

export default function MessageBubble({ role, text, page, onMentionPage, citations }
  : { role: "user" | "ai"; text: string, page?: number, onMentionPage: (data: number | null) => void, citations: number[] }) {
  const isUser = role === "user"

  return (
    <div
      className={`max-w-[75%] p-3 rounded-xl text-sm ${isUser
        ? "bg-blue-500 text-white self-end ml-auto"
        : "bg-gray-200 text-black self-start mr-auto"
        }`}
    >
      {text}
      {/* {!isUser && <Button onClick={() => {
        console.log("PAGE ON CLICK", page);

        onMentionPage(page || null)
      }} className="mt-2 cursor-pointer" variant="ghost" >
        Page {page}
      </Button>} */}

      <div className="flex items-center gap-4">

        {
          !isUser && citations?.length > 0 && citations?.map(item => (
            <Button onClick={() => {
              console.log("PAGE ON CLICK", item);

              onMentionPage(item || null)
            }} className="mt-2 cursor-pointer" variant="ghost" >
              Page {item}
            </Button>
          ))
        }
      </div>
    </div>
  )
}
