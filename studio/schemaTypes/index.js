// Document types (repeatable)
import course from './documents/course';
import service from './documents/service';

// Singletons (one document each)
import siteSettings from './singletons/siteSettings';
import homePage from './singletons/homePage';
import contactPage from './singletons/contactPage';
import navigation from './singletons/navigation';

// Reusable object types
import hero from './objects/hero';
import story from './objects/story';
import appPromo from './objects/appPromo';
import contactInfo from './objects/contactInfo';
import navLink from './objects/navLink';

export const schemaTypes = [
  // documents
  course,
  service,
  // singletons
  siteSettings,
  homePage,
  contactPage,
  navigation,
  // objects
  hero,
  story,
  appPromo,
  contactInfo,
  navLink,
];
