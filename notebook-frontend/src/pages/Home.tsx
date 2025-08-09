import { instance } from "@/api";
import ChatInterface from "@/components/ChatInterface";
import FileUpload from "@/components/FileUpload";
import Navbar from "@/components/Navbar";
import PdfViewer from "@/components/PdfViewer";
import { useState } from "react";

export default function Main() {
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>("")
    const [pdfId, setPdfId] = useState<string | null>(null)

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await instance.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            console.log("RES OF UPLOAD", res);

            setPdfId(res.data);

            // 👇 Create preview URL
            const previewUrl = URL.createObjectURL(file)
            setPdfPreviewUrl(previewUrl)
        } catch (err) {
            alert("Upload failed")
            console.error(err)
        }
    }

    return (
        <div className="h-screen w-screen flex flex-col">
            <Navbar onUpload={handleUpload} />
            {!pdfId ? (
                <div className="flex-1 flex items-center justify-center">
                    <FileUpload onUpload={handleUpload} />
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 border-r overflow-y-auto">
                        <ChatInterface pdfId={pdfId} />
                    </div>
                    <div className="w-1/2 overflow-y-auto">
                        <PdfViewer url={pdfPreviewUrl} />
                    </div>
                </div>
            )}
        </div>
    )
}
