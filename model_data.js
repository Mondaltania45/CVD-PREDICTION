// Cardiovascular Disease (CVD) Prediction Model Data & Parameters
// Lead Developer: Ms. Taniya Mondal, B.Tech (https://mondaltania45.github.io/heatsafe/)
// Version: 1.0
// Reference Repository: Framingham Heart framingham-heart-study-dataset
// Baseline Reference: https://github.com/Pradip240/Cardiovascular-Risk-Prediction

const MODEL_DATA = {
  version: "1.0",
  developer: "Ms. Taniya Mondal, B.Tech",
  developer_url: "https://mondaltania45.github.io/heatsafe/",
  reference_repository: "Framingham Heart framingham-heart-study-dataset",
  reference_url: "https://github.com/Pradip240/Cardiovascular-Risk-Prediction",
  target: "10-Year Coronary Heart Disease (TenYearCHD)",
  cohort_size: 2927,
  base_population_risk: 0.1517, // 15.17% population baseline incidence
  
  // Model performance metrics on balanced & standardized test splits
  metrics: {
    xgboost_rf_accuracy: "94.2%",
    logistic_roc_auc: "0.724",
    sensitivity_recall: "89.1%",
    specificity: "98.5%",
    f1_score: "0.932"
  },

  // Feature statistical moments for Z-score normalization
  statistics: {
    age: { mean: 49.56, std: 8.56, min: 32, max: 70, unit: "years", label: "Age" },
    sex_num: { mean: 0.443, std: 0.497, min: 0, max: 1, unit: "", label: "Biological Sex" },
    cigsPerDay: { mean: 9.00, std: 11.90, min: 0, max: 70, unit: "cigs/day", label: "Cigarettes/Day" },
    totChol: { mean: 236.72, std: 44.58, min: 107, max: 696, unit: "mg/dL", label: "Total Cholesterol" },
    sysBP: { mean: 132.35, std: 22.06, min: 83.5, max: 295, unit: "mmHg", label: "Systolic Blood Pressure" },
    diaBP: { mean: 82.92, std: 11.95, min: 48, max: 142.5, unit: "mmHg", label: "Diastolic Blood Pressure" },
    BMI: { mean: 25.80, std: 4.08, min: 15.54, max: 56.8, unit: "kg/m²", label: "Body Mass Index" },
    heartRate: { mean: 75.88, std: 12.08, min: 44, max: 143, unit: "bpm", label: "Resting Heart Rate" },
    glucose: { mean: 81.96, std: 23.95, min: 40, max: 394, unit: "mg/dL", label: "Fasting Blood Glucose" },
    Hypertension: { mean: 2.94, std: 1.63, min: 0, max: 7, unit: "stage (0-7)", label: "Hypertension Stage" },
    Diabetes: { mean: 1.09, std: 0.43, min: 1, max: 5, unit: "grade (1-5)", label: "Diabetes Severity" },
    SmokingFactor: { mean: 1.25, std: 1.48, min: 0, max: 4.25, unit: "log-scale", label: "Smoking Intensity" }
  },

  // Standardized Logistic Regression Coefficients (for exact Log-Odds and SHAP attribution)
  lr_intercept: -1.9983,
  lr_coefficients: {
    age: 0.5597,
    sex_num: 0.2388,
    sysBP: 0.4097,
    diaBP: -0.1305,
    cigsPerDay: 0.0989,
    SmokingFactor: 0.2011,
    totChol: 0.1437,
    glucose: 0.1755,
    Diabetes: 0.0397,
    Hypertension: 0.0638,
    BMI: 0.0414,
    heartRate: -0.0527
  },

  // Tree Ensemble Global Feature Importances (Random Forest & Gradient Boosting)
  global_importances: [
    { key: "age", label: "Age", importance: 0.1985, rank: 1, category: "Demographic" },
    { key: "sysBP", label: "Systolic Blood Pressure", importance: 0.1445, rank: 2, category: "Cardiovascular" },
    { key: "glucose", label: "Fasting Glucose / Diabetes", importance: 0.1201, rank: 3, category: "Metabolic" },
    { key: "diaBP", label: "Diastolic Blood Pressure", importance: 0.1184, rank: 4, category: "Cardiovascular" },
    { key: "totChol", label: "Total Cholesterol", importance: 0.0912, rank: 5, category: "Lipids" },
    { key: "BMI", label: "Body Mass Index (BMI)", importance: 0.0952, rank: 6, category: "Anthropometric" },
    { key: "SmokingFactor", label: "Smoking Intensity", importance: 0.0740, rank: 7, category: "Behavioral" },
    { key: "heartRate", label: "Resting Heart Rate", importance: 0.0629, rank: 8, category: "Physiological" },
    { key: "Hypertension", label: "Hypertension Classification", importance: 0.0404, rank: 9, category: "Cardiovascular" },
    { key: "sex_num", label: "Biological Sex", importance: 0.0266, rank: 10, category: "Demographic" },
    { key: "Diabetes", label: "Diabetes Grade", importance: 0.0282, rank: 11, category: "Metabolic" }
  ],

  // WHO CVD Risk Stratification Categories & Protocol Guidelines
  who_risk_tiers: [
    {
      range: "< 10%",
      label: "Low Risk",
      badge_class: "risk-low",
      color: "#10b981",
      textColor: "#ffffff",
      description: "Estimated 10-year risk of fatal or non-fatal cardiovascular event is under 10%.",
      recommendations: [
        "Reinforce healthy lifestyle habits: balanced Mediterranean or DASH diet low in sodium (<2g/day).",
        "Maintain regular moderate physical activity (at least 150 minutes per week).",
        "If non-smoker, avoid passive smoke exposure; if smoking, seek cessation support.",
        "Re-evaluate CVD risk every 12 months at routine clinical checkups."
      ]
    },
    {
      range: "10% to < 20%",
      label: "Moderate Risk",
      badge_class: "risk-moderate",
      color: "#f59e0b",
      textColor: "#ffffff",
      description: "Estimated 10-year risk of cardiovascular event is between 10% and 19%.",
      recommendations: [
        "Structured dietary consultation to reduce saturated fats and eliminate trans fatty acids.",
        "Target blood pressure below 130/80 mmHg; monitor ambulatory BP periodically.",
        "If smoking, initiate formal cessation program with behavioral and/or pharmacotherapy.",
        "Consider low-to-moderate intensity statin therapy if LDL remains elevated despite lifestyle changes.",
        "Re-evaluate CVD risk every 6 months."
      ]
    },
    {
      range: "20% to < 30%",
      label: "High Risk",
      badge_class: "risk-high",
      color: "#f97316",
      textColor: "#ffffff",
      description: "Estimated 10-year risk of cardiovascular event is between 20% and 29%.",
      recommendations: [
        "Initiate or intensify antihypertensive pharmacotherapy with target BP < 130/80 mmHg.",
        "Initiate moderate-to-high intensity statin therapy (atorvastatin 20-40mg or equivalent).",
        "Urgent smoking cessation intervention if currently smoking.",
        "Screen for end-organ damage (eGFR, urine albumin-to-creatinine ratio, resting ECG).",
        "Clinical follow-up every 3 months until risk factors reach clinical targets."
      ]
    },
    {
      range: "30% to < 40%",
      label: "Very High Risk",
      badge_class: "risk-very-high",
      color: "#ef4444",
      textColor: "#ffffff",
      description: "Estimated 10-year risk of cardiovascular event is between 30% and 39%.",
      recommendations: [
        "Intensive medical therapy: combination antihypertensive drugs (e.g. ACEi/ARB + CCB or thiazide).",
        "High-intensity statin therapy (atorvastatin 40-80mg or rosuvastatin 20-40mg) targeting LDL-C < 70 mg/dL.",
        "If diabetic, strict glycemic control with cardiovascularly protective agents (SGLT2i or GLP-1 RA).",
        "Cardiology evaluation for subclinical coronary atherosclerosis assessment.",
        "Clinical follow-up every 1 to 2 months."
      ]
    },
    {
      range: "≥ 40%",
      label: "Critical Risk",
      badge_class: "risk-critical",
      color: "#991b1b",
      textColor: "#ffffff",
      description: "Estimated 10-year risk of cardiovascular event is 40% or higher (immediate clinical danger).",
      recommendations: [
        "Immediate comprehensive cardiovascular management and urgent specialist referral.",
        "Aggressive dual/triple drug regimen for blood pressure and lipid optimization.",
        "Consider low-dose aspirin therapy if high vascular risk and low bleeding hazard.",
        "Strict lifestyle intervention, cardiac rehabilitation guidance, and continuous clinical oversight.",
        "Monthly clinical monitoring until stabilization."
      ]
    }
  ],

  // Clinical preset profiles for quick testing
  preset_profiles: {
    healthy_young: {
      name: "Healthy Adult (Low Risk)",
      age: 38,
      sex: "F",
      sysBP: 115,
      diaBP: 75,
      totChol: 175,
      glucose: 82,
      cigsPerDay: 0,
      BMI: 22.4,
      heartRate: 68
    },
    middle_aged_smoker: {
      name: "Middle-Aged Smoker (Moderate Risk)",
      age: 48,
      sex: "M",
      sysBP: 135,
      diaBP: 85,
      totChol: 228,
      glucose: 94,
      cigsPerDay: 15,
      BMI: 26.5,
      heartRate: 76
    },
    hypertensive_diabetic: {
      name: "Hypertensive Diabetic (High Risk)",
      age: 58,
      sex: "M",
      sysBP: 158,
      diaBP: 94,
      totChol: 255,
      glucose: 145,
      cigsPerDay: 10,
      BMI: 29.8,
      heartRate: 82
    },
    elderly_critical: {
      name: "Elderly Multimorbid (Critical Risk)",
      age: 67,
      sex: "M",
      sysBP: 175,
      diaBP: 102,
      totChol: 285,
      glucose: 195,
      cigsPerDay: 20,
      BMI: 32.1,
      heartRate: 88
    }
  }
};

// Export for node or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MODEL_DATA;
}
