"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TokenData {
    associatedTokenAddress: string;
    mint: string;
    name: string;
    symbol: string;
    amount: string;
    amountRaw: string;
    decimals: string;
    currentPrice?: number;
    description?: string;
    logo?: string;
}

interface NftData {
    associatedTokenAddress: string;
    mint: string;
    name: string;
    symbol: string;
}

interface SwapToken {
    address: string;
    amount: string;
    usdPrice: number;
    usdAmount: number;
    symbol: string;
    logo: string;
    name: string;
    tokenType: string;
}

interface SwapTransaction {
    transactionHash: string;
    transactionType: string;
    baseQuotePrice: string;
    blockTimestamp: string;
    walletAddress: string;
    pairLabel: string;
    exchangeName: string;
    bought: SwapToken;
    sold: SwapToken;
    totalValueUsd: number;
}

interface PortfolioData {
    nativeBalance: {
        solana: string;
        lamports: string;
    };
    tokens: TokenData[];
    nfts: NftData[];
    swaps: SwapTransaction[];
}

interface ProfitCalculation {
    realized: number;
    unrealized: number;
    total: number;
    totalBoughtUSD: number;
    averageBuyPrice: number;
    totalSoldUSD: number;
    averageSellPrice: number;
}

export default function PortfolioPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const address = searchParams.get("address");

    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "tokens" | "nfts" | "swaps">("overview");
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "ascending" | "descending";
    }>({ key: "value", direction: "descending" });
    const [walletInput, setWalletInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    useEffect(() => {
        const fetchPortfolioData = async () => {
            if (!address) return;

            setIsLoading(true);
            setError("");

            try {
                const response = await fetch(`/api/wallet?address=${address}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch wallet data");
                }

                const data = await response.json();
                setPortfolioData(data);
            } catch (err) {
                console.error(err);
                setError("Error fetching wallet data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolioData();
    }, [address]);

    const calculateTokenProfits = (token: TokenData): ProfitCalculation => {
        if (!portfolioData?.swaps) return {
            realized: 0,
            unrealized: 0,
            total: 0,
            totalBoughtUSD: 0,
            averageBuyPrice: 0,
            totalSoldUSD: 0,
            averageSellPrice: 0
        };

        let boughtAmount = 0;
        let totalCost = 0;
        let soldAmount = 0;
        let totalProceeds = 0;

        portfolioData.swaps.forEach(swap => {
            const isThisTokenBuy = swap.bought.address === token.mint;
            const isThisTokenSell = swap.sold.address === token.mint;

            if (isThisTokenBuy) {
                const amount = parseFloat(swap.bought.amount);
                boughtAmount += amount;
                totalCost += swap.bought.usdAmount;
            }

            if (isThisTokenSell) {
                const amount = parseFloat(swap.sold.amount);
                soldAmount += amount;
                totalProceeds += swap.sold.usdAmount;
            }
        });

        // Handle division by zero cases
        const averageBuyPrice = boughtAmount > 0 ? totalCost / boughtAmount : 0;
        const averageSellPrice = soldAmount > 0 ? totalProceeds / soldAmount : 0;

        // Handle cases with no bought amount
        const realized = boughtAmount > 0
            ? totalProceeds - (totalCost * (soldAmount / boughtAmount))
            : 0;

        const remainingAmount = boughtAmount - soldAmount;
        const unrealized = boughtAmount > 0
            ? remainingAmount * (token.currentPrice || 0) - (totalCost * (remainingAmount / boughtAmount))
            : 0;

        return {
            realized: Number(realized.toFixed(2)),
            unrealized: Number(unrealized.toFixed(2)),
            total: Number((realized + unrealized).toFixed(2)),
            totalBoughtUSD: totalCost,
            averageBuyPrice: averageBuyPrice,
            totalSoldUSD: totalProceeds,
            averageSellPrice: averageSellPrice
        };
    };

    const formatPrice = (price: number) => {
        if (price === 0) return '$0.0';
        return `$${price.toFixed(1)}`;
    };

    const formatAmount = (amount: string, decimals: string) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "0";

        const dec = parseInt(decimals);
        if (isNaN(dec)) return num.toString();

        const formatted = num.toFixed(dec);
        return formatted.replace(/\.?0+$/, '');
    };

    const formatSolAmount = (amount: string) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "0.00";
        return num.toFixed(2);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const handleSort = (key: string) => {
        let direction: "ascending" | "descending" = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortedTokens = () => {
        if (!portfolioData?.tokens && !portfolioData?.swaps) return [];

        // Create a map of all tokens the wallet has ever owned
        const allTokensMap = new Map<string, TokenData>();

        // First add current tokens
        if (portfolioData.tokens) {
            portfolioData.tokens.forEach(token => {
                allTokensMap.set(token.mint, { ...token });
            });
        }

        // Then add tokens from swap history that aren't already in the map
        if (portfolioData.swaps) {
            portfolioData.swaps.forEach(swap => {
                // Add bought tokens
                if (swap.bought && swap.bought.address && !allTokensMap.has(swap.bought.address)) {
                    allTokensMap.set(swap.bought.address, {
                        associatedTokenAddress: swap.bought.address,
                        mint: swap.bought.address,
                        name: swap.bought.name || "Unknown",
                        symbol: swap.bought.symbol || "—",
                        amount: "0",
                        amountRaw: "0",
                        decimals: "9", // Default decimals
                        currentPrice: 0,
                        logo: swap.bought.logo || ""
                    });
                }

                // Add sold tokens
                if (swap.sold && swap.sold.address && !allTokensMap.has(swap.sold.address)) {
                    allTokensMap.set(swap.sold.address, {
                        associatedTokenAddress: swap.sold.address,
                        mint: swap.sold.address,
                        name: swap.sold.name || "Unknown",
                        symbol: swap.sold.symbol || "—",
                        amount: "0",
                        amountRaw: "0",
                        decimals: "9", // Default decimals
                        currentPrice: 0,
                        logo: swap.sold.logo || ""
                    });
                }
            });
        }

        // Convert map to array
        const allTokens = Array.from(allTokensMap.values());

        // Sort tokens
        allTokens.sort((a, b) => {
            const aValue = parseFloat(a.amount) * (a.currentPrice || 0);
            const bValue = parseFloat(b.amount) * (b.currentPrice || 0);
            const aProfits = calculateTokenProfits(a);
            const bProfits = calculateTokenProfits(b);

            if (sortConfig.key === "value") {
                return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
            } else if (sortConfig.key === "name") {
                return sortConfig.direction === "ascending"
                    ? (a.name || "").localeCompare(b.name || "")
                    : (b.name || "").localeCompare(a.name || "");
            } else if (sortConfig.key === "symbol") {
                return sortConfig.direction === "ascending"
                    ? (a.symbol || "").localeCompare(b.symbol || "")
                    : (b.symbol || "").localeCompare(a.symbol || "");
            } else if (sortConfig.key === "balance") {
                return sortConfig.direction === "ascending"
                    ? parseFloat(a.amount) - parseFloat(b.amount)
                    : parseFloat(b.amount) - parseFloat(a.amount);
            } else if (sortConfig.key === "bought") {
                return sortConfig.direction === "ascending"
                    ? aProfits.totalBoughtUSD - bProfits.totalBoughtUSD
                    : bProfits.totalBoughtUSD - aProfits.totalBoughtUSD;
            } else if (sortConfig.key === "sold") {
                return sortConfig.direction === "ascending"
                    ? aProfits.totalSoldUSD - bProfits.totalSoldUSD
                    : bProfits.totalSoldUSD - aProfits.totalSoldUSD;
            } else if (sortConfig.key === "realized") {
                return sortConfig.direction === "ascending"
                    ? aProfits.realized - bProfits.realized
                    : bProfits.realized - aProfits.realized;
            } else if (sortConfig.key === "unrealized") {
                return sortConfig.direction === "ascending"
                    ? aProfits.unrealized - bProfits.unrealized
                    : bProfits.unrealized - aProfits.unrealized;
            } else if (sortConfig.key === "total") {
                return sortConfig.direction === "ascending"
                    ? aProfits.total - bProfits.total
                    : bProfits.total - aProfits.total;
            }

            return 0;
        });

        return allTokens;
    };

    const getSortedSwaps = () => {
        if (!portfolioData?.swaps) return [];

        const sortedSwaps = [...portfolioData.swaps];

        sortedSwaps.sort((a, b) => {
            if (sortConfig.key === "date") {
                const aDate = new Date(a.blockTimestamp).getTime();
                const bDate = new Date(b.blockTimestamp).getTime();
                return sortConfig.direction === "ascending" ? aDate - bDate : bDate - aDate;
            } else if (sortConfig.key === "value") {
                return sortConfig.direction === "ascending"
                    ? a.totalValueUsd - b.totalValueUsd
                    : b.totalValueUsd - a.totalValueUsd;
            }

            return 0;
        });

        return sortedSwaps;
    };

    const calculateTotalPortfolioValue = () => {
        if (!portfolioData) return 0;

        const solValue = parseFloat(portfolioData.nativeBalance?.solana || "0") * (solanaPrice || 0);

        const tokenValue = portfolioData.tokens.reduce((total, token) => {
            const amount = parseFloat(token.amount || "0");
            const price = token.currentPrice || 0;
            return total + (amount * price);
        }, 0);

        return solValue + tokenValue;
    };

    const renderOverview = () => {
        if (!portfolioData) return null;

        const totalValue = calculateTotalPortfolioValue();
        const solValue = parseFloat(portfolioData.nativeBalance?.solana || "0") * (solanaPrice || 0);
        const tokenValue = totalValue - solValue;

        return (
            <div className="space-y-6 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-600 p-6 rounded-lg border-4 border-black">
                        <h3 className="text-white font-black text-xl uppercase mb-2">Total Value</h3>
                        <p className="text-white font-black text-3xl">{formatPrice(totalValue)}</p>
                    </div>

                    <div className="bg-yellow-400 p-6 rounded-lg border-4 border-black">
                        <h3 className="text-black font-black text-xl uppercase mb-2">SOL Balance</h3>
                        <p className="text-black font-black text-3xl">{formatSolAmount(portfolioData.nativeBalance?.solana || "0")} SOL</p>
                        <p className="text-black font-black text-lg">{formatPrice(solValue)}</p>
                    </div>

                    <div className="bg-cyan-400 p-6 rounded-lg border-4 border-black">
                        <h3 className="text-black font-black text-xl uppercase mb-2">Token Value</h3>
                        <p className="text-black font-black text-3xl">{formatPrice(tokenValue)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-lg border-4 border-black">
                        <h3 className="text-black font-black text-xl uppercase mb-4">Asset Distribution</h3>
                        <div className="h-64 flex items-center justify-center">
                            {/* Placeholder for chart */}
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 via-yellow-400 to-cyan-400 mx-auto mb-4"></div>
                                    <p className="text-black font-black">SOL: {((solValue / totalValue) * 100).toFixed(1)}%</p>
                                    <p className="text-black font-black">Tokens: {((tokenValue / totalValue) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border-4 border-black">
                        <h3 className="text-black font-black text-xl uppercase mb-4">Portfolio Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-black">Total Tokens:</span>
                                <span>{portfolioData.tokens?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-black">Total NFTs:</span>
                                <span>{portfolioData.nfts?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-black">Total Swaps:</span>
                                <span>{portfolioData.swaps?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-black">SOL Price:</span>
                                <span>{formatPrice(solanaPrice || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTokens = () => {
        const sortedTokens = getSortedTokens();

        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th
                                className="p-3 text-left cursor-pointer"
                                onClick={() => handleSort("name")}
                            >
                                Token {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-left cursor-pointer"
                                onClick={() => handleSort("symbol")}
                            >
                                Symbol {sortConfig.key === "symbol" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("balance")}
                            >
                                Current Balance {sortConfig.key === "balance" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("bought")}
                            >
                                Bought (USD) {sortConfig.key === "bought" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("sold")}
                            >
                                Sold (USD) {sortConfig.key === "sold" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("value")}
                            >
                                Current Value {sortConfig.key === "value" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("realized")}
                            >
                                Realized PNL {sortConfig.key === "realized" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("unrealized")}
                            >
                                Unrealized PNL {sortConfig.key === "unrealized" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-3 text-right cursor-pointer"
                                onClick={() => handleSort("total")}
                            >
                                Total PNL {sortConfig.key === "total" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTokens.map((token, index) => {
                            const amount = parseFloat(token.amount || "0");
                            const price = token.currentPrice || 0;
                            const value = amount * price;
                            const profits = calculateTokenProfits(token);

                            return (
                                <tr
                                    key={token.mint}
                                    className={cn(
                                        "border-b-2 border-black",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    )}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {token.logo ? (
                                                    <Image
                                                        src={token.logo}
                                                        alt={token.symbol || "Token"}
                                                        width={32}
                                                        height={32}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-black">{token.symbol?.charAt(0) || "?"}</span>
                                                )}
                                            </div>
                                            <span className="font-black">{token.name || "Unknown"}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono">{token.symbol || "—"}</td>
                                    <td className="p-3 text-right font-mono">{formatAmount(token.amount || "0", token.decimals || "0")}</td>
                                    <td className="p-3 text-right font-mono">{formatPrice(profits.totalBoughtUSD)}</td>
                                    <td className="p-3 text-right font-mono">{formatPrice(profits.totalSoldUSD)}</td>
                                    <td className="p-3 text-right font-mono">{formatPrice(value)}</td>
                                    <td className={cn(
                                        "p-3 text-right font-mono",
                                        profits.realized > 0 ? "text-green-600" : profits.realized < 0 ? "text-red-600" : ""
                                    )}>
                                        {formatPrice(profits.realized)}
                                    </td>
                                    <td className={cn(
                                        "p-3 text-right font-mono",
                                        profits.unrealized > 0 ? "text-green-600" : profits.unrealized < 0 ? "text-red-600" : ""
                                    )}>
                                        {formatPrice(profits.unrealized)}
                                    </td>
                                    <td className={cn(
                                        "p-3 text-right font-mono",
                                        profits.total > 0 ? "text-green-600" : profits.total < 0 ? "text-red-600" : ""
                                    )}>
                                        {formatPrice(profits.total)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderNFTs = () => {
        if (!portfolioData?.nfts) return null;

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioData.nfts.map((nft) => (
                    <div key={nft.mint} className="bg-white p-4 rounded-lg border-4 border-black">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                            <span className="text-black font-black">NFT</span>
                        </div>
                        <h3 className="text-black font-black truncate">{nft.name || "Unknown NFT"}</h3>
                        <p className="text-black font-mono text-sm truncate">{nft.symbol || "—"}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderSwaps = () => {
        if (!portfolioData?.swaps) return null;

        const sortedSwaps = getSortedSwaps();
        const totalPages = Math.ceil(sortedSwaps.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSwaps = sortedSwaps.slice(startIndex, endIndex);

        return (
            <div className="space-y-4">
                {currentSwaps.map((swap, index) => (
                    <div
                        key={`${swap.transactionHash}-${index}`}
                        className={cn(
                            "p-4 rounded-lg border-4",
                            swap.transactionType === "buy"
                                ? "bg-green-100 border-green-500"
                                : "bg-red-100 border-red-500"
                        )}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-black">
                                {swap.transactionType === "buy" ? "BUY" : "SELL"}
                            </div>
                            <div className="font-mono text-sm">
                                {formatDate(swap.blockTimestamp)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-lg border-2 border-black">
                                <div className="font-black mb-1">{swap.transactionType === "buy" ? "Bought" : "Sold"}</div>
                                <div className="font-mono">{swap.transactionType === "buy" ? swap.bought.name : swap.sold.name}</div>
                                <div className="font-mono text-sm">{swap.transactionType === "buy" ? swap.bought.symbol : swap.sold.symbol}</div>
                                <div className="font-mono text-sm">{swap.transactionType === "buy" ? swap.bought.amount : swap.sold.amount}</div>
                                <div className="font-mono text-sm">{formatPrice(swap.transactionType === "buy" ? swap.bought.usdAmount : swap.sold.usdAmount)}</div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border-2 border-black">
                                <div className="font-black mb-1">{swap.transactionType === "buy" ? "Paid With" : "Received"}</div>
                                <div className="font-mono">{swap.transactionType === "buy" ? swap.sold.name : swap.bought.name}</div>
                                <div className="font-mono text-sm">{swap.transactionType === "buy" ? swap.sold.symbol : swap.bought.symbol}</div>
                                <div className="font-mono text-sm">{swap.transactionType === "buy" ? swap.sold.amount : swap.bought.amount}</div>
                                <div className="font-mono text-sm">{formatPrice(swap.transactionType === "buy" ? swap.sold.usdAmount : swap.bought.usdAmount)}</div>
                            </div>
                        </div>

                        <div className="mt-2 text-right font-mono text-sm">
                            Total Value: {formatPrice(swap.totalValueUsd)}
                        </div>
                    </div>
                ))}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={cn(
                                "px-4 py-2 bg-black text-white border-2 border-black font-mono font-black uppercase text-xs",
                                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500 hover:text-white transition-colors"
                            )}
                        >
                            Previous
                        </button>
                        <span className="font-mono font-black">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={cn(
                                "px-4 py-2 bg-black text-white border-2 border-black font-mono font-black uppercase text-xs",
                                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500 hover:text-white transition-colors"
                            )}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const handleWalletSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (walletInput.trim()) {
            router.push(`/portfolio?address=${walletInput.trim()}`);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    if (!address) {
        return (
            <div className="h-[100%] bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-[#FF6B00] p-8 border-8 border-black max-w-md w-full transform hover:rotate-0 transition-transform">
                    <div className="bg-black p-4 border-4 border-[#ffeb3b] mb-6">
                        <h1 className="text-3xl font-mono font-black tracking-tight text-center uppercase text-white">ENTER WALLET ADDRESS</h1>
                    </div>

                    <form onSubmit={handleWalletSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="wallet" className="block text-sm font-black mb-2 text-black">WALLET ADDRESS</label>
                            <input
                                id="wallet"
                                type="text"
                                value={walletInput}
                                onChange={(e) => setWalletInput(e.target.value)}
                                placeholder="Enter Solana wallet address"
                                className="w-full px-4 py-3 bg-white border-4 border-black font-mono text-sm focus:outline-none focus:border-[#ffeb3b] focus:translate-x-1 focus:translate-y-1 transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-[#ffeb3b] text-black border-4 border-black font-mono font-black uppercase text-sm hover:bg-white hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            ANALYZE PORTFOLIO
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/">
                            <button className="px-4 py-2 bg-black text-white border-4 border-[#ffeb3b] font-mono font-black uppercase text-xs hover:bg-[#FF6B00] hover:text-black transition-all">
                                BACK HOME
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg border-4 border-black max-w-md w-full">
                    <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase mb-4">LOADING PORTFOLIO</h1>
                    <div className="w-full bg-white border-2 border-black p-3">
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 border-2 bg-black border-black animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg border-4 border-black max-w-md w-full">
                    <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase mb-4">ERROR</h1>
                    <p className="text-red-600 font-mono text-center mb-4">{error}</p>
                    <Link href="/">
                        <button className="w-full px-4 py-2 bg-black text-white border-4 border-white font-mono font-black uppercase text-sm hover:bg-red-500 hover:text-white transition-colors">
                            GO BACK HOME
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!portfolioData) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg border-4 border-black max-w-md w-full">
                    <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase mb-4">NO DATA</h1>
                    <p className="font-mono text-center mb-4">No portfolio data available. Please check the wallet address.</p>
                    <Link href="/">
                        <button className="w-full px-4 py-2 bg-black text-white border-4 border-white font-mono font-black uppercase text-sm hover:bg-red-500 hover:text-white transition-colors">
                            GO BACK HOME
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black mb-16">
            <div className="bg-white text-black p-2">
                <div className="flex items-center justify-center gap-2">
                    <h1 className="text-xl md:text-2xl font-mono font-black tracking-tight text-center uppercase">PORTFOLIO ANALYSIS</h1>
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-full border-2 border-black"> BETA</span>
                </div>
            </div>

            <div className="p-4">
                <div className="bg-white p-4 rounded-lg border-4 border-black mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="font-mono">
                            <span className="font-black">WALLET:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <div className="flex gap-2">
                            <Link href="/">
                                <button className="px-4 py-2 bg-black text-white border-2 border-black font-mono font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-colors">
                                    BACK HOME
                                </button>
                            </Link>
                            <Link href={`/?address=${address}`}>
                                <button className="px-4 py-2 bg-purple-600 text-white border-2 border-black font-mono font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors">
                                    ROAST THIS WALLET
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border-4 border-black overflow-hidden">
                    <div className="flex flex-wrap border-b-4 border-black">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={cn(
                                "px-4 py-2 font-mono font-black uppercase text-sm",
                                activeTab === "overview"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                            )}
                        >
                            OVERVIEW
                        </button>
                        <button
                            onClick={() => setActiveTab("tokens")}
                            className={cn(
                                "px-4 py-2 font-mono font-black uppercase text-sm",
                                activeTab === "tokens"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                            )}
                        >
                            TOKENS
                        </button>
                        <button
                            onClick={() => setActiveTab("nfts")}
                            className={cn(
                                "px-4 py-2 font-mono font-black uppercase text-sm",
                                activeTab === "nfts"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                            )}
                        >
                            NFTS
                        </button>
                        <button
                            onClick={() => setActiveTab("swaps")}
                            className={cn(
                                "px-4 py-2 font-mono font-black uppercase text-sm",
                                activeTab === "swaps"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                            )}
                        >
                            SWAPS
                        </button>
                    </div>

                    <div className="p-4">
                        {activeTab === "overview" && renderOverview()}
                        {activeTab === "tokens" && renderTokens()}
                        {activeTab === "nfts" && renderNFTs()}
                        {activeTab === "swaps" && renderSwaps()}
                    </div>
                </div>
            </div>
        </div>
    );
} 