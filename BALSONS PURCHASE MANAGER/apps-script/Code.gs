/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Purchase & Vendor Manager - Main Engine Backend
 * Dedicated Spreadsheet ID: 1j0CExit4zoZy5iC-mJHFCbpqmOz8menZ7HGWh1fSGz4
 * Department 04 Purchase Drive Vault: 1lBWPI1VJos1lx_dkPi9l-sMVhsEM1iTp
 * Document Identifier: BAL-ENG-SPEC-05-PURCHASE-V1.2
 */

const PURCHASE_SPREADSHEET_ID_FALLBACK = '1j0CExit4zoZy5iC-mJHFCbpqmOz8menZ7HGWh1fSGz4';
const PURCHASE_DRIVE_VAULT_ID = '1lBWPI1VJos1lx_dkPi9l-sMVhsEM1iTp';

function getPurchaseSpreadsheet() {
  var propId = PropertiesService.getScriptProperties().getProperty('BALSONS_PURCHASE_DATABASE_MASTER');
  var targetId = propId || PURCHASE_SPREADSHEET_ID_FALLBACK;
  return SpreadsheetApp.openById(targetId);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    service: 'BALSONS_PURCHASE_COMMERCIAL_ENGINE',
    version: '1.2.0-PROD',
    status: 'HEALTHY',
    spreadsheetId: getPurchaseSpreadsheet().getId(),
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const payload = body.payload || {};

    let responseData = {};

    switch (action) {
      case 'PURCHASE_PR_CREATE':
        responseData = createPR(payload);
        break;
      case 'PURCHASE_PR_APPROVE':
        responseData = approvePR(payload);
        break;
      case 'PURCHASE_PO_CREATE':
        responseData = createPO(payload);
        break;
      case 'PURCHASE_VENDOR_REGISTER':
        responseData = registerVendor(payload);
        break;
      case 'PURCHASE_GRN_CREATE':
        responseData = createGRN(payload);
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

/**
 * Creates a new Purchase Requisition with optional quote/spec Drive upload
 */
function createPR(data) {
  const ss = getPurchaseSpreadsheet();
  let sheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
  if (!sheet) {
    sheet = ss.insertSheet('PURCHASE_REQUISITIONS');
    sheet.appendRow(['PR_ID', 'DATE', 'REQUESTOR', 'DEPARTMENT', 'DESCRIPTION', 'QTY', 'EST_VALUE', 'JUSTIFICATION', 'STATUS', 'CREATED_AT']);
  }

  const prId = data.id || ('PR-2026-' + Math.floor(1000 + Math.random() * 9000));
  const dateStr = data.date || new Date().toISOString().slice(0, 10);
  const status = data.status || 'COMMERCIAL_REVIEW';

  // Stream quotation/attachment to Drive if provided
  var driveFileUrl = '';
  if (data.quoteBase64) {
    try {
      var folder = DriveApp.getFolderById(PURCHASE_DRIVE_VAULT_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.quoteBase64), data.mime || 'application/pdf', prId + '_QUOTE.pdf');
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveFileUrl = file.getUrl();
    } catch (e) {
      Logger.log('Drive PR Quote Upload Warning: ' + e.message);
    }
  }

  sheet.appendRow([
    prId,
    dateStr,
    data.requestor || 'Prashant Muley',
    data.dept || 'MECHANICAL_ERECTION',
    data.desc || '',
    data.qty || '1 Lot',
    parseFloat(data.estValue) || 0,
    data.justification || 'General Procurement',
    status,
    new Date().toISOString()
  ]);

  logPurchaseAuditRecord(
    data.requestor || 'PURCHASE_SYSTEM',
    'PROCUREMENT_OFFICER',
    'PR_CREATED',
    prId,
    'SUCCESS',
    'Created PR for ' + (data.desc || '') + ' - Est: ₹' + (data.estValue || 0)
  );

  return { prId: prId, status: status, fileUrl: driveFileUrl };
}

/**
 * Approves a Purchase Requisition
 */
function approvePR(data) {
  const ss = getPurchaseSpreadsheet();
  const sheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
  if (!sheet) throw new Error('PURCHASE_REQUISITIONS sheet not found');

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.prId) {
      sheet.getRange(i + 1, 9).setValue('APPROVED_BY_DIRECTOR');

      logPurchaseAuditRecord(
        data.approver || 'COMMERCIAL_DIRECTOR',
        'DIRECTOR',
        'PR_APPROVED',
        data.prId,
        'SUCCESS',
        'Requisition approved for PO issuance'
      );

      return { prId: data.prId, status: 'APPROVED_BY_DIRECTOR' };
    }
  }
  throw new Error('PR ' + data.prId + ' not found');
}

