"use client";

import { useState } from "react";
import { predict } from "@/lib/api";

export default function FormPage() {
  const [formData, setFormData] = useState({
    Age: "",
    Height: "",
    Weight: "",
    SMOKE: "no",
    CALC: "no",
  });

  const predictionMap: Record<string, { text: string; color: string }> = {
    Insufficient_Weight: { text: "ผอม", color: "danger" },
    Normal_Weight: { text: "ปกติ", color: "success" },
    Overweight_Level_I: { text: "ท้วม", color: "warning" },
    Overweight_Level_II: { text: "ท้วม", color: "warning" },
    Obesity_Type_I: { text: "อ้วน", color: "danger" },
    Obesity_Type_II: { text: "อ้วน", color: "danger" },
    Obesity_Type_III: { text: "อ้วน", color: "danger" },
  };


  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    Age: Number(formData.Age),
    Height: Number(formData.Height) / 100,
    Weight: Number(formData.Weight),
    SMOKE: formData.SMOKE,
    CALC: formData.CALC,
  };

  console.log("📤 Sending payload:", payload);

  try {
    const res = await predict(payload);
    setPrediction(res.prediction);

    console.log("📥 API Response:", res);

  } catch (err) {
    console.error("❌ API Error:", err);
    alert("Error connecting to API");
  }

  setLoading(false);
};


  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card card-custom p-4 w-100" style={{ maxWidth: 420 }}>
        <h3 className="text-center mb-4 fw-bold">Obesity Predictor</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Age</label>
            <input
              name="Age"
              type="number"
              className="form-control"
              placeholder="16"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Height (meters)</label>
            <input
              name="Height"
              type="number"
              step="0.01"
              className="form-control"
              placeholder="165"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Weight (kg)</label>
            <input
              name="Weight"
              type="number"
              step="0.1"
              className="form-control"
              placeholder="50"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Smoke</label>
            <select
              name="SMOKE"
              className="form-select"
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Alcohol</label>
            <select
              name="CALC"
              className="form-select"
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="sometimes">Sometimes</option>
              <option value="frequently">Frequently</option>
            </select>
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Processing..." : "Predict"}
          </button>
        </form>

        {prediction && (
          <div className="text-center mt-4">
            <div
              className={`prediction-box p-4 border-start border-5 border-${predictionMap[prediction].color}`}
            >
              <h6 className="text-muted mb-2">ผลการประเมิน</h6>

              <h2
                className={`fw-bold text-${predictionMap[prediction].color}`}
              >
                {predictionMap[prediction].text}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
