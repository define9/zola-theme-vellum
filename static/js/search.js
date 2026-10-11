/* 搜索页：Pagefind 静态索引。无索引时给出提示，不报错。
   索引生成：zola build && pagefind --site public */

(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var list = document.getElementById("search-results");
  if (!input || !status || !list) return;

  var cfg = document.currentScript ? document.currentScript.dataset : {};
  var base = cfg.base || "";
  if (base && base.slice(-1) !== "/") base += "/";
  var pagefind = null;
  var timer = null;

  var TXT = {
    loading: "加载索引…",
    empty: cfg.empty || "输入关键词开始搜索。",
    none: cfg.noResult || "没有匹配的结果。",
    noIndex: cfg.noIndex || "未找到搜索索引。构建后运行 pagefind --site public 再刷新。",
    count: function (n, ms) {
      return "找到 " + n + " 条结果（" + ms + " ms）";
    }
  };

  function hit(entry) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "search__hit";
    a.href = entry.url;

    var title = document.createElement("span");
    title.className = "search__hit-title";
    title.textContent = entry.meta ? entry.meta.title || entry.url : entry.url;

    var url = document.createElement("span");
    url.className = "search__hit-url";
    url.textContent = entry.url;

    var excerpt = document.createElement("span");
    excerpt.className = "search__hit-excerpt";
    // Pagefind 的 excerpt 已经带 <mark>
    excerpt.innerHTML = entry.excerpt || "";

    a.appendChild(title);
    a.appendChild(url);
    a.appendChild(excerpt);
    li.appendChild(a);
    return li;
  }

  async function search(term) {
    term = term.trim();
    if (!term) {
      status.textContent = TXT.empty;
      list.innerHTML = "";
      return;
    }
    if (!pagefind) {
      status.textContent = TXT.loading;
      return;
    }

    var t0 = performance.now();
    try {
      var res = await pagefind.search(term);
      var data = await Promise.all(
        res.results.slice(0, 30).map(function (r) {
          return r.data();
        })
      );
      list.innerHTML = "";
      data.forEach(function (d) {
        list.appendChild(hit(d));
      });
      status.textContent = TXT.count(data.length, Math.round(performance.now() - t0));
    } catch (e) {
      status.textContent = TXT.none;
    }
  }

  async function init() {
    try {
      pagefind = await import(base + "pagefind/pagefind.js");
      // Pagefind 1.x：搜索前必须先初始化 wasm 索引
      await pagefind.init();
    } catch (e) {
      console.warn("[vellum] pagefind 加载失败", e);
      status.textContent = TXT.noIndex;
      return;
    }
    pagefind.options({ excerptLength: 28 });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) input.value = initial;
    search(initial);

    input.addEventListener("input", function () {
      clearTimeout(timer);
      var term = input.value;
      timer = setTimeout(function () {
        var url = new URL(window.location);
        if (term.trim()) url.searchParams.set("q", term);
        else url.searchParams.delete("q");
        window.history.replaceState({}, "", url);
        search(term);
      }, 180);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        input.value = "";
        search("");
      }
      if (e.key === "/" && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  init();
})();
