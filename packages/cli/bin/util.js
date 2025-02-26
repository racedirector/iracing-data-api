"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOutput = handleOutput;
const node_fs_1 = __importDefault(require("node:fs"));
/**
 * Logs the data to the console or writes it to a file.
 * @param data The data to be output
 * @param output The path of the file to write the data to
 */
function handleOutput(data, output) {
    if (output) {
        node_fs_1.default.writeFileSync(output, JSON.stringify(data, null, 2));
        console.log("Output written to:", output);
    }
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}
