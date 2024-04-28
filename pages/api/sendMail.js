export default async (req, res) => {
  const response = await fetch(`${process.env.API_URL}/users/send-mail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${req.body.accessToken}`,
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
};
