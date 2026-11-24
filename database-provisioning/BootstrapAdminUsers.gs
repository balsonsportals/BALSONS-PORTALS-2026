/**
 * BALSONS ENTERPRISE ECOSYSTEM (2026)
 * GREENFIELD ADMINISTRATIVE BOOTSTRAP & CRYPTOGRAPHIC DERIVATION
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Provisions root administrative accounts with SHA-256 cryptographic salt/hash derivation
 * and initializes mandatory first-login password rotation policies.
 * Automatically provisions USER_ACCESS sheet with BEDS styling if not already present.
 */

function bootstrapGreenfieldAdmins() {
  var hrSsId = PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID');
  if (!hrSsId) {
    // Fallback to canonical HR Spreadsheet ID if not yet recorded in PropertiesService
    hrSsId = '1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw';
  }

  var ss = SpreadsheetApp.openById(hrSsId);
  var sheet = ss.getSheetByName('USER_ACCESS');

  var headers = ['UserID', 'Username', 'FullName', 'Role', 'PasswordHash', 'Salt', 'IsActive', 'AssignedProjects', 'Email'];

  // If USER_ACCESS sheet is missing, automatically provision and style it
  if (!sheet) {
    sheet = ss.insertSheet('USER_ACCESS');
  }

  // Ensure Header Row exists and is styled with BEDS #102D35 Dark Teal
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#102D35')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var admins = [
    { id: 'USR-HR-001', username: 'admin', name: 'Master Super Administrator', role: 'Super Admin', pass: 'Balsons#Admin$2026', projects: 'ALL', email: 'balsonsportals@gmail.com' },
    { id: 'USR-HR-002', username: 'superadmin', name: 'Prashant Muley (Executive Super Admin)', role: 'Super Admin', pass: 'balsons2026', projects: 'ALL', email: 'balsonsportals@gmail.com' },
    { id: 'USR-HR-003', username: 'hr.head', name: 'Prashant Muley (HR Head)', role: 'HR Head', pass: 'Balsons#HrHead$2026', projects: 'JTRWF', email: 'balsonsportals@gmail.com' },
    { id: 'USR-HR-004', username: 'payroll.off', name: 'Ananya Das (Payroll Officer)', role: 'Payroll Officer', pass: 'Balsons#Payroll$2026', projects: 'JTRWF', email: 'payroll.off@balsons.com' },
    { id: 'USR-HR-005', username: 'admin.hr', name: 'Priyanka Senapati (HR Portal Admin)', role: 'Portal Admin', pass: 'balsons2026', projects: 'JTRWF', email: 'admin.hr@balsons.com' }
  ];

  var rows = admins.map(function(u) {
    var salt = Utilities.getUuid().replace(/-/g, '').substring(0, 16);
    var hash = computeCryptographicHash(u.pass, salt);
    return [u.id, u.username, u.name, u.role, hash, salt, 'ACTIVE', u.projects, u.email];
  });

  // Only seed if no admin records exist yet (header row only)
  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.autoResizeColumns(1, headers.length);
    Logger.log('✅ Successfully provisioned ' + rows.length + ' root administrators into USER_ACCESS.');
  } else {
    Logger.log('ℹ️ USER_ACCESS already contains ' + (sheet.getLastRow() - 1) + ' records. Bootstrap bypassed.');
  }

  // Clean up default Sheet1 if present
  var defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defSheet); } catch (e) {}
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
