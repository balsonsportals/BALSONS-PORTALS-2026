/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Operations & Heavy Erection - Main Engine Backend
 * Dedicated Spreadsheet ID: 1GeqDDmBgdVm3ZUp4c9iB36__iLJ9wADQQRhEIwVxa-E
 */

const OPERATIONS_SPREADSHEET_ID = '1GeqDDmBgdVm3ZUp4c9iB36__iLJ9wADQQRhEIwVxa-E';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};

    let responseData = {};

    switch (action) {
      case 'OPERATIONS_WP_CREATE':
        responseData = createWorkPackage(payload);
        break;
      case 'OPERATIONS_WP_PROGRESS':
        responseData = updateWorkPackageProgress(payload);
        break;
      case 'SYNC_OPERATIONS_DATA':
        responseData = fetchOperationsSyncData();
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

function getOperationsDb() {
  return SpreadsheetApp.openById(OPERATIONS_SPREADSHEET_ID);
}

function createWorkPackage(data) {
  const ss = getOperationsDb();
  let sheet = ss.getSheetByName('WORK_PACKAGES');
  if (!sheet) {
    sheet = ss.insertSheet('WORK_PACKAGES');
    sheet.appendRow(['PACKAGE_ID', 'DESCRIPTION', 'TARGET_BAY', 'WEIGHT_MT', 'ASSIGNED_CRANE', 'LINKED_PTW', 'PROGRESS', 'STATUS', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.id,
    data.desc,
    data.bay,
    data.weight,
    data.crane,
    data.ptw,
    data.progress,
    data.status,
    new Date().toISOString()
  ]);
  return { packageId: data.id, status: data.status };
}

function updateWorkPackageProgress(data) {
  const ss = getOperationsDb();
  const sheet = ss.getSheetByName('WORK_PACKAGES');
  if (!sheet) throw new Error('WORK_PACKAGES sheet not found');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 7).setValue(data.progress);
      let newStatus = data.progress >= 100 ? 'COMPLETED' : (data.progress >= 85 ? 'ALIGNMENT_VERIFICATION' : 'IN_PROGRESS');
      sheet.getRange(i + 1, 8).setValue(newStatus);
      return { packageId: data.id, progress: data.progress, status: newStatus };
    }
  }
  throw new Error('Work Package ' + data.id + ' not found');
}

function fetchOperationsSyncData() {
  const ss = getOperationsDb();
  const sheet = ss.getSheetByName('WORK_PACKAGES');
  return {
    packagesCount: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0
  };
}
