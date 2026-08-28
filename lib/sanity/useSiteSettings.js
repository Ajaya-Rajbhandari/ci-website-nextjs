import { useEffect, useState } from 'react';
import { sanityClient, isSanityConfigured } from './client';
import { siteSettingsQuery } from './queries';
import { siteSettingsFallback } from './fallbacks';

// Client hook for the global <Footer>, which is rendered on every page and so
// can't use getStaticProps. It returns the hardcoded fallback on the server and
// the first client render (identical markup -> no hydration mismatch), then
// swaps in CMS data after mount when Sanity is configured.
export function useSiteSettings() {
  const [settings, setSettings] = useState(siteSettingsFallback);

  useEffect(() => {
    if (!isSanityConfigured) return undefined;
    let active = true;
    sanityClient
      .fetch(siteSettingsQuery)
      .then((data) => {
        // Skip null/undefined values (GROQ returns missing fields as null) so an
        // unset CMS field falls back instead of blanking the footer.
        if (active && data) {
          const merged = { ...siteSettingsFallback };
          for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) merged[key] = value;
          }
          setSettings(merged);
        }
      })
      .catch((err) => {
         
        console.warn('[sanity] useSiteSettings failed, keeping fallback:', err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
