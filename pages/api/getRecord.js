import { promisify } from "util";
import * as dns from "dns";

const resolveTxtAsync = promisify(dns.resolveTxt);

export default async function findTxtRecordDNS(req, res) {
  const hnsDomain = req.body.hns_domain; // Assuming domain is passed in the request body
  const machineId = req.body.code;
  // console.log("Check: ", hnsDomain, machineId);

  try {
    const records = await resolveTxtAsync(hnsDomain);
    // console.log("Records: ", records);
    const flattenedRecords = records.map((record) => record.join(""));

    // Check for machineId in the flattened records
    const match = flattenedRecords.find((record) => record.includes(machineId));
    if (match) {
      const refreshToken = generateToken(); // Pseudo-function: replace with your actual method to generate a token
      const accessToken = generateAccessToken(); // Pseudo-function: replace with your actual method to generate an access token
      res
        .status(200)
        .json({ message: "Successfully logged in", accessToken, refreshToken, hnsDomain });
    } else {
      res.status(404).json({ message: "No matching records found." });
    }
  } catch (error) {
    console.error("Error resolving DNS:", error);
    res.status(500).json({ message: `DNS query failed: ${error.message}` });
  }
}

// Example functions for token generation, replace with actual implementation
function generateToken() {
  // Generate or fetch a token
  return "generatedToken123";
}

function generateAccessToken() {
  // Generate or fetch an access token
  return "generatedAccessTokenXYZ";
}
