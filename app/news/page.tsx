"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";
import Link from "next/link";

// Dynamically import the TypingAnimation component with ssr disabled
const TypingAnimation = dynamic(
    () => import('@/components/magicui/typing-animation').then(mod => mod.TypingAnimation),
    { ssr: false }
);

interface Article {
    slug: string;
    title: string;
    date: string;
    author: string;
    thumbnailImage: string;
    category: string;
    excerpt: string;
}

export default function News() {
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

        const fetchArticles = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/articles');
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data.articles);
                } else {
                    console.error('Failed to fetch articles');
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSolanaPrice();
        fetchArticles();
        const interval = setInterval(fetchSolanaPrice, 30000);
        return () => clearInterval(interval);
    }, []);

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

    // Get unique categories
    const categories = Array.from(new Set(articles.map(article => article.category)));

    // Filter articles by category if selected
    const filteredArticles = selectedCategory
        ? articles.filter(article => article.category === selectedCategory)
        : articles;

    return (
        <div className="h-screen w-full flex flex-col relative overflow-hidden pb-4">

            {/* Main content - contained within tickers */}
            <div className="flex-1 overflow-y-auto flex justify-center items-start">
                <main className="w-full h-full min-h-[calc(100vh-200px)] ">
                    <div className="min-h-[calc(100vh-200px)] flex flex-col ">
                        <section className="bg-black border-4 border-white p-0 overflow-y-auto flex-1 flex flex-col shadow-[8px_8px_0_0_#000] ">
                            <div className="bg-yellow-400 text-black p-2 md:p-3 border-b-4 border-black">
                                <h1 className="text-2xl md:text-3xl font-mono font-black tracking-tight text-center uppercase">
                                    LATEST NEWS
                                </h1>
                            </div>

                            <div className="p-3 md:p-6 flex-1 flex flex-col overflow-y-auto space-y-4 md:space-y-8 px-4 md:px-16">
                                {/* Featured Article */}
                                {isLoading ? (
                                    <div className="border-4 border-black p-3 md:p-4 bg-black mb-4 md:mb-6">
                                        <div className="text-white font-mono text-lg md:text-xl mb-3 md:mb-4">LOADING ARTICLES...</div>
                                        <div className="w-full bg-white border-2 border-black p-2 md:p-3">
                                            <div className="grid grid-cols-10 gap-1 md:gap-2">
                                                {[...Array(10)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-4 md:h-6 border-2 ${i < 5
                                                            ? 'bg-purple-600 border-black'
                                                            : 'bg-black border-black'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : filteredArticles.length > 0 ? (
                                    <Link
                                        href={`/news/${filteredArticles[0].slug}`}
                                        className="group border-4 border-black p-0 bg-purple-600 mb-4 md:mb-8 transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]"
                                    >
                                        <div className="relative h-48 md:h-96 w-full border-4 border-black">
                                            <Image
                                                src={filteredArticles[0].thumbnailImage}
                                                alt={filteredArticles[0].title}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 p-3 md:p-6 w-full">
                                                <div className="bg-yellow-400 text-black font-black text-xs md:text-sm px-2 md:px-3 py-1 inline-block mb-2 md:mb-3 border-2 border-black">
                                                    {filteredArticles[0].category}
                                                </div>
                                                <h2 className="text-white font-black text-xl md:text-3xl lg:text-4xl mb-2 md:mb-3 border-4 border-black bg-black p-2 md:p-3 inline-block">
                                                    {filteredArticles[0].title}
                                                </h2>
                                                <div className="flex flex-wrap gap-2 md:gap-3">
                                                    <div className="text-white text-xs md:text-sm border-2 border-black bg-[#FF6B00] p-1 md:p-2 inline-block">
                                                        📅 {formatDate(filteredArticles[0].date)}
                                                    </div>
                                                    <div className="text-white text-xs md:text-sm border-2 border-black bg-purple-600 p-1 md:p-2 inline-block">
                                                        ✍️ {filteredArticles[0].author}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="border-4 border-black p-3 md:p-4 bg-black mb-4 md:mb-6">
                                        <div className="text-white font-mono text-lg md:text-xl">NO ARTICLES FOUND</div>
                                    </div>
                                )}

                                {/* Category Filter */}
                                <div className="border-4 border-black p-3 md:p-5 bg-white">
                                    <div className="text-black font-black text-xl md:text-2xl mb-2 md:mb-3">FILTER BY CATEGORY</div>
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {['ALL', ...categories].map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category === 'ALL' ? null : category)}
                                                className={`px-3 md:px-5 py-1 md:py-2 ${selectedCategory === (category === 'ALL' ? null : category)
                                                    ? 'bg-black text-white'
                                                    : 'bg-[#FF6B00] text-black'
                                                    } border-2 border-black font-mono font-black uppercase text-xs md:text-sm 
                                                hover:bg-yellow-400 hover:text-black transition-all`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Articles Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                                    {filteredArticles.slice(1).map((article, index) => (
                                        <Link
                                            key={article.slug}
                                            href={`/news/${article.slug}`}
                                            className={`group border-4 border-black p-0 ${index % 2 === 0 ? 'bg-purple-600' : 'bg-[#FF6B00]'
                                                } transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]`}
                                        >
                                            <div className="relative h-48 md:h-64 w-full border-4 border-black">
                                                <Image
                                                    src={article.thumbnailImage}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-3 md:p-4 border-t-4 border-black">
                                                <div className="bg-white text-black font-black text-xs px-2 py-1 inline-block mb-2 border-2 border-black">
                                                    {article.category}
                                                </div>
                                                <h3 className="text-white font-black text-lg md:text-xl mb-2 border-2 border-black bg-black p-2">
                                                    {article.title}
                                                </h3>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-white text-xs bg-black p-1 md:p-2 border-2 border-white">
                                                        🗓 {formatDate(article.date)}
                                                    </div>
                                                    <div className="bg-yellow-400 text-black px-2 md:px-3 py-1 border-2 border-black font-mono font-black text-xs md:text-sm hover:bg-white transition-colors">
                                                        READ MORE →
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Newsletter Signup */}
                                <div className="border-4 border-black p-3 md:p-5 bg-purple-600 mt-4 md:mt-8">
                                    <div className="text-white font-black text-xl md:text-2xl mb-2 md:mb-3">GET REKT UPDATES</div>
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                                        <input
                                            type="email"
                                            placeholder="ENTER YOUR EMAIL"
                                            className="px-3 md:px-4 py-2 md:py-3 bg-white text-black border-2 border-black focus:outline-none focus:border-yellow-400 font-mono uppercase text-xs md:text-sm flex-1"
                                        />
                                        <button
                                            className="px-4 md:px-6 py-2 md:py-3 bg-yellow-400 text-black border-2 border-black font-mono font-black uppercase text-xs md:text-sm hover:bg-white hover:border-white transition-all"
                                        >
                                            SUBSCRIBE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
} 