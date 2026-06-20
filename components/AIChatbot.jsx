"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Halo! Saya AI Assistant Pak Taufiq, M.Kom. Ada yang bisa saya bantu terkait penelitian, aktivitas mengajar, atau proyek rekayasa perangkat lunak saya?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedPrompts = [
        { label: "🎓 Pendidikan & S3 UGM", text: "Apa topik penelitian disertasi S3 Pak Taufiq di UGM?" },
        { label: "💻 Proyek Rekayasa IT", text: "Apa proyek software/IT yang pernah dibangun Pak Taufiq?" },
        { label: "📚 Mata Kuliah Aktif", text: "Apa saja mata kuliah yang diajarkan Pak Taufiq semester ini?" },
        { label: "📞 Kontak & Scholar", text: "Bagaimana cara menghubungi Pak Taufiq dan di mana link Google Scholar-nya?" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async (textToSend) => {
        const messageText = textToSend || input;
        if (!messageText.trim()) return;

        // Clear input
        if (!textToSend) setInput("");

        // Append user message
        const newMessages = [...messages, { role: "user", content: messageText }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil respon dari API.");
            }

            const data = await response.json();
            
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response || "Maaf, respon tidak dapat dipahami." }
            ]);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Maaf, koneksi ke server chatbot sedang terganggu. Pastikan GEMINI_API_KEY sudah dikonfigurasi dengan benar." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 select-none">
            {/* 1. Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group focus:outline-none"
                aria-label="Tanya AI Assistant"
            >
                {/* Glowing ring animation */}
                <span className="absolute -inset-1 rounded-full bg-blue-500/30 dark:bg-blue-400/20 blur-sm animate-pulse-slow"></span>
                
                {isOpen ? (
                    <svg className="w-6 h-6 relative z-10 transition-transform duration-300 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* 2. Expanded Chat Box Panel */}
            <div
                className={`fixed bottom-24 right-0 md:right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
                    isOpen 
                        ? "translate-y-0 opacity-100 scale-100 pointer-events-auto" 
                        : "translate-y-4 opacity-0 scale-95 pointer-events-none"
                }`}
            >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-100">
                            <Image
                                src="/profile.jpg"
                                alt="M. Taufiq, M.Kom"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold leading-none">M. Taufiq, M.Kom</h3>
                            <span className="text-[10px] text-blue-200 font-semibold inline-flex items-center gap-1 mt-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                                AI Assistant Online
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        aria-label="Tutup Chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                    {messages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] shadow-sm ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800/80"
                                }`}
                            >
                                <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Suggested Chips (Only shows when minimal chat length) */}
                    {messages.length === 1 && !isLoading && (
                        <div className="space-y-2 pt-2">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                                Pertanyaan Rekomendasi:
                            </p>
                            <div className="flex flex-col gap-2">
                                {suggestedPrompts.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(chip.text)}
                                        className="text-left px-3 py-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loader */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Inputs Footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ketik pertanyaan Anda..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400/80 text-xs sm:text-sm text-slate-800 dark:text-slate-100 rounded-xl transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-550 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer"
                        aria-label="Kirim Pesan"
                    >
                        <svg className="w-5 h-5 transform rotate-90 relative left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
