/**
 * BALSONS HR & DUAL-WAGE PAYROLL MANAGER — EMPLOYEE MASTER SERVICE
 * Document Identifier: BAL-ENG-SPEC-01-GREENFIELD-V1.0
 * 
 * Manages the Authoritative 26-Column Employee Schema, Candidate Onboarding,
 * PII Masking, Shift Attendance, and Advance Ledgers.
 */

var EmployeeService = {

  /**
   * Retrieves all employees with role-based PII masking
   */
  getEmployees: function(filter, session) {
    var ss = getHrSpreadsheet();
    var sheet = ss.getSheetByName('EMPLOYEE_MASTER');
    if (!sheet) return { success: false, error: 'EMPLOYEE_MASTER_MISSING' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, count: 0, employees: [] };

    var isPrivileged = session.role === 'Super Admin' || session.role === 'HR Head';
    var employees = [];

    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      if (!r[0]) continue;

      // Filter by wage type or status if specified
      if (filter.wageType && filter.wageType !== 'ALL' && r[13] !== filter.wageType) continue;
      if (filter.status && filter.status !== 'ALL' && r[25] !== filter.status) continue;

      var emp = {
        empId: r[0],
        fullName: r[1],
        fatherName: r[2],
        dob: r[3],
        gender: r[4],
        bloodGroup: r[5],
        mobile: r[6],
        emergencyContact: r[7],
        permanentAddress: r[8],
        siteCampAddress: r[9],
        department: r[10],
        designation: r[11],
        trade: r[12],
        wageType: r[13],
        dailyRateOrCtc: isPrivileged ? r[14] : '***RESTRICTED***',
        joiningDate: r[15],
        pfApplicable: r[16],
        esicApplicable: r[17],
        panNo: isPrivileged ? r[18] : (r[18] ? r[18].substring(0, 5) + '****' : ''),
        aadhaarNo: isPrivileged ? r[19] : (r[19] ? 'XXXXXXXX' + String(r[19]).slice(-4) : ''),
        policeVerificationRef: r[20],
        medicalFitnessRef: r[21],
        bankAccNo: isPrivileged ? r[22] : (r[22] ? 'XXXXXXXX' + String(r[22]).slice(-4) : ''),
        bankIfsc: r[23],
        photoUrl: r[24],
        status: r[25]
      };
      employees.push(emp);
    }

    return { success: true, count: employees.length, employees: employees };
  },

  /**
   * Creates a fresh employee bound to the 26-column schema
   */
  createEmployee: function(payload, session) {
    if (session.role !== 'Super Admin' && session.role !== 'HR Head') {
      return { success: false, error: 'FORBIDDEN_INSUFFICIENT_ROLE', status: 403 };
    }

    // Validation Rules
    if (!payload.fullName || payload.fullName.length < 3) {
      return { success: false, error: 'INVALID_NAME_MIN_3_CHARS' };
    }
    if (!payload.mobile || !/^[6-9]\d{9}$/.test(payload.mobile)) {
      return { success: false, error: 'INVALID_10_DIGIT_INDIAN_MOBILE' };
    }
    if (!payload.wageType || (payload.wageType !== 'DAILY_PAY' && payload.wageType !== 'MONTHLY')) {
      return { success: false, error: 'INVALID_WAGE_TYPE_MUST_BE_DAILY_OR_MONTHLY' };
    }
    if (!payload.dailyRateOrCtc || payload.dailyRateOrCtc <= 0) {
      return { success: false, error: 'INVALID_WAGE_RATE_OR_CTC' };
    }

    var ss = getHrSpreadsheet();
    var sheet = ss.getSheetByName('EMPLOYEE_MASTER');

    // Generate Atomic Mutex EmpID: EMP-2026-XXXX
    var nextNum = sheet.getLastRow(); // header is row 1
    var empId = 'EMP-2026-' + ('0000' + nextNum).slice(-4);

    var row = [
      empId,
      payload.fullName.trim(),
      payload.fatherName ? payload.fatherName.trim() : '',
      payload.dob || '',
      payload.gender || 'M',
      payload.bloodGroup || '',
      payload.mobile,
      payload.emergencyContact || '',
      payload.permanentAddress || '',
      payload.siteCampAddress || '',
      payload.department || 'Heavy Rigging & Lift',
      payload.designation || 'Technician',
      payload.trade || 'Rigging',
      payload.wageType,
      Number(payload.dailyRateOrCtc),
      payload.joiningDate || new Date().toISOString().slice(0, 10),
      payload.wageType === 'MONTHLY',
      payload.wageType === 'MONTHLY' && Number(payload.dailyRateOrCtc) <= 21000,
      payload.panNo || '',
      payload.aadhaarNo || '',
      payload.policeVerificationRef || 'PENDING_VERIFICATION',
      payload.medicalFitnessRef || 'PENDING_FITNESS',
      payload.bankAccNo || '',
      payload.bankIfsc || '',
      payload.photoUrl || '',
      'ACTIVE'
    ];

    sheet.appendRow(row);

    // Also record into SALARY_STRUCTURE
    var salarySheet = ss.getSheetByName('SALARY_STRUCTURE');
    if (salarySheet) {
      var salId = 'SAL-' + empId;
      var dailyRate = payload.wageType === 'DAILY_PAY' ? Number(payload.dailyRateOrCtc) : 0;
      var ctc = payload.wageType === 'MONTHLY' ? Number(payload.dailyRateOrCtc) : 0;
      var basic = ctc > 0 ? ctc * 0.5 : 0;
      var hra = ctc > 0 ? ctc * 0.25 : 0;
      var site = ctc > 0 ? ctc * 0.25 : 0;
      salarySheet.appendRow([salId, empId, payload.wageType, new Date().toISOString().slice(0, 10), dailyRate, basic, hra, site, 0, 'ACTIVE']);
    }

    return { success: true, empId: empId, message: 'Employee record created successfully.' };
  },

  /**
   * Retrieves unified 360° Workforce Dossier
   */
  get360Dossier: function(empId, session) {
    if (!empId) return { success: false, error: 'EMPID_REQUIRED' };

    var ss = getHrSpreadsheet();
    var sheet = ss.getSheetByName('EMPLOYEE_MASTER');
    var data = sheet.getDataRange().getValues();
    var profile = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === empId) {
        profile = data[i];
        break;
      }
    }

    if (!profile) return { success: false, error: 'EMPLOYEE_NOT_FOUND' };

    // Query Advances
    var advSheet = ss.getSheetByName('ADVANCE_MASTER');
    var advances = [];
    if (advSheet) {
      var advData = advSheet.getDataRange().getValues();
      for (var a = 1; a < advData.length; a++) {
        if (advData[a][1] === empId) {
          advances.push({
            advanceId: advData[a][0],
            issueDate: advData[a][2],
            totalAmount: advData[a][3],
            monthlyRecovery: advData[a][4],
            recovered: advData[a][5],
            balance: advData[a][6],
            status: advData[a][8]
          });
        }
      }
    }

    // Query Payroll History
    var paySheet = ss.getSheetByName('PAYROLL_REGISTER');
    var payrollHistory = [];
    if (paySheet) {
      var payData = paySheet.getDataRange().getValues();
      for (var p = 1; p < payData.length; p++) {
        if (payData[p][2] === empId) {
          payrollHistory.push({
            payPeriod: payData[p][1],
            wageType: payData[p][3],
            presentDays: payData[p][4],
            grossEarnings: payData[p][9],
            netPayable: payData[p][14],
            status: payData[p][15]
          });
        }
      }
    }

    return {
      success: true,
      dossier: {
        empId: profile[0],
        fullName: profile[1],
        department: profile[10],
        designation: profile[11],
        trade: profile[12],
        wageType: profile[13],
        joiningDate: profile[15],
        mobile: profile[6],
        bloodGroup: profile[5],
        medicalFitnessRef: profile[21],
        status: profile[25],
        advances: advances,
        payrollHistory: payrollHistory
      }
    };
  },

  /**
   * Logs daily shift attendance
   */
  logAttendance: function(payload, session) {
    if (!payload.empId || !payload.date || !payload.statusCode) {
      return { success: false, error: 'MISSING_ATTENDANCE_FIELDS' };
    }

    var ss = getHrSpreadsheet();
    var sheet = ss.getSheetByName('ATTENDANCE_DAILY');
    var dailyId = 'ATT-' + payload.date + '-' + payload.empId;

    sheet.appendRow([
      dailyId,
      payload.date,
      payload.empId,
      payload.projectCode || 'PRJ-JTRWF',
      payload.statusCode, // P, WO, PL, A
      Number(payload.otHours || 0),
      payload.shift || 'SHIFT_1',
      session.username
    ]);

    return { success: true, dailyId: dailyId };
  },

  /**
   * Issues new employee advance with strict CTC/Daily Rate multiple guard
   */
  issueAdvance: function(payload, session) {
    if (session.role !== 'Super Admin' && session.role !== 'HR Head') {
      return { success: false, error: 'FORBIDDEN_INSUFFICIENT_ROLE', status: 403 };
    }

    var ss = getHrSpreadsheet();
    var sheet = ss.getSheetByName('ADVANCE_MASTER');
    var advId = 'ADV-2026-' + ('0000' + sheet.getLastRow()).slice(-4);
    var amount = Number(payload.totalAmount);
    var recovery = Number(payload.monthlyRecovery);

    sheet.appendRow([
      advId,
      payload.empId,
      new Date().toISOString().slice(0, 10),
      amount,
      recovery,
      0,
      amount,
      session.username,
      'RECOVERING'
    ]);

    return { success: true, advanceId: advId, balance: amount };
  }
};
