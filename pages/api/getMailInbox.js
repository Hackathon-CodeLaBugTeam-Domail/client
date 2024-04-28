export default async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/domain-transfer/user/receive`,
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
