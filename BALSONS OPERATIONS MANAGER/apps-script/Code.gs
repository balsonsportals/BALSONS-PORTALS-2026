/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Operations & Heavy Erection - Main Engine Backend
 * Dedicated Spreadsheet ID: 1De9UXdK7PayfgGlGrYhYCyD9BfY1haN7GykGXBNQ2ro
 * Department 03 Operations Drive Vault: 1mNMSK9VmE5olCOtIdMzIm1HUcLEULn5g
 * Document Identifier: BAL-ENG-SPEC-06-OPERATIONS-V1.2
 */

const OPERATIONS_SPREADSHEET_ID_FALLBACK = '1De9UXdK7PayfgGlGrYhYCyD9BfY1haN7GykGXBNQ2ro';
const OPERATIONS_DRIVE_VAULT_ID = '1mNMSK9VmE5olCOtIdMzIm1HUcLEULn5g';

function getOperationsSpreadsheet() {
  var propId = PropertiesService.getScriptProperties().getProperty('BALSONS_OPERATIONS_DATABASE_MASTER');
  var targetId = propId || OPERATIONS_SPREADSHEET_ID_FALLBACK;
  return SpreadsheetApp.openById(targetId);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_OPERATIONS_ERECTION_ENGINE',
    version: '1.2.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: getOperationsSpreadsheet().getId(),
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
      case 'OPERATIONS_WP_CREATE':
        responseData = createWorkPackage(payload);
        break;
      case 'OPERATIONS_WP_PROGRESS':
        responseData = updateWorkPackageProgress(payload);
        break;
      case 'OPERATIONS_LIFT_CALCULATE':
        responseData = calculateAndRecordLiftStudy(payload);
        break;
      case 'OPERATIONS_DPR_LOG':
        responseData = logDailyProgressReport(payload);
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

/**
 * Creates a new Work Package with optional method statement Drive upload
 */
function createWorkPackage(data) {
  const ss = getOperationsSpreadsheet();
  let sheet = ss.getSheetByName('WORK_PACKAGES');
  if (!sheet) {
    sheet = ss.insertSheet('WORK_PACKAGES');
    sheet.appendRow(['PACKAGE_ID', 'DESCRIPTION', 'TARGET_BAY', 'WEIGHT_MT', 'ASSIGNED_CRANE', 'LINKED_PTW', 'PROGRESS', 'STATUS', 'CREATED_AT']);
  }

  const packageId = data.id || ('WP-2026-' + Math.floor(1000 + Math.random() * 9000));
  const progress = parseInt(data.progress, 10) || 0;
  let status = data.status || 'IN_PROGRESS';
  if (progress >= 100) status = 'COMPLETED';
  else if (progress >= 85) status = 'ALIGNMENT_VERIFICATION';

  // Stream method statement dossier to Drive if provided
  var driveFileUrl = '';
  if (data.dossierBase64) {
    try {
      var folder = DriveApp.getFolderById(OPERATIONS_DRIVE_VAULT_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.dossierBase64), 'application/pdf', packageId + '_DOSSIER.pdf');
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveFileUrl = file.getUrl();
    } catch (e) {
      Logger.log('Drive WP Dossier Upload Warning: ' + e.message);
    }
  }

  sheet.appendRow([
    packageId,
    data.desc || '',
    data.bay || 'Bay 1 Pit',
    parseFloat(data.weight) || 0,
    data.crane || 'Demag CC2800 (600T)',
    data.ptw || 'PTW-LIFT-001',
    progress,
    status,
    new Date().toISOString()
  ]);

  logOperationsAuditRecord(
    data.engineer || 'Prashant Muley',
    'EXECUTIVE_PROJECT_DIRECTOR',
    'WP_CREATED',
    packageId,
    'SUCCESS',
    'Created Work Package ' + packageId + ' (' + (data.desc || '') + ') - Weight: ' + (data.weight || 0) + ' MT'
  );

  return { packageId: packageId, status: status, progress: progress, fileUrl: driveFileUrl };
}

/**
 * Updates Work Package erection milestone progress with automatic state transition
 */
