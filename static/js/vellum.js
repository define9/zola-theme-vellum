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

  /* ---------- 目录高亮 ---------- */

  function initToc() {
    var toc = document.querySelector(".toc");
    var content = document.querySelector(".post__content");
    if (!toc || !content || !window.IntersectionObserver) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    if (!links.length) return;

    var byId = {};
    var targets = [];
    links.forEach(function (a) {
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      var el = document.getElementById(id);
      if (el) {
        byId[id] = a;
        targets.push(el);
      }
    });

    var visible = new Set();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        var active = null;
        targets.forEach(function (t) {
          if (visible.has(t.id)) active = t.id;
        });
        if (!active) active = targets[0].id;
        links.forEach(function (a) {
          a.parentNode.classList.remove("is-active");
        });
        if (byId[active]) byId[active].parentNode.classList.add("is-active");
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    targets.forEach(function (t) {
      io.observe(t);
    });
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
