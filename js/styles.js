import { getQueryString } from "./interwiki";

/**
 * Constructs the handler for requesting style changes to the
 * interwikiFrame.
 *
 * @param {String} siteUrl - The base URL of the interwiki's configured
 * site.
 * @param {String} type - The type of interwiki, for potentially
 * different styles of interwiki in the same page.
 */
export function createRequestStyleChange(siteUrl, type) {
  /**
   * Handles a style request from a styleFrame.
   *
   * @param {String} request - A URL query originating from a styleFrame,
   * requesting a style change for the interwikiFrame.
   */
  return function requestStyleChange(request) {
    var styleType = getQueryString(request, "type") || "default";
    var priorityRaw = getQueryString(request, "priority");
    var priority = Number(priorityRaw);
    var overrideRaw = getQueryString(request, "override") || "0";
    var override = Boolean(Number(overrideRaw));
    if (isNaN(priority)) {
      console.error("Interwiki: rejected style with priority" + priorityRaw);
      return;
    }
    if (styleType != type) return;

    var theme = getQueryString(request, "theme");
    if (theme) addExternalStyle(priority, urlFromTheme(siteUrl, theme), override);

    var css = getQueryString(request, "css");
    if (css) addInternalStyle(priority, css, override);
  };
}

/**
 * Creates a new style element in the document containing the given CSS.
 *
 * @param {Number} priority - The priority of the CSS, which determines the
 * sort order.
 * @param {String} css - Raw CSS to add to the style.
 * @param {Boolean} override - Whether to remove all previous styling or not.
 */
function addInternalStyle(priority, css, override) {
  // Check that the incoming CSS doesn't duplicate an existing style
  var styleElements = Array.prototype.slice.call(
    document.head.querySelectorAll("style.custom-style")
  );
  if (styleElements.some(duplicatesStyle(priority, css))) return;

  if (override) {
    var overrideElement = styleElements.find(duplicatesPriority(priority));
    // Override the style of a pre-existing styling element
    if (overrideElement) {
      console.log(
        "Interwiki: style at priority " + 
        priority +
        " is being overrided."
      );
      overrideElement.innerText = css;
      return;
    }
  }

  // Create a new style elements for the CSS
  var style = document.createElement("style");
  style.innerText = css;

  // Insert the style into the appropriate position in the head
  insertStyle(priority, style);
  
}

/**
 * Creates a new link element in the document referencing the CSS
 * stylesheet at the given URL.
 *
 * @param {Number} priority - The priority of the CSS, which determines the
 * sort order.
 * @param {String} url - The URL of the CSS stylesheet.
 * @param {Boolean} override - Whether to remove all previous styling or not.
 */
export function addExternalStyle(priority, url, override) {
  // Check that the incoming link doesn't duplicate an existing style
  var linkElements = Array.prototype.slice.call(
    document.head.querySelectorAll("link.custom-style")
  );
  if (linkElements.some(duplicatesStyle(priority, url))) return;
  
  if (override) {
    var overrideElement = linkElements.find(duplicatesPriority(priority));
    // Override the link of a pre-existing link element
    if (overrideElement) {
      console.log(
        "Interwiki: stylesheet " +
        overrideElement.href +
        " is overrided by " +
        url + 
        " at priority " + 
        priority +
        "."
      );
      overrideElement.href = url;
      return;
    }
  }

  // Create a new link element for the stylesheet
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

  // Insert the link into the appropriate position in the head
  insertStyle(priority, link);
}

/**
 * Inserts the given styling element into the document head, in a position
 * relative to pre-existing styling elements determined by the priority key
 * of its dataset. Elements with greater priority are placed below those
 * with lower priorities.
 *
 * @param {Number} newPriority - The priority of this element.
 * @param {HTMLinkElement | HTMLStyleElement} newStylingElement - The element
 * to insert.
 */
