/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Safety, EHS & PTW Governance Portal - Main Engine Backend
 * Dedicated Spreadsheet ID: 1iAiqscEZtL0Cf4A9xIYbDNt2Fj_TWs1ebB1mZbhHXp0
 */

const SAFETY_SPREADSHEET_ID = '1iAiqscEZtL0Cf4A9xIYbDNt2Fj_TWs1ebB1mZbhHXp0';

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_SAFETY_PTW_ENGINE',
    version: '1.1.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: SAFETY_SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};

    let responseData = {};

    switch (action) {
      case 'PTW_CREATE':
        responseData = createPTW(payload);
        break;
      case 'PTW_STATE_TRANSITION':
        responseData = transitionPTWState(payload);
        break;
      case 'TBT_LOG':
        responseData = logTBT(payload);
        break;
      case 'INCIDENT_LOG':
        responseData = logIncident(payload);
        break;
      case 'SYNC_SAFETY_DATA':
        responseData = fetchSafetySyncData();
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

function getSafetyDb() {
  return SpreadsheetApp.openById(SAFETY_SPREADSHEET_ID);
}

function createPTW(data) {
  const ss = getSafetyDb();
  let sheet = ss.getSheetByName('PTW_REGISTER');
  if (!sheet) {
    sheet = ss.insertSheet('PTW_REGISTER');
    sheet.appendRow(['PERMIT_ID', 'CATEGORY', 'WORK_BAY', 'SUPERVISOR', 'VALID_FROM', 'VALID_TO', 'GAS_CHECK', 'STATE', 'SCOPE', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.id,
    data.type,
    data.bay,
    data.supervisor,
    data.validFrom,
    data.validTo,
    data.gasCheck,
    data.state || 'SUBMITTED',
    data.scope,
    new Date().toISOString()
  ]);
  return { permitId: data.id, status: data.state || 'SUBMITTED' };
}

function transitionPTWState(data) {
  const ss = getSafetyDb();
  const sheet = ss.getSheetByName('PTW_REGISTER');
  if (!sheet) throw new Error('PTW_REGISTER sheet not found');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 8).setValue(data.state);
      return { permitId: data.id, newState: data.state };
    }
  }
  throw new Error('Permit ID ' + data.id + ' not found');
}

function logTBT(data) {
  const ss = getSafetyDb();
  let sheet = ss.getSheetByName('TBT_LOGS');
  if (!sheet) {
    sheet = ss.insertSheet('TBT_LOGS');
    sheet.appendRow(['TBT_ID', 'SHIFT', 'WORK_BAY', 'TOPIC', 'SUPERVISOR', 'ATTENDANCE', 'SIGNED', 'STATUS', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.id,
    data.shift,
    data.bay,
    data.topic,
    data.supervisor,
    data.attendance,
    data.signed ? 'YES' : 'NO',
    data.status,
    new Date().toISOString()
  ]);
  return { tbtId: data.id, status: 'RECORDED' };
}

function logIncident(data) {
  const ss = getSafetyDb();
  let sheet = ss.getSheetByName('INCIDENT_CAPA');
  if (!sheet) {
    sheet = ss.insertSheet('INCIDENT_CAPA');
    sheet.appendRow(['INCIDENT_ID', 'TIMESTAMP', 'LOCATION', 'CATEGORY', 'SEVERITY', 'DESCRIPTION', 'CAPA_ACTION', 'OWNER', 'TARGET_DATE', 'STATUS']);
  }
  sheet.appendRow([
    data.id,
    data.timestamp,
    data.bay,
    data.category,
    data.severity,
    data.desc,
    data.capa,
    data.owner,
    data.targetDate,
    data.status
  ]);
  return { incidentId: data.id, status: 'LOGGED' };
}

function fetchSafetySyncData() {
  const ss = getSafetyDb();
  const ptwSheet = ss.getSheetByName('PTW_REGISTER');
  const tbtSheet = ss.getSheetByName('TBT_LOGS');
  const incSheet = ss.getSheetByName('INCIDENT_CAPA');

  return {
    permitsCount: ptwSheet ? Math.max(0, ptwSheet.getLastRow() - 1) : 0,
    tbtsCount: tbtSheet ? Math.max(0, tbtSheet.getLastRow() - 1) : 0,
    incidentsCount: incSheet ? Math.max(0, incSheet.getLastRow() - 1) : 0
  };
}
