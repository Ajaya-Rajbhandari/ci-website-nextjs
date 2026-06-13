import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'orgName', title: 'Organization name', type: 'string' }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'footerDescription',
      title: 'Footer description',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'contact', title: 'Contact', type: 'contactInfo' }),
    defineField({
      name: 'partners',
      title: 'Partner links',
      type: 'array',
      of: [{ type: 'navLink' }],
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [{ type: 'navLink' }],
    }),
    defineField({ name: 'playStoreLink', title: 'Play Store link', type: 'url' }),
    defineField({ name: 'copyright', title: 'Copyright text', type: 'string' }),
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps embed URL',
      type: 'url',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
