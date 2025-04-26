"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Feature {
    name: string;
    description: string;
    icon: string;
    eta?: string;
}

interface Phase {
    title: string;
    status: string;
    color: string;
    features: Feature[];
}

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

    const phases: Phase[] = [
        {
            title: "LIVE NOW",
            status: "ACTIVE",
            color: "bg-[#FF6B00]",
            features: [
                {
                    name: "Roast My Portfolio",
                    description: "Get brutally honest feedback on your portfolio. Warning: May cause temporary ego damage.",
                    icon: "🔥"
                },
                {
                    name: "Crypto Daily",
                    description: "Stay informed with our unique blend of crypto news and pure entertainment.",
                    icon: "📰"
                }
            ]
        },
        {
            title: "COMING SOON",
            status: "IN DEVELOPMENT",
            color: "bg-[#3FAC48]",
            features: [
                {
                    name: "Anti-Rug Force",
                    description: "Advanced AI to spot rug pulls before they happen. Your first line of defense.",
                    icon: "⚠️",
                    eta: "27.04.25"
                },
                {
                    name: "Wallet Gone Wild",
                    description: "Track your gains, losses, and everything in between. Reality check included.",
                    icon: "💰",
                    eta: "First Week of May (eta)"
                },
                {
                    name: "Crypto Guru",
                    description: "Learn crypto finance from SAL, our AI teacher. No judgment (lies), just pure knowledge.",
                    icon: "🧠",
                    eta: "August (eta)"
                }
            ]
        }
    ];

    return (
        <section className="bg-[#FFE600] min-h-screen p-0 flex flex-col overflow-hidden">
            <div className="bg-black text-white p-6 border-b-8 border-black">
                <h1 className="text-5xl font-mono font-black tracking-tight text-center uppercase">ROADMAP TO REQT</h1>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white border-8 border-black p-8 relative overflow-hidden transform hover:rotate-0 transition-transform">
                        <h2 className="text-4xl font-mono font-black text-black mb-4 relative z-10 text-center">BUILDING THE FUTURE OF FINANCIAL COMEDY</h2>
                        <p className="text-xl font-mono text-black relative z-10 text-center">
                            Our mission is to create the most comprehensive suite of tools for exposing, analyzing, and laughing at the absurdity of the Solana ecosystem. Here's our master plan:
                        </p>
                    </div>

                    {phases.map((phase, index) => (
                        <div key={index} className={`${phase.color} border-8 border-black p-8 transform hover:-rotate-0 transition-transform`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <h3 className="text-4xl font-mono font-black text-white">{phase.title}</h3>
                                <div className={`${phase.status === "ACTIVE" ? "bg-red-500 border-4 border-black" : "bg-white border-4 border-black"} px-6 py-3 transform hover:scale-105 transition-transform`}>
                                    <span className={`font-mono font-black ${phase.status === "ACTIVE" ? "text-white" : "text-black"} text-xl`}>{phase.status}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {phase.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="bg-white border-4 border-black p-6 transform hover:scale-105 transition-transform">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-4xl">{feature.icon}</span>
                                            <h4 className="font-mono font-black text-black text-2xl">{feature.name}</h4>
                                        </div>
                                        <p className="font-mono text-black text-lg mb-4">{feature.description}</p>
                                        {feature.eta && (
                                            <div className="bg-black border-4 border-white px-4 py-2 inline-block">
                                                <span className="font-mono font-black text-white text-sm">{feature.eta}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="bg-black border-8 border-white p-8">
                        <p className="font-mono text-white text-center text-xl">
                            <span className="font-black">DISCLAIMER:</span> This roadmap is as reliable as your favorite influencer's price predictions. Features may or may not be implemented on time, just like how your tokens may or may not recover their value.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/"
                            className="px-10 py-6 bg-white text-black border-8 border-black font-mono font-black uppercase text-2xl hover:bg-[#FF6B00] hover:text-white transition-all transform hover:scale-105 hover:-rotate-1"
                        >
                            GET ROASTED NOW
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-black h-8 w-full border-t-8 border-white"></div>
        </section>
    );
} 