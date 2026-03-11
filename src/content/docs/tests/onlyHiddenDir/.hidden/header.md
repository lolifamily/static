## 隐藏目录 Slug 测试

本文件位于 `.hidden/` 目录内，同时触发两个边界条件：

### 1. Glob 匹配

默认 pattern `**/*.{md,mdx}` 不会遍历 `.` 开头的目录。必须显式添加第二条 pattern：

```typescript
glob({
  pattern: ['**/*.{md,mdx}', '**/.*/**/*.{md,mdx}'],
  base: './src/content/docs',
});
```

没有第二条 pattern，本文件根本不会被 glob loader 发现。

### 2. ID 生成

`.hidden` 带前导点号，不是合法的默认 slug。和父目录 `onlyHiddenDir`（camelCase）同理——默认 slugify 会 mangle 掉点号或做其他规范化，导致生成的 ID 与 `getEntry('docs', 'tests/onlyHiddenDir/.hidden/header')` 的查询路径不匹配。

自定义 `generateId` 保留原始路径，使两者精确对应。

**如果你看到了这段文字，说明隐藏目录的 glob pattern 和自定义 `generateId` 同时生效了。**