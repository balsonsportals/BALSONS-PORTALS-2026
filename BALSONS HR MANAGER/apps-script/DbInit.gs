/**
 * BALSONS HR & DUAL-WAGE PAYROLL MANAGER — GREENFIELD DATABASE INITIALIZER
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Provisions all 22 relational sheets with BEDS enterprise styling (#102D35 headers, frozen top row)
 * and seeds master organizational dictionaries.
 */

function initializeFreshHrDatabase(targetSpreadsheetId) {
  var ssId = targetSpreadsheetId || PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID');
  if (!ssId) throw new Error('HR_SPREADSHEET_ID is not configured.');
  var ss = SpreadsheetApp.openById(ssId);

  var SCHEMAS = [
    ['SYSTEM_CONFIG', ['ConfigKey', 'ConfigValue', 'Description', 'EffectiveDate', 'UpdatedBy']],
    ['USER_ACCESS', ['UserID', 'Username', 'FullName', 'Role', 'PasswordHash', 'Salt', 'IsActive', 'AssignedProjects']],
    ['EMPLOYEE_MASTER', ['EmpID', 'FullName', 'FatherName', 'DOB', 'Gender', 'BloodGroup', 'Mobile', 'EmergencyContact', 'PermanentAddress', 'SiteCampAddress', 'Department', 'Designation', 'Trade', 'WageType', 'DailyRateOrCTC', 'JoiningDate', 'PF_Applicable', 'ESIC_Applicable', 'PAN_No', 'Aadhaar_No', 'PoliceVerification_Ref', 'MedicalFitness_Ref', 'BankAccNo', 'BankIFSC', 'PhotoUrl', 'Status']],
    ['EMPLOYEE_DOCUMENTS', ['DocID', 'EmpID', 'DocType', 'DocRefNo', 'IssueDate', 'ExpiryDate', 'VerificationStatus', 'DriveUrl']],
    ['DEPARTMENT_MASTER', ['DeptID', 'DeptName', 'CostCentre', 'HOD', 'Status']],
    ['PROJECT_MASTER', ['ProjectCode', 'ProjectName', 'Client', 'Location', 'ProjectManager', 'StartDate', 'Status']],
    ['EMPLOYEE_ALLOCATION', ['AllocID', 'EmpID', 'ProjectCode', 'AreaBay', 'EffectiveFrom', 'EffectiveTo', 'Status']],
    ['ATTENDANCE_DAILY', ['DailyID', 'Date', 'EmpID', 'ProjectCode', 'StatusCode', 'OT_Hours', 'Shift', 'SupervisorID']],
    ['ATTENDANCE_SUMMARY', ['SummaryID', 'PayPeriod', 'EmpID', 'WageType', 'PresentDays', 'WeeklyOff', 'PaidLeave', 'PayableDays', 'OT_Hours', 'Status']],
    ['LEAVE_MASTER', ['LeaveCode', 'LeaveName', 'AnnualEntitlement', 'CarryForwardLimit', 'Status']],
    ['LEAVE_TRANSACTIONS', ['LeaveTransID', 'EmpID', 'LeaveCode', 'FromDate', 'ToDate', 'DaysCount', 'ApprovalStatus', 'ApprovedBy']],
    ['SALARY_STRUCTURE', ['SalaryID', 'EmpID', 'WageType', 'EffectiveFrom', 'DailyRate', 'BasicPay', 'HRA', 'SiteAllowance', 'SpecialAllowance', 'Status']],
    ['ADVANCE_MASTER', ['AdvanceID', 'EmpID', 'IssueDate', 'TotalAmount', 'MonthlyRecovery', 'TotalRecovered', 'Balance', 'ApprovedBy', 'Status']],
    ['ADVANCE_RECOVERY', ['RecoveryID', 'AdvanceID', 'PayPeriod', 'DeductedAmount', 'RemainingBalance', 'PayrollRunID']],
    ['PAYROLL_INPUT', ['InputID', 'PayPeriod', 'EmpID', 'WageType', 'PayableDays', 'OT_Hours', 'SpecialIncentive', 'AdhocDeduction', 'VerifiedBy']],
    ['PAYROLL_REGISTER', ['PayrollID', 'PayPeriod', 'EmpID', 'WageType', 'PresentDays', 'PayableDays', 'BaseEarnings', 'Allowances', 'OT_Pay', 'GrossEarnings', 'AdvanceDeduction', 'PF_Deduction', 'ESIC_Deduction', 'PT_Deduction', 'NetPayable', 'Status']],
    ['SALARY_SLIP_LOG', ['SlipLogID', 'PayrollID', 'EmpID', 'WageType', 'PayPeriod', 'GeneratedTimestamp', 'Version', 'DriveFileUrl']],
    ['HR_DOCUMENTS_LOG', ['LogID', 'DocType', 'EmpID', 'TemplateID', 'IssuedDate', 'ApprovedBy', 'DriveRef']],
    ['EXIT_SETTLEMENT', ['ExitID', 'EmpID', 'LastWorkingDate', 'ClearanceStatus', 'Gratuity', 'LeaveEncashment', 'AdvanceRecovery', 'FinalNetSettlement', 'ApprovedBy']],
    ['APPROVAL_LOG', ['ApprovalID', 'Module', 'EntityRef', 'SubmittedBy', 'Action', 'ApproverRole', 'ApproverName', 'Timestamp', 'Comments']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'Actor', 'Role', 'Action', 'EntityRef', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']],
    ['BACKUP_LOG', ['BackupID', 'Timestamp', 'BackupType', 'TargetDriveId', 'Status', 'VerifiedBy']]
  ];

  SCHEMAS.forEach(function(item) {
    var sheetName = item[0];
    var headers = item[1];
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // Apply Headers & Styling
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#102D35')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  // Purge default Sheet1 if present
  var defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) ss.deleteSheet(defSheet);

  // Seed Reference Dictionaries
  seedHrMasterData(ss);

  Logger.log('✅ Successfully provisioned all ' + SCHEMAS.length + ' relational sheets in HR Database.');
  return { success: true, count: SCHEMAS.length };
}

/**
 * Seeds Master Organizational Data into HR Database
 */
function seedHrMasterData(ss) {
  // 1. DEPARTMENT_MASTER
  var deptSheet = ss.getSheetByName('DEPARTMENT_MASTER');
  if (deptSheet && deptSheet.getLastRow() === 1) {
    var depts = [
      ['DEPT-01', 'Heavy Rigging & Lift', 'CC-JTRWF-RIG', 'Ashok Mohanty', 'ACTIVE'],
      ['DEPT-02', 'Mechanical Erection', 'CC-JTRWF-MECH', 'Dilip Rout', 'ACTIVE'],
      ['DEPT-03', 'Safety & EHS', 'CC-JTRWF-SAFE', 'Gajendra Rao', 'ACTIVE'],
      ['DEPT-04', 'Machine Shop', 'CC-JTRWF-MSHOP', 'Sarat Mishra', 'ACTIVE'],
      ['DEPT-05', 'Store & Inventory', 'CC-JTRWF-STR', 'Gagan Bihari Das', 'ACTIVE'],
      ['DEPT-06', 'Administration & HR', 'CC-CORP-HR', 'Priyanka Senapati', 'ACTIVE']
    ];
    deptSheet.getRange(2, 1, depts.length, 5).setValues(depts);
  }

  // 2. PROJECT_MASTER
  var projSheet = ss.getSheetByName('PROJECT_MASTER');
  if (projSheet && projSheet.getLastRow() === 1) {
    var projects = [
      ['PRJ-JTRWF', 'Jupiter Tatravagonka Railwheel Factory', 'Jupiter Tatravagonka Railwheels Ltd', 'Khordha, Odisha', 'Satish Chandra', '2026-01-01', 'ACTIVE']
    ];
    projSheet.getRange(2, 1, projects.length, 7).setValues(projects);
  }

  // 3. LEAVE_MASTER
  var leaveSheet = ss.getSheetByName('LEAVE_MASTER');
  if (leaveSheet && leaveSheet.getLastRow() === 1) {
    var leaves = [
      ['CL', 'Casual Leave', 12, 0, 'ACTIVE'],
      ['SL', 'Sick Leave', 12, 12, 'ACTIVE'],
      ['PL', 'Privilege / Earned Leave', 18, 30, 'ACTIVE'],
      ['CO', 'Compensatory Off', 0, 0, 'ACTIVE']
    ];
    leaveSheet.getRange(2, 1, leaves.length, 5).setValues(leaves);
  }

  // 4. SYSTEM_CONFIG
  var sysSheet = ss.getSheetByName('SYSTEM_CONFIG');
  if (sysSheet && sysSheet.getLastRow() === 1) {
    var configs = [
      ['PF_WAGE_CEILING', '15000', 'Statutory Provident Fund ceiling limit in INR', '2026-01-01', 'SUPER_ADMIN'],
      ['PF_EMPLOYEE_RATE', '0.12', 'Employee PF statutory contribution rate (12%)', '2026-01-01', 'SUPER_ADMIN'],
      ['ESIC_WAGE_CEILING', '21000', 'ESIC statutory monthly eligibility ceiling in INR', '2026-01-01', 'SUPER_ADMIN'],
      ['ESIC_EMPLOYEE_RATE', '0.0075', 'Employee ESIC statutory contribution rate (0.75%)', '2026-01-01', 'SUPER_ADMIN'],
      ['PT_ODISHA_MONTHLY', '200', 'Standard monthly professional tax slab for Odisha in INR', '2026-01-01', 'SUPER_ADMIN'],
      ['DAILY_SHIFT_HOURS', '8', 'Standard working shift duration in hours', '2026-01-01', 'SUPER_ADMIN'],
      ['MAX_ADVANCE_CTC_MULTIPLE', '3', 'Maximum permitted loan advance as multiple of monthly CTC', '2026-01-01', 'SUPER_ADMIN'],
      ['MAX_ADVANCE_DAILY_MULTIPLE', '45', 'Maximum permitted loan advance as multiple of daily wage rate', '2026-01-01', 'SUPER_ADMIN']
    ];
    sysSheet.getRange(2, 1, configs.length, 5).setValues(configs);
  }
}
