// backend-node/src/utils/slug.ts
import { World } from '../models';

/**
 * Normalize an arbitrary slug or name into a base slug.
 * Example: " My New World! " -> "my-new-world"
 */
export function toBaseSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // replace any non-letter/number with a hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // collapse multiple hyphens
    .replace(/-+/g, '-')
    // trim leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique slug for a world.
 * If base is free -> base
 * If taken -> base-2, base-3, ... until free
 */
export async function generateUniqueWorldSlug(base: string): Promise<string> {
  const normalizedBase = toBaseSlug(base) || 'world';

  // If base is free, use it.
  const existingBase = await World.findOne({ slug: normalizedBase }).lean();
  if (!existingBase) {
    return normalizedBase;
  }

  // Otherwise, append -2, -3, ... until we find a free one.
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = `${normalizedBase}-${counter}`;
    const existing = await World.findOne({ slug: candidate }).lean();
    if (!existing) {
      return candidate;
    }
    counter += 1;
  }
}