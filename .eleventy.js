const path = require("node:path");
const site = require("./src/_data/site.js");
const categories = require("./src/_data/categories.js");

const categorySlugs = new Set(categories.items.map((category) => category.slug));

function categoryFromInputPath(inputPath = "") {
  const normalized = inputPath.split(path.sep).join("/");
  const match = normalized.match(/content\/([^/]+)\//);
  const category = match?.[1];
  return categorySlugs.has(category) ? category : null;
}

function isPublishedPost(item) {
  return Boolean(categoryFromInputPath(item.inputPath)) && !item.data.draft;
}

function getDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? new Date(0) : date;
}

function dateDescending(a, b) {
  return getDate(b.date ?? b.data?.date) - getDate(a.date ?? a.data?.date);
}

function normalizePrefix(prefix = "/") {
  const trimmed = String(prefix).trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

function absoluteUrl(url = "/", siteData = site) {
  const base = String(siteData.url || "").replace(/\/$/, "");
  const prefix = normalizePrefix(siteData.pathPrefix);
  const cleanUrl = `/${String(url).replace(/^\/+/, "")}`;
  const route = prefix === "/" ? cleanUrl : `${prefix.replace(/\/$/, "")}${cleanUrl}`;
  return `${base}${route}`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "content/images": "images" });
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addWatchTarget("src/assets");
  eleventyConfig.addWatchTarget("content/images");

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getAll()
      .filter(isPublishedPost)
      .sort((a, b) => dateDescending(a.data, b.data))
  );

  eleventyConfig.addFilter("formatDate", (value) => {
    const date = getDate(value);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
  });

  eleventyConfig.addFilter("rfcDate", (value) => getDate(value).toUTCString());
  eleventyConfig.addFilter("isoDate", (value) => getDate(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("slug", (value = "") =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("readingTime", (content = "") => {
    const text = String(content)
      .replace(/<[^>]*>/g, " ")
      .replace(/&[a-zA-Z#0-9]+;/g, " ")
      .trim();
    const words = text ? text.split(/\s+/).length : 0;
    return `${Math.max(1, Math.ceil(words / 220))} min read`;
  });

  eleventyConfig.addFilter("byCategory", (items = [], category) =>
    items.filter((item) => item.data.category === category)
  );

  eleventyConfig.addFilter("bySeries", (items = [], series) =>
    items.filter((item) => item.data.series === series)
  );

  eleventyConfig.addFilter("sortByTitle", (items = []) =>
    [...items].sort((a, b) =>
      String(a.data.title || "").localeCompare(String(b.data.title || ""), "es", {
        sensitivity: "base",
      })
    )
  );

  eleventyConfig.addFilter("limit", (items = [], count = 3) => items.slice(0, count));

  eleventyConfig.addFilter("categoryLabel", (slug) => {
    const category = categories.items.find((item) => item.slug === slug);
    return category?.label || slug;
  });

  eleventyConfig.addFilter("previousPost", (items = [], currentUrl) => {
    const index = items.findIndex((item) => item.url === currentUrl);
    return index > 0 ? items[index - 1] : null;
  });

  eleventyConfig.addFilter("nextPost", (items = [], currentUrl) => {
    const index = items.findIndex((item) => item.url === currentUrl);
    return index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  });

  eleventyConfig.addFilter("relatedPosts", (items = [], currentUrl, category) => {
    const others = items.filter((item) => item.url !== currentUrl);
    const sameCategory = others.filter((item) => item.data.category === category);
    const rest = others.filter((item) => item.data.category !== category);
    return [...sameCategory, ...rest].slice(0, 3);
  });

  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);
  eleventyConfig.addFilter("urlEncode", (value = "") => encodeURIComponent(String(value)));
  eleventyConfig.addFilter("xmlEscape", (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;")
  );
  eleventyConfig.addFilter("sitemapItems", (items = []) =>
    items.filter((item) => {
      const url = item.url || "";
      return (
        url &&
        !item.data.draft &&
        !url.endsWith("feed.xml") &&
        !url.endsWith("sitemap.xml") &&
        !url.endsWith("404.html")
      );
    })
  );

  eleventyConfig.addTransform("prefixMarkdownImagePaths", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    const prefix = normalizePrefix(process.env.ELEVENTY_PATH_PREFIX || site.pathPrefix || "/");
    const imageRoot = prefix === "/" ? "/images/" : `${prefix}images/`;
    return content.replace(/(<img\b[^>]*\ssrc=["'])\/images\//g, `$1${imageRoot}`);
  });

  return {
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || site.pathPrefix || "/",
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "src/_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
};
