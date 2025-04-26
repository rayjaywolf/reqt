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

interface Article {
    slug: string;
    title: string;
    date: string;
    author: string;
    thumbnailImage: string;
    category: string;
    excerpt: string;
}

export default function ArticlePage() {
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [article, setArticle] = useState<ArticleData | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
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
                    // Fetch related articles after getting the main article
                    const relatedResponse = await fetch(`/api/articles/related/${slug}`);
                    if (relatedResponse.ok) {
                        const relatedData = await relatedResponse.json();
                        setRelatedArticles(relatedData.articles);
                    }
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
                            <div className="bg-yellow-400 text-black p-2 md:p-3 border-b-4 border-black px-4 md:px-16">
                                <div className="flex justify-between items-center">
                                    <Link
                                        href="/news"
                                        className="text-black hover:text-purple-600 transition-colors font-mono font-black border-2 border-black bg-white px-2 md:px-3 py-1 hover:bg-[#FF6B00] text-xs md:text-sm"
                                    >
                                        &larr; BACK TO NEWS
                                    </Link>
                                    <div className="text-xs md:text-sm font-mono border-2 border-black bg-black text-white p-1 md:p-2 inline-block">
                                        🗓 {formatDate(article.date)}
                                    </div>
                                </div>
                            </div>

                            {/* Banner Image */}
                            <div className="relative h-48 md:h-64 w-full border-4 border-black">
                                <Image
                                    src={article.bannerImage}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Article Content */}
                            <div className="p-3 md:p-6 flex-1 flex flex-col space-y-4 md:space-y-8 overflow-y-auto px-4 md:px-16">
                                {/* Article Meta */}
                                <div className="border-4 border-black p-3 md:p-6 bg-purple-600">
                                    <div className="text-white font-black text-xl md:text-3xl mb-2 md:mb-3 border-4 border-black bg-black p-2 md:p-3 inline-block">
                                        {article.category}
                                    </div>
                                    <h1 className="text-white font-black text-2xl md:text-4xl mb-3 md:mb-4 border-4 border-black bg-black p-2 md:p-3">
                                        {article.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-2 md:gap-4">
                                        <div className="text-white text-sm md:text-lg border-2 border-black bg-[#FF6B00] p-1 md:p-2 inline-block">
                                            ✍️ BY {article.author}
                                        </div>
                                        <div className="text-white text-sm md:text-lg border-2 border-black bg-purple-600 p-1 md:p-2 inline-block">
                                            ⏱ 5 MIN READ
                                        </div>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="prose prose-invert max-w-none space-y-4 md:space-y-6 prose-headings:text-white prose-headings:font-black prose-headings:border-2 prose-headings:border-black prose-headings:bg-black prose-headings:p-2 prose-headings:inline-block prose-p:text-white prose-p:text-sm md:prose-p:text-base prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-yellow-400 prose-img:border-4 prose-img:border-black prose-img:rounded-none prose-img:my-4 md:prose-img:my-8 prose-img:mx-auto prose-img:max-w-full prose-img:h-auto prose-img:w-auto prose-img:object-contain">
                                    <MDXRemote
                                        {...article.content}
                                        components={components}
                                    />
                                </div>

                                {/* Related Articles */}
                                <div className="border-4 border-black p-3 md:p-6 bg-[#FF6B00] mt-4 md:mt-8">
                                    <div className="text-white font-black text-xl md:text-2xl mb-3 md:mb-4">RELATED ARTICLES</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {relatedArticles.map((relatedArticle) => (
                                            <Link
                                                key={relatedArticle.slug}
                                                href={`/news/${relatedArticle.slug}`}
                                                className="group border-4 border-black p-0 bg-purple-600 transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]"
                                            >
                                                <div className="relative h-40 md:h-48 w-full border-4 border-black">
                                                    <Image
                                                        src={relatedArticle.thumbnailImage}
                                                        alt={relatedArticle.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="p-3 md:p-4 border-t-4 border-black">
                                                    <div className="bg-white text-black font-black text-xs px-2 py-1 inline-block mb-2 border-2 border-black">
                                                        {relatedArticle.category}
                                                    </div>
                                                    <h3 className="text-white font-black text-base md:text-lg mb-2 border-2 border-black bg-black p-2">
                                                        {relatedArticle.title}
                                                    </h3>
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-white text-xs bg-black p-1 md:p-2 border-2 border-white">
                                                            🗓 {formatDate(relatedArticle.date)}
                                                        </div>
                                                        <div className="bg-yellow-400 text-black px-2 md:px-3 py-1 border-2 border-black font-mono font-black text-xs md:text-sm hover:bg-white transition-colors">
                                                            READ MORE →
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
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