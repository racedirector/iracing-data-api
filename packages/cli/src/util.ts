import fs from "node:fs";
/**
 * Logs the data to the console or writes it to a file.
 * @param data The data to be output
 * @param output The path of the file to write the data to
 */
export function handleOutput(data: object, output?: string) {
  if (output) {
    fs.writeFileSync(output, JSON.stringify(data, null, 2));
    console.log("Output written to:", output);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
