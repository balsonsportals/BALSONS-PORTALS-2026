/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Commercial Purchase & Vendor Manager Client Controller
 * Compliant with SAM-2026 4-Tier Serverless Architecture & BEDS V2.0
 */

(function(window) {
  'use strict';

  const PurchaseApp = {
    state: {
      prs: [
        { id: 'PR-2026-0041', date: '24-Nov-2026', requestor: 'Prashant Muley', dept: 'MECHANICAL_ERECTION', desc: 'Foundation Anchor Bolts (M42 x 1200mm Grade 8.8)', qty: '48 Nos', estValue: 480000, justification: 'Base bed anchors for Schuler 1000T Press', status: 'APPROVED_BY_DIRECTOR' },
        { id: 'PR-2026-0040', date: '22-Nov-2026', requestor: 'Sunil Jena', dept: 'RIGGING_STORE', desc: 'High-Viscosity Hydraulic Oil ISO VG 68', qty: '2,000 Litres (10 Barrels)', estValue: 320000, justification: 'Hydraulic jacking power packs and crawler maintenance', status: 'PO_GENERATED' },
        { id: 'PR-2026-0039', date: '20-Nov-2026', requestor: 'Rajesh Sharma', dept: 'RIGGING_STORE', desc: '50 MT 4-Leg Grommet Slings (32mm Wire Rope)', qty: '4 Sets', estValue: 650000, justification: 'Replacement for quarantined worn slings', status: 'PO_GENERATED' },
        { id: 'PR-2026-0038', date: '18-Nov-2026', requestor: 'Amit Verma', dept: 'SAFETY_EHS', desc: '3M DBI-SALA Full Body Fall Arrest Harnesses', qty: '30 Nos', estValue: 145000, justification: 'Routine replacement for working at heights team', status: 'COMMERCIAL_REVIEW' }
      ],
      pos: [
        { poId: 'PO-2026-0089', prId: 'PR-2026-0036', vendor: 'Tata Steel Ltd, Kalinganagar', basic: 1850000, gst: 333000, total: 2183000, deliveryDate: '25-Nov-2026', terms: '30 Days Post Site Inward & Store QC', gateStatus: 'PARTIALLY_RECEIVED' },
        { poId: 'PO-2026-0072', prId: 'PR-2026-0039', vendor: 'Usha Martin Wire Ropes Ltd', basic: 650000, gst: 117000, total: 767000, deliveryDate: '28-Nov-2026', terms: '100% against Delivery Challan & Inspection', gateStatus: 'PENDING_GATE_RECEIPT' },
        { poId: 'PO-2026-0071', prId: 'PR-2026-0040', vendor: 'Indian Oil Corporation Ltd', basic: 320000, gst: 57600, total: 377600, deliveryDate: '30-Nov-2026', terms: '20% Advance, 80% on Delivery', gateStatus: 'PENDING_GATE_RECEIPT' }
      ]
    },

    init: function() {
      console.log('📑 Initializing BALSONS Purchase & Vendor Manager Controller...');
      this.bindTabs();
      this.bindModals();
      this.bindForms();
      this.bindCalculators();
      this.renderPRTable();
      this.renderPOTable();
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

    bindModals: function() {
      const btnPR = document.getElementById('btnNewPR');
      const btnPO = document.getElementById('btnNewPO');

      if (btnPR) btnPR.addEventListener('click', () => this.openModal('modalNewPR'));
      if (btnPO) btnPO.addEventListener('click', () => this.openModal('modalNewPO'));

      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => this.closeModal(btn.getAttribute('data-close-modal')));
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

    bindCalculators: function() {
      const basicInput = document.getElementById('poBasicValueInput');
      const calcBasic = document.getElementById('calcBasic');
      const calcGST = document.getElementById('calcGST');
      const calcTotal = document.getElementById('calcTotal');

      if (basicInput) {
        basicInput.addEventListener('input', () => {
          const basic = parseFloat(basicInput.value) || 0;
          const gst = basic * 0.18;
          const total = basic + gst;

          if (calcBasic) calcBasic.innerText = '₹' + basic.toLocaleString('en-IN');
          if (calcGST) calcGST.innerText = '₹' + gst.toLocaleString('en-IN');
          if (calcTotal) calcTotal.innerText = '₹' + total.toLocaleString('en-IN');
        });
      }
    },

    bindForms: function() {
      // New PR Form
      const formPR = document.getElementById('formNewPR');
      if (formPR) {
        formPR.addEventListener('submit', (e) => {
          e.preventDefault();
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          const newPR = {
            id: 'PR-2026-' + Math.floor(1000 + Math.random() * 9000),
            date: dateStr,
            requestor: document.getElementById('prRequestorInput').value.trim(),
            dept: document.getElementById('prDeptInput').value,
            desc: document.getElementById('prItemDescInput').value.trim(),
            qty: document.getElementById('prQtyInput').value.trim(),
            estValue: parseFloat(document.getElementById('prEstValueInput').value) || 100000,
            justification: document.getElementById('prJustificationInput').value.trim(),
            status: 'COMMERCIAL_REVIEW'
          };

          this.state.prs.unshift(newPR);
          this.renderPRTable();
          this.updateKPIs();
          this.closeModal('modalNewPR');
          formPR.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('PURCHASE_PR_CREATE', newPR);
            window.BalsonsWorkspace.showToast(`✅ PR Created: ${newPR.id} (Under Commercial Review)`, 'success');
          }
        });
      }

      // New PO Form
      const formPO = document.getElementById('formNewPO');
      if (formPO) {
        formPO.addEventListener('submit', (e) => {
          e.preventDefault();
          const basic = parseFloat(document.getElementById('poBasicValueInput').value) || 0;
          const gst = basic * 0.18;
          const total = basic + gst;
          const prId = document.getElementById('poLinkedPRInput').value;

          const newPO = {
            poId: 'PO-2026-' + Math.floor(1000 + Math.random() * 9000),
            prId: prId,
            vendor: document.getElementById('poVendorInput').value,
            basic: basic,
            gst: gst,
            total: total,
            deliveryDate: document.getElementById('poDeliveryDateInput').value || '15-Dec-2026',
            terms: document.getElementById('poTermsInput').value,
            gateStatus: 'PENDING_GATE_RECEIPT'
          };

          // Update linked PR status
          const pr = this.state.prs.find(p => p.id === prId);
          if (pr) pr.status = 'PO_GENERATED';

          this.state.pos.unshift(newPO);
          this.renderPRTable();
          this.renderPOTable();
          this.updateKPIs();
          this.closeModal('modalNewPO');
          formPO.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('PURCHASE_PO_CREATE', newPO);
            window.BalsonsWorkspace.showToast(`✅ Commercial PO ${newPO.poId} Generated (Synced to Gate Inward)`, 'success');
          }
        });
      }

      // Search & Status filters
      const search = document.getElementById('prSearchInput');
      const filter = document.getElementById('prFilterStatus');
      if (search) search.addEventListener('input', () => this.renderPRTable());
      if (filter) filter.addEventListener('change', () => this.renderPRTable());
    },

    advancePRState: function(prId) {
      const pr = this.state.prs.find(p => p.id === prId);
      if (!pr) return;

      if (pr.status === 'COMMERCIAL_REVIEW') {
        pr.status = 'APPROVED_BY_DIRECTOR';
        if (window.BalsonsWorkspace) window.BalsonsWorkspace.showToast(`✅ PR ${prId} approved by Commercial Director`, 'success');
      } else if (pr.status === 'APPROVED_BY_DIRECTOR') {
        // Open PO modal prefilled
        const poPRSelect = document.getElementById('poLinkedPRInput');
        if (poPRSelect) {
          poPRSelect.innerHTML += `<option value="${pr.id}" selected>${pr.id}: ${pr.desc.substring(0, 30)}... (₹${pr.estValue.toLocaleString('en-IN')})</option>`;
        }
        const basicInput = document.getElementById('poBasicValueInput');
        if (basicInput) {
          basicInput.value = pr.estValue;
          basicInput.dispatchEvent(new Event('input'));
        }
        this.openModal('modalNewPO');
        return;
      }
      this.renderPRTable();
      this.updateKPIs();
    },

    renderPRTable: function() {
      const tbody = document.getElementById('prTableBody');
      if (!tbody) return;

      const query = (document.getElementById('prSearchInput') ? document.getElementById('prSearchInput').value : '').toLowerCase();
      const statusFilter = document.getElementById('prFilterStatus') ? document.getElementById('prFilterStatus').value : 'ALL';

      const filtered = this.state.prs.filter(p => {
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
        if (query && !p.id.toLowerCase().includes(query) && !p.requestor.toLowerCase().includes(query) && !p.desc.toLowerCase().includes(query)) return false;
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--beds-text-muted); padding: 24px;">No requisitions found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(row => {
        let badgeBg = 'rgba(245, 158, 11, 0.15)';
        let badgeColor = 'var(--beds-status-conditional)';
        if (row.status === 'APPROVED_BY_DIRECTOR') { badgeBg = 'rgba(99, 102, 241, 0.15)'; badgeColor = '#6366F1'; }
        if (row.status === 'PO_GENERATED') { badgeBg = 'rgba(16, 185, 129, 0.15)'; badgeColor = 'var(--beds-status-cleared)'; }

        return `
          <tr>
            <td><strong>${row.id}</strong></td>
            <td><code style="font-size: 11px;">${row.date}</code></td>
            <td>${row.requestor}</td>
            <td><span class="beds-badge" style="background: rgba(16, 45, 53, 0.08); font-size: 10.5px;">${row.dept}</span></td>
            <td>${row.desc}</td>
            <td><strong>${row.qty}</strong></td>
            <td><strong style="color: var(--beds-charcoal-heading);">₹${row.estValue.toLocaleString('en-IN')}</strong></td>
            <td>
              <span class="beds-badge" style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 700;">
                ${row.status}
              </span>
            </td>
            <td>
              ${row.status === 'COMMERCIAL_REVIEW' ? `
                <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="PurchaseApp.advancePRState('${row.id}')">Approve &rarr;</button>
              ` : row.status === 'APPROVED_BY_DIRECTOR' ? `
                <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="PurchaseApp.advancePRState('${row.id}')">Create PO</button>
              ` : `<span style="font-size: 11px; color: var(--beds-status-cleared); font-weight: 700;">PO Issued</span>`}
            </td>
          </tr>
        `;
      }).join('');
    },

    renderPOTable: function() {
      const tbody = document.getElementById('poTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.pos.map(row => `
        <tr>
          <td><strong>${row.poId}</strong></td>
          <td><code>${row.prId}</code></td>
          <td><strong>${row.vendor}</strong></td>
          <td>₹${row.basic.toLocaleString('en-IN')}</td>
          <td>₹${row.gst.toLocaleString('en-IN')}</td>
          <td><strong style="color: var(--beds-teal-primary); font-size: 13.5px;">₹${row.total.toLocaleString('en-IN')}</strong></td>
          <td>${row.deliveryDate}</td>
          <td><span style="font-size: 11.5px; color: var(--beds-text-muted);">${row.terms}</span></td>
          <td>
            <span class="beds-badge" style="background: ${row.gateStatus.includes('PARTIAL') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 151, 178, 0.15)'}; color: ${row.gateStatus.includes('PARTIAL') ? 'var(--beds-status-conditional)' : 'var(--beds-teal-primary)'}; font-weight: 700;">
              ${row.gateStatus}
            </span>
          </td>
          <td>
            <button class="beds-btn beds-btn-sm beds-btn-secondary" onclick="alert('Viewing Commercial PO ${row.poId} details.')">Print PO</button>
          </td>
        </tr>
      `).join('');
    },

    updateKPIs: function() {
      const kpiCommitted = document.getElementById('kpiCommittedValue');
      if (kpiCommitted) {
        const total = this.state.pos.reduce((acc, p) => acc + p.total, 0);
        kpiCommitted.innerText = '₹' + (total / 10000000).toFixed(2) + ' Cr';
      }

      const kpiOpen = document.getElementById('kpiOpenPOs');
      if (kpiOpen) kpiOpen.innerText = this.state.pos.length + ' Active POs';

      const kpiPending = document.getElementById('kpiPendingPRs');
      if (kpiPending) {
        const pendingCount = this.state.prs.filter(p => p.status !== 'PO_GENERATED').length;
        kpiPending.innerText = pendingCount + ' PRs';
      }
    }
  };

  window.PurchaseApp = PurchaseApp;
})(window);
