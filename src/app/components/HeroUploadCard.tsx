"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroUploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        // Store file reference for the audit page to pick up
        if (typeof window !== "undefined") {
          (window as any).__pendingPdfFile = file;
        }
        router.push("/audit");
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group animate-[fade-in_1s_ease-out]">
      {/* Decorative Background Elements */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-container rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Premium Upload Card */}
      <label className="relative glass-card bg-surface-container-lowest/80 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-5 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-primary/20 active:scale-[0.98] cursor-pointer block">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500">
          <span className="material-symbols-outlined text-[40px] group-hover:-translate-y-1 transition-transform duration-500">
            upload_file
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-semibold text-on-surface">
            Drop PDF Here
          </h3>
          <p className="text-[13px] text-on-surface-variant">
            Max 50MB • Click to browse
          </p>
        </div>
        <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all duration-300">
          <span className="text-primary text-[13px] font-semibold underline underline-offset-4 pointer-events-none">
            Select PDF File
          </span>
          <div className="mt-3 flex justify-center pointer-events-none">
            <span className="material-symbols-outlined text-error text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-full text-[11px]">
          <span className="material-symbols-outlined text-[14px] text-secondary">
            verified_user
          </span>
          Files auto-deleted after 2 hours
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
