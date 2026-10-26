const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const output = path.join(root, 'dist', 'romaji-convert.js');
const notices = fs.readFileSync(path.join(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
fs.writeFileSync(output, `/*! Romaji Convert 1.0.2 — based on Pithaya/spicetify-apps\n${notices.replaceAll('*/', '* /')}\n*/\n${fs.readFileSync(output, 'utf8')}`);
