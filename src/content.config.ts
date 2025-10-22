import { defineCollection, z } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

// Simple schema with enum literal - DRY principle
const FileEntrySchema = z.object({
  kind: z.enum(['file', 'directory']),
  name: z.string(),
  size: z.number(),
  modified: z.date(),
});

type FileEntry = z.infer<typeof FileEntrySchema>;

export const collections = {
  files: defineCollection({
    loader: () => {
      const publicDir = path.join(process.cwd(), 'public');
      const entries: { id: string; children: FileEntry[] }[] = [];

      // Post-order traversal: calculate size bottom-up
      function scanDir(dir: string, relativePath = ''): number {
        // No try-catch: let build fail if file system has issues
        // Rationale: if readdirSync fails here, Vite's publicDir copy will also fail
        // Fail fast and loud (build error) is better than silent skip (runtime 404s)
        const items = fs.readdirSync(dir, { withFileTypes: true });
        const children: FileEntry[] = [];

        let totalSize = 0;

        for (const item of items) {
          if (item.name.startsWith('.')) continue;
          if (item.name === '_astro' || item.name.endsWith('.html')) continue;

          // Store result for reuse
          const isDirectory = item.isDirectory();
          const isFile = item.isFile();

          // Skip symlinks, sockets, and other special files
          // Symlinks shouldn't exist in public/ (Git doesn't preserve target, breaks in CI)
          // Even if present, Vite resolves symlinks during build, so skipping in listing is safe
          if (!isDirectory && !isFile) continue;

          const itemPath = path.join(dir, item.name);
          const stats = fs.statSync(itemPath);

          const size = isDirectory
            ? scanDir(itemPath, path.posix.join(relativePath, item.name))
            : stats.size;

          // Only the 'kind' field differs, everything else is shared
          children.push({
            kind: isDirectory ? 'directory' : 'file',
            name: item.name,
            size,
            modified: stats.mtime,
          });

          totalSize += size;
        }

        // Sort once at build time: directories first, then alphabetically
        children.sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        entries.push({
          id: `/${relativePath}`,
          children,
        });

        return totalSize;
      }

      scanDir(publicDir);
      return entries;
    },
    schema: z.object({
      children: z.array(FileEntrySchema),
    }),
  }),

  // 使用官方 glob loader 处理 Markdown
  docs: defineCollection({
    type: 'content',
    schema: z.object({}),
  }),
};
