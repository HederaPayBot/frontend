# Hedera Twitter Pay Frontend

The frontend interface for Hedera Twitter Pay - a service that allows Twitter users to send and receive HBAR and custom tokens using Twitter commands.

## Project Overview

Hedera Twitter Pay provides a seamless way for Twitter users to interact with the Hedera blockchain. Users can:

- Link their Twitter accounts to Hedera accounts
- Send and receive HBAR and custom tokens via Twitter commands
- Create and manage custom tokens
- View transaction history and account balances
- Monitor the status of their blockchain operations

## Recent Updates

### Command Examples Update (June 2023)

- Moved Twitter command examples to the main marketing page for better visibility
- Simplified the dashboard to focus on core payment functionality
- Improved overall user experience with cleaner navigation
- Streamlined the interface to follow a more professional design

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HederaPayBot/frontend.git
cd hedera-twitter-pay/frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file:
```
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_APP_SECRET=
NEXT_PUBLIC_JWKS_ENDPOINT=
TWITTER_CLIENT_SECRET=
TWITTER_CLIENT_ID=
NEXT_PUBLIC_ELIZA_API_URL=
NEXT_PUBLIC_API_URL=
```

4. Set up Privy authentication:
   - Create an account at [Privy Dashboard](https://dashboard.privy.io/)
   - Create a new app in the Privy Dashboard
   - Navigate to "App settings" > "Basics" to find your App ID and App Secret
   - Set the obtained values in your `.env.local` file
   - Use the JWKS endpoint format: `https://auth.privy.io/api/v1/apps/YOUR_APP_ID/jwks.json`

5. Set up Twitter authentication:
   - Create a Twitter Developer account
   - Create a project and app in the Twitter Developer Portal
   - Configure the app to use OAuth 2.0
   - Add your callback URL (e.g., `http://localhost:3000/api/auth/callback/twitter`)
   - Copy the Client ID and Client Secret to your `.env.local` file

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Twitter Integration

The project uses `agent-twitter-client` for all Twitter interactions:
- Imports the Scraper class from 'agent-twitter-client'
- Accesses Twitter client via the getTwitterClient() utility function
- Required environment variables: TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_EMAIL
- Optional API credentials: TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET

## Architecture

This project uses:

- **Next.js**: React framework with App Router
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Privy**: For Twitter authentication
- **Context API**: For state management

## Project Structure

- `/src/app`: Page components and routes
- `/src/components`: Reusable UI components
- `/src/context`: Application state management
- `/src/providers`: Configuration providers
- `/src/utils`: Utility functions
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions

## Available Commands

### Development

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint

## API Integration

The frontend interacts with the Hedera Twitter Pay API:

- **User API**: Account management and Hedera account linking
- **Payment API**: Sending payments and viewing history
- **Twitter API**: Viewing Twitter integration status

## Contributing

1. Follow the project coding standards
2. Create feature branches for new work
3. Add tests for new functionality
4. Submit pull requests with clear descriptions

