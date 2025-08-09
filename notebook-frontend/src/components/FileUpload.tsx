import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function FileUpload({ onUpload }: { onUpload: (file: File) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false)

    const handleUpload = async () => {
        if (!file) return

        if (file.type !== "application/pdf") {
            toast("Please upload a valid PDF file")
            return
        }
        setLoading(true);
        await onUpload(file);
        setLoading(false);
    }

    return (

        <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
                Upload your PDF
            </h2>

            <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-4"
            />

            <Button
                disabled={!file || loading}
                onClick={handleUpload}
                className="w-full"
            >
                {loading ? "Uploading" : "Upload PDF"}
            </Button>
        </div>

    )
}
