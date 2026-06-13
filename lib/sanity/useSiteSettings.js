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
        if (active && data) setSettings({ ...siteSettingsFallback, ...data });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[sanity] useSiteSettings failed, keeping fallback:', err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
