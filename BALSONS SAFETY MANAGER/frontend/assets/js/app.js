/**
 * BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
 * Safety, EHS & PTW Governance Portal Client Controller
 * Compliant with SAM-2026 4-Tier Serverless Architecture & BEDS V2.0
 */

(function(window) {
  'use strict';

  const SafetyApp = {
    state: {
      permits: [
        { id: 'PTW-LIFT-0042', type: 'PTW-LIFT', bay: 'BAY_A_SCHULER_PRESS', supervisor: 'Rajesh Sharma (EMP-2026-0001)', validFrom: '24-Nov-2026 08:00', validTo: '24-Nov-2026 20:00', gasCheck: 'N/A (Lifting Rig)', state: 'ISSUED', scope: 'Critical Tandem Lift: Schuler 1000T Press Bed (320 MT) via 600 MT Crawler Crane.' },
        { id: 'PTW-HOT-0118', type: 'PTW-HOT', bay: 'BAY_C_FABRICATION', supervisor: 'Sunil Jena (EMP-2026-0003)', validFrom: '24-Nov-2026 09:00', validTo: '24-Nov-2026 18:00', gasCheck: 'LEL: 0%, O2: 20.9% (Passed)', state: 'ISSUED', scope: 'MIG/TIG Welding on heavy crane tie-down brackets and spreader beams.' },
        { id: 'PTW-HGT-0095', type: 'PTW-HGT', bay: 'BAY_B_WHEEL_AXLE', supervisor: 'Amit Verma (EMP-2026-0002)', validFrom: '24-Nov-2026 10:00', validTo: '24-Nov-2026 19:00', gasCheck: 'Height: 14.5m (100% Tie-Off)', state: 'ISSUED', scope: 'Roof gantry rail alignment and vertical cable tray bracket fastening.' },
        { id: 'PTW-CONF-0031', type: 'PTW-CONF', bay: 'BAY_A_SCHULER_PRESS', supervisor: 'Manoj Kumar Patra', validFrom: '24-Nov-2026 13:00', validTo: '24-Nov-2026 17:00', gasCheck: 'O2: 20.8%, CO: 0 PPM, H2S: 0 PPM', state: 'VERIFIED_BY_SAFETY', scope: 'Hydraulic sump pit inspection and hydraulic manifold pipe routing.' },
        { id: 'PTW-ELEC-0064', type: 'PTW-ELEC', bay: 'CENTRAL_YARD', supervisor: 'Santosh Swain', validFrom: '24-Nov-2026 14:00', validTo: '24-Nov-2026 22:00', gasCheck: 'LOTO Applied (Padlock #44)', state: 'AUTHORISED', scope: '415V Main Substation feeder breaker maintenance and LOTO verification.' },
        { id: 'PTW-EXCAV-0022', type: 'PTW-EXCAV', bay: 'CENTRAL_YARD', supervisor: 'Dilip Behera', validFrom: '24-Nov-2026 07:00', validTo: '24-Nov-2026 15:00', gasCheck: 'Shoring & Trench Box Inspected', state: 'CLOSED', scope: 'Drainage trench excavation (Depth 2.4m) along North road perimeter.' }
      ],
      tbts: [
        { id: 'TBT-2026-0412', shift: 'Morning Shift (06:00 - 14:00)', bay: 'BAY_A_SCHULER_PRESS', topic: 'Heavy Tandem Lift Rigging & Tag-Line Radius Clearance', supervisor: 'Rajesh Sharma', attendance: 22, signed: true, status: 'VERIFIED_ACTIVE' },
        { id: 'TBT-2026-0411', shift: 'Morning Shift (06:00 - 14:00)', bay: 'BAY_C_FABRICATION', topic: 'Hot Work Spark Containment & Fire Blanket Placement', supervisor: 'Sunil Jena', attendance: 14, signed: true, status: 'VERIFIED_ACTIVE' },
        { id: 'TBT-2026-0410', shift: 'General Shift (08:00 - 17:00)', bay: 'BAY_B_WHEEL_AXLE', topic: 'Work at Height: Dual Lanyard Hooking & Self-Retracting Lifelines', supervisor: 'Amit Verma', attendance: 18, signed: true, status: 'VERIFIED_ACTIVE' },
        { id: 'TBT-2026-0409', shift: 'Evening Shift (14:00 - 22:00)', bay: 'CENTRAL_YARD', topic: 'Yard Traffic Segregation & Reversing Horn Compliance', supervisor: 'Santosh Swain', attendance: 12, signed: true, status: 'VERIFIED_ACTIVE' }
      ],
      incidents: [
        { id: 'INC-2026-0044', timestamp: '24-Nov-2026 11:30', bay: 'Bay A Pit South Edge', category: 'NEAR_MISS', severity: 'MEDIUM', desc: 'Loose scaffolding coupler slipped from 3m platform; caught by safety toe-board. No injury.', capa: 'Inspect and replace all loose wedge clamps across Bay A platform.', owner: 'Safety Officer (Prashant Muley)', targetDate: '25-Nov-2026', status: 'IN_PROGRESS' },
        { id: 'INC-2026-0043', timestamp: '23-Nov-2026 16:15', bay: 'Central Yard Fuel Point', category: 'ENVIRONMENT_SPILL', severity: 'LOW', desc: 'Minor 5L hydraulic oil seepage during hose disconnection on trailer.', capa: 'Spread sawdust and dry chemical absorbent; dispose as hazardous waste.', owner: 'Yard Supervisor (Dilip Behera)', targetDate: '24-Nov-2026', status: 'CLOSED_RESOLVED' }
      ]
    },

    init: function() {
      console.log('🛡️ Initializing BALSONS Safety, EHS & PTW Governance Controller...');
      this.bindTabs();
      this.bindModals();
      this.bindForms();
      this.bindFilters();
      this.renderPermits();
      this.renderTBTs();
      this.renderIncidents();
      this.updateKPIs();
    },

    bindTabs: function() {
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

    bindModals: function() {
      const btnNewPTW = document.getElementById('btnNewPTW');
      if (btnNewPTW) btnNewPTW.addEventListener('click', () => this.openModal('modalNewPTW'));

      const btnTBT = document.getElementById('btnOpenTBTModal');
      if (btnTBT) btnTBT.addEventListener('click', () => this.openModal('modalNewTBT'));

      const btnInc = document.getElementById('btnOpenIncidentModal');
      if (btnInc) btnInc.addEventListener('click', () => this.openModal('modalNewIncident'));

      const btnQuickNearMiss = document.getElementById('btnQuickReportNearMiss');
      if (btnQuickNearMiss) btnQuickNearMiss.addEventListener('click', () => this.openModal('modalNewIncident'));

      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = btn.getAttribute('data-close-modal');
          this.closeModal(mId);
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

    bindFilters: function() {
      const search = document.getElementById('ptwSearchInput');
      const typeFilter = document.getElementById('ptwFilterType');
      const statusFilter = document.getElementById('ptwFilterStatus');

      if (search) search.addEventListener('input', () => this.renderPermits());
      if (typeFilter) typeFilter.addEventListener('change', () => this.renderPermits());
      if (statusFilter) statusFilter.addEventListener('change', () => this.renderPermits());
    },

    bindForms: function() {
      // New PTW Form
      const formPTW = document.getElementById('formNewPTW');
      if (formPTW) {
        formPTW.addEventListener('submit', (e) => {
          e.preventDefault();
          const ptwType = document.getElementById('ptwTypeInput').value;
          const newPTW = {
            id: ptwType + '-' + Math.floor(1000 + Math.random() * 9000),
            type: ptwType,
            bay: document.getElementById('ptwBayInput').value,
            supervisor: document.getElementById('ptwSupervisorInput').value.trim(),
            validFrom: document.getElementById('ptwValidFromInput').value || '24-Nov-2026 08:00',
            validTo: document.getElementById('ptwValidToInput').value || '24-Nov-2026 20:00',
            gasCheck: document.getElementById('ptwGasTestInput').value.trim() || 'Visual Inspection Passed',
            state: 'SUBMITTED',
            scope: document.getElementById('ptwScopeInput').value.trim()
          };

          this.state.permits.unshift(newPTW);
          this.renderPermits();
          this.updateKPIs();
          this.closeModal('modalNewPTW');
          formPTW.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('PTW_CREATE', newPTW);
            window.BalsonsWorkspace.showToast(`✅ PTW Created: ${newPTW.id} (Status: SUBMITTED)`, 'success');
          }
        });
      }

      // New TBT Form
      const formTBT = document.getElementById('formNewTBT');
      if (formTBT) {
        formTBT.addEventListener('submit', (e) => {
          e.preventDefault();
          const newTBT = {
            id: 'TBT-2026-' + Math.floor(1000 + Math.random() * 9000),
            shift: document.getElementById('tbtShiftInput').value,
            bay: document.getElementById('tbtBayInput').value,
            topic: document.getElementById('tbtTopicInput').value.trim(),
            supervisor: document.getElementById('tbtSupervisorInput').value.trim(),
            attendance: parseInt(document.getElementById('tbtAttendanceInput').value, 10) || 12,
            signed: true,
            status: 'VERIFIED_ACTIVE'
          };

          this.state.tbts.unshift(newTBT);
          this.renderTBTs();
          this.updateKPIs();
          this.closeModal('modalNewTBT');
          formTBT.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('TBT_LOG', newTBT);
            window.BalsonsWorkspace.showToast(`✅ Shift TBT Briefing recorded: ${newTBT.id}`, 'success');
          }
        });
      }

      // New Incident Form
      const formIncident = document.getElementById('formNewIncident');
      if (formIncident) {
        formIncident.addEventListener('submit', (e) => {
          e.preventDefault();
          const now = new Date();
          const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          const newInc = {
            id: 'INC-2026-' + Math.floor(1000 + Math.random() * 9000),
            timestamp: timeStr,
            bay: document.getElementById('incLocationInput').value.trim(),
            category: document.getElementById('incCategoryInput').value,
            severity: document.getElementById('incSeverityInput').value,
            desc: document.getElementById('incDescInput').value.trim(),
            capa: document.getElementById('incCAPAInput').value.trim(),
            owner: 'Safety Team',
            targetDate: document.getElementById('incTargetDateInput').value || '25-Nov-2026',
            status: 'IN_PROGRESS'
          };

          this.state.incidents.unshift(newInc);
          this.renderIncidents();
          this.updateKPIs();
          this.closeModal('modalNewIncident');
          formIncident.reset();

          if (window.BalsonsWorkspace) {
            window.BalsonsWorkspace.enqueueMutation('INCIDENT_LOG', newInc);
            window.BalsonsWorkspace.showToast(`⚠️ Hazard Incident recorded: ${newInc.id}. CAPA assigned.`, 'warning');
          }
        });
      }
    },

    // State Machine Transitions
    advancePermitState: function(ptwId) {
      const ptw = this.state.permits.find(p => p.id === ptwId);
      if (!ptw) return;

      const order = ['DRAFT', 'SUBMITTED', 'VERIFIED_BY_SAFETY', 'AUTHORISED', 'ISSUED', 'CLOSED'];
      const currentIndex = order.indexOf(ptw.state);

      if (currentIndex < order.length - 1) {
        const nextState = order[currentIndex + 1];
        ptw.state = nextState;
        this.renderPermits();
        this.updateKPIs();

        if (window.BalsonsWorkspace) {
          window.BalsonsWorkspace.enqueueMutation('PTW_STATE_TRANSITION', { id: ptwId, state: nextState });
          window.BalsonsWorkspace.showToast(`✅ Permit ${ptwId} advanced to: ${nextState}`, 'success');
        }
      }
    },

    // Rendering Methods
    renderPermits: function() {
      const tbody = document.getElementById('ptwTableBody');
      if (!tbody) return;

      const query = (document.getElementById('ptwSearchInput') ? document.getElementById('ptwSearchInput').value : '').toLowerCase();
      const typeFilter = document.getElementById('ptwFilterType') ? document.getElementById('ptwFilterType').value : 'ALL';
      const statusFilter = document.getElementById('ptwFilterStatus') ? document.getElementById('ptwFilterStatus').value : 'ALL';

      const filtered = this.state.permits.filter(p => {
        if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;
        if (statusFilter !== 'ALL' && p.state !== statusFilter) return false;
        if (query && !p.id.toLowerCase().includes(query) && !p.bay.toLowerCase().includes(query) && !p.supervisor.toLowerCase().includes(query)) return false;
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--beds-text-muted); padding: 24px;">No permits found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(p => {
        let stateBadgeColor = 'var(--beds-charcoal-heading)';
        let stateBadgeBg = 'rgba(16, 45, 53, 0.08)';

        if (p.state === 'SUBMITTED') { stateBadgeBg = 'rgba(0, 151, 178, 0.1)'; stateBadgeColor = 'var(--beds-teal-primary)'; }
        if (p.state === 'VERIFIED_BY_SAFETY') { stateBadgeBg = 'rgba(245, 158, 11, 0.15)'; stateBadgeColor = 'var(--beds-status-conditional)'; }
        if (p.state === 'AUTHORISED') { stateBadgeBg = 'rgba(99, 102, 241, 0.15)'; stateBadgeColor = '#6366F1'; }
        if (p.state === 'ISSUED') { stateBadgeBg = 'rgba(16, 185, 129, 0.15)'; stateBadgeColor = 'var(--beds-status-cleared)'; }
        if (p.state === 'CLOSED') { stateBadgeBg = 'rgba(100, 116, 139, 0.1)'; stateBadgeColor = '#64748B'; }

        return `
          <tr>
            <td><strong>${p.id}</strong></td>
            <td><span class="beds-badge" style="background: rgba(0, 151, 178, 0.1); color: var(--beds-teal-primary); font-weight: 700;">${p.type}</span></td>
            <td>${p.bay}</td>
            <td>${p.supervisor}</td>
            <td><code style="font-size: 11px;">${p.validFrom} &rarr; ${p.validTo}</code></td>
            <td><span style="font-size: 11.5px; color: var(--beds-charcoal-heading);">${p.gasCheck}</span></td>
            <td>
              <span class="beds-badge" style="background: ${stateBadgeBg}; color: ${stateBadgeColor}; font-weight: 800;">
                ${p.state}
              </span>
            </td>
            <td>
              ${p.state !== 'CLOSED' ? `
                <button class="beds-btn beds-btn-sm beds-btn-primary" onclick="SafetyApp.advancePermitState('${p.id}')">
                  ${p.state === 'ISSUED' ? '🔒 Close PTW' : 'Advance &rarr;'}
                </button>
              ` : `<span style="font-size: 11px; color: var(--beds-text-muted);">Completed</span>`}
            </td>
          </tr>
        `;
      }).join('');
    },

    renderTBTs: function() {
      const tbody = document.getElementById('tbtTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.tbts.map(t => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${t.shift}</td>
          <td>${t.bay}</td>
          <td><strong>${t.topic}</strong></td>
          <td>${t.supervisor}</td>
          <td><span class="beds-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--beds-status-cleared); font-weight: 700;">${t.attendance} Personnel</span></td>
          <td><span style="color: var(--beds-status-cleared); font-weight: 700;">✅ Certified</span></td>
          <td><span class="beds-badge beds-badge-active">${t.status}</span></td>
        </tr>
      `).join('');
    },

    renderIncidents: function() {
      const tbody = document.getElementById('incidentTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.state.incidents.map(inc => {
        let sevColor = inc.severity === 'HIGH' || inc.severity === 'CRITICAL' ? 'var(--beds-alert-red)' : 'var(--beds-status-conditional)';
        return `
          <tr>
            <td><strong>${inc.id}</strong></td>
            <td><code style="font-size: 11px;">${inc.timestamp}</code></td>
            <td>${inc.bay}</td>
            <td><span class="beds-badge" style="background: rgba(245, 158, 11, 0.1); color: var(--beds-status-conditional);">${inc.category}</span></td>
            <td><strong style="color: ${sevColor};">${inc.severity}</strong></td>
            <td>
              <div>${inc.desc}</div>
            </td>
            <td>
              <strong>${inc.capa}</strong><br>
              <span style="font-size: 11px; color: var(--beds-text-muted);">Owner: ${inc.owner}</span>
            </td>
            <td><code>${inc.targetDate}</code></td>
            <td>
              <span class="beds-badge" style="background: ${inc.status.includes('CLOSED') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(230, 70, 70, 0.15)'}; color: ${inc.status.includes('CLOSED') ? 'var(--beds-status-cleared)' : 'var(--beds-alert-red)'}; font-weight: 700;">
                ${inc.status}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    },

    updateKPIs: function() {
      const activeCount = this.state.permits.filter(p => p.state === 'ISSUED').length;
      const kpiPTW = document.getElementById('kpiActivePTW');
      if (kpiPTW) kpiPTW.innerText = activeCount + ' Active';

      const kpiTBT = document.getElementById('kpiConductedTBT');
      if (kpiTBT) kpiTBT.innerText = this.state.tbts.length + ' Conducted';

      const openCAPACount = this.state.incidents.filter(i => !i.status.includes('CLOSED')).length;
      const kpiCAPA = document.getElementById('kpiOpenCAPA');
      if (kpiCAPA) kpiCAPA.innerText = openCAPACount + ' Pending';
    }
  };

  window.SafetyApp = SafetyApp;
})(window);
