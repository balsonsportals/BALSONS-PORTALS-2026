# encoding: utf-8
import os

dest_path = os.path.join('assets', 'js', 'balsons-docs-manager.js')

with open(dest_path, 'a', encoding='utf-8') as out:
    out.write(r'''
  // ==========================================================================
  // UNIVERSAL MULTI-MODAL DOCUMENT VIEWER RENDERERS
  // ==========================================================================
  Object.assign(BalsonsDocs, {
    viewDocument: function(docId) {
      const doc = this.documents.find(d => d.id === docId || d.refNumber === docId);
      if (!doc) {
        alert('Document asset not found in vault registry.');
        return;
      }

      this.injectModals();
      this.imageZoomScale = 1.0;
      this.imageRotation = 0;

      const titleEl = document.getElementById('docViewerTitle');
      const badgeEl = document.getElementById('docViewerBadge');
      const metaEl = document.getElementById('docViewerMetaBar');
      const contentEl = document.getElementById('docViewerSheetContent');
      const driveLinkEl = document.getElementById('docViewerDriveLink');
      const btnPrint = document.getElementById('btnDocViewerPrint');
      const btnDownload = document.getElementById('btnDocViewerDownload');

      const fmtInfo = FILE_FORMATS[doc.fileType] || FILE_FORMATS['PDF'];

      if (titleEl) titleEl.textContent = `${doc.refNumber} - ${doc.title}`;
      if (badgeEl) {
        badgeEl.style.background = fmtInfo.bg;
        badgeEl.style.color = fmtInfo.color;
        badgeEl.style.border = `1px solid ${fmtInfo.border}`;
        badgeEl.innerHTML = `${fmtInfo.badge} · ${doc.fileSize || '250 KB'}`;
      }
      if (driveLinkEl) {
        driveLinkEl.href = doc.driveUrl || `https://drive.google.com/drive/folders/${doc.driveFolderId}`;
      }

      if (metaEl) {
        metaEl.innerHTML = `
          <div><strong>Reference No:</strong> <span style="font-family:monospace; font-weight:700; color:#102d35; font-size:12px;">${doc.refNumber}</span></div>
          <div><strong>Category:</strong> <span style="font-weight:700; color:#0369a1;">${doc.categoryName || doc.category}</span></div>
          <div><strong>Format Type:</strong> <span style="font-weight:700; color:${fmtInfo.color};">${fmtInfo.label} (.${doc.fileExt || 'dat'})</span></div>
          <div><strong>Issued / Logged By:</strong> ${doc.author} (${doc.authorRole || 'Officer'})</div>
          <div><strong>Timestamp (IST):</strong> ${doc.createdAt}</div>
          <div><strong>Drive Sub-Vault:</strong> <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="font-family:monospace; font-size:11px; color:#008080; font-weight:700; text-decoration:underline;">${doc.driveFolderName || doc.driveFolderId} ↗</a></div>
          <div><strong>Security Clearance:</strong> <span style="color:#008080; font-weight:700;">${doc.securityLevel || 'Statutory Controlled'}</span></div>
        `;
      }

      // Dynamic Format Viewer Dispatcher
      if (contentEl) {
        const fmt = doc.fileType || 'PDF';
        if (fmt === 'PDF') {
          contentEl.innerHTML = this.renderPdfViewer(doc);
        } else if (fmt === 'IMAGE') {
          contentEl.innerHTML = this.renderImageViewer(doc);
        } else if (fmt === 'CAD_BLUEPRINT') {
          contentEl.innerHTML = this.renderCadViewer(doc);
        } else if (fmt === 'DOC_OFFICE') {
          contentEl.innerHTML = this.renderOfficeDocViewer(doc);
        } else if (fmt === 'SHEET_CALC') {
          contentEl.innerHTML = this.renderSpreadsheetViewer(doc);
        } else if (fmt === 'SLIDES') {
          contentEl.innerHTML = this.renderSlidesViewer(doc);
        } else if (fmt === 'MEDIA_AUDIO_VIDEO') {
          contentEl.innerHTML = this.renderMediaViewer(doc);
        } else if (fmt === 'ARCHIVE') {
          contentEl.innerHTML = this.renderArchiveViewer(doc);
        } else {
          contentEl.innerHTML = this.renderStatutorySheet(doc);
        }
      }

      if (btnPrint) {
        btnPrint.onclick = () => this.printDocument(doc.id);
      }
      if (btnDownload) {
        btnDownload.onclick = () => this.downloadDocument(doc.id);
      }

      const backdrop = document.getElementById('bedsDocViewerBackdrop');
      if (backdrop) backdrop.style.display = 'flex';
    },

    closeViewer: function() {
      const backdrop = document.getElementById('bedsDocViewerBackdrop');
      if (backdrop) backdrop.style.display = 'none';
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 1. PDF DOCUMENT STUDIO VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderPdfViewer: function(doc) {
      const meta = doc.metadata || {};
      return `
        <div class="beds-pdf-container" style="background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:32px; box-shadow:0 4px 16px rgba(0,0,0,0.06); font-family:'Inter', sans-serif; position:relative; min-height:600px;">
          <!-- PDF Watermark -->
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; opacity:0.04; font-size:64px; font-weight:900; transform:rotate(-35deg); color:#102d35; text-transform:uppercase;">
            BALSONS OFFICIAL STATUTORY EVIDENCE
          </div>

          <!-- Official PDF Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #102d35; padding-bottom:16px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:48px; height:48px; background:#102d35; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px; border-radius:6px; letter-spacing:1px;">
                BHLS
              </div>
              <div>
                <h2 style="margin:0; font-size:18px; font-weight:900; color:#102d35; letter-spacing:0.5px;">BALSONS HEAVY LIFT &amp; SHIFT</h2>
                <div style="font-size:11px; font-weight:700; color:#008080;">JTRWF Project Site · Khordha, Odisha · Statutory Compliance Division</div>
                <div style="font-size:9.5px; font-style:italic; color:#64748b;">“Difficult We Do Easily, Impossible Takes Little Time...!”</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="display:inline-block; border:1.5px solid #dc2626; padding:3px 10px; border-radius:4px; font-weight:800; font-size:11.5px; background:#fef2f2; color:#dc2626;">
                ${doc.categoryName || doc.category}
              </div>
              <div style="font-family:monospace; font-weight:800; font-size:13.5px; color:#102d35; margin-top:4px;">
                ${doc.refNumber}
              </div>
            </div>
          </div>

          <!-- Document Title & Control Table -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:16px; margin-bottom:24px;">
            <h3 style="margin:0 0 10px 0; font-size:15px; font-weight:800; color:#102d35;">${doc.title}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; font-size:11.5px;">
              <div><strong>Issuing Authority:</strong> ${doc.author}</div>
              <div><strong>Designation:</strong> ${doc.authorRole}</div>
              <div><strong>Date of Issue:</strong> ${doc.createdAt}</div>
              <div><strong>Statutory Classification:</strong> <span style="color:#008080; font-weight:700;">Factories Act 1948 / BOCW 1996</span></div>
            </div>
          </div>

          <!-- Tabulated Metadata Content -->
          <div style="margin-bottom:24px;">
            <h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:0.5px; color:#475569; margin:0 0 10px 0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
              Official Statutory Declarations &amp; Technical Parameters
            </h4>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <tbody>
                ${Object.keys(meta).map(k => `
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:8px 12px; font-weight:700; color:#334155; width:35%; background:#f8fafc; text-transform:capitalize;">
                      ${k.replace(/([A-Z])/g, ' $1').trim()}:
                    </td>
                    <td style="padding:8px 12px; color:#0f172a; font-family:monospace; font-weight:600;">
                      ${typeof meta[k] === 'object' ? JSON.stringify(meta[k]) : meta[k]}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Official Signatures Block -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-top:36px; padding-top:20px; border-top:1px dashed #cbd5e1; text-align:center; font-size:11px;">
            <div>
              <div style="font-size:14px; font-weight:800; color:#102d35;">✔ Authorized Signatory</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Site Competent Person</div>
            </div>
            <div>
              <div style="font-size:14px; font-weight:800; color:#102d35;">✔ ${doc.author}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Designated Officer</div>
            </div>
            <div>
              <div style="font-size:14px; font-weight:800; color:#008080;">✔ Prashant Muley</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Executive Super Admin</div>
            </div>
          </div>

          <div style="margin-top:24px; font-size:10px; color:#94a3b8; text-align:center; border-top:1px solid #f1f5f9; padding-top:8px;">
            Immutable Cryptographic Hash: sha256-${doc.id.toLowerCase()}-verified-drive-sync · Root Vault: ${ROOT_DRIVE_FOLDER_ID}
          </div>
        </div>
      `;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 2. HIGH-RES IMAGE & EVIDENCE LIGHTBOX VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderImageViewer: function(doc) {
      const meta = doc.metadata || {};
      return `
        <div style="background:#0f172a; border-radius:8px; overflow:hidden; display:flex; flex-direction:column;">
          <!-- Lightbox Toolbar -->
          <div style="background:#1e293b; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155;">
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="font-size:12px; color:#94a3b8; font-weight:700;">Lightbox Controls:</span>
              <button type="button" onclick="BalsonsDocs.zoomImage(0.2)" style="background:#334155; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:12px; cursor:pointer;">🔍 Zoom +</button>
              <button type="button" onclick="BalsonsDocs.zoomImage(-0.2)" style="background:#334155; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:12px; cursor:pointer;">🔍 Zoom -</button>
              <button type="button" onclick="BalsonsDocs.rotateImage()" style="background:#334155; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:12px; cursor:pointer;">↻ Rotate 90°</button>
              <button type="button" onclick="BalsonsDocs.resetImage()" style="background:#334155; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:12px; cursor:pointer;">↺ Reset</button>
            </div>
            <div style="font-size:11px; color:#38bdf8; font-family:monospace;">
              Scale: <span id="imgScaleLabel">100%</span> | Angle: <span id="imgAngleLabel">0°</span>
            </div>
          </div>

          <!-- Main Viewport Area -->
          <div style="padding:32px; display:flex; justify-content:center; align-items:center; min-height:480px; overflow:auto; background:radial-gradient(circle, #1e293b 0%, #0f172a 100%);">
            <div id="imgPreviewWrapper" style="transition:transform 0.2s ease; transform-origin:center center;">
              <!-- Simulated High-Fidelity Technical Evidence Capture -->
              <svg width="600" height="420" viewBox="0 0 600 420" style="background:#1e293b; border:2px solid #38bdf8; border-radius:6px; box-shadow:0 12px 32px rgba(0,0,0,0.5);">
                <rect width="600" height="420" fill="#1e293b"/>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="600" height="420" fill="url(#grid)" />
                
                <!-- Crosshairs & Sensor Bounding Box -->
                <circle cx="300" cy="210" r="140" fill="none" stroke="#008080" stroke-width="1.5" stroke-dasharray="4,4"/>
                <circle cx="300" cy="210" r="6" fill="#ef4444"/>
                <line x1="280" y1="210" x2="320" y2="210" stroke="#ef4444" stroke-width="1.5"/>
                <line x1="300" y1="190" x2="300" y2="230" stroke="#ef4444" stroke-width="1.5"/>
                
                <!-- Evidence Overlay Graphics -->
                <rect x="80" y="80" width="440" height="260" rx="4" fill="none" stroke="#f59e0b" stroke-width="2"/>
                <text x="95" y="110" fill="#f59e0b" font-size="13" font-family="monospace" font-weight="bold">TARGET ASSET: ${doc.refNumber}</text>
                <text x="95" y="130" fill="#94a3b8" font-size="11" font-family="monospace">${doc.title}</text>
                
                <!-- Technical Metadata Stamps -->
                <rect x="80" y="300" width="440" height="40" fill="rgba(15,23,42,0.85)"/>
                <text x="95" y="325" fill="#38bdf8" font-size="11" font-family="monospace">EXIF: ${doc.createdAt} | CAM: HIK-JTRWF-01 | RES: ${doc.fileSize}</text>
                <text x="410" y="325" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">[VERIFIED EVIDENCE ✔]</text>
              </svg>
            </div>
          </div>

          <!-- Evidence Metadata Card Footer -->
          <div style="background:#1e293b; padding:14px 20px; border-top:1px solid #334155; font-size:11.5px; color:#cbd5e1; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
            <div><strong>Location GPS:</strong> <span style="font-family:monospace; color:#38bdf8;">${meta.gpsCoord || '20.1834° N, 85.6142° E (JTRWF Khordha)'}</span></div>
            <div><strong>Resolution:</strong> ${meta.resolution || '4032 x 3024 (12.2 MP)'}</div>
            <div><strong>Evidence Authenticator:</strong> ${doc.author}</div>
            <div><strong>Integrity Hash:</strong> <span style="font-family:monospace; color:#10b981;">SHA-256 MATCHED</span></div>
          </div>
        </div>
      `;
    },

    zoomImage: function(delta) {
      this.imageZoomScale = Math.max(0.4, Math.min(3.0, this.imageZoomScale + delta));
      this.updateImageTransform();
    },

    rotateImage: function() {
      this.imageRotation = (this.imageRotation + 90) % 360;
      this.updateImageTransform();
    },

    resetImage: function() {
      this.imageZoomScale = 1.0;
      this.imageRotation = 0;
      this.updateImageTransform();
    },

    updateImageTransform: function() {
      const el = document.getElementById('imgPreviewWrapper');
      const scaleLabel = document.getElementById('imgScaleLabel');
      const angleLabel = document.getElementById('imgAngleLabel');
      if (el) el.style.transform = `scale(${this.imageZoomScale}) rotate(${this.imageRotation}deg)`;
      if (scaleLabel) scaleLabel.textContent = `${Math.round(this.imageZoomScale * 100)}%`;
      if (angleLabel) angleLabel.textContent = `${this.imageRotation}°`;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 3. INTERACTIVE CAD & BLUEPRINT VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderCadViewer: function(doc) {
      const meta = doc.metadata || {};
      return `
        <div style="background:#090d16; border-radius:8px; overflow:hidden; border:1px solid #1e293b; font-family:'Inter', sans-serif;">
          <!-- CAD Layer Control Toolbar -->
          <div style="background:#0f172a; padding:10px 16px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:800; color:#818cf8;">📐 CAD Layer Stack:</span>
              <label style="font-size:11px; color:#cbd5e1; cursor:pointer;"><input type="checkbox" checked onchange="BalsonsDocs.toggleCadLayer('grid')"> Structural Grid</label>
              <label style="font-size:11px; color:#cbd5e1; cursor:pointer;"><input type="checkbox" checked onchange="BalsonsDocs.toggleCadLayer('radius')"> Crane Swing Radius</label>
              <label style="font-size:11px; color:#cbd5e1; cursor:pointer;"><input type="checkbox" checked onchange="BalsonsDocs.toggleCadLayer('gbp')"> Ground Bearing Capacity (35T/m²)</label>
              <label style="font-size:11px; color:#cbd5e1; cursor:pointer;"><input type="checkbox" checked onchange="BalsonsDocs.toggleCadLayer('markers')"> Bay Markers</label>
            </div>
            <div style="font-size:11px; font-family:monospace; color:#818cf8;">
              Scale: 1:100 Metric · Projection: Plan Orthographic
            </div>
          </div>

          <!-- CAD Vector Canvas Area -->
          <div style="padding:24px; display:flex; justify-content:center; align-items:center; background:#040711; min-height:480px; overflow:auto;">
            <svg id="cadCanvasSvg" width="720" height="460" viewBox="0 0 720 460" style="background:#090d16; border:1px solid #312e81; border-radius:6px; box-shadow:0 8px 32px rgba(0,0,0,0.6);">
              <!-- Background Blueprint Grid -->
              <g id="layerCadGrid">
                <defs>
                  <pattern id="cadGridPat" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e1b4b" stroke-width="0.8"/>
                  </pattern>
                </defs>
                <rect width="720" height="460" fill="url(#cadGridPat)"/>
                <!-- Major Structural Column Lines -->
                <line x1="60" y1="20" x2="60" y2="440" stroke="#4338ca" stroke-width="1.5" stroke-dasharray="8,4"/>
                <line x1="240" y1="20" x2="240" y2="440" stroke="#4338ca" stroke-width="1.5" stroke-dasharray="8,4"/>
                <line x1="480" y1="20" x2="480" y2="440" stroke="#4338ca" stroke-width="1.5" stroke-dasharray="8,4"/>
                <line x1="660" y1="20" x2="660" y2="440" stroke="#4338ca" stroke-width="1.5" stroke-dasharray="8,4"/>
              </g>

              <!-- Bay Markers -->
              <g id="layerCadMarkers">
                <text x="70" y="45" fill="#a5b4fc" font-size="12" font-family="monospace" font-weight="bold">BAY A (PRESS PIT)</text>
                <text x="250" y="45" fill="#a5b4fc" font-size="12" font-family="monospace" font-weight="bold">BAY B (MACHINING)</text>
                <text x="490" y="45" fill="#a5b4fc" font-size="12" font-family="monospace" font-weight="bold">BAY C (STAGING)</text>
              </g>

              <!-- Ground Bearing Pressure Footprints -->
              <g id="layerCadGbp">
                <rect x="110" y="140" width="160" height="200" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4"/>
                <text x="120" y="165" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">SCHULER PRESS FOUNDATION</text>
                <text x="120" y="185" fill="#6ee7b7" font-size="10" font-family="monospace">Depth: 4.8m · Mat GBP: 28.4 T/m²</text>
              </g>

              <!-- 600 MT Demag Crawler Crane Position & Working Radius -->
              <g id="layerCadRadius">
                <!-- Crane Center -->
                <circle cx="420" cy="240" r="14" fill="#6366f1"/>
                <text x="440" y="245" fill="#818cf8" font-size="11" font-family="monospace" font-weight="bold">DEMAG CC-2800 (600 MT)</text>
                <!-- Tail Swing Radius -->
                <circle cx="420" cy="240" r="70" fill="rgba(239,68,68,0.08)" stroke="#ef4444" stroke-width="1.5"/>
                <text x="425" y="180" fill="#ef4444" font-size="9" font-family="monospace">Tail Swing 14.5m</text>
                <!-- Working Radius to Pit -->
                <circle cx="420" cy="240" r="230" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="6,6"/>
                <text x="425" y="25" fill="#eab308" font-size="10" font-family="monospace" font-weight="bold">Working Radius: 22.0m (Cap: 110 MT)</text>
                <!-- Load Path Vector Line -->
                <line x1="420" y1="240" x2="190" y2="240" stroke="#f43f5e" stroke-width="3"/>
                <polygon points="190,235 180,240 190,245" fill="#f43f5e"/>
                <circle cx="190" cy="240" r="8" fill="#f43f5e"/>
                <text x="175" y="265" fill="#f43f5e" font-size="11" font-family="monospace" font-weight="bold">Crown Target (145 MT)</text>
              </g>

              <!-- Technical Border & Engineering Block -->
              <rect x="520" y="370" width="190" height="80" fill="#0f172a" stroke="#4338ca" stroke-width="1"/>
              <text x="530" y="390" fill="#e0e7ff" font-size="10" font-family="monospace" font-weight="bold">BALSONS HEAVY LIFT</text>
              <text x="530" y="405" fill="#a5b4fc" font-size="8.5" font-family="monospace">DWG: ${doc.refNumber}</text>
              <text x="530" y="420" fill="#a5b4fc" font-size="8.5" font-family="monospace">APPROVED: P. MULEY (PE)</text>
              <text x="530" y="435" fill="#38bdf8" font-size="8" font-family="monospace">STATUS: FOR ERECTION ✔</text>
            </svg>
          </div>

          <!-- CAD Engineering Summary Bar -->
          <div style="background:#0f172a; padding:12px 20px; border-top:1px solid #1e293b; font-size:11.5px; color:#cbd5e1; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
            <div><strong>Rigging Study:</strong> <span style="color:#818cf8; font-weight:700;">Tandem Lift 145 MT</span></div>
            <div><strong>Permissible Ground Pressure:</strong> 35.0 Tonnes/m²</div>
            <div><strong>Actual Max Outrigger Load:</strong> 28.4 Tonnes/m² (PASSED)</div>
            <div><strong>Drawing Revisions:</strong> Rev 3 (Approved for Construction)</div>
          </div>
        </div>
      `;
    },

    toggleCadLayer: function(layer) {
      this.cadActiveLayers[layer] = !this.cadActiveLayers[layer];
      const elMap = {
        grid: 'layerCadGrid',
        radius: 'layerCadRadius',
        gbp: 'layerCadGbp',
        markers: 'layerCadMarkers'
      };
      const targetId = elMap[layer];
      const el = document.getElementById(targetId);
      if (el) el.style.display = this.cadActiveLayers[layer] ? 'inline' : 'none';
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 4. STRUCTURED OFFICE / WORD DOCUMENT VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderOfficeDocViewer: function(doc) {
      return `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:36px; box-shadow:0 4px 16px rgba(0,0,0,0.06); font-family:'Inter', sans-serif; max-width:800px; margin:0 auto; color:#1e293b; line-height:1.6;">
          <div style="border-bottom:2px solid #2563eb; padding-bottom:14px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="display:inline-block; font-size:11px; font-weight:800; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                Official Office Document · ${doc.fileExt ? doc.fileExt.toUpperCase() : 'DOCX'}
              </span>
              <h2 style="margin:8px 0 0 0; font-size:18px; font-weight:900; color:#102d35;">${doc.title}</h2>
            </div>
            <div style="text-align:right; font-family:monospace; font-size:12px; color:#64748b;">
              ${doc.refNumber}<br><span style="color:#008080; font-weight:700;">Live Cloud Synced</span>
            </div>
          </div>

          <!-- Document Executive Body -->
          <h3 style="font-size:14px; font-weight:800; color:#102d35; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-top:20px;">1.0 Executive Scope &amp; Purpose</h3>
          <p style="font-size:12.5px; color:#334155;">
            ${doc.remarks || 'This formal operational document details standard specifications, procedural execution matrices, and contractual mandates for heavy rigging, erection, and workforce governance across the JTRWF Khordha plant facility.'}
          </p>

          <h3 style="font-size:14px; font-weight:800; color:#102d35; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-top:20px;">2.0 Technical Governance &amp; Hold Points</h3>
          <p style="font-size:12.5px; color:#334155;">
            All operations executed under this procedure mandate strict adherence to ISO 9001:2015 quality parameters and Factories Act safety standards. Mandatory inspection hold points must be physically witnessed and cleared by the assigned Portal Lead prior to progression.
          </p>

          <div style="background:#f8fafc; border-left:4px solid #2563eb; padding:12px 16px; margin:20px 0; font-size:12px; color:#1e293b;">
            <strong>Cloud Vault Linkage:</strong> Stored under Root Vault <code>${ROOT_DRIVE_FOLDER_ID}</code> / ${doc.driveFolderName || 'Enterprise Folder'}. Native file format editable via Google Docs Workspace integration.
          </div>

          <div style="margin-top:32px; padding-top:16px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; font-size:11px; color:#64748b;">
            <div>Author: <strong>${doc.author}</strong></div>
            <div>Department: <strong>${doc.portal.toUpperCase()}</strong></div>
            <div>Approved by Executive Super Admin</div>
          </div>
        </div>
      `;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 5. INTERACTIVE SPREADSHEET & CALCULATION GRID VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderSpreadsheetViewer: function(doc) {
      const meta = doc.metadata || {};
      return `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; font-family:'Inter', sans-serif;">
          <!-- Formula Bar Simulator -->
          <div style="background:#f8fafc; padding:8px 16px; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; font-family:monospace; font-size:11.5px;">
            <span style="font-weight:800; color:#059669;">fx:</span>
            <span style="background:#fff; border:1px solid #cbd5e1; padding:3px 8px; border-radius:4px; flex:1; color:#334155;">
              =SUM(GROSS_LOAD) * FACTOR_SAFETY / MAT_AREA_M2
            </span>
            <span style="font-size:11px; color:#64748b;">Grid: 100% Verified</span>
          </div>

          <!-- Spreadsheet Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <thead>
                <tr style="background:#ecfdf5; border-bottom:2px solid #a7f3d0; color:#065f46;">
                  <th style="padding:8px 12px; text-align:center; width:40px; border-right:1px solid #d1fae5;">#</th>
                  <th style="padding:8px 12px; text-align:left; border-right:1px solid #d1fae5;">Parameter / Work Bay</th>
                  <th style="padding:8px 12px; text-align:left; border-right:1px solid #d1fae5;">Engineering Unit</th>
                  <th style="padding:8px 12px; text-align:right; border-right:1px solid #d1fae5;">Measured / Computed</th>
                  <th style="padding:8px 12px; text-align:center;">Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px; text-align:center; background:#f8fafc; font-family:monospace;">1</td>
                  <td style="padding:8px 12px; font-weight:700;">Equipment Static Weight</td>
                  <td style="padding:8px 12px; color:#64748b;">Metric Tonnes (MT)</td>
                  <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700;">145.00 MT</td>
                  <td style="padding:8px; text-align:center;"><span style="color:#10b981; font-weight:800;">VERIFIED ✔</span></td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px; text-align:center; background:#f8fafc; font-family:monospace;">2</td>
                  <td style="padding:8px 12px; font-weight:700;">Dynamic Rigging Factor</td>
                  <td style="padding:8px 12px; color:#64748b;">Ratio (BS 7121)</td>
                  <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700;">1.25</td>
                  <td style="padding:8px; text-align:center;"><span style="color:#10b981; font-weight:800;">PASSED ✔</span></td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px; text-align:center; background:#f8fafc; font-family:monospace;">3</td>
                  <td style="padding:8px 12px; font-weight:700;">Demag CC-2800 Allocated Hook Load</td>
                  <td style="padding:8px 12px; color:#64748b;">Metric Tonnes (MT)</td>
                  <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#008080;">85.00 MT</td>
                  <td style="padding:8px; text-align:center;"><span style="color:#10b981; font-weight:800;">PASSED (77.2% Cap)</span></td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px; text-align:center; background:#f8fafc; font-family:monospace;">4</td>
                  <td style="padding:8px 12px; font-weight:700;">Kobelco CKE2500 Allocated Tail Load</td>
                  <td style="padding:8px 12px; color:#64748b;">Metric Tonnes (MT)</td>
                  <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#008080;">60.00 MT</td>
                  <td style="padding:8px; text-align:center;"><span style="color:#10b981; font-weight:800;">PASSED (68.5% Cap)</span></td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px; text-align:center; background:#f8fafc; font-family:monospace;">5</td>
                  <td style="padding:8px 12px; font-weight:700;">Maximum Ground Pressure (GBP)</td>
                  <td style="padding:8px 12px; color:#64748b;">Tonnes / m²</td>
                  <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#10b981;">28.40 T/m²</td>
                  <td style="padding:8px; text-align:center;"><span style="color:#10b981; font-weight:800;">SAFE (&lt; 35.0 T/m²) ✔</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background:#f8fafc; padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
            <div style="color:#64748b;">Live Google Sheets Linkage: Integrated with Apps Script Engine &amp; Drive Vault</div>
            <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="font-weight:700; color:#059669; text-decoration:underline;">Open in Google Sheets ↗</a>
          </div>
        </div>
      `;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 6. PRESENTATION & SLIDE DECK VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderSlidesViewer: function(doc) {
      return `
        <div style="background:#1e293b; border-radius:8px; padding:24px; color:#fff; font-family:'Inter', sans-serif;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <span style="font-size:11px; font-weight:800; background:#d97706; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                Slide Deck Presentation · PPTX
              </span>
              <h3 style="margin:6px 0 0 0; font-size:16px; color:#fff;">${doc.title}</h3>
            </div>
            <div style="font-family:monospace; font-size:12px; color:#fbbf24;">Slide 1 of 18</div>
          </div>

          <!-- Slide Stage Canvas -->
          <div style="background:#0f172a; border:2px solid #334155; border-radius:6px; padding:40px; min-height:360px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <div style="font-size:36px; margin-bottom:12px;">📽️</div>
            <h2 style="font-size:22px; font-weight:900; color:#fbbf24; margin:0 0 8px 0;">BALSONS HEAVY LIFT &amp; SHIFT</h2>
            <div style="font-size:14px; font-weight:700; color:#e2e8f0; margin-bottom:16px;">JTRWF Project Erection &amp; Statutory Governance Overview</div>
            <div style="font-size:12px; color:#94a3b8; max-width:540px; line-height:1.6;">
              Executive slide presentation prepared for corporate review and site safety induction. Stored as cloud presentation asset in Google Drive.
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
            <div style="font-size:11px; color:#94a3b8;">Use Google Slides integration for live presentation mode</div>
            <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="color:#fbbf24; font-weight:700; font-size:12px; text-decoration:underline;">Open in Google Drive Presentation Studio ↗</a>
          </div>
        </div>
      `;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 7. RICH MEDIA, AUDIO & VIDEO VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderMediaViewer: function(doc) {
      const isVideo = (doc.fileExt || '').toLowerCase() === 'mp4' || (doc.mimeType || '').includes('video');
      return `
        <div style="background:#0f172a; border-radius:8px; padding:24px; color:#fff; font-family:'Inter', sans-serif;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <span style="font-size:11px; font-weight:800; background:#9333ea; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                ${isVideo ? '🎥 Video Asset' : '🎙️ Audio Recording Log'}
              </span>
              <h3 style="margin:6px 0 0 0; font-size:16px; color:#fff;">${doc.title}</h3>
            </div>
            <div style="font-family:monospace; font-size:12px; color:#c084fc;">${doc.fileSize} · High Fidelity</div>
          </div>

          <!-- Media Viewport -->
          <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:32px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:280px;">
            ${isVideo ? `
              <div style="font-size:48px; margin-bottom:12px;">🎬</div>
              <div style="font-size:15px; font-weight:800; color:#38bdf8;">4K Aerial Drone Site Inspection Stream</div>
              <div style="font-size:11.5px; color:#94a3b8; margin:6px 0 16px 0;">Capturing Crawler tracks alignment and Bay A Press Pit clearances</div>
              <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="background:#008080; color:#fff; font-size:12px; font-weight:800; padding:8px 16px; border-radius:6px; text-decoration:none;">▶️ Stream Video in Drive Viewer</a>
            ` : `
              <div style="font-size:48px; margin-bottom:12px;">🎙️</div>
              <div style="font-size:15px; font-weight:800; color:#c084fc;">Morning Shift Pre-Lift ToolBox Talk Audio</div>
              <div style="font-size:11.5px; color:#94a3b8; margin:6px 0 16px 0;">Duration: 06:45 · 28 Riggers Present · Verified by Safety Officer</div>
              <!-- Waveform Simulator -->
              <div style="display:flex; gap:3px; align-items:center; height:40px; margin-bottom:16px;">
                ${[12,24,35,18,40,28,15,30,38,20,10,32,40,22,18,36,29,14,25,38,15].map(h => `<div style="width:4px; height:${h}px; background:#a855f7; border-radius:2px;"></div>`).join('')}
              </div>
              <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="background:#9333ea; color:#fff; font-size:12px; font-weight:800; padding:8px 16px; border-radius:6px; text-decoration:none;">▶️ Play Audio Log</a>
            `}
          </div>

          <div style="margin-top:16px; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between;">
            <div>Recorded By: <strong>${doc.author}</strong></div>
            <div>Statutory Retention: <strong>7 Years Cloud Vault Lock</strong></div>
          </div>
        </div>
      `;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 8. ARCHIVE & BACKUP PACKAGE VIEWER
    // ──────────────────────────────────────────────────────────────────────────
    renderArchiveViewer: function(doc) {
      return `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:24px; font-family:'Inter', sans-serif;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #475569; padding-bottom:12px; margin-bottom:16px;">
            <div>
              <span style="font-size:11px; font-weight:800; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                Compressed Package Archive · ZIP
              </span>
              <h3 style="margin:6px 0 0 0; font-size:16px; color:#102d35;">${doc.title}</h3>
            </div>
            <div style="font-family:monospace; font-size:12px; color:#008080;">${doc.fileSize}</div>
          </div>

          <!-- Manifest File Explorer -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:16px; margin-bottom:16px;">
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:8px;">📦 Package Manifest (Verified Content):</div>
            <ul style="margin:0; padding-left:20px; font-size:11.5px; font-family:monospace; color:#475569; line-height:1.7;">
              <li>📁 01_RELATIONAL_SCHEMAS/ (24 CSV Databases)</li>
              <li>📁 02_DRIVE_VAULT_TOPOLOGY/ (87 Mapped Sub-Vaults)</li>
              <li>📄 BALSONS_MASTER_CHECKSUM.sha256 (Tamper-Proof)</li>
              <li>📄 RECOVERY_HANDOVER_MANUAL.pdf (ISO 9001:2015)</li>
            </ul>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11px; color:#64748b;">Cloud Backup stored in Executive Drive Sub-Vault</div>
            <a href="${doc.driveUrl}" target="_blank" rel="noopener" style="font-size:12px; font-weight:800; color:#008080; text-decoration:underline;">Download Complete ZIP Package ↗</a>
          </div>
        </div>
      `;
    },

    renderStatutorySheet: function(doc) {
      return this.renderPdfViewer(doc);
    },

    downloadDocument: function(docId) {
      const doc = this.documents.find(d => d.id === docId || d.refNumber === docId);
      if (!doc) return;

      const a = document.createElement('a');
      a.href = doc.driveUrl || `https://drive.google.com/drive/folders/${doc.driveFolderId}`;
      a.target = '_blank';
      a.download = `${doc.refNumber}_BALSONS_EVIDENCE.${doc.fileExt || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast(`⬇️ Initiated download for <strong>${doc.refNumber}</strong>.`);
    },

    printDocument: function(docId) {
      window.print();
    }
  });
''')

print("Viewers written successfully.")
