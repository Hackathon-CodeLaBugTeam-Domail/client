const openpgp = require("openpgp");
async function genKey(name, email, passphrase) {
    // console.log("mmm: ",name, email,passphrase);
    const data = {
      userIDs: [{ name: name, email: email }],
      passphrase: passphrase,
    };
  const { privateKey, publicKey, revocationCertificate } =
    await openpgp.generateKey({
      type: data.type || "ecc",
      curve: data.curve || "curve25519",
      userIDs: data.userIDs,
      passphrase: data.passphrase,
      format: data.format || "armored",
    });
  return { privateKey, publicKey, revocationCertificate };
}
export { genKey };
