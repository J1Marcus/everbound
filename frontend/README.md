# Digital Memoir Platform - Frontend

A modern React-based frontend application for the Digital Memoir Platform, built with TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Layout.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectCreatePage.tsx
│   │   ├── VoiceCalibrationPage.tsx
│   │   ├── MemoryCapturePage.tsx
│   │   ├── ChapterOverviewPage.tsx
│   │   └── ChapterReviewPage.tsx
│   ├── stores/             # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── projectStore.ts
│   │   └── memoryStore.ts
│   ├── lib/                # Utilities and configurations
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── types/              # TypeScript type definitions
│   │   └── database.types.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running Supabase instance (see `/docker` directory)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=http://localhost:8000
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Key Features

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes with automatic redirects
- Session persistence and auto-refresh
- User profile management

### Project Management
- Create Individual or Family memoir projects
- Configure book specifications (trim size, page count, chapters)
- Track project status through workflow stages
- Collaborate with family members

### Voice Calibration
- Upload writing samples for voice analysis
- Record voice samples for speech patterns
- AI-powered voice characteristic extraction
- Voice profile creation and storage

### Memory Capture
- **Text Input:** Short-form memory fragments (200-500 words)
- **Voice Recording:** Audio capture with transcription
- **Photo Upload:** Image upload with context
- **Timeline Anchoring:** Date/life stage association
- **Automatic Tagging:** AI-powered categorization

### Chapter Assembly
- View chapter readiness status
- Assemble chapters from memory fragments
- Apply voice constraints during generation
- Review and approve generated chapters
- Quality metrics and feedback

### Collaboration
- Invite family members to projects
- Role-based permissions (narrator, contributor, reviewer)
- Feedback and correction workflows
- Real-time updates via Supabase Realtime

### Quality Gates
- Automated quality checks
- Repetition detection
- Timeline coherence validation
- Emotional balance analysis
- Blocking conditions for print approval

### Print Production
- Generate print-ready PDFs
- Configure print specifications
- Photo resolution validation
- PDF/X-1a compliance
- Direct integration with print services

## Architecture

### State Management

The application uses Zustand for state management with separate stores for different concerns:

- **authStore:** User authentication and session management
- **projectStore:** Project data and operations
- **memoryStore:** Memory fragments and tagging
- **chapterStore:** Chapter assembly and review

### API Integration

All backend communication goes through Supabase:

```typescript
// Direct database queries via PostgREST
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('owner_id', userId)

// Edge Function calls for business logic
const { data, error } = await supabase.functions.invoke('assemble-chapter', {
  body: { chapter_id: chapterId }
})

// Real-time subscriptions
const subscription = supabase
  .channel(`chapter:${chapterId}`)
  .on('postgres_changes', { ... }, (payload) => {
    // Handle updates
  })
  .subscribe()
```

### Routing

React Router v6 with protected routes:

```
/                           → Landing page (public)
/signin                     → Sign in (public)
/signup                     → Sign up (public)
/dashboard                  → User dashboard (protected)
/projects/new               → Create project (protected)
/projects/:id/voice-calibration  → Voice setup (protected)
/projects/:id/memories      → Memory capture (protected)
/projects/:id/chapters      → Chapter overview (protected)
/projects/:id/chapters/:id  → Chapter review (protected)
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### Component Structure

```typescript
// Component template
interface ComponentProps {
  // Props definition
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  )
}
```

### API Calls

- Use try-catch for error handling
- Show loading states during operations
- Display user-friendly error messages
- Implement optimistic updates where appropriate

### Styling

- Use Tailwind utility classes
- Follow the design system (see `/docs/WIREFRAMES.md`)
- Use custom components for consistency
- Ensure responsive design (mobile-first)

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ directory to your hosting provider
```

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-production-url.com
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Troubleshooting

### Common Issues

**Issue:** Supabase connection errors
- **Solution:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that Supabase backend is running (`docker ps`)

**Issue:** TypeScript errors
- **Solution:** Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` configuration

**Issue:** Tailwind styles not applying
- **Solution:** Verify `tailwind.config.js` content paths are correct
- Restart dev server after config changes

**Issue:** Authentication not persisting
- **Solution:** Check browser localStorage is enabled
- Verify JWT_SECRET matches between frontend and backend

## Next Steps

### Immediate Tasks

1. **Create Page Components:** Implement all page components referenced in `App.tsx`
2. **Build UI Components:** Create reusable components (Button, Input, Card, etc.)
3. **Implement Stores:** Complete Zustand stores for projects, memories, and chapters
4. **Add API Layer:** Create API functions for all Supabase operations
5. **Implement Features:** Build out memory capture, chapter assembly, and collaboration features

### Future Enhancements

- [ ] Add comprehensive test coverage
- [ ] Implement offline support with service workers
- [ ] Add analytics and error tracking
- [ ] Optimize bundle size and performance
- [ ] Add accessibility improvements (WCAG 2.1 AA)
- [ ] Implement progressive web app (PWA) features
- [ ] Add internationalization (i18n) support

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## License

Proprietary - Digital Memoir Platform

## Support

For issues and questions, refer to:
- Project documentation in `/docs`
- Supabase architecture: `/docs/SUPABASE_ARCHITECTURE.md`
- API specifications: `/docs/API_SPECIFICATIONS.md`
- Wireframes: `/docs/WIREFRAMES.md`
