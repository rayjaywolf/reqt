"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MDXRemote } from "next-mdx-remote";
import { components } from "../mdx-components";
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

// Dynamically import the TypingAnimation component with ssr disabled
const TypingAnimation = dynamic(
    () => import('@/components/magicui/typing-animation').then(mod => mod.TypingAnimation),
    { ssr: false }
);

interface ArticleData {
    title: string;
    date: string;
    author: string;
    bannerImage: string;
    thumbnailImage: string;
    category: string;
    excerpt: string;
    content: MDXRemoteSerializeResult;
}

export default function ArticlePage() {
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [article, setArticle] = useState<ArticleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const slug = params.slug as string;

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

        const fetchArticle = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/articles/${slug}`);
                if (response.ok) {
                    const data = await response.json();
                    setArticle(data);
                } else {
                    console.error('Failed to fetch article');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSolanaPrice();
        fetchArticle();
        const interval = setInterval(fetchSolanaPrice, 30000);
        return () => clearInterval(interval);
    }, [slug]);

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuIconClick = (icon: string) => {
        console.log(`Clicked on ${icon} icon`);
        if (icon === 'close') {
            setIsMenuOpen(false);
        }
        // Add functionality for other icons as needed
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="h-screen flex flex-col relative overflow-hidden pb-4">

            {/* Main content - contained within tickers */}
            <div className="flex-1 overflow-y-auto flex justify-center items-start">
                <main className="w-full h-full min-h-[calc(100vh-200px)] ">
                    {isLoading ? (
                        <div className="bg-black border-2 border-white p-8 flex flex-col items-center justify-center h-full">
                            <div className="text-white font-mono text-xl mb-4">LOADING ARTICLE...</div>
                            <div className="w-full bg-white border-2 border-black p-3">
                                <div className="grid grid-cols-10 gap-2">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-6 border-2 ${i < 5
                                                ? 'bg-purple-600 border-black'
                                                : 'bg-black border-black'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : article ? (
                        <article className="bg-black border-4 border-white p-0 overflow-y-auto flex flex-col shadow-[8px_8px_0_0_#000]">
                            {/* Article Header */}
                            <div className="bg-yellow-400 text-black p-3 border-b-4 border-black px-16">
                                <div className="flex justify-between items-center">
                                    <Link
                                        href="/news"
                                        className="text-black hover:text-purple-600 transition-colors font-mono font-black border-2 border-black bg-white px-3 py-1 hover:bg-[#FF6B00]"
                                    >
                                        &larr; BACK TO NEWS
                                    </Link>
                                    <div className="text-sm font-mono border-2 border-black bg-black text-white p-2 inline-block">
                                        🗓 {formatDate(article.date)}
                                    </div>
                                </div>
                            </div>

                            {/* Banner Image */}

                            {/* Article Content */}
                            <div className="p-6 flex-1 flex flex-col space-y-8 overflow-y-auto px-16">
                                {/* Article Meta */}
                                <div className="border-4 border-black p-6 bg-purple-600">
                                    <div className="text-white font-black text-3xl mb-3 border-4 border-black bg-black p-3 inline-block">
                                        {article.category}
                                    </div>
                                    <h1 className="text-white font-black text-4xl mb-4 border-4 border-black bg-black p-3">
                                        {article.title}
                                    </h1>
                                    <div className="flex gap-4">
                                        <div className="text-white text-lg border-2 border-black bg-[#FF6B00] p-2 inline-block">
                                            ✍️ BY {article.author}
                                        </div>
                                        <div className="text-white text-lg border-2 border-black bg-purple-600 p-2 inline-block">
                                            ⏱ 5 MIN READ
                                        </div>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="prose prose-invert max-w-none space-y-6">
                                    <MDXRemote
                                        {...article.content}
                                        components={components}
                                    />
                                </div>

                            </div>
                        </article>
                    ) : (
                        <div className="bg-black border-2 border-white p-8 flex flex-col items-center justify-center h-full">
                            <div className="text-white font-mono text-xl mb-4">ARTICLE NOT FOUND</div>
                            <Link href="/news" className="px-4 py-2 bg-purple-600 text-white border-2 border-black font-mono font-black uppercase text-sm hover:bg-green-400 hover:text-black transition-colors">
                                BACK TO NEWS
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
} 