import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import Widget from "../components/widget";
import Head from "next/head";
import Feed from "../components/feed";
import styled from "styled-components";
import Header from "../components/header";
import { useDispatch, useSelector } from "react-redux";
import SendEmail from "../components/sendMail";
import { selectSendMail } from "../features/sendMail/sendMailSlice";
import {
  setLogInState,
  setLogOutState,
  selectUser,
} from "../features/user/userSlice";
import { _encryptMessage, _decryptMessage } from "../encrypt/encrypted";
import { encodeToBase64, decodeFromBase64 } from "../encrypt/convertToBase64";
import { set } from "react-hook-form";
import { get } from "http";
import IndividualMail from "../components/individualMail";

const HomePage = () => {
  const dispatch = useDispatch();
  const router = useRouter(); // Sử dụng useRouter để có thể chuyển hướng
  const user = useSelector(selectUser);
  const [choice, setChoice] = useState("inbox"); // Lựa chọn mặc định là "inbox"
  const [mailShow, setMailShow] = useState([]); // Mảng mail sẽ hiển thị tùy theo lựa chọn [inbox, sent
  const [mailSent, setMailSent] = useState([]);
  const [mailInbox, setMailInbox] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isShowMailDetail, setIsShowMailDetail] = useState(false);
  const showCompose = useSelector(selectSendMail);

  function handleSetChoice(value) {
    setChoice(value);
    setIsShowMailDetail(false);
    // console.log(choice);
  }

  // Utility function to fetch data from API
  async function fetchDataFromAPI(apiUrl, bodyContent) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyContent),
    });

    if (!response.ok) {
      if (response.status === 500) {
        return fetchDataBackup(); // Assuming fetchDataBackup() is defined
      }
      throw new Error("Failed to fetch data");
    }
    return await response.json();
  }

  // Function to decrypt messages
  // async function decryptMessages(
  //   data,
  //   privateKey,
  //   passphrase,
  //   publicKey = null,
  //   backup = null
  // ) {
  //   const privateKeyDecoded = decodeFromBase64(privateKey);
  //   const passphraseDecoded = decodeFromBase64(passphrase);

  //   return Promise.all(
  //     data.map(async (item) => {
  //       let publicKeyDecoded;
  //       if (publicKey) {
  //         publicKeyDecoded = decodeFromBase64(publicKey);
  //       } else if (backup) {
  //         publicKeyDecoded = decodeFromBase64(item.publicKey);
  //       } else {
  //         publicKeyDecoded = decodeFromBase64(
  //           await fetchPublicKey(item.hns_domain)
  //         );
  //       }

  //       const messageDecoded = decodeFromBase64(item.message);
  //       const decryptedJson = await _decryptMessage(
  //         messageDecoded,
  //         publicKeyDecoded,
  //         privateKeyDecoded,
  //         passphraseDecoded
  //       );
  //       const decrypted = JSON.parse(decryptedJson);
  //       const timestamp = new Date(item.createdAt).getTime() / 1000;
  //       return {
  //         email: publicKey
  //           ? `To: ${decrypted.email}`
  //           : `From: ${item.hns_domain}`,
  //         subject: decrypted.subject,
  //         message: decrypted.message,
  //         timestamp: { seconds: timestamp },
  //       };
  //     })
  //   ).then((mails) => mails.reverse());
  // }
async function decryptMessages(
  data,
  privateKey,
  passphrase,
  publicKey = null,
  backup = null
) {
  const privateKeyDecoded = decodeFromBase64(privateKey);
  const passphraseDecoded = decodeFromBase64(passphrase);

  return Promise.all(
    data.map(async (item) => {
      try {
        let publicKeyDecoded;
        if (publicKey) {
          publicKeyDecoded = decodeFromBase64(publicKey);
        } else if (backup) {
          publicKeyDecoded = decodeFromBase64(item.publicKey);
        } else {
          publicKeyDecoded = decodeFromBase64(
            await fetchPublicKey(item.hns_domain)
          );
        }

        const messageDecoded = decodeFromBase64(item.message);
        const decryptedJson = await _decryptMessage(
          messageDecoded,
          publicKeyDecoded,
          privateKeyDecoded,
          passphraseDecoded
        );
        const decrypted = JSON.parse(decryptedJson);
        const timestamp = new Date(item.createdAt).getTime() / 1000;
        return {
          email: publicKey
            ? `To: ${decrypted.email}`
            : `From: ${item.hns_domain}`,
          subject: decrypted.subject,
          message: decrypted.message,
          timestamp: { seconds: timestamp },
        };
      } catch (error) {
        // Log error or handle it as needed
        console.error("Decryption failed for an item:", error);
        return null; // Return null if decryption fails
      }
    })
  ).then((mails) => mails.filter((mail) => mail !== null).reverse()); // Filter out nulls and reverse the array
}
  async function fetchMailSent() {
    try {
      const data = await fetchDataFromAPI("/api/getMailSent", {
        accessToken: localStorage.getItem("accessToken"),
      });
      const decryptedMails = await decryptMessages(
        data.data,
        localStorage.getItem("privateKey"),
        localStorage.getItem("passphrase"),
        localStorage.getItem("publicKey")
      );
      // console.log("Decrypted Mails:", decryptedMails);
      setMailSent(decryptedMails);
    } catch (error) {
      console.error("Error fetching sent mails:", error);
    }
  }

  async function fetchMailInbox() {
    try {
      const data = await fetchDataFromAPI("/api/getMailInbox", {
        accessToken: localStorage.getItem("accessToken"),
      });
      const decryptedMails = await decryptMessages(
        data.data,
        localStorage.getItem("privateKey"),
        localStorage.getItem("passphrase")
      );
      // console.log("Decrypted Mails:", decryptedMails);
      setMailInbox(decryptedMails);
    } catch (error) {
      console.error("Error fetching inbox mails:", error);
    }
  }

  const getBackupData = async () => {
    try {
      const response = await fetch("/api/getBackupData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: localStorage.getItem("accessToken"),
        }),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || "Failed to fetch public key");
      // console.log(responseData.cide_backup.ipfsHash);
      localStorage.setItem("backupData", responseData.cide_backup.ipfsHash);
      alert("Backup data successfully in local");
      return responseData;
    } catch (error) {
      console.error("Error fetching public key:", error);
      throw error; // Re-throw the error to handle it in the main function
    }
  };

