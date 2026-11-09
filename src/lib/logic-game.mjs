export const START = Object.freeze({ x: 0, y: 4, direction: 0 });
export const GOAL = Object.freeze({ x: 4, y: 0 });
const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// Only these three bounded commands are interpreted; this is not a code runner.
export function runProgram(commands) {
  if (!Array.isArray(commands) || commands.length > 40 || commands.some(c => !['forward', 'left', 'right'].includes(c))) throw new Error('Invalid program');
  const states = [{ ...START, blocked: false }];
  for (const command of commands) {
    const state = { ...states[states.length - 1], blocked: false };
    if (command === 'left') state.direction = (state.direction + 3) % 4;
    else if (command === 'right') state.direction = (state.direction + 1) % 4;
    else {
      const [dx, dy] = directions[state.direction];
      const x = state.x + dx, y = state.y + dy;
      if (x < 0 || x > 4 || y < 0 || y > 4) state.blocked = true;
      else { state.x = x; state.y = y; }
    }
    states.push(state);
  }
  const last = states[states.length - 1];
  return { states, success: last.x === GOAL.x && last.y === GOAL.y };
}
