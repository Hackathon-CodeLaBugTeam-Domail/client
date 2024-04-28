// Hàm mã hóa dữ liệu sang base64
function encodeToBase64(data) {
  return Buffer.from(data).toString("base64");
}

// Hàm giải mã dữ liệu từ base64
function decodeFromBase64(data) {
  return Buffer.from(data, "base64").toString("utf8");
}

export { encodeToBase64, decodeFromBase64 };