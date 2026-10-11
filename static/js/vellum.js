/* Vellum 主题脚本：明暗切换、阅读进度、目录高亮、代码块工具栏、回到顶部
   无依赖，直接 <script defer>。 */

(function () {
  "use strict";

  var doc = document.documentElement;
  var STORE_KEY = "vellum-theme";

  /* ---------- 明暗切换 ---------- */

  function resolveTheme() {
    var mode = doc.dataset.theme;
    if (mode === "light" || mode === "dark") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    doc.dataset.theme = mode;
    doc.style.colorScheme = mode === "auto" ? "light dark" : mode;
  }

  function initTheme() {
    var toggle = document.getElementById("theme-toggle");
    var stored = null;
    try {
      stored = localStorage.getItem(STORE_KEY);
    } catch (e) {}
    applyTheme(stored === "light" || stored === "dark" ? stored : "auto");

    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var next = resolveTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORE_KEY, next);
      } catch (e) {}
    });

    // 跟随系统时，系统切换也要实时生效
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        var saved = null;
        try {
          saved = localStorage.getItem(STORE_KEY);
        } catch (e) {}
        if (!saved) applyTheme("auto");
      });
  }

  /* ---------- 滚动：进度条 + 回到顶部 ---------- */

  function initScroll() {
    var bar = document.querySelector("#reading-progress span");
    var toTop = document.getElementById("back-to-top");
    var article = document.querySelector(".post__content");
    var ticking = false;

    function update() {
      var y = window.scrollY;
      var vh = window.innerHeight;

      if (bar) {
        if (article) {
          var rect = article.getBoundingClientRect();
          var total = rect.height - vh + 160;
          var done = Math.min(Math.max(-rect.top + 80, 0), total);
          bar.style.width = (total > 0 ? (done / total) * 100 : 0) + "%";
        } else {
          var docH = document.documentElement.scrollHeight - vh;
          bar.style.width = (docH > 0 ? Math.min(y / docH, 1) * 100 : 0) + "%";
        }
      }

      if (toTop) {
        if (y > 600) {
          toTop.hidden = false;
          toTop.classList.add("is-visible");
        } else {
          toTop.classList.remove("is-visible");
        }
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ---------- 代码块：语言标签 + 复制 ---------- */

  function initCode() {
    var LANG = {
      "": "text",
      shell: "shell",
      bash: "shell",
      sh: "shell",
      shellscript: "shell",
      zsh: "shell",
      toml: "toml",
      yaml: "yaml",
      nginx: "nginx",
      rs: "rust",
      rust: "rust",
      py: "python",
      python: "python",
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      html: "html",
      css: "css",
      scss: "scss",
      md: "markdown",
      json: "json",
      diff: "diff"
    };

    document.querySelectorAll(".post__content pre, .notes__content pre").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (!code || pre.dataset.vellum === "done") return;
      pre.dataset.vellum = "done";

      var raw = code.dataset.lang || "";
      var label = LANG[raw.toLowerCase()] || raw || "text";

      var wrap = document.createElement("div");
      wrap.className = "code has-label";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var bar = document.createElement("div");
      bar.className = "code__bar";

      var name = document.createElement("span");
      name.textContent = label;

      var copy = document.createElement("button");
      copy.type = "button";
      copy.className = "code__copy";
      copy.textContent = "复制";
      copy.addEventListener("click", function () {
        var text = code.innerText;
        var done = function () {
          copy.textContent = "已复制";
          setTimeout(function () {
            copy.textContent = "复制";
          }, 1600);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        }
      });

      bar.appendChild(name);
      bar.appendChild(copy);
      wrap.insertBefore(bar, pre);
    });
  }

  /* ---------- 目录高亮 ----------
     不再用 IntersectionObserver：窄 band 遇到大段无标题内容时没有任何 heading
     命中，回退逻辑会让高亮在首项和当前项之间反复跳（表现为卡在第一项 + 闪烁）。
     改为按滚动位置算：命中线取视口顶部下方固定偏移，最后一个越过命中线的标题即当前项。 */

  function initToc() {
    var toc = document.querySelector(".toc");
    var content = document.querySelector(".post__content");
    if (!toc || !content) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    if (!links.length) return;

    var items = [];
    links.forEach(function (a) {
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      var el = document.getElementById(id);
      if (el) items.push({ id: id, link: a, el: el });
    });
    if (!items.length) return;

    var current = null;
    var ticking = false;

    function update() {
      ticking = false;
      var line = 120;
      var active = items[0].id;

      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top - line <= 0) active = items[i].id;
        else break;
      }

      // 末尾若有大段无标题内容，滚到底强制点亮最后一项
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        active = items[items.length - 1].id;
      }

      if (active === current) return;
      current = active;
      items.forEach(function (it) {
        it.link.parentNode.classList.toggle("is-active", it.id === active);
      });
    }

    function schedule() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    // 图片、代码块等异步撑高后重算一次
    window.addEventListener("load", schedule);
  }

  /* ---------- 外链 ---------- */

  function initExternalLinks() {
    var host = window.location.host;
    document.querySelectorAll(".post__content a[href^='http']").forEach(function (a) {
      if (a.host && a.host !== host) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });
  }

  /* ---------- 导航高亮：服务端只能匹配到列表页，这里补上文章页的前缀匹配 ---------- */

  function initNavActive() {
    var links = document.querySelectorAll(".topnav__link, .menu__link");
    var norm = function (p) {
      return p.replace(/\/+$/, "");
    };
    var cur = norm(location.pathname);
    var here = norm(location.pathname);

    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      var path = "";
      try {
        path = norm(new URL(a.href, location.origin).pathname);
      } catch (e) {
        return;
      }
      var isHere =
        path === cur ||
        (path !== "" && cur.indexOf(path + "/") === 0) ||
        norm(a.href) === here;
      a.classList.toggle("is-active", isHere);
    });
  }

  /* ---------- 图片兜底：外链图挂了就别留破图 ---------- */

  function initImageFallback() {
    document.querySelectorAll(".card__media img, .friends__avatar").forEach(function (img) {
      img.addEventListener("error", function () {
        var media = img.closest(".card__media");
        if (media) media.remove();
        else img.remove();
      });
    });
  }

  function boot() {
    initTheme();
    initScroll();
    initCode();
    initToc();
    initExternalLinks();
    initImageFallback();
    initNavActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