function updateWorkPackageProgress(data) {
  const ss = getOperationsSpreadsheet();
  const sheet = ss.getSheetByName('WORK_PACKAGES');
  if (!sheet) throw new Error('WORK_PACKAGES sheet not found');

  const rows = sheet.getDataRange().getValues();
  const packageId = data.id || data.packageId;
  const progress = parseInt(data.progress, 10);

  if (isNaN(progress) || progress < 0 || progress > 100) {
    throw new Error('Invalid progress percentage: ' + data.progress);
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === packageId) {
      let newStatus = progress >= 100 ? 'COMPLETED' : (progress >= 85 ? 'ALIGNMENT_VERIFICATION' : 'IN_PROGRESS');
      sheet.getRange(i + 1, 7).setValue(progress);
      sheet.getRange(i + 1, 8).setValue(newStatus);

      logOperationsAuditRecord(
        data.engineer || 'ERECTION_LEAD',
        'SITE_ENGINEER',
        'WP_PROGRESS_UPDATED',
        packageId,
        'SUCCESS',
        'Updated progress to ' + progress + '% -> Status: ' + newStatus
      );

      return { packageId: packageId, progress: progress, status: newStatus };
    }
  }
  throw new Error('Work Package ' + packageId + ' not found');
}

/**
 * Calculates tandem heavy lift rigging parameters and records certified engineering study
 */
function calculateAndRecordLiftStudy(data) {
  const ss = getOperationsSpreadsheet();
  let sheet = ss.getSheetByName('HEAVY_LIFT_STUDIES');
  if (!sheet) {
    sheet = ss.insertSheet('HEAVY_LIFT_STUDIES');
    sheet.appendRow(['STUDY_ID', 'LIFT_DESCRIPTION', 'LOAD_WEIGHT_MT', 'PRIMARY_CRANE', 'TAIL_CRANE', 'GROUND_BEARING_PRESSURE_T_M2', 'MAX_BOOM_UTILIZATION_PCT', 'ENGINEER_SIGN_OFF', 'STATUS']);
  }

  const weight = parseFloat(data.loadWeight) || 0;
  const primaryCap = parseFloat(data.primaryRatedCap) || 1;
  const groundCap = parseFloat(data.allowableGroundPressure) || 20.0;
  const padArea = parseFloat(data.matArea) || 15.0; // Standard steel crawler mat area in m^2

  if (weight <= 0) throw new Error('Load weight must be greater than 0 MT');

  const util = Math.round(((weight / primaryCap) * 100) * 10) / 10;
  const sf = Math.round((primaryCap / weight) * 100) / 100;
  const estPressure = Math.round(((weight * 1.25) / padArea) * 10) / 10;

  // Rigging feasibility criterion: Max 80% chart utilization, SF >= 1.25, GBP <= allowable soil capacity
  const isApproved = (util <= 80.0) && (sf >= 1.25) && (estPressure <= groundCap);
  const status = isApproved ? 'APPROVED' : 'REJECTED_FEASIBILITY_FAIL';
  const studyId = data.studyId || ('LIFT-STD-' + Math.floor(100 + Math.random() * 900));

  sheet.appendRow([
    studyId,
    data.desc || ('Erection Lift Study - ' + weight + ' MT'),
    weight,
    data.primaryCrane || 'Demag CC2800 (600T)',
    data.tailCrane || 'Liebherr LTM1250 (250T)',
    estPressure,
    util,
    data.engineerSignOff || 'Prashant Muley (Lead Rigging Engineer)',
    status
  ]);

  logOperationsAuditRecord(
    data.engineerSignOff || 'Prashant Muley',
    'LEAD_RIGGING_ENGINEER',
    'LIFT_STUDY_EVALUATED',
    studyId,
    isApproved ? 'SUCCESS' : 'FAILED',
    'Study evaluated: Util: ' + util + '%, SF: ' + sf + ', GBP: ' + estPressure + ' T/m2 -> ' + status
  );

  return {
    studyId: studyId,
    utilizationPct: util,
    safetyFactor: sf,
    groundBearingPressure: estPressure,
    allowablePressure: groundCap,
    cleared: isApproved,
    status: status
  };
}

/**
 * Logs Daily Progress Report (DPR) with wind velocity safety enforcement
 */
