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
  const [currentScreen, setCurrentScreen] = useState<'input' | 'analyzing' | 'wallet' | 'roasting' | 'result' | 'advertisement'>('input');
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
  const [roastParagraphs, setRoastParagraphs] = useState<string[]>([]);
  const [typedContent, setTypedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    } else {
      // When we reach the last paragraph, show the advertisement screen
      setCurrentScreen('advertisement');
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
    // Common styles using CSS custom properties for responsive values
    const containerStyle = "bg-black border-2 border-white p-0 overflow-hidden h-full flex flex-col";
    const headerStyle = "bg-white text-black p-1 border-b-2 border-black";
    const headerTextStyle = "font-mono font-black tracking-tight text-center uppercase text-base";
    const contentStyle = "flex-1 flex flex-col items-center justify-center p-2";
    const buttonBaseStyle = "font-mono font-black uppercase text-xs border-2 transition-colors";

    switch (currentScreen) {
      case 'input':
        return (
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>ROAST MY PORTFOLIO</h1>
            </div>

            <div className={`${contentStyle} justify-center`}>
              <div className="mb-2 -mt-2 w-full" style={{ maxWidth: isMobile ? "200px" : "400px" }}>
                <Image
                  src="/text.png"
                  alt="REKT"
                  width={isMobile ? 200 : 300}
                  height={isMobile ? 50 : 75}
                  className="w-full"
                  priority
                />
              </div>

              <div className="mb-4 font-mono text-white text-center w-full px-2" style={{ maxWidth: "350px" }}>
                <p className="text-sm font-black mb-1">EXPOSE YOUR FINANCIAL TRAUMA</p>
                <p className="text-xs">DROP YOUR SOLANA ADDRESS BELOW AND WATCH US TURN YOUR TRADING HISTORY INTO A COMEDY SPECIAL. WE'RE LIKE YOUR THERAPIST, BUT MEANER.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 w-full px-2" style={{ maxWidth: "350px" }}>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    placeholder="ENTER SOLANA WALLET ADDRESS"
                    className="px-2 py-2 bg-white text-black border-2 border-black focus:outline-none focus:border-purple-600 font-mono uppercase text-xs text-center"
                    aria-label="Solana wallet address"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`${buttonBaseStyle} px-2 py-2 bg-purple-600 text-white border-black hover:bg-yellow-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed`}
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
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>ANALYZING YOUR MISTAKES</h1>
            </div>

            <div className={`${contentStyle} justify-center`}>
              <div className="font-mono text-white text-center w-full px-2" style={{ maxWidth: "450px" }}>
                <div className="text-base mb-2 flex justify-center">
                  <span className="bg-purple-600 text-white px-2 py-1">WALLET: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>

                <div className="text-sm mb-3 bg-white p-2 border-2 border-black">
                  <div className="text-black font-black">
                    {loadingMessages[loadingStep]}
                  </div>
                </div>

                <div className="w-full bg-white border-2 border-black p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 border-2 ${i < loadingStep
                          ? 'bg-purple-600 border-black'
                          : 'bg-black border-black'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-right text-black font-black text-xs">
                    {loadingStep * 20}% COMPLETE
                  </div>
                </div>

                <div className="mt-3 text-xs text-purple-600 font-black">
                  {loadingStep < 3 ? "PREPARING TO EXPOSE YOUR FINANCIAL MISTAKES..." : "ALMOST READY TO ROAST YOUR PORTFOLIO..."}
                </div>
              </div>
            </div>

            <div className="bg-white h-1 w-full"></div>
          </section>
        );

      case 'wallet':
        return (
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>WALLET LOADED</h1>
            </div>

            <div className={contentStyle}>
              <div className="border-4 border-white mb-3 w-full">
                <div className="bg-white text-black p-1 border-b-4 border-black flex items-center justify-between">
                  <span className="font-black text-sm uppercase">WALLET DETAILS</span>
                  <span className="bg-black text-white px-1 py-1 font-mono text-xs">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>

                <div className={isMobile ? "grid grid-cols-2 font-mono" : "grid grid-cols-4 font-mono"}>
                  <div className="bg-purple-600 p-3 border-b-4 border-white flex flex-col items-center justify-center">
                    <div className="text-white font-black text-lg">{portfolioData?.nativeBalance?.solana || "0"}</div>
                    <div className="text-white font-black uppercase text-xs">SOL</div>
                  </div>

                  <div className="bg-yellow-400 p-3 border-b-4 border-white flex flex-col items-center justify-center">
                    <div className="text-black font-black text-lg">{portfolioData?.tokens?.length || 0}</div>
                    <div className="text-black font-black uppercase text-xs">TOKENS</div>
                  </div>

                  <div className={`bg-cyan-400 p-3 flex flex-col items-center justify-center ${isMobile ? "border-r-0" : "border-r-0"}`}>
                    <div className="text-black font-black text-lg">{portfolioData?.nfts?.length || 0}</div>
                    <div className="text-black font-black uppercase text-xs">NFTS</div>
                  </div>

                  <div className="bg-green-400 p-3 flex flex-col items-center justify-center">
                    <div className="text-black font-black text-lg">{portfolioData?.swaps?.length || 0}</div>
                    <div className="text-black font-black uppercase text-xs">SWAPS</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto mb-2 flex flex-col items-center gap-2 w-full px-2" style={{ maxWidth: "350px" }}>
                <button
                  onClick={handleRoast}
                  disabled={isRoasting}
                  className={`${buttonBaseStyle} w-full px-4 py-2 bg-white text-black border-black text-base hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  &gt;&gt; ROAST THIS WALLET &lt;&lt;
                </button>

                <button
                  onClick={handleReset}
                  className={`${buttonBaseStyle} w-full px-3 py-1 bg-black text-white border-white hover:bg-red-500 hover:text-white`}
                >
                  CHECK A DIFFERENT WALLET
                </button>
              </div>
            </div>
          </section>
        );

      case 'roasting':
        return (
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>ROASTING YOUR PORTFOLIO</h1>
            </div>

            <div className={`${contentStyle} justify-center`}>
              <div className="font-mono text-white text-center w-full px-2" style={{ maxWidth: "450px" }}>
                <div className="text-base mb-2 flex justify-center">
                  <span className="bg-purple-600 text-white px-2 py-1">PREPARING SAVAGE ROAST</span>
                </div>

                <div className="text-sm mb-3 bg-white p-2 border-2 border-black">
                  <div className="text-black font-black">
                    {roastingMessages[loadingStep]}
                  </div>
                </div>

                <div className="w-full bg-white border-2 border-black p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 border-2 ${i < loadingStep
                          ? 'bg-purple-600 border-black'
                          : 'bg-black border-black'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-right text-black font-black text-xs">
                    {loadingStep * 20}% COMPLETE
                  </div>
                </div>

                <div className="mt-3 text-xs text-purple-600 font-black">
                  {loadingStep < 3 ? "GATHERING EVIDENCE OF YOUR POOR DECISIONS..." : "ALMOST READY TO EXPOSE YOUR FAILURES..."}
                </div>
              </div>
            </div>

            <div className="bg-white h-1 w-full"></div>
          </section>
        );

      case 'result':
        return (
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>PORTFOLIO ROAST</h1>
            </div>

            <div className={contentStyle}>
              <div className="font-mono text-white h-full flex items-center justify-center w-full">
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-${isMobile ? 'center' : 'start'} gap-3 w-full px-2`} style={{ maxWidth: isMobile ? "100%" : "600px" }}>
                  <div className="flex-shrink-0">
                    <Image
                      src="/sal.png"
                      alt="SAL"
                      width={isMobile ? 60 : 120}
                      height={isMobile ? 60 : 120}
                      className="rounded-lg border-2 border-white"
                      priority
                    />
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border-2 border-white relative flex">
                    {!isMobile && (
                      <div className="absolute left-[-12px] top-8 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-white border-b-[12px] border-b-transparent" />
                    )}
                    <div
                      dangerouslySetInnerHTML={{ __html: typedContent }}
                      className="text-black text-sm relative font-black leading-relaxed whitespace-pre-wrap"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 flex justify-between bg-black">
              <button
                onClick={handlePreviousParagraph}
                disabled={currentParagraphIndex === 0}
                className={`${buttonBaseStyle} px-2 py-1 bg-white text-black border-black hover:bg-pink-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                &lt;&lt; PREVIOUS
              </button>

              <button
                onClick={handleNextParagraph}
                className={`${buttonBaseStyle} px-2 py-1 bg-purple-600 text-white border-black hover:bg-orange-400 hover:text-black`}
              >
                NEXT &gt;&gt;
              </button>
            </div>
          </section>
        );

      case 'advertisement':
        return (
          <section className={containerStyle}>
            <div className={headerStyle}>
              <h1 className={headerTextStyle}>DON'T GET REKT AGAIN</h1>
            </div>

            <div className={contentStyle}>
              <div className="font-mono text-white h-full flex items-center justify-center w-full">
                <div className="flex flex-col items-center gap-3 w-full px-2" style={{ maxWidth: isMobile ? "100%" : "450px" }}>
                  <div className="bg-[#ff0000] p-3 border-4 border-black w-full">
                    <h2 className="text-lg font-black tracking-tight uppercase text-white font-mono text-center">ANTI-RUG FORCE</h2>
                    <p className="text-base font-black tracking-tight uppercase text-white font-mono text-center mt-1">DETECT. PROTECT. PROFIT.</p>
                  </div>

                  <div className="bg-black p-3 border-4 border-[#ff0000] w-full">
                    <p className="text-white text-sm font-mono leading-relaxed text-center">
                      <span className="text-[#ff0000] font-black">WARNING:</span> The memecoin wilds are treacherous.
                      Protect yourself with our powerful contract analysis tool.
                    </p>
                  </div>

                  <div className="bg-[#ffff00] p-2 border-4 border-black w-full">
                    <p className="text-black text-sm font-black tracking-tight uppercase font-mono text-center">COMING SOON: 27.04.25</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 flex justify-between bg-black">
              <button
                onClick={handleReset}
                className={`${buttonBaseStyle} px-2 py-1 bg-white text-black border-black hover:bg-pink-500 hover:text-white`}
              >
                ROAST ANOTHER WALLET
              </button>

              <Link href="/anti-rug-force">
                <button
                  className={`${buttonBaseStyle} px-2 py-1 bg-[#ff0000] text-white border-black hover:bg-[#ffff00] hover:text-black`}
                >
                  GO TO ANTI-RUG FORCE
                </button>
              </Link>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden pb-4">
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>
    </div>
  );
}
