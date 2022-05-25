// GraphQL query for Crom API
var query =
  " \
  query InterwikiQuery($url: URL!) { \
    page(url: $url) { \
      translations { \
        url \
      } \
      translationOf { \
        url \
        translations { \
          url \
        } \
      } \
    } \
  } \
";


var query404 =
  " \
  query InterwikiQuery($url: URL!) { \
    page(url: $url) { \
      wikidotInfo { \
        wikidotId \
      } \
    } \
  } \
";


/**
 * @typedef CromPage
 * @type {Object}
 * @property {String} url - The URL of this page.
 */

/**
 * @typedef CromOriginalPage
 * @type {Object}
 * @property {String} url - The URL of this page.
 * @property {Array.<CromPage>} translations - URLs for translations of
 * this page.
 */

/**
 * @typedef CromTranslations
 *
 * Crom's response to a translations request.
 *
 * Generally, either `translations` will be an empty array, or
 * `translationOf` will be null.
 *
 * @type {Object}
 * @property {Array.<CromPage>} translations - URLs for translations of
 * this page.
 * @property {?CromOriginalPage} translationOf - The page that the current
 * page is a translation of.
 */

/**
 * Searches for pages whose fullname matches the given string in the given
 * set of Wikidot sites using Crom query.
 *
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {String} fullname - The fullname of the target page.
 * @param {addLinkCallback} addLink - A function that will be called for
 * each found translation.
 */
export function cromLookup(currentBranch, branches, fullname, addLink) {
  executeQuery(normaliseUrl(currentBranch.url + fullname), false, function (response) {
    parseTranslations(response, currentBranch, branches, addLink);
  });
}

/**
 * Searches for pages whose fullname matches the given string in the given
 * set of Wikidot sites using Crom query.
 *
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {String} fullname - The fullname of the target page.
 * @param {addLinkCallback} addLink - A function that will be called for
 * each found translation.
 */
export function crom404Lookup(currentBranch, branches, fullname, addLink) {
  Object.keys(branches).forEach(function (branchLang) {
    if (branches[branchLang].url === currentBranch.url) return;
    var branch = branches[branchLang];
    executeQuery(normaliseUrl(branch.url + fullname), true, function (response) {
      parseExistence(response, branch, branches, fullname, addLink);
    });
  });
}

/**
 * Normalises a branch URL to one accepted by Crom.
 *
 * @param {String} url
 */
function normaliseUrl(url) {
  if (url.indexOf(".wikidot.com") === -1) {
    throw new Error("Crom requires wikidot.com branch URLs (" + url + ")");
  }
  return url.replace(/^https:/, "http:");
}

/**
 * Parses the response from the Crom API into a list of translations.
 *
 * @param {CromTranslations} response - The response from the Crom API.
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {addLinkCallback} addLink - A function that will be
 * called for each found translation.
 */
function parseTranslations(response, currentBranch, branches, addLink) {
  function url(page) {
    return page.url;
  }
  var original = null;
  var translations = [];

  // Extract translations of this page
  translations = translations.concat(response.translations.map(url));
  // Extract translations of this page's translation root
  if (response.translationOf) {
    original = response.translationOf.url;
    translations.push(original);
    translations = translations.concat(
      response.translationOf.translations.map(url)
    );
  }

  translations.forEach(function (translation) {
    // Do not add this translation if it is from the current branch
    var fromCurrentBranch =
      translation.indexOf(normaliseUrl(currentBranch.url)) === 0;
    if (fromCurrentBranch) return;

    var targetBranchLang = Object.keys(branches).find(function (branchLang) {
      return translation.indexOf(normaliseUrl(branches[branchLang].url)) === 0;
    });
    if (!targetBranchLang) {
      // Crom may support unofficial/unconfigured branches
      console.warn("Interwiki: unknown branch " + translation);
      return;
    }

    addLink(
      translation,
      branches[targetBranchLang].name,
      targetBranchLang,
      original === translation
    );
  });
}

/**
 * Parses the response from the Crom API into a list of translations.
 *
 * @param {CromTranslations} response - The response from the Crom API.
 * @param {Branch} currentBranch - Configuration for the current branch.
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community. All passed branches will be searched for the
 * target page.
 * @param {String} fullname - The fullname of the target page.
 * @param {addLinkCallback} addLink - A function that will be
 * called for each found translation.
 */
function parseExistence(response, currentBranch, branches, fullname, addLink) {
  if (response.wikidotInfo) {
    var targetBranchLang = Object.keys(branches).find(function (branchLang) {
      return branches[branchLang].url === currentBranch.url;
    });

    addLink(
      currentBranch.url + fullname,
      branches[targetBranchLang].name,
      targetBranchLang,
      false
    );
  }
}

/**
 * Queries the Crom API for translations of the given page.
 *
 * @param {String} url - The HTTP Wikidot URL of the page for which to look
 * up translations.
 * @param {Boolean} is404 - Whether the query is for a 404 page or not.
 * @param {Function} callback - Will be called with the response from Crom.
 */
function executeQuery(url, is404, callback) {
  var request = new XMLHttpRequest();
  request.open("POST", "https://api.crom.avn.sh/graphql", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.addEventListener("readystatechange", function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      try {
        if (request.status === 200) {
          var response = JSON.parse(request.responseText);
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors);
          }
          callback(response.data.page);
        } else {
          throw new Error(request.status);
        }
      } catch (error) {
        console.error("Interwiki: lookup failed for " + url);
        console.error(error);
      }
    }
  });
  request.send(JSON.stringify({ query: is404 ? query404 : query, variables: { url: url } }));
}
