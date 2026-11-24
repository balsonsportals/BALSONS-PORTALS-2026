/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Gate Entry & Site Access Portal Client Controller
 * Compliant with SAM-2026 4-Tier Serverless Architecture & BEDS V2.0
 */

(function(window) {
  'use strict';

  // 1. Initial State & Data Store
  const GateApp = {
    state: {
      stream: [
        { id: 'GT-2026-0901', timestamp: '24-Nov-2026 17:42:10', subjectId: 'EMP-2026-0001', name: 'Rajesh Sharma', category: 'RIGGER', direction: 'IN', lane: 'TURNSTILE_01', bay: 'BAY_A_SCHULER_PRESS', status: 'CLEARED' },
        { id: 'GT-2026-0900', timestamp: '24-Nov-2026 17:35:40', subjectId: 'OD-02-AX-8891', name: 'Tata Steel Trailer (Suresh Kumar)', category: 'HEAVY_VEHICLE', direction: 'IN', lane: 'VEHICLE_GATE_01', bay: 'CENTRAL_YARD', status: 'CLEARED' },
        { id: 'GT-2026-0899', timestamp: '24-Nov-2026 17:28:15', subjectId: 'EMP-2026-0004', name: 'Manoj Kumar Patra', category: 'OPERATOR', direction: 'IN', lane: 'TURNSTILE_02', bay: 'BAY_A_SCHULER_PRESS', status: 'CLEARED' },
        { id: 'GT-2026-0898', timestamp: '24-Nov-2026 17:15:22', subjectId: 'EMP-2026-0003', name: 'Sunil Jena', category: 'FABRICATOR', direction: 'OUT', lane: 'TURNSTILE_01', bay: 'BAY_C_FABRICATION', status: 'CLEARED' },
        { id: 'GT-2026-0897', timestamp: '24-Nov-2026 16:58:04', subjectId: 'EMP-2026-0002', name: 'Amit Verma', category: 'RIGGER', direction: 'IN', lane: 'TURNSTILE_01', bay: 'BAY_B_WHEEL_AXLE', status: 'CLEARED' },
        { id: 'GT-2026-0896', timestamp: '24-Nov-2026 16:40:11', subjectId: 'EMP-2026-0005', name: 'Dilip Behera', category: 'HELPER', direction: 'IN', lane: 'TURNSTILE_02', bay: 'BAY_A_SCHULER_PRESS', status: 'CLEARED' },
        { id: 'GT-2026-0895', timestamp: '24-Nov-2026 16:12:49', subjectId: 'EMP-2026-0006', name: 'Santosh Swain', category: 'FITTER', direction: 'IN', lane: 'TURNSTILE_01', bay: 'BAY_C_FABRICATION', status: 'CLEARED' }
      ],
      inward: [
        { inwardId: 'INW-2026-0341', type: 'PO_DELIVERY', poNumber: 'PO-2026-0089', challanNo: 'DC-88410', vendor: 'Tata Steel Ltd, Kalinganagar', vehicleNo: 'OD-02-AX-8891', category: 'Structural Steel Plates', declaredQty: '48.5 MT', bay: 'CENTRAL_YARD', status: 'INSPECTION_PENDING' },
        { inwardId: 'INW-2026-0340', type: 'PO_DELIVERY', poNumber: 'PO-2026-0072', challanNo: 'DC-11209', vendor: 'Usha Martin Wire Ropes', vehicleNo: 'JH-05-CC-4012', category: 'Crane Wire Ropes & Slings', declaredQty: '12 Coils', bay: 'MAIN_STORE', status: 'UNLOADED_VERIFIED' },
        { inwardId: 'INW-2026-0339', type: 'DC_RETURN', poNumber: 'DC-2026-0014', challanNo: 'DC-2026-0014', vendor: 'Jindal Rail Infrastructure', vehicleNo: 'OD-33-MM-7721', category: 'Machined Axle Shafts', declaredQty: '8 Nos', bay: 'BAY_B_AXLE', status: 'UNLOADED_VERIFIED' }
      ],
      gatePasses: [
        { passId: 'GP-2026-0112', type: 'RGP', consignee: 'L&T Heavy Engineering, Kansbahal', vehicleNo: 'OD-05-AA-5511', items: '2x 50T Rigging Slings (Proof Test)', returnDate: '30-Nov-2026', approval: 'APPROVED', status: 'GATE_EXIT_CLEARED' },
        { passId: 'GP-2026-0111', type: 'NRGP', consignee: 'Jupiter Scrap Processing Yard', vehicleNo: 'OD-02-BB-3390', items: 'Metal Turnings & Offcuts 12 MT', returnDate: 'N/A', approval: 'APPROVED', status: 'DISPATCHED_EXIT' },
        { passId: 'GP-2026-0110', type: 'RGP', consignee: 'Apex Calibration Labs, Cuttack', vehicleNo: 'OD-02-KK-1212', items: '3x Mitutoyo Micrometers & Verniers', returnDate: '28-Nov-2026', approval: 'PENDING_HOD', status: 'DRAFT_STATIONED' }
      ],
      complianceProfiles: {
        'EMP-2026-0001': { name: 'Rajesh Sharma', trade: 'Master Heavy Rigger', idPass: true, pvcPass: true, medPass: true, vertigoPass: true, insPass: true, compPass: true, ppePass: true, docPass: true, eqPass: true },
        'EMP-2026-0002': { name: 'Amit Verma', trade: 'Rigging Specialist', idPass: true, pvcPass: true, medPass: true, vertigoPass: true, insPass: true, compPass: true, ppePass: true, docPass: true, eqPass: true },
        'EMP-2026-0003': { name: 'Sunil Jena', trade: 'Heavy Fabricator', idPass: true, pvcPass: true, medPass: true, vertigoPass: false, insPass: true, compPass: true, ppePass: true, docPass: true, eqPass: true },
        'EMP-2026-0004': { name: 'Manoj Kumar Patra', trade: '600T Crawler Crane Operator', idPass: true, pvcPass: true, medPass: true, vertigoPass: true, insPass: true, compPass: true, ppePass: true, docPass: true, eqPass: true },
        'EMP-2026-0005': { name: 'Dilip Behera', trade: 'General Yard Helper', idPass: true, pvcPass: true, medPass: true, vertigoPass: false, insPass: true, compPass: true, ppePass: true, docPass: true, eqPass: true }
      }
    },

    // 2. Initialization
    init: function() {
      console.log('🚧 Initializing BALSONS Gate Entry & Site Access Portal Controller...');
      this.bindTabNavigation();
      this.bindModals();
      this.bindFormHandlers();
      this.bindScanInput();
      this.bindClearanceEvaluator();
      this.renderStreamTable();
      this.renderInwardTable();
      this.renderGatePassTable();
      this.updateKPIs();
    },

    // 3. Tab Switching
    bindTabNavigation: function() {
      const tabBtns = document.querySelectorAll('.beds-tab-btn');
      const tabPanes = document.querySelectorAll('.beds-tab-pane');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tab');
          tabBtns.forEach(b => b.classList.remove('active'));
          tabPanes.forEach(p => p.classList.remove('active'));

          btn.classList.add('active');
          const activePane = document.getElementById(targetTab);
          if (activePane) activePane.classList.add('active');
        });
      });
    },

    // 4. Modal Open/Close Controls
    bindModals: function() {
      // Open buttons
      const btnManual = document.getElementById('btnManualSwipe');
      if (btnManual) btnManual.addEventListener('click', () => this.openModal('modalManualSwipe'));

      const btnInward = document.getElementById('btnOpenInwardModal');
      if (btnInward) btnInward.addEventListener('click', () => this.openModal('modalInward'));

      const btnGatePass = document.getElementById('btnOpenGatePassModal');
      if (btnGatePass) btnGatePass.addEventListener('click', () => this.openModal('modalGatePass'));

      const btnMuster = document.getElementById('btnEmergencyMuster');
      if (btnMuster) {
        btnMuster.addEventListener('click', () => {
          this.renderMusterRoster();
          this.openModal('modalMuster');
        });
      }

      // Close buttons
      document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
          const modalId = closeBtn.getAttribute('data-close-modal');
          this.closeModal(modalId);
        });
      });

      // Close on backdrop click
      document.querySelectorAll('.beds-modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) backdrop.classList.remove('active');
        });
      });
    },

    openModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('active');
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    },

    // 5. Scan Barcode / Fast Input
    bindScanInput: function() {
      const scanInput = document.getElementById('gateScanInput');
      if (!scanInput) return;

      scanInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = scanInput.value.trim().toUpperCase();
          if (!query) return;

          // Check current on-site status of this subject
          const lastEntry = this.state.stream.find(s => s.subjectId.toUpperCase() === query);
          const currentInside = lastEntry && lastEntry.direction === 'IN';
          const nextDirection = currentInside ? 'OUT' : 'IN';

          this.recordGateMovement({
            subjectId: query,
            name: this.state.complianceProfiles[query] ? this.state.complianceProfiles[query].name : query,
            category: query.startsWith('EMP') ? 'PERSONNEL' : 'VEHICLE',
            direction: nextDirection,
            lane: 'TURNSTILE_01',
            bay: 'BAY_A_SCHULER_PRESS'
          });

          scanInput.value = '';
        }
      });

      // Filter by direction
      const filterDirection = document.getElementById('gateFilterDirection');
      if (filterDirection) {
        filterDirection.addEventListener('change', () => {
          this.renderStreamTable();
        });
      }
    },

    // 6. Form Handlers
    bindFormHandlers: function() {
      // Manual Swipe Form
      const formSwipe = document.getElementById('formManualSwipe');
      if (formSwipe) {
        formSwipe.addEventListener('submit', (e) => {
          e.preventDefault();
          const subjectId = document.getElementById('swipeSubjectId').value.trim().toUpperCase();
          const direction = document.getElementById('swipeDirection').value;
          const lane = document.getElementById('swipeLane').value;
          const bay = document.getElementById('swipeBay').value;

          const profile = this.state.complianceProfiles[subjectId];
          const name = profile ? profile.name : subjectId;
          const category = subjectId.startsWith('EMP') ? 'PERSONNEL' : 'VEHICLE';

          this.recordGateMovement({ subjectId, name, category, direction, lane, bay });
          formSwipe.reset();
          this.closeModal('modalManualSwipe');
        });
      }

      // Inward Truck Form
      const formInward = document.getElementById('formInward');
      if (formInward) {
        formInward.addEventListener('submit', (e) => {
          e.preventDefault();
          const newInward = {
            inwardId: 'INW-2026-' + Math.floor(1000 + Math.random() * 9000),
            type: document.getElementById('inwardType').value,
            poNumber: document.getElementById('inwardDocNo').value.trim().toUpperCase(),
            challanNo: 'DC-' + Math.floor(10000 + Math.random() * 90000),
            vendor: document.getElementById('inwardVendor').value.trim(),
            vehicleNo: document.getElementById('inwardVehicle').value.trim().toUpperCase(),
            category: document.getElementById('inwardCategory').options[document.getElementById('inwardCategory').selectedIndex].text,
            declaredQty: document.getElementById('inwardQty').value.trim(),
            bay: document.getElementById('inwardBay').value,
            status: 'INSPECTION_PENDING'
          };

          this.state.inward.unshift(newInward);
          this.renderInwardTable();
          this.updateKPIs();
          this.closeModal('modalInward');
          formInward.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('GATE_INWARD_CREATE', newInward);
            window.BalsonsWorkspace.showToast('✅ Material Inward delivery recorded: ' + newInward.inwardId, 'success');
          }
        });
      }

      // Gate Pass Form
      const formGatePass = document.getElementById('formGatePass');
      if (formGatePass) {
        formGatePass.addEventListener('submit', (e) => {
          e.preventDefault();
          const passType = document.getElementById('passType').value;
          const newPass = {
            passId: 'GP-2026-' + Math.floor(1000 + Math.random() * 9000),
            type: passType,
            consignee: document.getElementById('passConsignee').value.trim(),
            vehicleNo: document.getElementById('passVehicle').value.trim().toUpperCase(),
            items: document.getElementById('passItems').value.trim(),
            returnDate: passType === 'RGP' ? (document.getElementById('passReturnDate').value || '15-Dec-2026') : 'N/A',
            approval: 'PENDING_HOD',
            status: 'DRAFT_STATIONED'
          };

          this.state.gatePasses.unshift(newPass);
          this.renderGatePassTable();
          this.updateKPIs();
          this.closeModal('modalGatePass');
          formGatePass.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('GATE_PASS_CREATE', newPass);
            window.BalsonsWorkspace.showToast('✅ ' + passType + ' Generated: ' + newPass.passId + ' routed for HOD approval', 'success');
          }
        });
      }
    },

    // 7. Record Movement & Turnstile Rules
    recordGateMovement: function(data) {
      // Double entry / exit validation guard
      const lastMovement = this.state.stream.find(s => s.subjectId === data.subjectId);
      if (lastMovement && lastMovement.direction === data.direction) {
        const errorMsg = data.direction === 'IN' 
          ? `⚠️ DOUBLE ENTRY REJECTED: Subject ${data.subjectId} is ALREADY INSIDE premises.`
          : `⚠️ INVALID EXIT REJECTED: Subject ${data.subjectId} has NO RECORDED ENTRY.`;
        if (window.BalsonsWorkspace) window.BalsonsWorkspace.showToast(errorMsg, 'error');
        alert(errorMsg);
        return;
      }

      const now = new Date();
      const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB');

      const entryRecord = {
        id: 'GT-2026-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: timeStr,
        subjectId: data.subjectId,
        name: data.name,
        category: data.category,
        direction: data.direction,
        lane: data.lane,
        bay: data.bay,
        status: 'CLEARED'
      };

      this.state.stream.unshift(entryRecord);
      this.renderStreamTable();
      this.updateKPIs();

      if (window.BalsonsWorkspace) {
        window.BalsonsWorkspace.enqueueMutation('GATE_SWIPE_LOG', entryRecord);
        window.BalsonsWorkspace.showToast(`✅ Gate ${data.direction} logged for ${data.subjectId} (${data.name})`, 'success');
      }
    },

    // 8. 9-Discipline Compliance Evaluation Engine
    bindClearanceEvaluator: function() {
      const btnEval = document.getElementById('btnTriggerEvaluation');
      if (!btnEval) return;

      btnEval.addEventListener('click', () => {
        const subjectId = document.getElementById('evalSubjectId').value.trim().toUpperCase();
        const activity = document.getElementById('evalActivity').value;
        const banner = document.getElementById('evalResultBanner');
        const grid = document.getElementById('disciplineGrid');

        const profile = this.state.complianceProfiles[subjectId] || {
          name: 'External Contractor',
          trade: 'General Worker',
          idPass: true,
          pvcPass: true,
          medPass: true,
          vertigoPass: false,
          insPass: true,
          compPass: false,
          ppePass: true,
          docPass: true,
          eqPass: true
        };

        // Vertigo Rule: Mandatory for HEIGHT_WORK (>1.8m), Non-Waivable
        let heightFailed = (activity === 'HEIGHT_WORK' && !profile.vertigoPass);
        let isOverallCleared = profile.idPass && profile.pvcPass && profile.medPass && profile.insPass && profile.ppePass && !heightFailed;

        if (isOverallCleared) {
          banner.className = 'beds-alert beds-alert-green';
          banner.innerHTML = `<strong>🟢 STATUS: CLEARED FOR SITE ACCESS</strong> · Validity: 24 Hours · Subject: <strong>${profile.name} (${subjectId})</strong> · Trade: ${profile.trade}. All statutory conditions satisfied.`;
        } else {
          banner.className = 'beds-alert beds-alert-red';
          const reason = heightFailed ? 'CRITICAL NON-WAIVABLE VERTIGO CLEARANCE MISSING (Height Work Prohibited)' : 'STATUTORY PRE-CONDITIONS INCOMPLETE';
          banner.innerHTML = `<strong>🔴 STATUS: ACCESS DENIED (${reason})</strong> · Subject: <strong>${profile.name} (${subjectId})</strong>. Physical turnstile gate lock engaged.`;
        }

        // Render 9 Lights
        const disciplines = [
          { name: '1. IDENTITY VALIDITY', pass: profile.idPass, detail: profile.idPass ? 'PASS (Photo ID Active)' : 'FAIL (Invalid/Missing ID)' },
          { name: '2. POLICE VERIFICATION', pass: profile.pvcPass, detail: profile.pvcPass ? 'PASS (PVC Verified)' : 'FAIL (PVC Expired)' },
          { name: '3. MEDICAL FITNESS', pass: profile.medPass, detail: profile.medPass ? 'PASS (Form-32 Valid)' : 'FAIL (Medical Due)' },
          { name: '4. VERTIGO CLEARANCE', pass: profile.vertigoPass, detail: profile.vertigoPass ? 'PASS (Height Cleared)' : 'FAIL (Vertigo Test Uncertified)' },
          { name: '5. STATUTORY INSURANCE', pass: profile.insPass, detail: profile.insPass ? 'PASS (Policy Active)' : 'FAIL (Insurance Lapsed)' },
          { name: '6. TRADE COMPETENCY', pass: profile.compPass, detail: profile.compPass ? 'PASS (' + profile.trade + ')' : 'FAIL (Uncertified)' },
          { name: '7. PPE COMPLIANCE', pass: profile.ppePass, detail: profile.ppePass ? 'PASS (5-Point Verified)' : 'FAIL (PPE Deficient)' },
          { name: '8. WORK DOCUMENTATION', pass: profile.docPass, detail: profile.docPass ? 'PASS (RA/JSA Active)' : 'FAIL (Missing JSA)' },
          { name: '9. EQUIPMENT FITNESS', pass: profile.eqPass, detail: profile.eqPass ? 'PASS (Form 11 / PUC)' : 'FAIL (Defect Notice)' }
        ];

        grid.innerHTML = disciplines.map(d => `
          <div class="beds-kpi-card" style="padding: 12px; border-left: 4px solid ${d.pass ? 'var(--beds-status-cleared)' : 'var(--beds-alert-red)'};">
            <div style="font-size: 11.5px; font-weight: 700;">${d.name}</div>
            <div style="color: ${d.pass ? 'var(--beds-status-cleared)' : 'var(--beds-alert-red)'}; font-weight: 700; font-size: 13px;">
              ${d.pass ? '🟢' : '🔴'} ${d.detail}
            </div>
          </div>
        `).join('');
      });
    },

    // 9. Render Tables
    renderStreamTable: function() {
      const tbody = document.getElementById('gateStreamBody');
      if (!tbody) return;

      const filterDir = document.getElementById('gateFilterDirection') ? document.getElementById('gateFilterDirection').value : 'ALL';

      const filtered = this.state.stream.filter(item => {
        if (filterDir === 'ALL') return true;
        return item.direction === filterDir;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--beds-text-muted); padding: 24px;">No gate transactions recorded matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(row => `
        <tr>
          <td><code style="font-size: 11px;">${row.timestamp}</code></td>
          <td><strong>${row.subjectId}</strong></td>
          <td>${row.name}</td>
          <td><span class="beds-badge" style="background: rgba(16, 45, 53, 0.08); font-size: 10.5px;">${row.category}</span></td>
          <td>
            <span class="beds-badge" style="background: ${row.direction === 'IN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(230, 70, 70, 0.15)'}; color: ${row.direction === 'IN' ? 'var(--beds-status-cleared)' : 'var(--beds-alert-red)'}; font-weight: 800;">
              ${row.direction === 'IN' ? '⬇️ IN' : '⬆️ OUT'}
            </span>
          </td>
          <td>${row.lane}</td>
          <td><span style="font-size: 11.5px; color: var(--beds-teal-primary);">${row.bay}</span></td>
          <td>
            <span class="beds-badge beds-badge-active">🟢 ${row.status}</span>
          </td>
        </tr>
      `).join('');
    },

    renderInwardTable: function() {
      const tbody = document.getElementById('inwardTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.inward.map(row => `
        <tr>
          <td><strong>${row.inwardId}</strong></td>
          <td><span class="beds-badge" style="background: rgba(0, 151, 178, 0.1); color: var(--beds-teal-primary);">${row.type}</span></td>
          <td><code>${row.poNumber}</code></td>
          <td>${row.challanNo}</td>
          <td>${row.vendor}</td>
          <td><strong>${row.vehicleNo}</strong></td>
          <td>${row.category}</td>
          <td><strong>${row.declaredQty}</strong></td>
          <td>${row.bay}</td>
          <td>
            <span class="beds-badge" style="background: ${row.status.includes('VERIFIED') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${row.status.includes('VERIFIED') ? 'var(--beds-status-cleared)' : 'var(--beds-status-conditional)'};">
              ${row.status}
            </span>
          </td>
        </tr>
      `).join('');
    },

    renderGatePassTable: function() {
      const tbody = document.getElementById('gatePassBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.gatePasses.map(row => `
        <tr>
          <td><strong>${row.passId}</strong></td>
          <td>
            <span class="beds-badge" style="background: ${row.type === 'RGP' ? 'rgba(0, 151, 178, 0.15)' : 'rgba(230, 70, 70, 0.15)'}; color: ${row.type === 'RGP' ? 'var(--beds-teal-primary)' : 'var(--beds-alert-red)'}; font-weight: 800;">
              ${row.type}
            </span>
          </td>
          <td>${row.consignee}</td>
          <td><strong>${row.vehicleNo}</strong></td>
          <td>${row.items}</td>
          <td><code>${row.returnDate}</code></td>
          <td>
            <span class="beds-badge" style="background: ${row.approval === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${row.approval === 'APPROVED' ? 'var(--beds-status-cleared)' : 'var(--beds-status-conditional)'};">
              ${row.approval}
            </span>
          </td>
          <td>
            <span class="beds-badge" style="background: rgba(16, 45, 53, 0.08); font-size: 11px;">${row.status}</span>
          </td>
          <td>
            ${row.approval === 'APPROVED' && row.status !== 'DISPATCHED_EXIT' ? `
              <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="GateApp.dispatchPass('${row.passId}')">Exit Check</button>
            ` : `<span style="font-size: 11px; color: var(--beds-text-muted);">Verified</span>`}
          </td>
        </tr>
      `).join('');
    },

    dispatchPass: function(passId) {
      const pass = this.state.gatePasses.find(p => p.passId === passId);
      if (pass) {
        pass.status = 'DISPATCHED_EXIT';
        this.renderGatePassTable();
        if (window.BalsonsWorkspace) {
          window.BalsonsWorkspace.enqueueMutation('GATE_PASS_DISPATCH', { passId });
          window.BalsonsWorkspace.showToast(`✅ Gate exit cleared for Pass ${passId}`, 'success');
        }
      }
    },

    // 10. Emergency Muster Roll-Call
    renderMusterRoster: function() {
      const rosterBody = document.getElementById('musterRosterBody');
      const musterCount = document.getElementById('musterCount');
      if (!rosterBody) return;

      // Active personnel = most recent transaction was 'IN'
      const subjectMap = {};
      this.state.stream.forEach(s => {
        if (!subjectMap[s.subjectId]) {
          subjectMap[s.subjectId] = s;
        }
      });

      const insideSubjects = Object.values(subjectMap).filter(s => s.direction === 'IN');
      if (musterCount) musterCount.innerText = insideSubjects.length;

      rosterBody.innerHTML = insideSubjects.map(p => `
        <tr>
          <td><strong>${p.subjectId}</strong></td>
          <td>${p.name} (${p.category})</td>
          <td><span style="color: var(--beds-teal-primary); font-weight: 700;">${p.bay}</span></td>
          <td><code>${p.timestamp}</code></td>
        </tr>
      `).join('');
    },

    // 11. KPI Counters
    updateKPIs: function() {
      // Calculate On-Site count
      const subjectMap = {};
      this.state.stream.forEach(s => {
        if (!subjectMap[s.subjectId]) subjectMap[s.subjectId] = s;
      });
      const activeCount = Object.values(subjectMap).filter(s => s.direction === 'IN').length;

      const kpiOnSite = document.getElementById('kpiOnSiteHeadcount');
      if (kpiOnSite) kpiOnSite.innerText = activeCount;

      const kpiPending = document.getElementById('kpiPendingDeliveries');
      if (kpiPending) {
        const pendingCount = this.state.inward.filter(i => i.status.includes('PENDING')).length;
        kpiPending.innerText = pendingCount + ' Trucks';
      }

      const kpiPasses = document.getElementById('kpiActivePasses');
      if (kpiPasses) {
        kpiPasses.innerText = this.state.gatePasses.length + ' Passes';
      }
    }
  };

  window.GateApp = GateApp;
})(window);
