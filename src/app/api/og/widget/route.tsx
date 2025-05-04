import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Add cors headers to allow Twitter/X to fetch the image
export async function GET(request: NextRequest) {
  try {
    // Extract username from URL if available
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('twitter_username') || 'user';

    // Create the image response with OG content
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e2051',
            backgroundImage: 'linear-gradient(to bottom right, #1e2051, #4a266a)',
            color: 'white',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <h1 style={{ fontSize: '60px', fontWeight: 'bold', margin: '0' }}>
              HederaPayBot Widget
            </h1>
            <p style={{ fontSize: '32px', margin: '10px 0 30px' }}>
              Send HBAR payments via Twitter
            </p>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              borderRadius: '20px',
              width: '80%',
              maxWidth: '500px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{ 
                fontSize: '24px', 
                backgroundColor: '#6d28d9', 
                padding: '10px 20px',
                borderRadius: '10px',
                marginBottom: '20px',
              }}>
                @{username}
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}>
                <div style={{ fontSize: '20px' }}>🪙 Send HBAR payments</div>
                <div style={{ fontSize: '20px' }}>💸 Check balances</div>
                <div style={{ fontSize: '20px' }}>🔄 Transfer tokens</div>
              </div>
            </div>
            
            <div style={{
              fontSize: '24px',
              marginTop: '30px',
              padding: '10px 20px',
              backgroundColor: '#6d28d9', 
              borderRadius: '5px',
            }}>
              Powered by Hedera Blockchain
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );

    // Add CORS headers to the response
    const headers = new Headers(imageResponse.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Return a new response with the added headers
    return new Response(imageResponse.body, { 
      status: imageResponse.status, 
      headers 
    });
  } catch (e) {
    console.log(`${e}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
