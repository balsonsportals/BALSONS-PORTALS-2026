/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Purchase & Vendor Manager - Main Engine Backend
 * Dedicated Spreadsheet ID: 1j0CExit4zoZy5iC-mJHFCbpqmOz8menZ7HGWh1fSGz4
 */

const PURCHASE_SPREADSHEET_ID = '1j0CExit4zoZy5iC-mJHFCbpqmOz8menZ7HGWh1fSGz4';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};

    let responseData = {};

    switch (action) {
      case 'PURCHASE_PR_CREATE':
        responseData = createPR(payload);
        break;
      case 'PURCHASE_PO_CREATE':
        responseData = createPO(payload);
        break;
      case 'SYNC_PURCHASE_DATA':
        responseData = fetchPurchaseSyncData();
        break;
      default:
        throw new Error('Unsupported action: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      data: responseData
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getPurchaseDb() {
  return SpreadsheetApp.openById(PURCHASE_SPREADSHEET_ID);
}

function createPR(data) {
  const ss = getPurchaseDb();
  let sheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
  if (!sheet) {
    sheet = ss.insertSheet('PURCHASE_REQUISITIONS');
    sheet.appendRow(['PR_ID', 'DATE', 'REQUESTOR', 'DEPARTMENT', 'DESCRIPTION', 'QTY', 'EST_VALUE', 'JUSTIFICATION', 'STATUS', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.id,
    data.date,
    data.requestor,
    data.dept,
    data.desc,
    data.qty,
    data.estValue,
    data.justification,
    data.status || 'SUBMITTED',
    new Date().toISOString()
  ]);
  return { prId: data.id, status: data.status };
}

function createPO(data) {
  const ss = getPurchaseDb();
  let sheet = ss.getSheetByName('PURCHASE_ORDERS');
  if (!sheet) {
    sheet = ss.insertSheet('PURCHASE_ORDERS');
    sheet.appendRow(['PO_ID', 'PR_ID', 'VENDOR', 'BASIC_AMOUNT', 'GST_18', 'TOTAL_VALUE', 'DELIVERY_DATE', 'PAYMENT_TERMS', 'GATE_STATUS', 'CREATED_AT']);
  }
  sheet.appendRow([
    data.poId,
    data.prId,
    data.vendor,
    data.basic,
    data.gst,
    data.total,
    data.deliveryDate,
    data.terms,
    data.gateStatus || 'PENDING_GATE_RECEIPT',
    new Date().toISOString()
  ]);
  return { poId: data.poId, status: 'GENERATED' };
}

function fetchPurchaseSyncData() {
  const ss = getPurchaseDb();
  const prSheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
  const poSheet = ss.getSheetByName('PURCHASE_ORDERS');
  return {
    prsCount: prSheet ? Math.max(0, prSheet.getLastRow() - 1) : 0,
    posCount: poSheet ? Math.max(0, poSheet.getLastRow() - 1) : 0
  };
}
