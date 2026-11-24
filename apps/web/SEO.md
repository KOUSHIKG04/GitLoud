# SEO and Google Search Console setup

What the web app already does for search, and the one-time setup still to
do in Vercel and Google Search Console.

## Already in the code

| What | Where |
| --- | --- |
| Per-page title, description, canonical URL, Open Graph and Twitter card | `lib/seo.ts` (`buildPageMetadata`), used by each `app/**/page.tsx` |
| Home page title, description and keywords | `app/page.tsx` |
| Structured data: Organization, WebSite, SoftwareApplication, FAQPage | `app/page.tsx` (`structuredData`) |
| Site-wide defaults and keywords | `app/layout.tsx` |
| Google verification meta tag (reads `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) | `app/layout.tsx` |
| Sitemap with fixed per-page dates | `app/sitemap.ts` |
| robots.txt (dashboard and SSO callback blocked; sign-in and sign-up crawlable so their `noindex` is read) | `app/robots.ts` |
| Social preview images | `app/opengraph-image.tsx`, `app/twitter-image.tsx` |
| `/why-it-matters` permanently redirects to `/` | `next.config.js` |

## One-time setup

### 1. Set environment variables in Vercel

Project → Settings → Environment Variables → Production:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The live URL, for example `https://gitloud.dev` (or `https://gitloud-web.vercel.app` if that is the real one). Canonical URLs, the sitemap and robots.txt use it; without it they fall back to `https://gitloud-web.vercel.app`. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Filled in during step 2 (URL-prefix method only). |

Redeploy after changing either one.

### 2. Add and verify the site

Go to https://search.google.com/search-console and choose **Add property**.

- **Custom domain (recommended):** choose **Domain**, enter `yourdomain.com`,
  and add the TXT record Google shows at your DNS provider. This covers every
  subdomain and both http and https. No code change is needed.
- **Only the `.vercel.app` address:** choose **URL prefix** (DNS records cannot
  be added to vercel.app). Enter the full URL and pick the **HTML tag** method.
  Google shows `<meta name="google-site-verification" content="XXXX">`. Copy
  only `XXXX` into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy, then
  click **Verify**. The app outputs the tag automatically.

### 3. Submit the sitemap

Sitemaps → enter `sitemap.xml` → **Submit**. It should report 6 pages:
`/`, `/examples`, `/faq`, `/security-and-privacy`, `/feedback`, `/terms`.

### 4. Request indexing for key pages

URL Inspection → paste the home page URL → **Test live URL** →
**Request indexing**. Repeat for `/examples` and `/faq`.

### 5. Check structured data

Run the home page URL through https://search.google.com/test/rich-results.
It should find Organization, SoftwareApplication and FAQ.

- Google now shows FAQ rich results mainly for government and health sites,
  so the FAQ markup counts but usually will not show as a dropdown in results.
- The SoftwareApplication rich result (stars and price) needs real ratings or
  reviews. None are added; do not invent them.

### 6. After 3 to 7 days

- **Pages:** confirm public pages are indexed. Dashboard, sign-in and sign-up
  being excluded is expected.
- **Performance:** see which searches show GitLoud and adjust copy to match.
- **Core Web Vitals:** check the mobile report.

Optional: import the property into Bing Webmaster Tools from Search Console.

## Keeping it current

- When a page's content changes, update its `lastModified` date in
  `app/sitemap.ts`. Do not set it to the build time.
- New public pages: use `buildPageMetadata` from `lib/seo.ts`, add them to
  `app/sitemap.ts`, and link to them from an existing page.
- New private pages: add `robots: { index: false, follow: false }` to their
  metadata.
- Removing an indexed page: add a permanent redirect in `next.config.js` and
  remove it from the sitemap.
