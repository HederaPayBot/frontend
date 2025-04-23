## README.md

```markdown
# Hedera Twitter Pay Frontend

The frontend interface for Hedera Twitter Pay - a service that allows Twitter users to send and receive HBAR and custom tokens using Twitter commands.

## Project Overview

Hedera Twitter Pay provides a seamless way for Twitter users to interact with the Hedera blockchain. Users can:

- Link their Twitter accounts to Hedera accounts
- Send and receive HBAR and custom tokens via Twitter commands
- Create and manage custom tokens
- View transaction history and account balances
- Monitor the status of their blockchain operations

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/hedera-twitter-pay.git
cd hedera-twitter-pay/frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
```

This comprehensive documentation should help maintain consistency in your frontend development and make it easier for team members to contribute effectively while maintaining a cohesive codebase.

