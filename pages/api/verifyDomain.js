export default async (req, res) => {
  // console.log("test", `${process.env.NEXT_PUBLIC_}/auth/add-domain`);
  const response = await fetch(
    `${process.env.API_URL}/auth/verify-domain`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
};
