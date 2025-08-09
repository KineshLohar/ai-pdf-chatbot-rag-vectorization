import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function UploadModal({ open, onClose, onUpload }: {
  open: boolean
  onClose: () => void
  onUpload: (file: File) => void
}) {
  const [file, setFile] = useState<File | null>(null)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New PDF</DialogTitle>
        </DialogHeader>
        <Input type="file" accept="application/pdf" onChange={(e) => {
          const f = e.target.files?.[0]
          if (f && f.type === "application/pdf") {
            setFile(f)
          } else {
            alert("Upload a valid PDF")
          }
        }} />
        <Button className="mt-2 w-full" onClick={() => file && onUpload(file)} disabled={!file}>
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  )
}
