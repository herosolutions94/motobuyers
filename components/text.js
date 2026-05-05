// import { doParseHTML } from "../helpers/helpers"

// export default function Text({
// 	string = "default",
// 	length = false,
// 	parse = true,
// }) {
// 	return <span dangerouslySetInnerHTML={{ __html: string }} />
// }


import { doParseHTML } from "../helpers/helpers";

export default function Text({
  string = "default",
  length = false,
  parse = true
}) {
  if (length)
    if (string.length > length) string = string.slice(0, length) + "...";

  if (parse) string = doParseHTML(string);

  return string;
}
