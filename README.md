
# DevSync

A real-time collaboration platform for developers featuring a powerful Monaco code editor and infinite canvas whiteboard. Built with Next.js 14, TypeScript, and Pusher for seamless team collaboration.

### Deployed Link : [DevSync](https://dev-sync-peach-eight.vercel.app/)

## Features

- Real-time code editor with Monaco (VS Code engine)
- Multi-file support with syntax highlighting for 20+ languages
- Infinite canvas whiteboard powered by Excalidraw
- Live cursor tracking and instant synchronization
- GitHub OAuth authentication
- Private rooms with access control
- Zero configuration required
- Sub-50ms latency

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Editor**: Monaco Editor, Excalidraw
- **Real-time**: Pusher (WebSockets)
- **Database**: MongoDB
- **Authentication**: JWT, GitHub OAuth
- **Deployment**: Docker, Vercel

## Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB instance (local or cloud)
- Pusher account (free tier available)
- GitHub OAuth App (optional, for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devsync.git
cd devsync
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# MongoDB
MONGODB_URL=your_mongodb_connection_string

# Pusher Server-side
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Pusher Client-side
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# JWT Secret
JWT_SECRET=your_random_secret_key

# GitHub OAuth (optional)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables Setup

### MongoDB
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Replace `<password>` with your database password

### Pusher
- Sign up at [Pusher](https://pusher.com/)
- Create a new Channels app
- Copy your app credentials from the dashboard

### GitHub OAuth (Optional)
- Go to GitHub Settings > Developer settings > OAuth Apps
- Create a new OAuth App
- Set Authorization callback URL to: `http://localhost:3000/api/auth/github/callback`
- Copy Client ID and Client Secret

## Docker Deployment

### Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed
2. Update the `.env` file with production values
3. Run:
```bash
docker-compose up -d
```

This will start both the Next.js app and MongoDB in containers.

### Using Docker Only

Build the image:
```bash
docker build -t devsync .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env devsync
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS (EC2, ECS, or Amplify)
- Google Cloud Run

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
devsync/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # Authentication endpoints
│   │   └── room/             # Room management
│   ├── about/                # About page
│   ├── demo/                 # Demo mode
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── Room/[roomId]/        # Dynamic room pages
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── ui/                   # UI components
│   ├── Canvas.tsx            # Excalidraw canvas
│   ├── Editor.tsx            # Monaco editor
│   ├── FileExplorer.tsx      # File tree
│   ├── Navbar.tsx            # Navigation
│   └── RoomClient.tsx        # Room client logic
├── lib/                      # Utilities and configs
│   ├── auth.ts               # Auth helpers
│   ├── mongodb.ts            # MongoDB connection
│   └── pusher.ts             # Pusher setup
├── models/                   # MongoDB schemas
│   ├── Room.ts               # Room model
│   └── User.ts               # User model
├── public/                   # Static assets
├── .env                      # Environment variables
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
└── package.json              # Dependencies
```

## Usage

### Creating a Room
1. Click "Start Coding Now" on the landing page
2. A unique room is created automatically
3. Share the URL with your team

### Joining a Room
1. Open the shared room URL
2. Start coding or drawing immediately
3. See real-time updates from all participants

### Authentication (Optional)
1. Click "Login" or "Sign Up"
2. Use email/password or GitHub OAuth
3. Access private rooms and save sessions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: your-email@example.com

## Acknowledgments

- Monaco Editor by Microsoft
- Excalidraw for the whiteboard
- Pusher for real-time infrastructure
- Next.js team for the amazing framework




## Folder structure
``` 
devsync/
├── app/                  # Next.js App Router (Public Routes)
│   ├── api/              # Backend Routes
│   │   ├── pusher/auth/  # WebSocket Authorization
│   │   └── save/         # MongoDB Save Logic
│   └── room/[id]/        # Real-time Collaboration Pages
├── components/           # UI Components
│   ├── editor/           # Monaco Editor & Sync Logic
│   └── whiteboard/       # Excalidraw & Canvas Sync
├── lib/                  # Service Configurations
│   ├── pusher.ts         # Pusher Client/Server Setup
│   └── mongodb.ts        # MongoDB Connection Client
├── models/               # MongoDB Database Schemas
│   └── Room.ts           # Schema for saving code/drawings
├── public/               # Static assets (icons, etc.)
├── .env.local            # API Keys (Pusher & Mongo URI)
├── Dockerfile            # Instructions to build the app image
└── docker-compose.yml    # Orchestrates the App + MongoDB

```
