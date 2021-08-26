/* exported createResizeIframe */

"use strict";

/**
 * Constructs and returns a function that, when called, resizes the current
 * iframes to match its contents.
 *
 * @param {String} site - The base URL of the site.
 * @param {String} page - The fullname of the parent page.
 */
function createResizeIframe(site, page) {
  var iframeSet = document.getElementById("iframeset");
  var resizer = document.createElement("iframe");
  resizer.style.display = "none";
  iframeSet.appendChild(resizer);

  var height = iframeSet.getBoundingClientRect().top;
  var cacheBreak = String(Math.floor(Math.random() * 10000));

  return function () {
    resizer.src =
      site +
      "common--javascript/resize-iframe.html?" +
      cacheBreak +
      "#" +
      height +
      page;
  };
}
