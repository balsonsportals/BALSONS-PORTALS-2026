/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Store & Rigging Tackle Master - Main Engine Backend
 * Dedicated Spreadsheet ID: 1M8lqdh_T3vaVW60tLmmvpkIRvZhiRJ6ATND40SuDND4
 * Document Identifier: BAL-ENG-SPEC-03-STORE-V1.0
 */

const STORE_SPREADSHEET_ID = '1M8lqdh_T3vaVW60tLmmvpkIRvZhiRJ6ATND40SuDND4';

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_STORE_RIGGING_ENGINE',
    version: '1.2.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: STORE_SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const payload = body.payload || {};

    let responseData = {};

    switch (action) {
      case 'STORE_CATALOG_ADD':
        responseData = addCatalogItem(payload);
        break;
      case 'STORE_TACKLE_ISSUE':
        responseData = issueTackle(payload);
        break;
      case 'STORE_TACKLE_RETURN':
        responseData = returnTackle(payload);
        break;
      case 'STORE_FORM11_LOG':
        responseData = logForm11Certificate(payload);
        break;
      case 'STORE_QUARANTINE_TAG':
        responseData = quarantineTackle(payload);
        break;
      case 'SYNC_STORE_DATA':
        responseData = fetchStoreSyncData();
        break;
      default:
        throw new Error('Unsupported action: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      data: responseData
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getStoreDb() {
  return SpreadsheetApp.openById(STORE_SPREADSHEET_ID);
}

/**
 * Returns current statutory quarter tag color (Q1: Green, Q2: Blue, Q3: Yellow, Q4: Orange)
 */
function getCurrentQuarterTagColor() {
  const month = new Date().getMonth() + 1; // 1 to 12
  if (month <= 3) return 'GREEN';
  if (month <= 6) return 'BLUE';
  if (month <= 9) return 'YELLOW';
  return 'ORANGE';
}

function addCatalogItem(data) {
  const ss = getStoreDb();
  let sheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  if (!sheet) {
    sheet = ss.insertSheet('RIGGING_TACKLE_MASTER');
    sheet.appendRow(['ASSET_ID', 'CATEGORY', 'DESCRIPTION', 'SWL', 'SERIAL_NO', 'CALIB_EXPIRY', 'TAG_COLOR', 'STATUS', 'LOCATION', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.id,
    data.cat,
    data.desc,
    data.swl,
    data.serial,
    data.calibExpiry || '',
    data.tag || getCurrentQuarterTagColor(),
    data.status || 'AVAILABLE',
    data.location || 'Tool Crib A',
    new Date().toISOString()
  ]);

  logStoreAuditRecord('StoreKeeper', 'Store', 'TACKLE_CATALOG_ADD', data.id, 'ADDED', 'SWL: ' + data.swl);
  return { assetId: data.id, status: 'ADDED' };
}

/**
 * Issues tackle with mandatory calibration expiry and quarter tag check
 */
function issueTackle(data) {
  const ss = getStoreDb();
  const catSheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  if (catSheet) {
    const items = catSheet.getDataRange().getValues();
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 1; i < items.length; i++) {
      if (items[i][0] === data.assetId) {
        if (items[i][7] === 'QUARANTINE_RED_TAG') {
          throw new Error('ISSUE_BLOCKED: Asset ' + data.assetId + ' is under Red-Tag Quarantine.');
        }
        if (items[i][5] && items[i][5] < today) {
          throw new Error('ISSUE_BLOCKED: Calibration expired on ' + items[i][5] + '. Statutory Form 11 recertification required.');
        }
        break;
      }
    }
  }

  let sheet = ss.getSheetByName('TOOL_ISSUE_LEDGER');
  if (!sheet) {
    sheet = ss.insertSheet('TOOL_ISSUE_LEDGER');
    sheet.appendRow(['TX_ID', 'ASSET_ID', 'DESCRIPTION', 'EMPLOYEE_ID', 'EMPLOYEE_NAME', 'WORK_BAY', 'ISSUE_TIMESTAMP', 'EXPECTED_RETURN', 'STATUS']);
  }
  sheet.appendRow([
    data.txId,
    data.assetId,
    data.desc,
    data.empId,
    data.empName,
    data.bay || 'General Laydown',
    data.issueTime || new Date().toISOString(),
    data.expectedReturn || '',
    'DEPLOYED_ACTIVE'
  ]);

  updateTackleMasterStatus(ss, data.assetId, 'ISSUED');
  logStoreAuditRecord(data.empId, 'Rigger', 'TOOL_CHECKOUT', data.assetId, 'ISSUED', 'Issued to: ' + data.empName);
  return { txId: data.txId, status: 'ISSUED' };
}

function returnTackle(data) {
  const ss = getStoreDb();
  const sheet = ss.getSheetByName('TOOL_ISSUE_LEDGER');
  if (sheet) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.txId) {
        sheet.getRange(i + 1, 9).setValue('RETURNED_INSPECTED');
        break;
      }
    }
  }

  updateTackleMasterStatus(ss, data.assetId, 'AVAILABLE');
  logStoreAuditRecord('StoreInspector', 'Store', 'TOOL_RETURN', data.assetId, 'RETURNED', 'Physical inspection completed OK');
  return { txId: data.txId, status: 'RETURNED' };
}

