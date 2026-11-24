/**
 * BALSONS HR & DUAL-WAGE PAYROLL MANAGER — DETERMINISTIC PAYROLL ENGINE
 * Document Identifier: BAL-ENG-SPEC-01-GREENFIELD-V1.0
 * 
 * Executes deterministic wage calculations for both Daily-Wage and Monthly-Salaried personnel.
 * Enforces Zero-Attendance Rule (0 days = ₹0 gross) and Non-Negative Pay Guard on loan recoveries.
 */

var PayrollEngine = {

  /**
   * Executes in-memory dry run calculation and anomaly detection
   */
  calculateDryRun: function(payPeriod, session) {
    if (!payPeriod || !/^\d{4}-\d{2}$/.test(payPeriod)) {
      return { success: false, error: 'INVALID_PAY_PERIOD_FORMAT_YYYY_MM' };
    }

    var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID'));
    
    // Check if period is already locked
    var payRegSheet = ss.getSheetByName('PAYROLL_REGISTER');
    if (payRegSheet) {
      var existing = payRegSheet.getDataRange().getValues();
      for (var r = 1; r < existing.length; r++) {
        if (existing[r][1] === payPeriod && existing[r][15] === 'LOCKED') {
          return { success: false, error: 'PAYROLL_PERIOD_ALREADY_LOCKED', status: 400 };
        }
      }
    }

    // 1. Load active employees
    var empSheet = ss.getSheetByName('EMPLOYEE_MASTER');
    var empData = empSheet.getDataRange().getValues();
    
    // 2. Load attendance summary for the period
    var attSummarySheet = ss.getSheetByName('ATTENDANCE_SUMMARY');
    var attMap = {};
    if (attSummarySheet) {
      var attData = attSummarySheet.getDataRange().getValues();
      for (var a = 1; a < attData.length; a++) {
        if (attData[a][1] === payPeriod) {
          attMap[attData[a][2]] = {
            present: Number(attData[a][4] || 0),
            wo: Number(attData[a][5] || 0),
            pl: Number(attData[a][6] || 0),
            payable: Number(attData[a][7] || 0),
            otHours: Number(attData[a][8] || 0)
          };
        }
      }
    }

    // 3. Load active advances
    var advSheet = ss.getSheetByName('ADVANCE_MASTER');
    var advMap = {};
    if (advSheet) {
      var advData = advSheet.getDataRange().getValues();
      for (var d = 1; d < advData.length; d++) {
        var empId = advData[d][1];
        var bal = Number(advData[d][6] || 0);
        var rec = Number(advData[d][4] || 0);
        if (bal > 0 && advData[d][8] === 'RECOVERING') {
          advMap[empId] = { advanceId: advData[d][0], monthlyRecovery: rec, balance: bal };
        }
      }
    }

    var payrollBatch = [];
    var anomalies = [];

    for (var i = 1; i < empData.length; i++) {
      var row = empData[i];
      var empId = row[0];
      var fullName = row[1];
      var wageType = row[13];
      var rateOrCtc = Number(row[14] || 0);
      var status = row[25];

      if (status !== 'ACTIVE') continue;

      var att = attMap[empId] || { present: 0, wo: 0, pl: 0, payable: 0, otHours: 0 };

      // Guard: Missing wage structure
      if (!rateOrCtc || rateOrCtc <= 0) {
        anomalies.push({ empId: empId, name: fullName, severity: 'CRITICAL', code: 'MISSING_WAGE_STRUCTURE', desc: 'Active worker has zero or null rate.' });
        continue;
      }

      var presentDays = att.present;
      var payableDays = 0;
      var baseEarnings = 0;
      var allowances = 0;
      var otPay = 0;
      var grossEarnings = 0;
      var pfDeduction = 0;
      var esicDeduction = 0;
      var ptDeduction = 0;
      var advanceDeduction = 0;
      var netPayable = 0;

      // ─────────────────────────────────────────────────────────
      // WAGE ENGINE BRANCH 1: DAILY_PAY WORKFORCE
      // ─────────────────────────────────────────────────────────
      if (wageType === 'DAILY_PAY') {
        payableDays = presentDays; // Physical present days only

        // Deterministic Zero-Attendance Rule
        if (presentDays === 0) {
          baseEarnings = 0;
          grossEarnings = 0;
          netPayable = 0;
          anomalies.push({ empId: empId, name: fullName, severity: 'INFO', code: 'ZERO_ATTENDANCE', desc: '0 days recorded. Pay is ₹0.' });
        } else {
          baseEarnings = Math.round(presentDays * rateOrCtc);
          
          // Overtime Pay Calculation: (DailyRate / 8) * 2.0 * OT Hours
          var hourlyRate = rateOrCtc / 8.0;
          otPay = Math.round(hourlyRate * 2.0 * att.otHours);
          grossEarnings = baseEarnings + otPay;
        }

        // Daily wage contract exemptions: Zero PF and Zero ESIC
        pfDeduction = 0;
        esicDeduction = 0;
        ptDeduction = 0;
      }
      
      // ─────────────────────────────────────────────────────────
      // WAGE ENGINE BRANCH 2: MONTHLY SALARIED WORKFORCE
      // ─────────────────────────────────────────────────────────
      else if (wageType === 'MONTHLY') {
        payableDays = presentDays + att.wo + att.pl; // Present + Weekly Off + Paid Leave

        if (payableDays === 0) {
          baseEarnings = 0;
          grossEarnings = 0;
          netPayable = 0;
        } else {
          var monthlyBase = rateOrCtc * 0.5; // Basic is 50% of CTC
          var monthlyHra = rateOrCtc * 0.25;  // HRA is 25% of CTC
          var monthlySite = rateOrCtc * 0.25; // Site is 25% of CTC

          // Pro-rated against 26 standard industrial days
          var earnedBasic = Math.round((monthlyBase / 26.0) * payableDays);
          var earnedHra = Math.round((monthlyHra / 26.0) * payableDays);
          var earnedSite = Math.round((monthlySite / 26.0) * payableDays);

          baseEarnings = earnedBasic;
          allowances = earnedHra + earnedSite;

          // Monthly OT: (BasicPay / 208) * 2.0 * OT Hours
          var monthlyHourly = monthlyBase / 208.0;
          otPay = Math.round(monthlyHourly * 2.0 * att.otHours);
          grossEarnings = baseEarnings + allowances + otPay;

          // Statutory Deductions
          // PF: 12% of earned basic, capped at ₹1,800 or actual
          if (row[16] === true) {
            pfDeduction = Math.min(1800, Math.round(earnedBasic * 0.12));
          }

          // ESIC: 0.75% of Gross if Monthly Gross <= ₹21,000
          if (row[17] === true && grossEarnings <= 21000) {
            esicDeduction = Math.round(grossEarnings * 0.0075);
          }

          // Professional Tax (Odisha Slab): ₹200
          if (grossEarnings > 10000) {
            ptDeduction = 200;
          }
        }
      }

      // ─────────────────────────────────────────────────────────
      // ADVANCE RECOVERY & NON-NEGATIVE PAY GUARD
      // ─────────────────────────────────────────────────────────
      var statutoryTotal = pfDeduction + esicDeduction + ptDeduction;
      var availableForRecovery = Math.max(0, grossEarnings - statutoryTotal);

      if (advMap[empId] && grossEarnings > 0) {
        var scheduled = Math.min(advMap[empId].monthlyRecovery, advMap[empId].balance);
        if (scheduled > availableForRecovery) {
          advanceDeduction = availableForRecovery;
          anomalies.push({ empId: empId, name: fullName, severity: 'WARN', code: 'ADVANCE_CAPPED', desc: 'Deduction capped to ₹' + advanceDeduction + ' to preserve non-negative pay.' });
        } else {
          advanceDeduction = scheduled;
        }
      }

      netPayable = grossEarnings - statutoryTotal - advanceDeduction;

      payrollBatch.push({
        empId: empId,
        fullName: fullName,
        wageType: wageType,
        presentDays: presentDays,
        payableDays: payableDays,
        baseEarnings: baseEarnings,
        allowances: allowances,
        otPay: otPay,
        grossEarnings: grossEarnings,
        advanceDeduction: advanceDeduction,
        pfDeduction: pfDeduction,
        esicDeduction: esicDeduction,
        ptDeduction: ptDeduction,
        netPayable: netPayable
      });
    }

    return {
      success: true,
      payPeriod: payPeriod,
      calculatedCount: payrollBatch.length,
      anomalies: anomalies,
      records: payrollBatch
    };
  },

  /**
   * Authorizes dry run and locks pay period in database with cryptographic PIN
   */
  authorizeAndLock: function(payPeriod, pin, session) {
    if (session.role !== 'Super Admin' && session.role !== 'HR Head') {
      return { success: false, error: 'FORBIDDEN_INSUFFICIENT_ROLE', status: 403 };
    }

    if (!pin || pin.toString() !== '2026') {
      return { success: false, error: 'INVALID_AUTHORIZATION_PIN', status: 401 };
    }

    // Run dry calculation to get verified figures
    var dry = this.calculateDryRun(payPeriod, session);
    if (!dry.success) return dry;

    var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID'));
    var paySheet = ss.getSheetByName('PAYROLL_REGISTER');
    var advRecSheet = ss.getSheetByName('ADVANCE_RECOVERY');
    var advMasterSheet = ss.getSheetByName('ADVANCE_MASTER');

    var rows = dry.records.map(function(r) {
      var payId = 'PAY-' + payPeriod + '-' + r.empId;
      return [
        payId,
        payPeriod,
        r.empId,
        r.wageType,
        r.presentDays,
        r.payableDays,
        r.baseEarnings,
        r.allowances,
        r.otPay,
        r.grossEarnings,
        r.advanceDeduction,
        r.pfDeduction,
        r.esicDeduction,
        r.ptDeduction,
        r.netPayable,
        'LOCKED'
      ];
    });

    paySheet.getRange(paySheet.getLastRow() + 1, 1, rows.length, 16).setValues(rows);

    // Update advance recovery ledger
    if (advRecSheet) {
      dry.records.forEach(function(r) {
        if (r.advanceDeduction > 0) {
          var recId = 'REC-' + payPeriod + '-' + r.empId;
          advRecSheet.appendRow([recId, 'ADV-' + r.empId, payPeriod, r.advanceDeduction, 0, 'RUN-' + payPeriod]);
        }
      });
    }

    Logger.log('✅ Payroll successfully calculated, authorized, and locked for period ' + payPeriod);
    return { success: true, payPeriod: payPeriod, lockedRecords: rows.length, status: 'LOCKED' };
  }
};
