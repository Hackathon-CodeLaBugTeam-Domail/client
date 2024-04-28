export default async (req, res) => {
  const cid = req.body.backupData; // Assuming `cid` is passed as a query parameter.
  // console.log("CID: ", cid);

  try {
    const response = await fetch(`https://api.tatum.io/v3/ipfs/${cid}`, {
      method: "GET", // GET is the default method, this line is just for clarity.
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from IPFS, status: ${response.status}`
      );
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
