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
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/Interwiki@main/css/style-wl.css);";
      break;
    case "bhl":
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/Interwiki@main/css/style-bhl.css);";
      break;
    case "404":
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/Interwiki@main/css/style-404.css);";
      if (pageCategory == "wanderers" || pageCategory == "wanderers-adult")
        cuStyle.innerHTML = ".side-block div.menu-item a {color: #059400}";
      break;
    default:
      inStyle.innerHTML =
        "@import url(https://cdn.jsdelivr.net/gh/scpwiki/Interwiki@main/css/style.css);";
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
 * TODO What does this function do?
 * TODO What should its parameters be named?
 *
 * @param {*} a
 * @param {*} b
 * @param {*} c
 */
function createItem(a, b, c) {
  var itemsAry = sideBlock.getElementsByClassName("menu-item");
  var item = document.createElement("div");
  var idx = function (v) {
    branchIds.indexOf(v);
  };
  item.classList.add("menu-item");
  item.setAttribute("name", c);
  item.innerHTML =
    '<img src="//scp-wiki.wdfiles.com/local--files/nav:side/default.png" alt="default.png" class="image" /><a href="' +
    a +
    '" target="_parent">' +
    b +
    "</a>";
  if (
    itemsAry.length == 0 ||
    idx(itemsAry[itemsAry.length - 1].getAttribute("name")) <= idx(c)
  ) {
    sideBlock.appendChild(item);
  } else {
    for (var i = 0; i < itemsAry.length; i++) {
      if (
        idx(c) < idx(itemsAry[i].getAttribute("name")) &&
        (i == 0 || idx(itemsAry[i - 1].getAttribute("name")) <= idx(c))
      ) {
        sideBlock.insertBefore(item, itemsAry[i]);
        break;
      }
    }
  }
}

/**
 * TODO What does this function do?
 *
 * @param {*} url
 * @param {*} name
 * @param {*} id
 * @param {*} fullname
 * @param {*} branchId
 */
function getData(url, name, id, fullname, branchId) {
  getWikiModule({
    site_id: id,
    query: fullname,
    function: function (res) {
      var check = false;
      for (var i = 0; i < res.length; i++) {
        if (res[i].unix_name == fullname) {
          check = true;
          createItem(url + fullname, name, branchId);
        } else if (
          res[i].unix_name.match(new RegExp("^" + fullname)) &&
          shorten
        ) {
          check = true;
          createItem(url + res[i].unix_name, name, branchId);
        }
      }
      if (check) {
        sideBlock.removeAttribute("style");
      }
      siteNum--;
      if ((styleCheck && check) || siteNum <= 0) {
        styleCheck = false;
        changeStyleCheck();
      }
    },
  });
}

/**
 * TODO What does this function do?
 */
function getDataAll() {
  var a = new Date(),
    af = function (v) {
      v < 10 ? "0" + v : v;
    },
    ay = a.getFullYear(),
    amo = af(a.getMonth() + 1),
    ad = af(a.getDate()),
    ah = af(a.getHours()),
    ami = af(a.getMinutes()),
    as = af(a.getSeconds()),
    time = ay + "/" + amo + "/" + ad + " " + ah + ":" + ami + ":" + as;
  heading.innerHTML =
    '<p><a onclick="window.location.reload(true);" title="Click Refresh ' +
    "(Last Refresh：" +
    time +
    ')">' +
    siteData["head"] +
    "</a></p>";
  for (var i = 0; i < branchIds.length; i++) {
    var obj = branches[branchIds[i]];
    if (siteID !== obj["id"]) {
      getData(
        obj["url"],
        obj["name"],
        obj["id"],
        obj["category"] + pagename, // TODO Fullname - needs colon?
        branchIds[i]
      );
    } else {
      siteNum--;
    }
  }
}

/**
 * TODO What does this function do?
 */
function bhlDark() {
  var bhlDarkStyle = document.createElement("style");
  bhlDarkStyle.setAttribute("type", "text/css");
  bhlDarkStyle.innerHTML =
    "@import url(https://cdn.jsdelivr.net/gh/scpwiki/Interwiki@main/css/style-bhl-dark.css);";
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
