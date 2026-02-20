# StoryForge Backend API

Node.js/TypeScript backend API for StoryForge - a narrative, D&D-style single-player RPG platform.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (httpOnly cookies + Bearer tokens)
- **Validation**: Zod
- **Password Hashing**: Argon2

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Yarn or npm

### Installation

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required (change in prod!) |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `AI_PROVIDER_API_KEY` | AI provider API key | Optional |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `FREE_PLAN_AI_LIMIT` | Free plan AI calls/month | `100` |
| `PRO_PLAN_AI_LIMIT` | Pro plan AI calls/month | `1000` |
| `LIFETIME_PLAN_AI_LIMIT` | Lifetime plan AI calls/month | `5000` |

### Running

```bash
# Development (with hot reload)
yarn dev

# Production build
yarn build
yarn start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google` - Google OAuth (stub)

### Worlds
- `POST /api/worlds` - Create a world
- `GET /api/worlds/public` - List public worlds
- `GET /api/worlds/:id` - Get world details
- `POST /api/worlds/:id/license` - License a world

### Asset Packs
- `POST /api/asset-packs` - Create asset pack
- `GET /api/asset-packs/public` - Marketplace listing
- `GET /api/asset-packs/:id` - Get pack contents
- `POST /api/asset-packs/:id/import-into-campaign-def/:campaignDefId` - Import pack

### Templates (NPC, Bestiary, Items, Environments)
- `POST /api/npc-templates` - Create NPC template
- `GET /api/npc-templates/mine` - List my templates
- `GET /api/npc-templates/:id` - Get template
- (Similar endpoints for `/bestiary`, `/item-templates`, `/environment-templates`)

### Campaign Definitions
- `POST /api/campaign-defs` - Create campaign
- `GET /api/campaign-defs/public` - List public campaigns
- `GET /api/campaign-defs/mine` - List my campaigns
- `GET /api/campaign-defs/:id` - Get campaign
- `PATCH /api/campaign-defs/:id` - Update campaign

### Player Characters (Hall of Warriors)
- `POST /api/player-characters` - Create character
- `GET /api/player-characters/mine` - List my characters
- `GET /api/player-characters/:id` - Get character
- `PATCH /api/player-characters/:id` - Update character
- `DELETE /api/player-characters/:id` - Delete character

### Campaign Instances & Branching
- `POST /api/campaign-instances` - Start new playthrough
- `GET /api/campaign-instances/mine` - List my instances
- `GET /api/campaign-instances/:id` - Get instance
- `POST /api/campaign-instances/:id/fork` - Create branch

### Events & Snapshots
- `POST /api/campaign-instances/:id/events` - Append event
- `GET /api/campaign-instances/:id/events` - List events
- `POST /api/campaign-instances/:id/snapshots` - Create snapshot
- `GET /api/campaign-instances/:id/snapshots/latest` - Get latest snapshot

### Inventory Helpers
- `POST /api/campaign-instances/:id/items/transfer` - Transfer item
- `POST /api/campaign-instances/:id/items/use` - Use item

### Purchases & Licensing
- `POST /api/purchases/checkout` - Purchase asset (stub)
- `GET /api/purchases/my-assets` - List owned assets
- `GET /api/purchases/check/:assetType/:assetId` - Check ownership

### AI Gateway
- `POST /api/ai/generate` - Generate AI content
- `GET /api/ai/usage` - Get usage stats
- `PUT /api/ai/api-key` - Set BYO API key
- `DELETE /api/ai/api-key` - Remove API key

## Data Models

### Collections

1. **users** - User accounts with plans and AI usage tracking
2. **worlds** - Reusable settings/universes
3. **campaignDefinitions** - Campaign templates with quests, NPCs, encounters
4. **playerCharacters** - Global reusable PCs (Hall of Warriors)
5. **npcTemplates** - Reusable NPC templates
6. **bestiaryEntries** - Monster/creature templates
7. **itemTemplates** - Weapons, armor, consumables
8. **environmentTemplates** - Location templates
9. **assetPacks** - Bundled sellable content
10. **campaignInstances** - Per-player playthroughs with branching
11. **events** - Event-sourced history log
12. **snapshots** - Derived state snapshots
13. **purchases** - Marketplace transactions

## Project Structure

```
backend-node/
├── src/
│   ├── config/          # Configuration
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── validate.ts  # Zod validation
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose models
│   ├── routes/          # API route handlers
│   ├── schemas/         # Zod validation schemas
│   ├── types/           # TypeScript interfaces
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Serverless Compatibility

The `app.ts` exports a `createApp()` function that can be used with Vercel serverless functions:

```typescript
// api/index.ts (for Vercel)
import { createApp } from '../src/app';

const app = createApp();
export default app;
```

## Testing

```bash
# Run tests (scaffolded)
yarn test
```

## License

MIT
