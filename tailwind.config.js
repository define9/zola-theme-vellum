/**
 * 可选的 Tailwind 配置（v4 CSS-first，这里只放 JS 侧能表达的补充项）。
 * 需要时才用：src/input.css 里加一行 @config "../../tailwind.config.js";
 * 不加也能用，CSS 里的 @source / @theme 已经够了。
 */
export default {
  content: ["./templates/**/*.html", "./content/**/*.md", "./static/js/**/*.js"],
  darkMode: ["class", '[data-theme="dark"]'],
};
