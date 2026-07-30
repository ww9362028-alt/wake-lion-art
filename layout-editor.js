(() => {
  const STORAGE_KEY = "wake-lion-layout-editor-v1";
  const defaults = {
    leftX: 3,
    leftY: -52,
    leftScale: 1.14,
    rightX: 41,
    rightY: -55,
    rightScale: 1.1,
    brandX: 2,
    brandY: -5,
    brandScale: 1.17,
    badgeX: -27,
    badgeY: -14,
    badgeScale: 1.17,
  };

  const root = document.documentElement;
  const editorEnabled = new URLSearchParams(window.location.search).get("edit") === "1";
  let state = { ...defaults };

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") state = { ...defaults, ...saved };
  } catch {
    state = { ...defaults };
  }

  const isCustomized = () =>
    Object.keys(defaults).some((key) => Math.abs(state[key] - defaults[key]) > 0.001);

  const applyState = () => {
    Object.entries(state).forEach(([key, value]) => {
      const suffix = key.endsWith("Scale") ? "" : "px";
      root.style.setProperty(`--editor-${key}`, `${value}${suffix}`);
    });
    root.classList.toggle("layout-customized", isCustomized());
  };

  const saveState = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyState();
  };

  applyState();
  if (!editorEnabled) return;

  root.classList.add("layout-editor-active");

  const panel = document.createElement("aside");
  panel.className = "layout-editor-panel";
  panel.setAttribute("aria-label", "醒狮页面版式编辑器");
  panel.innerHTML = `
    <div class="editor-panel-head">
      <div>
        <strong>版式编辑</strong>
        <small>拖动虚线标签调整位置</small>
      </div>
      <span class="editor-live-dot">编辑中</span>
    </div>
    <div class="editor-control-list">
      <label>
        <span>左侧整体大小 <output data-output="leftScale"></output></span>
        <input data-key="leftScale" type="range" min="0.70" max="1.35" step="0.01" />
      </label>
      <label>
        <span>右侧卡片大小 <output data-output="rightScale"></output></span>
        <input data-key="rightScale" type="range" min="0.65" max="1.18" step="0.01" />
      </label>
      <label>
        <span>顶部品牌大小 <output data-output="brandScale"></output></span>
        <input data-key="brandScale" type="range" min="0.70" max="1.40" step="0.01" />
      </label>
      <label>
        <span>左下标识大小 <output data-output="badgeScale"></output></span>
        <input data-key="badgeScale" type="range" min="0.70" max="1.40" step="0.01" />
      </label>
    </div>
    <p class="editor-tip">位置和大小仅保存在当前浏览器。满意后复制参数发给 Codex，即可固化到公开页面。</p>
    <div class="editor-actions">
      <button type="button" data-action="copy">复制参数</button>
      <button type="button" data-action="preview">退出并预览</button>
      <button type="button" data-action="reset" class="is-quiet">恢复默认</button>
    </div>
    <div class="editor-toast" role="status" aria-live="polite"></div>
  `;
  document.body.append(panel);

  const updatePanel = () => {
    panel.querySelectorAll("[data-key]").forEach((input) => {
      input.value = state[input.dataset.key];
    });
    panel.querySelectorAll("[data-output]").forEach((output) => {
      output.textContent = `${Math.round(state[output.dataset.output] * 100)}%`;
    });
  };

  const toast = (message) => {
    const element = panel.querySelector(".editor-toast");
    element.textContent = message;
    element.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.classList.remove("is-visible"), 1800);
  };

  panel.addEventListener("input", (event) => {
    const input = event.target.closest("[data-key]");
    if (!input) return;
    state[input.dataset.key] = Number(input.value);
    saveState();
    updatePanel();
  });

  panel.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    if (button.dataset.action === "reset") {
      state = { ...defaults };
      window.localStorage.removeItem(STORAGE_KEY);
      applyState();
      updatePanel();
      toast("已恢复默认布局");
    }

    if (button.dataset.action === "copy") {
      const payload = JSON.stringify(state, null, 2);
      try {
        await navigator.clipboard.writeText(payload);
        toast("参数已复制，可以直接发给 Codex");
      } catch {
        window.prompt("复制下面的版式参数：", payload);
      }
    }

    if (button.dataset.action === "preview") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.location.href = url.toString();
    }
  });

  const targets = [
    { key: "left", selector: ".info-panel", label: "拖动左侧内容" },
    { key: "right", selector: ".draw-stage", label: "拖动右侧卡片" },
    { key: "brand", selector: ".brand", label: "拖动顶部品牌" },
    { key: "badge", selector: ".project-badge", label: "拖动左下标识" },
  ];

  targets.forEach(({ key, selector, label }) => {
    const target = document.querySelector(selector);
    if (!target) return;

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "layout-drag-handle";
    handle.textContent = label;
    handle.setAttribute("aria-label", label);
    target.append(handle);

    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startY = event.clientY;
      const originX = state[`${key}X`];
      const originY = state[`${key}Y`];

      const move = (moveEvent) => {
        state[`${key}X`] = Math.round(originX + moveEvent.clientX - startX);
        state[`${key}Y`] = Math.round(originY + moveEvent.clientY - startY);
        applyState();
      };

      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        saveState();
      };

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    });
  });

  updatePanel();
})();
