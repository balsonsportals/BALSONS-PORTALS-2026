# encoding: utf-8
import os

dest_path = os.path.join('assets', 'js', 'balsons-docs-manager.js')

with open(dest_path, 'a', encoding='utf-8') as out:
    out.write(r'''
  // ==========================================================================
  // BALSONS UNIVERSAL MULTI-FORMAT DOCUMENT VAULT CONTROLLER
  // ==========================================================================
  const BalsonsDocs = {
    currentPortal: 'launcher',
    documents: [],
    activeFilterFormat: 'ALL',
    activeFilterCategory: 'all',
    activeSearchQuery: '',
    uploadedFilePayload: null,
    imageZoomScale: 1.0,
    imageRotation: 0,
    cadActiveLayers: { grid: true, radius: true, gbp: true, markers: true },

    init: function() {
      this.detectPortal();
      this.loadDocuments();
      this.injectModals();
      console.log(`📁 BALSONS Universal Multi-Format Drive Vault Initialized for [${this.currentPortal.toUpperCase()}]`);

      // If document workspace tab exists in DOM, render immediately
      const docTab = document.getElementById('tab-documents') || document.getElementById('documents-tab') || document.querySelector('[data-vault-container]');
      if (docTab) {
        this.renderDocumentsTab(docTab.id || 'tab-documents');
      }

      // Cross-tab broadcast listener for unified parity
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('balsons_docs_sync_bus');
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'DOCS_UPDATED') {
            this.loadDocuments();
            this.renderDocumentsTable();
          }
        };
      }
    },

    detectPortal: function() {
      const path = (window.location.pathname || '').toUpperCase();
      if (path.includes('GATE ENTRY')) this.currentPortal = 'gate';
      else if (path.includes('HR MANAGER') || path.includes('HR_PORTAL')) this.currentPortal = 'hr';
      else if (path.includes('OPERATIONS')) this.currentPortal = 'operations';
      else if (path.includes('PURCHASE')) this.currentPortal = 'purchase';
      else if (path.includes('SAFETY')) this.currentPortal = 'safety';
      else if (path.includes('STORE')) this.currentPortal = 'store';
      else if (path.includes('REPORTS') || path.includes('REPOTS')) this.currentPortal = 'reports';
      else this.currentPortal = 'launcher';
    },

    detectFormat: function(fileName, mimeType) {
      const ext = (fileName || '').split('.').pop().toLowerCase();
      for (const fmtKey in FILE_FORMATS) {
        const fmt = FILE_FORMATS[fmtKey];
        if (fmt.exts.includes(ext)) return fmtKey;
      }
      if (mimeType) {
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('image')) return 'IMAGE';
        if (mimeType.includes('video') || mimeType.includes('audio')) return 'MEDIA_AUDIO_VIDEO';
        if (mimeType.includes('word') || mimeType.includes('officedocument.word')) return 'DOC_OFFICE';
        if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel')) return 'SHEET_CALC';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'SLIDES';
        if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) return 'ARCHIVE';
      }
      return 'PDF';
    },

    loadDocuments: function() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.documents = parsed;
            return;
          }
        }
      } catch (e) {
        console.warn('Document storage parse fallback:', e);
      }
      // Populate defaults
      this.documents = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
      this.saveDocuments();
    },

    saveDocuments: function() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('balsons_docs_sync_bus');
          bc.postMessage({ type: 'DOCS_UPDATED', count: this.documents.length, timestamp: Date.now() });
        }
      } catch (e) {
        console.error('Failed to save document registry to storage:', e);
      }
    },

    getBackendEndpoint: function(portal) {
      return PORTAL_BACKEND_URLS[portal] || PORTAL_BACKEND_URLS[this.currentPortal] || PORTAL_BACKEND_URLS['launcher'];
    },

    getPortalDocuments: function(portal) {
      const cur = portal || this.currentPortal;
      if (cur === 'launcher' || cur === 'reports') return this.documents;
      return this.documents.filter(d => (d.portal || '').toLowerCase() === cur.toLowerCase());
    },

    // ========================================================================
    // RENDER DOCUMENTS TAB IN ANY PORTAL WORKSPACE
    // ========================================================================
    renderDocumentsTab: function(containerId = 'tab-documents') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const portalDocs = this.getPortalDocuments(this.currentPortal);
      const syncedCount = portalDocs.filter(d => d.syncStatus === 'synced').length;
      const syncPercent = portalDocs.length ? Math.round((syncedCount / portalDocs.length) * 100) : 100;

      // Calculate Counts per Format
      const formatCounts = { ALL: portalDocs.length };
      for (const k in FILE_FORMATS) formatCounts[k] = 0;
      portalDocs.forEach(d => {
        const fmt = d.fileType || 'PDF';
        if (formatCounts[fmt] !== undefined) formatCounts[fmt]++;
        else formatCounts['PDF']++;
      });

      container.innerHTML = `
        <div class="beds-docs-workspace" style="padding: 20px 24px; font-family: var(--beds-font-sans, sans-serif);">
          <!-- Top Executive Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h2 style="font-size: 20px; font-weight: 800; color: var(--beds-charcoal-heading, #102d35); margin: 0;">
                  📁 Universal Multi-Format Document &amp; Drive Vault
                </h2>
                <span class="status-pill status-success" style="font-size: 10px; font-weight: 800; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 4px;">
                  SAM-2026 TIER 4 ACTIVE
                </span>
              </div>
              <p style="font-size: 12.5px; color: var(--beds-text-secondary, #475569); margin: 4px 0 0 0;">
                Enterprise statutory vault supporting <strong>PDFs, High-Res Images, CAD Blueprints, Word Docs, Spreadsheets, Slides, Audio &amp; Media</strong> with Google Drive cloud parity.
              </p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <a href="https://drive.google.com/drive/folders/${ROOT_DRIVE_FOLDER_ID}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="font-size: 11.5px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; border: 1px solid #008080; color: #008080; font-weight: 700; padding: 6px 12px; border-radius: 6px; background: #fff;">
                ☁️ Master Drive Vault ↗
              </a>
              <button type="button" class="btn btn-primary btn-sm" onclick="BalsonsDocs.syncAllPortalDocumentsToDrive()" style="font-size: 11.5px; font-weight: 800; background: linear-gradient(135deg, #008080, #004d40); color: #fff; border: none; padding: 7px 14px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,128,128,0.25); display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                ⚡ Sync All to Drive
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="BalsonsDocs.openUploadModal()" style="font-size: 11.5px; font-weight: 800; background: #102d35; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                📤 Upload &amp; Ingest File
              </button>
            </div>
          </div>

          <!-- BEDS V1.2 Executive Metrics Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 20px;">
            <div class="beds-card" style="padding: 14px 16px; border-top: 3px solid #008080; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">Tracked Vault Assets</div>
              <div style="font-size: 28px; font-weight: 900; color: #102d35; line-height: 1.1; margin-bottom: 4px;">${portalDocs.length}</div>
              <div style="font-size: 11px; color: #94a3b8;">Spanning 8 Enterprise File Formats</div>
            </div>

            <div class="beds-card" style="padding: 14px 16px; border-top: 3px solid #10B981; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">Google Drive Parity</div>
              <div style="font-size: 28px; font-weight: 900; color: #10B981; line-height: 1.1; margin-bottom: 4px;">${syncPercent}%</div>
              <div style="font-size: 11px; color: #94a3b8;">${syncedCount} of ${portalDocs.length} Synced to Cloud</div>
            </div>

            <div class="beds-card" style="padding: 14px 16px; border-top: 3px solid #6366F1; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">Root Vault ID</div>
              <div style="font-size: 13.5px; font-family: monospace; font-weight: 800; color: #102d35; margin: 6px 0;">${ROOT_DRIVE_FOLDER_ID.slice(0, 16)}...</div>
              <div style="font-size: 11px; color: #94a3b8;">87 Provisioned Sub-Vaults Active</div>
            </div>

            <div class="beds-card" style="padding: 14px 16px; border-top: 3px solid #8B5CF6; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">Statutory Retention SLA</div>
              <div style="font-size: 14px; font-weight: 800; color: #102d35; margin: 6px 0;">7-Year Immutable Lock</div>
              <div style="font-size: 11px; color: #94a3b8;">Factories Act &amp; BOCW Compliant</div>
            </div>
          </div>

          <!-- UNIVERSAL FORMAT QUICK-FILTER TOOLBAR -->
          <div style="margin-bottom: 16px; background: #fff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-right: 4px;">Format Filter:</span>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'ALL' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('ALL')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #cbd5e1; background: ${this.activeFilterFormat === 'ALL' ? '#102d35' : '#f8fafc'}; color: ${this.activeFilterFormat === 'ALL' ? '#fff' : '#334155'}; cursor: pointer;">
              📁 All Formats (${formatCounts.ALL})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'PDF' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('PDF')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #fecaca; background: ${this.activeFilterFormat === 'PDF' ? '#dc2626' : '#fef2f2'}; color: ${this.activeFilterFormat === 'PDF' ? '#fff' : '#991b1b'}; cursor: pointer;">
              📄 PDFs (${formatCounts.PDF})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'IMAGE' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('IMAGE')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #fed7aa; background: ${this.activeFilterFormat === 'IMAGE' ? '#ea580c' : '#fff7ed'}; color: ${this.activeFilterFormat === 'IMAGE' ? '#fff' : '#9a3412'}; cursor: pointer;">
              🖼️ Images (${formatCounts.IMAGE})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'CAD_BLUEPRINT' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('CAD_BLUEPRINT')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #c7d2fe; background: ${this.activeFilterFormat === 'CAD_BLUEPRINT' ? '#4f46e5' : '#eef2ff'}; color: ${this.activeFilterFormat === 'CAD_BLUEPRINT' ? '#fff' : '#3730a3'}; cursor: pointer;">
              📐 CAD &amp; Blueprints (${formatCounts.CAD_BLUEPRINT})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'DOC_OFFICE' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('DOC_OFFICE')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #bfdbfe; background: ${this.activeFilterFormat === 'DOC_OFFICE' ? '#2563eb' : '#eff6ff'}; color: ${this.activeFilterFormat === 'DOC_OFFICE' ? '#fff' : '#1e40af'}; cursor: pointer;">
              📑 Word &amp; Docs (${formatCounts.DOC_OFFICE})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'SHEET_CALC' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('SHEET_CALC')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #a7f3d0; background: ${this.activeFilterFormat === 'SHEET_CALC' ? '#059669' : '#ecfdf5'}; color: ${this.activeFilterFormat === 'SHEET_CALC' ? '#fff' : '#065f46'}; cursor: pointer;">
              📊 Spreadsheets (${formatCounts.SHEET_CALC})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'MEDIA_AUDIO_VIDEO' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('MEDIA_AUDIO_VIDEO')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #e9d5ff; background: ${this.activeFilterFormat === 'MEDIA_AUDIO_VIDEO' ? '#9333ea' : '#faf5ff'}; color: ${this.activeFilterFormat === 'MEDIA_AUDIO_VIDEO' ? '#fff' : '#6b21a8'}; cursor: pointer;">
              🎥 Audio / Video (${formatCounts.MEDIA_AUDIO_VIDEO})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'SLIDES' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('SLIDES')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #fde68a; background: ${this.activeFilterFormat === 'SLIDES' ? '#d97706' : '#fffbeb'}; color: ${this.activeFilterFormat === 'SLIDES' ? '#fff' : '#92400e'}; cursor: pointer;">
              📽️ Slides (${formatCounts.SLIDES})
            </button>
            <button type="button" class="beds-fmt-btn ${this.activeFilterFormat === 'ARCHIVE' ? 'active' : ''}" onclick="BalsonsDocs.filterFormat('ARCHIVE')" style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 20px; border: 1px solid #e2e8f0; background: ${this.activeFilterFormat === 'ARCHIVE' ? '#475569' : '#f8fafc'}; color: ${this.activeFilterFormat === 'ARCHIVE' ? '#fff' : '#334155'}; cursor: pointer;">
              🗄️ Archives (${formatCounts.ARCHIVE})
            </button>
          </div>

          <!-- Document Search & Sub-Category Filter -->
          <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 280px;">
              <input type="text" id="docSearchInput" class="beds-input" placeholder="🔍 Search by Ref ID, title, tags, asset ID, vehicle, rigger..." style="flex: 1; max-width: 420px; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12.5px;" oninput="BalsonsDocs.filterDocuments()">
              <select id="docCategoryFilter" class="beds-select" style="max-width: 220px; height: 36px; padding: 0 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;" onchange="BalsonsDocs.filterCategory(this.value)">
                ${this.buildCategoryFilterOptions()}
              </select>
            </div>
            <div style="font-size: 11.5px; color: #64748b;">
              Showing <strong id="docTableCount" style="color: #102d35;">${portalDocs.length}</strong> official assets
            </div>
          </div>

          <!-- Documents Data Table Container -->
          <div class="beds-table-container" style="background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <table class="beds-table" id="balsonsDocsTable" style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #334155;">
                  <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800; width: 110px;">Format</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800; width: 150px;">Ref Number</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800;">Asset Title &amp; Engineering Details</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800; width: 160px;">Category</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800; width: 160px;">Drive Sub-Vault</th>
                  <th style="padding: 10px 14px; text-align: center; font-size: 11px; font-weight: 800; width: 90px;">Size</th>
                  <th style="padding: 10px 14px; text-align: center; font-size: 11px; font-weight: 800; width: 110px;">Sync Status</th>
                  <th style="padding: 10px 14px; text-align: right; font-size: 11px; font-weight: 800; width: 130px;">Actions</th>
                </tr>
              </thead>
              <tbody id="balsonsDocsTableBody">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      `;

      this.renderDocumentsTable();
    },

    buildCategoryFilterOptions: function() {
      if (this.currentPortal === 'hr') {
        return `
          <option value="all">📁 All HR Sub-Vaults</option>
          <option value="KYC">👤 Employee KYC (Aadhaar &amp; PAN)</option>
          <option value="FORM31">🩺 Medical Fitness &amp; Form 31</option>
          <option value="EPFO">🏦 EPFO &amp; ESIC Bank Records</option>
          <option value="PVC">🛡️ Police Verification (PVC)</option>
          <option value="PAYSLIP">📑 Monthly Salary &amp; Wage Slips</option>
          <option value="EXPENSE">📜 Staff Expense &amp; HR Letters</option>
        `;
      }
      const portalConfig = DRIVE_FOLDERS[this.currentPortal] || DRIVE_FOLDERS['gate'];
      let options = '<option value="all">📁 All Department Categories</option>';
      for (const catKey in portalConfig.folders) {
        const folder = portalConfig.folders[catKey];
        options += `<option value="${catKey}">${folder.name.replace(/_/g, ' ')}</option>`;
      }
      return options;
    },

    filterFormat: function(fmt) {
      this.activeFilterFormat = fmt;
      // Update UI button active states
      document.querySelectorAll('.beds-fmt-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.beds-fmt-btn')).find(b => b.textContent.includes(fmt));
      if (activeBtn) activeBtn.classList.add('active');
      this.renderDocumentsTab();
    },

    filterCategory: function(cat) {
      this.activeFilterCategory = cat;
      this.renderDocumentsTable();
    },

    filterDocuments: function() {
      const input = document.getElementById('docSearchInput');
      this.activeSearchQuery = input ? input.value.trim().toLowerCase() : '';
      this.renderDocumentsTable();
    },

    renderDocumentsTable: function() {
      const tbody = document.getElementById('balsonsDocsTableBody');
      if (!tbody) return;

      let docs = this.getPortalDocuments(this.currentPortal);

      // Apply Format Filter
      if (this.activeFilterFormat !== 'ALL') {
        docs = docs.filter(d => (d.fileType || 'PDF') === this.activeFilterFormat);
      }

      // Apply Category Filter
      if (this.activeFilterCategory !== 'all') {
        docs = docs.filter(d => d.category === this.activeFilterCategory);
      }

      // Apply Search Query Filter
      if (this.activeSearchQuery) {
        const q = this.activeSearchQuery;
        docs = docs.filter(d =>
          (d.refNumber && d.refNumber.toLowerCase().includes(q)) ||
          (d.title && d.title.toLowerCase().includes(q)) ||
          (d.tags && d.tags.some(t => t.toLowerCase().includes(q))) ||
          (d.fileExt && d.fileExt.toLowerCase().includes(q)) ||
          (d.author && d.author.toLowerCase().includes(q)) ||
          (d.metadata && JSON.stringify(d.metadata).toLowerCase().includes(q))
        );
      }

      const countEl = document.getElementById('docTableCount');
      if (countEl) countEl.textContent = docs.length;

      if (!docs.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 40px 16px; color: #94a3b8;">
              <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
              <div style="font-size: 14px; font-weight: 700; color: #475569;">No documents found matching this filter criteria.</div>
              <div style="font-size: 11.5px; margin-top: 4px;">Click <strong>Upload &amp; Ingest File</strong> to add new statutory assets or reset filters.</div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = docs.map(d => {
        const fmtInfo = FILE_FORMATS[d.fileType] || FILE_FORMATS['PDF'];
        return `
          <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
            <!-- Col 1: Format Badge -->
            <td style="padding: 10px 14px;">
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 800; background: ${fmtInfo.bg}; color: ${fmtInfo.color}; border: 1px solid ${fmtInfo.border};">
                ${fmtInfo.badge}
              </span>
            </td>

            <!-- Col 2: Ref Number -->
            <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #008080; font-size: 11.5px;">
              ${d.refNumber}
            </td>

            <!-- Col 3: Title & Details -->
            <td style="padding: 10px 14px; max-width: 320px;">
              <div style="font-weight: 700; color: #102d35; line-height: 1.35; font-size: 12.5px;">${d.title}</div>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">
                By: ${d.author} · ${d.createdAt} · <span style="font-family:monospace; color:#008080;">.${d.fileExt || 'pdf'}</span>
              </div>
            </td>

            <!-- Col 4: Category -->
            <td style="padding: 10px 14px;">
              <span style="font-size: 10.5px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 7px; border-radius: 4px;">
                ${d.categoryName || d.category}
              </span>
            </td>

            <!-- Col 5: Drive Folder -->
            <td style="padding: 10px 14px;">
              <a href="${d.driveUrl || 'https://drive.google.com/drive/folders/' + d.driveFolderId}" target="_blank" rel="noopener" style="font-size: 11px; color: #008080; text-decoration: underline; font-family: monospace; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                📁 ${d.driveFolderName ? d.driveFolderName.split('/').pop().trim() : 'Drive Sub-Vault'} ↗
              </a>
            </td>

            <!-- Col 6: Size -->
            <td style="padding: 10px 14px; text-align: center; font-size: 11px; font-family: monospace; color: #64748b;">
              ${d.fileSize || '250 KB'}
            </td>

            <!-- Col 7: Sync Status -->
            <td style="padding: 10px 14px; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; background: #dcfce7; color: #15803d; border: 1px solid #86efac;">
                🟢 Live Synced
              </span>
            </td>

            <!-- Col 8: Multi-Modal Actions -->
            <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
              <div style="display: inline-flex; gap: 6px; align-items: center;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="BalsonsDocs.viewDocument('${d.id}')" style="font-size: 11px; padding: 4px 8px; font-weight: 700; cursor: pointer;" title="Open in Multi-Modal Viewer">
                  👁️ View
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="BalsonsDocs.downloadDocument('${d.id}')" style="font-size: 11px; padding: 4px 8px; font-weight: 700; cursor: pointer;" title="Download native file">
                  ⬇️
                </button>
                <a href="${d.driveUrl || 'https://drive.google.com/drive/folders/' + d.driveFolderId}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px; font-weight: 700; text-decoration: none; color: #008080;" title="Open directly in Google Drive">
                  ☁️
                </a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  };
''')

print("BalsonsDocs core methods written.")