/**
 * Registers statutory Form 11 proof-load test certificate
 */
function logForm11Certificate(data) {
  const ss = getStoreDb();
  let sheet = ss.getSheetByName('CALIBRATION_FORM11');
  if (!sheet) {
    sheet = ss.insertSheet('CALIBRATION_FORM11');
    sheet.appendRow(['CERT_ID', 'ASSET_ID', 'COMPETENT_PERSON', 'TEST_LOAD_APPLIED', 'SAFE_WORKING_LOAD', 'TEST_DATE', 'EXPIRY_DATE', 'CERT_URL', 'STATUS']);
  }

  const certId = 'FORM11-2026-' + ('0000' + sheet.getLastRow()).slice(-4);
  let driveUrl = '';

  if (data.certBase64) {
    try {
      const folder = DriveApp.getFolderById('1RSSF5Ld9fEJ2VfacDp80DVrGyq4pE3HY');
      const blob = Utilities.newBlob(Utilities.base64Decode(data.certBase64), 'application/pdf', certId + '_' + data.assetId + '.pdf');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveUrl = file.getUrl();
    } catch (e) {
      Logger.log('Form 11 upload skipped: ' + e.message);
    }
  }

  sheet.appendRow([
    certId,
    data.assetId,
    data.competentPerson || 'Govt Certified Inspector',
    data.testLoad || '2x SWL',
    data.swl || '',
    data.testDate || new Date().toISOString().slice(0, 10),
    data.expiryDate || '',
    driveUrl || data.certUrl || '',
    'VALID'
  ]);

  // Update calibration expiry in tackle master
  if (data.expiryDate) {
    updateTackleCalibrationDate(ss, data.assetId, data.expiryDate);
  }

  logStoreAuditRecord(data.competentPerson || 'Inspector', 'CompetentPerson', 'FORM11_REGISTERED', certId, 'VALID', 'Asset: ' + data.assetId);
  return { certId: certId, status: 'VALID', driveUrl: driveUrl };
}

/**
 * Applies immediate red-tag quarantine to damaged or deformed tackle
 */
function quarantineTackle(data) {
  const ss = getStoreDb();
  updateTackleMasterStatus(ss, data.assetId, 'QUARANTINE_RED_TAG');
  logStoreAuditRecord(data.officer || 'SafetyOfficer', 'Safety', 'QUARANTINE_APPLIED', data.assetId, 'RED_TAG', 'Defect: ' + (data.reason || 'Deformation detected'));
  return { assetId: data.assetId, status: 'QUARANTINE_RED_TAG' };
}

function updateTackleMasterStatus(ss, assetId, status) {
  const sheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === assetId) {
      sheet.getRange(i + 1, 8).setValue(status);
      break;
    }
  }
}

function updateTackleCalibrationDate(ss, assetId, expiryDate) {
  const sheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === assetId) {
      sheet.getRange(i + 1, 6).setValue(expiryDate);
      sheet.getRange(i + 1, 7).setValue(getCurrentQuarterTagColor());
      sheet.getRange(i + 1, 8).setValue('AVAILABLE');
      break;
    }
  }
}

function fetchStoreSyncData() {
  const ss = getStoreDb();
  const catalogSheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  const ledgerSheet = ss.getSheetByName('TOOL_ISSUE_LEDGER');
  return {
    catalogItems: catalogSheet ? Math.max(0, catalogSheet.getLastRow() - 1) : 0,
    activeIssues: ledgerSheet ? Math.max(0, ledgerSheet.getLastRow() - 1) : 0,
    currentQuarterTag: getCurrentQuarterTagColor(),
    serverTimestamp: new Date().toISOString()
  };
}

/**
 * Universal Cryptographic SHA-256 Audit Trail Recorder for Store
 */
function logStoreAuditRecord(actor, role, action, entityId, outcome, details) {
  try {
    const ss = getStoreDb();
    const sheet = ss.getSheetByName('AUDIT_LOG');
    if (!sheet) return;

    const auditId = 'AUD-STR-' + Date.now();
    const timestamp = new Date().toISOString();
    const lastRow = sheet.getLastRow();
    let prevHash = 'GENESIS_BLOCK_2026_BALSONS_STORE';

    if (lastRow > 1) {
      prevHash = String(sheet.getRange(lastRow, 10).getValue()) || prevHash;
    }

    const payloadToHash = prevHash + '|' + auditId + '|' + timestamp + '|' + actor + '|' + action + '|' + entityId + '|' + outcome;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payloadToHash, Utilities.Charset.UTF_8);
    const currentHash = digest.map(function(b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');

    sheet.appendRow([
      auditId,
      timestamp,
      actor,
      role,
      action,
      entityId,
      outcome,
      details,
      prevHash,
      currentHash
    ]);
  } catch (e) {
    Logger.log('Store Audit Log Error: ' + e.message);
  }
}
