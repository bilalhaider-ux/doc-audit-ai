"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import HeroUploadCard from "./components/HeroUploadCard";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm h-14 flex justify-center transition-all duration-300">
        <div className="max-w-7xl w-full flex justify-between items-center px-4 md:px-container-margin-desktop">
          <Link href="/">
            <div className="text-[18px] font-bold text-primary flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
              DocAudit AI
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-[13px] font-medium text-on-surface-variant hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-[13px] font-medium text-on-surface-variant hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              How it Works
            </Link>
            <Link
              href="#security"
              className="text-[13px] font-medium text-on-surface-variant hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              Security
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/audit">
              <button className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                Start Auditing
              </button>
            </Link>
            <ThemeToggle />
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container-high transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="absolute top-14 left-0 w-full bg-surface border-b border-outline-variant shadow-lg md:hidden animate-[fade-in_0.2s_ease-out]">
            <div className="flex flex-col p-4 gap-1">
              <Link href="#features" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-[14px] text-on-surface hover:bg-surface-container-high transition-colors">Features</Link>
              <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-[14px] text-on-surface hover:bg-surface-container-high transition-colors">How it Works</Link>
              <Link href="#security" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-[14px] text-on-surface hover:bg-surface-container-high transition-colors">Security</Link>
            </div>
          </div>
        )}
      </nav>
      <main className="mt-14">
        {/* Hero Section */}
        <section className="relative hero-gradient pt-16 md:pt-24 pb-20 md:pb-32 px-4 md:px-container-margin-desktop overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-5 z-10 animate-[fade-in_0.8s_ease-out]">
              <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-3.5 py-1.5 rounded-full w-fit backdrop-blur-md border border-primary/10">
                <span className="material-symbols-outlined text-[16px]">
                  auto_awesome
                </span>
                <span className="text-[11px] font-medium tracking-wide">
                  100% FREE • NO SIGN UP
                </span>
              </div>
              <h1 className="text-4xl md:text-[52px] md:leading-[1.1] font-bold text-on-background max-w-xl tracking-tight">
                The Smartest Way to <span className="text-primary">Audit PDFs</span>
              </h1>
              <p className="text-[15px] md:text-[16px] text-on-surface-variant max-w-lg leading-relaxed">
                Upload any contract or legal document. Our AI instantly finds hidden risks, summarizes clauses, and lets you chat with your PDF.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link href="/audit" className="w-full sm:w-auto">
                  <button className="bg-primary text-on-primary px-7 py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 ease-out active:translate-y-0 active:scale-95 w-full">
                    Upload Document
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </Link>
              </div>
            </div>
            {/* Upload Zone / Visual */}
            <HeroUploadCard />
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-16 md:py-section-gap px-4 md:px-container-margin-desktop max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-[32px] font-bold text-on-surface mb-3">
              Everything you need. <span className="text-primary">Always Free.</span>
            </h2>
            <p className="text-[14px] md:text-[15px] text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Enterprise-grade AI document analysis without paying a dime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-5 text-primary group-hover:rotate-6 transition-transform duration-300">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <h3 className="text-[16px] font-semibold text-on-surface mb-2">
                Automated Risk Alerts
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                AI flags hidden liabilities, auto-renewals, and non-standard clauses that humans miss.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center mb-5 text-secondary group-hover:rotate-6 transition-transform duration-300">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              </div>
              <h3 className="text-[16px] font-semibold text-on-surface mb-2">
                Chat with Document
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Ask questions like &quot;What is the termination period?&quot; and get instant cited answers.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 bg-tertiary/10 rounded-xl flex items-center justify-center mb-5 text-tertiary group-hover:rotate-6 transition-transform duration-300">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>summarize</span>
              </div>
              <h3 className="text-[16px] font-semibold text-on-surface mb-2">
                Instant Summaries
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Get a bulleted executive summary of 100-page contracts in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 md:py-section-gap px-4 md:px-container-margin-desktop bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-2xl md:text-[32px] font-bold text-on-surface">
                How <span className="text-primary">DocAudit AI</span> works
              </h2>
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[16px] z-10 shrink-0">1</div>
                  <div className="w-px h-full bg-outline-variant/50 my-2"></div>
                </div>
                <div className="pb-8 pt-1.5">
                  <h3 className="text-[18px] font-semibold text-on-surface mb-2">Upload your PDF</h3>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">Securely drop any contract or legal document up to 50MB into our platform. No signup required.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[16px] z-10 shrink-0">2</div>
                  <div className="w-px h-full bg-outline-variant/50 my-2"></div>
                </div>
                <div className="pb-8 pt-1.5">
                  <h3 className="text-[18px] font-semibold text-on-surface mb-2">AI Analysis</h3>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">Our Gemini-powered AI scans the text to identify unusual clauses, missing terms, and potential liabilities.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[16px] z-10 shadow-md shrink-0">3</div>
                </div>
                <div className="pt-1.5">
                  <h3 className="text-[18px] font-semibold text-on-surface mb-2">Review & Chat</h3>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">Get a clean dashboard with risk alerts and an interactive chat interface to ask questions directly to your document.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full bg-surface-container rounded-[24px] p-6 shadow-inner border border-outline-variant flex items-center justify-center min-h-[300px]">
               <div className="flex flex-col items-center gap-4 animate-[fade-in_2s_ease-out_infinite]">
                 <span className="material-symbols-outlined text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                 <div className="h-2 w-32 bg-primary/20 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-16 md:py-section-gap px-4 md:px-container-margin-desktop bg-surface max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
            <span className="text-[13px] font-semibold">Enterprise-Grade Security</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold text-on-surface mb-4 max-w-2xl mx-auto">
            Your documents belong to you. <br/><span className="text-secondary">We keep it that way.</span>
          </h2>
          <p className="text-[15px] text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-12">
            DocAudit AI is built from the ground up to ensure your sensitive legal information never falls into the wrong hands.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[32px] text-primary mb-4">delete_sweep</span>
              <h4 className="text-[15px] font-semibold text-on-surface mb-2">Auto-Deletion</h4>
              <p className="text-[12px] text-on-surface-variant">All files are permanently deleted from our servers 2 hours after upload.</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[32px] text-primary mb-4">no_accounts</span>
              <h4 className="text-[15px] font-semibold text-on-surface mb-2">No Tracking</h4>
              <p className="text-[12px] text-on-surface-variant">No accounts, no tracking cookies, and no personal data collection.</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[32px] text-primary mb-4">model_training</span>
              <h4 className="text-[15px] font-semibold text-on-surface mb-2">No AI Training</h4>
              <p className="text-[12px] text-on-surface-variant">Your documents are never used to train or improve our AI models.</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[32px] text-primary mb-4">lock</span>
              <h4 className="text-[15px] font-semibold text-on-surface mb-2">Encrypted Data</h4>
              <p className="text-[12px] text-on-surface-variant">Data is encrypted in transit via SSL and at rest using AES-256.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 px-4 md:px-container-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant bg-surface-container-low">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-[13px] font-semibold text-on-surface">DocAudit AI</span>
            <span className="text-[11px] text-on-surface-variant hidden sm:inline">— Free document auditing</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant">Built by <strong className="text-on-surface">Bilal Haider</strong></span>
            <span className="text-[10px] text-on-surface-variant/80 mt-0.5">Powered by Next.js, Tailwind v4 & Gemini AI</span>
            <span className="text-[11px] text-primary mt-1 font-medium bg-primary/5 px-2 py-0.5 rounded-full w-fit">
              Available for freelance AI projects. Get in touch!
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link href="/legal" className="text-[11px] font-medium text-on-surface hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-surface">T&C's</Link>
          <div className="w-px h-3 bg-outline-variant/50 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/in/bilal-haider-ds/" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-[#0077b5] transition-colors" title="LinkedIn">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://github.com/bilalhaider-ux" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-surface transition-colors" title="GitHub">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="mailto:bilalhaider4911@gmail.com" className="text-on-surface-variant hover:text-[#ea4335] transition-colors" title="Email">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
