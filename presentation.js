(function (window, document) {
  "use strict";

  var DESIGN_WIDTH = 2048;
  var DESIGN_HEIGHT = 1152;
  var DESKTOP_BREAKPOINT = 981;
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

    if (width < DESKTOP_BREAKPOINT) {
      root.style.removeProperty("--presentation-scale");
      root.removeAttribute("data-presentation-scale");
      return;
    }

    var scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
    root.style.setProperty("--presentation-scale", scale.toFixed(6));
    root.setAttribute("data-presentation-scale", scale.toFixed(6));
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

  updatePresentationScale();

  if (window.addEventListener) {
    window.addEventListener("resize", scheduleScaleUpdate, false);
    window.addEventListener("orientationchange", scheduleScaleUpdate, false);
  } else if (window.attachEvent) {
    window.attachEvent("onresize", scheduleScaleUpdate);
  }

  if (document.readyState === "loading") {
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", createFullscreenButton, false);
    } else {
      window.attachEvent("onload", createFullscreenButton);
    }
  } else {
    createFullscreenButton();
  }
})(window, document);
