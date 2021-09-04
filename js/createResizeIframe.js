/* exported createResizeIframe */

"use strict";

/**
 * Constructs and returns a function that, when called, resizes the current
 * iframes to match its contents. The function is debounced.
 *
 * @param {String} site - The base URL of the site.
 * @param {String} frameId - The last segment of the URL of the interwiki
 * iframe, used by Wikidot to identify it when resizing it.
 */
function createResizeIframe(site, frameId) {
  var container = document.getElementById("resizer-container");
  var resizer = document.createElement("iframe");
  resizer.style.display = "none";
  container.appendChild(resizer);

  // The resizer iframe must be on the same protocol + domain as the parent
  site = site.replace(/^https?:/, "");
  if (frameId[0] !== "/") frameId = "/" + frameId;

  return debounce(function () {
    // Measure from the top of the document to the iframe container to get
    // the document height - this takes into account inner margins, unlike
    // e.g. document.body.clientHeight
    // The container must not have display:none for this to work, which is
    // why the iframe has it instead
    var height = container.getBoundingClientRect().top;
    var cacheBreak = String(Math.floor(Math.random() * 10000));
    resizer.src =
      site +
      "/common--javascript/resize-iframe.html?" +
      cacheBreak +
      "#" +
      height +
      frameId;
  }, 250);
}

/**
 * Debounces a function, delaying its execution until a certain amount of
 * time has passed since the last time it was called, and aggregating all
 * calls made in that time into one.
 *
 * @param {Function} func - The function to call.
 * @param {Number} wait - The number of milliseconds to wait after any call
 * to the debounced function before executing it.
 */
function debounce(func, wait) {
  var timeout = 0;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