function insertStyle(newPriority, newStylingElement) {
  newStylingElement.classList.add("custom-style");
  newStylingElement.dataset.priority = newPriority;
  var stylingElements = Array.prototype.slice.call(
    document.head.querySelectorAll("link.custom-style, style.custom-style")
  );

  // Attempt to insert the element between other existing elements
  var newTagName = newStylingElement.tagName;
  var wasInserted = stylingElements.some(function (stylingElement) {
    var priority = Number(stylingElement.dataset.priority);
    var tagName = stylingElement.tagName;

    // If the new priority is more than the current priority, continue
    if (newPriority > priority) return false;

    // If the two priorities are equal...
    if (priority === newPriority) {
      // Two styles are not supposed to have the same priority, but a
      // single link and style with the same priority is allowed. In this
      // case the style has slightly higher priority than the link
      if (tagName === "LINK" && newTagName === "STYLE") {
        // The style is allowed to be inserted after the link, so continue
        return false;
      }

      if (tagName === newTagName) {
        // Two elements of the same tag with the same priority are not
        // allowed - raise a warning about it, but add them anyway
        console.error(
          "Interwiki: encountered two " +
            (tagName === "LINK" ? "themes" : "CSS styles") +
            " with the same priority (" +
            priority +
            ") and override is set to false - result may not be as expected"
        );
        // Fall back to insertion
      }

      // Otherwise (if old is STYLE and new is LINK, or if they are equal),
      // fall back to insertion
    }

    // Otherwise, if the new priority is less than the current priority (or
    // after falling back from the equality case), insert the new element
    // before the one with higher priority
    document.head.insertBefore(newStylingElement, stylingElement);
    return true;
  });

  if (!wasInserted) {
    // The element would not have been inserted if it is the first, or if
    // its priority is greater than all existing priorities
    document.head.appendChild(newStylingElement);
  }
}

/**
 * Constructs and returns a function that checks if a given HTML element
 * (assumed to be either a link or a style element) is a match for an
 * element that would have been created for the given priority and value.
 *
 * @param {Number} priority
 * @param {String} value
 */
function duplicatesStyle(priority, value) {
  /**
   * @param {HTMLLinkElement | HTMLStyleElement} styleElement
   * @returns {Boolean}
   */
  var isDuplicate = function (styleElement) {
    if (Number(styleElement.getAttribute("data-priority")) !== priority) {
      return false;
    }
    if (styleElement.tagName === "LINK") {
      return styleElement.getAttribute("href") === value;
    }
    if (styleElement.tagName === "STYLE") {
      return styleElement.innerText === value;
    }
    return false;
  };
  return isDuplicate;
}

/**
 * Constructs and returns a function that checks if a given HTML element
 * (assumed to be either a link or a style element) has the given priority.
 *
 * @param {Number} priority
 */
 function duplicatesPriority(priority) {
  /**
   * @param {HTMLLinkElement | HTMLStyleElement} styleElement
   * @returns {Boolean}
   */
  var isDuplicate = function (styleElement) {
    return Number(styleElement.getAttribute("data-priority")) === priority;
  };
  return isDuplicate;
}

/**
 * Constructs a URL pointing to the expected location of a CSS stylesheet.
 *
 * The theme pointer may be one of the following:
 * - A full URL to a CSS stylesheet.
 * - The fullname of a page on the current wiki, whose /code/1 endpoint
 *   will be parsed as a CSS stylesheet.
 * - The fullname of a page on the current wiki specifying a code block
 *   number (of the form <fullname>/code/n), where the nth code block on
 *   that page will be parsed as a CSS stylesheet.
 *
 * @param {String} siteUrl - The base URL of the site matching the
 * interwikiFrame's language code, which will be used to look up the theme
 * the case that a full URL was not provided.
 * @param {String} theme - An indicator of where a CSS stylesheet can be
 * found.
 */
function urlFromTheme(siteUrl, theme) {
  // If the theme is already a full URL, return it
  if (theme.indexOf("http") === 0 || theme.indexOf("//") === 0) {
    return theme;
  }

  // If the interwiki's site URL is not known, the full URL for a relative
  // theme cannot be constructed
  if (!siteUrl) {
    console.error(
      "Interwiki: could not resolve relative fullname (" +
        theme +
        ") for unconfigured site. Consider using a full URL instead."
    );
    return "";
  }

  // Assume it's a fullname
  if (theme.indexOf("/") === -1) {
    return siteUrl + "/local--code/" + theme + "/1";
  }
  // Assume of the form <fullname>/code/1
  var themeParts = theme.split("/");
  if (themeParts.length >= 3 && themeParts[1] === "code") {
    return siteUrl + "/local--code/" + themeParts[0] + "/" + themeParts[2];
  }
  // If none of those worked, report the error
  console.error("Interwiki: unknown theme location:" + theme);
  return "";
}
