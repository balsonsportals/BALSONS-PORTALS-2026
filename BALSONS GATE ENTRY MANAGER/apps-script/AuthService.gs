/**
 * BALSONS GATE ENTRY PORTAL — AUTHENTICATION & ACCESS SERVICE
 * Document Identifier: BAL-ENG-SPEC-03-GREENFIELD-V1.0
 */

var AuthService = {

  login: function(payload) {
    var username = (payload.username || '').trim().toLowerCase();
    var password = payload.password || '';

    if (!username || !password) {
      return { success: false, error: 'MISSING_CREDENTIALS', status: 400 };
    }

    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('USER_MASTER');
    if (!sheet) return { success: false, error: 'USER_MASTER_MISSING', status: 500 };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var dbUser = (r[1] || '').toString().toLowerCase();
      var dbFullName = r[2];
      var dbRole = r[3];
      var dbHash = r[4];
      var dbSalt = r[5];
      var dbActive = r[6];

      if (dbUser === username) {
        if (dbActive !== 'ACTIVE') {
          return { success: false, error: 'ACCOUNT_DISABLED', status: 403 };
        }

        var computed = this.computeHash(password, dbSalt);
        if (computed === dbHash) {
          var token = 'BT-' + Utilities.getUuid() + '-' + Date.now();
          var session = {
            userId: r[0],
            username: dbUser,
            fullName: dbFullName,
            role: dbRole,
            loginTime: new Date().toISOString()
          };

          // Cache session for 6 hours (21600 seconds)
          CacheService.getScriptCache().put('GATE_SESSION_' + token, JSON.stringify(session), 21600);

          // Update LastLogin timestamp in row
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString());

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
  },

  validateToken: function(token) {
    if (!token) return null;
    var raw = CacheService.getScriptCache().get('GATE_SESSION_' + token);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  computeHash: function(password, salt) {
    var raw = salt + '|' + password;
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
    return digest.map(function(b) {
      var v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
  }
};
