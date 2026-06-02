"use client";

import { useEffect, useState, useMemo } from "react";

interface PdfViewerProps {
  file: File;
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);

  // Create a stable blob URL from the file
  const blobUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <section className="flex-1 bg-surface-container-lowest flex flex-col overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex justify-between items-center px-4 py-2.5 bg-surface border-b border-outline-variant z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
          <span className="text-[13px] text-on-surface font-medium truncate max-w-[200px]">{file.name}</span>
          <span className="text-[11px] text-on-surface-variant">
            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={blobUrl}
            download={file.name}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-colors text-[12px]"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download
          </a>
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-colors text-[12px]"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Open
          </a>
        </div>
      </div>

      {/* PDF Embed */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10 animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[28px]">picture_as_pdf</span>
              </div>
              <p className="text-[13px] text-on-surface-variant">Loading document...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${blobUrl}#toolbar=0&navpanes=0`}
          className="w-full h-full border-none"
          title="PDF Viewer"
          onLoad={() => setLoading(false)}
        />
      </div>
    </section>
  );
}
