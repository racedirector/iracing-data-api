import fs from "fs";
import util from "util";
import {
  Cookie,
  MemoryCookieStore,
  MemoryCookieStoreIndex,
} from "tough-cookie";

export class JSONCookieStore extends MemoryCookieStore {
  private _filePath: string;

  constructor(filePath: string) {
    super();
    this._filePath = filePath;
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
    this.idx = this.loadFromFile();
  }

  private inspect() {
    return `{ idx: ${util.inspect(this.idx, false, 2)} }`;
  }

  private saveToFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.idx));
  }

  private loadFromFile(): MemoryCookieStoreIndex {
    let cookieData: string | null = null;
    let cookiesJSON = {};

    // If the file exists, load the raw data from the file path
    if (fs.existsSync(this.filePath)) {
      cookieData = fs.readFileSync(this.filePath, "utf8");
    }

    if (cookieData) {
      try {
        cookiesJSON = JSON.parse(cookieData);
      } catch (error) {
        throw new Error(`Could not parse cookie file at ${this.filePath}.`);
      }
    }

    for (const domainName in cookiesJSON) {
      for (const pathName in cookiesJSON[domainName]) {
        for (const cookieName in cookiesJSON[domainName][pathName]) {
          cookiesJSON[domainName][pathName][cookieName] = Cookie.fromJSON(
            JSON.stringify(cookiesJSON[domainName][pathName][cookieName])
          );
        }
      }
    }

    return cookiesJSON;
  }

  get filePath() {
    return this._filePath;
  }

  override async putCookie(cookie: Cookie): Promise<void> {
    await super.putCookie(cookie);
    this.saveToFile();
  }

  override async updateCookie(
    oldCookie: Cookie,
    newCookie: Cookie
  ): Promise<void> {
    await super.updateCookie(oldCookie, newCookie);
    this.saveToFile();
  }

  override async removeCookie(
    domain: string,
    path: string,
    key: string
  ): Promise<void> {
    await super.removeCookie(domain, path, key);
    this.saveToFile();
  }

  override async removeCookies(domain: string, path: string): Promise<void> {
    await super.removeCookies(domain, path);
    this.saveToFile();
  }

  override async removeAllCookies(): Promise<void> {
    await super.removeAllCookies();
    this.saveToFile();
  }
}
