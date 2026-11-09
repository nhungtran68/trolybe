// Each sticker has an integer position and an outward normal. Rotating both
// gives a real cube permutation rather than changing a decorative picture.
export const faces = {
  U: { normal: [0, 1, 0], right: [1, 0, 0], down: [0, 0, 1], color: 'white' },
  D: { normal: [0, -1, 0], right: [1, 0, 0], down: [0, 0, -1], color: 'yellow' },
  F: { normal: [0, 0, 1], right: [1, 0, 0], down: [0, -1, 0], color: 'green' },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], down: [0, -1, 0], color: 'blue' },
  R: { normal: [1, 0, 0], right: [0, 0, -1], down: [0, -1, 0], color: 'red' },
  L: { normal: [-1, 0, 0], right: [0, 0, 1], down: [0, -1, 0], color: 'orange' },
};

export function solvedCube() {
  return Object.values(faces).flatMap(face => Array.from({ length: 9 }, (_, i) => ({
    position: face.normal.map((n, axis) => n + (i % 3 - 1) * face.right[axis] + (Math.floor(i / 3) - 1) * face.down[axis]),
    normal: [...face.normal], color: face.color,
  })));
}

function rotate(v, axis, direction) {
  const [x, y, z] = v;
  if (axis === 0) return [x, -direction * z, direction * y];
  if (axis === 1) return [direction * z, y, -direction * x];
  return [-direction * y, direction * x, z];
}

export function turn(cube, move) {
  if (!/^[URFDLB](?:'|2)?$/.test(move)) throw new Error('Invalid Rubik move');
  const normal = faces[move[0]].normal;
  const axis = normal.findIndex(n => n !== 0);
  const layer = normal[axis];
  const count = move.endsWith('2') ? 2 : 1;
  const direction = (move.endsWith("'") ? 1 : -1) * layer;
  return cube.map(sticker => {
    if (sticker.position[axis] !== layer) return { ...sticker, position: [...sticker.position], normal: [...sticker.normal] };
    let position = sticker.position, stickerNormal = sticker.normal;
    for (let i = 0; i < count; i++) {
      position = rotate(position, axis, direction);
      stickerNormal = rotate(stickerNormal, axis, direction);
    }
    return { ...sticker, position, normal: stickerNormal };
  });
}

export function faceColors(cube, name) {
  const face = faces[name];
  if (!face) throw new Error('Invalid face');
  const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
  return cube.filter(s => dot(s.normal, face.normal) === 1)
    .sort((a, b) => dot(a.position, face.down) - dot(b.position, face.down) || dot(a.position, face.right) - dot(b.position, face.right))
    .map(s => s.color);
}
