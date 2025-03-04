import http from "http";
import { SIM_STATUS_URI } from "../constants";

export const getSimStatus = async () =>
  new Promise((resolve, reject) => {
    http
      .get(SIM_STATUS_URI, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (typeof data !== "string") {
            reject(new Error("Invalid payload"));
          }

          resolve(data.includes("running:1"));
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
