(() => {
  const STORAGE_KEY = "wake-lion-layout-editor-v3";

  const defaults = {
    leftX: -76,
    leftY: -52,
    leftWidth: 776,
    leftScale: 1.14,
    rightX: 1,
    rightY: -55,
    rightWidth: 714,
    rightScale: 1.11,
    brandX: -74,
    brandY: -4,
    brandScale: 1.17,
    badgeX: -104,
    badgeY: -70,
    badgeScale: 1.17,
    statsWidth: 96,
    cardPadding: 18,
    resultHeight: 80,
    heroTitleSize: 110,
    introSize: 20,
    noteSize: 25,
    tagSize: 28,
    cardHeadingSize: 20,
    cardTitleSize: 48,
    cardCopySize: 26,
    buttonTextSize: 27,
  };

  const controlGroups = [
    {
      title: "左侧内容",
      open: true,
      controls: [
        { key: "leftX", label: "水平位置 X", min: -500, max: 500, step: 1, unit: "px" },
        { key: "leftY", label: "垂直位置 Y", min: -400, max: 400, step: 1, unit: "px" },
        { key: "leftWidth", label: "内容框宽度", min: 420, max: 920, step: 2, unit: "px" },
        { key: "leftScale", label: "整体缩放", min: 0.6, max: 1.5, step: 0.01, unit: "scale" },
        { key: "statsWidth", label: "数字横框宽度", min: 55, max: 120, step: 1, unit: "%" },
      ],
    },
    {
      title: "右侧展示卡",
      open: true,
      controls: [
        { key: "rightX", label: "水平位置 X", min: -500, max: 500, step: 1, unit: "px" },
        { key: "rightY", label: "垂直位置 Y", min: -400, max: 400, step: 1, unit: "px" },
        { key: "rightWidth", label: "卡片框宽度", min: 420, max: 920, step: 2, unit: "px" },
        { key: "rightScale", label: "整体缩放", min: 0.6, max: 1.35, step: 0.01, unit: "scale" },
        { key: "cardPadding", label: "卡片内边距", min: 6, max: 36, step: 1, unit: "px" },
        { key: "resultHeight", label: "下方文字框高度", min: 50, max: 190, step: 2, unit: "px" },
      ],
    },
    {
      title: "文字大小",
      controls: [
        { key: "heroTitleSize", label: "左侧主标题", min: 44, max: 132, step: 1, unit: "px" },
        { key: "introSize", label: "左侧介绍文字", min: 12, max: 34, step: 1, unit: "px" },
        { key: "noteSize", label: "醒狮醒志文字", min: 12, max: 36, step: 1, unit: "px" },
        { key: "tagSize", label: "三个标签文字", min: 10, max: 28, step: 1, unit: "px" },
        { key: "cardHeadingSize", label: "卡片顶部文字", min: 10, max: 30, step: 1, unit: "px" },
        { key: "cardTitleSize", label: "灵狮作品标题", min: 20, max: 64, step: 1, unit: "px" },
        { key: "cardCopySize", label: "灵狮祝福文字", min: 11, max: 34, step: 1, unit: "px" },
        { key: "buttonTextSize", label: "抽取按钮文字", min: 12, max: 34, step: 1, unit: "px" },
      ],
    },
    {
      title: "品牌与角标",
      controls: [
        { key: "brandX", label: "品牌水平位置", min: -300, max: 500, step: 1, unit: "px" },
        { key: "brandY", label: "品牌垂直位置", min: -200, max: 300, step: 1, unit: "px" },
        { key: "brandScale", label: "品牌整体缩放", min: 0.6, max: 1.6, step: 0.01, unit: "scale" },
        { key: "badgeX", label: "角标水平位置", min: -500, max: 800, step: 1, unit: "px" },
        { key: "badgeY", label: "角标垂直位置", min: -300, max: 300, step: 1, unit: "px" },
        { key: "badgeScale", label: "角标整体缩放", min: 0.6, max: 1.6, step: 0.01, unit: "scale" },
      ],
    },
  ];

  const controls = controlGroups.flatMap((group) => group.controls);
  const controlByKey = new Map(controls.map((control) => [control.key, control]));
  const root = document.documentElement;
  const editorEnabled = new URLSearchParams(window.location.search).get("edit") === "1";
  let state = { ...defaults };

  if (editorEnabled) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") state = { ...defaults, ...saved };
    } catch {
      state = { ...defaults };
    }
  }

  const clampValue = (key, value) => {
    const control = controlByKey.get(key);
    if (!control || !Number.isFinite(value)) return defaults[key];
    return Math.min(control.max, Math.max(control.min, value));
  };

  const isCustomized = () =>
    Object.keys(defaults).some((key) => Math.abs(state[key] - defaults[key]) > 0.001);

  const applyState = () => {
    Object.keys(defaults).forEach((key) => {
      const control = controlByKey.get(key);
      const suffix =
        control?.unit === "scale" ? "" : control?.unit === "%" ? "%" : "px";
      root.style.setProperty(`--editor-${key}`, `${state[key]}${suffix}`);
    });
    root.classList.toggle("layout-customized", isCustomized());
  };

  const saveState = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyState();
  };

  const formatValue = (key) => {
    const control = controlByKey.get(key);
    const value = state[key];
    if (control?.unit === "scale") return `${Math.round(value * 100)}%`;
    if (control?.unit === "%") return `${Math.round(value)}%`;
    return `${Math.round(value)}px`;
  };

  if (!editorEnabled) return;

  applyState();
  root.classList.add("layout-editor-active");

  const controlMarkup = (control) => `
    <label class="editor-control" data-control="${control.key}">
      <span class="editor-control-name">
        <span>${control.label}</span>
        <output data-output="${control.key}"></output>
      </span>
      <span class="editor-control-inputs">
        <input
          data-key="${control.key}"
          data-input-kind="range"
          type="range"
          min="${control.min}"
          max="${control.max}"
          step="${control.step}"
        />
        <span class="editor-number-wrap">
          <input
            data-key="${control.key}"
            data-input-kind="number"
            type="number"
            min="${control.min}"
            max="${control.max}"
            step="${control.step}"
            aria-label="${control.label}精确数值"
          />
          <small>${control.unit === "scale" ? "倍" : control.unit}</small>
        </span>
      </span>
    </label>
  `;

  const groupMarkup = (group) => `
    <details class="editor-control-group" ${group.open ? "open" : ""}>
      <summary>${group.title}<span>${group.controls.length} 项</span></summary>
      <div class="editor-control-group-body">
        ${group.controls.map(controlMarkup).join("")}
      </div>
    </details>
  `;

  const panel = document.createElement("aside");
  panel.className = "layout-editor-panel";
  panel.setAttribute("aria-label", "醒狮页面高级版式编辑器");
  panel.innerHTML = `
    <div class="editor-panel-head">
      <div>
        <strong>高级版式编辑</strong>
        <small>拖动模块，或在数值框中精确输入</small>
      </div>
      <div class="editor-head-actions">
        <button type="button" data-action="side" aria-label="切换编辑面板位置" title="面板换边">⇄</button>
        <button type="button" data-action="collapse" aria-label="折叠编辑面板" title="折叠面板">−</button>
      </div>
    </div>
    <div class="editor-panel-body">
      <div class="editor-quick-tools">
        <button type="button" data-action="grid" aria-pressed="false">显示参考网格</button>
        <span>方向键微调 1px，Shift + 方向键移动 10px</span>
      </div>
      <div class="editor-control-list">
        ${controlGroups.map(groupMarkup).join("")}
      </div>
      <p class="editor-tip">调整结果只保存在当前浏览器。满意后点击“复制全部参数”发给 Codex，即可固化到公开页面。</p>
      <div class="editor-actions">
        <button type="button" data-action="copy">复制全部参数</button>
        <button type="button" data-action="preview">退出并预览</button>
        <button type="button" data-action="reset" class="is-quiet">恢复本页默认值</button>
      </div>
      <div class="editor-toast" role="status" aria-live="polite"></div>
    </div>
  `;
  document.body.append(panel);

  const updatePanel = () => {
    controls.forEach(({ key }) => {
      panel.querySelectorAll(`[data-key="${key}"]`).forEach((input) => {
        input.value = state[key];
      });
      const output = panel.querySelector(`[data-output="${key}"]`);
      if (output) output.textContent = formatValue(key);
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
    const key = input.dataset.key;
    const nextValue = clampValue(key, Number(input.value));
    state[key] = nextValue;
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
        toast("全部参数已复制，可以直接发给 Codex");
      } catch {
        window.prompt("复制下面的版式参数：", payload);
      }
    }

    if (button.dataset.action === "preview") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.location.href = url.toString();
    }

    if (button.dataset.action === "grid") {
      const isVisible = root.classList.toggle("layout-grid-visible");
      button.setAttribute("aria-pressed", String(isVisible));
      button.textContent = isVisible ? "隐藏参考网格" : "显示参考网格";
    }

    if (button.dataset.action === "side") {
      panel.classList.toggle("is-left");
    }

    if (button.dataset.action === "collapse") {
      const isCollapsed = panel.classList.toggle("is-collapsed");
      button.textContent = isCollapsed ? "+" : "−";
      button.setAttribute("aria-label", isCollapsed ? "展开编辑面板" : "折叠编辑面板");
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
    handle.setAttribute("aria-label", `${label}，可使用方向键微调`);
    target.append(handle);

    handle.addEventListener("keydown", (event) => {
      const movements = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (!movements[event.key]) return;
      event.preventDefault();
      const distance = event.shiftKey ? 10 : 1;
      state[`${key}X`] += movements[event.key][0] * distance;
      state[`${key}Y`] += movements[event.key][1] * distance;
      saveState();
      updatePanel();
    });

    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startY = event.clientY;
      const originX = state[`${key}X`];
      const originY = state[`${key}Y`];
      const canvasScale = Math.max(
        0.1,
        Number.parseFloat(
          root.style.getPropertyValue("--presentation-scale") || "1",
        ),
      );

      const move = (moveEvent) => {
        state[`${key}X`] = Math.round(
          originX + (moveEvent.clientX - startX) / canvasScale,
        );
        state[`${key}Y`] = Math.round(
          originY + (moveEvent.clientY - startY) / canvasScale,
        );
        applyState();
        updatePanel();
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
