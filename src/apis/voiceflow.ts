import axios from "axios";

import {
  VOICEFLOW_API_KEY,
  VOICEFLOW_PROJECT_ID,
  VOICEFLOW_VERSION_ID,
} from "../config";

import { delay } from "../utils/misc";

async function voiceflowInteract(userID: string, request: object) {
  const response = await axios({
    method: "POST",
    url: `https://general-runtime.voiceflow.com/state/user/${userID}/interact`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: VOICEFLOW_API_KEY,
    },
    data: {
      request,
    },
  });
  if (response.status === 200) {
    return response.data as [object];
  } else {
    console.error(response.data);
    return response.data;
  }
}

async function voiceflowSaveTranscript(userID: string) {
  const response = axios({
    method: "PUT",
    url: "https://api.voiceflow.com/v2/transcripts",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: VOICEFLOW_API_KEY,
    },
    data: {
      projectID: VOICEFLOW_PROJECT_ID,
      versionID: VOICEFLOW_VERSION_ID,
      sessionID: userID,
      device: "slackbot",
    },
  });
  return response;
}

async function voiceflowAddAnnouncementKB(announcement: string) {
  const announcement_id = Math.round(Math.random() * 1000000);

  const addResponse = await axios({
    method: "POST",
    url: "https://api.voiceflow.com/v1/knowledge-base/docs/upload/table", // make sure when setting up your project to create a tag for announcement
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: VOICEFLOW_API_KEY,
    },
    data: {
      data: {
        // this is sorta dumb that i have to put a data inside a data but whaaatever
        schema: {
          searchableFields: ["announcement"],
          metadataFields: ["time"],
        },
        name: `announcement-${announcement_id}`,
        items: [
          {
            announcement: announcement,
            time: `${new Date().getTime()}`,
          },
        ],
      },
    },
  });

  const documentID = addResponse.data.data.documentID;
  console.log("Saved announcement to KB", addResponse.status, documentID);

  let attempts = 0;
  const maxRetries = 5;
  let tagSuccess = false;

  while (!tagSuccess && attempts < maxRetries) {
    await delay(2000);

    try {
      const attachResponse = await axios({
        method: "POST",
        url: `https://api.voiceflow.com/v3alpha/knowledge-base/docs/${documentID}/tags/attach`, // make sure when setting up your project to create a tag for announcement
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: VOICEFLOW_API_KEY,
        },
        data: {
          data: {
            tags: ["announcement"],
          },
        },
      });

      if (attachResponse.status === 200) {
        console.log(
          `Succeeded to add tag for ${documentID} on attempt ${attempts}`
        );
        tagSuccess = true;
      } else {
        attempts++;
        if (attempts == maxRetries) {
          console.error(
            `Failed to add tag for ${documentID} after ${attempts} attempts, giving up`
          );
        } else {
          console.log(
            `Failed to add tag for ${documentID} on attempt ${attempts}`
          );
        }
      }
    } catch (error) {
      console.log("KB attach response error");
      attempts++;
      if (attempts == maxRetries) {
        console.error(
          `Failed to add tag for ${documentID} after ${attempts} attempts, giving up`
        );
      } else {
        console.log(
          `Failed to add tag for ${documentID} on attempt ${attempts}`
        );
      }
    }
  }

  return { addResponse, tagSuccess };
}

const makeTranscriptUrl = (transcriptID: string) => {
  return `https://creator.voiceflow.com/project/${VOICEFLOW_VERSION_ID}/transcripts/${transcriptID}`;
};

export {
  voiceflowInteract,
  voiceflowSaveTranscript,
  voiceflowAddAnnouncementKB,
  makeTranscriptUrl,
};
