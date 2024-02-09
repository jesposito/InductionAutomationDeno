//smartsheetApi.ts
import { CONFIG } from './config.ts';

// Generic function for Smartsheet API Calls
async function callSmartsheetApi<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  const url = `https://api.smartsheet.com/2.0/${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${CONFIG.SMARTSHEET_TOKEN}`,
      "Content-Type": "application/json", 
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Smartsheet API request failed (${response.status}): ${errorData.message || 'Unknown Error'}`); 
  }
  return await response.json() as T;
}

// Function to search for and retrieve user data from a Smartsheet sheet
async function fetchUserDataFromSmartsheet(email: string) {
  const searchUrl = `https://api.smartsheet.com/2.0/search/sheets/${CONFIG.SMARTSHEET_JOINER_SHEET_ID}?query=${encodeURIComponent(email)}`;
  const searchResponse = await callSmartsheetApi<any>(searchUrl); // Using 'any' type initially. You may replace it with an interface representing the search response

  if (!searchResponse.ok) throw new Error('Failed to search for user data in Smartsheet.');
  const searchData = searchResponse; // Assuming 'searchResponse' is already the parsed data (adjust if needed)

  if (searchData.results.length === 0) throw new Error('User data not found in Smartsheet.');

  const rowId = searchData.results[0].objectId;
  const rowUrl = `https://api.smartsheet.com/2.0/sheets/${CONFIG.SMARTSHEET_JOINER_SHEET_ID}/rows/${rowId}`;
  const rowResponse = await callSmartsheetApi<any>(rowUrl); 

  if (!rowResponse.ok) throw new Error('Failed to fetch user row data from Smartsheet.');
  const rowData = rowResponse; // Assuming data parsing already happened inside callSmartsheetApi 

  // Extracting the onboarding plan sheet ID from a specific cell
  const onboardingPlanSheetId = rowData.cells.find(cell => cell.columnId === CONFIG.COLUMN_ID_ONBOARDINGPLANSHEETID)?.value;
  if (!onboardingPlanSheetId) throw new Error('Onboarding plan sheet ID not found in user data.');

  return { userData: rowData, onboardingPlanSheetId };
}

// Function to fetch the onboarding plan from a specific Smartsheet sheet
async function fetchOnboardingPlan(onboardingPlanSheetId: string) {
  const sheetUrl = `https://api.smartsheet.com/2.0/sheets/${onboardingPlanSheetId}`;
  const sheetResponse = await callSmartsheetApi<any>(sheetUrl); 

  if (!sheetResponse.ok) throw new Error('Failed to fetch onboarding plan sheet from Smartsheet.');
  const sheetData = sheetResponse; // Assuming data parsing already happened inside callSmartsheetApi 

  return sheetData.rows.map(row => ({
    Item: row.cells.find(cell => cell.columnId === CONFIG.COLUMN_ID_ITEM)?.value,
    Description: row.cells.find(cell => cell.columnId === CONFIG.COLUMN_ID_DESCRIPTION)?.value,
    Link: row.cells.find(cell => cell.columnId === CONFIG.COLUMN_ID_LINK)?.value,
  }));
}

// Function to mark onboarding as complete for a user in Smartsheet
async function markOnboardingComplete(email: string) {
  // First, find the user's row in the Smartsheet
  const searchResponse = await callSmartsheetApi<any>(
    `https://api.smartsheet.com/2.0/search/sheets/${CONFIG.SMARTSHEET_JOINER_SHEET_ID}?query=${encodeURIComponent(email)}`
  );

  if (!searchResponse.ok) throw new Error('Failed to search for user data in Smartsheet.');
  const searchData = searchResponse;  // Assuming searchResponse is already the parsed data 

  if (searchData.results.length === 0) throw new Error('User data not found in Smartsheet.');

  const rowId = searchData.results[0].objectId;

  // Assuming you have a column for the "Induction Complete" status
  const INDUCTION_COMPLETE_COLUMN_ID = CONFIG.COLUMN_ID_INDUCTION_COMPLETE; // You need to add this to your CONFIG

  // Prepare the update payload
  const updatePayload = {
    id: rowId,
    cells: [
      {
        columnId: INDUCTION_COMPLETE_COLUMN_ID,
        value: true
      }
    ]
  };

  // Update the row to mark induction as complete
  const updateResponse = await callSmartsheetApi<any>(
    `https://api.smartsheet.com/2.0/sheets/${CONFIG.SMARTSHEET_JOINER_SHEET_ID}/rows`,
    'PUT',
    { data: [updatePayload] }
  );

  if (!updateResponse.ok) {
    throw new Error(`Failed to mark onboarding as complete: ${updateResponse.message}`); 
  }

  return updateResponse; // Assuming updateResponse contains parsed data after successful update
}

// Function to get the column ID by name
async function getColumnIdByName(sheetId: string, columnName: string): Promise<number> {
  const sheetResponse = await callSmartsheetApi<any>(
    `https://api.smartsheet.com/2.0/sheets/${sheetId}`
  );

  if (!sheetResponse.ok) throw new Error('Failed to fetch sheet details from Smartsheet.');

  const column = sheetResponse.columns.find(column => column.title === columnName);
  if (!column) throw new Error(`Column "${columnName}" not found in sheet.`);

  return column.id;
}

export { callSmartsheetApi, fetchUserDataFromSmartsheet, fetchOnboardingPlan, markOnboardingComplete, getColumnIdByName };