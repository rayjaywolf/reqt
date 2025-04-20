"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Roadmap() {
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

    const phases = [
        {
            title: "PHASE 1: THE BASICS",
            status: "LIVE",
            color: "bg-[#FF6B00]",
            features: [
                "Portfolio Roasting Engine",
                "Loss Porn Calculator",
                "Degen Decision Detector",
                "Copium Level Analyzer"
            ]
        },
        {
            title: "PHASE 2: RUG RADAR",
            status: "IN DEVELOPMENT",
            color: "bg-[#3FAC48]",
            features: [
                "Rug Pull Probability Scanner",
                "Red Flag Detection System",
                "Exit Scam Early Warning",
                "Founder Wallet Tracker"
            ]
        },
        {
            title: "PHASE 3: DEGEN TOOLS",
            status: "PLANNED",
            color: "bg-[#ED254E]",
            features: [
                "FOMO Resistance Training",
                "Paper Hands Predictor",
                "Diamond Hands Verifier",
                "Cope-to-Hope Converter"
            ]
        },
        {
            title: "PHASE 4: ULTIMATE PACKAGE",
            status: "DREAMING",
            color: "bg-purple-600",
            features: [
                "AI-Powered Loss Prevention",
                "Automatic Cope Generator",
                "Reverse Psychology Trading Bot",
                "Therapy Session Scheduler"
            ]
        }
    ];

    return (
        <section className="bg-black border-4 border-white p-0 h-full flex flex-col overflow-hidden">
            <div className="bg-white text-black p-3 border-b-4 border-black">
                <h1 className="text-3xl font-mono font-black tracking-tight text-center uppercase">ROADMAP TO REKT</h1>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-white border-4 border-black p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00] border-4 border-black transform rotate-12 translate-x-8 -translate-y-8"></div>
                        <h2 className="text-4xl font-mono font-black text-black mb-4 relative z-10">BUILDING THE FUTURE OF FINANCIAL COMEDY</h2>
                        <p className="text-xl font-mono text-black relative z-10">
                            Our mission is to create the most comprehensive suite of tools for exposing, analyzing, and laughing at the absurdity of the Solana ecosystem. Here's our master plan:
                        </p>
                    </div>

                    {/* Phases */}
                    {phases.map((phase, index) => (
                        <div key={index} className={`${phase.color} border-4 border-black p-6`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h3 className="text-3xl font-mono font-black text-white">{phase.title}</h3>
                                <div className="bg-white border-4 border-black px-4 py-2">
                                    <span className="font-mono font-black text-black">{phase.status}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phase.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="bg-white border-4 border-black p-4">
                                        <span className="font-mono font-black text-black text-lg">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Disclaimer */}
                    <div className="bg-black border-4 border-white p-6">
                        <p className="font-mono text-white text-center">
                            <span className="font-black">NOTE:</span> This roadmap is as reliable as your favorite influencer's price predictions. Features may or may not be implemented, just like how your tokens may or may not recover their value.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center">
                        <Link
                            href="/"
                            className="px-8 py-4 bg-white text-black border-4 border-black font-mono font-black uppercase text-xl hover:bg-cyan-400 hover:text-black transition-colors transform hover:scale-105"
                        >
                            GET ROASTED NOW
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white h-4 w-full border-t-4 border-black"></div>
        </section>
    );
} 