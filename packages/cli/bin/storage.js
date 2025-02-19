"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONCookieStore = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const tough_cookie_1 = require("tough-cookie");
class JSONCookieStore extends tough_cookie_1.MemoryCookieStore {
    constructor(filePath) {
        super();
        Object.defineProperty(this, "_filePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._filePath = filePath;
        if (util_1.default.inspect.custom) {
            this[util_1.default.inspect.custom] = this.inspect;
        }
        this.idx = this.loadFromFile();
    }
    inspect() {
        return `{ idx: ${util_1.default.inspect(this.idx, false, 2)} }`;
    }
    saveToFile() {
        fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.idx));
    }
    loadFromFile() {
        let cookieData = null;
        let cookiesJSON = {};
        // If the file exists, load the raw data from the file path
        if (fs_1.default.existsSync(this.filePath)) {
            cookieData = fs_1.default.readFileSync(this.filePath, "utf8");
        }
        if (cookieData) {
            try {
                cookiesJSON = JSON.parse(cookieData);
            }
            catch (error) {
                throw new Error(`Could not parse cookie file at ${this.filePath}.`);
            }
        }
        for (const domainName in cookiesJSON) {
            for (const pathName in cookiesJSON[domainName]) {
                for (const cookieName in cookiesJSON[domainName][pathName]) {
                    cookiesJSON[domainName][pathName][cookieName] = tough_cookie_1.Cookie.fromJSON(JSON.stringify(cookiesJSON[domainName][pathName][cookieName]));
                }
            }
        }
        return cookiesJSON;
    }
    get filePath() {
        return this._filePath;
    }
    async putCookie(cookie) {
        await super.putCookie(cookie);
        this.saveToFile();
    }
    async updateCookie(oldCookie, newCookie) {
        await super.updateCookie(oldCookie, newCookie);
        this.saveToFile();
    }
    async removeCookie(domain, path, key) {
        await super.removeCookie(domain, path, key);
        this.saveToFile();
    }
    async removeCookies(domain, path) {
        await super.removeCookies(domain, path);
        this.saveToFile();
    }
    async removeAllCookies() {
        await super.removeAllCookies();
        this.saveToFile();
    }
}
exports.JSONCookieStore = JSONCookieStore;
