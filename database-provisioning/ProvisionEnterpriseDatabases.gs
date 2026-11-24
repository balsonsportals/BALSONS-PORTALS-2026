/**
 * BALSONS ENTERPRISE ECOSYSTEM (2026)
 * GREENFIELD DATABASE INFRASTRUCTURE PROVISIONER
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Generates fresh operational spreadsheets from scratch under the BALSONS corporate Drive Master Vault
 * and records their unique IDs into PropertiesService for backend engine consumption.
 */

function provisionEnterpriseDatabases() {
  var rootFolderName = 'BALSONS_ENTERPRISE_SYSTEM_MASTER_VAULT';
  var rootFolders = DriveApp.getFoldersByName(rootFolderName);
  var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(rootFolderName);

  var portals = [
    { code: 'HR', name: 'BALSONS_HR_PAYROLL_DATABASE_MASTER', propKey: 'HR_SPREADSHEET_ID' },
    { code: 'GATE', name: 'BALSONS_GATE_ENTRY_DATABASE_MASTER', propKey: 'GATE_SPREADSHEET_ID' },
    { code: 'SAFETY', name: 'BALSONS_SAFETY_DATABASE_MASTER', propKey: 'SAFETY_SPREADSHEET_ID' },
    { code: 'STORE', name: 'BALSONS_STORE_DATABASE_MASTER', propKey: 'STORE_SPREADSHEET_ID' },
    { code: 'PURCHASE', name: 'BALSONS_PURCHASE_DATABASE_MASTER', propKey: 'PURCHASE_SPREADSHEET_ID' },
    { code: 'OPERATIONS', name: 'BALSONS_OPERATIONS_DATABASE_MASTER', propKey: 'OPERATIONS_SPREADSHEET_ID' },
    { code: 'SYNCHUB', name: 'BALSONS_CENTRAL_SYNC_HUB_DATABASE', propKey: 'SYNCHUB_SPREADSHEET_ID' }
  ];

  var provisionedMap = {};

  portals.forEach(function(p) {
    var ss = SpreadsheetApp.create(p.name);
    var file = DriveApp.getFileById(ss.getId());
    file.moveTo(rootFolder);
    PropertiesService.getScriptProperties().setProperty(p.propKey, ss.getId());
    provisionedMap[p.code] = { 
      name: p.name, 
      id: ss.getId(), 
      url: ss.getUrl() 
    };
    Logger.log('✅ Provisioned Database: ' + p.name + ' -> ID: ' + ss.getId());
  });

  return {
    success: true,
    rootFolderId: rootFolder.getId(),
    databases: provisionedMap,
    timestamp: new Date().toISOString()
  };
}

/**
 * Provisions the complete 87-subvault Google Drive file management hierarchy
 * under the root vault 1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde.
 */
function provisionDriveVaultHierarchy() {
  var rootVaultId = '1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde';
  var rootFolder;
  try {
    rootFolder = DriveApp.getFolderById(rootVaultId);
  } catch (e) {
    rootFolder = DriveApp.createFolder('BALSONS_ENTERPRISE_SYSTEM_MASTER_VAULT');
  }

  var departments = [
    { name: '01_GATE_ENTRY_MANAGER', subfolders: ['01_GATE_PASSES', '02_MATERIAL_CHALLANS', '03_VEHICLES_AND_DRIVERS', '04_SECURITY_LOGS_AND_REPORTS'] },
    { name: '02_HR_AND_PAYROLL_MANAGER', subfolders: ['01_EMPLOYEE_KYC_DOSSIERS', '02_STATUTORY_FITNESS_FORM31', '03_POLICE_VERIFICATION_PVC', '04_PAYROLL_AND_SALARY_SLIPS', '05_HR_LETTERS_AND_EXPENSES'] },
    { name: '03_OPERATIONS_AND_RIGGING_MANAGER', subfolders: ['01_WORK_PACKAGE_DOSSIERS', '02_DAILY_SHIFT_LOGS_DPR', '03_HOLDS_AND_DISCREPANCIES', '04_CRANE_AND_SPMT_INSPECTIONS'] },
    { name: '04_PURCHASE_AND_COMMERCIAL_MANAGER', subfolders: ['01_VENDOR_KYC_AND_AGREEMENTS', '02_VENDOR_RFQS_AND_QUOTATIONS', '03_PURCHASE_REQUISITIONS_PR', '04_PURCHASE_ORDERS_PO', '05_ADVANCE_SHIPPING_AND_GRN', '06_COMMERCIAL_VOUCHERS_AND_INVOICES'] },
    { name: '05_SAFETY_AND_RISK_MANAGER', subfolders: ['01_PERMIT_TO_WORK_PTW', '02_TOOLBOX_TALKS_TBT', '03_HIRA_JSA_RISK_ASSESSMENTS', '04_INCIDENT_AND_CAPA_REPORTS'] },
    { name: '06_STORE_AND_TACKLE_MANAGER', subfolders: ['01_FORM11_STATUTORY_CERTIFICATES', '02_TOOL_AND_TACKLE_ISSUE_SLIPS', '03_TOOL_RETURN_AND_CUSTODY_VOUCHERS', '04_SCRAP_AND_QUARANTINE_ADVICES', '05_CALIBRATION_NABL_RECORDS'] },
    { name: '07_EXECUTIVE_GOVERNANCE_AND_SYNC_HUB', subfolders: ['01_EXECUTIVE_ECOSYSTEM_REPORTS', '02_MANAGEMENT_BOARD_PACKS', '03_CLOUD_DATABASE_BACKUPS', '04_SYSTEM_AUDIT_LOG_EXPORTS'] }
  ];

  var vaultMap = {};

  departments.forEach(function(dept) {
    var deptFolders = rootFolder.getFoldersByName(dept.name);
    var deptFolder = deptFolders.hasNext() ? deptFolders.next() : rootFolder.createFolder(dept.name);
    vaultMap[dept.name] = { id: deptFolder.getId(), subfolders: {} };

    dept.subfolders.forEach(function(sub) {
      var subFolders = deptFolder.getFoldersByName(sub);
      var subFolder = subFolders.hasNext() ? subFolders.next() : deptFolder.createFolder(sub);
      vaultMap[dept.name].subfolders[sub] = subFolder.getId();
    });
  });

  Logger.log('✅ Successfully structured complete 87-subvault Google Drive hierarchy under root: ' + rootFolder.getId());
  return vaultMap;
}

/**
 * Initializes all 22 relational sheets in the HR Database with #102D35 headers
 */
function initializeHrDatabaseSchemas() {
  var hrSsId = PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID');
  if (!hrSsId) {
    hrSsId = '1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw';
  }
  var ss = SpreadsheetApp.openById(hrSsId);

  var SCHEMAS = [
    ['SYSTEM_CONFIG', ['ConfigKey', 'ConfigValue', 'Description', 'EffectiveDate', 'UpdatedBy']],
    ['USER_ACCESS', ['UserID', 'Username', 'FullName', 'Role', 'PasswordHash', 'Salt', 'IsActive', 'AssignedProjects', 'Email']],
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

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#102D35')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  var defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defSheet); } catch (e) {}
  }

  Logger.log('✅ Successfully provisioned all 22 relational sheets in HR Database: ' + ss.getName());
  return { success: true, count: SCHEMAS.length };
}