/**
 * Generates a Commercial Purchase Order with deterministic 18% GST calculation
 */
function createPO(data) {
  const ss = getPurchaseSpreadsheet();
  let sheet = ss.getSheetByName('PURCHASE_ORDERS');
  if (!sheet) {
    sheet = ss.insertSheet('PURCHASE_ORDERS');
    sheet.appendRow(['PO_ID', 'PR_ID', 'VENDOR', 'BASIC_AMOUNT', 'GST_18', 'TOTAL_VALUE', 'DELIVERY_DATE', 'PAYMENT_TERMS', 'GATE_STATUS', 'CREATED_AT']);
  }

  const basic = parseFloat(data.basic) || 0;
  const gst = Math.round((basic * 0.18) * 100) / 100; // Deterministic 18% GST
  const total = Math.round((basic + gst) * 100) / 100;
  const poId = data.poId || ('PO-2026-' + Math.floor(1000 + Math.random() * 9000));
  const prId = data.prId || '';

  // Stream signed PO PDF to Drive if provided
  var drivePOUrl = '';
  if (data.poBase64) {
    try {
      var folder = DriveApp.getFolderById(PURCHASE_DRIVE_VAULT_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.poBase64), 'application/pdf', poId + '_COMMERCIAL_PO.pdf');
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      drivePOUrl = file.getUrl();
    } catch (e) {
      Logger.log('Drive PO Upload Warning: ' + e.message);
    }
  }

  sheet.appendRow([
    poId,
    prId,
    data.vendor || 'Approved Vendor',
    basic,
    gst,
    total,
    data.deliveryDate || '15-Dec-2026',
    data.terms || '30 Days Post Site Inward & Store QC',
    data.gateStatus || 'PENDING_GATE_RECEIPT',
    new Date().toISOString()
  ]);

  // Update status of linked PR if exists
  if (prId) {
    const prSheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
    if (prSheet) {
      const prRows = prSheet.getDataRange().getValues();
      for (let i = 1; i < prRows.length; i++) {
        if (prRows[i][0] === prId) {
          prSheet.getRange(i + 1, 9).setValue('PO_GENERATED');
          break;
        }
      }
    }
  }

  logPurchaseAuditRecord(
    data.issuer || 'COMMERCIAL_MANAGER',
    'COMMERCIAL_MANAGER',
    'PO_GENERATED',
    poId,
    'SUCCESS',
    'Issued PO to ' + (data.vendor || '') + ' - Basic: ₹' + basic + ' + GST 18%: ₹' + gst + ' = Total: ₹' + total
  );

  return { poId: poId, prId: prId, basic: basic, gst: gst, total: total, status: 'GENERATED', fileUrl: drivePOUrl };
}

/**
 * Registers or updates an approved vendor in VENDOR_MASTER
 */
function registerVendor(data) {
  const ss = getPurchaseSpreadsheet();
  let sheet = ss.getSheetByName('VENDOR_MASTER');
  if (!sheet) {
    sheet = ss.insertSheet('VENDOR_MASTER');
    sheet.appendRow(['VENDOR_ID', 'COMPANY_NAME', 'GSTIN', 'CONTACT_PERSON', 'MOBILE', 'EMAIL', 'BANK_ACCOUNT', 'IFSC_CODE', 'RATING', 'STATUS']);
  }

  const vendorId = data.vendorId || ('VND-' + Math.floor(100 + Math.random() * 900));
  sheet.appendRow([
    vendorId,
    data.companyName || '',
    data.gstin || '',
    data.contactPerson || '',
    data.mobile || '',
    data.email || '',
    data.bankAccount || '',
    data.ifsc || '',
    data.rating || 'GRADE_A',
    data.status || 'ACTIVE'
  ]);

  logPurchaseAuditRecord(
    data.actor || 'PROCUREMENT_HEAD',
    'PROCUREMENT_OFFICER',
    'VENDOR_REGISTERED',
    vendorId,
    'SUCCESS',
    'Vendor ' + (data.companyName || '') + ' registered with GSTIN: ' + (data.gstin || '')
  );

  return { vendorId: vendorId, status: 'ACTIVE' };
}

/**
 * Logs a Goods Receipt Note (GRN) against an open PO
 */
