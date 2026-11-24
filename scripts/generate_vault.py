# Python script to generate universal multi-format balsons-docs-manager.js
import os
import shutil

output_file = os.path.join('assets', 'js', 'balsons-docs-manager.js')
ref_file = os.path.join('PROJECT REFERENCE AND REQUIREMENTS DOCUMENT', 'PROJECT ASSETS AND IMAGES REFERENCE', 'js', 'balsons-docs-manager.js')

with open('scripts/build_full_vault_js.py', 'w', encoding='utf-8') as f:
    f.write('''# Builder script that writes assets/js/balsons-docs-manager.js
import os
import shutil

part1 = r"""/**
 * ============================================================================
 * BALSONS ENTERPRISE ECOSYSTEM - UNIVERSAL MULTI-FORMAT DOCUMENT & DRIVE VAULT
 * Version: 2.0.0-ENTERPRISE-MULTI-FORMAT (SAM-2026 Tier 4 Evidence Architecture)
 * Root Google Drive Vault: 1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde
 *
 * Supported File Formats:
 *  - 📄 PDF: Statutory Certs (Form 11/31/32), Signed PTWs, POs, Challans, Payslips
 *  - 🖼️ IMAGE: High-Res Photos (JPG/PNG/WEBP), KYC Aadhaar/PAN, Damage, Color Tags
 *  - 📐 CAD: Blueprints, Technical Schematics (DWG/DXF/SVG), Bay Pit Foundations
 *  - 📑 DOC: Word Documents (DOCX), Method Statements, SOPs, Technical Agreements
 *  - 📊 SHEET: Spreadsheets (XLSX/CSV), Tandem Lift Calculations, GBP Models
 *  - 📽️ SLIDES: Presentations (PPTX), Safety Inductions, Board Progress Decks
 *  - 🎥 MEDIA: Audio/Video Logs (MP3/WAV/MP4), TBT Recordings, Drone Site Footage
 *  - 🗄️ ARCHIVE: Bundled Packages (ZIP/7Z), Master Database Backups
 * ============================================================================
 */

(function() {
  'use strict';

  const ROOT_DRIVE_FOLDER_ID = '1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde';

  // Live Google Apps Script Web App API Endpoints
  const PORTAL_BACKEND_URLS = {
    'gate': 'https://script.google.com/macros/s/AKfycbxqiDNdsoWJOHZVZMXYtu27MPBm9GScfiXCEvxSDUbuHrwp5-ivjzGb5nyXhr_Tnlwtbw/exec',
    'hr': 'https://script.google.com/macros/s/AKfycbx1D1jbJQ5qsPJ6H8Dd54mt-3SDlc0IYkkEEKqleOJkkK3fYnujCPE_vmUp14ZaxmxftQ/exec',
    'safety': 'https://script.google.com/macros/s/AKfycbytKTvVOA3zuJLF9pK2USAeDJnJMdVf8fkRzfYn_o34jnK_p59F5jdfeFOLYcCrOBkEwQ/exec',
    'store': 'https://script.google.com/macros/s/AKfycbxnitdgzVXivK_hwlupc6CrImRKImW5s4pm_AB4lrnCFOin0fTzkWKyHINa8yaKy7vG/exec',
    'operations': 'https://script.google.com/macros/s/AKfycbxl9NvWozM8kzrq2XN5G9pdrvrSRqU6T0qBi1qVqpfipX9DIr2_HmfUHOdy3p-N9_CS/exec',
    'purchase': 'https://script.google.com/macros/s/AKfycbz_gXydCQPB88QMPDt38h8Npg6LERK07BQ9p917wiRaahRpM2EBGPo5jdb-NAT2cDYTag/exec',
    'reports': 'https://script.google.com/macros/s/AKfycbxl9NvWozM8kzrq2XN5G9pdrvrSRqU6T0qBi1qVqpfipX9DIr2_HmfUHOdy3p-N9_CS/exec',
    'launcher': 'https://script.google.com/macros/s/AKfycbxl9NvWozM8kzrq2XN5G9pdrvrSRqU6T0qBi1qVqpfipX9DIr2_HmfUHOdy3p-N9_CS/exec'
  };

  // Canonical Format Definitions & Visual Classifications
  const FILE_FORMATS = {
    'PDF': {
      id: 'PDF',
      label: 'PDF Document',
      badge: '📄 PDF',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      exts: ['pdf']
    },
    'IMAGE': {
      id: 'IMAGE',
      label: 'Image / Evidence',
      badge: '🖼️ IMAGE',
      color: '#ea580c',
      bg: '#fff7ed',
      border: '#fed7aa',
      exts: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
    },
    'CAD_BLUEPRINT': {
      id: 'CAD_BLUEPRINT',
      label: 'CAD & Blueprint',
      badge: '📐 CAD / DRAWING',
      color: '#4f46e5',
      bg: '#eef2ff',
      border: '#c7d2fe',
      exts: ['dwg', 'dxf', 'cad', 'svg']
    },
    'DOC_OFFICE': {
      id: 'DOC_OFFICE',
      label: 'Word & Office Doc',
      badge: '📑 DOC / WORD',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      exts: ['docx', 'doc', 'rtf', 'txt', 'gdoc']
    },
    'SHEET_CALC': {
      id: 'SHEET_CALC',
      label: 'Spreadsheet & Calc',
      badge: '📊 SPREADSHEET',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      exts: ['xlsx', 'xls', 'csv', 'gsheet']
    },
    'SLIDES': {
      id: 'SLIDES',
      label: 'Presentation Deck',
      badge: '📽️ SLIDES',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      exts: ['pptx', 'ppt', 'gslides']
    },
    'MEDIA_AUDIO_VIDEO': {
      id: 'MEDIA_AUDIO_VIDEO',
      label: 'Audio / Video / Drone',
      badge: '🎥 MEDIA / AUDIO',
      color: '#9333ea',
      bg: '#faf5ff',
      border: '#e9d5ff',
      exts: ['mp4', 'webm', 'mp3', 'wav', 'mov']
    },
    'ARCHIVE': {
      id: 'ARCHIVE',
      label: 'Archive & Backup',
      badge: '🗄️ ARCHIVE / ZIP',
      color: '#475569',
      bg: '#f8fafc',
      border: '#e2e8f0',
      exts: ['zip', '7z', 'tar', 'gz', 'rar']
    }
  };

  const DRIVE_FOLDERS = {
    'gate': {
      rootId: '1BbLIA4W-JSk2HFTKsNN1XI5Vr9WQ1bi-',
      rootName: '01_GATE_ENTRY_MANAGER',
      folders: {
        'RGP': { id: '1TIJab14EOy-NuWEAZTfXh58dmg5ApXCl', name: 'RETURNABLE_GATE_PASSES_RGP', categoryCode: '01_GATE_PASSES' },
        'NRGP': { id: '1jvCQLZzU_sHqhCu2DuPa4bbwwaVOcMnx', name: 'NON_RETURNABLE_GATE_PASSES_NRGP', categoryCode: '01_GATE_PASSES' },
        'VISITOR': { id: '1AA14LbVZA1lBDegALWbwvCsrPRvg6F2m', name: 'VISITOR_AND_CONTRACTOR_PASSES', categoryCode: '01_GATE_PASSES' },
        'VEHICLE': { id: '1OOZT5oulsQiDD0c4p6Q_edfob7vMpBFr', name: 'VEHICLE_FITNESS_AND_INSURANCE', categoryCode: '03_VEHICLES_AND_DRIVERS' },
        'CHALLAN_INWARD': { id: '1UaDIushjgT9n2-bMY0g0d7vHVofU9mqZ', name: 'INWARD_DELIVERY_CHALLANS', categoryCode: '02_MATERIAL_CHALLANS' },
        'CHALLAN_OUTWARD': { id: '1g-SiGU3mxEPlBGoheoYhM1IL9gRKTzEx', name: 'OUTWARD_DISPATCH_CHALLANS', categoryCode: '02_MATERIAL_CHALLANS' },
        'DRIVER_KYC': { id: '1QnkPgFu7wJkCwidw5uUuohnP4kke1Ycw', name: 'DRIVER_LICENSES_AND_KYC', categoryCode: '03_VEHICLES_AND_DRIVERS' },
        'SECURITY_LOGS': { id: '1SHkOxQvSDWk8C217Nl0zRFgkB02tW7md', name: 'SECURITY_AUDIT_LOGS', categoryCode: '04_SECURITY_LOGS_AND_REPORTS' }
      }
    },
    'hr': {
      rootId: '1TGaAS1aB6B0W8HHrZ6SYccG0XbsdSlLt',
      rootName: '02_HR_AND_PAYROLL_MANAGER',
      folders: {
        'KYC': { id: '1M-Lc7VoEB03KiVYQrABHW8g4q4h-QSHV', name: 'AADHAAR_AND_PAN_CARDS', categoryCode: '01_EMPLOYEE_KYC_DOSSIERS' },
        'FORM31': { id: '1ZOd6JadZmfaHjsT1v5nAodHHAu5VOPnr', name: 'MEDICAL_FITNESS_CERTIFICATES', categoryCode: '02_STATUTORY_FITNESS_FORM31' },
        'EPFO': { id: '1d0sMG99CelDexwKmMvlLOJ4DQklJNZS6', name: 'BANK_AND_EPFO_ESIC_RECORDS', categoryCode: '01_EMPLOYEE_KYC_DOSSIERS' },
        'PVC': { id: '1j5q1a3_7bY58d_123pvc', name: 'POLICE_VERIFICATION_PVC', categoryCode: '03_POLICE_VERIFICATION_PVC' },
        'PAYSLIP': { id: '1pslip9876543210pslip', name: 'MONTHLY_SALARY_SLIPS', categoryCode: '04_PAYROLL_AND_SALARY_SLIPS' },
        'EXPENSE': { id: '1exp9876543210exp', name: 'STAFF_EXPENSE_VOUCHERS', categoryCode: '05_HR_LETTERS_AND_EXPENSES' }
      }
    },
    'operations': {
      rootId: '1mNMSK9VmE5olCOtIdMzIm1HUcLEULn5g',
      rootName: '03_OPERATIONS_AND_RIGGING_MANAGER',
      folders: {
        'CAD': { id: '1wXg9N8kL2m1p0q7r6s5t4u3v2w1x0y9z', name: 'STRUCTURAL_CAD_AND_BLUEPRINTS', categoryCode: '01_WORK_PACKAGE_DOSSIERS' },
        'DOSSIER': { id: '1wXg9N8kL2m1p0q7r6s5t4u3v2w1x0y9z', name: '360_COMPLETION_DOSSIERS', categoryCode: '01_WORK_PACKAGE_DOSSIERS' },
        'DPR': { id: '1dPr9876543210opsdpr', name: 'DAILY_SHIFT_LOGS_DPR', categoryCode: '02_DAILY_SHIFT_LOGS_DPR' },
        'CRANE': { id: '1crAnE9876543210crane', name: 'CRANE_PRE_LIFT_CHECKLISTS', categoryCode: '04_CRANE_AND_SPMT_INSPECTIONS' },
        'HOLD': { id: '1hld9876543210hold', name: 'HOLD_NOTICES_AND_RCAS', categoryCode: '03_HOLDS_AND_DISCREPANCIES' }
      }
    },
    'purchase': {
      rootId: '1lBWPI1VJos1lx_dkPi9l-sMVhsEM1iTp',
      rootName: '04_PURCHASE_AND_COMMERCIAL_MANAGER',
      folders: {
        'PO': { id: '1po9876543210purchase', name: 'FORMAL_SIGNED_POS', categoryCode: '04_PURCHASE_ORDERS_PO' },
        'RFQ': { id: '1rfq9876543210rfq', name: 'SUPPLIER_RATE_QUOTATIONS', categoryCode: '02_VENDOR_RFQS_AND_QUOTATIONS' },
        'INVOICE': { id: '1inv9876543210inv', name: 'VENDOR_TAX_INVOICES', categoryCode: '06_COMMERCIAL_VOUCHERS_AND_INVOICES' },
        'GRN': { id: '1grn9876543210grn', name: '3_WAY_MATCH_INSPECTION_CERTS', categoryCode: '05_ADVANCE_SHIPPING_AND_GRN' }
      }
    },
    'safety': {
      rootId: '14l-IAZcb39iSeBSa9kQVUCI2lnty9cOK',
      rootName: '05_SAFETY_AND_RISK_MANAGER',
      folders: {
        'PTW': { id: '1ptw9876543210ptw', name: 'PERMIT_TO_WORK_PTW', categoryCode: '01_PERMIT_TO_WORK_PTW' },
        'TBT': { id: '1tbt9876543210tbt', name: 'TOOLBOX_TALKS_TBT', categoryCode: '02_TOOLBOX_TALKS_TBT' },
        'HIRA': { id: '1hira9876543210hira', name: 'HIRA_JSA_RISK_ASSESSMENTS', categoryCode: '03_HIRA_JSA_RISK_ASSESSMENTS' },
        'CAPA': { id: '1capa9876543210capa', name: 'CAPA_COMPLIANCE_EVIDENCES', categoryCode: '04_INCIDENT_AND_CAPA_REPORTS' }
      }
    },
    'store': {
      rootId: '1RSSF5Ld9fEJ2VfacDp80DVrGyq4pE3HY',
      rootName: '06_STORE_AND_TACKLE_MANAGER',
      folders: {
        'FORM11': { id: '1f119876543210form11', name: 'CRANE_TACKLE_FORM11_REPORTS', categoryCode: '01_FORM11_STATUTORY_CERTIFICATES' },
        'ISSUE_SLIP': { id: '1iss9876543210issue', name: 'TOOL_AND_TACKLE_ISSUE_SLIPS', categoryCode: '02_TOOL_AND_TACKLE_ISSUE_SLIPS' },
        'CUSTODY': { id: '1cust9876543210cust', name: 'TOOL_RETURN_AND_CUSTODY_VOUCHERS', categoryCode: '03_TOOL_RETURN_AND_CUSTODY_VOUCHERS' },
        'CALIBRATION': { id: '1cal9876543210cal', name: 'TORQUE_AND_PRESSURE_CALIBRATIONS', categoryCode: '05_CALIBRATION_NABL_RECORDS' }
      }
    },
    'reports': {
      rootId: '1ZnMBMc2A9bek2i_YGqspVIJR2Q_qgXye',
      rootName: '07_EXECUTIVE_GOVERNANCE_AND_SYNC_HUB',
      folders: {
        'EXECUTIVE': { id: '1exec9876543210exec', name: 'EXECUTIVE_ECOSYSTEM_REPORTS', categoryCode: '01_EXECUTIVE_ECOSYSTEM_REPORTS' },
        'BACKUP': { id: '1bck9876543210bck', name: 'CLOUD_DATABASE_BACKUPS', categoryCode: '03_CLOUD_DATABASE_BACKUPS' }
      }
    }
  };

  const STORAGE_KEY = 'balsons_docs_vault_registry_v3_multi';
"""
''')
print("Helper ready")
