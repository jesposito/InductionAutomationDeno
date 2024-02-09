# Induction Automation Project (Deno)

This project automates an onboarding workflow integrating Slack and Smartsheet for an improved new employee experience.

## Key Features

* **Slack Event Trigger:** When a new user joins a designated Slack channel, the onboarding process is initiated.
* **Smartsheet Data Fetch:** The project retrieves the user's email address from Slack and uses it to fetch their corresponding onboarding data from a designated Smartsheet.
* **Personalized Onboarding Message:** A customized onboarding message is generated using the data from Smartsheet and sent to the new user directly on Slack.
* **Onboarding Completion:** The project offers functionality to mark the onboarding process as complete directly in Smartsheet.

## How it Works 

1. A new user joins a specific Slack channel (e.g., "#new-hires").
2. The project listens for this Slack event.
3. Upon the event, it fetches the user's email from Slack.
4. Using the email, it queries Smartsheet to find the user's onboarding plan.
5. A personalized onboarding message (with tasks, links, etc.) is compiled from the fetched data.
6. This message is sent to the user as a direct message on Slack.
7. (Optional) A button or action in Slack would allow the user to signal completion.
8. (Optional) Marking completion updates the associated row in Smartsheet.

## Setup & Prerequisites

1. **Deno:**
   * Install Deno (a secure runtime for JavaScript and TypeScript) by following the instructions at [https://deno.land/manual/getting_started/installation](https://deno.land/manual/getting_started/installation) 

2. **dotenv:**
   * Deno doesn't have a built-in environment variable system like Node.js. You'll need to install the `dotenv` module for managing your sensitive keys:
   ```bash
   deno install -A https://deno.land/x/dotenv/mod.ts
   ```
3. **Slack Workspace & App:**
   * Create a Slack workspace (if you don't have one already).
   * Create a Slack App and install it into your workspace.  Instructions can be found on the Slack API documentation website .

4. **Smartsheet:**
   * Set up a Smartsheet with columns matching what the project expects (e.g., "Email", "Onboarding Plan Sheet ID," and specific onboarding items you'll use in your messages).

**Environment Variables:**

Create a `.env` file in your project's root directory with the following variables:

* `SLACK_TOKEN`: Your Slack Bot User OAuth Token (from your Slack App settings)
* `SMARTSHEET_TOKEN`: Your Smartsheet API token 
* `ONBOARDING_CHANNEL_ID`: The ID of the Slack channel where onboarding is triggered
* `SMARTSHEET_JOINER_SHEET_ID`: The ID of the Smartsheet containing user onboarding data
* `COLUMN_ID_ONBOARDINGPLANSHEETID`: The Smartsheet column ID storing the sheet ID of the user's onboarding plan (if applicable)
* `COLUMN_ID_ITEM`: The Smartsheet column ID containing onboarding task items
* `COLUMN_ID_DESCRIPTION`: The Smartsheet column ID containing onboarding task descriptions
* `COLUMN_ID_LINK`:  The Smartsheet column ID containing links for onboarding tasks (if applicable)
* `COLUMN_ID_INDUCTION_COMPLETE`: The Smartsheet column ID signifying onboarding completion status

**Running the Project:**

1. Make sure all dependencies are installed (refer to steps above).
2. Ensure your `.env` file is populated with the correct values.
3. Execute the project with Deno:
   bash
   deno run --allow-net --allow-read --allow-env app.ts 
   

**Important Notes**

* **Permissions:**
   * Grant your Slack App the necessary permissions (scopes) to access user data, post messages, etc.
   * Provide access to appropriate Smartsheet sheets for your tokens.
