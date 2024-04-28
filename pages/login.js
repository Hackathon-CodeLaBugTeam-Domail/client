import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, TextField, Box } from "@material-ui/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { genKey } from "../encrypt/genKey";
import { encodeToBase64, decodeFromBase64 } from "../encrypt/convertToBase64";
import { CopyToClipboard } from "react-copy-to-clipboard";

const LogIn = () => {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [machineId, setMachineId] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [password, setPassword] = useState(""); // New state for password
  const [sendKey, setSendKey] = useState(false);

  useEffect(() => {
    fetch("/api/machineId")
      .then((response) => response.json())
      .then((data) => setMachineId(data.id));
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      router.push("/");
    }
  }, [router]);

  const signInWithDomain = async () => {
    const addDomain = async () => {
      try {
        const response = await fetch("/api/addDomain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hns_domain: domain,
            code: machineId,
          }),
        });
        const data = await response.json();
        if (data.error) {
          alert("server under maintenance,switch  to local");
          try {
            const response = await fetch("/api/getRecord", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                hns_domain: domain,
                code: machineId,
              }),
            });
            const dataRecord = await response.json();
            // console.log(dataRecord);
            if (dataRecord.message === "Successfully logged in") {
              localStorage.setItem("hnsDomain", dataRecord.hnsDomain);
              localStorage.setItem("accessToken", dataRecord.accessToken);
              localStorage.setItem("refreshToken", dataRecord.refreshToken);
              // console.log(dataRecord);
              alert("Login successfully");
              router.push("/");
            } else {
              alert("Login failed");
            }
            return;
          } catch (error) {
            console.error(error);
            return;
          }
        }
        setMessage(data.message);
        if (data.message === "Successfully logged in") {
          localStorage.setItem("hnsDomain", data.data.hns_domain);
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          router.push("/");
        } else if(data.message === "You are currently logged in on another device"){
          setCode(data.data.code);
          setShowVerifyButton(true);
          setSendKey(false);
        }
        else{
          setSendKey(true);
          setCode(data.data.code);
          setShowVerifyButton(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    await addDomain();
  };

  const handleInputChange = (event) => {
    setDomain(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value); // Update password state on change
  };

  const handleVerify = async () => {
    if(sendKey){
    const { privateKey, publicKey, revocationCertificate } = await genKey(
      domain,
      `${domain}@codelabug.com`,
      password // Use state variable instead of parameter
    );
    localStorage.setItem("publicKey", encodeToBase64(publicKey));
    localStorage.setItem("privateKey", encodeToBase64(privateKey));
    localStorage.setItem(
      "revocationCertificate",
      encodeToBase64(revocationCertificate)
    );
    localStorage.setItem("passphrase", encodeToBase64(password));
    }

    const publicKeyToSend = sendKey?localStorage.getItem("publicKey"):"";

    const verifyDomain = async () => {
      try {
        const response = await fetch("/api/verifyDomain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hns_domain: domain,
            code: machineId,
            publicKey: publicKeyToSend,
          }),
        });
        const data = await response.json();
        if (data.message === "Successfully logged in") {
          localStorage.setItem("hnsDomain", data.data.hns_domain);
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);

          router.push("/");
        } else {
          alert(data.message);
        }
        setMessage(data.message);
      } catch (error) {
        console.error(error);
      }
    };

    await verifyDomain();
  };

  return (
    <LoginWrapper>
      <LoginContainer>
        <div
          className="logo"
          style={{ position: "relative", cursor: "pointer", margin: "auto" }}
        >
          <Image
            className="logo-img"
            src="/images/logo_team.png"
            alt="logo"
            layout="fill"
            objectFit="contain"
            priority={true}
          />
        </div>

        <LoginText style={{ marginTop: "15px" }}>
          <h2>Sign in to Domail</h2>
          {message && <p>{message}</p>}
          {code && (
            <CopyToClipboard text={code}>
              <p>Please add this txt record to your domain: {code}</p>
            </CopyToClipboard>
          )}
        </LoginText>

        <Box
          component="form"
          sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
          noValidate
          autoComplete="off"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            id="outlined-basic"
            label="Enter your domain"
            variant="outlined"
            value={domain}
            onChange={handleInputChange}
            style={{ marginTop: "20px" }}
          />
          {showVerifyButton && (
            <>
              {sendKey && (
                <TextField
                  id="password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  variant="outlined"
                  value={password}
                  onChange={handlePasswordChange}
                />
              )}

              <Button onClick={handleVerify}>Verify</Button>
            </>
          )}
        </Box>
        {!showVerifyButton && (
          <Box style={{ display: "flex" }}>
            <Button onClick={signInWithDomain}>Add domain</Button>
            <Button onClick={signInWithDomain} style={{ marginLeft: "10px" }}>
              Add hns domain
            </Button>
          </Box>
        )}
      </LoginContainer>
    </LoginWrapper>
  );
};

export default LogIn;

const LoginWrapper = styled.div`
  display: grid;
  background: #f8f8f8;
  width: 100vw;
  height: 100vh;
  place-items: center;
`;

const LoginContainer = styled.div`
  .logo {
    width: 7.62rem;
    height: 7rem;
    margin-left: 1.5rem;
    margin-bottom: 2rem;
  }
  padding: 100px;
  padding-top: 50px;
  text-align: center;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  button {
    margin-top: 50px;
    text-transform: inherit !important;
    background-color: #0a8f48;
    border-color: #0a8f48;
    color: white;
    font-size: 17px;
    transition: 0.5;
    padding: 0.7rem 1rem;
  }
  button:hover {
    background-color: #075e54;
    border-color: #075e54;
  }
`;

const LoginText = styled.div``;
