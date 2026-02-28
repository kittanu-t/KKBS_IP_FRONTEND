"use client";

import { useRef, useState, useEffect } from "react";
import { RefreshCcw, Send, AlertCircle, CheckCircle2, Clock, Brain } from "lucide-react";

interface ClockResult {
  status: "success" | "fail";
  prediction?: number;
  interpretation?: string;
  confidence?: number;
  debug_image?: string;
  message?: string;
}

export default function ClockDrawingTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClockResult | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1a2e1d"; // ใช้สีเข้มเพื่อให้ตัดกับพื้นหลังขาว
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setResult(null);
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsLoading(true);
    setResult(null);
    const image = canvas.toDataURL("image/png");

    try {
      const res = await fetch("https://obesity-clock-api.onrender.com/analyze-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data: ClockResult = await res.json();
      if (!res.ok) throw new Error(data.message || "Server error");
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="fw-bold mb-2" style={{ color: 'var(--color-1)', fontSize: '2rem' }}>
            NeuralyzeFit CDT
          </h1>
          <p className="text-muted">แบบทดสอบวาดนาฬิกาเพื่อประเมินการทำงานของสมอง</p>
        </div>

        <div className="card card-custom p-6 p-lg-8 bg-white shadow-lg">
          {/* Instructions */}
          <div className="mb-8 text-center">
            <h5 className="fw-semibold mb-3 text-dark">คำสั่ง: วาดหน้าปัดนาฬิกาที่กำหนด</h5>
            <div className="d-inline-flex px-5 py-3 rounded-4 font-monospace shadow-sm"
                 style={{ 
                   fontSize: '2.5rem', 
                   fontWeight: '800', 
                   backgroundColor: '#f8faf9', 
                   color: 'var(--color-3)',
                   border: '2px dashed var(--color-3)' 
                 }}>
              11:10 น.
            </div>
          </div>

          {/* Drawing Area */}
          <div className="d-flex justify-content-center align-items-center mb-8 position-relative" style={{ height: "320px" }}>
            
            {/* 1. Guide Dot Overlay - ใช้ Grid สั่งให้อยู่กึ่งกลางเป๊ะ */}
            <div className="position-absolute d-grid" style={{ width: "320px", height: "320px", placeItems: "center", pointerEvents: "none" }}>
              <div 
                className="rounded-circle opacity-25"
                style={{ 
                  width: "10px", 
                  height: "10px", 
                  backgroundColor: "var(--color-3)",
                  zIndex: 0
                }}
              ></div>
            </div>
            
            {/* 2. Canvas - ต้องตั้ง z-index ให้สูงกว่าแต่พื้นหลังห้ามบังจุด */}
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="position-relative border-2 rounded-circle shadow-inner cursor-crosshair touch-none"
              style={{ 
                  borderColor: '#e9ecef', 
                  borderStyle: 'solid', 
                  zIndex: 10,
                  backgroundColor: 'transparent' // สำคัญมาก: ต้องโปร่งแสงเพื่อให้เห็นจุดข้างหลัง
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {/* 3. Loading Overlay */}
            {isLoading && (
              <div className="position-absolute d-flex flex-column align-items-center justify-content-center rounded-circle"
                  style={{ width: "320px", height: "320px", backgroundColor: "rgba(255,255,255,0.9)", zIndex: 30 }}>
                <div className="spinner-border text-success mb-3" role="status"></div>
                <span className="fw-bold text-success">AI กำลังวิเคราะห์...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="row g-3">
            <div className="col-6">
              <button
                onClick={clearCanvas}
                disabled={isLoading}
                className="btn btn-outline-secondary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-center gap-2"
              >
                <RefreshCcw size={18} /> ล้างกระดาน
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={saveDrawing}
                disabled={isLoading}
                className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-center gap-2 shadow"
              >
                <Send size={18} /> ส่งวิเคราะห์
              </button>
            </div>
          </div>

          {/* Interpretation Result */}
          {result && result.status === "success" && (
            <div className={`mt-8 animate__animated animate__fadeIn`}>
              <div className={`prediction-box p-4 border-start border-5`} 
                   style={{ borderColor: result.prediction === 1 ? '#ffc107' : 'var(--color-2)' }}>
                <div className="d-flex gap-3">
                  <div className="mt-1">
                    {result.prediction === 1 ? 
                      <AlertCircle className="text-warning" size={28} /> : 
                      <CheckCircle2 style={{ color: 'var(--color-2)' }} size={28} />
                    }
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="fw-bold mb-1 text-dark">สรุปผลการทดสอบ</h4>
                    <p className="mb-0 text-secondary" style={{ fontSize: '1.1rem' }}>
                      {result.interpretation}
                    </p>
                  </div>
                </div>

                {result.debug_image && (
                  <div className="mt-4 pt-4 border-top border-light">
                    <p className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                      AI Computer Vision Analysis
                    </p>
                    <div className="rounded-4 overflow-hidden border shadow-sm">
                      <img src={result.debug_image} alt="Debug" className="img-fluid w-100" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <footer className="text-center mt-10 text-muted small">
          การวิเคราะห์นี้เป็นเพียงการประเมินเบื้องต้นโดย AI<br/>
          &copy; 2026 NeuralyzeFit Health Technology
        </footer>
      </div>
    </div>
  );
}