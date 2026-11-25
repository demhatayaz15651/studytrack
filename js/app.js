(function () {
  "use strict";

  function initHeaderDate() {
    const label = document.getElementById("todayDateLabel");
    if (!label) return;
    const now = new Date();
    label.textContent = now.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderDate();
  });
})();
