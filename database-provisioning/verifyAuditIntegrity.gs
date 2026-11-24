/**
 * BALSONS ENTERPRISE ECOSYSTEM (2026)
 * TAMPER-EVIDENT AUDIT INTEGRITY AUDITOR
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Cryptographically verifies continuous SHA-256 hash chain continuity in AUDIT_LOG.
 */

function verifyAuditIntegrity(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName('AUDIT_LOG');
  if (!sheet) return { success: false, reason: 'AUDIT_LOG sheet not found in spreadsheet.' };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, count: 0, message: 'AUDIT_LOG is empty. Chain is intact.' };

  var prevHash = 'GENESIS_HASH_BALSONS_2026';
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var auditId = row[0];
    var timestamp = row[1];
    var actor = row[2];
    var role = row[3];
    var action = row[4];
    var entityRef = row[5];
    var outcome = row[6];
    var details = row[7];
    var recordedPrevHash = row[8];
    var recordedCurrentHash = row[9];

    if (recordedPrevHash !== prevHash) {
      return {
        tampered: true,
        violationRow: i + 1,
        auditId: auditId,
        reason: 'Broken Hash Chain detected. Expected PrevHash: ' + prevHash + ', Found: ' + recordedPrevHash
      };
    }

    var payload = [auditId, prevHash, timestamp, actor, role, action, entityRef, outcome, details].join('|');
    var calculatedHash = computeCryptographicHash(payload, 'AUDIT_SALT_2026');

    if (calculatedHash !== recordedCurrentHash) {
      return {
        tampered: true,
        violationRow: i + 1,
        auditId: auditId,
        reason: 'Content Tampering Detected. Calculated hash does not match recorded CurrentHash at row ' + (i + 1)
      };
    }

    prevHash = recordedCurrentHash;
  }

  return { 
    success: true, 
    verifiedRows: data.length - 1, 
    status: 'ALL_ROWS_CRYPTO_VERIFIED',
    lastHash: prevHash
  };
}

function computeCryptographicHash(password, salt) {
  var raw = salt + '|' + password;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return digest.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
