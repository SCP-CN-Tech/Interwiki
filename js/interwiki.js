/**
 * Retrieves the value of the query parameter in the URL with the
 * given key, if provided, otherwise returns the empty string.
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
