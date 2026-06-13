import imageUrlBuilder from '@sanity/image-url';
import { sanityClient, isSanityConfigured } from './client';

const builder = isSanityConfigured ? imageUrlBuilder(sanityClient) : null;

// urlFor(source) -> string | null. Returns null when Sanity isn't configured
// or the source is empty, so callers can fall back to a local /public asset.
export function urlFor(source) {
  if (!builder || !source) return null;
  return builder.image(source).url();
}
