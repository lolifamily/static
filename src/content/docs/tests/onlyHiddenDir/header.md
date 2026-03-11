## 非标准 Slug 目录测试

`onlyHiddenDir` 是 camelCase 命名，**不是合法的默认 slug**。

Astro 的 glob loader 默认会将文件路径 slugify（小写化、加连字符等），生成的 ID 类似 `tests/onlyhiddendir/header`。但 `[...path].astro` 中的 `getEntry('docs', routePath + '/header')` 使用的是文件系统原始路径 `tests/onlyHiddenDir/header`——大小写不匹配，查询返回 null，这段文字就不会渲染。

`content.config.ts` 中的自定义 `generateId` 解决了这个问题：

```typescript
function generateId(options) {
  return options.entry.replace(/\.[^.]+$/, '');
}
```

它直接用原始文件路径（去掉扩展名）作为 ID，绕过了 slug 规范化，保证 ID 与 `routePath` 精确匹配。

本目录下存在一个 [`.hidden/`](.hidden/) 隐藏子目录，其 listing 页面不会出现在下方表格中，但可以通过链接直接访问。

**如果你看到了这段文字，说明自定义 `generateId` 对 camelCase 路径生效了。**