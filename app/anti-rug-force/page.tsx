"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AntiRugForce() {
    return (
        <div className="flex flex-col w-full bg-[#1a1a1a]">
            {/* Hero Section */}
            <section className="w-full py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[#ff0000] opacity-5"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="bg-[#ff0000] p-4 border-4 border-black mb-6 flex items-center gap-8">
                                <div className="bg-[#1a1a1a] border-4 border-black rounded-full p-2 overflow-hidden flex items-center justify-center">
                                    <Image src="/detective.png" className="scale-120" alt="Anti-Rug Force Logo" width={180} height={180} />
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase text-white font-mono">ANTI-RUG FORCE</h1>
                            </div>
                            <div className="bg-black p-4 border-4 border-[#ff0000] mb-6 inline-block">
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-white font-mono">DETECT. PROTECT. PROFIT.</h2>
                            </div>
                            <div className="bg-[#ffff00] p-4 border-4 border-black mb-6 inline-block">
                                <p className="text-xl font-black tracking-tight uppercase text-black font-mono">COMING SOON: 27.04.25</p>
                            </div>
                        </div>
                        <div className="bg-black p-8 border-4 border-[#ff0000]">
                            <p className="text-white text-xl font-mono leading-relaxed">
                                <span className="text-[#ff0000] font-black">WARNING:</span> The memecoin wilds are treacherous.
                                Every day, unsuspecting investors lose their capital to malicious contract exploits and scams.
                            </p>
                            <p className="text-white text-xl font-mono leading-relaxed mt-4">
                                <span className="text-[#ffff00] font-black">SOLUTION:</span> Anti-Rug Force.
                                A powerful, no-BS analysis tool that scrutinizes smart contracts for common rug pull indicators.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="w-full py-16 px-4 bg-black relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[#ff0000] opacity-5"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="bg-[#ff0000] p-4 border-4 border-black mb-8 inline-block">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-white font-mono">DANGER DETECTED</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#ff0000] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                            <div className="bg-[#ff0000] w-12 h-12 flex items-center justify-center mb-4">
                                <span className="text-white text-2xl font-black">!</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono">LIQUIDITY TRAPS</h3>
                            <p className="text-white font-mono">Contracts designed to drain liquidity in seconds, leaving you with worthless tokens and empty promises.</p>
                        </div>
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#ff0000] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                            <div className="bg-[#ff0000] w-12 h-12 flex items-center justify-center mb-4">
                                <span className="text-white text-2xl font-black">!</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono">HIDDEN BACKDOORS</h3>
                            <p className="text-white font-mono">Malicious code that allows developers to mint unlimited tokens or drain your wallet without your knowledge.</p>
                        </div>
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#ff0000] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                            <div className="bg-[#ff0000] w-12 h-12 flex items-center justify-center mb-4">
                                <span className="text-white text-2xl font-black">!</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono">FAKE RENOUNCEMENT</h3>
                            <p className="text-white font-mono">Contracts that claim ownership is renounced but actually retain control through proxy contracts or hidden mechanisms.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section className="w-full py-16 px-4 bg-[#1a1a1a] relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[#ffff00] opacity-5"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="bg-[#ffff00] p-4 border-4 border-black mb-8 inline-block">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black font-mono">PROTECTION ACTIVATED</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-black p-8 border-4 border-[#ffff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                            <h3 className="text-[#ffff00] text-2xl font-black mb-6 font-mono">CONTRACT ANALYSIS</h3>
                            <ul className="text-white font-mono space-y-4">
                                <li className="flex items-start">
                                    <span className="text-[#ffff00] mr-2">►</span>
                                    <span>Liquidity pool analysis to identify potential for sudden withdrawal</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#ffff00] mr-2">►</span>
                                    <span>Ownership & renouncement verification</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#ffff00] mr-2">►</span>
                                    <span>Minting & supply audit to uncover hidden capabilities</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-[#ffff00] mr-2">►</span>
                                    <span>Transaction flow monitoring to spot unusual patterns</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-black p-8 border-4 border-[#ffff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                            <h3 className="text-[#ffff00] text-2xl font-black mb-6 font-mono">RISK ASSESSMENT</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1a1a1a] p-4 border-2 border-[#ff0000]">
                                    <p className="text-white font-mono text-center font-black">HIGH RISK</p>
                                    <div className="w-full bg-[#1a1a1a] h-4 border-2 border-white mt-2">
                                        <div className="bg-[#ff0000] h-full w-full"></div>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 border-2 border-[#ffff00]">
                                    <p className="text-white font-mono text-center font-black">MEDIUM RISK</p>
                                    <div className="w-full bg-[#1a1a1a] h-4 border-2 border-white mt-2">
                                        <div className="bg-[#ffff00] h-full w-1/2"></div>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 border-2 border-[#00ff00]">
                                    <p className="text-white font-mono text-center font-black">LOW RISK</p>
                                    <div className="w-full bg-[#1a1a1a] h-4 border-2 border-white mt-2">
                                        <div className="bg-[#00ff00] h-full w-1/4"></div>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 border-2 border-[#00ff00]">
                                    <p className="text-white font-mono text-center font-black">SAFE</p>
                                    <div className="w-full bg-[#1a1a1a] h-4 border-2 border-white mt-2">
                                        <div className="bg-[#00ff00] h-full w-1/8"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="w-full py-16 px-4 bg-black relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[#00ff00] opacity-5"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="bg-[#00ff00] p-4 border-4 border-black mb-8 inline-block">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black font-mono">ANALYSIS PROTOCOL</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#00ff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 w-full md:w-1/3">
                            <div className="bg-[#00ff00] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-black text-3xl font-black">1</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono text-center">INPUT CONTRACT</h3>
                            <p className="text-white font-mono text-center">Paste the contract address into our analyzer</p>
                        </div>
                        <div className="hidden md:block text-4xl font-black text-[#00ff00]">→</div>
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#00ff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 w-full md:w-1/3">
                            <div className="bg-[#00ff00] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-black text-3xl font-black">2</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono text-center">SCAN COMPLETE</h3>
                            <p className="text-white font-mono text-center">Our system performs a deep scan of the contract</p>
                        </div>
                        <div className="hidden md:block text-4xl font-black text-[#00ff00]">→</div>
                        <div className="bg-[#1a1a1a] p-6 border-4 border-[#00ff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 w-full md:w-1/3">
                            <div className="bg-[#00ff00] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-black text-3xl font-black">3</span>
                            </div>
                            <h3 className="text-white text-xl font-black mb-4 font-mono text-center">RECEIVE REPORT</h3>
                            <p className="text-white font-mono text-center">Get a detailed risk assessment with actionable insights</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="w-full py-16 px-4 bg-[#1a1a1a] relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[#ff0000] opacity-5"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="bg-[#ff0000] p-4 border-4 border-black mb-8 inline-block">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-white font-mono">LAUNCH SEQUENCE INITIATED</h2>
                    </div>

                    <div className="bg-black p-8 border-4 border-[#ff0000]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="w-full md:w-2/3">
                                <p className="text-white text-xl font-mono mb-4">
                                    <span className="text-[#ff0000] font-black">WARNING:</span> The memecoin wilds are treacherous.
                                    Every day, unsuspecting investors lose their capital to malicious contract exploits and scams.
                                </p>
                                <p className="text-white text-xl font-mono">
                                    <span className="text-[#ffff00] font-black">SOLUTION:</span> Anti-Rug Force.
                                    Launching on <span className="text-[#00ff00] font-black">27.04.25</span>
                                </p>
                            </div>
                            <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 border-4 border-[#ffff00] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                                <div className="text-center">
                                    <p className="text-[#ffff00] text-2xl font-black mb-2 font-mono">LAUNCH DATE</p>
                                    <p className="text-white text-4xl font-black font-mono">27.04.25</p>
                                    <div className="w-full bg-[#1a1a1a] h-4 border-2 border-white mt-4">
                                        <div className="bg-[#00ff00] h-full w-[99%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 