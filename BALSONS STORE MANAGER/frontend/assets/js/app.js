/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Store & Rigging Tackle Manager Client Controller
 * Compliant with SAM-2026 4-Tier Serverless Architecture & BEDS V2.0
 */

(function(window) {
  'use strict';

  const StoreApp = {
    state: {
      activeCategory: 'ALL',
      catalog: [
        // LF: Lifting Jacks & Heavy Hydraulic Cylinders
        { id: 'BAL-LF-HYJ-001', desc: '100 MT Heavy Hydraulic Cylinder (Enerpac)', cat: 'LF', swl: '100 MT', serial: 'ENP-100-8812', calibExpiry: '15-Dec-2026', tag: 'GREEN', status: 'AVAILABLE', location: 'Rack LF-01' },
        { id: 'BAL-LF-HYJ-002', desc: '150 MT Heavy Hydraulic Cylinder (Enerpac)', cat: 'LF', swl: '150 MT', serial: 'ENP-150-4419', calibExpiry: '12-Jan-2027', tag: 'GREEN', status: 'ISSUED', location: 'Bay A Pit' },
        { id: 'BAL-LF-TOE-003', desc: '50 MT Hydraulic Toe Jack with Hand Pump', cat: 'LF', swl: '50 MT', serial: 'TOE-50-2024', calibExpiry: '10-Nov-2026', tag: 'AMBER', status: 'AVAILABLE', location: 'Rack LF-02' },
        { id: 'BAL-LF-HYJ-004', desc: '200 MT Climbing Jack with Locking Collar', cat: 'LF', swl: '200 MT', serial: 'ENP-200-9901', calibExpiry: '20-Oct-2026', tag: 'RED', status: 'QUARANTINE', location: 'Quarantine Bay' },

        // HF: High-Tension Slings, Webbing & Steel Wire Ropes
        { id: 'BAL-HF-SLG-001', desc: '50 MT 4-Leg Grommet Wire Rope Sling (32mm)', cat: 'HF', swl: '50 MT', serial: 'WRS-50-7711', calibExpiry: '28-Feb-2027', tag: 'GREEN', status: 'AVAILABLE', location: 'Crib HF-01' },
        { id: 'BAL-HF-SLG-002', desc: '100 MT Heavy Endless Braided Wire Sling', cat: 'HF', swl: '100 MT', serial: 'WRS-100-3321', calibExpiry: '15-Mar-2027', tag: 'GREEN', status: 'ISSUED', location: 'Bay A Press' },
        { id: 'BAL-HF-WEB-003', desc: '25 MT Polyester Round Sling (Double Sleeve)', cat: 'HF', swl: '25 MT', serial: 'RND-25-8842', calibExpiry: '14-Apr-2027', tag: 'GREEN', status: 'AVAILABLE', location: 'Crib HF-02' },
        { id: 'BAL-HF-SLG-004', desc: '80 MT Cable Laid Heavy Lift Sling', cat: 'HF', swl: '80 MT', serial: 'CBL-80-1102', calibExpiry: '05-Jan-2027', tag: 'GREEN', status: 'ISSUED', location: 'Bay B Axle' },

        // SH: Heavy Forged Bow & D-Shackles
        { id: 'BAL-SH-BOW-001', desc: '85 MT Green Pin Super Bow Shackle (Grade 8)', cat: 'SH', swl: '85 MT', serial: 'GP-85-4421', calibExpiry: '10-May-2027', tag: 'GREEN', status: 'AVAILABLE', location: 'Bin SH-01' },
        { id: 'BAL-SH-BOW-002', desc: '120 MT Alloy Steel Heavy Duty Shackle', cat: 'SH', swl: '120 MT', serial: 'GP-120-9912', calibExpiry: '22-Jun-2027', tag: 'GREEN', status: 'ISSUED', location: 'Bay A Press' },
        { id: 'BAL-SH-DEE-003', desc: '55 MT Forged D-Shackle with Safety Bolt', cat: 'SH', swl: '55 MT', serial: 'GP-55-6671', calibExpiry: '18-Feb-2027', tag: 'GREEN', status: 'AVAILABLE', location: 'Bin SH-02' },

        // SP: Spreader Beams, Lifting Beams & Equalizers
        { id: 'BAL-SP-BM-001', desc: '250 MT Modular Spreader Beam (12m Span)', cat: 'SP', swl: '250 MT', serial: 'MOD-250-01', calibExpiry: '10-Jul-2027', tag: 'GREEN', status: 'ISSUED', location: 'Central Yard' },
        { id: 'BAL-SP-EQ-002', desc: '150 MT Equalizer Triangle Rigging Beam', cat: 'SP', swl: '150 MT', serial: 'EQ-150-02', calibExpiry: '04-Aug-2027', tag: 'GREEN', status: 'AVAILABLE', location: 'Yard Staging' },

        // PU: Multi-Wheel Hydraulic Transport Pullers & Power Packs
        { id: 'BAL-PU-PWR-001', desc: '700 Bar High-Flow Electric Hydraulic Power Pack', cat: 'PU', swl: '700 Bar', serial: 'PP-700-114', calibExpiry: '19-Jan-2027', tag: 'GREEN', status: 'ISSUED', location: 'Bay A Press' },
        { id: 'BAL-PU-PUL-002', desc: '40 MT Multi-Axle Heavy Wire Rope Puller (Tirfor)', cat: 'PU', swl: '40 MT', serial: 'TIR-40-08', calibExpiry: '22-Dec-2026', tag: 'GREEN', status: 'AVAILABLE', location: 'Rack PU-01' }
      ],
      ledger: [
        { txId: 'ISS-2026-0210', assetId: 'BAL-LF-HYJ-002', desc: '150 MT Heavy Hydraulic Cylinder', empId: 'EMP-2026-0001', empName: 'Rajesh Sharma', bay: 'BAY_A_SCHULER_PRESS', issueTime: '24-Nov-2026 08:30', expectedReturn: '24-Nov-2026', status: 'DEPLOYED_ACTIVE' },
        { txId: 'ISS-2026-0209', assetId: 'BAL-HF-SLG-002', desc: '100 MT Heavy Endless Braided Wire Sling', empId: 'EMP-2026-0002', empName: 'Amit Verma', bay: 'BAY_A_SCHULER_PRESS', issueTime: '24-Nov-2026 09:15', expectedReturn: '25-Nov-2026', status: 'DEPLOYED_ACTIVE' },
        { txId: 'ISS-2026-0208', assetId: 'BAL-SH-BOW-002', desc: '120 MT Alloy Steel Heavy Duty Shackle', empId: 'EMP-2026-0001', empName: 'Rajesh Sharma', bay: 'BAY_A_SCHULER_PRESS', issueTime: '24-Nov-2026 09:30', expectedReturn: '24-Nov-2026', status: 'DEPLOYED_ACTIVE' },
        { txId: 'ISS-2026-0207', assetId: 'BAL-SP-BM-001', desc: '250 MT Modular Spreader Beam', empId: 'EMP-2026-0004', empName: 'Manoj Kumar Patra', bay: 'CENTRAL_YARD', issueTime: '23-Nov-2026 14:00', expectedReturn: '26-Nov-2026', status: 'DEPLOYED_ACTIVE' }
      ],
      calibrations: [
        { assetId: 'BAL-LF-HYJ-001', desc: '100 MT Hydraulic Cylinder', swl: '100 MT', certNo: 'TPI-FORM11-9982', agency: 'Bureau Veritas Industrial Services', proofLoad: '125 MT (1.25x SWL)', testDate: '15-Dec-2025', nextDue: '15-Dec-2026', status: 'VALID' },
        { assetId: 'BAL-LF-HYJ-002', desc: '150 MT Hydraulic Cylinder', swl: '150 MT', certNo: 'TPI-FORM11-9985', agency: 'Bureau Veritas Industrial Services', proofLoad: '187.5 MT', testDate: '12-Jan-2026', nextDue: '12-Jan-2027', status: 'VALID' },
        { assetId: 'BAL-HF-SLG-001', desc: '50 MT 4-Leg Wire Sling', swl: '50 MT', certNo: 'TPI-FORM11-8841', agency: 'TUV Rheinland India', proofLoad: '100 MT (2.0x SWL)', testDate: '28-Feb-2026', nextDue: '28-Feb-2027', status: 'VALID' },
        { assetId: 'BAL-SH-BOW-001', desc: '85 MT Green Pin Shackle', swl: '85 MT', certNo: 'TPI-FORM11-7712', agency: 'SGS India Testing Lab', proofLoad: '170 MT (2.0x SWL)', testDate: '10-May-2026', nextDue: '10-May-2027', status: 'VALID' },
        { assetId: 'BAL-SP-BM-001', desc: '250 MT Spreader Beam', swl: '250 MT', certNo: 'TPI-FORM11-6651', agency: 'TUV Rheinland India', proofLoad: '312.5 MT', testDate: '10-Jul-2026', nextDue: '10-Jul-2027', status: 'VALID' }
      ]
    },

    init: function() {
      console.log('📦 Initializing BALSONS Store & Rigging Tackle Manager Controller...');
      this.bindTabs();
      this.bindCategoryButtons();
      this.bindModals();
      this.bindForms();
      this.bindScan();
      this.renderCatalog();
      this.renderLedger();
      this.renderCalibration();
      this.updateKPIs();
    },

    bindTabs: function() {
      const tabBtns = document.querySelectorAll('.beds-tab-nav .beds-tab-btn');
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

    bindCategoryButtons: function() {
      const buttons = document.querySelectorAll('[data-category]');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.activeCategory = btn.getAttribute('data-category');
          buttons.forEach(b => {
            b.classList.remove('beds-btn-primary');
            b.classList.add('beds-btn-secondary');
          });
          btn.classList.remove('beds-btn-secondary');
          btn.classList.add('beds-btn-primary');
          this.renderCatalog();
        });
      });
    },

    bindModals: function() {
      const btnQuick = document.getElementById('btnQuickIssue');
      const btnOpenIssue = document.getElementById('btnOpenIssueModal');
      const btnAddTackle = document.getElementById('btnAddTackle');

      if (btnQuick) btnQuick.addEventListener('click', () => this.openModal('modalIssueTackle'));
      if (btnOpenIssue) btnOpenIssue.addEventListener('click', () => this.openModal('modalIssueTackle'));
      if (btnAddTackle) btnAddTackle.addEventListener('click', () => this.openModal('modalAddTackle'));

      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(btn.getAttribute('data-close-modal'));
        });
      });

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

    bindScan: function() {
      const scanInput = document.getElementById('issueScanInput');
      if (!scanInput) return;

      scanInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = scanInput.value.trim().toUpperCase();
          if (!query) return;

          // Check if item is already issued
          const existingIssue = this.state.ledger.find(l => l.assetId.toUpperCase() === query && l.status === 'DEPLOYED_ACTIVE');
          if (existingIssue) {
            // Quick return
            this.returnTackle(existingIssue.txId);
          } else {
            // Open issue modal prefilled
            const assetInput = document.getElementById('issueAssetIdInput');
            if (assetInput) assetInput.value = query;
            this.openModal('modalIssueTackle');
          }
          scanInput.value = '';
        }
      });
    },

    bindForms: function() {
      // Issue Tackle Form
      const formIssue = document.getElementById('formIssueTackle');
      if (formIssue) {
        formIssue.addEventListener('submit', (e) => {
          e.preventDefault();
          const assetId = document.getElementById('issueAssetIdInput').value.trim().toUpperCase();
          const item = this.state.catalog.find(c => c.id.toUpperCase() === assetId);

          if (!item) {
            alert(`Tackle Asset ID ${assetId} not found in catalog.`);
            return;
          }
          if (item.status === 'QUARANTINE') {
            alert(`⚠️ REJECTED: Tackle ${assetId} is in QUARANTINE (Tag Color RED). Cannot be issued for safety.`);
            return;
          }

          const now = new Date();
          const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          const newIssue = {
            txId: 'ISS-2026-' + Math.floor(1000 + Math.random() * 9000),
            assetId: item.id,
            desc: item.desc,
            empId: document.getElementById('issueEmpIdInput').value.trim().toUpperCase(),
            empName: document.getElementById('issueEmpNameInput').value.trim() || 'Rigging Technician',
            bay: document.getElementById('issueBayInput').value,
            issueTime: timeStr,
            expectedReturn: document.getElementById('issueReturnDateInput').value || 'Today',
            status: 'DEPLOYED_ACTIVE'
          };

          item.status = 'ISSUED';
          this.state.ledger.unshift(newIssue);
          this.renderCatalog();
          this.renderLedger();
          this.updateKPIs();
          this.closeModal('modalIssueTackle');
          formIssue.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('STORE_TACKLE_ISSUE', newIssue);
            window.BalsonsWorkspace.showToast(`✅ Tackle ${item.id} issued to ${newIssue.empId}`, 'success');
          }
        });
      }

      // Add Tackle Form
      const formAdd = document.getElementById('formAddTackle');
      if (formAdd) {
        formAdd.addEventListener('submit', (e) => {
          e.preventDefault();
          const newTackle = {
            id: document.getElementById('addAssetIdInput').value.trim().toUpperCase(),
            desc: document.getElementById('addDescInput').value.trim(),
            cat: document.getElementById('addCatInput').value,
            swl: document.getElementById('addSWLInput').value.trim(),
            serial: document.getElementById('addSerialInput').value.trim(),
            calibExpiry: document.getElementById('addCalibExpiryInput').value || '31-Dec-2026',
            tag: document.getElementById('addTagInput').value,
            status: 'AVAILABLE',
            location: 'Main Tool Crib'
          };

          this.state.catalog.unshift(newTackle);
          this.renderCatalog();
          this.updateKPIs();
          this.closeModal('modalAddTackle');
          formAdd.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('STORE_CATALOG_ADD', newTackle);
            window.BalsonsWorkspace.showToast(`✅ Added ${newTackle.id} to Rigging Tackle Catalog`, 'success');
          }
        });
      }

      // Search & status filters
      const search = document.getElementById('catalogSearchInput');
      const statusFilter = document.getElementById('catalogStatusFilter');
      if (search) search.addEventListener('input', () => this.renderCatalog());
      if (statusFilter) statusFilter.addEventListener('change', () => this.renderCatalog());
    },

    returnTackle: function(txId) {
      const issue = this.state.ledger.find(l => l.txId === txId);
      if (!issue) return;

      const item = this.state.catalog.find(c => c.id === issue.assetId);
      if (item) item.status = 'AVAILABLE';

      issue.status = 'RETURNED_INSPECTED';
      this.renderCatalog();
      this.renderLedger();
      this.updateKPIs();

      if (window.BalsonsWorkspace) {
        window.BalsonsWorkspace.enqueueMutation('STORE_TACKLE_RETURN', { txId, assetId: issue.assetId });
        window.BalsonsWorkspace.showToast(`✅ Tackle ${issue.assetId} returned & inspected. Ready in crib.`, 'success');
      }
    },

    renderCatalog: function() {
      const tbody = document.getElementById('catalogTableBody');
      if (!tbody) return;

      const query = (document.getElementById('catalogSearchInput') ? document.getElementById('catalogSearchInput').value : '').toLowerCase();
      const statusFilter = document.getElementById('catalogStatusFilter') ? document.getElementById('catalogStatusFilter').value : 'ALL';

      const filtered = this.state.catalog.filter(c => {
        if (this.state.activeCategory !== 'ALL' && c.cat !== this.state.activeCategory) return false;
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (query && !c.id.toLowerCase().includes(query) && !c.desc.toLowerCase().includes(query) && !c.serial.toLowerCase().includes(query) && !c.swl.toLowerCase().includes(query)) return false;
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--beds-text-muted); padding: 24px;">No rigging tackle found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(item => {
        let tagBg = 'rgba(16, 185, 129, 0.15)';
        let tagColor = 'var(--beds-status-cleared)';
        if (item.tag === 'AMBER') { tagBg = 'rgba(245, 158, 11, 0.15)'; tagColor = 'var(--beds-status-conditional)'; }
        if (item.tag === 'RED') { tagBg = 'rgba(230, 70, 70, 0.15)'; tagColor = 'var(--beds-alert-red)'; }

        let statusBg = 'rgba(16, 185, 129, 0.15)';
        let statusColor = 'var(--beds-status-cleared)';
        if (item.status === 'ISSUED') { statusBg = 'rgba(245, 158, 11, 0.15)'; statusColor = 'var(--beds-status-conditional)'; }
        if (item.status === 'QUARANTINE') { statusBg = 'rgba(230, 70, 70, 0.15)'; statusColor = 'var(--beds-alert-red)'; }

        return `
          <tr>
            <td><strong>${item.id}</strong></td>
            <td>${item.desc}</td>
            <td><span class="beds-badge" style="background: rgba(0, 151, 178, 0.1); color: var(--beds-teal-primary); font-weight: 700;">${item.cat}</span></td>
            <td><strong style="color: var(--beds-charcoal-heading);">${item.swl}</strong></td>
            <td><code style="font-size: 11px;">${item.serial}</code></td>
            <td><span style="font-size: 11.5px;">${item.calibExpiry}</span></td>
            <td>
              <span class="beds-badge" style="background: ${tagBg}; color: ${tagColor}; font-weight: 800;">
                ● ${item.tag}
              </span>
            </td>
            <td>
              <span class="beds-badge" style="background: ${statusBg}; color: ${statusColor}; font-weight: 800;">
                ${item.status}
              </span>
            </td>
            <td>
              ${item.status === 'AVAILABLE' ? `
                <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="StoreApp.quickOpenIssue('${item.id}')">Issue &rarr;</button>
              ` : item.status === 'ISSUED' ? `
                <span style="font-size: 11px; color: var(--beds-status-conditional); font-weight: 700;">In Bay</span>
              ` : `
                <span style="font-size: 11px; color: var(--beds-alert-red); font-weight: 700;">Quarantined</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    },

    quickOpenIssue: function(assetId) {
      const input = document.getElementById('issueAssetIdInput');
      if (input) input.value = assetId;
      this.openModal('modalIssueTackle');
    },

    renderLedger: function() {
      const tbody = document.getElementById('issueLedgerTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.ledger.map(row => `
        <tr>
          <td><strong>${row.txId}</strong></td>
          <td><strong>${row.assetId}</strong></td>
          <td>${row.desc}</td>
          <td><code>${row.empId}</code></td>
          <td>${row.empName}</td>
          <td><span style="color: var(--beds-teal-primary); font-weight: 700;">${row.bay}</span></td>
          <td><code style="font-size: 11px;">${row.issueTime}</code></td>
          <td>${row.expectedReturn}</td>
          <td>
            <span class="beds-badge" style="background: ${row.status.includes('ACTIVE') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${row.status.includes('ACTIVE') ? 'var(--beds-status-conditional)' : 'var(--beds-status-cleared)'}; font-weight: 700;">
              ${row.status}
            </span>
          </td>
          <td>
            ${row.status === 'DEPLOYED_ACTIVE' ? `
              <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="StoreApp.returnTackle('${row.txId}')">Return Check</button>
            ` : `<span style="font-size: 11px; color: var(--beds-text-muted);">Returned</span>`}
          </td>
        </tr>
      `).join('');
    },

    renderCalibration: function() {
      const tbody = document.getElementById('calibTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.calibrations.map(c => `
        <tr>
          <td><strong>${c.assetId}</strong></td>
          <td>${c.desc}</td>
          <td><strong>${c.swl}</strong></td>
          <td><code>${c.certNo}</code></td>
          <td>${c.agency}</td>
          <td><strong style="color: var(--beds-teal-primary);">${c.proofLoad}</strong></td>
          <td>${c.testDate}</td>
          <td><strong>${c.nextDue}</strong></td>
          <td><span style="color: var(--beds-teal-primary); font-weight: 700; font-size: 11.5px;">📄 Form-11.pdf</span></td>
          <td>
            <span class="beds-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--beds-status-cleared); font-weight: 800;">
              🟢 ${c.status}
            </span>
          </td>
        </tr>
      `).join('');
    },

    updateKPIs: function() {
      const kpiTotal = document.getElementById('kpiTotalTackles');
      if (kpiTotal) kpiTotal.innerText = '264 Items';

      const activeIssued = this.state.ledger.filter(l => l.status === 'DEPLOYED_ACTIVE').length;
      const kpiDeployed = document.getElementById('kpiDeployedTackles');
      if (kpiDeployed) kpiDeployed.innerText = (180 + activeIssued) + ' Items';

      const kpiAvail = document.getElementById('kpiAvailableTackles');
      if (kpiAvail) {
        const availCount = this.state.catalog.filter(c => c.status === 'AVAILABLE').length;
        kpiAvail.innerText = (75 + availCount) + ' Items';
      }

      const kpiQuar = document.getElementById('kpiQuarantineTackles');
      if (kpiQuar) {
        const quarCount = this.state.catalog.filter(c => c.status === 'QUARANTINE').length;
        kpiQuar.innerText = quarCount + ' Items';
      }
    }
  };

  window.StoreApp = StoreApp;
})(window);
