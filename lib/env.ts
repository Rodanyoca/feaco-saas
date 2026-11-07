/** Local FEACO interface preview. No credentials or remote resources are loaded. */
export const env = { googleSheets: {
  spreadsheetId: "local-feaco-spreadsheetId",
  territorialSpreadsheetId: "local-feaco-territorialSpreadsheetId",
  acteursSpreadsheetId: "local-feaco-acteursSpreadsheetId",
  affiliationsSpreadsheetId: "local-feaco-affiliationsSpreadsheetId",
  licencesSpreadsheetId: "local-feaco-licencesSpreadsheetId",
  competitionsSpreadsheetId: "local-feaco-competitionsSpreadsheetId",
  activitiesSpreadsheetId: "local-feaco-activitiesSpreadsheetId",
  documentsSpreadsheetId: "local-feaco-documentsSpreadsheetId",
  equipeNationaleSpreadsheetId: "local-feaco-equipeNationaleSpreadsheetId",
  referentielsSpreadsheetId: "local-feaco-referentielsSpreadsheetId",
  documentsDriveFolderId: "", clubLogosDriveFolderId: "", clientEmail: "", privateKey: "",
} } as const
export function isGoogleSheetsConfigured(): boolean { return false }
export function isTerritorialGoogleSheetsConfigured(): boolean { return false }
export function isActeursGoogleSheetsConfigured(): boolean { return false }
export function isAffiliationsGoogleSheetsConfigured(): boolean { return false }
export function isLicencesGoogleSheetsConfigured(): boolean { return false }
export function isCompetitionsGoogleSheetsConfigured(): boolean { return false }
export function isActivitiesGoogleSheetsConfigured(): boolean { return false }
export function isDocumentsGoogleSheetsConfigured(): boolean { return false }
export function isEquipeNationaleGoogleSheetsConfigured(): boolean { return false }
