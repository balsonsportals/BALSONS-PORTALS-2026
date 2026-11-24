/**
 * BALSONS JTRWF GATE ENTRY & SITE ACCESS PORTAL — GREENFIELD DATABASE INITIALIZER
 * Document Identifier: BAL-ENG-SPEC-02-GREENFIELD-V1.0
 * 
 * Provisions all 24 relational sheets with BEDS enterprise styling (#102D35 headers, frozen top row)
 * and seeds application runtime configuration.
 */

function initializeFreshGateDatabase(targetSpreadsheetId) {
  var ssId = targetSpreadsheetId || PropertiesService.getScriptProperties().getProperty('GATE_SPREADSHEET_ID') || '1WzxdGaGFUJ9QWW31F4PXXzNTRQif8ZLu0Dale-GB534';
  if (!ssId) throw new Error('GATE_SPREADSHEET_ID is not configured.');
  var ss = SpreadsheetApp.openById(ssId);

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

  // Purge default Sheet1 if present
  var defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) ss.deleteSheet(defSheet);

  // Seed Gate Configuration
  seedGateConfig(ss);

  Logger.log('✅ Successfully provisioned all ' + SCHEMAS.length + ' relational sheets in Gate Entry Database.');
  return { success: true, count: SCHEMAS.length };
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
  }
}
