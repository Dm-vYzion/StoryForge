import { hashPassword } from '@/models/index';

async function main() {
  const raw = 'dev-only-placeholder';
  const hash = await hashPassword(raw);
  console.log('HASH:', hash);
}

main().catch(console.error);
