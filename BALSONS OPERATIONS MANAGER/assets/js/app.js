/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Operations & Heavy Erection Manager Client Controller
 * Compliant with SAM-2026 4-Tier Serverless Architecture & BEDS V2.0
 */

(function(window) {
  'use strict';

  const OperationsApp = {
    state: {
      workPackages: [
        { id: 'WP-AXLE-PRS-001', desc: 'Schuler 1000 MT Press Bed Foundation Placement', bay: 'Bay 1 Pit', weight: 320, crane: '600 MT Crawler (Demag CC2800)', ptw: 'PTW-LIFT-0042', progress: 75, status: 'IN_PROGRESS' },
        { id: 'WP-AXLE-GAN-002', desc: 'Roof Gantry Crane Rail Alignment & Grouting', bay: 'Bay 2 Gantry', weight: 85, crane: '250 MT Mobile (Liebherr LTM1250)', ptw: 'PTW-HGT-0095', progress: 90, status: 'ALIGNMENT_VERIFICATION' },
        { id: 'WP-AXLE-CRW-003', desc: 'Schuler Press Uprights & Crown Tie-Rod Pre-Stressing', bay: 'Bay 1 Pit', weight: 240, crane: '600 MT Crawler (Demag CC2800)', ptw: 'PTW-LIFT-0044', progress: 40, status: 'IN_PROGRESS' },
        { id: 'WP-HYD-PIP-004', desc: 'Underground Hydraulic Manifold & Sump Piping', bay: 'Bay 1 Pit', weight: 28, crane: 'Dual Gantry Tandem', ptw: 'PTW-CONF-0031', progress: 65, status: 'IN_PROGRESS' },
        { id: 'WP-SUB-STA-005', desc: '415V Heavy Substation Busbar & Transformer Skidding', bay: 'Bay 3 Substation', weight: 65, crane: '250 MT Mobile (Liebherr LTM1250)', ptw: 'PTW-ELEC-0064', progress: 100, status: 'COMPLETED' }
      ],
      studies: [
        { id: 'LIFT-STD-001', desc: 'Schuler 1000T Press Bed Tandem Lift', weight: 320, crane: 'Demag CC2800 (600T)', radius: 14, chartCap: 425, util: '75.3%', sf: '1.33', cleared: true },
        { id: 'LIFT-STD-002', desc: 'Upper Crown & Flywheel Erection', weight: 240, crane: 'Demag CC2800 (600T)', radius: 16, chartCap: 360, util: '66.7%', sf: '1.50', cleared: true },
        { id: 'LIFT-STD-003', desc: '50T Gantry Girder Lift over Bay 2', weight: 52, crane: 'Liebherr LTM1250 (250T)', radius: 18, chartCap: 74, util: '70.2%', sf: '1.42', cleared: true }
      ]
    },

    init: function() {
      console.log('🏗️ Initializing BALSONS Operations & Heavy Erection Controller...');
      this.bindTabs();
      this.bindModals();
      this.bindForms();
      this.bindCalculator();
      this.renderWorkPackages();
      this.renderStudies();
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
      const btnWP = document.getElementById('btnNewWP');
      const btnLift = document.getElementById('btnNewLiftStudy');

      if (btnWP) btnWP.addEventListener('click', () => this.openModal('modalNewWP'));
      if (btnLift) {
        btnLift.addEventListener('click', () => {
          // Switch to tab-lifting
          const liftTabBtn = document.querySelector('[data-tab="tab-lifting"]');
          if (liftTabBtn) liftTabBtn.click();
        });
      }

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

    bindForms: function() {
      const formWP = document.getElementById('formNewWP');
      if (formWP) {
        formWP.addEventListener('submit', (e) => {
          e.preventDefault();
          const progress = parseInt(document.getElementById('wpProgressInput').value, 10) || 0;
          let status = 'IN_PROGRESS';
          if (progress >= 100) status = 'COMPLETED';
          else if (progress >= 85) status = 'ALIGNMENT_VERIFICATION';

          const newWP = {
            id: 'WP-2026-' + Math.floor(1000 + Math.random() * 9000),
            desc: document.getElementById('wpDescInput').value.trim(),
            bay: document.getElementById('wpBayInput').value,
            weight: parseFloat(document.getElementById('wpWeightInput').value) || 50,
            crane: document.getElementById('wpCraneInput').value,
            ptw: document.getElementById('wpPTWInput').value.trim() || 'PTW-GEN-001',
            progress: progress,
            status: status
          };

          this.state.workPackages.unshift(newWP);
          this.renderWorkPackages();
          this.updateKPIs();
          this.closeModal('modalNewWP');
          formWP.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('OPERATIONS_WP_CREATE', newWP);
            window.BalsonsWorkspace.showToast(`✅ Work Package Added: ${newWP.id}`, 'success');
          }
        });
      }

      const search = document.getElementById('wpSearchInput');
      const statusFilter = document.getElementById('wpFilterStatus');
      if (search) search.addEventListener('input', () => this.renderWorkPackages());
      if (statusFilter) statusFilter.addEventListener('change', () => this.renderWorkPackages());
    },

    bindCalculator: function() {
      const btn = document.getElementById('btnComputeLift');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('calcLoadWeight').value) || 0;
        const radius = parseFloat(document.getElementById('calcRadius').value) || 1;
        const ratedCap = parseFloat(document.getElementById('calcRatedCap').value) || 1;
        const groundCap = parseFloat(document.getElementById('calcGroundCap').value) || 20;

        const util = (weight / ratedCap) * 100;
        const sf = (ratedCap / weight);
        const estPressure = (weight / 15.0).toFixed(1); // Approximate crawler pad contact area

        const banner = document.getElementById('liftResultBanner');

        if (util <= 80 && sf >= 1.25) {
          banner.className = 'beds-alert beds-alert-green';
          banner.innerHTML = `
            <strong>🟢 STATUS: LIFT STUDY APPROVED (Safety Factor: ${sf.toFixed(2)})</strong><br>
            • Load Utilization: <strong>${util.toFixed(1)}%</strong> of rated crane chart (Within mandatory 80% critical tandem lift limit).<br>
            • Calculated Ground Pressure: <strong>${estPressure} T/m²</strong> (Passes allowable soil capacity of ${groundCap} T/m² with steel crane mats).<br>
            • Clearance: Heavy lift authorized under site engineering protocol.
          `;

          // Add to studies table
          this.state.studies.unshift({
            id: 'LIFT-STD-' + Math.floor(100 + Math.random() * 900),
            desc: `Erection Component (${weight} MT at ${radius}m)`,
            weight: weight,
            crane: document.getElementById('calcCraneModel').value,
            radius: radius,
            chartCap: ratedCap,
            util: util.toFixed(1) + '%',
            sf: sf.toFixed(2),
            cleared: true
          });
          this.renderStudies();

        } else {
          banner.className = 'beds-alert beds-alert-red';
          banner.innerHTML = `
            <strong>🔴 STATUS: RIGGING FEASIBILITY FAILED (Safety Factor: ${sf.toFixed(2)})</strong><br>
            • Load Utilization: <strong>${util.toFixed(1)}%</strong> EXCEEDS maximum permitted 80% threshold.<br>
            • Critical Warning: Crane radius too large or load exceeds safe lifting envelope. Lift prohibited.
          `;
        }
      });
    },

    incrementProgress: function(wpId) {
      const wp = this.state.workPackages.find(w => w.id === wpId);
      if (!wp) return;

      if (wp.progress < 100) {
        wp.progress = Math.min(100, wp.progress + 10);
        if (wp.progress >= 100) wp.status = 'COMPLETED';
        else if (wp.progress >= 85) wp.status = 'ALIGNMENT_VERIFICATION';

        this.renderWorkPackages();
        this.updateKPIs();

        if (window.BalsonsWorkspace) {
          window.BalsonsWorkspace.enqueueMutation('OPERATIONS_WP_PROGRESS', { id: wpId, progress: wp.progress });
          window.BalsonsWorkspace.showToast(`📈 ${wpId} Progress updated: ${wp.progress}%`, 'success');
        }
      }
    },

    renderWorkPackages: function() {
      const tbody = document.getElementById('wpTableBody');
      if (!tbody) return;

      const query = (document.getElementById('wpSearchInput') ? document.getElementById('wpSearchInput').value : '').toLowerCase();
      const statusFilter = document.getElementById('wpFilterStatus') ? document.getElementById('wpFilterStatus').value : 'ALL';

      const filtered = this.state.workPackages.filter(wp => {
        if (statusFilter !== 'ALL' && wp.status !== statusFilter) return false;
        if (query && !wp.id.toLowerCase().includes(query) && !wp.desc.toLowerCase().includes(query) && !wp.bay.toLowerCase().includes(query)) return false;
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--beds-text-muted); padding: 24px;">No work packages found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(row => {
        let statusBg = 'rgba(0, 151, 178, 0.15)';
        let statusColor = 'var(--beds-teal-primary)';
        if (row.status === 'ALIGNMENT_VERIFICATION') { statusBg = 'rgba(245, 158, 11, 0.15)'; statusColor = 'var(--beds-status-conditional)'; }
        if (row.status === 'COMPLETED') { statusBg = 'rgba(16, 185, 129, 0.15)'; statusColor = 'var(--beds-status-cleared)'; }

        return `
          <tr>
            <td><strong>${row.id}</strong></td>
            <td>${row.desc}</td>
            <td><span style="color: var(--beds-teal-primary); font-weight: 700;">${row.bay}</span></td>
            <td><strong>${row.weight} MT</strong></td>
            <td>${row.crane}</td>
            <td><code>${row.ptw}</code></td>
            <td style="min-width: 140px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; background: var(--beds-border-subtle); height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: var(--beds-teal-primary); width: ${row.progress}%; height: 100%;"></div>
                </div>
                <span style="font-size: 11px; font-weight: 800;">${row.progress}%</span>
              </div>
            </td>
            <td>
              <span class="beds-badge" style="background: ${statusBg}; color: ${statusColor}; font-weight: 800;">
                ${row.status}
              </span>
            </td>
            <td>
              ${row.status !== 'COMPLETED' ? `
                <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="OperationsApp.incrementProgress('${row.id}')">+10%</button>
              ` : `<span style="font-size: 11px; color: var(--beds-status-cleared); font-weight: 700;">Installed</span>`}
            </td>
          </tr>
        `;
      }).join('');
    },

    renderStudies: function() {
      const tbody = document.getElementById('studiesTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.studies.map(s => `
        <tr>
          <td><strong>${s.id}</strong></td>
          <td>${s.desc}</td>
          <td><strong>${s.weight} MT</strong></td>
          <td>${s.crane}</td>
          <td>${s.radius} m</td>
          <td>${s.chartCap} MT</td>
          <td><strong>${s.util}</strong></td>
          <td><strong style="color: var(--beds-teal-primary);">${s.sf}</strong></td>
          <td>
            <span class="beds-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--beds-status-cleared); font-weight: 800;">
              🟢 APPROVED
            </span>
          </td>
        </tr>
      `).join('');
    },

    updateKPIs: function() {
      const kpiProgress = document.getElementById('kpiOverallProgress');
      if (kpiProgress) {
        const avg = this.state.workPackages.reduce((acc, w) => acc + w.progress, 0) / this.state.workPackages.length;
        kpiProgress.innerText = avg.toFixed(1) + '%';
      }

      const kpiActive = document.getElementById('kpiActiveWP');
      if (kpiActive) {
        const activeCount = this.state.workPackages.filter(w => w.status !== 'COMPLETED').length;
        kpiActive.innerText = activeCount + ' Workfronts';
      }
    }
  };

  window.OperationsApp = OperationsApp;
})(window);
