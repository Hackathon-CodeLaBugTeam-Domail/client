
const openpgp = require("openpgp");
const { encodeToBase64, decodeFromBase64 } = require("./convertToBase64");

// sinh ra key
async function genKey() {
  const data = {
    userIDs: [{ name: "Jon Smith", email: "ok@test.com" }],
    passphrase: "12345",
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


async function getPrivateKey(armoredText, passphrase) {
  const privateKeyA = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: armoredText,
    }),
    passphrase: passphrase,
  });
  return privateKeyA;
}
async function _encryptMessage(
  messageText,
  publicKeyReceiver,
  privateKeySender,
  passphraseSender
) {
  const message = await openpgp.createMessage({ text: messageText });
  const publicKeyB = await openpgp.readKey({ armoredKey: publicKeyReceiver });
  const privateKeyA = await getPrivateKey(privateKeySender, passphraseSender);
  // console.log("check: ",passphraseSender)
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKeyB,
    signingKeys: privateKeyA,
  });
  // console.log("encrypted: ", encodeToBase64(encrypted));
  return encodeToBase64(encrypted);
}

async function _decryptMessage(
  encryptedText,
  publicKeyB,
  privateKeyA,
  passphraseA
) {
  const _publicKeyB = await openpgp.readKey({ armoredKey: publicKeyB });
  const _privateKeyA = await getPrivateKey(privateKeyA, passphraseA);
  const message = await openpgp.readMessage({
    armoredMessage: encryptedText,
  });
  const { data: decrypted, signatures } = await openpgp.decrypt({
    message,
    verificationKeys: _publicKeyB,
    decryptionKeys: _privateKeyA,
  });
  // console.log("decrypted: ", decrypted);
  try {
    await signatures[0].verified; // throws on invalid signature
    // console.log("B check đúng chữ ký của A");
  } catch (e) {
    throw new Error("B không check đc chữ ký: " + e.message);
  }
  return decrypted;
}
module.exports = {
  _encryptMessage,
  _decryptMessage,
};