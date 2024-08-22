# Goose Guide Bot

A Voiceflow-powered AI chat agent to help hackers get answers to their questions quickly and accurately! Open sourced as of Hack the North 2024 on Wednesday, Auguest 21st, 2024.

## Features

- Answers questions about Hack the North in a dedicated Slack channel or in DMs using a knowledge base with documents, FAQs, and more.
- Automatically categorizes and scores the quality of the answers.
- Allows users to submit feedback or ask for further help with buttons.
- Pulls real-time schedule information from the Hack the North's HackerAPI to answer questions about events, workshops, and more.
- Organizers can update the knowledge base by sending information to a private channel or in public announcements.
- Posts monitoring messages to a Slack channel to track the bot's activity and performance.
- Stores analytics and logs in Airtable for further analysis.

## Setup

Node 20+ is required.

### Code

1. Clone the repo.
2. Copy `.env.template` to `.env`.
3. Run `npm install`.
4. Create [a new Slack bot](#slack-bot) and set any secrets in your `.env` file.
5. Create [a new Voiceflow project](#voiceflow) and set any secrets in your `.env` file.
6. Create [a new Airtable base](#airtable) and set any secrets in your `.env` file.
7. Run `npm start` to start the bot.

You can also use the provided Dockerfile to run the bot in a container.

### Slack bot

1. Create a Slack bot based off the manifest `SlackBotManifest.json`. Enable socket mode.
2. Add the signing secret, bot token, and app token to `.env`.
3. Add the bot to your desired workspace.
4. Invite the bot to the below Slack channels and add their IDs to `.env`.
  - `QUESTIONS_CHANNEL`: the channel to monitor for questions from hackers
  - `ANNOUNCEMENTS_CHANNEL`: the channel to monitor for new knowledge from public announcements
  - `INSERT_KB_CHANNEL`: the channel to monitor for new knowledge from private messages
  - `MONITORING_CHANNEL`: the channel to output log messages
5. Choose maintainer pings and add their IDs to `.env`
  - `MAINTAINER_PING`: the user or user to ping when an organizer runs into an issue that requires technical intervention
  - `FAILED_ANSWER_PING`: the group to ping when the bot fails to answer a question
  - `EMERGENCY_PING`: the group to ping when the bot detects an emergency situation

When adding pings, make sure to set them with the `@` symbol in the `.env` for users, and the `!subteam^` syntax for groups.

### Voiceflow

1. Import the Voiceflow project `VoiceflowQnaAgent.vf` to your workspace. You might have to change the models used in some places because there are paid models selected.
2. Run the agent in the testing tool and then publish it.
3. Add the API key, project ID, and version ID to `.env`.

### Airtable

1. Create a new Airtable base and add its base ID to `.env` under `AIRTABLE_BASE_ID`.
2. Create a conversation table with the following fields and add its ID to `.env` under `CONVERSATION_TABLE_ID`:
  - `convo_id`
  - `question`
  - `answer`
  - `user_id`
  - `end_type`
  - `end_reason`
  - `answer_score`
  - `time_asked`
  - `time_answered`
  - `slack_permalink`
  - `vf_transcript`
  - `channel`
  - `user_satisfaction`
3. Create an announcements table with the following fields and add its ID to `.env` under `ANNOUNCEMENT_TABLE_ID`:
  - `announcement_ts`
  - `body`
  - `user_id`
  - `document_id`
  - `status`
  - `method`
4. Create a personal access token with read and write access to the tables and add it to `.env` under `AIRTABLE_API_KEY`.

## Knowledge Base

Any top-level messages in `ANNOUNCEMENTS_CHANNEL` or `INSERT_KB_CHANNEL` will be added to the knowledge base. You can only remove information through the Voiceflow project's knowledge section.

## Special thanks

Special thanks to [Voiceflow](https://www.voiceflow.com/) for partnering with Hack the North to build this project.

<img src="voiceflow.png" alt="Voiceflow" style="max-width: 400px;">

## Cheers

Built with ❤️ by Alex Aumais with the help of the rest of the Hack the North and Voiceflow teams.
