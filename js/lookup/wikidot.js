/* exported wikidotLookup */

"use strict";

/**
 * Searches for pages whose fullname matches the given string in the given
 * set of Wikidot sites using Wikidot's PageLookupQModule.
 *
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {String} fullname - The substring to compare fullnames against.
 * If an underscore "_" is provided, all pages on the site will match.
 * @param {addLinkCallback} addLink - A function that will be called for
 * each found translation.
 */
function wikidotLookup(currentBranch, branches, fullname, addLink) {
  Object.keys(branches).forEach(function (branchLang) {
    if (branches[branchLang].url === currentBranch.url) return;
    var branch = branches[branchLang];
    addTranslationForBranch(
      currentBranch,
      branchLang,
      branch,
      fullname,
      addLink
    );
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
 * @param {addLinkCallback} addLink - A function that will be
 * called for each found translation.
 */
function addTranslationForBranch(
  currentBranch,
  targetBranchLang,
  targetBranch,
  fullname,
  addLink
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
        addLink(
          targetBranch.url + targetFullname,
          targetBranch.name,
          targetBranchLang,
          false // Cannot distinguish original translation
        );
      }
    }
  );
}

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
    if (request.readyState === XMLHttpRequest.DONE) {
      var fullnames = [];
      try {
        if (request.status === 200) {
          var response = JSON.parse(request.responseText);
          // Format: {"pages":[{"unix_name":"scp-xxx","title":"SCP-XXX"}]}
          fullnames = response.pages.map(function (page) {
            return page.unix_name;
          });
        }
      } catch (error) {
        // Parsing failed - assume there are no matching pages
        console.error(
          "Interwiki: lookup failed for " + siteId + "/" + fullname
        );
        console.error(error);
      } finally {
        callback(fullnames);
      }
    }
  });
  request.send();
}
