import { sanityClient, isSanityConfigured } from './client';
import {
  coursesQuery,
  courseByIdQuery,
  courseIdsQuery,
  servicesQuery,
  siteSettingsQuery,
  homePageQuery,
  contactPageQuery,
} from './queries';

// Static fallbacks: the site renders identically to before until Sanity is
// configured and populated.
import { coursesList } from '../../components/course/coursesList';
import { services as servicesFallback } from '../../components/services/service_list';
import {
  siteSettingsFallback,
  homePageFallback,
  contactPageFallback,
} from './fallbacks';

async function fetchOrFallback(query, params, fallback, label) {
  if (!isSanityConfigured) return fallback;
  try {
    const data = await sanityClient.fetch(query, params);
    if (Array.isArray(data)) return data.length ? data : fallback;
    return data ?? fallback;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[sanity] ${label} failed, using fallback:`, err.message);
    return fallback;
  }
}

export function getCourses() {
  return fetchOrFallback(coursesQuery, {}, coursesList, 'getCourses');
}

export function getServices() {
  return fetchOrFallback(servicesQuery, {}, servicesFallback, 'getServices');
}

export function getCourseById(id) {
  const fallback = coursesList.find((c) => String(c.id) === String(id)) || null;
  return fetchOrFallback(courseByIdQuery, { id: String(id) }, fallback, 'getCourseById');
}

export async function getCourseIds() {
  if (!isSanityConfigured) return coursesList.map((c) => String(c.id));
  try {
    const ids = await sanityClient.fetch(courseIdsQuery);
    return ids && ids.length ? ids.map(String) : coursesList.map((c) => String(c.id));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[sanity] getCourseIds failed, using fallback:', err.message);
    return coursesList.map((c) => String(c.id));
  }
}

// Singletons: shallow-merge the fallback under the fetched doc so a partially
// filled document never drops a field the UI expects.
async function fetchSingleton(query, fallback, label) {
  if (!isSanityConfigured) return fallback;
  try {
    const data = await sanityClient.fetch(query);
    return data ? { ...fallback, ...data } : fallback;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[sanity] ${label} failed, using fallback:`, err.message);
    return fallback;
  }
}

export function getSiteSettings() {
  return fetchSingleton(siteSettingsQuery, siteSettingsFallback, 'getSiteSettings');
}

export function getHomePage() {
  return fetchSingleton(homePageQuery, homePageFallback, 'getHomePage');
}

export function getContactPage() {
  return fetchSingleton(contactPageQuery, contactPageFallback, 'getContactPage');
}
