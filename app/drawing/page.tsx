"use client";

import { useRef, useState, useEffect } from "react";
import { RefreshCcw, Send, AlertCircle, CheckCircle2, Clock } from "lucide-react";

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
    ctx.strokeStyle = "#000000";
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

    // ส่งเฉพาะสิ่งที่วาดใน Canvas (จุด Guide ใน CSS จะไม่ติดไป)
    const image = canvas.toDataURL("image/png");

    try {
      const res = await fetch("http://localhost:2569/analyze-clock", {
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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h2 className="text-2xl font-bold">แบบทดสอบวาดนาฬิกา</h2>
          <p className="text-indigo-100 text-sm mt-1">Clock Drawing Test (CDT)</p>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 text-center">
            <p className="text-slate-600 mb-2 font-medium">
              กรุณาวาดหน้าปัดนาฬิกา พร้อมเข็มบอกเวลา
            </p>
            <div className="inline-block bg-indigo-50 px-6 py-2 rounded-full font-mono text-3xl font-bold text-indigo-700 border border-indigo-100">
              11:10 น.
            </div>
          </div>

          {/* Canvas Container with Guide Center */}
          <div className="relative flex justify-center mb-6">
            {/* Guide Center Dot (Pure CSS - ไม่ถูกส่งไป Back-end) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-300 rounded-full pointer-events-none z-0 opacity-50"></div>
            
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="relative z-10 border-2 border-slate-200 rounded-full bg-transparent shadow-inner cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {isLoading && (
              <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-xl">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={clearCanvas}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw size={18} /> ล้างหน้าจอ
            </button>
            <button
              onClick={saveDrawing}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              <Send size={18} /> ส่งคำตอบ
            </button>
          </div>

          {/* Result Section (เหมือนเดิม) */}
          {result && result.status === "success" && (
             <div className={`mt-8 p-4 rounded-xl border-2 ${result.prediction === 1 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                <div className="flex items-start gap-3">
                    {result.prediction === 1 ? <AlertCircle className="text-amber-500 mt-1" /> : <CheckCircle2 className="text-emerald-500 mt-1" />}
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">ผลการวิเคราะห์</h4>
                        <p className={`text-sm mt-1 font-medium ${result.prediction === 1 ? "text-amber-700" : "text-emerald-700"}`}>
                            {result.interpretation}
                        </p>
                    </div>
                </div>
                {result.debug_image && (
                    <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">AI View (Processed)</p>
                        <img src={result.debug_image} alt="Debug" className="rounded-lg border border-slate-200 w-full" />
                    </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}