function saveAllDataToTextFile() {
  const keysToSave = [
    "publicKey",
    "privateKey",
    "passphrase",
    "revocationCertificate",
    "hnsDomain",
    "backupData",
  ];
  let data = {};

  keysToSave.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      data[key] = value;
    }
  });

  if (Object.keys(data).length > 0) {
    const jsonStr = JSON.stringify(data, null, 2); // Beautify the JSON output
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    // Use hnsDomain as the filename if available, otherwise default to 'keyData.json'
    link.download = data.hnsDomain ? `${data.hnsDomain}.json` : "keyData.json";

    link.href = window.URL.createObjectURL(blob);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  } else {
    console.log("No relevant data found in localStorage");
  }
}

function importDataFromJsonFile() {
  // Create an input element to select files
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json"; // Accept only JSON files

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach((key) => {
          localStorage.setItem(key, data[key]);
        });
        alert("Data imported successfully into localStorage.");
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
        alert("Failed to import data. Invalid JSON format.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("An error occurred while reading the file.");
    };

    reader.readAsText(file); // Read the file as text
  };

  fileInput.click();
}


  const fetchPublicKey = async (email) => {
    try {
      const response = await fetch("/api/getPublicKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hns_domain: email,
          accessToken: localStorage.getItem("accessToken"),
        }),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || "Failed to fetch public key");
      // console.log(responseData.publicKey);
      return responseData.publicKey;
    } catch (error) {
      console.error("Error fetching public key:", error);
      throw error; // Re-throw the error to handle it in the main function
    }
  };

  const fetchDataBackup = async () => {
    // console.log("Calling alternative");
    try {
      const response = await fetch("/api/restoreData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backupData: localStorage.getItem("backupData"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch mail inbox");
      }
      // console.log(data);
      const dataMailReceive = data.mail_receive;
      const dataMailSent = data.mail_send;
      // console.log(dataMailReceive);
      // console.log(dataMailSent);
      // Assuming you have a decryption method to handle decryption of arrays of mail data
      const mailReceiveDecrypted = await decryptMessages(
        data.mail_receive.data,
        localStorage.getItem("privateKey"),
        localStorage.getItem("passphrase"),
        "",
        "backup"
      );
      const mailSendDecrypted = await decryptMessages(
        data.mail_send.data,
        localStorage.getItem("privateKey"),
        localStorage.getItem("passphrase"),
        localStorage.getItem("publicKey")
      );
      setMailInbox(mailReceiveDecrypted);
      setMailSent(mailSendDecrypted);
      // Process the data and set the state accordingly
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      dispatch(setLogInState({ token: accessToken }));

      // Chờ cả hai hàm fetch hoàn thành
      Promise.all([fetchMailSent(), fetchMailInbox()])
        .then(() => {
          // console.log("Both fetch operations finished.");
          // Tùy theo lựa chọn, hiển thị hộp thư đến hoặc đã gửi
          setMailShow(choice === "inbox" ? mailInbox : mailSent);
        })
        .catch((error) => {
          console.error("Error fetching emails:", error);
        });
    } else {
      dispatch(setLogOutState());
      router.push("/login");
    }
  }, [dispatch, reloadData, router]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      dispatch(
        setLogInState({
          token: accessToken,
        })
      );
    } else {
      dispatch(setLogOutState());
    }
  }, [dispatch]);
  useEffect(() => {
    // console.log(choice);
    setMailShow(choice === "inbox" ? mailInbox : mailSent);
  }, [choice, mailInbox, mailSent]);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Sử dụng router.push để chuyển hướng người dùng đến trang đăng nhập
    }
  }, [user, router]);
  function refreshData() {
    setReloadData(!reloadData);
  }
  if (!user) {
    return null; // Trả về null trong khi đợi chuyển hướng hoặc kiểm tra trạng thái người dùng
  }

  return (
    <div>
      <Head>
        <title>Domail</title>
        <meta
          name="description"
          content="Welcome to Domail - A product by Code La Bug Team"
        />
      </Head>
      <AppWrapper>
        <Header />
        <MinWrapper className="app-bod">
          <Sidebar
            allEmails={[mailInbox, mailSent]}
            setChoice={handleSetChoice}
            choice={choice}
          />
          {isShowMailDetail ? (
            <IndividualMail setIsShowMailDetail={setIsShowMailDetail} />
          ) : (
            <Feed
              allEmails={mailShow}
              reloadData={refreshData}
              backup={getBackupData}
              setIsShowMailDetail={setIsShowMailDetail}
              downData = {saveAllDataToTextFile}
              importData = {importDataFromJsonFile}
            />
          )}

          {/* <IndividualMail /> */}

          <Widget />
        </MinWrapper>
        {showCompose && <SendEmail />}
      </AppWrapper>
    </div>
  );
};

export default HomePage;

const MinWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  min-height: 85vh;
  width: 100%;
  border-left: 0;
`;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;
`;
