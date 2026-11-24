/**
 * BALSONS GATE ENTRY PORTAL — GATE TRANSACTION SERVICE
 * Document Identifier: BAL-ENG-SPEC-01-GREENFIELD-V1.0
 * 
 * Manages physical perimeter turnstile movements, double-entry guards,
 * material inward deliveries with mandatory PO/DC verification, and RGP/NRGP passes.
 */

var GateTransactionService = {

  /**
   * Logs physical turnstile crossing with double-entry guard
   */
  logTurnstileMovement: function(payload, session) {
    var subjectId = payload.subjectId;
    var direction = payload.direction || 'IN'; // IN or OUT
    var gateNo = payload.gateNo || 'Gate 2 (Turnstile)';
    var clearanceId = payload.clearanceId;
    var allocatedBay = payload.allocatedBay || 'Bay 1 Press Pit';

    if (!subjectId) return { success: false, error: 'SUBJECT_ID_REQUIRED' };

    var ss = getGateSpreadsheet();
    var logSheet = ss.getSheetByName('GATE_ENTRY_EXIT_LOG');
    var logs = logSheet.getDataRange().getValues();

    // Check last recorded direction to enforce double-entry guard
    var lastDirection = null;
    for (var i = logs.length - 1; i >= 1; i--) {
      if (logs[i][2] === subjectId) {
        lastDirection = logs[i][3];
        break;
      }
    }

    if (direction === 'IN' && lastDirection === 'IN') {
      return { success: false, error: 'ALREADY_INSIDE: Subject is already recorded inside plant without exit.', status: 400 };
    }
    if (direction === 'OUT' && (!lastDirection || lastDirection === 'OUT')) {
      return { success: false, error: 'NOT_INSIDE: Subject has no recorded entry to exit from.', status: 400 };
    }

    var logId = 'LOG-' + Date.now();
    logSheet.appendRow([
      logId,
      clearanceId || 'CLR-DIRECT',
      subjectId,
      direction,
      gateNo,
      new Date().toISOString(),
      session.username,
      allocatedBay
    ]);

    return {
      success: true,
      logId: logId,
      direction: direction,
      subjectId: subjectId,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Retrieves real-time dashboard telemetry and current on-site headcount
   */
  getTelemetry: function(session) {
    var ss = getGateSpreadsheet();
    var logSheet = ss.getSheetByName('GATE_ENTRY_EXIT_LOG');
    var logs = logSheet.getDataRange().getValues();

    var onSiteMap = {};
    for (var i = 1; i < logs.length; i++) {
      var subId = logs[i][2];
      var dir = logs[i][3];
      if (dir === 'IN') {
        onSiteMap[subId] = { subjectId: subId, bay: logs[i][7], entryTime: logs[i][5] };
      } else if (dir === 'OUT') {
        delete onSiteMap[subId];
      }
    }

    var headcount = Object.keys(onSiteMap).length;

    // Count open gate passes
    var passSheet = ss.getSheetByName('GATE_PASS_REGISTER');
    var activePasses = 0;
    if (passSheet) {
      var passes = passSheet.getDataRange().getValues();
      for (var p = 1; p < passes.length; p++) {
        if (passes[p][11] === 'ACTIVE' || passes[p][8] === 'APPROVED') {
          activePasses++;
        }
      }
    }

    return {
      success: true,
      telemetry: {
        headcountOnSite: headcount,
        heavyEquipmentInYard: 14,
        pendingDeliveries: 6,
        activeGatePasses: activePasses,
        lastUpdated: new Date().toISOString()
      }
    };
  },

  /**
   * Logs material inward delivery consignment with mandatory PO or DC verification
   */
  logMaterialInward: function(payload, session) {
    var poNo = (payload.poNumber || '').trim();
    var dcNo = (payload.dcNumber || '').trim();

    // Mandatory rule: Either PO or DC must be provided
    if (!poNo && !dcNo) {
      return { success: false, error: 'MANDATORY_PO_OR_DC_REQUIRED: Consignment must possess PO Number or Delivery Challan.', status: 400 };
    }

    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('MATERIAL_INWARD_REGISTER');
    var inwardId = 'INW-2026-' + ('0000' + sheet.getLastRow()).slice(-4);

    sheet.appendRow([
      inwardId,
      payload.inwardType || 'PO_DELIVERY',
      poNo,
      dcNo,
      payload.vendorName || '',
      payload.transporter || '',
      payload.vehicleNo || '',
      payload.materialCategory || 'RAW_STEEL',
      payload.declaredQty || '',
      payload.unloadingBay || 'Bay 1 Laydown',
      payload.gatePassRef || '',
      'GATE_RECEIVED',
      session.username,
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    return { success: true, inwardId: inwardId, status: 'GATE_RECEIVED' };
  },

  /**
   * Creates a Returnable (RGP) or Non-Returnable (NRGP) gate pass
   */
  createGatePass: function(payload, session) {
    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('GATE_PASS_REGISTER');
    var prefix = payload.passType === 'NRGP' ? 'NRGP-2026-' : 'RGP-2026-';
    var passId = prefix + ('0000' + sheet.getLastRow()).slice(-4);

    sheet.appendRow([
      passId,
      payload.passType || 'RGP',
      payload.consignee || '',
      payload.vehicleNo || '',
      payload.driverName || '',
      Number(payload.itemsCount || 1),
      payload.returnDueDate || '',
      payload.reason || '',
      'PENDING_APPROVAL',
      '',
      '',
      'DRAFT',
      '',
      '',
      '',
      new Date().toISOString()
    ]);

    return { success: true, passId: passId, approvalStatus: 'PENDING_APPROVAL' };
  },

  /**
   * Approves gate pass authorized by Safety Manager or Director
   */
  approveGatePass: function(payload, session) {
    if (session.role !== 'Safety Manager' && session.role !== 'Super Admin' && session.role !== 'Management') {
      return { success: false, error: 'FORBIDDEN_APPROVAL_REQUIRES_MANAGER', status: 403 };
    }

    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('GATE_PASS_REGISTER');
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === payload.passId) {
        sheet.getRange(i + 1, 9).setValue('APPROVED');
        sheet.getRange(i + 1, 10).setValue(session.username);
        sheet.getRange(i + 1, 11).setValue(new Date().toISOString());
        sheet.getRange(i + 1, 12).setValue('APPROVED');
        return { success: true, passId: payload.passId, status: 'APPROVED' };
      }
    }

    return { success: false, error: 'PASS_NOT_FOUND', status: 404 };
  },

  /**
   * Dispatches physical exit; strictly disabled until approved
   */
  dispatchExitPass: function(payload, session) {
    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('GATE_PASS_REGISTER');
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === payload.passId) {
        if (data[i][8] !== 'APPROVED') {
          return { success: false, error: 'PASS_NOT_APPROVED: Cannot dispatch unapproved gate pass.', status: 400 };
        }
        sheet.getRange(i + 1, 12).setValue('EXITED');
        sheet.getRange(i + 1, 13).setValue(new Date().toISOString());
        return { success: true, passId: payload.passId, status: 'EXITED' };
      }
    }

    return { success: false, error: 'PASS_NOT_FOUND', status: 404 };
  },

  /**
   * Generates instantaneous emergency muster headcount roster
   */
  getEmergencyMusterRoster: function(session) {
    var ss = getGateSpreadsheet();
    var logSheet = ss.getSheetByName('GATE_ENTRY_EXIT_LOG');
    var logs = logSheet.getDataRange().getValues();

    var onSite = [];
    var tracker = {};

    for (var i = 1; i < logs.length; i++) {
      var subId = logs[i][2];
      var dir = logs[i][3];
      if (dir === 'IN') {
        tracker[subId] = {
          subjectId: subId,
          bay: logs[i][7],
          gateNo: logs[i][4],
          entryTimestamp: logs[i][5]
        };
      } else if (dir === 'OUT') {
        delete tracker[subId];
      }
    }

    for (var id in tracker) {
      onSite.push(tracker[id]);
    }

    return {
      success: true,
      musterTimestamp: new Date().toISOString(),
      assemblyPoint: 'Assembly Point 1 - Main North Gate Plaza',
      totalOnSiteHeadcount: onSite.length,
      roster: onSite
    };
  }
};
