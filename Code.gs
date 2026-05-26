// ═══════════════════════════════════════════════════════════════
//  OFFICIAL PERFORMAS — Google Apps Script Backend
//  Government of Punjab — Education Department
// ═══════════════════════════════════════════════════════════════

// ── CONFIGURATION — Edit these values ──────────────────────────
var CONFIG = {
  SHEET_NAME:    "Performas",          // Name of the sheet tab
  DRIVE_FOLDER:  "Official Performas", // Google Drive folder name
  ADMIN_PASS:    "Punjab@2025",        // Change this password!
  SPREADSHEET_ID: ""                   // Leave blank = uses bound sheet
                                       // OR paste your Sheet ID here
};
// ────────────────────────────────────────────────────────────────


/**
 * Serve the HTML web app
 */
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Official Performas — Government of Punjab")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * Get all performa records from the Sheet
 * Returns array of objects for the frontend cards
 */
function getSheetData() {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();

  if (rows.length <= 1) return []; // only header row

  var headers = rows[0];
  var data    = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // Skip empty rows
    if (!row[0]) continue;

    data.push({
      name:         row[0] || "",
      summary:      row[1] || "",
      details:      row[2] || "",
      format:       row[3] || "",
      keywords:     row[4] || "",
      viewLink:     row[5] || "",
      downloadLink: row[6] || "",
      uploadDate:   row[7] || ""
    });
  }

  return data;
}


/**
 * Check if the entered password matches admin password
 */
function checkAdmin(pass) {
  return pass === CONFIG.ADMIN_PASS;
}


/**
 * Upload a file to Google Drive and record it in the Sheet
 * @param {Object} obj - { base64, mimeType, fileName, name, details, format, keywords, summary }
 */
function uploadFinal(obj) {
  if (!obj || !obj.base64) throw new Error("No file data received.");

  // 1. Get or create the Drive folder
  var folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER);

  // 2. Decode base64 and create file
  var blob = Utilities.newBlob(
    Utilities.base64Decode(obj.base64),
    obj.mimeType,
    obj.fileName
  );
  var file = folder.createFile(blob);

  // 3. Make the file publicly accessible (view + download)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId       = file.getId();
  var viewLink     = "https://drive.google.com/file/d/" + fileId + "/view";
  var downloadLink = "https://drive.google.com/uc?export=download&id=" + fileId;
  var uploadDate   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");

  // 4. Append a row to the Sheet
  var sheet = getSheet();
  sheet.appendRow([
    obj.name,
    obj.summary,
    obj.details,
    obj.format,
    obj.keywords,
    viewLink,
    downloadLink,
    uploadDate
  ]);

  return { success: true, fileId: fileId };
}


/**
 * Delete a performa from Drive and remove its row from the Sheet
 * @param {string} pass     - Admin password
 * @param {string} viewLink - The Drive view URL of the file to delete
 */
function deletePerforma(pass, viewLink) {
  if (pass !== CONFIG.ADMIN_PASS) {
    return { success: false, message: "Incorrect password." };
  }

  try {
    // 1. Extract file ID from view link
    var match  = viewLink.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (!match) return { success: false, message: "Could not extract file ID from link." };
    var fileId = match[1];

    // 2. Delete from Drive
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch(e) {
      // File may already be deleted — continue to remove from sheet
    }

    // 3. Remove the matching row from Sheet
    var sheet = getSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = rows.length - 1; i >= 1; i--) {
      if ((rows[i][5] || "").indexOf(fileId) !== -1) {
        sheet.deleteRow(i + 1);
        break;
      }
    }

    return { success: true };

  } catch(e) {
    return { success: false, message: e.message };
  }
}


// ── INTERNAL HELPERS ────────────────────────────────────────────

/**
 * Returns the configured sheet, creating headers if needed
 */
function getSheet() {
  var ss;
  if (CONFIG.SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Auto-create sheet + headers on first run
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow([
      "Name", "Summary", "Details", "Format",
      "Keywords", "ViewLink", "DownloadLink", "UploadDate"
    ]);
    // Style header row
    var header = sheet.getRange(1, 1, 1, 8);
    header.setBackground("#1a6b3c");
    header.setFontColor("#ffffff");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}


/**
 * Get a Drive folder by name, create it if it doesn't exist
 */
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}
