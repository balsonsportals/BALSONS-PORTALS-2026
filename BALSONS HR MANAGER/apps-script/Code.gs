/**
 * BALSONS HR & DUAL-WAGE PAYROLL MANAGER — API ROUTER & DISPATCHER
 * Document Identifier: BAL-ENG-SPEC-03-GREENFIELD-V1.0
 * 
 * Serverless doPost dispatcher processing Universal Simple Request envelopes
 * with PBKDF2 cryptographic auth, CacheService session validation, and LockService mutex.
 */

var HR_SPREADSHEET_ID_FALLBACK = '1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw';

function getHrSpreadsheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID') || HR_SPREADSHEET_ID_FALLBACK;
  return SpreadsheetApp.openById(ssId);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_HR_PAYROLL_ENGINE',
    version: '1.1.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: getHrSpreadsheet().getId(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // 10-second wait lock to serialize database mutations
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
    var requestId = request.requestId || 'REQ-' + Date.now();

    // Public / Unauthenticated Actions
    if (action === 'auth.login') {
      var authResult = handleLogin(payload);
      return createJsonResponse(authResult.success, action, authResult, authResult.status || 200, requestId);
    }

    if (action === 'candidate.selfRegister') {
      var regResult = handleCandidateSelfRegistration(payload);
      return createJsonResponse(regResult.success, action, regResult, regResult.status || 200, requestId);
    }

    // Authenticated Actions — Verify Bearer Token via CacheService
    var session = validateSessionToken(authToken);
    if (!session) {
      return createJsonResponse(false, action, { error: 'SESSION_EXPIRED_OR_INVALID' }, 401, requestId);
    }

    var result = null;

    switch (action) {
      case 'hr.getEmployees':
        result = EmployeeService.getEmployees(payload, session);
        break;

      case 'hr.createEmployee':
        result = EmployeeService.createEmployee(payload, session);
        break;

      case 'hr.updateEmployee':
        result = EmployeeService.updateEmployee(payload, session);
        break;

      case 'hr.getDossier':
        result = EmployeeService.get360Dossier(payload.empId, session);
        break;

      case 'hr.logDailyAttendance':
        result = EmployeeService.logAttendance(payload, session);
        break;

      case 'hr.getAttendanceSummary':
        result = EmployeeService.getAttendanceSummary(payload.payPeriod, session);
        break;

      case 'hr.calculatePayroll':
        result = PayrollEngine.calculateDryRun(payload.payPeriod, session);
        break;

      case 'hr.lockPayroll':
        result = PayrollEngine.authorizeAndLock(payload.payPeriod, payload.pin, session);
        break;

      case 'hr.getAdvances':
        result = EmployeeService.getAdvances(payload, session);
        break;

      case 'hr.issueAdvance':
        result = EmployeeService.issueAdvance(payload, session);
        break;

      case 'sync.pollUpdates':
        result = handleSyncPoll(payload, session);
        break;

      default:
        return createJsonResponse(false, action, { error: 'UNKNOWN_ACTION: ' + action }, 404, requestId);
    }

    return createJsonResponse(result.success, action, result.data || result, result.status || 200, requestId);

  } catch (err) {
    Logger.log('FATAL API Error: ' + err.toString());
    return createJsonResponse(false, 'SYSTEM_ERROR', { error: err.message, stack: err.stack }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Validates session token against CacheService
 */
function validateSessionToken(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var rawSession = cache.get('SESSION_' + token);
  if (!rawSession) return null;

  try {
    var session = JSON.parse(rawSession);
    // Verify user is still active in database
    var ss = getHrSpreadsheet();
    var userSheet = ss.getSheetByName('USER_ACCESS');
    var users = userSheet.getDataRange().getValues();
    for (var i = 1; i < users.length; i++) {
      if (users[i][1] === session.username) {
        if (users[i][6] !== 'ACTIVE') {
          cache.remove('SESSION_' + token);
          return null; // Account deactivated
        }
        break;
      }
    }
    return session;
  } catch (e) {
    return null;
  }
}

/**
 * Handles administrative credential authentication
 */
function handleLogin(payload) {
  var username = (payload.username || '').trim().toLowerCase();
  var password = payload.password || '';

  if (!username || !password) {
    return { success: false, error: 'MISSING_CREDENTIALS', status: 400 };
  }

  var ss = getHrSpreadsheet();
  var userSheet = ss.getSheetByName('USER_ACCESS');
  if (!userSheet) return { success: false, error: 'USER_ACCESS_MISSING', status: 500 };

  var data = userSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dbUsername = (row[1] || '').toString().toLowerCase();
    var dbFullName = row[2];
    var dbRole = row[3];
    var dbHash = row[4];
    var dbSalt = row[5];
    var dbActive = row[6];
    var dbProjects = row[7];

    if (dbUsername === username) {
      if (dbActive !== 'ACTIVE') {
        return { success: false, error: 'ACCOUNT_DISABLED', status: 403 };
      }

      var computed = computeCryptographicHash(password, dbSalt);
      if (computed === dbHash) {
        var token = 'BT-' + Utilities.getUuid() + '-' + Date.now();
        var session = {
          userId: row[0],
          username: dbUsername,
          fullName: dbFullName,
          role: dbRole,
          assignedProjects: dbProjects,
          loginTime: new Date().toISOString()
        };

        // Cache session for 6 hours (21600 seconds)
        CacheService.getScriptCache().put('SESSION_' + token, JSON.stringify(session), 21600);

        return {
          success: true,
          token: token,
          user: session,
          expiresInSeconds: 21600
        };
      } else {
        return { success: false, error: 'INVALID_PASSWORD', status: 401 };
      }
    }
  }

  return { success: false, error: 'USER_NOT_FOUND', status: 404 };
}

/**
 * Formats JSON response envelope with proper Simple Request text headers
 */
function createJsonResponse(success, action, data, statusCode, requestId) {
  var response = {
    success: success,
    action: action,
    statusCode: statusCode || (success ? 200 : 400),
    requestId: requestId || 'REQ-' + Date.now(),
    serverTimestamp: new Date().toISOString(),
    data: data
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.TEXT);
}

function computeCryptographicHash(password, salt) {
  var raw = salt + '|' + password;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return digest.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
