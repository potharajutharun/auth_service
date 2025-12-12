import crypto from "crypto";
function ranToken() {
  return crypto.randomBytes(256).toString("hex");
}

export default ranToken;
