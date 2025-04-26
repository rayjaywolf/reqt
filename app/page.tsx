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

interface CombinedToken {
  name: string;
  symbol: string;
  address: string;
  amount?: string;
  logo?: string;
  isPastToken: boolean;
  currentPrice?: number;
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

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'input' | 'analyzing' | 'wallet' | 'roasting' | 'result'>('input');
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [roastParagraphs, setRoastParagraphs] = useState<string[]>([]);
  const [typedContent, setTypedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputAddress) {
      setError("Please enter a wallet address");
      return;
    }

    setError("");
    setIsLoading(true);
    setWalletAddress(inputAddress);
    setRoastResult(null);
    setCurrentScreen('analyzing');

    // Start the loading animation immediately
    setLoadingStep(0);
    setLoadingComplete(false);

    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 5) {
          return prev + 1;
        }
        clearInterval(loadingInterval);
        setLoadingComplete(true);
        setCurrentScreen('wallet');
        return prev;
      });
    }, 1000);

    try {
      const response = await fetch(`/api/wallet?address=${inputAddress}`);

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const data = await response.json();
      setPortfolioData(data);

      // Only proceed to wallet screen after loading animation is complete
      if (loadingComplete) {
        setCurrentScreen('wallet');
      } else {
        // If data is ready but loading isn't complete, wait for it
        const checkLoading = setInterval(() => {
          if (loadingComplete) {
            clearInterval(checkLoading);
            setCurrentScreen('wallet');
          }
        }, 100);
      }
    } catch (err) {
      setError("Error fetching wallet data. Please try again.");
      console.error(err);
      if (loadingComplete) {
        setCurrentScreen('input');
      } else {
        // If error occurs but loading isn't complete, wait for it
        const checkLoading = setInterval(() => {
          if (loadingComplete) {
            clearInterval(checkLoading);
            setCurrentScreen('input');
          }
        }, 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Combine current tokens and past tokens
  const combinedTokens: CombinedToken[] = [];

  if (portfolioData) {
    // Add current tokens
    if (portfolioData.tokens && portfolioData.tokens.length > 0) {
      portfolioData.tokens.forEach(token => {
        combinedTokens.push({
          name: token.name || "Unknown",
          symbol: token.symbol || "—",
          address: token.mint,
          amount: token.amount || "0",
          isPastToken: false,
          currentPrice: token.currentPrice
        });
      });
    }

    // Add past tokens that aren't in the current list
    if (portfolioData.swaps && portfolioData.swaps.length > 0) {
      // Get all current token addresses
      const currentTokenAddresses = new Set(
        portfolioData.tokens?.map(token => token.mint) || []
      );

      // Extract unique sold tokens not in current tokens
      const soldTokens = new Map();

      portfolioData.swaps
        .filter(swap => swap.transactionType === 'sell')
        .forEach(swap => {
          const token = swap.sold;
          // Only add if not already in current tokens
          if (!currentTokenAddresses.has(token.address) && !soldTokens.has(token.address)) {
            soldTokens.set(token.address, {
              name: token.name || "Unknown",
              symbol: token.symbol || "—",
              address: token.address,
              logo: token.logo,
              isPastToken: true,
              currentPrice: 0
            });
          }
        });

      // Add the unique sold tokens to combined list
      combinedTokens.push(...soldTokens.values());
    }
  }

  const calculateTokenProfits = (token: CombinedToken): ProfitCalculation => {
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
      const isThisTokenBuy = swap.bought.address === token.address;
      const isThisTokenSell = swap.sold.address === token.address;

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

  const handleRoast = async () => {
    if (!portfolioData) return;

    setIsRoasting(true);
    setRoastResult(null);
    setCurrentScreen('roasting');
    setCurrentParagraphIndex(0);
    setRoastParagraphs([]);

    // Start the loading animation immediately
    setLoadingStep(0);
    setLoadingComplete(false);

    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 5) {
          return prev + 1;
        }
        clearInterval(loadingInterval);
        setLoadingComplete(true);
        setCurrentScreen('result');
        return prev;
      });
    }, 1000);

    try {
      const summaryData = {
        walletAddress,
        solBalance: portfolioData.nativeBalance?.solana || "0",
        tokens: combinedTokens.map(token => {
          const profits = calculateTokenProfits(token);
          return {
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            status: token.isPastToken ? "Sold" : "Held",
            amount: token.amount || "0",
            currentPrice: token.currentPrice || 0,
            totalBought: profits.totalBoughtUSD,
            avgBuy: profits.averageBuyPrice,
            totalSold: profits.totalSoldUSD,
            avgSell: profits.averageSellPrice,
            realized: profits.realized,
            unrealized: profits.unrealized,
            totalPNL: profits.total
          }
        })
      };

      const formatPricePlain = (price: number) => {
        if (price === 0) return '$0.0';
        const parts = price.toFixed(10).split('.');
        const decimalPart = parts[1].replace(/0+$/, '');
        const leadingZeros = decimalPart.match(/^0+/)?.[0]?.length || 0;

        return leadingZeros > 0
          ? `$${parts[0]}.0(${leadingZeros})${decimalPart.slice(leadingZeros)}`
          : `$${price.toFixed(4).replace(/\.?0+$/, '')}`;
      };

      const text = `Wallet Address: ${summaryData.walletAddress}
SOL Balance: ${summaryData.solBalance} SOL

Token Holdings:
${summaryData.tokens.map(token => `
- ${token.name} (${token.symbol})
  Address: ${token.address}
  Status: ${token.status}
  Amount: ${token.amount}
  Current Price: $${token.currentPrice.toFixed(4)}
  Bought: $${token.totalBought.toFixed(2)} (Avg: ${formatPricePlain(token.avgBuy)})
  Sold: $${token.totalSold.toFixed(2)} (Avg: ${formatPricePlain(token.avgSell)})
  PNL:
    Realized: $${token.realized.toFixed(2)}
    Unrealized: $${token.unrealized.toFixed(2)}
    Total: $${token.totalPNL.toFixed(2)}
`).join('')}`;

      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get roast');
      }

      const data = await response.json();
      setRoastResult(data.content);

      // Split the roast into paragraphs
      const paragraphs = data.content.split('\n\n').filter((p: string) => p.trim() !== '');
      setRoastParagraphs(paragraphs);

      // Only proceed to result screen after loading animation is complete
      if (loadingComplete) {
        setCurrentScreen('result');
      } else {
        // If data is ready but loading isn't complete, wait for it
        const checkLoading = setInterval(() => {
          if (loadingComplete) {
            clearInterval(checkLoading);
            setCurrentScreen('result');
          }
        }, 100);
      }
    } catch (err) {
      console.error('Failed to roast portfolio:', err);
      setError('Error roasting portfolio. Please try again.');
      if (loadingComplete) {
        setCurrentScreen('wallet');
      } else {
        // If error occurs but loading isn't complete, wait for it
        const checkLoading = setInterval(() => {
          if (loadingComplete) {
            clearInterval(checkLoading);
            setCurrentScreen('wallet');
          }
        }, 100);
      }
    } finally {
      setIsRoasting(false);
    }
  };

  const handleNextParagraph = () => {
    if (currentParagraphIndex < roastParagraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1);
      setTypedContent("");
      setIsTyping(true);
    }
  };

  const handlePreviousParagraph = () => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(prev => prev - 1);
      setTypedContent("");
      setIsTyping(true);
    }
  };

  const handleReset = () => {
    setCurrentScreen('input');
    setInputAddress("");
    setWalletAddress("");
    setPortfolioData(null);
    setRoastResult(null);
    setError("");
    setCurrentParagraphIndex(0);
    setRoastParagraphs([]);
  };

  useEffect(() => {
    if (currentScreen === 'result' && roastParagraphs.length > 0) {
      setTypedContent("");
      setIsTyping(true);
    }
  }, [currentScreen, roastParagraphs]);

  useEffect(() => {
    if (isTyping && currentParagraphIndex < roastParagraphs.length) {
      const content = roastParagraphs[currentParagraphIndex];
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < content.length) {
          setTypedContent(content.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isTyping, currentParagraphIndex, roastParagraphs]);

  const loadingMessages = [
    "INITIALIZING SARCASM MODULE...",
    "CALCULATING YOUR FINANCIAL MISTAKES...",
    "ANALYZING YOUR POOR DECISION MAKING...",
    "MEASURING YOUR LOSSES...",
    "FINALIZING YOUR HUMILIATION..."
  ];

  const roastingMessages = [
    "INITIALIZING SAVAGE MODE...",
    "LOADING DISRESPECT DATABASE...",
    "CALCULATING YOUR FINANCIAL FAILURES...",
    "ANALYZING YOUR POOR CHOICES...",
    "FINALIZING YOUR HUMILIATION..."
  ];

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

  // Render different screens based on current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'input':
        return (
          <section className="bg-black border-2 border-white p-0 overflow-hidden h-full flex flex-col justify-start">
            <div className="bg-white text-black p-2">
              <h1 className="text-xl font-mono font-black tracking-tight text-center uppercase">ROAST MY PORTFOLIO</h1>
            </div>

            <div className="p-4 flex-1 flex flex-col items-center justify-center">
              <div className="mb-4 -mt-4 w-full max-w-sm">
                <Image
                  src="/text.png"
                  alt="REKT"
                  width={300}
                  height={75}
                  className="w-full"
                  priority
                />
              </div>

              <div className="mb-6 font-mono text-white text-center max-w-sm">
                <p className="text-base font-black mb-1">EXPOSE YOUR FINANCIAL TRAUMA</p>
                <p className="text-xs">DROP YOUR SOLANA ADDRESS BELOW AND WATCH US TURN YOUR TRADING HISTORY INTO A COMEDY SPECIAL. WE'RE LIKE YOUR THERAPIST, BUT MEANER.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 w-full max-w-sm">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    placeholder="ENTER SOLANA WALLET ADDRESS"
                    className="px-3 py-2 bg-white text-black border-2 border-black focus:outline-none focus:border-purple-600 font-mono uppercase text-xs text-center"
                    aria-label="Solana wallet address"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-2 bg-purple-600 text-white border-2 border-black font-mono font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "LOADING..." : "LOAD WALLET"}
                  </button>
                </div>

                {error && (
                  <p className="text-purple-600 font-mono text-xs border-2 border-purple-600 p-2 bg-white">{error}</p>
                )}
              </form>
            </div>

            <div className="bg-white h-1 w-full"></div>
          </section>
        );

      case 'analyzing':
        return (
          <section className="bg-black border-2 border-white p-0 overflow-hidden h-full flex flex-col justify-center">
            <div className="bg-white text-black p-2">
              <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase">ANALYZING YOUR MISTAKES</h1>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-center items-center">
              <div className="font-mono text-white text-center w-full max-w-2xl">
                <div className="text-xl mb-3 flex justify-center">
                  <span className="bg-purple-600 text-white px-4 py-1">WALLET: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>

                <div className="text-lg mb-4 bg-white p-3 border-2 border-black">
                  <div className="text-black font-black">
                    {loadingMessages[loadingStep]}
                  </div>
                </div>

                <div className="w-full bg-white border-2 border-black p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 border-2 ${i < loadingStep
                          ? 'bg-purple-600 border-black'
                          : 'bg-black border-black'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-right text-black font-black text-sm">
                    {loadingStep * 20}% COMPLETE
                  </div>
                </div>

                <div className="mt-4 text-sm text-purple-600 font-black">
                  {loadingStep < 3 ? "PREPARING TO EXPOSE YOUR FINANCIAL MISTAKES..." : "ALMOST READY TO ROAST YOUR PORTFOLIO..."}
                </div>
              </div>
            </div>

            <div className="bg-white h-1 w-full"></div>
          </section>
        );

      case 'wallet':
        return (
          <section className="bg-black border-2 border-white p-0 overflow-hidden h-full flex flex-col">
            <div className="bg-white text-black p-2">
              <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase">WALLET LOADED</h1>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="border-4 border-white mb-4">
                <div className="bg-white text-black p-2 border-b-4 border-black flex items-center justify-between">
                  <span className="font-black text-lg uppercase">WALLET DETAILS</span>
                  <span className="bg-black text-white px-2 py-1 font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>

                <div className="grid grid-cols-2 font-mono">
                  <div className="bg-purple-600 p-6 border-r-4 border-white border-b-4 flex flex-col items-center justify-center">
                    <div className="text-white font-black text-2xl">{portfolioData?.nativeBalance?.solana || "0"}</div>
                    <div className="text-white font-black uppercase text-sm">SOL</div>
                  </div>

                  <div className="bg-yellow-400 p-6 border-b-4 border-white flex flex-col items-center justify-center">
                    <div className="text-black font-black text-2xl">{portfolioData?.tokens?.length || 0}</div>
                    <div className="text-black font-black uppercase text-sm">TOKENS</div>
                  </div>

                  <div className="bg-cyan-400 p-6 border-r-4 border-white flex flex-col items-center justify-center">
                    <div className="text-black font-black text-2xl">{portfolioData?.nfts?.length || 0}</div>
                    <div className="text-black font-black uppercase text-sm">NFTS</div>
                  </div>

                  <div className="bg-green-400 p-6 flex flex-col items-center justify-center">
                    <div className="text-black font-black text-2xl">{portfolioData?.swaps?.length || 0}</div>
                    <div className="text-black font-black uppercase text-sm">SWAPS</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto mb-2 flex flex-col items-center gap-3">
                <button
                  onClick={handleRoast}
                  disabled={isRoasting}
                  className="px-8 py-3 bg-white text-black border-4 border-black font-mono font-black uppercase text-lg hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;&gt; ROAST THIS WALLET &lt;&lt;
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-black text-white border-4 border-white font-mono font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-colors"
                >
                  CHECK A DIFFERENT WALLET
                </button>
              </div>
            </div>
          </section>
        );

      case 'roasting':
        return (
          <section className="bg-black border-2 border-white p-0 overflow-hidden h-full flex flex-col justify-center">
            <div className="bg-white text-black p-2">
              <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase">ROASTING YOUR PORTFOLIO</h1>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-center items-center">
              <div className="font-mono text-white text-center w-full max-w-2xl">
                <div className="text-xl mb-3 flex justify-center">
                  <span className="bg-purple-600 text-white px-4 py-1">PREPARING SAVAGE ROAST</span>
                </div>

                <div className="text-lg mb-4 bg-white p-3 border-2 border-black">
                  <div className="text-black font-black">
                    {roastingMessages[loadingStep]}
                  </div>
                </div>

                <div className="w-full bg-white border-2 border-black p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 border-2 ${i < loadingStep
                          ? 'bg-purple-600 border-black'
                          : 'bg-black border-black'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-right text-black font-black text-sm">
                    {loadingStep * 20}% COMPLETE
                  </div>
                </div>

                <div className="mt-4 text-sm text-purple-600 font-black">
                  {loadingStep < 3 ? "GATHERING EVIDENCE OF YOUR POOR DECISIONS..." : "ALMOST READY TO EXPOSE YOUR FAILURES..."}
                </div>
              </div>
            </div>

            <div className="bg-white h-1 w-full"></div>
          </section>
        );

      case 'result':
        return (
          <section className="bg-black p-0 overflow-hidden h-full flex flex-col">
            <div className="bg-white text-black p-2">
              <h1 className="text-2xl font-mono font-black tracking-tight text-center uppercase">PORTFOLIO ROAST</h1>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-center">
              <div className="font-mono text-white h-full flex items-center justify-center">
                <div className="flex items-start gap-6 max-w-4xl w-full">
                  <div className="flex-shrink-0">
                    <Image
                      src="/sal.png"
                      alt="SAL"
                      width={120}
                      height={120}
                      className="rounded-lg border-2 border-white"
                      priority
                    />
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-lg border-2 border-white relative flex">
                    <div className="absolute left-[-12px] top-8 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-white border-b-[12px] border-b-transparent" />
                    <div
                      dangerouslySetInnerHTML={{ __html: typedContent }}
                      className="text-black text-xl relative font-black leading-relaxed whitespace-pre-wrap"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 flex justify-between bg-black">
              <button
                onClick={handlePreviousParagraph}
                disabled={currentParagraphIndex === 0}
                className="px-4 py-2 bg-white text-black border-2 border-black font-mono font-black uppercase text-sm hover:bg-pink-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;&lt; PREVIOUS
              </button>

              {currentParagraphIndex < roastParagraphs.length - 1 ? (
                <button
                  onClick={handleNextParagraph}
                  className="px-4 py-2 bg-purple-600 text-white border-2 border-black font-mono font-black uppercase text-sm hover:bg-orange-400 hover:text-black transition-colors"
                >
                  NEXT &gt;&gt;
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-purple-600 text-white border-2 border-black font-mono font-black uppercase text-sm hover:bg-green-400 hover:text-black transition-colors"
                >
                  ROAST ANOTHER WALLET
                </button>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return renderScreen();
}
