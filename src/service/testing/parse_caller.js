import { parseFile } from "../express_parser.js";

/**
 * Call `parseFile` with a filename and return the JSON string of routes
 * @param {string} filename - path to the file to parse
 * @returns {Promise<string>} - JSON string representing extracted routes
 */
export async function callParse(filename) {
  if (!filename) throw new Error("filename is required");

  // express parser
  const jsonString = await parseFile(filename);

  return jsonString;
}
