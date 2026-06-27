const path = require("node:path");
const categories = require("../src/_data/categories.js");

const validCategories = new Set(categories.items.map((category) => category.slug));

function categoryFromData(data) {
  const inputPath = String(data.page?.inputPath || "").split(path.sep).join("/");
  const match = inputPath.match(/content\/([^/]+)\//);
  const category = match?.[1];
  return validCategories.has(category) ? category : null;
}

module.exports = {
  eleventyComputed: {
    category: (data) => categoryFromData(data) || data.category,
    layout: (data) => (categoryFromData(data) ? "layouts/article.njk" : data.layout),
    permalink: (data) => {
      const category = categoryFromData(data);
      if (!category) return data.permalink;
      if (data.draft) return false;
      return `/${category}/${data.page.fileSlug}/`;
    },
    eleventyExcludeFromCollections: (data) => Boolean(categoryFromData(data) && data.draft),
    activeCategory: (data) => categoryFromData(data) || data.activeCategory,
  },
};
