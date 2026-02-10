/**
 * LYROS FAMILY TAX ADVISOR — Form Logic
 * =======================================
 * Repo:    github.com/chris-lyros/family-tax-advisor
 * Version: 3.0.0
 * Updated: 2026-02-09
 *
 * Loaded via jsDelivr CDN in Webflow Page Settings → Footer Code.
 * HTML embed on the page provides the markup; CSS loaded in Head Code.
 *
 * WEBHOOK: POST /webhook/family-tax-advisor
 * SCHEMA:  trigger.v1.family_tax_form
 *
 * CHANGELOG v3.0.0:
 * - PROMOTED work_from_home to base payload (Section 2 radios, always sent)
 * - PROMOTED private_health to base payload (Section 3 radios, always sent)
 * - ADDED existing_benefits to base payload (Section 1 chips, conditional)
 * - Deep dive Section 5 no longer has WFH field (removed from HTML)
 * - Deep dive Section 6 shows PHI detail fields conditional on Section 3 answer
 * - Deep dive payload no longer duplicates work_from_home / private_health
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  const WEBHOOK_URL = (window.LTA_CONFIG && window.LTA_CONFIG.webhookUrl)
    ? window.LTA_CONFIG.webhookUrl
    : 'https://n8n.lyroshq.com/webhook/family-tax-advisor';

  // ============================================================
  // STATE
  // ============================================================
  let currentSection = 1;
  let isDeepDive = false;
  let isSubmitting = false;
  const totalQuickSections = 3;

  function generateSubmissionId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  // ============================================================
  // CHIP & RADIO HANDLERS
  // ============================================================
  document.querySelectorAll('.lta-chips').forEach(function(container) {
    container.querySelectorAll('.lta-chip').forEach(function(chip) {
      chip.setAttribute('role', 'checkbox');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-checked', chip.classList.contains('selected') ? 'true' : 'false');

      function toggleChipSelection() {
        chip.classList.toggle('selected');
        // "None" / "Not Sure" exclusivity
        if (chip.dataset.value === 'none' || chip.dataset.value === 'not_sure') {
          container.querySelectorAll('.lta-chip').forEach(function(c) {
            if (c !== chip) c.classList.remove('selected');
          });
        } else {
          var noneChip = container.querySelector('.lta-chip[data-value="none"]');
          if (noneChip) noneChip.classList.remove('selected');
          var notSureChip = container.querySelector('.lta-chip[data-value="not_sure"]');
          if (notSureChip) notSureChip.classList.remove('selected');
        }
        container.querySelectorAll('.lta-chip').forEach(function(c) {
          c.setAttribute('aria-checked', c.classList.contains('selected') ? 'true' : 'false');
        });
      }

      chip.addEventListener('click', toggleChipSelection);
      chip.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleChipSelection();
        }
      });
    });
  });

  document.querySelectorAll('.lta-radios').forEach(function(container) {
    container.querySelectorAll('.lta-radio').forEach(function(radio) {
      radio.setAttribute('role', 'radio');
      radio.setAttribute('tabindex', '0');
      radio.setAttribute('aria-checked', radio.classList.contains('selected') ? 'true' : 'false');

      function selectRadio() {
        container.querySelectorAll('.lta-radio').forEach(function(r) {
          r.classList.remove('selected');
          r.setAttribute('aria-checked', 'false');
        });
        radio.classList.add('selected');
        radio.setAttribute('aria-checked', 'true');
      }

      radio.addEventListener('click', selectRadio);
      radio.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRadio();
        }
      });
    });
  });

  // PHI conditional: Show deep dive Section 6 detail fields based on Section 3 PHI answer
  // (Replaces the old inline conditional that was in Section 6 HTML)
  var phiContainer = document.getElementById('fPHI');
  if (phiContainer) {
    phiContainer.querySelectorAll('.lta-radio').forEach(function(radio) {
      radio.addEventListener('click', function() {
        var hasHospitalCover = ['hospital_extras', 'hospital_only'].indexOf(radio.dataset.value) !== -1;
        // Update deep dive Section 6 detail visibility (will take effect when Section 6 shown)
        var detailWrap = document.getElementById('fPHIDetailsDeep');
        var noDetailMsg = document.getElementById('fPHINoDetailMsg');
        if (detailWrap) detailWrap.style.display = hasHospitalCover ? '' : 'none';
        if (noDetailMsg) noDetailMsg.style.display = hasHospitalCover ? 'none' : '';
      });
    });
  }

  // Dependants conditional — show ages AND existing benefits
  document.getElementById('fDependants').addEventListener('change', function() {
    var hasDependants = parseInt(this.value) > 0;
    document.getElementById('fDependantAgesWrap').classList.toggle('visible', hasDependants);
    document.getElementById('fExistingBenefitsWrap').classList.toggle('visible', hasDependants);
  });

  // Childcare conditional
  document.querySelectorAll('#fChildcareType .lta-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      setTimeout(function() {
        var selected = getChipValues('fChildcareType');
        var hasChildcare = selected.length > 0 && selected.indexOf('none') === -1;
        document.getElementById('fChildcareDaysWrap').classList.toggle('visible', hasChildcare);
      }, 50);
    });
  });

  // Enter key on contact fields triggers submit
  ['fFirstName', 'fEmail', 'fPhone'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); ltaSubmit(); }
      });
    }
  });

  // ============================================================
  // HELPERS
  // ============================================================
  function getChipValues(containerId) {
    return Array.from(document.querySelectorAll('#' + containerId + ' .lta-chip.selected'))
      .map(function(c) { return c.dataset.value; });
  }

  function getRadioValue(containerId) {
    var sel = document.querySelector('#' + containerId + ' .lta-radio.selected');
    return sel ? sel.dataset.value : '';
  }

  function showError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('show');
  }

  function clearErrors() {
    document.querySelectorAll('.lta-error-msg').forEach(function(e) { e.classList.remove('show'); });
    document.querySelectorAll('.lta-input.error, .lta-select.error').forEach(function(e) { e.classList.remove('error'); });
    var submitErr = document.getElementById('ltaSubmitError');
    if (submitErr) submitErr.classList.remove('show');
  }

  function showSection(num) {
    document.querySelectorAll('.lta-section').forEach(function(s) { s.classList.remove('visible'); });
    var target = document.querySelector('.lta-section[data-section="' + num + '"]');
    if (target) target.classList.add('visible');

    // v3.0.0: When entering Section 6 deep dive, sync PHI detail visibility
    if (num === 6) {
      var phiVal = getRadioValue('fPHI');
      var hasHospitalCover = ['hospital_extras', 'hospital_only'].indexOf(phiVal) !== -1;
      var detailWrap = document.getElementById('fPHIDetailsDeep');
      var noDetailMsg = document.getElementById('fPHINoDetailMsg');
      if (detailWrap) detailWrap.style.display = hasHospitalCover ? '' : 'none';
      if (noDetailMsg) noDetailMsg.style.display = hasHospitalCover ? 'none' : '';
    }

    updateProgress(num);
    window.scrollTo({ top: document.getElementById('ltaRoot').offsetTop - 20, behavior: 'smooth' });
  }

  function getDependantCount() {
    return parseInt(document.getElementById('fDependants').value) || 0;
  }

  function updateProgress(step) {
    var totalSteps = isDeepDive ? 8 : 3;
    var label = document.getElementById('ltaProgressLabel');
    var numericStep = typeof step === 'number' ? step : totalSteps;
    var display = step === 'contact' ? totalSteps : Math.min(numericStep, totalSteps);

    // Show "Final step" on contact section
    if (step === 'contact') {
      label.textContent = 'Final step';
    } else {
      label.textContent = display + ' / ' + totalSteps;
    }

    // Rebuild progress dots if deep dive changed step count
    var wrap = document.getElementById('ltaProgress');
    var dots = wrap.querySelectorAll('.lta-progress-step');
    if (dots.length !== totalSteps) {
      dots.forEach(function(d) { d.remove(); });
      for (var i = 1; i <= totalSteps; i++) {
        var dot = document.createElement('div');
        dot.className = 'lta-progress-step';
        dot.dataset.step = i;
        wrap.appendChild(dot);
      }
    }
    wrap.querySelectorAll('.lta-progress-step').forEach(function(dot) {
      var s = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'done');
      if (step === 'contact') {
        dot.classList.add('done');
      } else if (s < display) {
        dot.classList.add('done');
      } else if (s === display) {
        dot.classList.add('active');
      }
    });
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  function validateSection(num) {
    clearErrors();
    var valid = true;

    if (num === 1) {
      if (!document.getElementById('fState').value) { showError('errState'); document.getElementById('fState').classList.add('error'); valid = false; }
      if (!document.getElementById('fRelationship').value) { showError('errRelationship'); document.getElementById('fRelationship').classList.add('error'); valid = false; }
      if (getChipValues('fAdultAges').length === 0) { showError('errAdultAges'); valid = false; }
    }
    if (num === 2) {
      if (!getRadioValue('fIncomeRange')) { showError('errIncome'); valid = false; }
      if (!getRadioValue('fIncomeSplit')) { showError('errSplit'); valid = false; }
      if (getChipValues('fIncomeTypes').length === 0) { showError('errIncomeTypes'); valid = false; }
    }
    if (num === 3) {
      if (!getRadioValue('fHomeStatus')) { showError('errHome'); valid = false; }
    }
    if (num === 'contact') {
      var name = document.getElementById('fFirstName').value.trim();
      var email = document.getElementById('fEmail').value.trim();
      var disc = document.getElementById('fConsentDisclaimer').checked;
      if (!name) { showError('errFirstName'); document.getElementById('fFirstName').classList.add('error'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('errEmail'); document.getElementById('fEmail').classList.add('error'); valid = false; }
      if (!disc) { showError('errDisclaimer'); valid = false; }
    }
    return valid;
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function ltaNext(fromSection) {
    if (!validateSection(fromSection)) return;
    currentSection = fromSection + 1;

    if (fromSection === 3 && !isDeepDive) {
      // Show deep dive gate
      document.querySelectorAll('.lta-section').forEach(function(s) { s.classList.remove('visible'); });
      document.getElementById('ltaGate').classList.add('visible');
      return;
    }

    // Skip section 7 (Children) if no dependants
    if (fromSection === 6 && getDependantCount() === 0) {
      showSection(8);
      return;
    }

    if (fromSection === 8 || (fromSection === 3 && isDeepDive)) {
      showSection('contact');
      return;
    }
    showSection(currentSection);
  }

  function ltaBack(fromSection) {
    clearErrors();
    if (fromSection === 4) {
      // Back from first deep dive — show gate again
      document.querySelectorAll('.lta-section').forEach(function(s) { s.classList.remove('visible'); });
      document.getElementById('ltaGate').classList.add('visible');
      return;
    }
    // Skip back over section 7 if no dependants
    if (fromSection === 8 && getDependantCount() === 0) {
      showSection(6);
      return;
    }
    currentSection = fromSection - 1;
    showSection(currentSection);
  }

  function ltaBackContact() {
    clearErrors();
    if (isDeepDive) {
      showSection(8);
    } else {
      document.querySelectorAll('.lta-section').forEach(function(s) { s.classList.remove('visible'); });
      document.getElementById('ltaGate').classList.add('visible');
    }
  }

  function ltaSkipDeep() {
    isDeepDive = false;
    document.getElementById('ltaGate').classList.remove('visible');
    showSection('contact');
  }

  function ltaStartDeep() {
    isDeepDive = true;
    document.getElementById('ltaGate').classList.remove('visible');
    updateProgress(4);
    showSection(4);
  }

  // ============================================================
  // SUBMIT
  // ============================================================
  function ltaSubmit() {
    if (!validateSection('contact')) return;

    // Debounce: prevent double-submit
    if (isSubmitting) return;
    isSubmitting = true;

    var btn = document.getElementById('ltaSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="lta-spinner"></span> Generating Your Report\u2026';
    var submitErr = document.getElementById('ltaSubmitError');
    if (submitErr) submitErr.classList.remove('show');

    // Build payload matching trigger.v1.family_tax_form v3.0.0
    var payload = {
      // Section 1: Household Basics
      state: document.getElementById('fState').value,
      relationship_status: document.getElementById('fRelationship').value,
      num_dependants: document.getElementById('fDependants').value,
      dependant_ages: getChipValues('fDependantAges').join(','),
      adult_ages: getChipValues('fAdultAges').join(','),
      existing_benefits: getChipValues('fExistingBenefits').join(','),  // NEW v3.0.0

      // Section 2: Income Profile
      household_income_range: getRadioValue('fIncomeRange'),
      income_split: getRadioValue('fIncomeSplit'),
      income_types: getChipValues('fIncomeTypes').join(','),
      salary_sacrifice: getRadioValue('fSalarySac'),
      work_from_home: getRadioValue('fWFH'),  // PROMOTED v3.0.0 — always sent

      // Section 3: Property & Assets
      home_status: getRadioValue('fHomeStatus'),
      investment_property: getRadioValue('fInvestProp'),
      shares_or_funds: getRadioValue('fShares'),
      crypto: getRadioValue('fCrypto'),
      private_health: getRadioValue('fPHI'),  // PROMOTED v3.0.0 — always sent

      // Contact
      first_name: document.getElementById('fFirstName').value.trim(),
      email: document.getElementById('fEmail').value.trim(),
      phone: document.getElementById('fPhone').value.trim(),
      consent_marketing: document.getElementById('fConsentMarketing').checked ? 'true' : 'false',
      consent_disclaimer: 'true',

      // Meta
      page_url: window.location.href,
      client_submission_id: generateSubmissionId(),
      website: (document.getElementById('fWebsite') || {}).value || ''
    };

    // Deep dive fields (Sections 4-8) — only PHI detail + non-promoted fields
    if (isDeepDive) {
      // Section 4: Super
      payload.super_balance_range = document.getElementById('fSuperBalance').value;
      payload.voluntary_contributions = getRadioValue('fVoluntaryContrib');
      payload.super_fund_type = getChipValues('fSuperFundType').join(',');
      payload.spouse_super_low = getRadioValue('fSpouseSuper');

      // Section 5: Deductions (WFH removed — now in base payload)
      payload.motor_vehicle_work = document.getElementById('fVehicle').value;
      payload.deduction_flags = getChipValues('fDeductions').join(',');
      payload.donations = document.getElementById('fDonations').value;

      // Section 6: PHI details (base PHI answer already in base payload)
      var phiLevel = document.getElementById('fPHILevel');
      payload.phi_cover_level = phiLevel ? phiLevel.value : '';
      payload.phi_all_covered = getRadioValue('fPHIAll');

      // Section 7: Children
      payload.childcare_type = getChipValues('fChildcareType').join(',');
      var childcareDays = document.getElementById('fChildcareDays');
      payload.childcare_days = childcareDays ? childcareDays.value : '';
      payload.child_disability = getRadioValue('fChildDisability');

      // Section 8: Life Events
      payload.life_events = getChipValues('fLifeEvents').join(',');
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 20000);

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    .then(function(res) {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Webhook request failed');

      // Show success only after confirmed 2xx
      document.querySelectorAll('.lta-section, .lta-gate').forEach(function(s) { s.classList.remove('visible'); });
      document.getElementById('ltaProgress').style.display = 'none';
      var disclaimer = document.getElementById('ltaDisclaimer');
      if (disclaimer) disclaimer.classList.add('hidden');
      var successEl = document.getElementById('ltaSuccess');
      successEl.classList.add('visible');
      document.getElementById('ltaSuccessMsg').textContent =
        'Thanks ' + payload.first_name + '! Check ' + payload.email + ' — your personalised Family Tax Advantage Report will arrive within a few minutes.';
    })
    .catch(function() {
      clearTimeout(timeoutId);
      // Show inline error banner
      if (submitErr) submitErr.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Get My Free Tax Report';
      isSubmitting = false;
    });

  }

  // ============================================================
  // EXPOSE TO ONCLICK HANDLERS
  // ============================================================
  window.ltaNext = ltaNext;
  window.ltaBack = ltaBack;
  window.ltaBackContact = ltaBackContact;
  window.ltaSkipDeep = ltaSkipDeep;
  window.ltaStartDeep = ltaStartDeep;
  window.ltaSubmit = ltaSubmit;

  // ============================================================
  // INIT
  // ============================================================
  updateProgress(1);

  // v3.0.0: Set initial state for PHI detail fields in deep dive Section 6
  var detailWrap = document.getElementById('fPHIDetailsDeep');
  var noDetailMsg = document.getElementById('fPHINoDetailMsg');
  if (detailWrap) detailWrap.style.display = 'none';
  if (noDetailMsg) noDetailMsg.style.display = '';
})();
