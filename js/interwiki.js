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
