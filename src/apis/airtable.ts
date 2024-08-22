import axios from "axios";

import {
  AIRTABLE_BASE_ID,
  ANNOUNCEMENT_TABLE_ID,
  CONVERSATION_TABLE_ID,
  AIRTABLE_API_KEY,
} from "../config";

// I am aware there is an Airtable library, but this is just easier to do now and requries installing nothing.

interface AirtableCreateRecordArgs {
  baseId: string;
  tableId: string;
  fields: object;
}
async function airtableCreateRecord({
  baseId,
  tableId,
  fields,
}: AirtableCreateRecordArgs) {
  try {
    const response = await axios({
      method: "POST",
      url: `https://api.airtable.com/v0/${baseId}/${tableId}`,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        records: [{ fields }],
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

interface AirtableUpdateRecordArgs {
  baseId: string;
  tableId: string;
  recordId: string;
  fields: object;
}
async function airtableUpdateRecord({
  baseId,
  tableId,
  recordId,
  fields,
}: AirtableUpdateRecordArgs) {
  try {
    const response = await axios({
      method: "PATCH",
      url: `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: { fields },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

interface ConversationRecord {
  convo_id: string;
  question?: string;
  answer: string;
  user_id: string;
  end_type: string;
  end_reason: string;
  answer_score: string;
  time_asked: number;
  time_answered: number;
  slack_permalink: string;
  vf_transcript: string;
  channel: string;
}
async function createConversationRecord(newRecord: ConversationRecord) {
  const response = await airtableCreateRecord({
    baseId: AIRTABLE_BASE_ID,
    tableId: CONVERSATION_TABLE_ID,
    fields: {
      ...newRecord,
      question: newRecord.question ?? "",
    },
  });
  return response?.data.records[0].id as string;
}

async function updateConversationSatisfaction(
  recordID: string,
  satisfaction: string
) {
  const response = await airtableUpdateRecord({
    baseId: AIRTABLE_BASE_ID,
    tableId: CONVERSATION_TABLE_ID,
    recordId: recordID,
    fields: {
      user_satisfaction: satisfaction,
    },
  });

  return response?.data?.fields;
}

interface AnnouncementRecord {
  announcement_ts: string;
  body: string;
  user_id: string;
  document_id: string;
  status: string;
  method: string;
}
async function createAnnouncementRecord(newRecord: AnnouncementRecord) {
  const response = await airtableCreateRecord({
    baseId: AIRTABLE_BASE_ID,
    tableId: ANNOUNCEMENT_TABLE_ID,
    fields: newRecord,
  });
  return response?.data.records[0].id as string;
}

export {
  createConversationRecord,
  updateConversationSatisfaction,
  createAnnouncementRecord,
};
