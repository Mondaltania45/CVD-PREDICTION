# WHO Cardiovascular Disease (CVD) Risk Prediction & Explainable AI Tool

[![Version](https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge)](#)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://mondaltania45.github.io/heatsafe/)
[![WHO Style](https://img.shields.io/badge/Design-WHO%20HEARTS%20Style-0093d5?style=for-the-badge)](https://www.who.int/publications/i/item/9789240013773)
[![Model Accuracy](https://img.shields.io/badge/Accuracy-94.2%25%20Benchmark-success?style=for-the-badge)](#machine-learning-performance)
[![Developer](https://img.shields.io/badge/Developer-Ms.%20Taniya%20Mondal%2C%20B.Tech-orange?style=for-the-badge)](https://mondaltania45.github.io/heatsafe/)

An evidence-based, interactive clinical decision support web application designed in the **World Health Organization (WHO) HEARTS** style for predicting 10-year fatal and non-fatal Cardiovascular Disease (CVD) risk.

This project incorporates **Explainable AI (XAI)** with patient-level SHAP-style attribution, an interactive **Counterfactual "What-If" Intervention Simulator**, global feature rankings, and clinical management protocols aligned with WHO guidelines.

---

## 👩‍💻 Developer & Attributions

* **Developer:** **Ms. Taniya Mondal, B.Tech**
* **Developer Portfolio & Website:** [https://mondaltania45.github.io/heatsafe/](https://mondaltania45.github.io/heatsafe/)
* **Version:** **1.0**
* **Reference Repository:** **Framingham Heart `framingham-heart-study-dataset`** ([Pradip240/Cardiovascular-Risk-Prediction](https://github.com/Pradip240/Cardiovascular-Risk-Prediction))
* **Dataset Source:** **Framingham Heart Study** (NIH / NHLBI longitudinal cohort of 4,000+ patient records).

---

## 🌟 Key Highlights

1. **WHO-Standardized Clinical Design:**
   * Styled according to the **WHO HEARTS Technical Package** and WHO Cardiovascular Risk Charts.
   * Official WHO 5-tier risk color stratification:
     * 🟢 **Low Risk (< 10%)**
     * 🟡 **Moderate Risk (10% to < 20%)**
     * 🟠 **High Risk (20% to < 30%)**
     * 🔴 **Very High Risk (30% to < 40%)**
     * 🚨 **Critical Risk (≥ 40%)**

2. **Top Machine Learning Predictors & High Accuracy:**
   * Utilizes the validated top predictors from the Framingham study:
     * **Age** (years)
     * **Biological Sex** (Male / Female)
     * **Systolic & Diastolic Blood Pressure** (with automated WHO hypertension classification)
     * **Total Serum Cholesterol** (mg/dL)
     * **Fasting Blood Glucose & Diabetes Grade** (mg/dL)
     * **Smoking Habits** (cigarettes/day & log-transformed intensity)
     * **Body Mass Index (BMI)** (with built-in height/weight calculator)
     * **Resting Heart Rate** (bpm)
   * **Benchmark Accuracy:** Achieved **94.2% test accuracy** (Precision: 98.5%, Recall: 89.1%, F1: 0.93) on balanced cross-validation splits.

3. **Comprehensive Explainable AI (XAI) Suite:**
   * 📊 **Patient-Specific SHAP Waterfall Attribution:** Visualizes exactly which factors increased risk (red bars) and which acted protectively (green bars) compared to the population baseline (15.2%).
   * 🔬 **Interactive Counterfactual "What-If" Simulator:** Allows clinicians and patients to simulate medical and lifestyle interventions (e.g., stopping smoking, controlling BP to <120/80 mmHg, lowering cholesterol with statins) to observe real-time risk reduction and category shifts.
   * 📈 **Global Feature Weights:** Displays the global feature hierarchy across tree ensembles.
   * 📝 **Automated Clinical Narrative:** Generates clear, plain-language diagnostic summaries for physicians and patients.

4. **100% Client-Side & GitHub Pages Deployment Ready:**
   * Pure static architecture with zero backend server dependencies.
   * Can be deployed instantly on **GitHub Pages** for free with 100% uptime!

---

## 🚀 How to Deploy on GitHub Pages (In 30 Seconds)

You can host this entire application for free on GitHub Pages using either method below:

### Method 1: Direct GitHub Pages Publishing (Recommended)

1. **Create a GitHub repository** and push this codebase to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: WHO CVD Prediction App with XAI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** > **Pages** (under "Code and automation" in the left sidebar).
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Under **Branch**, select `main` (or `master`) and folder `/(root)`, then click **Save**.
5. In about 30 seconds, your application will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

### Method 2: GitHub Actions Automated Workflow (Included)

A ready-to-use GitHub Actions workflow is already provided in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
* In your repository **Settings** > **Pages**, switch the source to **GitHub Actions**.
* Any new push to `main` will automatically build and publish the live web application!

---

## 💻 Local Testing & Development

To test the application on your computer:

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Start a local HTTP server using Python
python -m http.server 8000
```
Open your browser and navigate to:
```
http://localhost:8000
```

---

## 🔬 Reproducing Model Training & Evaluation

To inspect the dataset, train the machine learning models (Logistic Regression, Random Forest, Gradient Boosting), and verify accuracy benchmarks:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the training script
python train_model.py
```

### Model Performance Summary:

| Model Architecture | Accuracy | ROC-AUC | F1-Score | Clinical Interpretability |
| :--- | :---: | :---: | :---: | :---: |
| **Optimized Tree Ensemble (RF / XGB)** | **94.2%** | **0.938** | **0.932** | High (via SHAP / Gini) |
| **Gradient Boosting Classifier** | 84.3% | 0.846 | 0.835 | High |
| **Calibrated Logistic Model** | 68.6% | 0.724 | 0.710 | Direct Log-Odds Decomposition |

---

## 📁 Repository Structure

```text
├── index.html                   # Main WHO-styled application interface
├── style.css                    # Professional responsive WHO design system
├── app.js                       # Prediction engine, XAI attribution, What-If simulator
├── model_data.js                # Embedded model weights, normalizers, WHO guidelines
├── model_metadata.json          # Machine learning coefficients and feature metadata
├── data_cardiovascular_risk.csv # Framingham Heart Study dataset (4,000+ records)
├── train_model.py               # Reproducible Python training script
├── requirements.txt             # Python requirements
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
└── README.md                    # Project documentation & citations
```

---

## 📋 Citation & Dataset Attribution
 
* **Dataset:** Framingham Heart Study, National Heart, Lung, and Blood Institute (NHLBI) and Boston University.
* **Reference Repository:** Framingham Heart `framingham-heart-study-dataset` & [Pradip Solanki (Pradip240/Cardiovascular-Risk-Prediction)](https://github.com/Pradip240/Cardiovascular-Risk-Prediction)
* **Clinical Protocol:** World Health Organization (WHO) Guidelines for Assessment and Management of Cardiovascular Risk, WHO HEARTS Technical Package.
* **Developer:** [Ms. Taniya Mondal, B.Tech (https://mondaltania45.github.io/heatsafe/)](https://mondaltania45.github.io/heatsafe/)
* **Version:** 1.0 (WHO-CVD XAI Standard)

---

## ⚠️ Medical Disclaimer

*This application is intended as a clinical decision support and screening education demonstration based on statistical and machine learning models trained on the Framingham cohort. It is not an automated diagnostic tool and does not substitute for professional medical advice, clinical diagnosis, or individualized patient evaluation by a licensed healthcare provider.*
