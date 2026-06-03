"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import PdfViewer from "./PdfViewer";
import ThemeToggle from "../components/ThemeToggle";

export default function AuditPage() {
  const [status, setStatus] = useState<"upload" | "loading" | "ready" | "history">("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [summary, setSummary] = useState<string[]>([]);
  const [risks, setRisks] = useState<{title: string, description: string, level: string}[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeMB} MB`);
      setPdfFile(file);
      setStatus("loading");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          setStatus("upload");
          return;
        }
        const newSummary = data.summary || [];
        const newRisks = data.risks || [];
        const newExtractedText = data.extractedText || "";

        setSummary(newSummary);
        setRisks(newRisks);
        setExtractedText(newExtractedText);
        
        // Save to LocalStorage History
        try {
          const newHistoryItem = {
            id: Date.now(),
            fileName: file.name,
            fileSize: `${sizeMB} MB`,
            summary: newSummary,
            risks: newRisks,
            extractedText: newExtractedText.substring(0, 10000), // Limit size
            date: new Date().toLocaleDateString()
          };
          const existingHistory = JSON.parse(localStorage.getItem('docAuditHistory') || '[]');
          localStorage.setItem('docAuditHistory', JSON.stringify([newHistoryItem, ...existingHistory].slice(0, 10)));
        } catch (e) {
          console.error("Failed to save history", e);
        }

        setStatus("ready");
      } catch (err) {
        console.error(err);
        alert("Failed to analyze document.");
        setStatus("upload");
      }
    }
  }, []);

  // Check for pending file from landing page on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingFile = (window as any).__pendingPdfFile;
      if (pendingFile) {
        handleFile(pendingFile);
        delete (window as any).__pendingPdfFile;
      }
    }
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (status === "upload") {
    return (
      <UploadScreen
        dragActive={dragActive}
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />
    );
  }

  if (status === "loading") {
    return <LoadingScreen fileName={fileName} fileSize={fileSize} />;
  }

  if (status === "history") {
    return (
      <HistoryScreen 
        onBack={() => setStatus("ready")} 
        onSelect={(item) => {
          setFileName(item.fileName);
          setFileSize(item.fileSize);
          setSummary(item.summary);
          setRisks(item.risks);
          setExtractedText(item.extractedText);
          setPdfFile(null); // No PDF blob available from localstorage
          setStatus("ready");
        }} 
      />
    );
  }

  return <DashboardScreen fileName={fileName} fileSize={fileSize} pdfFile={pdfFile} summary={summary} risks={risks} extractedText={extractedText} onOpenHistory={() => setStatus("history")} />;
}

/* ========== HISTORY SCREEN ========== */
function HistoryScreen({ onBack, onSelect }: { onBack: () => void, onSelect: (item: any) => void }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('docAuditHistory') || '[]');
      setHistory(existing);
    } catch (e) { }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('docAuditHistory');
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant h-14 flex items-center px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Upload
        </button>
      </nav>
      <div className="flex-1 max-w-4xl w-full mx-auto pt-24 px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Recent Audits</h1>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-error font-medium hover:underline text-sm">
              Clear History
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant bg-surface-container-low rounded-3xl border border-outline-variant border-dashed">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">history</span>
            <p className="text-lg">No audit history found.</p>
            <p className="text-sm mt-2 opacity-70">Audits are saved locally on your device.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-lg leading-tight">{item.fileName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-on-surface-variant">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-error uppercase tracking-wider mb-1">Risks</span>
                    <span className="text-xl font-bold text-on-surface">{item.risks.length}</span>
                  </div>
                  <div className="w-px bg-outline-variant mx-1"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Status</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-secondary">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Complete
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ========== UPLOAD SCREEN ========== */
function UploadScreen({
  dragActive,
  fileInputRef,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm h-14 flex justify-center transition-all duration-300">
        <div className="max-w-7xl w-full flex justify-between items-center px-4 md:px-6">
          <Link href="/">
            <div className="text-[18px] font-bold text-primary flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
              DocAudit AI
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-14 p-4 md:p-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-xl w-full flex flex-col items-center gap-8 animate-[fade-in_0.6s_ease-out]">
          {/* Title */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-2xl md:text-[28px] font-bold text-on-surface">
              Upload your document
            </h1>
            <p className="text-[14px] text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Drop a PDF and our AI will scan it for risks, summarize clauses, and let you ask questions.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed p-10 md:p-14 flex flex-col items-center gap-5 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
              dragActive
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.01]"
                : "border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
            }`}
          >
            {/* Animated Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              dragActive
                ? "bg-primary text-on-primary scale-110"
                : "bg-primary/10 text-primary group-hover:scale-110"
            }`}>
              <span className="material-symbols-outlined text-[32px] transition-transform duration-500 group-hover:-translate-y-1">
                {dragActive ? "downloading" : "upload_file"}
              </span>
            </div>

            <div className="text-center flex flex-col gap-1">
              <p className="text-[15px] font-semibold text-on-surface">
                {dragActive ? "Drop it here!" : "Drag & drop your PDF"}
              </p>
              <p className="text-[13px] text-on-surface-variant">
                or <span className="text-primary font-medium underline underline-offset-4">browse files</span>
              </p>
            </div>

            {/* File types */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-error">picture_as_pdf</span>
                <span className="text-[11px] text-on-surface-variant font-medium">PDF only</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">straighten</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Max 50 MB</span>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-4 py-2.5 rounded-full border border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span className="text-[11px] font-medium">Encrypted & auto-deleted after 2 hours</span>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ========== LOADING SCREEN ========== */
function LoadingScreen({ fileName, fileSize }: { fileName: string; fileSize: string }) {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 mesh-bg opacity-50"></div>

      <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant relative z-10 animate-[fade-in_0.5s_ease-out]">
        {/* Header */}
        <div className="bg-primary/5 border-b border-outline-variant p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-primary-container/30 rounded-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
            <span className="material-symbols-outlined text-[32px] text-primary">
              document_scanner
            </span>
          </div>
          <h2 className="font-title-lg text-title-lg text-on-surface">Auditing Document</h2>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-error">picture_as_pdf</span>
            <span className="font-label-md text-on-surface truncate max-w-[200px]">{fileName}</span>
            <span className="font-label-md text-on-surface-variant">({fileSize})</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-label-md">
              <span className="text-primary font-bold">Scanning...</span>
              <span className="text-on-surface-variant">65%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out w-[65%]"></div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex flex-col gap-6 relative">
            <div className="stepper-line"></div>

            {/* Step 1: Done */}
            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-lg text-on-surface">Extracting text & metadata</span>
                <span className="font-body-md text-on-surface-variant text-[12px]">Completed in 0.8s</span>
              </div>
            </div>

            {/* Step 2: In Progress */}
            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container border-2 border-primary flex items-center justify-center shrink-0">
                <div className="pulse-dot w-2 h-2"></div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-lg text-on-surface">Analyzing legal clauses</span>
                <span className="font-body-md text-primary text-[12px] font-medium">Processing...</span>
              </div>
            </div>

            {/* Step 3: Pending */}
            <div className="flex gap-4 relative z-10 opacity-50">
              <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-outline-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[14px] text-outline">hourglass_empty</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-lg text-on-surface">Generating risk report</span>
                <span className="font-body-md text-on-surface-variant text-[12px]">Waiting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-surface-container-low p-4 text-center border-t border-outline-variant">
          <p className="font-label-md text-on-surface-variant flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            End-to-end encrypted session
          </p>
        </div>
      </div>
    </main>
  );
}

/* ========== DASHBOARD SCREEN ========== */
function DashboardScreen({ fileName, fileSize, pdfFile, summary, risks, extractedText, onOpenHistory }: { fileName: string; fileSize: string; pdfFile: File | null, summary: string[], risks: any[], extractedText: string, onOpenHistory: () => void }) {
  const [activeTab, setActiveTab] = useState<"summary" | "risks" | "chat">("summary");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    
    const newHistory = [...chatHistory, { role: "user", content: userMessage }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: extractedText,
          message: userMessage,
          chatHistory: chatHistory
        })
      });
      const data = await res.json();
      if (data.reply) {
        setChatHistory([...newHistory, { role: "model", content: data.reply }]);
      } else {
        setChatHistory([...newHistory, { role: "model", content: "Sorry, I encountered an error." }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { role: "model", content: "Failed to connect to AI." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(20);
      doc.text("DocAudit AI - Analysis Report", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Document: ${fileName}`, 14, 32);
      
      // Add Summary Section
      doc.setFontSize(16);
      doc.text("Executive Summary", 14, 45);
      
      doc.setFontSize(11);
      const summaryFormatted = summary.map(s => `• ${s}`);
      doc.text(summaryFormatted, 14, 55, { maxWidth: 180 });
      
      // Calculate Y position for Risks
      let nextY = 55 + (summary.length * 10) + 10;
      
      // Add Risks Section
      doc.setFontSize(16);
      doc.text("Risk Analysis", 14, nextY);
      
      const tableData = risks.map(r => [r.level, r.title, r.description]);
      
      autoTable(doc, {
        startY: nextY + 5,
        head: [['Level', 'Title', 'Description']],
        body: tableData,
        headStyles: { fillColor: [59, 130, 246] }, // primary blue
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 45 },
          2: { cellWidth: 'auto' }
        },
        willDrawCell: function (data) {
          if (data.section === 'body' && data.column.index === 0) {
            if (data.cell.raw === 'High') {
              data.cell.styles.textColor = [220, 38, 38]; // red
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'Medium' || data.cell.raw === 'Med') {
              data.cell.styles.textColor = [217, 119, 6]; // orange
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [37, 99, 235]; // blue
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      
      // Add Watermark to Footer on all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Generated by DocAudit AI", 14, doc.internal.pageSize.height - 10);
      }
      
      doc.save(`${fileName.replace('.pdf', '')}_Audit_Report.pdf`);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export PDF.");
    }
  };

  return (
    <div className="h-screen bg-surface-container-low flex flex-col md:flex-row overflow-hidden animate-[fade-in_0.5s_ease-out] pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden w-16 md:w-20 bg-surface border-r border-outline-variant md:flex flex-col items-center py-6 gap-8 z-20">
        <Link href="/">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary transition-colors text-primary hover:text-on-primary group">
            <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
        </Link>
        <nav className="flex flex-col gap-4 w-full px-2">
          <NavItem icon="dashboard" label="Dashboard" active onClick={() => window.location.reload()} />
          <NavItem icon="folder_open" label="Files" onClick={onOpenHistory} />
          <NavItem icon="settings" label="Settings" onClick={() => alert("Settings panel will be available in the next update!")} />
        </nav>
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant cursor-pointer hover:border-primary transition-colors">
            <span className="font-label-lg text-on-surface">U</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-auto md:h-14 bg-surface border-b border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between px-3 md:px-5 py-2 md:py-0 z-10 shrink-0 gap-2 md:gap-0">
          <div className="flex items-center gap-2 min-w-0 w-full md:w-auto">
            <span className="material-symbols-outlined text-primary text-[20px] md:text-[24px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <div className="flex flex-col truncate min-w-0">
              <h1 className="text-[13px] md:text-[15px] font-semibold text-on-surface truncate leading-tight">{fileName}</h1>
              <span className="text-[10px] md:text-[11px] text-on-surface-variant leading-tight">Processed just now • {fileSize}</span>
            </div>
            <div className="hidden lg:flex ml-3 px-2.5 py-1 bg-secondary-container/20 rounded-full items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
              <span className="text-[11px] font-medium text-secondary">Audit Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <ThemeToggle />
            <div className="w-px h-5 bg-outline-variant/50 hidden lg:block mx-1"></div>
            <button 
              onClick={handleExport}
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 border border-outline-variant rounded-full text-on-surface hover:bg-surface-container-high transition-colors text-[13px] font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
            <div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareMenu(true);
                }}
                className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all text-[12px] md:text-[13px] font-medium shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">share</span>
                Share
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* PDF Viewer - renders actual uploaded PDF */}
          <PdfViewer file={pdfFile} onDownloadReport={handleExport} />

          {/* Right AI Panel */}
          <section className="flex-1 md:w-[400px] lg:w-[420px] md:flex-none border-t md:border-t-0 md:border-l border-outline-variant bg-surface flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
            {/* Panel Tabs */}
            <div className="flex border-b border-outline-variant px-2 pt-2 bg-surface shrink-0 sticky top-0 z-10">
              <TabButton
                label="Summary"
                icon="notes"
                active={activeTab === "summary"}
                onClick={() => setActiveTab("summary")}
              />
              <TabButton
                label="Risks"
                icon="warning"
                active={activeTab === "risks"}
                onClick={() => setActiveTab("risks")}
                badge={risks.length > 0 ? risks.length : undefined}
              />
              <TabButton
                label="Ask AI"
                icon="smart_toy"
                active={activeTab === "chat"}
                onClick={() => setActiveTab("chat")}
              />
            </div>

            {/* Panel Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-surface-container-low pb-20 md:pb-4">
              {activeTab === "risks" && (
                <div className="flex flex-col gap-3 animate-[fade-in_0.3s_ease-out]">
                  {risks.length === 0 ? (
                    <div className="text-center p-6 text-on-surface-variant text-[13px]">No major risks identified in this document.</div>
                  ) : (
                    risks.map((risk, idx) => {
                      const isHigh = risk.level === "High" || risk.level === "High";
                      const isMed = risk.level === "Medium" || risk.level === "Med";
                      
                      let containerClass = "bg-primary/5 border-primary/10";
                      let iconClass = "text-primary";
                      let iconName = "info";
                      let badgeClass = "bg-primary text-on-primary";

                      if (isHigh) {
                        containerClass = "bg-error-container/30 border-error/15";
                        iconClass = "text-error";
                        iconName = "error";
                        badgeClass = "bg-error text-on-error";
                      } else if (isMed) {
                        containerClass = "bg-tertiary-container/20 border-tertiary/15";
                        iconClass = "text-tertiary";
                        iconName = "warning";
                        badgeClass = "bg-tertiary text-on-tertiary";
                      }

                      return (
                        <div key={idx} className={`${containerClass} border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer group`}>
                          <div className="flex items-start gap-3">
                            <span
                              className={`material-symbols-outlined ${iconClass} mt-0.5 text-[22px]`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {iconName}
                            </span>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <div className="flex justify-between items-center gap-2">
                                <h4 className="text-[14px] font-semibold text-on-surface">
                                  {risk.title}
                                </h4>
                                <span className={`${badgeClass} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0`}>
                                  {risk.level}
                                </span>
                              </div>
                              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                                {risk.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "summary" && (
                <div className="p-1 animate-[fade-in_0.3s_ease-out]">
                  <h3 className="text-[16px] font-semibold text-on-surface mb-3">
                    Executive Summary
                  </h3>
                  <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                    <ul className="space-y-3 text-[13px] text-on-surface-variant leading-relaxed">
                      {summary.length === 0 ? (
                        <p>No summary generated.</p>
                      ) : (
                        summary.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span> 
                            <span>{point}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="flex flex-col h-full animate-[fade-in_0.3s_ease-out]">
                  <div className="flex-1 flex flex-col gap-4 pb-4">
                    <div className="bg-surface-container-lowest p-3.5 rounded-2xl rounded-tl-sm border border-outline-variant/40 self-start max-w-[90%]">
                      <p className="text-[13px] text-on-surface leading-relaxed">
                        I&apos;ve analyzed your document. Ask me anything about it.
                      </p>
                    </div>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[90%] ${
                        msg.role === "user" 
                          ? "bg-primary text-on-primary self-end rounded-tr-sm" 
                          : "bg-surface-container-lowest border border-outline-variant/40 text-on-surface self-start rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="bg-surface-container-lowest p-3.5 rounded-2xl rounded-tl-sm border border-outline-variant/40 self-start max-w-[90%] flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Chat Input at bottom of Panel */}
            {activeTab === "chat" && (
              <div className="p-3 bg-surface border-t border-outline-variant z-20 shrink-0 pb-5 md:pb-3">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}
                  className="bg-surface-container-lowest border border-outline-variant rounded-full flex items-center pr-1.5 pl-4 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this document..."
                    className="flex-1 bg-transparent outline-none text-[13px] text-on-surface placeholder:text-on-surface-variant/50"
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading}
                    className="w-8 h-8 bg-primary disabled:opacity-50 rounded-full flex items-center justify-center text-on-primary hover:opacity-90 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_upward
                    </span>
                  </button>
                </form>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-surface border-t border-outline-variant flex items-center justify-around px-2 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <button onClick={() => window.location.reload()} className="flex flex-col items-center gap-1 p-2 text-primary">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={onOpenHistory} className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[24px]">folder_open</span>
          <span className="text-[10px] font-medium">Files</span>
        </button>
        <button onClick={() => alert("Settings panel will be available in the next update!")} className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[24px]">settings</span>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

      {/* Share Modal - Root Level for proper mobile overlay */}
      {showShareMenu && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareMenu(false)}></div>
          <div className="relative w-full md:max-w-sm bg-surface border border-outline-variant rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-[fade-in_0.2s_ease-out] mb-0 md:mb-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
              <h3 className="text-lg font-bold text-on-surface">Share Report</h3>
              <button onClick={() => setShowShareMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-2 pb-6 md:pb-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Check out my DocAudit AI Report for ${fileName}! Found ${risks.length} risks.`);
                  setShowShareMenu(false);
                  alert("Copied to clipboard!");
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-on-surface hover:bg-surface-container-low transition-colors rounded-xl text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Copy Link</p>
                  <p className="text-[12px] text-on-surface-variant">Copy text to your clipboard</p>
                </div>
              </button>
              <button 
                onClick={() => {
                  const text = encodeURIComponent(`Check out my DocAudit AI Report for ${fileName}!`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-on-surface hover:bg-surface-container-low transition-colors rounded-xl text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div>
                  <p className="font-semibold text-[15px]">WhatsApp</p>
                  <p className="text-[12px] text-on-surface-variant">Share directly on WhatsApp</p>
                </div>
              </button>
              <button 
                onClick={() => {
                  const text = encodeURIComponent(`I just used DocAudit AI to audit my document (${fileName}). It found ${risks.length} key risks instantly!`);
                  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-on-surface hover:bg-surface-container-low transition-colors rounded-xl text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Twitter / X</p>
                  <p className="text-[12px] text-on-surface-variant">Post your audit result</p>
                </div>
              </button>
              <button 
                onClick={() => {
                  const text = encodeURIComponent(`I just used DocAudit AI to audit my document (${fileName}). Found ${risks.length} key risks.`);
                  window.open(`mailto:?subject=DocAudit AI Report&body=${text}`, '_blank');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-on-surface hover:bg-surface-container-low transition-colors rounded-xl text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335]">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Email</p>
                  <p className="text-[12px] text-on-surface-variant">Send report via Email</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== SUB-COMPONENTS ========== */

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative ${
        active
          ? "bg-primary/10 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <span
        className="material-symbols-outlined transition-transform group-hover:scale-110"
        style={{
          fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        {icon}
      </span>
      {/* Tooltip */}
      <div className="absolute left-16 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs font-label-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 pb-3 pt-2 relative transition-colors ${
        active
          ? "text-primary"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg"
      }`}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{
          fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        {icon}
      </span>
      <span className="font-label-lg">{label}</span>
      {badge && (
        <span className="absolute top-1 right-2 w-4 h-4 bg-error text-on-error rounded-full text-[10px] flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-primary animate-[fade-in_0.2s_ease-out]"></div>
      )}
    </button>
  );
}
