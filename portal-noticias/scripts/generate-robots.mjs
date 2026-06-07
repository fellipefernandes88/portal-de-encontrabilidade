import { readFileSync, writeFileSync } from 'node:fs';

const environmentFile = process.env.APP_ENV === 'production'
  ? 'src/environments/environment.prod.ts'
  : 'src/environments/environment.ts';

const content = readFileSync(environmentFile, 'utf8');

const urlMatch = content.match(/url:\s*['"`](.*?)['"`]/);
const sitemapMatch = content.match(/sitemapFile:\s*['"`](.*?)['"`]/);

if (!urlMatch) {
  throw new Error(`portal.url não encontrado em ${environmentFile}`);
}

const siteUrl = urlMatch[1].replace(/\/$/, '');
const sitemapFile = sitemapMatch ? sitemapMatch[1] : 'sitemap.xml';

const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /login
Disallow: /dashboard

Sitemap: ${siteUrl}/${sitemapFile}`;

writeFileSync('public/robots.txt', robots);
