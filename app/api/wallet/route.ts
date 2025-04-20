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

    try {
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
            portfolioData.tokens?.map(async (token) => {
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

        // Return combined data
        return NextResponse.json({
            ...portfolioData,
            tokens: tokensWithPrices,
            swaps: swapsData.result || []
        });
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet data' },
            { status: 500 }
        );
    }
} 