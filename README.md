# Trivia Master

A real-time trivia application with buzzer functionality for hosting interactive trivia games.

## Features

- Create and join trivia rooms with unique room codes
- Host interface for managing questions and scoring
- Guest interface with buzzer functionality
- Theme-based question management
- Real-time updates using WebSockets
- Responsive design for both desktop and mobile devices
- Live scoring system
- SQL database for data persistence

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: SQL (using Cloudflare D1)
- **Real-time Communication**: WebSockets

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd trivia-app
   npm install
   # or
   pnpm install
   ```
3. Initialize the database:
   ```bash
   npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Room (Host)

1. On the home page, click "Create Room"
2. Enter a room name and your display name
3. Share the generated room code with guests
4. Select a theme and questions to start the game

### Joining a Room (Guest)

1. On the home page, click "Join Room"
2. Enter the room code provided by the host and your display name
3. Wait for the host to select a question
4. Use the buzzer button when you know the answer

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Monetization

For information on monetizing the application with Google Ads, see [MONETIZATION.md](./MONETIZATION.md).

## Testing

The application includes both automated and manual testing resources:

- Automated tests: Run `node test.js` to execute the test script
- Manual tests: Follow the checklist in `manual_test.js`

## Project Structure

- `/src/app` - Next.js pages and API routes
- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and database operations
- `/migrations` - SQL migration files

## License

This project is licensed under the MIT License.
