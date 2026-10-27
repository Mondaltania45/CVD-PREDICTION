/**
 * WHO Cardiovascular Risk Prediction & Explainable AI (XAI) Application
 * Developer Attribution: https://mondaltania45.github.io/heatsafe/
 * Dataset Reference: https://github.com/Pradip240/Cardiovascular-Risk-Prediction
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const inputs = {
    age: { slider: document.getElementById("sliderAge"), num: document.getElementById("inpAge"), badge: document.getElementById("badgeAge") },
    sysBP: { slider: document.getElementById("sliderSysBP"), num: document.getElementById("inpSysBP"), badge: document.getElementById("badgeSysBP") },
    diaBP: { slider: document.getElementById("sliderDiaBP"), num: document.getElementById("inpDiaBP"), badge: document.getElementById("badgeDiaBP") },
    totChol: { slider: document.getElementById("sliderTotChol"), num: document.getElementById("inpTotChol"), badge: document.getElementById("badgeChol") },
    glucose: { slider: document.getElementById("sliderGlucose"), num: document.getElementById("inpGlucose"), badge: document.getElementById("badgeGlucose") },
    cigs: { slider: document.getElementById("sliderCigs"), num: document.getElementById("inpCigs"), badge: document.getElementById("badgeCigs") },
    bmi: { slider: document.getElementById("sliderBMI"), num: document.getElementById("inpBMI"), badge: document.getElementById("badgeBMI") },
    heartRate: { slider: document.getElementById("sliderHeartRate"), num: document.getElementById("inpHeartRate"), badge: document.getElementById("badgeHeartRate") }
  };

  const btnSexMale = document.getElementById("btnSexMale");
  const btnSexFemale = document.getElementById("btnSexFemale");
  const badgeSex = document.getElementById("badgeSex");
  const badgeHypertension = document.getElementById("badgeHypertensionGrade");

  const riskScoreVal = document.getElementById("riskScoreVal");
  const whoRiskBadge = document.getElementById("whoRiskBadge");
  const relativeRiskPill = document.getElementById("relativeRiskPill");
  const tierDescriptionText = document.getElementById("tierDescriptionText");
  const gaugeMeter = document.getElementById("gaugeMeter");

  // XAI Elements
  const waterfallList = document.getElementById("waterfallList");
  const globalImpList = document.getElementById("globalImpList");
  const narrativeContainer = document.getElementById("narrativeContainer");
  const whoProtocolList = document.getElementById("whoProtocolList");

  // Counterfactuals
  const cfQuitSmoking = document.getElementById("cfQuitSmoking");
  const cfControlBP = document.getElementById("cfControlBP");
  const cfLowerChol = document.getElementById("cfLowerChol");
  const cfNormalizeGlucose = document.getElementById("cfNormalizeGlucose");
  const cfProjectedRisk = document.getElementById("cfProjectedRisk");
  const cfProjectedTier = document.getElementById("cfProjectedTier");
  const cfCumulativeSavings = document.getElementById("cfCumulativeSavings");
  const cfBadgeSmoking = document.getElementById("cfBadgeSmoking");
  const cfBadgeBP = document.getElementById("cfBadgeBP");
  const cfBadgeChol = document.getElementById("cfBadgeChol");
  const cfBadgeGlucose = document.getElementById("cfBadgeGlucose");

  // BMI helper
  const toggleBmiCalc = document.getElementById("toggleBmiCalc");
  const bmiCalcBox = document.getElementById("bmiCalcBox");
  const calcHeight = document.getElementById("calcHeight");
  const calcWeight = document.getElementById("calcWeight");

  // State
  let currentSex = 1; // 1 = Male, 0 = Female

  // --- Helper Functions ---
  function getHypertensionClassification(sys, dia) {
    if (sys < 90 || dia < 60) {
      return { stage: 0, label: "Hypotension (<90/<60 mmHg)", color: "#64748b" };
    }
    if (sys < 120 && dia < 80) {
      return { stage: 1, label: "Optimal (<120/80 mmHg)", color: "#10b981" };
    }
    if (sys < 130 && dia < 85) {
      return { stage: 2, label: "Normal (120-129/<85 mmHg)", color: "#10b981" };
    }
    if (sys < 140 || dia < 90) {
      return { stage: 3, label: "Pre-Hypertension (130-139/85-89)", color: "#f59e0b" };
    }
    if (sys >= 140 && dia < 90) {
      return { stage: 4, label: "Isolated Systolic HTN (≥140/<90)", color: "#f97316" };
    }
    if (sys < 160 || dia < 100) {
      return { stage: 5, label: "Grade 1 HTN (140-159/90-99)", color: "#f97316" };
    }
    if (sys < 180 || dia < 110) {
      return { stage: 6, label: "Grade 2 HTN (160-179/100-109)", color: "#ef4444" };
    }
    return { stage: 7, label: "Grade 3 Severe HTN (≥180/≥110)", color: "#991b1b" };
  }

  function getDiabetesGrade(glucose) {
    if (glucose < 100) return { grade: 1, label: "Normal (<100 mg/dL)" };
    if (glucose < 126) return { grade: 2, label: "Prediabetic (100-125 mg/dL)" };
    if (glucose < 200) return { grade: 3, label: "Diabetic: Mild (126-199)" };
    if (glucose < 300) return { grade: 4, label: "Diabetic: Moderate (200-299)" };
    return { grade: 5, label: "Diabetic: Severe (≥300 mg/dL)" };
  }

  function getSmokingFactor(cigs) {
    return cigs < 1 ? 0 : Math.log(cigs);
  }

  // --- Calculate Risk & Feature Attributions ---
  function computeModelRisk(patient) {
    const stats = MODEL_DATA.statistics;
    const coefs = MODEL_DATA.lr_coefficients;
    const intercept = MODEL_DATA.lr_intercept;

    // Derived variables
    const htInfo = getHypertensionClassification(patient.sysBP, patient.diaBP);
    const diabInfo = getDiabetesGrade(patient.glucose);
    const smokingFactor = getSmokingFactor(patient.cigsPerDay);

    const values = {
      age: patient.age,
      sex_num: patient.sex,
      cigsPerDay: patient.cigsPerDay,
      totChol: patient.totChol,
      sysBP: patient.sysBP,
      diaBP: patient.diaBP,
      BMI: patient.BMI,
      heartRate: patient.heartRate,
      glucose: patient.glucose,
      Hypertension: htInfo.stage,
      Diabetes: diabInfo.grade,
      SmokingFactor: smokingFactor
    };

    // Calculate baseline probability (population average)
    const baseProb = MODEL_DATA.base_population_risk; // 15.17%

    // Calculate standardized Log-Odds
    let logOdds = intercept;
    const contributions = [];

    for (const [key, coef] of Object.entries(coefs)) {
      const val = values[key];
      const mean = stats[key].mean;
      const std = stats[key].std;
      const zScore = (val - mean) / std;
      const featureLogOddsDelta = coef * zScore;
      logOdds += featureLogOddsDelta;

      // Group related variables for clean clinical interpretation
      contributions.push({
        key,
        label: stats[key].label,
        value: val,
        unit: stats[key].unit,
        zScore,
        logOddsDelta: featureLogOddsDelta
      });
    }

    // Sigmoid probability
    const rawProb = 1 / (1 + Math.exp(-logOdds));

    // Convert log-odds deltas into percentage point risk contributions
    // Marginal effect around current probability: deltaP ~ p*(1-p)*deltaLO
    const marginalFactor = rawProb * (1 - rawProb);
    const formattedAttributions = contributions.map(item => {
      const deltaPercent = item.logOddsDelta * marginalFactor * 100;
      return {
        ...item,
        deltaPercent: deltaPercent,
        isPositive: deltaPercent >= 0
      };
    });

    return {
      probability: rawProb,
      riskPercent: (rawProb * 100),
      logOdds,
      attributions: formattedAttributions,
      htInfo,
      diabInfo
    };
  }

  // --- Get Patient from Inputs ---
  function getPatientFromInputs() {
    return {
      age: parseFloat(inputs.age.num.value) || 50,
      sex: currentSex,
      sysBP: parseFloat(inputs.sysBP.num.value) || 130,
      diaBP: parseFloat(inputs.diaBP.num.value) || 85,
      totChol: parseFloat(inputs.totChol.num.value) || 220,
      glucose: parseFloat(inputs.glucose.num.value) || 90,
      cigsPerDay: parseFloat(inputs.cigs.num.value) || 0,
      BMI: parseFloat(inputs.bmi.num.value) || 25,
      heartRate: parseFloat(inputs.heartRate.num.value) || 72
    };
  }

  // --- Determine WHO Risk Tier ---
  function getWhoTier(riskPercent) {
    if (riskPercent < 10) return MODEL_DATA.who_risk_tiers[0];
    if (riskPercent < 20) return MODEL_DATA.who_risk_tiers[1];
    if (riskPercent < 30) return MODEL_DATA.who_risk_tiers[2];
    if (riskPercent < 40) return MODEL_DATA.who_risk_tiers[3];
    return MODEL_DATA.who_risk_tiers[4];
  }

  // --- Render UI Dashboard ---
  function renderDashboard() {
    const patient = getPatientFromInputs();
    const result = computeModelRisk(patient);
    const tier = getWhoTier(result.riskPercent);

    // 1. Update Hero Card
    riskScoreVal.textContent = `${result.riskPercent.toFixed(1)}%`;
    whoRiskBadge.textContent = tier.label;
    whoRiskBadge.className = `who-risk-badge ${tier.badge_class}`;

    const relativeRisk = result.probability / MODEL_DATA.base_population_risk;
    relativeRiskPill.textContent = `${relativeRisk.toFixed(2)}x Population Average`;
    tierDescriptionText.textContent = tier.description;

    // 2. Update Gauge Arc
    // Full arc circumference for r=80, 180 degrees is PI*80 = 251.2
    const maxDisplayedPercent = 60; // 60% fills gauge
    const fraction = Math.min(Math.max(result.riskPercent / maxDisplayedPercent, 0), 1);
    const dashoffset = 251.2 * (1 - fraction);
    gaugeMeter.style.strokeDashoffset = dashoffset.toFixed(1);
    gaugeMeter.style.stroke = tier.color;

    // 3. Update Dynamic Input Badges
    inputs.age.badge.textContent = `${patient.age} yrs`;
    inputs.sysBP.badge.textContent = `${patient.sysBP} mmHg`;
    inputs.diaBP.badge.textContent = `${patient.diaBP} mmHg`;
    inputs.totChol.badge.textContent = `${patient.totChol} mg/dL`;
    inputs.cigs.badge.textContent = `${patient.cigsPerDay} cigs/day`;
    inputs.bmi.badge.textContent = `${patient.BMI.toFixed(1)} kg/m²`;
    inputs.heartRate.badge.textContent = `${patient.heartRate} bpm`;

    badgeHypertension.textContent = result.htInfo.label;
    badgeHypertension.style.background = result.htInfo.color + "22";
    badgeHypertension.style.color = result.htInfo.color;

    const diab = result.diabInfo;
    inputs.glucose.badge.textContent = `${patient.glucose} mg/dL (${diab.label})`;

    // 4. Render Patient SHAP Waterfall
    renderWaterfall(result.attributions, result.riskPercent);

    // 5. Update What-If Simulator with current patient
    updateWhatIfSimulator(patient, result.riskPercent);

    // 6. Update Clinical Narrative
    renderNarrative(patient, result, tier);

    // 7. Update WHO Clinical Protocol
    renderWhoProtocol(tier);
  }

  // --- Render SHAP Waterfall ---
  function renderWaterfall(attributions, currentRisk) {
    waterfallList.innerHTML = "";

    // Consolidate closely related variables for clarity
    const consolidated = [
      {
        name: "Age Factor",
        delta: attributions.find(a => a.key === "age").deltaPercent,
        detail: `${inputs.age.num.value} years`
      },
      {
        name: "Systolic & Diastolic BP",
        delta: (attributions.find(a => a.key === "sysBP")?.deltaPercent || 0) +
               (attributions.find(a => a.key === "diaBP")?.deltaPercent || 0) +
               (attributions.find(a => a.key === "Hypertension")?.deltaPercent || 0),
        detail: `${inputs.sysBP.num.value}/${inputs.diaBP.num.value} mmHg`
      },
      {
        name: "Smoking & Nicotine",
        delta: (attributions.find(a => a.key === "cigsPerDay")?.deltaPercent || 0) +
               (attributions.find(a => a.key === "SmokingFactor")?.deltaPercent || 0),
        detail: `${inputs.cigs.num.value} cigs/day`
      },
      {
        name: "Fasting Glucose & Diabetes",
        delta: (attributions.find(a => a.key === "glucose")?.deltaPercent || 0) +
               (attributions.find(a => a.key === "Diabetes")?.deltaPercent || 0),
        detail: `${inputs.glucose.num.value} mg/dL`
      },
      {
        name: "Total Cholesterol",
        delta: attributions.find(a => a.key === "totChol").deltaPercent,
        detail: `${inputs.totChol.num.value} mg/dL`
      },
      {
        name: "Body Mass Index (BMI)",
        delta: attributions.find(a => a.key === "BMI").deltaPercent,
        detail: `${parseFloat(inputs.bmi.num.value).toFixed(1)} kg/m²`
      },
      {
        name: "Biological Sex",
        delta: attributions.find(a => a.key === "sex_num").deltaPercent,
        detail: currentSex === 1 ? "Male" : "Female"
      },
      {
        name: "Resting Heart Rate",
        delta: attributions.find(a => a.key === "heartRate").deltaPercent,
        detail: `${inputs.heartRate.num.value} bpm`
      }
    ];

    // Sort by absolute impact
    consolidated.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    // Find max magnitude for scaling bar width
    const maxDelta = Math.max(...consolidated.map(c => Math.abs(c.delta)), 3);

    consolidated.forEach(item => {
      const row = document.createElement("div");
      row.className = "waterfall-row";

      const isPos = item.delta >= 0;
      const barWidth = Math.min((Math.abs(item.delta) / maxDelta) * 100, 100);

      const sign = isPos ? "+" : "";
      const deltaStr = `${sign}${item.delta.toFixed(1)}%`;
      const fillClass = isPos ? "positive" : "negative";

      row.innerHTML = `
        <div class="waterfall-name" title="${item.name} (${item.detail})">
          ${item.name}
          <div style="font-size:0.7rem; color:var(--who-muted);">${item.detail}</div>
        </div>
        <div class="waterfall-bar-track">
          <div class="waterfall-bar-fill ${fillClass}" style="width: ${barWidth}%;"></div>
        </div>
        <div class="waterfall-delta ${fillClass}">${deltaStr}</div>
      `;
      waterfallList.appendChild(row);
    });
  }

  // --- Render Global Importances ---
  function renderGlobalImportances() {
    globalImpList.innerHTML = "";
    const list = MODEL_DATA.global_importances.slice(0, 8);
    const maxImp = list[0].importance;

    list.forEach(item => {
      const row = document.createElement("div");
      row.className = "waterfall-row";
      const width = (item.importance / maxImp) * 100;

      row.innerHTML = `
        <div class="waterfall-name">
          ${item.label}
          <div style="font-size:0.7rem; color:var(--who-muted);">${item.category}</div>
        </div>
        <div class="waterfall-bar-track">
          <div class="waterfall-bar-fill" style="width: ${width}%; background: linear-gradient(90deg, #0284c7, #0093d5);"></div>
        </div>
        <div class="waterfall-delta" style="color:var(--who-blue-dark);">${(item.importance * 100).toFixed(1)}%</div>
      `;
      globalImpList.appendChild(row);
    });
  }

  // --- Counterfactual What-If Simulator ---
  function updateWhatIfSimulator(currentPatient, baselineRisk) {
    // 1. Calculate isolated potential benefits for badges
    // Quit smoking
    if (currentPatient.cigsPerDay > 0) {
      const pSmoke = { ...currentPatient, cigsPerDay: 0 };
      const rSmoke = computeModelRisk(pSmoke).riskPercent;
      const savSmoke = baselineRisk - rSmoke;
      cfBadgeSmoking.textContent = `-${Math.max(savSmoke, 0.1).toFixed(1)}%`;
      cfBadgeSmoking.style.display = "inline-block";
    } else {
      cfBadgeSmoking.textContent = "Non-smoker (0%)";
      cfBadgeSmoking.style.display = "inline-block";
    }

    // Control BP to 118/78
    if (currentPatient.sysBP > 120 || currentPatient.diaBP > 80) {
      const pBP = { ...currentPatient, sysBP: 118, diaBP: 78 };
      const rBP = computeModelRisk(pBP).riskPercent;
      const savBP = baselineRisk - rBP;
      cfBadgeBP.textContent = `-${Math.max(savBP, 0.1).toFixed(1)}%`;
      cfBadgeBP.style.display = "inline-block";
    } else {
      cfBadgeBP.textContent = "Optimal BP";
      cfBadgeBP.style.display = "inline-block";
    }

    // Lower Cholesterol to 175
    if (currentPatient.totChol > 180) {
      const pChol = { ...currentPatient, totChol: 175 };
      const rChol = computeModelRisk(pChol).riskPercent;
      const savChol = baselineRisk - rChol;
      cfBadgeChol.textContent = `-${Math.max(savChol, 0.1).toFixed(1)}%`;
      cfBadgeChol.style.display = "inline-block";
    } else {
      cfBadgeChol.textContent = "Optimal (<180)";
      cfBadgeChol.style.display = "inline-block";
    }

    // Normalize Glucose to 92
    if (currentPatient.glucose > 100) {
      const pGluc = { ...currentPatient, glucose: 92 };
      const rGluc = computeModelRisk(pGluc).riskPercent;
      const savGluc = baselineRisk - rGluc;
      cfBadgeGlucose.textContent = `-${Math.max(savGluc, 0.1).toFixed(1)}%`;
      cfBadgeGlucose.style.display = "inline-block";
    } else {
      cfBadgeGlucose.textContent = "Euglycemic (<100)";
      cfBadgeGlucose.style.display = "inline-block";
    }

    // 2. Evaluate simulated patient with all checked interventions
    let simPatient = { ...currentPatient };
    if (cfQuitSmoking.checked) {
      simPatient.cigsPerDay = 0;
    }
    if (cfControlBP.checked) {
      simPatient.sysBP = Math.min(simPatient.sysBP, 118);
      simPatient.diaBP = Math.min(simPatient.diaBP, 78);
    }
    if (cfLowerChol.checked) {
      simPatient.totChol = Math.min(simPatient.totChol, 175);
    }
    if (cfNormalizeGlucose.checked) {
      simPatient.glucose = Math.min(simPatient.glucose, 92);
    }

    const simResult = computeModelRisk(simPatient);
    const simTier = getWhoTier(simResult.riskPercent);
    const savings = baselineRisk - simResult.riskPercent;

    cfProjectedRisk.textContent = `${simResult.riskPercent.toFixed(1)}%`;
    cfProjectedTier.textContent = simTier.label;
    cfProjectedTier.className = `who-risk-badge ${simTier.badge_class}`;

    if (savings > 0) {
      cfCumulativeSavings.textContent = `-${savings.toFixed(1)}%`;
      cfCumulativeSavings.style.color = "#34d399";
    } else {
      cfCumulativeSavings.textContent = "0.0%";
      cfCumulativeSavings.style.color = "#bae6fd";
    }
  }

  // --- Render Clinical Narrative ---
  function renderNarrative(patient, result, tier) {
    const sortedAttr = [...result.attributions].sort((a, b) => b.deltaPercent - a.deltaPercent);
    const topRiskDriver = sortedAttr[0];
    const topProtective = sortedAttr[sortedAttr.length - 1];

    let narrative = `
      <p style="margin-bottom:0.75rem;">
        <strong>Diagnostic Summary:</strong> Patient is a <strong>${patient.age}-year-old ${patient.sex === 1 ? "male" : "female"}</strong> with a predicted 10-year fatal/non-fatal cardiovascular disease risk of <strong>${result.riskPercent.toFixed(1)}%</strong>, stratifying into the <strong>WHO ${tier.label}</strong> classification category.
      </p>
      <p style="margin-bottom:0.75rem;">
        <strong>Primary Risk Acceleration Factor:</strong> The highest risk-increasing contributor for this patient is <strong>${topRiskDriver.label}</strong> (+${topRiskDriver.deltaPercent.toFixed(1)}% marginal risk contribution).
    `;

    if (topProtective.deltaPercent < -0.5) {
      narrative += `
        Conversely, <strong>${topProtective.label}</strong> is serving as a favorable protective factor (${topProtective.deltaPercent.toFixed(1)}% reduction vs population baseline).
      `;
    }

    narrative += `
      </p>
      <p>
        <strong>Recommended Clinical Priority:</strong> According to WHO HEARTS protocols, this patient should be targeted for <em>${
          result.riskPercent >= 20 ? "immediate lipid-lowering statin therapy alongside blood pressure control" : "structured lifestyle intervention with active monitoring"
        }</em>. See clinical pathway below for specific guidelines.
      </p>
    `;

    narrativeContainer.innerHTML = narrative;
  }

  // --- Render WHO Protocol HEARTS Package ---
  function renderWhoProtocol(tier) {
    whoProtocolList.innerHTML = "";

    const icons = ["🥗", "💊", "🚭", "🩺", "📅"];

    tier.recommendations.forEach((rec, idx) => {
      const item = document.createElement("div");
      item.className = "protocol-item";
      item.innerHTML = `
        <div class="protocol-icon">${icons[idx % icons.length]}</div>
        <div class="protocol-text">
          <h4>WHO Action Step ${idx + 1}</h4>
          <p>${rec}</p>
        </div>
      `;
      whoProtocolList.appendChild(item);
    });
  }

  // --- Bind Event Listeners ---
  function bindInputSync(key) {
    const pair = inputs[key];
    if (!pair) return;

    pair.slider.addEventListener("input", () => {
      pair.num.value = pair.slider.value;
      renderDashboard();
    });

    pair.num.addEventListener("input", () => {
      pair.slider.value = pair.num.value;
      renderDashboard();
    });
  }

  Object.keys(inputs).forEach(bindInputSync);

  // Sex Buttons
  btnSexMale.addEventListener("click", () => {
    currentSex = 1;
    btnSexMale.classList.add("active");
    btnSexMale.setAttribute("aria-checked", "true");
    btnSexFemale.classList.remove("active");
    btnSexFemale.setAttribute("aria-checked", "false");
    badgeSex.textContent = "Male (Higher Risk)";
    renderDashboard();
  });

  btnSexFemale.addEventListener("click", () => {
    currentSex = 0;
    btnSexFemale.classList.add("active");
    btnSexFemale.setAttribute("aria-checked", "true");
    btnSexMale.classList.remove("active");
    btnSexMale.setAttribute("aria-checked", "false");
    badgeSex.textContent = "Female";
    renderDashboard();
  });

  // Presets
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.getAttribute("data-preset");
      const preset = MODEL_DATA.preset_profiles[pKey];
      if (!preset) return;

      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Load preset values
      inputs.age.slider.value = inputs.age.num.value = preset.age;
      inputs.sysBP.slider.value = inputs.sysBP.num.value = preset.sysBP;
      inputs.diaBP.slider.value = inputs.diaBP.num.value = preset.diaBP;
      inputs.totChol.slider.value = inputs.totChol.num.value = preset.totChol;
      inputs.glucose.slider.value = inputs.glucose.num.value = preset.glucose;
      inputs.cigs.slider.value = inputs.cigs.num.value = preset.cigsPerDay;
      inputs.bmi.slider.value = inputs.bmi.num.value = preset.BMI;
      inputs.heartRate.slider.value = inputs.heartRate.num.value = preset.heartRate;

      if (preset.sex === "M") {
        btnSexMale.click();
      } else {
        btnSexFemale.click();
      }

      renderDashboard();
    });
  });

  // What-If Toggles
  [cfQuitSmoking, cfControlBP, cfLowerChol, cfNormalizeGlucose].forEach(cb => {
    cb.addEventListener("change", () => {
      const patient = getPatientFromInputs();
      const result = computeModelRisk(patient);
      updateWhatIfSimulator(patient, result.riskPercent);
    });
  });

  // Tabs for Explainable AI
  document.querySelectorAll(".xai-tab-btn").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      const targetId = tabBtn.getAttribute("data-tab");

      document.querySelectorAll(".xai-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".xai-tab-pane").forEach(p => p.classList.remove("active"));

      tabBtn.classList.add("active");
      tabBtn.setAttribute("aria-selected", "true");
      document.getElementById(targetId)?.classList.add("active");
    });
  });

  // BMI Helper Calculator
  toggleBmiCalc.addEventListener("click", () => {
    bmiCalcBox.classList.toggle("visible");
  });

  function updateCalculatedBMI() {
    const hM = (parseFloat(calcHeight.value) || 170) / 100;
    const wKg = parseFloat(calcWeight.value) || 70;
    if (hM > 0) {
      const computed = (wKg / (hM * hM)).toFixed(1);
      inputs.bmi.slider.value = inputs.bmi.num.value = computed;
      renderDashboard();
    }
  }

  calcHeight.addEventListener("input", updateCalculatedBMI);
  calcWeight.addEventListener("input", updateCalculatedBMI);

  // Modals
  const modalAbout = document.getElementById("modalAbout");
  const modalDev = document.getElementById("modalDev");

  document.getElementById("btnOpenAbout").addEventListener("click", () => modalAbout.classList.add("active"));
  document.getElementById("btnCloseAbout").addEventListener("click", () => modalAbout.classList.remove("active"));

  document.getElementById("btnOpenDev").addEventListener("click", () => modalDev.classList.add("active"));
  document.getElementById("btnCloseDev").addEventListener("click", () => modalDev.classList.remove("active"));

  [modalAbout, modalDev].forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });

  // Print Report Button
  document.getElementById("btnPrintReport").addEventListener("click", () => {
    window.print();
  });

  // Reset Button
  document.getElementById("btnResetInputs").addEventListener("click", () => {
    const firstPreset = document.querySelector(".preset-btn[data-preset='healthy_young']");
    firstPreset?.click();
  });

  // Initial Run
  renderGlobalImportances();
  renderDashboard();
});
