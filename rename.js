const replaceAll = (str, search, replacement) =>
  str.replaceAll(search, replacement);
const replaceFirst = (str, search, replacement) =>
  str.replace(search, replacement);
 
const replaceLast = (str, search, replacement) => {
  const i = str.lastIndexOf(search);
  if (i === -1) return str;
  return str.slice(0, i) + replacement + str.slice(i + search.length);
};
 
const replaceRegex = (str, pattern, replacement, flags = "g") =>
  str.replace(new RegExp(pattern, flags), replacement);

// Add Text
const addToEnd = (str, text) => str + text;
 
const addToStart = (str, text) => text + str;
const addAtIndex = (str, text, index) =>
  str.slice(0, index) + text + str.slice(index);
// Add Sequence
const addSequence = (
  strings,
  { start = 1, step = 1, padding = 0, position = "end", prefix = "", suffix = "" } = {}
) =>
  strings.map((str, i) => {
    const n = (start + i * step).toString().padStart(padding, "0");
    const seq = prefix + n + suffix;
    return position === "start" ? seq + str : str + seq;
  });


// Change Case
const toUpper = str => str.toUpperCase();
 
const toLower = str => str.toLowerCase();

const toSentence = str =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const rename = {
	toUpper,
	toLower,
	toSentence,
	addSequence,
	addAtIndex,
	addToEnd,
	addToStart,
	replaceAll,
	replaceFirst,
	replaceLast,
	replaceRegex,
}
// add camel ans snake case for funsies
