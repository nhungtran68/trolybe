"use client";

import { useState } from "react";
import { faceColors, solvedCube, turn } from "@/lib/rubik.mjs";

const labels: Record<string, string> = { U: "Trên", L: "Trái", F: "Trước", R: "Phải", B: "Sau", D: "Dưới" };
const colors: Record<string, string> = { white: "Trắng", yellow: "Vàng", green: "Xanh lá", blue: "Xanh dương", red: "Đỏ", orange: "Cam" };
type Cube = ReturnType<typeof solvedCube>;

export default function RubikLab() {
  const [states, setStates] = useState<Cube[]>(() => [solvedCube()]);
  const [moves, setMoves] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [suffix, setSuffix] = useState("");
  function apply(face: string) {
    const move = face + suffix;
    setStates([...states.slice(0, step + 1), turn(states[step], move)]);
    setMoves([...moves.slice(0, step), move]);
    setStep(step + 1);
  }
  function reset() { setStates([solvedCube()]); setMoves([]); setStep(0); }
  return <section className="lab" aria-labelledby="rubik-title">
    <span className="eyebrow">GÓC THỰC HÀNH</span><h2 id="rubik-title">Cùng khám phá Rubik 3×3</h2>
    <p>Chọn một mặt để xoay. Mặt lưới cho thấy cả sáu mặt của khối Rubik; mỗi màu là một ô thật sau phép xoay.</p>
    <div className="cube-net" aria-label="Sáu mặt Rubik"><div className="cube-spacer" />{["U", "L", "F", "R", "B", "D"].map(name => <div key={name} className={`cube-face cube-${name}`}><span>{labels[name]} ({name})</span><div className="stickers">{faceColors(states[step], name).map((color: string, i: number) => <span key={i} className={`sticker sticker-${color}`} aria-label={`${labels[name]}, ô ${i + 1}: ${colors[color]}`} />)}</div></div>)}</div>
    <fieldset className="turn-options"><legend>Kiểu xoay khi nhìn thẳng vào mặt đó</legend>{[["", "Theo chiều kim đồng hồ"], ["'", "Ngược chiều kim đồng hồ (′)"], ["2", "Hai lần (2)"]].map(([value, label]) => <label key={value}><input type="radio" name="suffix" checked={suffix === value} onChange={() => setSuffix(value)} /> {label}</label>)}</fieldset>
    <div className="action-row">{Object.keys(labels).map(face => <button key={face} onClick={() => apply(face)} aria-label={`Xoay mặt ${labels[face]}`}>{face}</button>)}</div>
    <p className="move-history">Bước {step}/{moves.length} · {moves.length ? moves.slice(0, step).join(" ") || "Trạng thái ban đầu" : "Chưa có bước xoay"}</p>
    <div className="action-row secondary"><button disabled={step === 0} onClick={() => setStep(step - 1)}>← Bước trước</button><button disabled={step === moves.length} onClick={() => setStep(step + 1)}>Bước tiếp →</button><button onClick={reset}>Làm lại</button></div>
    <p className="lab-note">Đây là mô hình lưới 2D cho Rubik 3×3, chưa phải bộ giải tự động hay mô hình 3D.</p>
  </section>;
}