function createGRN(data) {
  const ss = getPurchaseSpreadsheet();
  let sheet = ss.getSheetByName('GRN_REGISTER');
  if (!sheet) {
    sheet = ss.insertSheet('GRN_REGISTER');
    sheet.appendRow(['GRN_ID', 'PO_ID', 'GATE_INWARD_REF', 'VENDOR_NAME', 'RECEIVED_DATE', 'STORE_INSPECTOR', 'ACCEPTED_QTY', 'REJECTED_QTY', 'STATUS']);
  }

  const grnId = data.grnId || ('GRN-2026-' + Math.floor(1000 + Math.random() * 9000));
  const poId = data.poId || '';

  sheet.appendRow([
    grnId,
    poId,
    data.gateInwardRef || '',
    data.vendorName || '',
    data.receivedDate || new Date().toISOString().slice(0, 10),
    data.storeInspector || 'Store QC Engineer',
    data.acceptedQty || 0,
    data.rejectedQty || 0,
    data.status || 'QC_ACCEPTED'
  ]);

  // Update PO Gate status if provided
  if (poId) {
    const poSheet = ss.getSheetByName('PURCHASE_ORDERS');
    if (poSheet) {
      const poRows = poSheet.getDataRange().getValues();
      for (let i = 1; i < poRows.length; i++) {
        if (poRows[i][0] === poId) {
          poSheet.getRange(i + 1, 9).setValue(data.poStatus || 'COMPLETELY_RECEIVED');
          break;
        }
      }
    }
  }

  logPurchaseAuditRecord(
    data.storeInspector || 'STORE_INSPECTOR',
    'QC_ENGINEER',
    'GRN_CREATED',
    grnId,
    'SUCCESS',
    'GRN logged for PO ' + poId + ' (Accepted: ' + (data.acceptedQty || 0) + ', Rejected: ' + (data.rejectedQty || 0) + ')'
  );

  return { grnId: grnId, poId: poId, status: 'QC_ACCEPTED' };
}

/**
 * Fetches cross-domain synchronized purchase metrics
 */
function fetchPurchaseSyncData() {
  const ss = getPurchaseSpreadsheet();
  const prSheet = ss.getSheetByName('PURCHASE_REQUISITIONS');
  const poSheet = ss.getSheetByName('PURCHASE_ORDERS');
  const vndSheet = ss.getSheetByName('VENDOR_MASTER');
  const grnSheet = ss.getSheetByName('GRN_REGISTER');

  let totalCommitted = 0;
  let openPOCount = 0;
  if (poSheet && poSheet.getLastRow() > 1) {
    const poValues = poSheet.getRange(2, 6, poSheet.getLastRow() - 1, 4).getValues();
    poValues.forEach(function(row) {
      totalCommitted += parseFloat(row[0]) || 0;
      if (row[3] !== 'COMPLETELY_RECEIVED') openPOCount++;
    });
  }

  return {
    prsCount: prSheet ? Math.max(0, prSheet.getLastRow() - 1) : 0,
    posCount: poSheet ? Math.max(0, poSheet.getLastRow() - 1) : 0,
    vendorsCount: vndSheet ? Math.max(0, vndSheet.getLastRow() - 1) : 0,
    grnsCount: grnSheet ? Math.max(0, grnSheet.getLastRow() - 1) : 0,
    totalCommittedValue: totalCommitted,
    openPOsCount: openPOCount,
    serverTimestamp: new Date().toISOString()
  };
}

/**
 * Universal Cryptographic SHA-256 Audit Trail Recorder for Commercial Purchase
 */
function logPurchaseAuditRecord(actor, role, action, entityId, outcome, details) {
  try {
    const ss = getPurchaseSpreadsheet();
    const sheet = ss.getSheetByName('AUDIT_LOG');
    if (!sheet) return;

    const auditId = 'AUD-PUR-' + Date.now();
    const timestamp = new Date().toISOString();
    const lastRow = sheet.getLastRow();
    let prevHash = 'GENESIS_BLOCK_2026_BALSONS_PURCHASE';

    if (lastRow > 1) {
      prevHash = String(sheet.getRange(lastRow, 10).getValue()) || prevHash;
    }

    const payloadToHash = prevHash + '|' + auditId + '|' + timestamp + '|' + actor + '|' + action + '|' + entityId + '|' + outcome;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payloadToHash, Utilities.Charset.UTF_8);
    const currentHash = digest.map(function(b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');

    sheet.appendRow([
      auditId,
      timestamp,
      actor,
      role,
      action,
      entityId,
      outcome,
      details,
      prevHash,
      currentHash
    ]);
  } catch (e) {
    Logger.log('Purchase Audit Log Error: ' + e.message);
  }
}
