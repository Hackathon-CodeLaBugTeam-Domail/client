import styled from "styled-components";
import React, { memo, useRef, useState } from "react";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import CreateIcon from "@material-ui/icons/Create";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import FormatColorTextIcon from "@material-ui/icons/FormatColorText";
import InsertLinkIcon from "@material-ui/icons/InsertLink";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import DeleteIcon from "@material-ui/icons/Delete";
import RemoveIcon from "@material-ui/icons/Remove";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {
  _encryptMessage,
  _decryptMessage,
  _decryptMessageTest,
} from "../encrypt/encrypted";
import { useForm } from "react-hook-form";
import { encodeToBase64, decodeFromBase64 } from "../encrypt/convertToBase64";
import ReactLoading from "react-loading";

// import {
// 	addDoc,
// 	collection,
// 	onSnapshot,
// 	orderBy,
// 	query,
// 	limit,
// 	serverTimestamp,
// } from '@firebase/firestore'

import { useDispatch, useSelector } from "react-redux";
import { setHideComposeState } from "../features/sendMail/sendMailSlice";
// import { db } from '../config/firebase'
import { MessageType } from "../types";

const SendEmail = () => {
  const [status, setStatus] = useState("idle");
  const dispatch = useDispatch();

  const closeCompose = () => {
    dispatch(setHideComposeState());
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to fetch public key
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
  // Function to fetch keys and encrypt the message
  const prepareMessage = async (data) => {
    try {
      const privateKey = localStorage.getItem("privateKey");
      const publicKeyA = localStorage.getItem("publicKey");
      const passphrase = localStorage.getItem("passphrase");
      // console.log("passphrase: ", decodeFromBase64(passphrase));
      if (!privateKey) {
        alert("No private key found. Please login again.");
        return null;
      }
      const publicKey = await fetchPublicKey(data.email);
      const messageSent = await _encryptMessage(
        JSON.stringify(data),
        decodeFromBase64(publicKey),
        decodeFromBase64(privateKey),
        decodeFromBase64(passphrase)
      );
      const messageSentPrivate = await _encryptMessage(
        JSON.stringify(data),
        decodeFromBase64(publicKeyA),
        decodeFromBase64(privateKey),
        decodeFromBase64(passphrase)
      );
      // console.log("Encrypted message:", messageSent);
      // console.log("Encrypted message private:", messageSentPrivate);
      return [messageSent, messageSentPrivate];
    } catch (error) {
      console.error("Error in message preparation:", error);
      alert("Domain is not valid");
      setStatus("idle");
      return null;
    }
  };

  // Function to send the encrypted message
  const sendMessage = async (email, encryptedMessage) => {
    try {
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hns_domain: email,
          encryptMessage: encryptedMessage[0],
          encryptMessagePrivate: encryptedMessage[1],
          accessToken: localStorage.getItem("accessToken"),
        }),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || "Failed to send mail");
      // console.log(responseData);
      return responseData;
    } catch (error) {
      console.error("Error sending mail:", error);
      throw error; // Re-throw the error to handle it in the main function
    }
  };

  // Original onSubmit refactored to use new functions
  const onSubmit = async (data) => {
    // console.log(data);
    setStatus("loading");
    try {
      const encryptedMessage = await prepareMessage(data);
      if (!encryptedMessage) return; // Stop if message encryption failed

      const message = await sendMessage(data.email, encryptedMessage);
      // console.log("Message sent:", message.message);
      alert(message.message);
      closeCompose(); // Presumably closes the message compose dialog
      setStatus("idle");
    } catch (error) {
      setStatus("idle");
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <SendMailWrapper>
      <div className="title">
        <span>New Message</span>
        <div>
          <RemoveIcon className="icon" />

          <AddIcon className="icon" />
          <CloseIcon className="icon" onClick={closeCompose} />
        </div>
      </div>
      {/* @ts-ignore */}
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <div className="emailInput-setup">
          {!errors.email && <span>Cc Bcs</span>}
          <label htmlFor="email"> </label>
          {errors.email && <p className="error">Enter valid domain</p>}
          <input
            type="text"
            id="email"
            style={{ borderColor: errors.email ? "red" : "" }}
            placeholder={errors.email ? "" : "Enter domain:"}
            {...register("email", {
              required: true,
              pattern: {
                value: /[.]/,
                message: "Input must contain a dot (representing a domain)",
              },
            })}
          />
        </div>

        <label htmlFor="subject: "></label>
        {errors.subject && <p className="error">Subject is required</p>}
        <input
          placeholder={errors.subject ? "" : "Subject:"}
          style={{ borderColor: errors.subject ? "red" : "" }}
          {...register("subject", { required: true })}
        />

        {errors.message && <p className="error">Message is required</p>}
        <textarea
          placeholder={errors.message ? "" : "Message:"}
          {...register("message", { required: true })}
          id="message"
          cols={30}
          rows={10}
        />

        <div className="buttons">
          <button
            className="button create-button"
            type="submit"
            name="submit"
            id="submit-form"
          >
            {status === "loading" ? (
              <ReactLoading type={"spin"} color="#fff" height={25} width={25}/>
            ) : (
              "Send"
            )}
            <ArrowDropDownIcon className="icon" type="submit" />
          </button>
          <div className="icons">
            <div className="left">
              <FormatColorTextIcon className="icon" />
              <AttachFileIcon className="icon" />
              <InsertLinkIcon className="icon" />
              <InsertEmoticonIcon className="icon" />
              <CheckBoxOutlineBlankIcon className="icon" />
              <LocalMallIcon className="icon" />

              <CreateIcon className="icon" />
            </div>
            <div className="right">
              <MoreVertIcon className="icon" />
              <DeleteIcon className="icon" />
            </div>
          </div>
        </div>
      </form>
    </SendMailWrapper>
  );
};

