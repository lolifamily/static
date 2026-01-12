# Static File Browser

A static site generator that creates a browsable directory listing for files hosted on Cloudflare Pages. Think `nginx autoindex`, but as pre-generated HTML with modern styling and MDX support.

## Why This Exists

**Use this when:**
- Your hosting platform doesn't support autoindex (e.g., Cloudflare Pages)
- You want a modernized, customizable directory listing UI
- You need SEO-friendly file indexes with proper metadata

**Don't use this when:**
- Your server already has `nginx autoindex` or equivalent
- You need real-time file listings (this generates static snapshots at build time)
- You're serving files that change frequently without rebuild capability

This is a **personal, opinionated solution**. It contains hardcoded strings and assumptions specific to the use case. Fork and adapt as needed.

---


## Project Structure

```
static/
├── public/                    # Your files to be listed (not in Git for large deployments)
│   ├── charliez0/             # Example: User 1's files
│   │   ├── avatar.jpg
│   │   └── background.jpg
│   ├── lolifamily/            # Example: User 2's files
│   │   ├── avatar.webp
│   │   └── images/
│   └── _headers               # Cloudflare Pages headers (CSP, caching, etc.)
│
├── src/
│   ├── pages/
│   │   ├── [...path].astro    # Dynamic route: generates a page for each directory
│   │   └── robots.txt.ts      # SEO: robots.txt generator
│   │
│   ├── content/
│   │   ├── content.config.ts  # Content Collections: scans public/ for files + MDX docs
│   │   └── docs/
│   │       └── header.mdx     # Optional: per-directory header/footer content
│   │
│   ├── utils/
│   │   └── format.ts          # Utilities: byte formatting, date formatting
│   │
│   └── styles/
│       └── global.css         # Styling for directory listings
│
├── .github/
│   └── workflows/
│       ├── build.yml          # CI/CD: Build and deploy to Cloudflare Pages
│       └── lint.yml           # CI/CD: TypeLint and ESLint
│
├── astro.config.ts            # Astro configuration
├── package.json               # Dependencies and scripts
└── pnpm-lock.yaml             # Lockfile
```

---

## How It Works

### 1. Build-Time File Scanning

```typescript
// src/content/config.ts
defineCollection({
  loader: () => {
    // Recursively scan public/ directory
    // Collect file metadata: name, size, modified time
    // Calculate directory sizes (post-order traversal)
    // Return entries for each directory
  },
});
```

