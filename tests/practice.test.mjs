import test from 'node:test';
import assert from 'node:assert/strict';
import { solvedCube, turn, faceColors } from '../src/lib/rubik.mjs';
import { runProgram } from '../src/lib/logic-game.mjs';

test('six solved faces each contain nine uniform stickers', () => {
  const cube = solvedCube();
  assert.equal(cube.length, 54);
  for (const face of 'URFDLB') assert.equal(new Set(faceColors(cube, face)).size, 1);
});

test('each face turn has a correct inverse and order four', () => {
  const cube = solvedCube();
  for (const face of 'URFDLB') {
    assert.deepEqual(turn(turn(cube, face), `${face}'`), cube);
    assert.deepEqual([1, 2, 3, 4].reduce(c => turn(c, face), cube), cube);
    assert.deepEqual(turn(cube, `${face}2`), turn(turn(cube, face), face));
  }
});

test('R moves the front right column up and preserves all 54 sticker positions', () => {
  const cube = turn(solvedCube(), 'R');
  assert.deepEqual(faceColors(cube, 'U'), ['white','white','green','white','white','green','white','white','green']);
  const positions = cube.map(s => `${s.position.join(',')}/${s.normal.join(',')}`);
  assert.equal(new Set(positions).size, 54);
  assert.throws(() => turn(cube, 'X'));
});

test('a sequence and its reverse restores a mixed cube', () => {
  const moves = ['R', 'U', "F'", 'D2', 'L', "B'"];
  const inverse = move => move.endsWith('2') ? move : move.endsWith("'") ? move[0] : `${move}'`;
  const mixed = moves.reduce((cube, move) => turn(cube, move), solvedCube());
  assert.deepEqual([...moves].reverse().reduce((cube, move) => turn(cube, inverse(move)), mixed), solvedCube());
});

test('logic game reaches the goal and keeps out-of-bounds moves contained', () => {
  const solution = ['forward','forward','forward','forward','right','forward','forward','forward','forward'];
  assert.equal(runProgram(solution).success, true);
  const blocked = runProgram(['left', 'forward']);
  assert.equal(blocked.states.at(-1).blocked, true);
  assert.equal(blocked.states.at(-1).x, 0);
  assert.throws(() => runProgram(['arbitrary code']));
  assert.throws(() => runProgram(Array(41).fill('forward')));
});
