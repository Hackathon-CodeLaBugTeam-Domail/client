import { machineIdSync } from "node-machine-id";

export default function handler(req, res) {
  const id = machineIdSync();
  res.status(200).json({ id });
}
