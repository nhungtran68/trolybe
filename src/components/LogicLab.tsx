"use client";

import { useState } from "react";
import { GOAL, runProgram } from "@/lib/logic-game.mjs";

type Command = "forward" | "left" | "right";
const commandLabels: Record<Command, string> = { forward: "Tiến 1 ô", left: "Quay trái", right: "Quay phải" };
const arrows = ["↑", "→", "↓", "←"];

export default function LogicLab() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [result, setResult] = useState<ReturnType<typeof runProgram> | null>(null);
  const [step, setStep] = useState(0);
  const state = result?.states[step] ?? runProgram([]).states[0];
  function change(next: Command[]) { setCommands(next); setResult(null); setStep(0); }
  function run() { const next = runProgram(commands); setResult(next); setStep(next.states.length - 1); }
  return <section className="lab" aria-labelledby="logic-title"><span className="eyebrow">GÓC THỰC HÀNH</span><h2 id="logic-title">Lập trình đường đi</h2><p>Xếp lệnh để đưa bạn robot từ góc dưới bên trái đến ngôi sao. Robot bắt đầu quay lên trên.</p>
    <div className="logic-board" role="grid" aria-label="Bảng 5 nhân 5"><>{Array.from({ length: 25 }, (_, i) => { const x = i % 5, y = Math.floor(i / 5), robot = state.x === x && state.y === y, goal = GOAL.x === x && GOAL.y === y; return <div key={i} role="gridcell" aria-label={`${robot ? "Robot " : ""}${goal ? "Đích " : ""}cột ${x + 1}, hàng ${y + 1}`} className={goal ? "goal-cell" : ""}>{robot ? arrows[state.direction] : goal ? "★" : ""}</div>; })}</></div>
    <div className="action-row">{(Object.keys(commandLabels) as Command[]).map(command => <button key={command} disabled={commands.length >= 40} onClick={() => change([...commands, command])}>+ {commandLabels[command]}</button>)}</div>
    <div className="program" aria-live="polite">{commands.length ? commands.map((command, i) => <span key={i}>{i + 1}. {commandLabels[command]}</span>) : "Chưa có lệnh. Chọn nút phía trên để bắt đầu."}</div>
    <div className="action-row secondary"><button disabled={!commands.length} onClick={() => change(commands.slice(0, -1))}>Xóa lệnh cuối</button><button disabled={!commands.length} onClick={() => change([])}>Xóa tất cả</button><button disabled={!commands.length} onClick={run}>Chạy chương trình</button></div>
    {result && <><p role="status">{step === result.states.length - 1 && result.success ? "Giỏi lắm! Robot đã đến ngôi sao. ⭐" : state.blocked ? "Robot gặp mép bảng ở bước này. Thử đổi lệnh nhé!" : `Bước ${step}/${commands.length}. Hãy xem từng bước robot di chuyển.`}</p><div className="action-row secondary"><button disabled={step === 0} onClick={() => setStep(step - 1)}>← Bước trước</button><button disabled={step === commands.length} onClick={() => setStep(step + 1)}>Bước tiếp →</button></div></>}
    <p className="lab-note">Trò chơi chỉ xử lý các lệnh trên. Đây chưa phải trình chạy Python hay Scratch.</p>
  </section>;
}
