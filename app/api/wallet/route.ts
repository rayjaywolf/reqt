import { NextRequest, NextResponse } from 'next/server';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

interface TokenPrice {
    nativePrice: {
        value: string;
        decimals: string;
        name: string;
        symbol: string;
    };
    usdPrice: string;
    exchangeAddress: string;
    exchangeName: string;
}

interface QueueEntry {
    timestamp: number;
    retryCount: number;
}

// Rate limiting configuration
const RATE_LIMIT = {
    requestsPerMinute: 20,
    maxQueueSize: 100,
    maxRetries: 3,
    retryDelay: 3000, // 3 seconds
    queueTimeout: 30000, // 30 seconds
};

// In-memory queue (in production, use Redis or similar)
const requestQueue = new Map<string, QueueEntry>();
const activeRequests = new Set<string>();

// Clean up old queue entries
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requestQueue.entries()) {
        if (now - entry.timestamp > RATE_LIMIT.queueTimeout) {
            requestQueue.delete(key);
        }
    }
    for (const key of activeRequests) {
        const entry = requestQueue.get(key);
        if (!entry || now - entry.timestamp > RATE_LIMIT.queueTimeout) {
            activeRequests.delete(key);
        }
    }
}, 5000);

async function waitInQueue(requestId: string): Promise<boolean> {
    const entry = requestQueue.get(requestId);
    if (!entry) return false;

    // Check if we've exceeded max retries
    if (entry.retryCount >= RATE_LIMIT.maxRetries) {
        requestQueue.delete(requestId);
        return false;
    }

    // Check if we can process this request
    if (activeRequests.size < RATE_LIMIT.requestsPerMinute) {
        activeRequests.add(requestId);
        return true;
    }

    // Increment retry count and wait
    entry.retryCount++;
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.retryDelay));
    return waitInQueue(requestId);
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    if (!MORALIS_API_KEY) {
        return NextResponse.json(
            { error: 'Moralis API key is not configured' },
            { status: 500 }
        );
    }

    // Generate unique request ID
    const requestId = `${address}-${Date.now()}`;

    // Check if queue is full
    if (requestQueue.size >= RATE_LIMIT.maxQueueSize) {
        return NextResponse.json(
            { error: 'Service is currently at capacity. Please try again later.' },
            { status: 429 }
        );
    }

    // Add to queue
    requestQueue.set(requestId, { timestamp: Date.now(), retryCount: 0 });

    try {
        // Wait in queue
        const canProceed = await waitInQueue(requestId);
        if (!canProceed) {
            return NextResponse.json(
                { error: 'Request timed out. Please try again.' },
                { status: 429 }
            );
        }

        // Fetch portfolio data
        const portfolioResponse = await fetch(
            `https://solana-gateway.moralis.io/account/mainnet/${address}/portfolio?nftMetadata=true`,
            {
                headers: {
                    'accept': 'application/json',
                    'X-API-Key': MORALIS_API_KEY,
                },
            }
        );

        if (!portfolioResponse.ok) {
            throw new Error(`Moralis API error (portfolio): ${portfolioResponse.statusText}`);
        }

        const portfolioData = await portfolioResponse.json();

        // Fetch token prices
        const tokensWithPrices = await Promise.all(
            portfolioData.tokens?.map(async (token: any) => {
                try {
                    const priceResponse = await fetch(
                        `https://solana-gateway.moralis.io/token/mainnet/${token.mint}/price`,
                        {
                            headers: {
                                'accept': 'application/json',
                                'X-API-Key': MORALIS_API_KEY,
                            },
                        }
                    );

                    if (!priceResponse.ok) return { ...token, currentPrice: null };

                    const priceData: TokenPrice = await priceResponse.json();
                    return {
                        ...token,
                        currentPrice: parseFloat(priceData.usdPrice) || 0
                    };
                } catch (e) {
                    return { ...token, currentPrice: null };
                }
            }) || []
        );

        // Fetch swap transactions data
        const swapsResponse = await fetch(
            `https://solana-gateway.moralis.io/account/mainnet/${address}/swaps?order=DESC`,
            {
                headers: {
                    'accept': 'application/json',
                    'X-API-Key': MORALIS_API_KEY,
                },
            }
        );

        if (!swapsResponse.ok) {
            throw new Error(`Moralis API error (swaps): ${swapsResponse.statusText}`);
        }

        const swapsData = await swapsResponse.json();

        // Clean up after successful request
        requestQueue.delete(requestId);
        activeRequests.delete(requestId);

        // Return combined data
        return NextResponse.json({
            ...portfolioData,
            tokens: tokensWithPrices,
            swaps: swapsData.result || []
        });
    } catch (error) {
        // Clean up after failed request
        requestQueue.delete(requestId);
        activeRequests.delete(requestId);

        console.error('Error fetching wallet data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet data' },
            { status: 500 }
        );
    }
} 