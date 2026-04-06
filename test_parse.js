const fs = require('fs');
const acorn = require('acorn');
try {
  const code = fs.readFileSync('game.js', 'utf8');
  acorn.parse(code, {ecmaVersion: 2022, sourceType: 'module'});
  console.log("game.js parsed fine");
} catch(e) { console.error("game.js error:", e); }
try {
  const code = fs.readFileSync('src/entities/Mario_v2.js', 'utf8');
  acorn.parse(code, {ecmaVersion: 2022, sourceType: 'module'});
  console.log("Mario_v2.js parsed fine");
} catch(e) { console.error("Mario_v2.js error:", e); }
try {
  const code = fs.readFileSync('src/level/Level_v2.js', 'utf8');
  acorn.parse(code, {ecmaVersion: 2022, sourceType: 'module'});
  console.log("Level_v2.js parsed fine");
} catch(e) { console.error("Level_v2.js error:", e); }
try {
  const code = fs.readFileSync('src/entities/Gomrog.js', 'utf8');
  acorn.parse(code, {ecmaVersion: 2022, sourceType: 'module'});
  console.log("Gomrog.js parsed fine");
} catch(e) { console.error("Gomrog.js error:", e); }
