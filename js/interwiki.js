/**
 * @typedef Branch
 *
 * Configuration for a single branch.
 *
 * A branch is usually a whole Wikidot site but can be restricted to a
 * single category of a Wikidot site.
 *
 * @type {Object}
 * @property {String} name - The official name of the branch.
 * @property {String} head - The text of the header that will appear at the
 * top of the Interwiki.
 * @property {String} url - The URL of the site that contains this branch,
 * with a trailing slash.
 * @property {String} id - The numeric Wikidot site ID of the site that
 * contains this branch.
 * @property {String} category - The category within this site that
 * contains the branch, with a trailing colon; or, if the branch is not
 * contained to any category within the site, the empty string.
 */

/**
 * Retrieves the value of the query parameter in the URL with the
 * given key, if provided, otherwise returns the empty string.
 *
 * @param {String} name - The name of the parameter to get.
 */
function getQueryString(name) {
  // Get query parameters from the URL
  var parameters = document.location.search.substr(1).split("&");
  // Iterate parameters in reverse order so later values override
  // ones
  parameters.reverse();
  // Find the parameter whose key is the given name
  matchingParameter = parameters.find(function (parameter) {
    return parameter.indexOf(name + "=") != -1;
  });
  if (matchingParameter == null) {
    return "";
  }
  // Return the part of the parameter following the "="
  return matchingParameter.substring(name.length + 1);
}

/**
 * TODO What is this function?
 * TODO The function seems to be named for its implementation, that
 * needs to change
 * TODO The function appears to execute a side effect on inStyle et al,
 * which is not ideal, unless it is called externally
 */
function switchStyleType() {
  switch (styleType) {
    case "wanderers":
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/interwiki@main/css/style-wl.css);";
      break;
    case "bhl":
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/interwiki@main/css/style-bhl.css);";
      break;
    case "404":
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/interwiki@main/css/style-404.css);";
      if (pageCategory == "wanderers" || pageCategory == "wanderers-adult")
        cuStyle.innerHTML = ".side-block div.menu-item a {color: #059400}";
      break;
    default:
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/interwiki@main/css/style.css);";
  }
}

/**
 * TODO What is this function?
 * @param {*} str
 * @param {*} mode
 */
function changeStyle(str, mode) {
  if (mode == null) mode = false;
  var typeAry = ["bhl", "wanderers", "default", "404"];
  if (typeAry.indexOf(str) > -1) {
    if (styleType != str) {
      styleType = str;
      switchStyleType();
    }
  } else if (styleAry.indexOf(str) == -1) {
    styleAry.push(str);
    if (mode) {
      cuStyle.innerHTML += str;
    } else {
      cuStyle.innerHTML = str + cuStyle.innerHTML;
    }
  }
}

/**
 * TODO What is this function?
 * TODO It appears to execute all three of these things regardless -
 * perhaps all but one of them is expected to fail? Is the order important?
 */
function changeStyleCheck() {
  try {
    changeStyle(
      decodeURIComponent(
        window.parent.window.typeFrame.location.search.substr(1)
      )
    );
  } catch (e) {}
  try {
    changeStyle(
      decodeURIComponent(
        window.parent.window.styleFrame.location.search.substr(1)
      )
    );
  } catch (e) {}
  try {
    changeStyle(
      decodeURIComponent(
        window.parent.window.customStyleFrame.location.search.substr(1)
      ),
      true
    );
  } catch (e) {}
}

/**
 * Create a new menu item, containing a link to a page in a given branch,
 * and append it to the side block.
 *
 * @param {String} pageUrl - The URL of the translation to link to.
 * @param {String} branchName - The name of the branch.
 * @param {String} branchLang - The language code of the branch.
 */
