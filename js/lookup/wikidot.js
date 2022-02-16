/* exported wikidotLookup */

"use strict";

/**
 * Searches for pages whose fullname matches the given string in the given
 * set of Wikidot sites using Wikidot's PageLookupQModule.
 *
 * @param {Object.<String, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {String} fullname - The substring to compare fullnames against.
 * If an underscore "_" is provided, all pages on the site will match.
 * @param {findPagesCallback} callback
 */
function wikidotLookup(branches, fullname, callback) {}

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
