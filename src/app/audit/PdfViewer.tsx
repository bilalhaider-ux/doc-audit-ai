"use client";

import { useEffect, useState, useMemo } from "react";

interface PdfViewerProps {
  file: File | null;
  onDownloadReport?: () => void;
}

export default function PdfViewer({ file, onDownloadReport }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);

  // Create a stable blob URL from the file
  const blobUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : "";
  }, [file]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!file) {
    return (
      <section className="hidden md:flex flex-1 bg-surface-container-lowest items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">visibility_off</span>
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">Preview Not Available</h3>
          <p className="text-sm text-on-surface-variant">
            The PDF document is not available in History mode because it is not saved to protect your privacy and save device space.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-[30vh] sm:h-[35vh] md:h-auto md:flex-1 shrink-0 bg-surface-container-lowest flex flex-col overflow-hidden relative border-b md:border-b-0 border-outline-variant">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 md:px-4 py-2 md:py-2.5 bg-surface border-b border-outline-variant z-10 gap-1.5 md:gap-2 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <span className="material-symbols-outlined text-error text-[18px] md:text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
          <span className="text-[12px] md:text-[13px] text-on-surface font-medium truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">{file.name}</span>
          <span className="text-[10px] md:text-[11px] text-on-surface-variant shrink-0">
            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          {onDownloadReport ? (
            <button
              onClick={onDownloadReport}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 border border-outline-variant rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-colors text-[11px] md:text-[12px]"
            >
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">download</span>
              <span className="hidden sm:inline">Download</span> Report
            </button>
          ) : (
            <a
              href={blobUrl}
              download={file.name}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 border border-outline-variant rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-colors text-[11px] md:text-[12px]"
            >
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">download</span>
              Download
            </a>
          )}
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 border border-outline-variant rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-colors text-[11px] md:text-[12px]"
          >
            <span className="material-symbols-outlined text-[14px] md:text-[16px]">open_in_new</span>
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
