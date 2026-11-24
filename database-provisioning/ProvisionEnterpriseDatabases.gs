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
 * Universal Schema Applier with BEDS Enterprise Styling (#102D35 headers, frozen top row, column auto-fit)
 */
function applyEnterpriseSchema(ss, schemas, dbName) {
  schemas.forEach(function(item) {
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

  Logger.log('✅ Successfully provisioned all ' + schemas.length + ' relational sheets in ' + dbName + ': ' + ss.getName());
  return { success: true, count: schemas.length, name: ss.getName() };
}

/**
 * Initializes all 22 relational sheets in the HR Database with #102D35 headers
 */
function initializeHrDatabaseSchemas() {
  var hrSsId = PropertiesService.getScriptProperties().getProperty('HR_SPREADSHEET_ID') || '1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw';
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

  return applyEnterpriseSchema(ss, SCHEMAS, 'HR & Payroll Database');
}

/**
 * Initializes all 24 relational sheets in Gate Entry Database and seeds APP_CONFIG
 */
function initializeGateDatabaseSchemas() {
  var gateSsId = PropertiesService.getScriptProperties().getProperty('GATE_SPREADSHEET_ID') || '1yAuZOXc8WoC2TvTvnEWMrOyLl_50BRuJgDed_pdFT3o';
  var ss = SpreadsheetApp.openById(gateSsId);

  var SCHEMAS = [
    ['APP_CONFIG', ['ConfigKey', 'ConfigValue', 'Description', 'LastUpdated', 'UpdatedBy']],
    ['USER_MASTER', ['UserID', 'Username', 'FullName', 'Role', 'PasswordHash', 'Salt', 'IsActive', 'LastLogin', 'CreatedAt']],
    ['CONTRACTOR_MASTER', ['ContractorID', 'CompanyName', 'ContactPerson', 'Mobile', 'Email', 'Scope', 'Status', 'CreatedAt']],
    ['PERSONNEL_MASTER', ['PersonnelID', 'FullName', 'Category', 'ContractorID', 'Trade', 'GovtIDType', 'MaskedGovtID', 'Mobile', 'Status']],
    ['IDENTITY_VERIFICATION', ['VerifID', 'PersonnelID', 'IDType', 'MaskedRef', 'IssuingAuth', 'VerifiedBy', 'VerifDate', 'Status']],
    ['POLICE_VERIFICATION', ['PV_ID', 'PersonnelID', 'PoliceStation', 'CertificateRef', 'IssueDate', 'ExpiryDate', 'Status', 'VerifiedBy']],
    ['MEDICAL_FITNESS', ['MedID', 'PersonnelID', 'ClinicName', 'ExamDate', 'ExpiryDate', 'GeneralFitness', 'VertigoClearance', 'Status']],
    ['INSURANCE_REGISTER', ['InsID', 'ContractorID', 'PolicyType', 'PolicyNo', 'Insurer', 'ValidFrom', 'ValidTo', 'Status']],
    ['TRAINING_COMPETENCY', ['CompID', 'PersonnelID', 'CertificationType', 'CertNo', 'IssuedBy', 'IssueDate', 'ExpiryDate', 'Status']],
    ['PPE_REGISTER', ['PPE_ID', 'PersonnelID', 'Helmet', 'SafetyShoes', 'HiVisVest', 'Gloves', 'EyeProtection', 'VerifiedDate', 'Status']],
    ['WORK_DOCUMENT_REGISTER', ['DocID', 'DocType', 'DocRefNo', 'Revision', 'Workfront', 'ApprovedBy', 'ApprovalDate', 'Status']],
    ['EQUIPMENT_MASTER', ['EquipmentID', 'Description', 'MakeModel', 'SerialNo', 'Owner', 'SWL_Capacity', 'TagNo', 'Status']],
    ['EQUIPMENT_INSPECTION', ['InspID', 'EquipmentID', 'InspectionType', 'CertRef', 'Agency', 'InspectionDate', 'DueDate', 'Status']],
    ['TOOLS_TACKLES_REGISTER', ['TackleID', 'Description', 'SerialNo', 'SWL', 'TPI_Ref', 'Condition', 'TagColor', 'Status']],
    ['CHEMICAL_SDS_REGISTER', ['ChemID', 'MaterialName', 'Manufacturer', 'Quantity', 'HazardClass', 'SDS_Available', 'StorageArea', 'Status']],
    ['VEHICLE_MASTER', ['VehicleID', 'RegistrationNo', 'VehicleType', 'Owner', 'PUC_Expiry', 'FitnessExpiry', 'InsuranceExpiry', 'Status']],
    ['DRIVER_MASTER', ['DriverID', 'DriverName', 'LicenceNo', 'LicenceClass', 'LicenceExpiry', 'Inducted', 'Status']],
    ['GATE_REQUEST_REGISTER', ['RequestID', 'SubjectType', 'SubjectID', 'DeclaredActivity', 'TargetArea', 'RequestDate', 'Status']],
    ['GATE_CLEARANCE_REGISTER', ['ClearanceID', 'RequestID', 'Decision', 'ReasonCodes', 'EvaluatedBy', 'EvaluatedAt', 'ValidityHours']],
    ['GATE_ENTRY_EXIT_LOG', ['LogID', 'ClearanceID', 'SubjectID', 'Direction', 'GateNo', 'Timestamp', 'SecurityGuardID', 'AllocatedBay']],
    ['EXCEPTION_LOG', ['ExceptionID', 'RequestID', 'OverriddenRules', 'Justification', 'ApprovedBy', 'ExpiryTimestamp', 'Status']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'ActorID', 'ActorRole', 'Action', 'EntityID', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']],
    ['MATERIAL_INWARD_REGISTER', ['InwardID', 'InwardType', 'PONumber', 'DCNumber', 'VendorName', 'Transporter', 'VehicleNo', 'MaterialCategory', 'DeclaredQty', 'UnloadingBay', 'GatePassRef', 'StoreStatus', 'SecurityOfficer', 'Timestamp', 'CreatedAt']],
    ['GATE_PASS_REGISTER', ['PassID', 'PassType', 'Consignee', 'VehicleNo', 'DriverName', 'ItemsCount', 'ReturnDueDate', 'Reason', 'ApprovalStatus', 'ApprovedBy', 'ApprovedAt', 'GateStatus', 'ExitedAt', 'ReturnedAt', 'ClosedBy', 'CreatedAt']]
  ];

  var result = applyEnterpriseSchema(ss, SCHEMAS, 'Gate Entry Database');
  seedGateConfig(ss);
  return result;
}

/**
 * Seeds Application Configuration into Gate Entry Database
 */
function seedGateConfig(ss) {
  var appConfigSheet = ss.getSheetByName('APP_CONFIG');
  if (appConfigSheet && appConfigSheet.getLastRow() === 1) {
    var configs = [
      ['DEFAULT_CLEARANCE_VALIDITY_HOURS', '24', 'Standard validity window for personnel daily clearance', new Date().toISOString(), 'SUPER_ADMIN'],
      ['CONDITIONAL_OVERRIDE_MAX_HOURS', '4', 'Maximum validity duration for safety manager emergency conditional override', new Date().toISOString(), 'SUPER_ADMIN'],
      ['VERTIGO_HEIGHT_THRESHOLD_METERS', '1.8', 'Minimum height work threshold in meters requiring mandatory vertigo clearance', new Date().toISOString(), 'SUPER_ADMIN'],
      ['MANDATORY_INWARD_DOC_REQUIRED', 'TRUE', 'Requires either PO Number or Delivery Challan on all material inwards', new Date().toISOString(), 'SUPER_ADMIN'],
      ['EMERGENCY_MUSTER_ASSEMBLY_POINT', 'Assembly Point 1 - Main North Gate Plaza', 'Default muster point for site emergency roll-call', new Date().toISOString(), 'SUPER_ADMIN']
    ];
    appConfigSheet.getRange(2, 1, configs.length, 5).setValues(configs);
    Logger.log('✅ Seeded default configurations into APP_CONFIG.');
  }
}

/**
 * Initializes all relational sheets in Safety, EHS & PTW Database
 */
function initializeSafetyDatabaseSchemas() {
  var safetySsId = PropertiesService.getScriptProperties().getProperty('SAFETY_SPREADSHEET_ID') || '1SyOGt6HEu6HJCufAbB2_P6BgF6pEppt28J_8cARaOP0';
  var ss = SpreadsheetApp.openById(safetySsId);

  var SCHEMAS = [
    ['PTW_REGISTER', ['PERMIT_ID', 'CATEGORY', 'WORK_BAY', 'SUPERVISOR', 'VALID_FROM', 'VALID_TO', 'GAS_CHECK', 'STATE', 'SCOPE', 'CREATED_AT']],
    ['TBT_LOGS', ['TBT_ID', 'SHIFT', 'WORK_BAY', 'TOPIC', 'SUPERVISOR', 'ATTENDANCE', 'SIGNED', 'STATUS', 'CREATED_AT']],
    ['INCIDENT_CAPA', ['INCIDENT_ID', 'TIMESTAMP', 'LOCATION', 'CATEGORY', 'SEVERITY', 'DESCRIPTION', 'CAPA_ACTION', 'OWNER', 'TARGET_DATE', 'STATUS']],
    ['SAFETY_AUDIT_LOG', ['AUDIT_ID', 'AUDIT_DATE', 'BAY', 'AUDITOR', 'CATEGORY', 'OBSERVATIONS', 'RISK_LEVEL', 'STATUS', 'TIMESTAMP']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'Actor', 'Role', 'Action', 'EntityRef', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']]
  ];

  return applyEnterpriseSchema(ss, SCHEMAS, 'Safety & PTW Database');
}

/**
 * Initializes all relational sheets in Store & Rigging Tackle Database
 */
function initializeStoreDatabaseSchemas() {
  var storeSsId = PropertiesService.getScriptProperties().getProperty('STORE_SPREADSHEET_ID') || '1u_ZKvvCVfEQDAtkoMR68q2d2hEK-eWBnvsS3AGfP6yQ';
  var ss = SpreadsheetApp.openById(storeSsId);

  var SCHEMAS = [
    ['RIGGING_TACKLE_MASTER', ['ASSET_ID', 'CATEGORY', 'DESCRIPTION', 'SWL', 'SERIAL_NO', 'CALIB_EXPIRY', 'TAG_COLOR', 'STATUS', 'LOCATION', 'CREATED_AT']],
    ['TOOL_ISSUE_LEDGER', ['TX_ID', 'ASSET_ID', 'DESCRIPTION', 'EMPLOYEE_ID', 'EMPLOYEE_NAME', 'WORK_BAY', 'ISSUE_TIMESTAMP', 'EXPECTED_RETURN', 'STATUS']],
    ['CALIBRATION_FORM11', ['CERT_ID', 'ASSET_ID', 'COMPETENT_PERSON', 'TEST_LOAD_APPLIED', 'SAFE_WORKING_LOAD', 'TEST_DATE', 'EXPIRY_DATE', 'CERT_URL', 'STATUS']],
    ['STORE_TRANSACTIONS', ['TRANS_ID', 'TRANS_TYPE', 'ITEM_CODE', 'DESCRIPTION', 'QTY', 'UNIT', 'RECEIVED_FROM_OR_ISSUED_TO', 'TIMESTAMP', 'AUTHORIZED_BY']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'Actor', 'Role', 'Action', 'EntityRef', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']]
  ];

  return applyEnterpriseSchema(ss, SCHEMAS, 'Store & Rigging Database');
}

/**
 * Initializes all relational sheets in Purchase & Vendor Database
 */
function initializePurchaseDatabaseSchemas() {
  var purchaseSsId = PropertiesService.getScriptProperties().getProperty('PURCHASE_SPREADSHEET_ID') || '1ANnu4X2dR0EITq5RvkyfMv1Xfz30Ba26IKjc40uyj_c';
  var ss = SpreadsheetApp.openById(purchaseSsId);

  var SCHEMAS = [
    ['PURCHASE_REQUISITIONS', ['PR_ID', 'DATE', 'REQUESTOR', 'DEPARTMENT', 'DESCRIPTION', 'QTY', 'EST_VALUE', 'JUSTIFICATION', 'STATUS', 'CREATED_AT']],
    ['PURCHASE_ORDERS', ['PO_ID', 'PR_ID', 'VENDOR', 'BASIC_AMOUNT', 'GST_18', 'TOTAL_VALUE', 'DELIVERY_DATE', 'PAYMENT_TERMS', 'GATE_STATUS', 'CREATED_AT']],
    ['VENDOR_MASTER', ['VENDOR_ID', 'COMPANY_NAME', 'GSTIN', 'CONTACT_PERSON', 'MOBILE', 'EMAIL', 'BANK_ACCOUNT', 'IFSC_CODE', 'RATING', 'STATUS']],
    ['GRN_REGISTER', ['GRN_ID', 'PO_ID', 'GATE_INWARD_REF', 'VENDOR_NAME', 'RECEIVED_DATE', 'STORE_INSPECTOR', 'ACCEPTED_QTY', 'REJECTED_QTY', 'STATUS']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'Actor', 'Role', 'Action', 'EntityRef', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']]
  ];

  return applyEnterpriseSchema(ss, SCHEMAS, 'Purchase & Vendor Database');
}

/**
 * Initializes all relational sheets in Operations & Heavy Erection Database
 */
function initializeOperationsDatabaseSchemas() {
  var operationsSsId = PropertiesService.getScriptProperties().getProperty('OPERATIONS_SPREADSHEET_ID') || '1GeqDDmBgdVm3ZUp4c9iB36__iLJ9wADQQRhEIwVxa-E';
  var ss = SpreadsheetApp.openById(operationsSsId);

  var SCHEMAS = [
    ['WORK_PACKAGES', ['PACKAGE_ID', 'DESCRIPTION', 'TARGET_BAY', 'WEIGHT_MT', 'ASSIGNED_CRANE', 'LINKED_PTW', 'PROGRESS', 'STATUS', 'CREATED_AT']],
    ['HEAVY_LIFT_STUDIES', ['STUDY_ID', 'LIFT_DESCRIPTION', 'LOAD_WEIGHT_MT', 'PRIMARY_CRANE', 'TAIL_CRANE', 'GROUND_BEARING_PRESSURE_T_M2', 'MAX_BOOM_UTILIZATION_PCT', 'ENGINEER_SIGN_OFF', 'STATUS']],
    ['DAILY_PROGRESS_REPORTS', ['DPR_ID', 'DATE', 'SHIFT', 'WORK_BAY', 'ACTIVITIES_SUMMARY', 'MANPOWER_COUNT', 'EQUIPMENT_DEPLOYED', 'DELAYS_ISSUES', 'LOGGED_BY']],
    ['AUDIT_LOG', ['AuditID', 'Timestamp', 'Actor', 'Role', 'Action', 'EntityRef', 'Outcome', 'Details', 'PrevHash', 'CurrentHash']]
  ];

  return applyEnterpriseSchema(ss, SCHEMAS, 'Operations & Erection Database');
}

/**
 * Master One-Click Initializer for ALL Remaining Databases
 * Executes Gate, Safety, Store, Purchase, and Operations schema setups in a single transaction.
 */
function initializeAllRemainingDatabases() {
  Logger.log('🚀 Starting Unified Enterprise Schema Initialization for All Remaining Databases...');
  
  var results = {
    gate: initializeGateDatabaseSchemas(),
    safety: initializeSafetyDatabaseSchemas(),
    store: initializeStoreDatabaseSchemas(),
    purchase: initializePurchaseDatabaseSchemas(),
    operations: initializeOperationsDatabaseSchemas()
  };

  Logger.log('🎉 ALL ENTERPRISE DATABASES PROVISIONED AND STYLED SUCCESSFULLY!');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}
