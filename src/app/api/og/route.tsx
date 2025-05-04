import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Add cors headers to allow Twitter/X to fetch the image
export async function GET(request: NextRequest) {
  try {
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
            <h1 style={{ fontSize: '70px', fontWeight: 'bold', margin: '0' }}>
              HederaPayBot
            </h1>
            <p style={{ fontSize: '32px', margin: '10px 0 40px' }}>
              Your Hedera Blockchain Twitter Assistant
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              margin: '0 auto',
            }}>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: '20px', 
                borderRadius: '10px',
                width: '45%',
              }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 10px' }}>🪙 HBAR Commands</h2>
                <p style={{ fontSize: '18px', margin: '5px 0', opacity: 0.9 }}>Check balance</p>
                <p style={{ fontSize: '18px', margin: '5px 0', opacity: 0.9 }}>Transfer HBAR</p>
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: '20px', 
                borderRadius: '10px',
                width: '45%',
              }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 10px' }}>💰 Token Commands</h2>
                <p style={{ fontSize: '18px', margin: '5px 0', opacity: 0.9 }}>Create token</p>
                <p style={{ fontSize: '18px', margin: '5px 0', opacity: 0.9 }}>Transfer token</p>
              </div>
            </div>

            <div style={{
              fontSize: '24px',
              marginTop: '30px',
              padding: '10px 20px',
              backgroundColor: '#6d28d9', 
              borderRadius: '5px',
            }}>
              Type @HederaPayBot help for full command list
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