/**
 * BALSONS JTRWF GATE ENTRY & SITE ACCESS PORTAL — API ROUTER & DISPATCHER
 * Document Identifier: BAL-ENG-SPEC-03-GREENFIELD-V1.0
 * 
 * Serverless doPost dispatcher processing Universal Simple Request envelopes
 * with 9-Discipline Automated Pre-Clearance, Turnstile Movement, and Material Inward/Passes.
 */

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
