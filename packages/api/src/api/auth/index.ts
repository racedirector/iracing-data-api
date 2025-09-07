import { NetworkClientProvider } from "../types";
import { hashPassword } from "../../util";
import assert from "node:assert";

export class AuthAPI extends NetworkClientProvider {
  async auth({
    username,
    password,
    hashedPassword,
  }: {
    username: string;
    password?: string;
    hashedPassword?: string;
  }) {
    assert(
      password || hashedPassword,
      "`password` or `hashedPassword` is required."
    );

    let normalizedPassword = hashedPassword;
    if (!normalizedPassword) {
      if (password) {
        normalizedPassword = await hashPassword(username, password);
      } else {
        throw new Error("`password` is missing.");
      }
    }

    return this.client.post("/auth", {
      email: username,
      password: normalizedPassword,
    });
  }
}

export default AuthAPI;
