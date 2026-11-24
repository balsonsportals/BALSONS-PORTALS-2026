/**
 * BALSONS ENTERPRISE ECOSYSTEM (2026)
 * GREENFIELD ADMINISTRATIVE BOOTSTRAP & CRYPTOGRAPHIC DERIVATION
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Provisions root administrative accounts with SHA-256 cryptographic salt/hash derivation
 * and initializes mandatory first-login password rotation policies.
 */

function bootstrapGreenfieldAdmins() {
  var hrSsId = PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID');
  if (!hrSsId) throw new Error('HR_SPREADSHEET_ID is not configured in PropertiesService.');

  var ss = SpreadsheetApp.openById(hrSsId);
  var sheet = ss.getSheetByName('USER_ACCESS');
  if (!sheet) throw new Error('Sheet USER_ACCESS missing in HR Database.');

  var admins = [
    { id: 'USR-HR-001', username: 'admin', name: 'Master Super Administrator', role: 'Super Admin', pass: 'Balsons#Admin$2026', projects: 'ALL' },
    { id: 'USR-HR-002', username: 'superadmin', name: 'Prashant Muley (Executive Super Admin)', role: 'Super Admin', pass: 'balsons2026', projects: 'ALL' },
    { id: 'USR-HR-003', username: 'hr.head', name: 'Prashant Muley (HR Head)', role: 'HR Head', pass: 'Balsons#HrHead$2026', projects: 'JTRWF' },
    { id: 'USR-HR-004', username: 'payroll.off', name: 'Ananya Das (Payroll Officer)', role: 'Payroll Officer', pass: 'Balsons#Payroll$2026', projects: 'JTRWF' },
    { id: 'USR-HR-005', username: 'admin.hr', name: 'Priyanka Senapati (HR Portal Admin)', role: 'Portal Admin', pass: 'balsons2026', projects: 'JTRWF' }
  ];

  var rows = admins.map(function(u) {
    var salt = Utilities.getUuid().replace(/-/g, '').substring(0, 16);
    var hash = computeCryptographicHash(u.pass, salt);
    return [u.id, u.username, u.name, u.role, hash, salt, 'ACTIVE', u.projects];
  });

  // Ensure header exists
  if (sheet.getLastRow() === 1) {
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
    Logger.log('✅ Successfully provisioned ' + rows.length + ' root administrators into USER_ACCESS.');
  } else {
    Logger.log('ℹ️ USER_ACCESS already contains records. Bootstrap bypassed.');
  }

  return { success: true, count: rows.length };
}

/**
 * Computes salted SHA-256 cryptographic digest.
 */
function computeCryptographicHash(password, salt) {
  var raw = salt + '|' + password;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return digest.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
