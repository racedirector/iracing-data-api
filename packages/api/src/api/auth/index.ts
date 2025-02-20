import { NetworkClientProvider } from "../types";

export class AuthAPI extends NetworkClientProvider {
  auth({ username, password }: { username: string; password: string }) {
    return this.client.post("/auth", {
      email: username,
      password: password,
    });
  }
}

export default AuthAPI;
