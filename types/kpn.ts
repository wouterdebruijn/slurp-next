export type KPNObject = {
  n:
    | "latitude"
    | "longitude"
    | "radius"
    | "locAccuracy"
    | "locPrecision"
    | "locTime"; // name
  u: "lat" | "lon" | "m" | "%" | "s"; // unit
  v: unknown; // value
};

export type KPNPayload = {
  bn: string; // base name
  bt: number; // base time
  n: "locOrgin" | "payload"; // name
  vs: string; // value string
};

export type KPNBody = [KPNPayload, ...KPNObject[]];
