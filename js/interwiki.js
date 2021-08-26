/**
 * Retrieves the value of the query parameter in the URL with the
 * given key, if provided, otherwise returns the empty string.
 *
 * @param {String} query - The URL query.
 * @param {String} name - The name of the parameter to get.
 */
function getQueryString(query, name) {
  // Get query parameters from the URL
  if (query.indexOf("?") === 0) query = query.substring(1);
  var parameters = query.split("&");
  // Iterate parameters in reverse so later values override earlier ones
  parameters.reverse();
  // Find the parameter whose key is the given name
  matchingParameter = parameters.find(function (parameter) {
    return parameter.indexOf(name + "=") === 0;
  });
  if (matchingParameter == null) return "";
  // Return the part of the parameter following the "="
  return decodeURIComponent(matchingParameter.substring(name.length + 1));
}

/**
 * Finds styleFrames embedded in the parent page and pulls their style
 * change requests for the interwikiFrame to use.
 *
 * styleFrames will also attempt to push their styles to the
 * interwikiFrame. The two methods work in unison to ensure that the
 * interwikiFrame receives all styles regardless of what order the iframes
 * initialise in.
 *
 * This function is also called on window reload prompted by the
 * interwiki's click-to-refresh, at which point it is very likely that all
 * styleFrames will have finished initialising.
 */
function pullStyles() {
  // Find styleFrames in the parent that have initialised before this
  // interwikiFrame did, and pull their query parameters
  Array.prototype.slice.call(parent).forEach(function (frame) {
    try {
      if (frame.isStyleFrame) {
        requestStyleChange(frame.location.search);
      }
    } catch (error) {
      // styleFrames that have not finished initialising will push their
      // styles to the interwikiFrame when they are ready
    }
  });
}

/**
 * Main procedure for the interwiki. Prepare contextual data, apply CSS
 * styling, and add links to translations.
 *
 * @param {"scp" | "wl"} community - The community of the interwiki.
 * @param {String} pagename - The Wikidot fullname of the current page.
 * @param {String} siteLang - The language code of the current branch of
 * the given community.
 */
function createInterwiki(community, pagename, siteLang) {
  pagename = pagename.replace(/^_default:/, "");

  // Get the list of branches for the given community
  var branches = { wl: wlBranches, scp: scpBranches }[community] || {};

  // Get the configuration for the current branch
  // TODO Rename "site" to "currentBranch"
  var siteData = branches[siteLang];

  // Get the Wikidot ID of the current branch
  // TODO When could this fail? Why fallback to false?
  // (This could fail if the interwiki is being used on a sandbox wiki
  // for testing, for example)
  // TODO What's this actually needed for?
  var currentBranchId = siteData ? siteData.id : false;

  var sideBlock = document.getElementsByClassName("side-block")[0];

  pullStyles();
  addTranslations();
}
