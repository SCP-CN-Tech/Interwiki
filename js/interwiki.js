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
 * TODO What does this function do?
 * TODO Maybe all the branch info can be consolidated to an object?
 *
 * @param {String} branchLang - The language code of the branch.
 * @param {Object} branch - Configuration for the branch to lookup.
 * @param {String} branch.url - The URL of the branch with trailing slash.
 * @param {String} branch.name - The name of the branch.
 * @param {String} branch.id - The numeric Wikidot site ID of the branch.
 * @param {String} fullname - The Wikidot fullname of the page to lookup.
 */
function getData(branchLang, branch, fullname) {
  // TODO Remove the current site's category from the search fullanme
  // TODO Prepend the search fullname with the target site's category
  // TODO Truncate the search fullname if it's too long
  findPagesInSiteStartingWith(branch.id, fullname, function (fullnames) {
    // TODO I allowed this callback to be called with an empty array, is it
    // okay with that?
    var check = false;
    // The lookup returns an array of fullnames, which must be checked for
    // matches against the searched fullname
    fullnames.forEach(function (fullname) {
      if (fullname.unix_name === fullname) {
        check = true;
        createNewMenuItem(branch.url + fullname, branch.name, branchLang);
      } else if (
        fullname.unix_name.match(new RegExp("^" + fullname)) &&
        shorten
      ) {
        check = true;
        createNewMenuItem(
          branch.url + fullname.unix_name,
          branch.name,
          branchLang
        );
      }
    });
    if (check) {
      sideBlock.removeAttribute("style");
      // TODO Why does the sideBlock have a style attribute?
      // TODO It doesn't appear that a style attribute is ever *added* to
      // the sideBlock. Why is this explicit removal here?
    }
    siteNum--;
    if ((styleCheck && check) || siteNum <= 0) {
      styleCheck = false;
      changeStyleCheck();
    }
  });
}

/**
 * Requests translation data for the current page from all configured
 * branches. Also sets the hover information in the refresh link to the
 * current time.
 */
function getDataAll() {
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
    if (branch.id === currentBranchId) {
      // TODO What is the significance of this?
      siteNum--;
      return;
    }
    getData(
      branch["url"],
      branch["name"],
      branch["id"],
      branch["category"] + pagename, // TODO Fullname - needs colon?
      branchLang
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
