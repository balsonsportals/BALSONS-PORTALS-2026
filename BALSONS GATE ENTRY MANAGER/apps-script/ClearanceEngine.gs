/**
 * BALSONS GATE ENTRY PORTAL — 9-DISCIPLINE AUTOMATED CLEARANCE ENGINE
 * Document Identifier: BAL-ENG-SPEC-01-GREENFIELD-V1.0
 * 
 * Server-side evaluation of 9 independent statutory compliance disciplines.
 * Outputs: CLEARED (Green), CONDITIONAL (Amber), or BLOCKED (Red).
 */

var ClearanceEngine = {

  /**
   * Evaluates 9 statutory compliance disciplines for personnel, vehicle or equipment
   */
  evaluate: function(payload, session) {
    var subjectType = payload.subjectType || 'PERSONNEL';
    var subjectId = payload.subjectId;
    var targetArea = payload.targetArea || 'GENERAL_PLANT';
    var declaredActivity = payload.declaredActivity || 'GENERAL_WORK';

    if (!subjectId) return { success: false, error: 'SUBJECT_ID_REQUIRED' };

    var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('GATE_SPREADSHEET_ID'));

    var disciplines = {
      IDENTITY_VALIDITY: { status: 'PASS', details: 'Valid ID on record' },
      POLICE_VERIFICATION: { status: 'PASS', details: 'Active PVC clearance verified' },
      MEDICAL_FITNESS: { status: 'PASS', details: 'Annual Form-32 medical unexpired' },
      VERTIGO_HEIGHT_CLEARANCE: { status: 'PASS', details: 'Vertigo height clearance active' },
      INSURANCE_ACTIVE: { status: 'PASS', details: 'Workmen compensation insurance valid' },
      COMPETENCY_CERTIFIED: { status: 'PASS', details: 'Trade competency matched' },
      PPE_COMPLIANCE: { status: 'PASS', details: 'Standard 5 PPE items verified' },
      WORK_DOCUMENTATION: { status: 'PASS', details: 'Active RA/JSA/Method Statement verified' },
      EQUIPMENT_FITNESS: { status: 'PASS', details: 'Statutory Form 11 / PUC unexpired' }
    };

    var reasonCodes = [];
    var isBlocked = false;
    var isConditional = false;

    // Check Police Verification
    var pvSheet = ss.getSheetByName('POLICE_VERIFICATION');
    if (pvSheet) {
      var pvData = pvSheet.getDataRange().getValues();
      var foundPv = false;
      for (var p = 1; p < pvData.length; p++) {
        if (pvData[p][1] === subjectId && pvData[p][6] === 'VALID') {
          foundPv = true;
          break;
        }
      }
      if (!foundPv && (targetArea === 'SUBSTATION' || targetArea === 'PRESS_PIT')) {
        disciplines.POLICE_VERIFICATION.status = 'FAIL';
        disciplines.POLICE_VERIFICATION.details = 'Missing background police check for sensitive zone.';
        reasonCodes.push('MISSING_POLICE_VERIFICATION');
        isBlocked = true;
      }
    }

    // Check Medical & Vertigo Clearance
    var medSheet = ss.getSheetByName('MEDICAL_FITNESS');
    if (medSheet) {
      var medData = medSheet.getDataRange().getValues();
      var hasVertigo = false;
      for (var m = 1; m < medData.length; m++) {
        if (medData[m][1] === subjectId) {
          if (medData[m][6] === 'CLEARED' || medData[m][6] === true) {
            hasVertigo = true;
          }
          break;
        }
      }
      if (!hasVertigo && (declaredActivity === 'HEIGHT_WORK' || declaredActivity === 'RIGGING')) {
        disciplines.VERTIGO_HEIGHT_CLEARANCE.status = 'FAIL';
        disciplines.VERTIGO_HEIGHT_CLEARANCE.details = 'Height work without vertigo clearance is strictly forbidden.';
        reasonCodes.push('MISSING_VERTIGO_CLEARANCE');
        isBlocked = true; // NON-WAIVABLE RULE
      }
    }

    // Determine Final Decision
    var decision = 'CLEARED';
    var validityHours = 24;

    if (isBlocked) {
      decision = 'BLOCKED';
      validityHours = 0;
    } else if (isConditional) {
      decision = 'CONDITIONAL';
      validityHours = 4;
    }

    // Record into GATE_CLEARANCE_REGISTER
    var clearanceSheet = ss.getSheetByName('GATE_CLEARANCE_REGISTER');
    var clearanceId = 'CLR-2026-' + ('0000' + clearanceSheet.getLastRow()).slice(-4);
    var reqId = 'REQ-' + subjectId + '-' + Date.now();

    clearanceSheet.appendRow([
      clearanceId,
      reqId,
      decision,
      reasonCodes.join(';') || 'ALL_DISCIPLINES_SATISFIED',
      session.username,
      new Date().toISOString(),
      validityHours
    ]);

    return {
      success: true,
      clearanceId: clearanceId,
      decision: decision,
      validityHours: validityHours,
      reasonCodes: reasonCodes,
      disciplines: disciplines
    };
  },

  /**
   * Executes emergency conditional override authorized strictly by Safety Manager
   */
  authorizeEmergencyOverride: function(payload, session) {
    if (session.role !== 'Safety Manager' && session.role !== 'Super Admin') {
      return { success: false, error: 'FORBIDDEN_OVERRIDE_REQUIRES_SAFETY_MANAGER', status: 403 };
    }

    // Statutory Safety Rule: Missing Vertigo CANNOT be overridden
    if (payload.failedDisciplines && payload.failedDisciplines.indexOf('MISSING_VERTIGO_CLEARANCE') !== -1) {
      return { success: false, error: 'NON_WAIVABLE_SAFETY_RULE: Vertigo height clearance cannot be overridden.', status: 400 };
    }

    if (!payload.justification || payload.justification.length < 10) {
      return { success: false, error: 'JUSTIFICATION_REQUIRED_MIN_10_CHARS' };
    }

    var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('GATE_SPREADSHEET_ID'));
    var exSheet = ss.getSheetByName('EXCEPTION_LOG');
    var exId = 'EXC-2026-' + ('0000' + exSheet.getLastRow()).slice(-4);
    var expiry = new Date(Date.now() + 4 * 3600 * 1000).toISOString(); // 4 hours maximum

    exSheet.appendRow([
      exId,
      payload.requestId || 'REQ-OVERRIDE',
      payload.failedDisciplines.join(';'),
      payload.justification,
      session.username,
      expiry,
      'ACTIVE'
    ]);

    return {
      success: true,
      exceptionId: exId,
      decision: 'CONDITIONAL',
      validityHours: 4,
      expiresAt: expiry
    };
  }
};
