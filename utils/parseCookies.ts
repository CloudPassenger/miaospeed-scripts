/**
 * Parse cookies from an array of cookie strings.
 * @param {Record<string,string>[]} cookieArray Cookie output from golang engine
 * @returns Cookies
 */
function parseCookies(cookieArray: Record<string, string | Date | Boolean>[]) {
  var cookieMap = {};
  cookieArray.forEach(function (cookieObj) {
    var key = cookieObj.Name as string;
    var value = cookieObj.Value as string;
    cookieMap[key] = value;
  });
  return cookieMap;
}

export default parseCookies;