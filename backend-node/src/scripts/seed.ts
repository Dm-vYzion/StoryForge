import mongoose from 'mongoose';
import { config } from '@/config/index';
import { User } from '@/models/User';
import { World } from '@/models/World';
import { CampaignDefinition } from '@/models/CampaignDefinition';
import { PlayerCharacter } from '@/models/PlayerCharacter';

async function main() {
  // Connect to Mongo
  await mongoose.connect(config.mongo.uri);

  // 1) Create author user (or find existing by email)
  const email = 'author@example.com';
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      passwordHash: 'dev-only-placeholder', // TODO: hash in real app
      displayName: 'Author User',
      plan: 'admin',
    });
  }

  // 2) Create world
  const world = await World.create({
    authorUserId: user._id,
    name: 'Eldertide Realms',
    slug: 'eldertide-realms',
    description: 'A classic fantasy world of fading magic.',
    baseTruths: [
      {
        id: 'truth_magic_fading',
        statement: 'Magic is fading from the world.',
        category: 'Cosmic',
        visibility: 'known',
      },
      {
        id: 'truth_old_war',
        statement: 'An ancient war between gods shattered the leylines.',
        category: 'Historical',
        visibility: 'legend',
      },
    ],
    defaultTags: ['fantasy', 'low-magic'],
    licenseMode: 'open',
  });

  // 3) Create campaign definition
  const campaign = await CampaignDefinition.create({
    authorUserId: user._id,
    worldId: world._id,
    title: 'Shadows over Eldertide',
    shortDescription: 'Uncover why magic is disappearing from the realm.',
    longDescription: 'A starter campaign about dwindling magic and looming war.',
    tags: ['fantasy', 'starter'],
    baseTruths: [
      {
        id: 'truth_magic_fading',
        statement: 'Magic is fading faster in the capital than anywhere else.',
        category: 'Cosmic',
        visibility: 'known',
      },
    ],
    recommendedLevel: { min: 1, max: 3 },
    quests: [
      {
        id: 'quest_intro',
        name: 'The Fading Light',
        description: 'Investigate strange magical failures in the capital.',
        objectives: ['Talk to the Archmage', 'Inspect the leyline node'],
      },
    ],
    visibility: 'public',
    isPaid: false,
    price: 0,
    currency: 'USD',
  });

  // 4) Create a player character
  await PlayerCharacter.create({
    ownerUserId: user._id,
    name: 'Aria Seed',
    race: 'Human',
    class: 'Fighter',
    level: 1,
    maxHp: 12,
    baseStats: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 11, CHA: 10 },
  });

  console.log('Seed complete');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});