/**
 * Writes sitemap.xml and robots.txt using REACT_APP_SITE_URL before build.
 * Run automatically via npm prebuild.
 */
const fs = require("fs");
const path = require("path");

const siteUrl = (process.env.REACT_APP_SITE_URL || "https://spinach.ddns.net").replace(
  /\/$/,
  "",
);

const publicDir = path.join(__dirname, "..", "public");

const routes = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/login", changefreq: "monthly", priority: "0.6" },
  { loc: "/signup", changefreq: "monthly", priority: "0.6" },
];

const urlEntries = routes
  .map(
    (r) => `  <url>
    <loc>${siteUrl}${r.loc === "/" ? "/" : r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

console.log(`SEO files generated for ${siteUrl}`);
