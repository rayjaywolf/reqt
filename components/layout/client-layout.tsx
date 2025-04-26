"use client";

import { useState, useEffect } from "react";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";
import Link from "next/link";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchSolanaPrice = async () => {
            try {
                const response = await fetch('/api/solana-price');
                if (response.ok) {
                    const data = await response.json();
                    setSolanaPrice(data.price);
                }
            } catch (error) {
                console.error('Error fetching Solana price:', error);
            }
        };

        fetchSolanaPrice();
        const interval = setInterval(fetchSolanaPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMenuIconClick = (icon: string) => {
        console.log(`Clicked on ${icon} icon`);
        if (icon === 'close') {
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#FF6B00] relative overflow-hidden p-4">
            {/* Sal Image */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/">
                    <Image
                        src="/sal.png"
                        alt="Sal"
                        width={40}
                        height={40}
                        className="rounded-none border-4 border-[#ffeb3b]"
                        priority
                    />
                </Link>
            </div>

            {/* Solana Price Badge */}
            <div className="absolute top-4 right-4 z-20">
                <div className="relative">
                    <div className="bg-[#FF6B00] border-4 border-black p-2 transform rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="font-mono font-black text-white text-sm tracking-wider">SOL PRICE</div>
                        <div className="font-mono font-black text-white text-xl tracking-tight">
                            {solanaPrice ? `$${solanaPrice.toFixed(2)}` : '...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cloud Menu System */}
            <div className="fixed bottom-15 left-10 z-50">
                {/* Main Menu Icon */}
                <div
                    className={`cursor-pointer transform hover:scale-110 transition-transform duration-300 ${isMenuOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Image
                        src="/menu.svg"
                        alt="Menu"
                        width={120}
                        height={120}
                        className="rounded-none"
                        priority
                    />
                </div>

                {/* Floating Menu Icons */}
                <div className={`absolute bottom-0 left-0 w-screen h-screen pointer-events-none ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div
                        className="absolute bottom-4 left-4 cursor-pointer transform hover:scale-110 transition-transform animate-float-1 pointer-events-auto"
                        onClick={() => handleMenuIconClick('close')}
                    >
                        <Image
                            src="/close.svg"
                            alt="Close"
                            width={100}
                            height={100}
                            className="rounded-none"
                            priority
                        />
                    </div>
                    <div
                        className="absolute bottom-22 left-14 cursor-pointer transform hover:scale-110 transition-transform animate-float-2 pointer-events-auto"
                        onClick={() => handleMenuIconClick('news')}
                    >
                        <Link href="/news">
                            <Image
                                src="/news.svg"
                                alt="News"
                                width={130}
                                height={130}
                                className="rounded-none"
                                priority
                            />
                        </Link>
                    </div>
                    <div
                        className="absolute bottom-8 left-35 cursor-pointer transform hover:scale-110 transition-transform animate-float-3 pointer-events-auto"
                        onClick={() => handleMenuIconClick('roadmap')}
                    >
                        <Link href="/roadmap">
                            <Image
                                src="/roadmap.svg"
                                alt="Roadmap"
                                width={130}
                                height={130}
                                className="rounded-none"
                                priority
                            />
                        </Link>
                    </div>
                    <div
                        className="absolute bottom-25 left-50 cursor-pointer transform hover:scale-110 transition-transform animate-float-4 pointer-events-auto"
                        onClick={() => handleMenuIconClick('about')}
                    >
                        <Link href="/about">
                            <Image
                                src="/about.svg"
                                alt="About"
                                width={110}
                                height={110}
                                className="rounded-none"
                                priority
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Top ticker */}
            <div className="w-full bg-white text-[#FF6B00] py-1 text-center font-mono font-bold tracking-wider border-4 border-[#ffeb3b] relative z-10">
                CONTRACT ADDRESS:
                <span className="text-red-600"> SOON</span>
            </div>

            {/* Left border */}
            <div className="absolute left-4 top-4 bottom-4 w-10 bg-[#ffeb3b] text-[#FF6B00] flex items-center justify-center border-4 border-[#ffeb3b] z-0">
                <Link href="/news" className="rotate-180 [writing-mode:vertical-lr] font-mono font-bold tracking-wider py-2 animate-color-cycle">
                    BREAKING NEWS!
                </Link>
            </div>

            {/* Right border */}
            <div className="absolute right-4 top-4 bottom-4 w-10 bg-[#3FAC48] text-white flex flex-col gap-8 items-center justify-center border-4 border-[#ffeb3b] z-0 underline">
                <Link href="https://x.com/getreqtdotcom" target="_blank" className="rotate-360 [writing-mode:vertical-lr] font-mono font-bold tracking-wider py-2 flex items-center gap-2">
                    <svg className="rotate-90" fill="#FFFFFF" height="16" width="16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="-143 145 512 512">
                        <path d="M113,145c-141.4,0-256,114.6-256,256s114.6,256,256,256s256-114.6,256-256S254.4,145,113,145z M215.2,361.2 c0.1,2.2,0.1,4.5,0.1,6.8c0,69.5-52.9,149.7-149.7,149.7c-29.7,0-57.4-8.7-80.6-23.6c4.1,0.5,8.3,0.7,12.6,0.7 c24.6,0,47.3-8.4,65.3-22.5c-23-0.4-42.5-15.6-49.1-36.5c3.2,0.6,6.5,0.9,9.9,0.9c4.8,0,9.5-0.6,13.9-1.9 C13.5,430-4.6,408.7-4.6,383.2v-0.6c7.1,3.9,15.2,6.3,23.8,6.6c-14.1-9.4-23.4-25.6-23.4-43.8c0-9.6,2.6-18.7,7.1-26.5 c26,31.9,64.7,52.8,108.4,55c-0.9-3.8-1.4-7.8-1.4-12c0-29,23.6-52.6,52.6-52.6c15.1,0,28.8,6.4,38.4,16.6 c12-2.4,23.2-6.7,33.4-12.8c-3.9,12.3-12.3,22.6-23.1,29.1c10.6-1.3,20.8-4.1,30.2-8.3C234.4,344.5,225.5,353.7,215.2,361.2z"></path>
                    </svg>
                    TWITTER
                </Link>
                <Link href="https://t.me/Roastmyportfolio" target="_blank" className="rotate-360 [writing-mode:vertical-lr] font-mono font-bold tracking-wider py-2 flex items-center gap-2">
                    <svg className="rotate-90" fill="#FFFFFF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12c0-6.627-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"></path>
                    </svg>
                    TELEGRAM
                </Link>
            </div>

            {/* Main content - contained within tickers */}
            <div className="flex-1 overflow-y-auto flex justify-center items-start p-4">
                <main className="w-full h-full px-10">
                    {children}
                </main>
            </div>

            {/* Bottom ticker */}
            <div className="w-full bg-white text-black py-1 text-center font-mono font-bold tracking-wider border-4 border-[#ffeb3b] relative z-10">
                <Marquee className="py-1">
                    BREAKING: SOLANA PUMPS 4.5% AS CANADA LAUNCHES ETFs ~ LOCAL DEGEN STILL DOWN 98% FROM ATH ~ MAPLE SYRUP MONEY CAN'T SAVE YOUR PORTFOLIO ~ INSTITUTIONS FOMO IN WHILE YOU PANIC SOLD AT $12 ~ NGMI ALERT: YOUR PAPER HANDS VS CANADIAN DIAMOND HANDS ~ NUMBER ONE BEST QUALITY! EVERY WALLET WELCOME! BEST CRYPTO ROASTS
                </Marquee>
            </div>

            <style jsx global>{`
                @keyframes colorCycle {
                    0% { color: #FF0000; }
                    25% { color: #FF00FF; }
                    50% { color: #800080; }
                    75% { color: #FF00FF; }
                    100% { color: #FF0000; }
                }
                
                .animate-color-cycle {
                    animation: colorCycle 1.5s infinite;
                }
            `}</style>
        </div>
    );
} 