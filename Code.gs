/**
 * OFFICIAL PERFORMAS DASHBOARD — BACKEND (Code.gs)
 * Fixes: AI removed, delete added, bottom-to-top Sr No, white-screen fixed
 */

const FOLDER_ID    = '1yJm-FbkthfYbDWTDIYYsouhu5xt6B9ED';
const SHEET_NAME   = 'Sheet1';
const ADMIN_PASSWORD = '4455';

// ─── Entry Point ────────────────────────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Official Performas Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a Drive share/view URL into a direct download URL.
 */
function getDownloadLink(url) {
  if (!url) return '';
  // Standard file: .../file/d/ID/view → .../file/d/ID/download
  if (url.includes('/file/d/') && url.includes('/view')) {
    return url.replace('/view', '/download');
  }
  // Google Docs / Sheets / Slides: export as PDF
  if (url.includes('/edit')) {
    return url.replace(/\/edit.*$/, '/export?format=pdf');
  }
  return url;
}

/**
 * Extracts the Drive file ID from any standard Drive URL.
 * Handles: /file/d/ID/..., /open?id=ID, etc.
 */
function getFileIdFromUrl(url) {
  if (!url) return null;
  var m = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m) return m[1];
  m = url.match(/id=([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns all non-empty performa rows from the sheet.
 * Column layout (1-indexed): A=Sr, B=Name, C=Details, D=Format, E=Keywords, F=Summary, G=DriveURL
 */
function getSheetData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();

  if (lastRow < 3) return [];

  var rows = sheet.getRange(3, 1, lastRow - 2, 7).getValues();

  return rows
    .filter(function(r) { return r[1] && r[1].toString().trim() !== ''; })
    .map(function(r) {
      return {
        srNo:         r[0],
        name:         r[1],
        details:      r[2],
        format:       r[3],
        keywords:     r[4],
        summary:      r[5],
        viewLink:     r[6],
        downloadLink: getDownloadLink(r[6])
      };
    });
}

/**
 * Password check.
 */
function checkAdmin(pass) {
  return pass === ADMIN_PASSWORD;
}

/**
 * Uploads a file to Drive and appends a row to the sheet.
 * Sr No is determined by scanning from the BOTTOM UP so gaps/deletes are handled.
 */
function uploadFinal(obj) {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var folder = DriveApp.getFolderById(FOLDER_ID);

  // 1. Save to Drive
  var decoded = Utilities.base64Decode(obj.base64);
  var blob    = Utilities.newBlob(decoded, obj.mimeType, obj.fileName);
  var file    = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 2. Find next Sr No — search BOTTOM to TOP
  var lastRow = sheet.getLastRow();
  var newSr   = 1;

  if (lastRow >= 3) {
    for (var row = lastRow; row >= 3; row--) {
      var val = sheet.getRange(row, 1).getValue();
      if (val !== '' && !isNaN(val) && Number(val) > 0) {
        newSr = Number(val) + 1;
        break;
      }
    }
  }

  // 3. Append row
  sheet.appendRow([
    newSr,
    obj.name,
    obj.details,
    obj.format,
    obj.keywords,
    obj.summary,
    file.getUrl()
  ]);

  return { success: true, srNo: newSr };
}

/**
 * Deletes a performa from both the sheet and Google Drive.
 * Searches for the matching row from BOTTOM to TOP.
 */
function deletePerforma(pass, driveUrl) {
  if (pass !== ADMIN_PASSWORD) {
    return { success: false, message: 'Invalid password.' };
  }

  try {
    var sheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var lastRow = sheet.getLastRow();

    if (lastRow < 3) {
      return { success: false, message: 'Sheet has no data.' };
    }

    var targetId    = getFileIdFromUrl(driveUrl);
    var rowToDelete = -1;

    // Search bottom to top for the matching URL / file ID
    var urlColumn = sheet.getRange(3, 7, lastRow - 2, 1).getValues();
    for (var i = urlColumn.length - 1; i >= 0; i--) {
      var cellUrl    = urlColumn[i][0] ? urlColumn[i][0].toString() : '';
      var cellFileId = getFileIdFromUrl(cellUrl);
      if (targetId && cellFileId === targetId) {
        rowToDelete = i + 3; // +3 because data starts at sheet row 3
        break;
      }
    }

    // Move Drive file to trash
    if (targetId) {
      try {
        DriveApp.getFileById(targetId).setTrashed(true);
      } catch (driveErr) {
        Logger.log('Drive trash error (non-fatal): ' + driveErr);
        // Continue — still remove from sheet
      }
    }

    // Remove sheet row
    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      return { success: true };
    } else {
      return { success: false, message: 'Row not found in sheet.' };
    }

  } catch (e) {
    return { success: false, message: e.toString() };
  }
}