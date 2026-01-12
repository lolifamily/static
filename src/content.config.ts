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
      // Returns null for empty directories (no page generated, not shown in parent)
      function scanDir(dir: string, relativePath = ''): number | null {
        // No try-catch: let build fail if file system has issues
        // Rationale: if readdirSync fails here, Vite's publicDir copy will also fail
        // Fail fast and loud (build error) is better than silent skip (runtime 404s)
        const items = fs.readdirSync(dir, { withFileTypes: true });
        const children: FileEntry[] = [];
        let totalSize = 0;
        let hasHiddenContent = false;
        let hasIndexHtml = false;

        for (const item of items) {
          // Astro-ignored (_): never copied to dist/, completely skip
          if (item.name.startsWith('_')) continue;

          const isHidden = item.name.startsWith('.');
          const isDirectory = item.isDirectory();
          const isFile = item.isFile();

          // Skip symlinks, sockets, and other special files
          if (!isDirectory && !isFile) continue;

          const itemPath = path.join(dir, item.name);
          const stats = fs.statSync(itemPath);

          if (isDirectory) {
            // Always recurse into subdirs (generate their pages)
            const size = scanDir(itemPath, path.posix.join(relativePath, item.name));
            // Hidden dirs: generate page but don't show link in parent
            if (isHidden) {
              if (size !== null) hasHiddenContent = true;
              continue;
            }
            if (size === null) continue; // Empty subdir: skip
            children.push({ kind: 'directory', name: item.name, size, modified: stats.mtime });
            totalSize += size;
          } else {
            // index.html: user's own page takes precedence, skip listing for this dir
            if (item.name === 'index.html') hasIndexHtml = true;

            // Hidden files: don't show, but mark parent as having content
            if (isHidden) {
              hasHiddenContent = true;
              continue;
            }
            children.push({ kind: 'file', name: item.name, size: stats.size, modified: stats.mtime });
            totalSize += stats.size;
          }
        }

        // No content at all = truly empty, don't list
        if (children.length === 0 && !hasHiddenContent && !hasIndexHtml) return null;

        // Skip listing generation if user has their own index.html
        if (!hasIndexHtml) {
          children.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          entries.push({ id: `/${relativePath}`, children });
        }

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
