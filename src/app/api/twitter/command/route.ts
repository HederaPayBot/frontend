import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { command, userName, twitterUsername, twitterUserId } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Use Twitter username if available, otherwise use provided userName
    const effectiveUserName = twitterUsername || userName || 'visitor';

    // Forward the command to the backend API
    const elizaApiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:3001/api/twitter/command';
    
    console.log(`Processing command from ${effectiveUserName}${twitterUserId ? ` (ID: ${twitterUserId})` : ''}: ${command}`);
    
    const response = await fetch(elizaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        userName: effectiveUserName,
        twitterUserId, // Include Twitter user ID if available
        source: 'widget', // Indicate this request came from the widget
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      ...data,
      source: 'widget',
      twitterInfo: twitterUsername ? {
        username: twitterUsername,
        userId: twitterUserId || 'unknown'
      } : null
    });
  } catch (error) {
    console.error('Error forwarding command to Eliza:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process command',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 
      { status: 500 }
    );
  }
} 