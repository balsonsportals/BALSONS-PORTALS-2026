/**
 * BALSONS GATE ENTRY PORTAL — MASTER DATA SERVICE
 * Document Identifier: BAL-ENG-SPEC-01-GREENFIELD-V1.0
 */

var MasterDataService = {

  getContractors: function(session) {
    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('CONTRACTOR_MASTER');
    if (!sheet) return { success: false, error: 'CONTRACTOR_MASTER_MISSING' };

    var data = sheet.getDataRange().getValues();
    var contractors = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      contractors.push({
        contractorId: data[i][0],
        companyName: data[i][1],
        contactPerson: data[i][2],
        mobile: data[i][3],
        email: data[i][4],
        scope: data[i][5],
        status: data[i][6]
      });
    }

    return { success: true, count: contractors.length, contractors: contractors };
  },

  getPersonnel: function(payload, session) {
    var ss = getGateSpreadsheet();
    var sheet = ss.getSheetByName('PERSONNEL_MASTER');
    if (!sheet) return { success: false, error: 'PERSONNEL_MASTER_MISSING' };

    var data = sheet.getDataRange().getValues();
    var personnel = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      personnel.push({
        personnelId: data[i][0],
        fullName: data[i][1],
        category: data[i][2],
        contractorId: data[i][3],
        trade: data[i][4],
        govtIdType: data[i][5],
        maskedGovtId: data[i][6],
        mobile: data[i][7],
        status: data[i][8]
      });
    }

    return { success: true, count: personnel.length, personnel: personnel };
  }
};
