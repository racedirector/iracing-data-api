"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.handleOutput = handleOutput;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
// Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
async function hashPassword(email, password) {
    const value = password + email.toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await node_crypto_1.default.subtle.digest("SHA-256", data);
    return Buffer.from(hashBuffer).toString("base64");
}
function handleOutput(data, output) {
    if (output) {
        node_fs_1.default.writeFileSync(output, JSON.stringify(data, null, 2));
        console.log("Output written to", output);
    }
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}
