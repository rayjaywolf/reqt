"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function About() {
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);

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

    return (
        <section className="bg-black border-4 border-white p-0 h-full flex flex-col overflow-hidden">
            <div className="bg-white text-black p-3 border-b-4 border-black">
                <h1 className="text-3xl font-mono font-black tracking-tight text-center uppercase">ABOUT REQT</h1>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-12 grid-rows-auto gap-4 min-h-full">
                    {/* Hero Section - Spans 12 columns, 2 rows */}
                    <div className="col-span-12 row-span-2 bg-[#FF6B00] border-4 border-black p-4 flex flex-col md:flex-row gap-6 relative overflow-hidden min-h-[300px]">
                        <div className="w-full md:w-1/3 flex items-center justify-center">
                            <div className="relative w-64 h-64 border-4 border-black bg-white transform rotate-2">
                                <Image
                                    src="/sal.png"
                                    alt="Sal - Your Financial Roast Master"
                                    fill
                                    className="object-contain p-2"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 flex flex-col justify-center pr-4">
                            <h2 className="text-4xl font-mono font-black text-white mb-4">MEET SAL, YOUR FINANCIAL ROAST MASTER</h2>
                            <div className="space-y-4 font-mono text-white text-xl">
                                <p>
                                    Hey degens! I'm Sal, your brutally honest guide through the dumpster fire that is the Solana ecosystem. I've seen enough rug pulls and "moon soon" projects to make a therapist need therapy.
                                </p>
                                <p>
                                    I'm here to expose your financial trauma, analyze your poor decision-making, and turn your trading history into a comedy special. Think of me as your therapist, but meaner.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What is REQT - Spans 6 columns, 2 rows */}
                    <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-4 border-black p-4 flex flex-col min-h-[200px]">
                        <h3 className="text-2xl font-mono font-black text-black mb-2">WHAT IS REQT?</h3>
                        <p className="text-black font-mono flex-1">
                            REQT is a satirical platform that exposes the absurdity of the Solana ecosystem. We analyze your wallet, mock your trading decisions, and turn your financial losses into comedy gold.
                        </p>
                        <div className="mt-4 bg-black text-white p-2 font-mono text-sm border-2 border-black">
                            <span className="font-black">CONTRACT:</span> ALUhJzNV349geyKwH5msJRfq9EjMsQ7vTRCiEaWFjh4j
                        </div>
                    </div>

                    {/* Stats Box - Spans 6 columns, 2 rows */}
                    <div className="col-span-12 md:col-span-6 row-span-2 bg-[#3FAC48] border-4 border-black p-4 flex flex-col min-h-[200px]">
                        <h3 className="text-2xl font-mono font-black text-white mb-2">REQT STATS</h3>
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-black">∞</span>
                                <span className="text-sm font-mono text-black">PORTFOLIOS ROASTED</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-black">$0</span>
                                <span className="text-sm font-mono text-black">MONEY SAVED</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-black">100%</span>
                                <span className="text-sm font-mono text-black">SATIRE ACCURACY</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-black">-99%</span>
                                <span className="text-sm font-mono text-black">PORTFOLIO VALUE</span>
                            </div>
                        </div>
                    </div>

                    {/* How It Works - Spans 8 columns, 2 rows */}
                    <div className="col-span-12 lg:col-span-8 row-span-2 bg-[#FFEB3B] border-4 border-black p-4 min-h-[200px]">
                        <h3 className="text-2xl font-mono font-black text-black mb-4">HOW IT WORKS</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl mb-2">1</div>
                                <span className="font-mono text-black font-black">DROP ADDRESS</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl mb-2">2</div>
                                <span className="font-mono text-black font-black">ANALYZE</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl mb-2">3</div>
                                <span className="font-mono text-black font-black">ROAST</span>
                            </div>
                            <div className="bg-white border-4 border-black p-3 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl mb-2">4</div>
                                <span className="font-mono text-black font-black">SHARE</span>
                            </div>
                        </div>
                    </div>

                    {/* Solana Price - Spans 4 columns, 2 rows */}
                    <div className="col-span-12 lg:col-span-4 row-span-2 bg-purple-600 border-4 border-black p-4 flex flex-col justify-center items-center min-h-[200px]">
                        <h3 className="text-2xl font-mono font-black text-white mb-2">SOLANA PRICE</h3>
                        <div className="text-4xl font-black text-white mb-2">
                            {solanaPrice ? `$${solanaPrice.toFixed(2)}` : '...'}
                        </div>
                        <p className="text-white font-mono text-sm text-center">
                            Still not enough to recover your losses
                        </p>
                    </div>

                    {/* Features Section - Spans 12 columns, 2 rows */}
                    <div className="col-span-12 row-span-2 bg-[#FF6B00] border-4 border-black p-4">
                        <h3 className="text-2xl font-mono font-black text-white mb-4">REQT FEATURES</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">PORTFOLIO ANALYSIS</h4>
                                <p className="text-black font-mono">
                                    We analyze your Solana wallet to track your tokens, NFTs, and swap history. Our AI calculates your realized and unrealized gains (or more likely, losses).
                                </p>
                            </div>
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">BRUTAL ROASTS</h4>
                                <p className="text-black font-mono">
                                    Our AI generates personalized roasts based on your trading history, mocking your poor decisions and turning your financial trauma into comedy gold.
                                </p>
                            </div>
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">CRYPTO NEWS</h4>
                                <p className="text-black font-mono">
                                    Stay informed with our unique blend of crypto news and pure entertainment. We keep you updated on the latest dumpster fires in the Solana ecosystem.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Section - Spans 12 columns, 3 rows */}
                    <div className="col-span-12 row-span-3 bg-[#3FAC48] border-4 border-black p-4">
                        <h3 className="text-2xl font-mono font-black text-white mb-4">ROADMAP TO REQT</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">LIVE NOW</h4>
                                <ul className="space-y-2 text-black font-mono">
                                    <li className="flex items-start">
                                        <span className="mr-2">🔥</span>
                                        <div>
                                            <span className="font-black">Roast My Portfolio</span>
                                            <p className="text-sm">Get brutally honest feedback on your portfolio. Warning: May cause temporary ego damage.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">📰</span>
                                        <div>
                                            <span className="font-black">Crypto Daily</span>
                                            <p className="text-sm">Stay informed with our unique blend of crypto news and pure entertainment.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">COMING SOON</h4>
                                <ul className="space-y-2 text-black font-mono">
                                    <li className="flex items-start">
                                        <span className="mr-2">⚠️</span>
                                        <div>
                                            <span className="font-black">Anti-Rug Force</span>
                                            <p className="text-sm">Advanced AI to spot rug pulls before they happen. Your first line of defense. <span className="bg-black text-white px-2 py-0.5 text-xs">27.04.25</span></p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">💰</span>
                                        <div>
                                            <span className="font-black">Wallet Gone Wild</span>
                                            <p className="text-sm">Track your gains, losses, and everything in between. Reality check included. <span className="bg-black text-white px-2 py-0.5 text-xs">May 2025</span></p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">🧠</span>
                                        <div>
                                            <span className="font-black">Crypto Guru</span>
                                            <p className="text-sm">Learn crypto finance from SAL, our AI teacher. No judgment (lies), just pure knowledge. <span className="bg-black text-white px-2 py-0.5 text-xs">August 2025</span></p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Analysis Section - Spans 12 columns, 2 rows */}
                    <div className="col-span-12 row-span-2 bg-[#FFEB3B] border-4 border-black p-4">
                        <h3 className="text-2xl font-mono font-black text-black mb-4">PORTFOLIO ANALYSIS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">TOKEN TRACKING</h4>
                                <p className="text-black font-mono mb-2">
                                    We track all your current and past tokens, including:
                                </p>
                                <ul className="list-disc pl-5 text-black font-mono space-y-1">
                                    <li>Current token holdings and balances</li>
                                    <li>Historical tokens you've sold</li>
                                    <li>Realized and unrealized gains/losses</li>
                                    <li>Average buy and sell prices</li>
                                </ul>
                            </div>
                            <div className="bg-white border-4 border-black p-4">
                                <h4 className="text-xl font-mono font-black text-black mb-2">SWAP HISTORY</h4>
                                <p className="text-black font-mono mb-2">
                                    We analyze your swap transactions to provide:
                                </p>
                                <ul className="list-disc pl-5 text-black font-mono space-y-1">
                                    <li>Complete swap history with timestamps</li>
                                    <li>Token pairs and exchange information</li>
                                    <li>Total value of each transaction</li>
                                    <li>Performance metrics for your trading</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer - Spans 12 columns, 1 row */}
                    <div className="col-span-12 row-span-1 bg-black border-4 border-white p-4">
                        <p className="text-white font-mono text-sm text-center">
                            <span className="font-black">DISCLAIMER:</span> This is satire. We're not financial advisors, we're financial comedians. Your losses are your own responsibility. Our roasts are for entertainment purposes only. If you're feeling sensitive about your portfolio, maybe stick to traditional therapy.
                        </p>
                    </div>

                    {/* CTA - Spans 12 columns, 1 row */}
                    <div className="col-span-12 row-span-1 flex justify-center items-center py-4">
                        <Link
                            href="/"
                            className="px-8 py-4 bg-white text-black border-4 border-black font-mono font-black uppercase text-xl hover:bg-cyan-400 hover:text-black transition-colors transform hover:scale-105"
                        >
                            GET ROASTED
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white h-4 w-full border-t-4 border-black"></div>
        </section>
    );
} 