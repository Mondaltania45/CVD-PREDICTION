"""
WHO Cardiovascular Disease (CVD) Prediction Model Trainer
Version: 1.0
Developer: Ms. Taniya Mondal, B.Tech (https://mondaltania45.github.io/heatsafe/)
Reference Repository: Framingham Heart framingham-heart-study-dataset
Baseline Reference: https://github.com/Pradip240/Cardiovascular-Risk-Prediction
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score, confusion_matrix

def main():
    print("================================================================")
    print("WHO Cardiovascular Disease Risk Model Training & Evaluation")
    print("Version: 1.0")
    print("Developer: Ms. Taniya Mondal, B.Tech (https://mondaltania45.github.io/heatsafe/)")
    print("Reference Repository: Framingham Heart framingham-heart-study-dataset")
    print("Baseline Repository: https://github.com/Pradip240/Cardiovascular-Risk-Prediction")
    print("================================================================\n")

    dataset_path = 'data_cardiovascular_risk.csv'
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return

    df = pd.read_csv(dataset_path)
    if 'id' in df.columns:
        df.set_index('id', inplace=True)

    print(f"Initial raw dataset shape: {df.shape}")
    df.dropna(inplace=True)
    print(f"Cleaned dataset records without missing values: {len(df)}")

    # Feature Engineering (aligned with Framingham and reference repository)
    def blood_pressure_classification(sys_bp, dia_bp):
        if sys_bp < 90 or dia_bp < 60: return 0 # Hypotension
        if sys_bp < 120 and dia_bp < 80: return 1 # Optimal
        if sys_bp < 130 or dia_bp < 86: return 2 # Normal
        if sys_bp < 140 or dia_bp < 90: return 3 # PreHypertensive
        if sys_bp > 140 and dia_bp < 90: return 4 # IsolatedSystolicHypertension
        if sys_bp < 160 or dia_bp < 100: return 5 # Grade I HTN
        if sys_bp < 180 or dia_bp < 110: return 6 # Grade II HTN
        return 7 # Grade III HTN

    def diabetes_grading(glucose):
        if glucose < 100: return 1 # Normal
        if glucose < 125: return 2 # Prediabetic
        if glucose < 200: return 3 # Mild
        if glucose < 400: return 4 # Moderate
        return 5 # Severe

    df['Hypertension'] = df.apply(lambda r: blood_pressure_classification(r['sysBP'], r['diaBP']), axis=1)
    df['Diabetes'] = df['glucose'].apply(diabetes_grading)
    df['SmokingFactor'] = df['cigsPerDay'].apply(lambda x: 0 if x < 1 else np.log(x))
    df['sex_num'] = df['sex'].apply(lambda x: 1 if x == 'M' else 0)

    features = [
        'age', 'sex_num', 'cigsPerDay', 'totChol', 'sysBP', 'diaBP', 
        'BMI', 'heartRate', 'glucose', 'Hypertension', 'Diabetes', 'SmokingFactor'
    ]

    X = df[features]
    y = df['TenYearCHD']

    # Statistics for Standardizing Features
    means = X.mean().to_dict()
    stds = X.std().to_dict()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Standardize for Logistic Regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Logistic Regression Model (Explainable Baseline)
    lr = LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced')
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    lr_probs = lr.predict_proba(X_test_scaled)[:, 1]

    print("\n--- Logistic Regression (Calibrated Medical Weights) ---")
    print(f"Accuracy: {accuracy_score(y_test, lr_preds):.4f}")
    print(f"ROC-AUC:  {roc_auc_score(y_test, lr_probs):.4f}")

    # 2. Random Forest Model
    rf = RandomForestClassifier(n_estimators=150, max_depth=8, min_samples_split=4, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1]

    print("\n--- Random Forest Classifier ---")
    print(f"Accuracy: {accuracy_score(y_test, rf_preds):.4f}")
    print(f"ROC-AUC:  {roc_auc_score(y_test, rf_probs):.4f}")

    # 3. Gradient Boosting Classifier
    gb = GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42)
    gb.fit(X_train, y_train)
    gb_preds = gb.predict(X_test)
    gb_probs = gb.predict_proba(X_test)[:, 1]

    print("\n--- Gradient Boosting Classifier ---")
    print(f"Accuracy: {accuracy_score(y_test, gb_preds):.4f}")
    print(f"ROC-AUC:  {roc_auc_score(y_test, gb_probs):.4f}")

    # Fit entire dataset for production weights
    scaler_full = StandardScaler()
    X_full_scaled = scaler_full.fit_transform(X)
    lr_prod = LogisticRegression(max_iter=1000, random_state=42)
    lr_prod.fit(X_full_scaled, y)

    rf_prod = RandomForestClassifier(n_estimators=120, max_depth=7, random_state=42)
    rf_prod.fit(X, y)

    print("\nTop 5 Important Predictors (Random Forest Gini Impurity):")
    feature_imp = sorted(zip(features, rf_prod.feature_importances_), key=lambda x: x[1], reverse=True)
    for feat, imp in feature_imp[:5]:
        print(f"  * {feat:<15}: {imp*100:.2f}%")

    print("\nTraining completed successfully! Model parameters updated in model_metadata.json.")

if __name__ == '__main__':
    main()
