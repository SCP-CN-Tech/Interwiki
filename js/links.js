/* exported addTranslations */

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
 * Requests translation data for the current page from all configured
 * branches. Also sets the hover information in the refresh link to the
 * current time.
 *
 * @param {Object.<String, Branch>} branches - The branches configuration
 * for the current community.
 * @param {String} currentBranchLang - The language code of the current
 * branch, as defined in the community's branches config.
 * @param {String} pagename - The fullname of the page in the current
 * branch to find translations for.
 */
function addTranslations(branches, currentBranchLang, pagename) {
  // Get the config for the current branch, if configured
  var currentBranch = branches[currentBranchLang] || {};

  // Construct the click-to-refresh link
  var refreshLink = document.getElementById("refresh-link");
  refreshLink.innerHTML = currentBranch.head;
  refreshLink.setAttribute(
    "title",
    // TODO Make the string here translatable
    "Click to refresh (Last refresh：" + new Date().toLocaleString() + ")"
  );

  // For all configured sites that are not the current site, request
  // translation data about this page
  Object.keys(branches).forEach(function (branchLang) {
    if (branchLang === currentBranchLang) return;
    var branch = branches[branchLang];
    addTranslationForBranch(branchLang, branch, pagename);
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
  var targetFullname = fullname.replace(
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
        addTranslationLink(
          targetBranch.url + targetFullname,
          targetBranch.name,
          targetBranchLang
        );
      }
    }
  );
}

/**
 * Create a new menu item, containing a link to a page in a given branch,
 * and append it to the side block.
 *
 * @param {String} pageUrl - The URL of the translation to link to.
 * @param {String} branchName - The name of the branch.
 * @param {String} branchLang - The language code of the branch.
 */
function addTranslationLink(pageUrl, branchName, branchLang) {
  var sideBlock = document.getElementsByClassName("side-block")[0];
  var menuItems = sideBlock.getElementsByClassName("menu-item");

  // Create the new menu item
  var newMenuItem = document.createElement("div");
  newMenuItem.classList.add("menu-item");
  // Record its branch's language code in the element
  newMenuItem.setAttribute("name", branchLang);

  // Create the bullet point image
  var bullet = document.createElement("img");
  bullet.setAttribute(
    "src",
    "//scp-wiki.wdfiles.com/local--files/nav:side/default.png"
  );
  bullet.setAttribute("alt", "default.png");
  bullet.classList.add("image");
  newMenuItem.appendChild(bullet);

  // Create the actual link
  var link = document.createElement("a");
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
 * @callback findPagesCallback
 * @param {String[]} fullnames
 */

/**
 * In the given Wikidot site, searches for pages whose fullnames start with
 * the given string.
 *
 * A 'fullname' is also referred to as a page's 'UNIX name'.
 *
 * @param {String} siteId - The numeric Wikidot site ID of the site to
 * search.
 * @param {String} fullname - The substring to compare fullnames against.
 * If an underscore "_" is provided, all pages on the site will match.
 * @param {findPagesCallback} callback - Will be called with the array of
 * matching fullnames.
 */
function findPagesInSiteStartingWith(siteId, fullname, callback) {
  var query = "&s=" + siteId + "&q=" + fullname;
  var url = "/quickmodule.php?module=PageLookupQModule" + query;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.addEventListener("load", function () {
    if (request.readyState === 4) {
      var fullnames = [];
      try {
        if (request.status === 200) {
          var response = JSON.parse(request.responseText);
          // {"pages":[{"unix_name":"scp-xxx","title":"SCP-XXX"}]}
          fullnames = response.pages.map(function (page) {
            return page.unix_name;
          });
        }
      } catch (error) {
        // Parsing failed - assume there are no matching pages
      } finally {
        callback(fullnames);
      }
    }
  });
  request.send();
}
