/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Store & Rigging Tackle Master - Main Engine Backend
 * Dedicated Spreadsheet ID: 1M8lqdh_T3vaVW60tLmmvpkIRvZhiRJ6ATND40SuDND4
 */

const STORE_SPREADSHEET_ID = '1M8lqdh_T3vaVW60tLmmvpkIRvZhiRJ6ATND40SuDND4';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
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
    data.calibExpiry,
    data.tag,
    data.status || 'AVAILABLE',
    data.location || 'Tool Crib',
    new Date().toISOString()
  ]);
  return { assetId: data.id, status: 'ADDED' };
}

function issueTackle(data) {
  const ss = getStoreDb();
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
    data.bay,
    data.issueTime,
    data.expectedReturn,
    'DEPLOYED_ACTIVE'
  ]);

  // Update status in master
  updateTackleMasterStatus(ss, data.assetId, 'ISSUED');
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

  // Update status in master
  updateTackleMasterStatus(ss, data.assetId, 'AVAILABLE');
  return { txId: data.txId, status: 'RETURNED' };
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

function fetchStoreSyncData() {
  const ss = getStoreDb();
  const catalogSheet = ss.getSheetByName('RIGGING_TACKLE_MASTER');
  const ledgerSheet = ss.getSheetByName('TOOL_ISSUE_LEDGER');
  return {
    catalogItems: catalogSheet ? Math.max(0, catalogSheet.getLastRow() - 1) : 0,
    activeIssues: ledgerSheet ? Math.max(0, ledgerSheet.getLastRow() - 1) : 0
  };
}