**Key behavior:**
- Scans `public/` at **build time**
- Skips hidden files (`.git`, `.env`, etc.)
- Skips symlinks (Git doesn't preserve them)
- Skips `_astro/` directory (build artifacts)
- Calculates recursive directory sizes
- Sorts: directories first, then alphabetically

### 2. Static Page Generation

```typescript
// src/pages/[...path].astro
export async function getStaticPaths() {
  const allDirs = await getCollection('files');
  return allDirs.map(dir => ({
    params: { path: dir.id },
    props: { items: dir.data.children },
  }));
}
```

**Generates:**
- One HTML page per directory
- Breadcrumb navigation matching URL structure
- File table with size, modification date
- Optional MDX header/footer per directory

### 3. Deployment

```yaml
# .github/workflows/build.yml
- Build static site (Astro)
- Deploy to Cloudflare Workers (optional)
- Deploy to Cloudflare Pages (primary)
- Upload artifacts to GitHub (backup)
```

**Result:** Pure static HTML served from CDN, zero server-side logic.

---

## Usage

### Development

```bash
pnpm install
pnpm dev           # Start dev server
pnpm build         # Build static site
```

### Deployment

```bash
pnpm online:pages   # Deploy to Cloudflare Pages
pnpm online:workers # Deploy to Cloudflare Workers
```

### Adding Custom Headers/Footers

Create MDX files in `src/content/docs/`:

```
src/content/docs/
├── header.mdx              # Root directory header
├── footer.mdx              # Root directory footer
└── charliez0/
    ├── header.mdx          # Header for /charliez0/
    └── footer.mdx          # Footer for /charliez0/
```

Headers are rendered above the file listing, footers below.

---

## Handling Large File Workflow (GB+, many files)

**Problem:** Vite's `publicDir` copies all files during build, wasting I/O and disk space.

**Solution:** Disable automatic copying, merge manually.

### 1. Disable Vite's `publicDir`

```typescript
// astro.config.ts
export default defineConfig({
  vite: {
    publicDir: false,  // Don't copy public/ during build
  },
});
```

### 2. Modify Build Script

```json
// package.json
{
  "scripts": {
    "build:prod": "rm -rf public/_astro && astro build && mv dist/* public/ && rmdir dist",
    "deploy": "npm run build:prod && pnpm online:pages"
  }
}
```

**Workflow:**
1. Clean old `_astro/` artifacts (prevents file count accumulation)
2. Build HTML to `dist/` (only a few MB)
3. Move `dist/*` into `public/` (overwrites old HTML)
4. Deploy `public/` with `wrangler` (incremental upload, only changed files)

**Why this works:**
- Content Collection scans `public/` **before** build (metadata is collected)
- Build generates HTML without copying GBs of data
- `wrangler pages deploy` uploads incrementally (only deltas)
- Cloudflare Pages has no total size limit, only per-file limit (25MB)

**File Management:**
- Keep files in local storage or NAS
- Don't track `public/` in Git (add to `.gitignore`)
- Use `wrangler` to sync changes (it's smart about incremental uploads)

---

## Configuration

### Base Path

To mount the app at a subpath:

```typescript
// astro.config.ts
export default defineConfig({
  base: '/files/',  // App will be at example.com/files/
});
```

**Breadcrumbs will include base segments** (this is intentional, mirrors nginx behavior).

---

## Design Philosophy

This project follows the "good enough" principle:

- **Correctness:** Post-order traversal, proper sorting, fail-fast builds
- **Simplicity:** ~335 lines of core code, minimal abstractions
- **Pragmatism:** Solves a specific problem (static file listings) without over-engineering
- **Personal:** Hardcoded for specific use cases, not a general-purpose framework

If you need a full-featured file manager, look elsewhere. This is a directory lister, and it does one thing well.

---

## License

MIT

---

## FAQ

**Q: Why not use nginx autoindex?**
A: Cloudflare Pages doesn't support it. This replicates the functionality as static HTML.

**Q: Why build-time instead of runtime?**
A: Cloudflare Pages is free, has unlimited bandwidth, and serves static files fast. Runtime would require Cloudflare Workers (more complex, potential costs).

**Q: Why Astro?**
A: Content Collections API is perfect for this use case: type-safe data loading from any source (local files, APIs, databases), built-in caching for incremental builds, and seamless integration with static page generation. Alternative: write a custom static generator in 200 lines of Node.js, but you'd lose the caching and dev tooling.

**Q: Can I use this with R2/S3/remote storage?**
A: Yes. Astro Content Collections support **any data source**—just write a custom loader:

```typescript
// Example: S3 loader (conceptual)
defineCollection({
  loader: async () => {
    const s3 = new S3Client();
    const objects = await s3.listObjectsV2({ Bucket: 'my-bucket' });

    // Group objects by directory
    const directories = new Map();
    for (const obj of objects.Contents) {
      const dir = path.dirname(obj.Key);
      if (!directories.has(dir)) directories.set(dir, []);

      directories.get(dir).push({
        kind: obj.Key.endsWith('/') ? 'directory' : 'file',
        name: path.basename(obj.Key),
        size: obj.Size,
        modified: obj.LastModified,
      });
    }

    // Return one entry per directory (same structure as local loader)
    return Array.from(directories.entries()).map(([dir, children]) => ({
      id: dir,
      children,  // TODO: Sort children (directories first, then alphabetically)
    }));
  },
});
```

The same caching and build optimizations apply. However, if your files are already in object storage, consider whether you even need a directory listing (most object storage UIs provide this).

**Q: The code has hardcoded strings like "zh-CN"!**
A: Yes. This is a personal project template. Fork it, replace the strings, make it yours.

---

## Credits

- **Framework:** [Astro](https://astro.build)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com)
- **Inspiration:** nginx `autoindex` module
