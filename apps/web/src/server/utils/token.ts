import crypto from "crypto";

export function generateToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}
