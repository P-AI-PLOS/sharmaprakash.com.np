#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagramTitles, renderDiagram } from '../../src/data/ai-diagrams.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
const resolveColor = (name) => {
  const value = tokens[name];
  if (!value) throw new Error(`Unknown token ${name}`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, nested) => resolveColor(nested));
};
const destination = resolve(root, 'public/images/blog/running-ai-yourself');
mkdirSync(destination, {recursive:true});
for (const kind of Object.keys(diagramTitles)) {
  const svg = renderDiagram(kind).replace(/var\((--[\w-]+)\)/g, (_, name) => resolveColor(name));
  writeFileSync(resolve(destination, `${kind}.svg`), svg + '\n');
}
console.log(`Rendered ${Object.keys(diagramTitles).length} static SVG fallbacks from the interactive model.`);

// This companion diagram is static: the arrows describe ownership and feedback,
// not a timed execution sequence.
const harnessBoxes = [
  [20, 20, 440, 64, 'User task', 'Desired behavior and constraints'],
  [20, 126, 440, 96, 'Agent harness', 'Context · permissions · work loop'],
  [20, 276, 210, 110, 'Inference server', 'Model requests and outputs'],
  [250, 276, 210, 110, 'Workspace tools', 'Read · edit · run tests'],
];
const harnessSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" role="img" aria-labelledby="title desc">
<title id="title">The harness coordinates model calls and tools</title><desc id="desc">A user task enters the harness. The harness exchanges requests and outputs with an inference server, and actions and results with workspace tools. It returns a result supported by evidence.</desc>
<rect width="480" height="540" rx="16" fill="${resolveColor('--surface-raised')}"/>
<g fill="none" stroke="${resolveColor('--text-muted')}" stroke-width="2"><path d="M240 84v42 M120 222v54 M360 222v54 M120 386v42h240v-42 M240 428v24"/></g>
${harnessBoxes.map(([x,y,w,h,title,subtitle]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${resolveColor('--text-muted')}"/><text x="${x+w/2}" y="${y+29}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17" font-weight="600" fill="${resolveColor('--text-strong')}">${title}</text><text x="${x+w/2}" y="${y+53}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${resolveColor('--text-muted')}">${subtitle}</text>`).join('')}
<g text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${resolveColor('--text-strong')}"><text x="120" y="251">requests ↕ outputs</text><text x="360" y="251">actions ↕ results</text><text x="240" y="474" font-size="17" font-weight="600">Result with evidence</text><text x="240" y="501">Continue, finish, or surface a blocker</text></g></svg>`;
writeFileSync(resolve(destination, 'harness.svg'), harnessSvg + '\n');