export default memo(SendEmail);
const SendMailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
  max-width: 32.75rem;
  width: 95%;
  min-height: 32.75rem;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin: auto;
  border-radius: 0.375rem;
  position: absolute;
  bottom: 0;
  margin: 0 auto;
  right: 50%;
  transform: translatex(50%);

  @media (max-width: 568px) {
    width: 90%;
    max-width: 90%;
    margin: 0 auto;
  }

  .title {
    background: #404040;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;

    .icon {
      margin-left: 1rem;
      cursor: pointer;
    }
  }

  form {
    flex: 1;
    width: 100%;
    min-height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: transparent;

    input {
      display: inline-flex;
      font-size: 1rem;
      height: 2.6em;
      justify-content: flex-start;
      line-height: normal;
      padding: 0.5rem;
      align-items: center;
      background-color: #fff;
      width: 100%;
      border: none;
      border-bottom: 1px solid #a6a6a6;
      margin-bottom: 1rem;
      transition: 0.3s;

      &:focus {
        outline: none;
        border-bottom: 1px solid #e0d4fd;
      }
    }

    textarea {
      flex: 1;
      height: 100%;
      font-size: 1rem;
      padding: 0.5rem;
      width: 100%;
      background: #ffffff;
      resize: none;
      border: none;
      outline: none;
    }
  }

  &:hover {
    border: 1px solid #043340;
  }

  .buttons {
    display: flex;
    align-items: center;

    button {
      display: flex;
      align-items: center;
      height: 2.5em;
      width: 8rem;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      padding: 0 1rem;
      justify-content: space-around;
      background: #1a73e8;
      border: 1px solid #1a73e8;
      transition: 0.3s;
      border-radius: 0.3rem;
    }

    button:hover {
      background: rgba(26, 115, 232, 0.8);
    }
  }

  .icons {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 568px) {
      display: none;
    }

    .icon {
      font-size: 1.3rem;
      margin-left: 1rem;
      cursor: pointer;
    }

    .left {
      display: flex;
      align-items: center;
    }
  }

  .error {
    width: 100%;
    padding: 0.3rem;
    padding-bottom: -1rem;
    color: red;
    text-align: right;
  }

  .emailInput-setup {
    position: relative;

    span {
      position: absolute;
      left: 0;
      width: 100%;
      top: 8px;
      text-align: left;
      left: 86%;
      padding-right: 5px;
      font-size: 0.9rem;
      color: gray;
    }
  }
`;
