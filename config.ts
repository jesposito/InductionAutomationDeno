//config.ts
import * as dotenv from 'https://deno.land/x/dotenv/mod.ts';

// Assuming you have these functions to interact with Smartsheet defined elsewhere
import { callSmartsheetApi, getColumnIdByName } from './smartsheetApi.ts';

// Load environment variables from your .env file
await dotenv.config({ safe: true });

export const CONFIG = {
  ONBOARDING_CHANNEL_ID: Deno.env.get("ONBOARDING_CHANNEL_ID"),
  SLACK_TOKEN: Deno.env.get("SLACK_TOKEN"),
  SMARTSHEET_TOKEN: Deno.env.get("SMARTSHEET_TOKEN"),
  SMARTSHEET_JOINER_SHEET_ID: Deno.env.get("SMARTSHEET_JOINER_SHEET_ID"),

  // Function to fetch column IDs at runtime for flexibility
  async getColumnIdByName(sheetId: string, columnName: string): Promise<number> {
    try {
      const columnId = await getColumnIdByName(sheetId, columnName);
      return columnId;
    } catch (error) {
      console.error(`Error fetching column ID for '${columnName}':`, error);
      throw error; // Allow this error to be propagated elsewhere 
    }
  }
};

// Simple validation (could be expanded for stricter checks)
const requiredConfigEntries = ['ONBOARDING_CHANNEL_ID', 'SLACK_TOKEN', 'SMARTSHEET_TOKEN', 'SMARTSHEET_JOINER_SHEET_ID'];

if (requiredConfigEntries.some(key => CONFIG[key] === null || CONFIG[key] === undefined)) {
  console.error("Missing required environment variables");
  Deno.exit(1);
}
