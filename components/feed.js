import React from "react";
import styled from "styled-components";
import { IconButton } from "@material-ui/core";
import RefreshRoundedIcon from "@material-ui/icons/RefreshRounded";
import MoreVertRoundedIcon from "@material-ui/icons/MoreVertRounded";
import ArrowDropDownRoundedIcon from "@material-ui/icons/ArrowDropDownRounded";
import CropLandscapeRoundedIcon from "@material-ui/icons/CropLandscapeRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import KeyboardRoundedIcon from "@material-ui/icons/KeyboardRounded";
import BackupIcon from "@material-ui/icons/Backup";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import InboxIcon from "@material-ui/icons/Inbox";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import LocalOfferRoundedIcon from "@material-ui/icons/LocalOfferRounded";
// @ts-ignore
import Fade from "react-reveal/Fade";

import Email from "./email";
import { MessageType } from "../types";

// type Props = {
// 	allEmails: MessageType[]
// }

const Feed = ({ allEmails, reloadData, backup, setIsShowMailDetail, downData,importData }) => {
  function onClick() {
    reloadData();
  }
  function backupData() {
    backup();
    // console.log("Backup data");
  }
  function downLoadData() {
    downData();
  }
  function importDataFromLocal() {
    importData();
    // console.log("Import data");
  }
  return (
    <FeedWrapper>
      <div className="head">
        <div className="head-left">
          <IconButton>
            <CropLandscapeRoundedIcon className="icon-head" />
          </IconButton>

          <IconButton>
            <div onClick={onClick}>
              <RefreshRoundedIcon className="icon-head" />
            </div>
          </IconButton>

          <IconButton>
            <ArrowDropDownRoundedIcon className="icon-head" />
          </IconButton>

          <IconButton>
            <MoreVertRoundedIcon className="icon-head" />
          </IconButton>
        </div>
        <div className="head-right">
          <IconButton>
            <div onClick={backupData}>
              <BackupIcon className="icon-head" />
            </div>
          </IconButton>

          <IconButton>
            <div onClick={downLoadData}>
              <CloudDownloadIcon className="icon-head" />
            </div>
          </IconButton>
          <IconButton>
            <div onClick={importDataFromLocal}>
              <SystemUpdateAltIcon className="icon-head" />
            </div>
          </IconButton>
        </div>
      </div>

      {/* Emails */}
      {allEmails?.map(({ id, email, subject, message, timestamp }) => {
        return (
          <Fade bottom key={id}>
            <Email
              subject={subject}
              date={
                timestamp && timestamp?.seconds
                  ? new Date(timestamp.seconds * 1000).toUTCString()
                  : new Date().toUTCString()
              }
              name={email}
              message={`${subject} - ${message}`}
              setIsShowMailDetail={setIsShowMailDetail}
            />
          </Fade>
        );
      })}
    </FeedWrapper>
  );
};

export default Feed;
const FeedWrapper = styled.div`
  padding: 1rem 0;
  flex: 1;
  max-height: 100vh;
  overflow-x: hidden !important;
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.2rem 1rem;
    padding-left: 0;
    border-bottom: 1px solid rgba(220, 227, 232);
    font-size: 0.9rem;
    min-width: 33rem;
    .icon-head {
      font-size: 1.2rem !important;
    }
  }
  .content-heading {
    @media (max-width: 568px) {
      display: none;
    }
    display: flex;
    align-items: center;
    justify-content: space-between;
    .heading {
      transition: 0.3s;
      width: 16rem;
      display: flex;
      align-items: center;
      margin-right: 0 1rem;
      p {
        border: 0.1px solid #188038;
        margin-left: 2rem;
        padding: 4px 7px;
        border-radius: 3px;
        min-width: 4.3rem;
        max-height: 2.2rem;
      }
      &:hover {
        background: rgba(220, 227, 232);
      }
    }
    .content-heading__promotion {
      color: #188038;
      border-bottom: 2px solid #188038;
      .icon-heading {
        color: #188038;
      }
      p {
        border: 0.1px solid #188038;
      }
    }
    .content-heading__social {
      color: #1a73e8;
      border-bottom: 2px solid #1a73e8;
      .icon-heading {
        color: #1a73e8;
      }
      p {
        border: 0.1px solid #1a73e8;
      }
    }
    .content-heading__primary {
      color: #ea4335;
      border-bottom: 2px solid #ea4335;
      .icon-heading {
        color: #ea4335;
      }
    }
  }
`;