function createNewMenuItem(pageUrl, branchName, branchLang) {
  var menuItems = sideBlock.getElementsByClassName("menu-item");

  // Create the new menu item
  var newMenuItem = document.createElement("div");
  newMenuItem.classList.add("menu-item");
  // Record its branch's language code in the element
  newMenuItem.setAttribute("name", branchLang);

  // Create the bullet point image
  bullet = document.createElement("img");
  bullet.setAttribute(
    "src",
    "//scp-wiki.wdfiles.com/local--files/nav:side/default.png"
  );
  bullet.setAttribute("alt", "default.png");
  bullet.classList.add("image");
  newMenuItem.appendChild(bullet);

  // Create the actual link
  link = document.createElement("a");
  link.setAttribute("href", pageUrl);
  link.setAttribute("target", "_parent");
  link.innerText = branchName;
  newMenuItem.appendChild(link);

  // Add the new menu item to the end of the side block by default
  menuItems.appendChild(newMenuItem);
  // Then find the first existing menu item whose lang code is
  // alphabetically greater than the new item, and move the new item to
  // just before it
  menuItems.some(function (menuItem) {
    if (menuItem.getAttribute("name") > branchLang) {
      menuItems.insertBefore(newMenuItem, menuItem);
      return true;
    }
  });
}

/**
 * For the given target branch, find a page that is a translation of the
 * paat fullname in the current branch. If one exists, create a menu item
 * for it.
 *
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {String} targetBranchLang - The language code of the branch.
 * @param {Branch} targetBranch - Configuration for the branch to lookup.
 * @param {String} fullname - The Wikidot fullname of the page to lookup.
 */
function addTranslationForBranch(
  currentBranch,
  targetBranchLang,
  targetBranch,
  fullname
) {
  // Replace the current site's category with the target site's category,
  // if either are defined
  // E.g.:
  // WL CN "wanderers:page" -> WL EN "page"
  // WL EN "page" -> WL CN "wanderers:page"
  // TODO siteData["category"] doesn't have a trailing colon?
  targetFullname = fullname.replace(
    new RegExp("^" + currentBranch.category),
    targetBranch.category
  );

  // A fullname can be at most 60 characters long. If the target fullname
  // is any longer, truncate it
  targetFullname = targetFullname.substring(0, 60).replace(/-$/, "");

  // If the original fullname was 59 characters long (because the limit is
  // 60, minus one if it would have ended with a hyphen), it could have
  // been truncated. If the target fullname is shorter than the original
  // fullname (due to stripping the category), the last bit of the fullname
  // is not recoverable
  var couldHaveBeenTruncated =
    fullname.length >= 59 && targetFullname.length < fullname.length;

  // Find pages in the target branch matching this fullname
  findPagesInSiteStartingWith(
    targetBranch.id,
    targetFullname,
    function (fullnames) {
      // If there is an exact match, a translation has been found
      if (
        fullnames.some(function (matchedFullname) {
          // If the end of the fullname is possibly missing, check only
          // that the matched fullname starts with the target.
          // This is unlikely to produce a false positive because the
          // fullnames involved are very long (~60 chars)
          if (couldHaveBeenTruncated) {
            return matchedFullname.indexOf(targetFullname) === 0;
          }
          // Otherwise, check for exact matches only
          return matchedFullname === targetFullname;
        })
      ) {
        createNewMenuItem(
          targetBranch.url + targetFullname,
          targetBranch.name,
          targetBranchLang
        );
      }
    }
  );
}

/**
 * Requests translation data for the current page from all configured
 * branches. Also sets the hover information in the refresh link to the
 * current time.
 */
function addTranslations() {
  refreshLink = document.getElementById("refresh-link");
  refreshLink.innerHTML = siteData["head"];
  refreshLink.setAttribute(
    "title",
    // TODO Make the string here translatable
    "Click to refresh (Last refresh：" + new Date().toLocaleString() + ")"
  );
  // For all configured sites that are not the current site, request
  // translation data about this page
  Object.keys(branches).forEach(function (branchLang) {
    branch = branches[branchLang];
    if (branch.id === currentBranchId) return;
    addTranslationForBranch(
      branchLang,
      branch,
      branch["category"] + pagename // TODO Fullname - needs colon?
    );
  });
}

/**
 * TODO What does this function do?
 */
function bhlDark() {
  var bhlDarkStyle = document.createElement("style");
  bhlDarkStyle.setAttribute("type", "text/css");
  bhlDarkStyle.innerHTML =
    "@import url(https://cdn.jsdelivr.net/gh/scpwiki/interwiki@main/css/style-bhl-dark.css);";
  document
    .getElementsByTagName("head")[0]
    .insertBefore(bhlDarkStyle, document.getElementById("custom-style"));
}

/**
 * TODO What does this function do?
 */
function bhlDarkCheck() {
  try {
    if (window.parent.window.BHLDarkFrame) {
      bhlDark();
    }
  } catch (e) {}
}
