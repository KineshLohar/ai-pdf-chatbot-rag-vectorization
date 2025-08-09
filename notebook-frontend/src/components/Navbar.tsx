import { Button } from "@/components/ui/button"
import { useState } from "react";
import UploadModal from "./UploadModal";

export default function Navbar({ onUpload }: { onUpload: (file: File) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full p-4 border-b flex justify-between items-center">
      <h1 className="text-xl font-bold">Ask PDF</h1>
      <Button variant="outline" onClick={() => setOpen(true)}>Upload New PDF</Button>
      {open && (
        <UploadModal
          open={open}
          onClose={() => setOpen(false)}
          onUpload={(file: File) => {
            onUpload(file)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
