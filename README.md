# Everbound

Transform your memories into a beautifully written book your family will treasure.

## About

Everbound is a digital memoir platform that helps you preserve your life stories in a professionally crafted book. Through guided conversations and thoughtful prompts, we help you capture your memories and transform them into beautifully written chapters that preserve your unique voice.

## Features

- 🎤 **Voice Calibration** - We learn your writing style to ensure your book sounds authentically like you
- 💭 **Memory Capture** - Guided prompts help you explore and record your most meaningful stories
- 📖 **Chapter Assembly** - Your memories are crafted into beautifully written chapters
- 👥 **Collaboration** - Invite family members to contribute their perspectives
- 📚 **Print Production** - Professional hardcover books with your stories preserved forever

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Custom CSS Design System (warm, literary aesthetic)
- **Deployment**: Docker, Caddy reverse proxy

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd Memoirs

# Install frontend dependencies
cd frontend
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to docker directory
cd docker

# Copy environment template
cp .env.example .env

# Generate secure secrets
../scripts/generate-secrets.sh

# Start Supabase services
docker compose up -d
```

Supabase Studio will be available at `http://localhost:3000`

## Project Structure

```
Memoirs/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand state management
│   │   ├── styles/     # Design system CSS
│   │   └── types/      # TypeScript type definitions
│   └── public/         # Static assets
├── docker/             # Supabase self-hosted setup
├── docs/               # Project documentation
└── scripts/            # Deployment and management scripts
```

## Documentation

- [Project Scope](docs/PROJECT_SCOPE.md) - Overview and goals
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md) - Technical architecture
- [Data Model](docs/DATA_MODEL.md) - Database schema
- [User Workflows](docs/USER_WORKFLOWS.md) - User journey documentation
- [UI Design System](docs/UI_DESIGN_SYSTEM.md) - Design guidelines
- [API Specifications](docs/API_SPECIFICATIONS.md) - API reference

## Development

### Frontend Commands

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Backend Commands

```bash
cd docker

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart [service-name]
```

## Deployment

### Production Deployment

```bash
# Deploy to production server
./scripts/deploy.sh --production

# Deploy with rebuild
./scripts/deploy.sh --production --build

# Full deployment with cleanup
./scripts/deploy.sh --production --build --prune
```

See [Platform Deployment](docs/PLATFORM_DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

### Frontend (.env)

```bash
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (docker/.env)

See `docker/.env.example` for complete configuration options.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Design Philosophy

Everbound embraces a warm, literary aesthetic that feels like opening a cherished book:

- **Typography**: Serif fonts for headings, sans-serif for body text
- **Colors**: Warm, paper-like tones (cream, parchment, amber)
- **Interactions**: Gentle, purposeful transitions
- **Voice**: Empathetic, supportive, never rushed

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## License

[Your License Here]

## Acknowledgments

Built with:
- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

---

**Everbound** - Your memories, your voice, your legacy.
