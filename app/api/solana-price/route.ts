import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
            {
                headers: {
                    'accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ price: data.solana.usd });
    } catch (error) {
        console.error('Error fetching Solana price:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Solana price' },
            { status: 500 }
        );
    }
} 