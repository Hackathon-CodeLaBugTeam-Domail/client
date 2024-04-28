// import { promisify } from "util";
// import * as dns from "dns";
// import {
//   encodeToBase64,
//   decodeFromBase64,
// } from "../../encrypt/convertToBase64";

// const resolveTxtAsync = promisify(dns.resolveTxt);

// export default async (req, res) => {
//   if (!req.body.hns_domain) {
//     res.status(400).json({ error: "hns_domain is required" });
//     return;
//   }

//   try {
//     const records = await resolveTxtAsync(req.body.hns_domain);
//     console.log("Records: ", records);
//     async function check () {

//     const flattenedRecords = records.map((record) => record.join(""));
//     console.log("Flattened Records: ", flattenedRecords);
//     // Decode each flattened record from base64 and filter for the PGP public key block
//     const publicKeys = flattenedRecords
//       .map(decodeFromBase64)
//       .filter((decodedText) =>
//         decodedText.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----")
//       );

//     // Check if any PGP public key blocks were found and respond accordingly
//     if (publicKeys.length > 0) {
//       console.log("Public Key: ", publicKeys[0]);
//       const publicKey = encodeToBase64(publicKeys[0]);
//             console.log("Public Key: ", publicKey);
//             console.log({ publicKey: publicKey });
//       res.status(200).json({ publicKey: publicKey });
//     } else {
//       console.log("No valid PGP public key found in TXT records.");
//       res
//         .status(404)
//         .json({ error: "No valid PGP public key found in TXT records." });
//     }
//     }

//   } catch (error) {
//     console.error("Error resolving DNS:", error);
//     res.status(500).json({ message: `DNS query failed: ${error.message}` });
//   }
// };
export default async (req, res) => {
  if (!req.body.hns_domain) {
    res.status(400).json({ error: "hns_domain is required" });
    return;
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/users/target-publickey?hns_domain=${req.body.hns_domain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.body.accessToken}`,
        },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data" });
  }
};