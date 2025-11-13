# Clicky 🔗

A modern Linktree/Fingertip alternative built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **🎨 Beautiful Themes** - Choose from 6+ pre-built themes or customize your own
- **⚡ Lightning Fast** - Built with Next.js 14 App Router and optimized for performance
- **🔐 Secure Authentication** - Magic link authentication powered by Supabase
- **📊 Analytics** - Track views and clicks on your links
- **🎯 Drag & Drop** - Easily reorder your links
- **📱 Mobile Responsive** - Looks great on all devices
- **🚀 Easy to Deploy** - One-click deployment to Vercel

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with Magic Links
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd clicky
```

2. Install dependencies:

```bash
npm install
```

3. Set up your Supabase project:

   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the database to be provisioned
   - Go to the SQL Editor and run the SQL from `supabase-schema.sql`

4. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser!

## Database Setup

The database schema includes:

- **users** - User accounts
- **profiles** - User profiles with slugs and settings
- **links** - Links for each profile
- **themes** - Pre-built theme configurations
- **events** - Analytics events (views/clicks)

To set up the database:

1. Copy the SQL from `supabase-schema.sql`
2. Go to your Supabase project's SQL Editor
3. Paste and run the SQL

This will create all tables, RLS policies, and seed 6 default themes.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

4. Deploy!

## Project Structure

```
clicky/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── [username]/   # Public profile pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── api/          # API routes
│   │   └── auth/         # Auth callback
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── dashboard/    # Dashboard components
│   │   └── profile/      # Profile components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── public/               # Static assets
└── supabase-schema.sql   # Database schema
```

## Features Roadmap

### MVP (Completed ✅)
- [x] User authentication
- [x] Profile creation with unique slugs
- [x] Add/edit/delete/reorder links
- [x] Basic themes (6 options)
- [x] Mobile-responsive public pages
- [x] Click tracking

### Phase 2 (Coming Soon)
- [ ] Custom colors/fonts
- [ ] Image uploads for avatars
- [ ] Social icons
- [ ] Enhanced analytics dashboard
- [ ] QR code generation
- [ ] SEO meta tags editor

### Phase 3 (Future)
- [ ] Scheduled links
- [ ] Link animations
- [ ] Rich link cards with previews
- [ ] Email capture widget
- [ ] A/B testing
- [ ] Premium themes
- [ ] Custom domains

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects!

## Support

If you have questions or need help, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
