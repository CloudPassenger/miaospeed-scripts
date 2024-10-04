/**
 * This function generates a random string of a specified length. If no length is provided, it defaults to 32 characters. The string is composed of uppercase and lowercase letters, as well as numbers from 2 to 8. The characters 'I', 'O', and 'U' are excluded to avoid confusion with similar-looking characters.
 *
 * @param {number} [length] The length of the random string to generate. Defaults to 32 if not provided.
 * @return {*} The generated random string.
 */
const randomString = (length?: number) => {
  length = length || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
  for (var i = 0; i < length; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
};

export default randomString;