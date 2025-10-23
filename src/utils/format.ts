import { posix as path } from 'node:path';
import { site, base } from 'astro:config/server';

export function formatBytes(bytes: number) {
  // Units in ascending order: smallest first for type-safe fallback to units[0]
  const units = [
    { threshold: 1, name: 'B' },
    { threshold: 1024, name: 'KiB' },
    { threshold: 1024 ** 2, name: 'MiB' },
    { threshold: 1024 ** 3, name: 'GiB' },
    { threshold: 1024 ** 4, name: 'TiB' },
  ] as const;

  // findLast: find largest unit where bytes >= threshold, fallback to bytes
  const unit = units.findLast(u => bytes >= u.threshold) ?? units[0];
  const value = bytes / unit.threshold;

  // File system constraint: bytes are always integers
  // Display raw integers for bytes (0 B, 512 B, 1023 B)
  // Display decimals for converted units (1.5 KiB, 3.7 MiB)
  return {
    value: unit.threshold === 1 ? String(value) : value.toFixed(1),
    unit: unit.name,
  };
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function getSitemapIndexUrl() {
  return new URL(path.join(base, 'sitemap-index.xml'), site).toString();
}
