import { readDemoSheet } from "./local-demo"
export { asText, normalize } from "./sheet-values"
export type SheetRow = Record<string, string | number | boolean | null>
export const LOCAL_WRITE_ERROR = "Démonstration locale : aucune sauvegarde, suppression ou transmission de fichier n’a été effectuée."
export async function getSheetDataFrom(
  spreadsheetId: string,
  range: string,
): Promise<SheetRow[]> { void spreadsheetId; return readDemoSheet(range) }
export async function getSheetsDataFrom(
  spreadsheetId: string,
  ranges: string[],
): Promise<Record<string, SheetRow[]>> { void spreadsheetId; return Object.fromEntries(ranges.map(range => [range.split("!")[0], readDemoSheet(range)])) }
export async function getSheetData(sheetName: string): Promise<SheetRow[]> { return readDemoSheet(sheetName) }
export async function getSheetCell(range: string): Promise<string> { void range; return "Démonstration locale" }
export async function appendSheetRecord(
  spreadsheetId: string,
  sheetName: string,
  record: Record<string, string>,
  insertDataOption: "INSERT_ROWS" | "OVERWRITE" = "INSERT_ROWS",
): Promise<void> { void spreadsheetId; void sheetName; void record; void insertDataOption; throw new Error(LOCAL_WRITE_ERROR) }
export async function updateSheetRecordById(
  spreadsheetId: string,
  sheetName: string,
  idHeader: string,
  id: string,
  record: Record<string, string>,
): Promise<void> { void spreadsheetId; void sheetName; void idHeader; void id; void record; throw new Error(LOCAL_WRITE_ERROR) }
export async function deleteSheetRecordById(
  spreadsheetId: string,
  sheetName: string,
  idHeader: string,
  id: string,
): Promise<void> { void spreadsheetId; void sheetName; void idHeader; void id; throw new Error(LOCAL_WRITE_ERROR) }
export async function appendSheetRecordsBatch(
  spreadsheetId: string,
  records: Array<{ sheetName: string; record: Record<string, string> }>,
): Promise<void> { void spreadsheetId; void records; throw new Error(LOCAL_WRITE_ERROR) }
export async function formatSheetDateColumn(
  spreadsheetId: string,
  sheetName: string,
  headerName: string,
  pattern = "dd/mm/yyyy",
): Promise<void> { void spreadsheetId; void sheetName; void headerName; void pattern; throw new Error(LOCAL_WRITE_ERROR) }
