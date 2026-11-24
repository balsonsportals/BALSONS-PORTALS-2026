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
