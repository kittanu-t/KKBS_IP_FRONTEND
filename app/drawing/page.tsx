"use client";

import { useRef, useState, useEffect } from "react";
import { RefreshCcw, Send, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ClockDrawingTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; interpretation: string } | null>(null);

  // ตั้งค่า Context ของ Canvas เมื่อ Component โหลด
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#1e293b"; // Slate-800
      }
    }
  }, []);

  // ฟังก์ชันคำนวณพิกัด (รองรับทั้ง Mouse และ Touch)
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    // ป้องกันการ Scroll หน้าจอขณะวาดบนมือถือ
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setResult(null);
    }
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    const image = canvas.toDataURL("image/png");

    try {
      const res = await fetch("http://192.168.0.103:2569/analyze-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์วิเคราะห์ผลได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h2 className="text-2xl font-bold">แบบทดสอบวาดนาฬิกา</h2>
          <p className="text-indigo-100 text-sm mt-1">Clock Drawing Test (CDT)</p>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 text-center">
            <p className="text-slate-600 mb-2">กรุณาวาดหน้าปัดนาฬิกา พร้อมตัวเลข และตั้งเวลาไปที่</p>
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-full font-mono text-2xl font-bold text-slate-800">
              19:00 น.
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="border-2 border-slate-200 rounded-xl bg-white shadow-inner cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-sm font-medium text-slate-600">กำลังประมวลผล...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={clearCanvas}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={18} /> ล้างหน้าจอ
            </button>
            <button
              onClick={saveDrawing}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={18} /> ส่งคำตอบ
            </button>
          </div>

          {/* Result Area */}
          {result && (
            <div className={`mt-8 p-4 rounded-xl border-2 ${
              result.score >= 2 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-start gap-3">
                {result.score >= 2 ? (
                  <CheckCircle2 className="text-emerald-500 mt-1" />
                ) : (
                  <AlertCircle className="text-amber-500 mt-1" />
                )}
                <div>
                  <h4 className={`font-bold ${
                    result.score >= 2 ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    ผลการวิเคราะห์
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    คะแนนที่ได้: <span className="font-bold text-lg">{result.score}/3</span>
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-1">
                    การแปลผล: {result.interpretation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Medical AI Analysis System
          </p>
        </div>
      </div>
    </div>
  );
}