import {
  isComplete,
  isInProgress,
  PitServiceFlags,
} from "@iracing-data/telemetry-types";

const PitServiceLabels: Record<PitServiceFlags, string> = {
  [PitServiceFlags.lf_tire_change]: "LF Tire Change",
  [PitServiceFlags.rf_tire_change]: "RF Tire Change",
  [PitServiceFlags.lr_tire_change]: "LR Tire Change",
  [PitServiceFlags.rr_tire_change]: "RR Tire Change",
  [PitServiceFlags.fuel_fill]: "Fuel",
  [PitServiceFlags.windshield_tearoff]: "Tearoff",
  [PitServiceFlags.fast_repair]: "Fast Repair",
};

export function servicesForFlags(flags: number): string[] {
  return Object.entries(PitServiceLabels).flatMap(([bit, label]) =>
    (flags & Number(bit)) !== 0 ? [label] : [],
  );
}

export function updateServices(
  previous: number,
  current: number,
): {
  added: string[];
  removed: string[];
} {
  const servicesAdded = current & ~previous;
  const servicesCompleted = previous & ~current;
  return {
    added: servicesAdded ? servicesForFlags(servicesAdded) : [],
    removed: servicesCompleted ? servicesForFlags(servicesCompleted) : [],
  };
}

export function stringForPitServiceStatus(status) {
  if (isInProgress(status)) {
    return "in progress";
  } else if (isComplete(status)) {
    return "complete";
  }

  return "none";
}
