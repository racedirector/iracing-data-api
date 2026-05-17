#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import {
  MemberApi,
  Configuration,
  IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { parseCustomerIds } from "./schema";

async function fetchIRacingLink({
  link,
  expires,
}: Partial<IracingAPIResponse>) {
  if (!expires) return;

  if (new Date() >= expires) {
    throw new Error("Data is expired. Try fetching again.");
  }

  if (link) {
    const response = await fetch(link);
    return await response.json();
  }
}

const program = new Command("driver-lookup")
  .description(
    "Looks up an array of drivers to fetch their Driver Name, Driver ID, and Road iRating.",
  )
  .requiredOption(
    "--customer-ids <ids>",
    "Comma-separated customer IDs to fetch",
    parseCustomerIds,
  )
  .requiredOption("-t, --token <token>", "Authorization token")
  .action(async (_, command) => {
    const { customerIds, token } = command.optsWithGlobals();

    const authConfig = new Configuration({
      accessToken: token,
    });

    const api = new MemberApi(authConfig);

    const members = await api.getMember({
      cust_ids: customerIds,
      include_licenses: true,
    });

    const data = await fetchIRacingLink(members);

    console.log(data);
  });

program.parse();
