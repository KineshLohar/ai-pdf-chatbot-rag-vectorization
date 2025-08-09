export default function PdfViewer({ url }: { url: string | null }) {

    if(!url) return ;
    
    return (
      <iframe
        src={url}
        className="w-full h-full"
        title="PDF Preview"
        frameBorder="0"
      />
    )
  }
  