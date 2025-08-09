import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { useEffect, useState } from "react";

interface PdfViewerProps {
  url: string | null;
  scrollToPage: number | null;
}

export default function PdfViewer({ url, scrollToPage }: PdfViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const [numPages, setNumPages] = useState<number>(0);

  if (!url) return <div>Loading PDF...</div>;

  useEffect(() => {
    if (scrollToPage && scrollToPage > 0 && scrollToPage <= numPages) {
      pageNavigationPluginInstance.jumpToPage(scrollToPage - 1); // 0-based index
    }
  }, [scrollToPage, numPages]);

  return (
    <div>
  
      <div
        style={{
          height: "700px",
          border: "1px solid #ccc",
        }}
      >
        <Worker
          workerUrl={`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion()}/pdf.worker.min.js`}
        >
          <Viewer
            fileUrl={url}
            plugins={[defaultLayoutPluginInstance, pageNavigationPluginInstance]} // Pass plugin here
            onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
          />
        </Worker>
      </div>
    </div>
  );
}

function pdfjsVersion() {
  return "3.7.107";
}
