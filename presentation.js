(function (window, document) {
  "use strict";

  var DESIGN_WIDTH = 2048;
  var DESIGN_HEIGHT = 1152;
  var DESKTOP_BREAKPOINT = 981;
  var LANDSCAPE_MIN_WIDTH = 600;
  var root = document.documentElement;
  var resizeTimer = 0;

  function viewportWidth() {
    return window.innerWidth || root.clientWidth || DESIGN_WIDTH;
  }

  function viewportHeight() {
    return window.innerHeight || root.clientHeight || DESIGN_HEIGHT;
  }

  function updatePresentationScale() {
    var width = viewportWidth();
    var height = viewportHeight();
    var shell =
      document.querySelector && document.querySelector(".site-shell");

    var shouldUseCanvas =
      width >= DESKTOP_BREAKPOINT ||
      (width >= LANDSCAPE_MIN_WIDTH && width >= height);

    if (!shouldUseCanvas) {
      root.style.removeProperty("--presentation-scale");
      root.removeAttribute("data-presentation-scale");
      if (shell) {
        shell.style.removeProperty("position");
        shell.style.removeProperty("top");
        shell.style.removeProperty("left");
        shell.style.removeProperty("width");
        shell.style.removeProperty("height");
        shell.style.removeProperty("min-height");
        shell.style.removeProperty("transform");
        shell.style.removeProperty("transform-origin");
      }
      return;
    }

    var scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
    var offsetX = Math.max(0, (width - DESIGN_WIDTH * scale) / 2);
    var offsetY = Math.max(0, (height - DESIGN_HEIGHT * scale) / 2);
    root.style.setProperty("--presentation-scale", scale.toFixed(6));
    root.setAttribute("data-presentation-scale", scale.toFixed(6));

    if (shell) {
      shell.style.position = "absolute";
      shell.style.top = "0px";
      shell.style.left = "0px";
      shell.style.width = DESIGN_WIDTH + "px";
      shell.style.height = DESIGN_HEIGHT + "px";
      shell.style.minHeight = DESIGN_HEIGHT + "px";
      shell.style.transformOrigin = "0 0";
      shell.style.transform =
        "matrix(" +
        scale.toFixed(8) +
        ",0,0," +
        scale.toFixed(8) +
        "," +
        offsetX.toFixed(3) +
        "," +
        offsetY.toFixed(3) +
        ")";
    }
  }

  function scheduleScaleUpdate() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updatePresentationScale, 30);
  }

  function currentFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function requestPageFullscreen() {
    var element = document.documentElement;
    var request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (request) request.call(element);
  }

  function exitPageFullscreen() {
    var exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.webkitCancelFullScreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;

    if (exit) exit.call(document);
  }

  function supportsFullscreen() {
    var element = document.documentElement;
    return Boolean(
      element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullscreen
    );
  }

  function createFullscreenButton() {
    if (
      !supportsFullscreen() ||
      window.location.search.indexOf("edit=1") !== -1 ||
      (document.querySelector && document.querySelector(".fullscreen-toggle"))
    ) {
      return;
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = "fullscreen-toggle";
    button.appendChild(document.createTextNode("⛶"));

    function updateButton() {
      var active = Boolean(currentFullscreenElement());
      button.setAttribute("data-active", String(active));
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute(
        "aria-label",
        active ? "退出全屏展示" : "进入全屏展示"
      );
      button.title = active ? "退出全屏" : "全屏展示";
      scheduleScaleUpdate();
    }

    button.onclick = function () {
      try {
        if (currentFullscreenElement()) {
          exitPageFullscreen();
        } else {
          requestPageFullscreen();
        }
      } catch (error) {
        button.className = "fullscreen-toggle is-unavailable";
        window.setTimeout(function () {
          button.className = "fullscreen-toggle";
        }, 1200);
      }
    };

    document.body.appendChild(button);
    updateButton();

    if (document.addEventListener) {
      document.addEventListener("fullscreenchange", updateButton, false);
      document.addEventListener("webkitfullscreenchange", updateButton, false);
      document.addEventListener("mozfullscreenchange", updateButton, false);
      document.addEventListener("MSFullscreenChange", updateButton, false);
    }
  }

  function createDebugPanel() {
    if (window.location.search.indexOf("debug=1") === -1) {
      return;
    }

    var panel = document.createElement("div");
    panel.id = "presentation-debug";
    panel.style.cssText =
      "position:fixed;left:12px;top:12px;z-index:999999;padding:10px 12px;" +
      "background:rgba(17,17,17,.9);color:#fff;border-radius:8px;" +
      "font:16px/1.5 Arial,sans-serif;pointer-events:none;text-align:left;";

    function updateDebugPanel() {
      var width = viewportWidth();
      var height = viewportHeight();
      var scale =
        root.style.getPropertyValue("--presentation-scale") || "未启用";
      var shell =
        document.querySelector && document.querySelector(".site-shell");
      var rect = shell && shell.getBoundingClientRect
        ? shell.getBoundingClientRect()
        : null;
      panel.innerHTML =
        "画面：" +
        width +
        " × " +
        height +
        "<br>缩放：" +
        scale +
        "<br>像素比：" +
        (window.devicePixelRatio || 1) +
        "<br>横屏画布：" +
        (width >= LANDSCAPE_MIN_WIDTH && width >= height ? "是" : "否") +
        (rect
          ? "<br>画布框：" +
            Math.round(rect.left) +
            "," +
            Math.round(rect.top) +
            " / " +
            Math.round(rect.width) +
            " × " +
            Math.round(rect.height)
          : "");
    }

    document.body.appendChild(panel);
    updateDebugPanel();
    window.addEventListener("resize", updateDebugPanel, false);
  }

  function createPageControls() {
    updatePresentationScale();
    createFullscreenButton();
    createDebugPanel();
  }

  updatePresentationScale();

  if (window.addEventListener) {
    window.addEventListener("resize", scheduleScaleUpdate, false);
    window.addEventListener("orientationchange", scheduleScaleUpdate, false);
  } else if (window.attachEvent) {
    window.attachEvent("onresize", scheduleScaleUpdate);
  }

  window.setInterval(updatePresentationScale, 500);

  if (document.readyState === "loading") {
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", createPageControls, false);
    } else {
      window.attachEvent("onload", createPageControls);
    }
  } else {
    createPageControls();
  }
})(window, document);
