/**
 * BALSONS JTRWF GATE ENTRY & SITE ACCESS PORTAL — API ROUTER & DISPATCHER
 * Document Identifier: BAL-ENG-SPEC-03-GREENFIELD-V1.0
 * 
 * Serverless doPost dispatcher processing Universal Simple Request envelopes
 * with 9-Discipline Automated Pre-Clearance, Turnstile Movement, and Material Inward/Passes.
 */

var GATE_SPREADSHEET_ID_FALLBACK = '1WzxdGaGFUJ9QWW31F4PXXzNTRQif8ZLu0Dale-GB534';

function getGateSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('GATE_SPREADSHEET_ID') || GATE_SPREADSHEET_ID_FALLBACK;
  return SpreadsheetApp.openById(ssId);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_GATE_ENTRY_ENGINE',
    version: '1.1.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: getGateSpreadsheet().getId(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return createJsonResponse(false, 'SERVER_BUSY_LOCK_TIMEOUT', null, 503);
  }

  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var request = JSON.parse(raw);
    var action = request.action;
    var payload = request.payload || {};
    var authToken = request.authToken;
    var requestId = request.requestId || 'REQ-GATE-' + Date.now();

    // Public Authentication
    if (action === 'auth.login') {
      var authResult = AuthService.login(payload);
      return createJsonResponse(authResult.success, action, authResult, authResult.status || 200, requestId);
    }

    // Authenticated Actions
    var session = AuthService.validateToken(authToken);
    if (!session) {
      return createJsonResponse(false, action, { error: 'SESSION_EXPIRED_OR_INVALID' }, 401, requestId);
    }

    var result = null;

    switch (action) {
      case 'gate.evaluateClearance':
        result = ClearanceEngine.evaluate(payload, session);
        break;

      case 'gate.authorizeOverride':
        result = ClearanceEngine.authorizeEmergencyOverride(payload, session);
        break;

      case 'gate.logMovement':
        result = GateTransactionService.logTurnstileMovement(payload, session);
        break;

      case 'gate.getDashboardTelemetry':
        result = GateTransactionService.getTelemetry(session);
        break;

      case 'gate.logMaterialInward':
        result = GateTransactionService.logMaterialInward(payload, session);
        break;

      case 'gate.createGatePass':
        result = GateTransactionService.createGatePass(payload, session);
        break;

      case 'gate.approveGatePass':
        result = GateTransactionService.approveGatePass(payload, session);
        break;

      case 'gate.dispatchExitPass':
        result = GateTransactionService.dispatchExitPass(payload, session);
        break;

      case 'gate.reconcileReturnPass':
        result = GateTransactionService.reconcileReturnPass(payload, session);
        break;

      case 'gate.getEmergencyMuster':
        result = GateTransactionService.getEmergencyMusterRoster(session);
        break;

      case 'gate.getContractors':
        result = MasterDataService.getContractors(session);
        break;

      case 'gate.getPersonnel':
        result = MasterDataService.getPersonnel(payload, session);
        break;

      case 'sync.pollUpdates':
        result = GateTransactionService.getTelemetry(session);
        break;

      default:
        return createJsonResponse(false, action, { error: 'UNKNOWN_GATE_ACTION: ' + action }, 404, requestId);
    }

    return createJsonResponse(result.success, action, result.data || result, result.status || 200, requestId);

  } catch (err) {
    Logger.log('FATAL Gate API Error: ' + err.toString());
    return createJsonResponse(false, 'SYSTEM_ERROR', { error: err.message, stack: err.stack }, 500);
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(success, action, data, statusCode, requestId) {
  var response = {
    success: success,
    action: action,
    statusCode: statusCode || (success ? 200 : 400),
    requestId: requestId || 'REQ-GATE-' + Date.now(),
    serverTimestamp: new Date().toISOString(),
    data: data
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Scheduled Daily Trigger: Checks and flags Overdue Returnable Gate Passes (RGP)
 */
function checkOverdueGatePasses() {
  var ss = getGateSpreadsheet();
  var sheet = ss.getSheetByName('GATE_PASS_REGISTER');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var today = new Date().toISOString().slice(0, 10);
  var overdueCount = 0;

  for (var i = 1; i < data.length; i++) {
    var passType = data[i][1];
    var returnDueDate = data[i][6];
    var gateStatus = data[i][11];

    if (passType === 'RGP' && gateStatus === 'EXITED' && returnDueDate && returnDueDate < today) {
      sheet.getRange(i + 1, 12).setValue('OVERDUE_ALERT');
      overdueCount++;
      logGateAuditRecord('SYSTEM_TRIGGER', 'Automated', 'RGP_OVERDUE_FLAGGED', data[i][0], 'ALERT', 'RGP passed due date: ' + returnDueDate);
    }
  }

  Logger.log('✅ Overdue Pass Scan Complete. Total Overdue Flagged: ' + overdueCount);
  return { success: true, overdueCount: overdueCount };
}

/**
 * Universal Cryptographic SHA-256 Audit Trail Recorder for Gate Entry
 */
function logGateAuditRecord(actor, role, action, entityId, outcome, details) {
  try {
    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('AUDIT_LOG');
    if (!sheet) return;

    var auditId = 'AUD-GATE-' + Date.now();
    var timestamp = new Date().toISOString();
    var lastRow = sheet.getLastRow();
    var prevHash = 'GENESIS_BLOCK_2026_BALSONS_GATE';

    if (lastRow > 1) {
      prevHash = String(sheet.getRange(lastRow, 10).getValue()) || prevHash;
    }

    var payloadToHash = prevHash + '|' + auditId + '|' + timestamp + '|' + actor + '|' + action + '|' + entityId + '|' + outcome;
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payloadToHash, Utilities.Charset.UTF_8);
    var currentHash = digest.map(function(b) {
      var v = (b < 0 ? b + 256 : b).toString(16);
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
    Logger.log('Gate Audit Log Error: ' + e.message);
  }
}
