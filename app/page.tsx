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

  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const predictionMap: Record<string, { text: string; color: string; desc: string }> = {
    Insufficient_Weight: { text: "น้ำหนักน้อยกว่าเกณฑ์", color: "info", desc: "ควรรับประทานอาหารที่มีสารอาหารครบถ้วนมากขึ้น" },
    Normal_Weight: { text: "น้ำหนักปกติ", color: "success", desc: "สุขภาพดีเยี่ยม! รักษาระดับนี้ไว้ให้นานๆ นะ" },
    Overweight_Level_I: { text: "น้ำหนักเกิน (ระดับ 1)", color: "warning", desc: "เริ่มมีภาวะน้ำหนักเกิน ควรเริ่มควบคุมอาหาร" },
    Overweight_Level_II: { text: "น้ำหนักเกิน (ระดับ 2)", color: "warning", desc: "ควรระวังการรับประทานอาหารและออกกำลังกายสม่ำเสมอ" },
    Obesity_Type_I: { text: "โรคอ้วน (ระดับ 1)", color: "danger", desc: "ควรปรึกษาผู้เชี่ยวชาญเพื่อวางแผนลดน้ำหนัก" },
    Obesity_Type_II: { text: "โรคอ้วน (ระดับ 2)", color: "danger", desc: "มีความเสี่ยงต่อโรคแทรกซ้อนสูง ควรดูแลอย่างใกล้ชิด" },
    Obesity_Type_III: { text: "โรคอ้วนอันตราย (ระดับ 3)", color: "dark", desc: "ภาวะอ้วนขั้นสูงสุด ควรพบแพทย์เพื่อประเมินสุขภาพ" },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const age = Number(formData.Age);
    const height = Number(formData.Height);
    const weight = Number(formData.Weight);

    if (age <= 0 || age > 100) {
      alert("กรุณาระบุอายุที่ถูกต้อง (1 - 120 ปี)");
      return false;
    }
    if (height < 120 || height > 250) {
      alert("กรุณาระบุส่วนสูงที่สมเหตุสมผล (50 - 250 ซม.)");
      return false;
    }
    if (weight < 30 || weight > 300) {
      alert("กรุณาระบุน้ำหนักที่สมเหตุสมผล (2 - 600 กก.)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setPrediction(null);

    const payload = {
      Age: Number(formData.Age),
      Height: Number(formData.Height) / 100, // แปลงเป็นเมตรสำหรับ Model
      Weight: Number(formData.Weight),
      SMOKE: formData.SMOKE,
      CALC: formData.CALC,
    };

    try {
      const res = await predict(payload);
      setPrediction(res.prediction);
    } catch (err) {
      console.error("❌ API Error:", err);
      alert("ไม่สามารถเชื่อมต่อกับระบบ AI ได้ในขณะนี้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            {/* Brand Header */}
            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary mb-1">NeuralyzeFit</h1>
              <p className="text-muted">AI-Powered Obesity Risk Assessment</p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 p-lg-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">อายุ (ปี)</label>
                      <input
                        name="Age"
                        type="number"
                        className="form-control form-control-lg bg-light border-0"
                        placeholder="เช่น 25"
                        onChange={handleChange}
                        required
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">ส่วนสูง (ซม.)</label>
                      <input
                        name="Height"
                        type="number"
                        className="form-control form-control-lg bg-light border-0"
                        placeholder="170"
                        onChange={handleChange}
                        required
                        min="50"
                        max="250"
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">น้ำหนัก (กก.)</label>
                      <input
                        name="Weight"
                        type="number"
                        className="form-control form-control-lg bg-light border-0"
                        placeholder="65"
                        onChange={handleChange}
                        required
                        min="2"
                        max="600"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">คุณสูบบุหรี่หรือไม่?</label>
                      <select name="SMOKE" className="form-select form-select-lg bg-light border-0" onChange={handleChange}>
                        <option value="no">ไม่สูบ</option>
                        <option value="yes">สูบ</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">การดื่มแอลกอฮอล์</label>
                      <select name="CALC" className="form-select form-select-lg bg-light border-0" onChange={handleChange}>
                        <option value="no">ไม่ดื่ม</option>
                        <option value="sometimes">ดื่มบ้างบางครั้ง</option>
                        <option value="frequently">ดื่มบ่อย</option>
                      </select>
                    </div>

                    <div className="col-12 mt-4">
                      <button 
                        className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm py-3" 
                        disabled={loading}
                        style={{ transition: "all 0.3s" }}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : "วิเคราะห์ผลด้วย AI"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Result Section */}
                {prediction && predictionMap[prediction] && (
                  <div className="mt-5 animate__animated animate__fadeIn">
                    <hr className="my-4 opacity-25" />
                    <div className={`p-4 rounded-4 bg-${predictionMap[prediction].color} bg-opacity-10 border border-${predictionMap[prediction].color} border-opacity-25`}>
                      <h6 className={`text-${predictionMap[prediction].color} fw-bold text-uppercase mb-2`} style={{ letterSpacing: 1 }}>
                        ผลการวิเคราะห์
                      </h6>
                      <h2 className={`fw-black text-${predictionMap[prediction].color} mb-2`}>
                        {predictionMap[prediction].text}
                      </h2>
                      <p className="text-secondary mb-0">
                        {predictionMap[prediction].desc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-center mt-4 text-muted small">
              &copy; 2026 NeuralyzeFit AI Technology. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}