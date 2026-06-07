import { readFileSync, writeFileSync } from 'node:fs';

const environmentFile =
    process.env.APP_ENV === 'production'
        ? 'src/environments/environment.prod.ts'
        : 'src/environments/environment.ts';

const content = readFileSync(environmentFile, 'utf8');

function getStringValue(key) {
    
    const regex = new RegExp(`${key}:\\s*['"\`](.*?)['"\`]`);

    const match = content.match(regex);

    if (!match) {
        throw new Error(`${key} não encontrado em ${environmentFile}`);
    }

    return match[1];
}

const siteUrl = getStringValue('url').replace(/\/$/, '');
const apiUrl = getStringValue('apiUrl').replace(/\/$/, '');
const sitemapFile = getStringValue('sitemapFile');

function escapeXml(value) {
    return String(value)
        .replaceAll('&', '&')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '"')
        .replaceAll("'", '&apos;');
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro ao buscar ${url}: ${response.status}`);
    }

    return response.json();
}

const urls = [];

function addUrl(loc, lastmod = new Date().toISOString()) {
    urls.push({
        loc,
        lastmod,
    });
}

addUrl(`${siteUrl}/`);
addUrl(`${siteUrl}/noticias`);

const categoriesResponse = await fetchJson(`${apiUrl}/public/categories`);
const categories = categoriesResponse.data ?? [];

for (const category of categories) {
    addUrl(`${siteUrl}/noticias/${category.slug}`);

    let page = 1;
    let lastPage = 1;

    do {
        const categoryResponse = await fetchJson(
            `${apiUrl}/public/categories/${category.slug}?page=${page}`
        );

        const notices = categoryResponse.notices?.data ?? [];
        lastPage = categoryResponse.notices?.last_page ?? 1;

        for (const notice of notices) {
            addUrl(
                `${siteUrl}/noticia/${notice.slug}`,
                notice.updated_at ?? notice.created_at ?? new Date().toISOString()
            );
        }

        page++;
    } while (page <= lastPage);
}

const uniqueUrls = Array.from(
    new Map(urls.map(item => [item.loc, item])).values()
);

const xmlItems = uniqueUrls
    .map(item => {
        return `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
  </url>`;
    })
    .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlItems}
    </urlset>
`;

writeFileSync(`public/${sitemapFile}`, xml);

console.log(`Sitemap gerado em public/${sitemapFile}`);
console.log(`${uniqueUrls.length} URLs adicionadas.`);