function logDailyProgressReport(data) {
  const ss = getOperationsSpreadsheet();
  let sheet = ss.getSheetByName('DAILY_PROGRESS_REPORTS');
  if (!sheet) {
    sheet = ss.insertSheet('DAILY_PROGRESS_REPORTS');
    sheet.appendRow(['DPR_ID', 'DATE', 'SHIFT', 'WORK_BAY', 'ACTIVITIES_SUMMARY', 'MANPOWER_COUNT', 'EQUIPMENT_DEPLOYED', 'DELAYS_ISSUES', 'LOGGED_BY']);
  }

  const dprId = data.dprId || ('DPR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + (data.shift || 'D'));
  const windSpeed = parseFloat(data.windSpeedKmh) || 0;
  let delays = data.delays || 'None';

  // Statutory heavy crane wind limit (32 km/h shut down rule)
  if (windSpeed > 32) {
    delays = 'WEATHER HOLD: Wind speed recorded at ' + windSpeed + ' km/h exceeding 32 km/h threshold. Heavy lifts suspended. ' + delays;
  }

  sheet.appendRow([
    dprId,
    data.date || new Date().toISOString().slice(0, 10),
    data.shift || 'DAY',
    data.bay || 'Bay 1 Pit',
    data.activities || 'Mechanical erection and alignment',
    parseInt(data.manpower, 10) || 18,
    data.equipment || 'CC2800 Crawler Crane, 50T Mobile, Hydraulic Jacks',
    delays,
    data.loggedBy || 'Prashant Muley'
  ]);

  logOperationsAuditRecord(
    data.loggedBy || 'Prashant Muley',
    'SITE_IN_CHARGE',
    'DPR_LOGGED',
    dprId,
    'SUCCESS',
    'DPR logged for ' + (data.bay || '') + ' shift ' + (data.shift || '') + ' - Wind: ' + windSpeed + ' km/h'
  );

  return { dprId: dprId, status: 'RECORDED', weatherHold: windSpeed > 32 };
}

/**
 * Fetches cross-domain synchronized operations metrics
 */
function fetchOperationsSyncData() {
  const ss = getOperationsSpreadsheet();
  const wpSheet = ss.getSheetByName('WORK_PACKAGES');
  const liftSheet = ss.getSheetByName('HEAVY_LIFT_STUDIES');
  const dprSheet = ss.getSheetByName('DAILY_PROGRESS_REPORTS');

  let activeCount = 0;
  let completedCount = 0;
  let totalProgress = 0;
  let totalWps = 0;

  if (wpSheet && wpSheet.getLastRow() > 1) {
    const values = wpSheet.getRange(2, 7, wpSheet.getLastRow() - 1, 2).getValues();
    totalWps = values.length;
    values.forEach(function(row) {
      const prog = parseFloat(row[0]) || 0;
      const stat = row[1];
      totalProgress += prog;
      if (stat === 'COMPLETED') completedCount++;
      else activeCount++;
    });
  }

  const avgProgress = totalWps > 0 ? Math.round((totalProgress / totalWps) * 10) / 10 : 0;

  return {
    packagesCount: totalWps,
    activePackagesCount: activeCount,
    completedPackagesCount: completedCount,
    averageProgressPct: avgProgress,
    studiesCount: liftSheet ? Math.max(0, liftSheet.getLastRow() - 1) : 0,
    dprsCount: dprSheet ? Math.max(0, dprSheet.getLastRow() - 1) : 0,
    serverTimestamp: new Date().toISOString()
  };
}

/**
 * Universal Cryptographic SHA-256 Audit Trail Recorder for Operations & Heavy Erection
 */
function logOperationsAuditRecord(actor, role, action, entityId, outcome, details) {
  try {
    const ss = getOperationsSpreadsheet();
    const sheet = ss.getSheetByName('AUDIT_LOG');
    if (!sheet) return;

    const auditId = 'AUD-OPS-' + Date.now();
    const timestamp = new Date().toISOString();
    const lastRow = sheet.getLastRow();
    let prevHash = 'GENESIS_BLOCK_2026_BALSONS_OPERATIONS';

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
    Logger.log('Operations Audit Log Error: ' + e.message);
  }
}
