import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../../public/images/blog/building-my-homelab/', import.meta.url);
const out = [];
const speed = { ten: '#2563eb', multi: '#0f8a82', gigabit: '#b66a08' };
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
function text(x, y, value, size = 19, color = '#334155', bold = false) {
  out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${bold ? 700 : 400}">${esc(value)}</text>`);
}
function box(x, y, width, height, fill = '#ffffff') {
  out.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" fill="${fill}" stroke="#cbd5e1" stroke-width="2"/>`);
}
function wire(d, color = speed.multi, dashed = false) {
  out.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="4"${dashed ? ' stroke-dasharray="9 7"' : ''}/>`);
}
function device(x, y, width, asset, title, rows, height = 290) {
  box(x, y, width, height);
  const data = readFileSync(new URL(`assets/${asset}.svg`, root)).toString('base64');
  out.push(`<image x="${x + (width - 180) / 2}" y="${y + 12}" width="180" height="105" href="data:image/svg+xml;base64,${data}"/>`);
  text(x + 22, y + 148, title, 24, '#172b46', true);
  rows.forEach((row, i) => text(x + 22, y + 184 + i * 30, row));
}

out.push('<svg xmlns="http://www.w3.org/2000/svg" width="2100" height="1510" viewBox="0 0 2100 1510" role="img" aria-labelledby="title"><title id="title">October homelab upgrade with illustrated hardware, Titan and network links</title><rect width="2100" height="1510" fill="#f5f8fc"/><g font-family="Arial,sans-serif">');
text(50, 50, 'homelab / 10G backbone + 2.5G compute', 34, '#172b46', true);
text(50, 82, 'Hardware, network links and XCP-ng pools', 18, '#64748b');

// Household uplink uses a dedicated overhead gutter.
wire('M250 165 V125 H1750 V165', speed.multi);
text(910, 114, '2.5G / household uplink', 18, speed.multi);
wire('M450 280 H550', speed.ten);
text(467, 260, '10G', 20, speed.ten, true);
wire('M950 280 H1050', speed.ten);
text(967, 260, '10G', 20, speed.ten, true);
device(50, 165, 400, 'router', 'UniFi Dream Router 7', ['Gateway + built-in AP', 'Wi-Fi / 2.4 · 5 · 6 GHz', 'Servers native uplink']);
device(550, 165, 400, 'switch', 'TRENDnet TEG-S562', ['Dedicated server switch', '4 × multigig RJ45 / 2 × SFP+', 'All six ports occupied']);
device(1050, 165, 400, 'rack-nas', 'vyas / Synology RS1221+', ['32 GB ECC / shared storage', '10G adapter + interconnect', 'NFS / media / Tailscale']);
device(1550, 165, 400, 'switch', 'USW Enterprise 8 PoE', ['Managed household network', 'APs / VLANs / PoE', '2.5G uplink to UDR7']);

// Group boundaries describe pool membership, not a shared physical host.
box(50, 610, 760, 385, '#eaf2fa');
box(840, 610, 760, 385, '#edf1f6');
text(72, 645, 'marvel-earth / AMD pool / 96 GB RAM', 23, '#172b46', true);
text(862, 645, 'marvel-cosmos / Intel pool', 23, '#172b46', true);
wire('M590 455 V490 H225 V675', speed.multi);
wire('M650 455 V515 H635 V675', speed.multi);
wire('M800 455 V515 H1045 V675', speed.multi);
wire('M900 455 V490 H1390 V675', speed.gigabit);
text(240, 579, '2.5G', 20, speed.multi, true);
text(650, 579, '2.5G', 20, speed.multi, true);
text(1060, 579, '2.5G', 20, speed.multi, true);
text(1405, 579, '1G', 20, speed.gigabit, true);
// Repaint small label backplates where group titles could meet a drop line.
box(65, 619, 570, 39, '#eaf2fa');
text(77, 646, 'marvel-earth / AMD pool / 96 GB RAM', 23, '#172b46', true);
box(855, 619, 440, 39, '#edf1f6');
text(867, 646, 'marvel-cosmos / Intel pool', 23, '#172b46', true);
device(70, 675, 330, 'mini-pc', 'shield / UM760 Slim', ['48 GB DDR5-5600', '2 TB SSD', '2.5GbE host connection']);
device(450, 675, 330, 'mini-pc', 'stark / UM880 Plus', ['48 GB DDR5-5600 / 2 TB SSD', 'XCP-ng host / AI workload role', '2.5GbE host connection']);
device(860, 675, 330, 'mini-pc', 'asgard', ['Celeron J4125 / 16 GB', '459 GB local SR', '2.5GbE host connection']);
device(1240, 675, 330, 'mini-pc', 'knowhere', ['Intel N150 / 12 GB', '459 GB local SR', '1GbE host connection']);

wire('M1950 270 H2040 V600 H1980', speed.gigabit);
wire('M1950 375 H2010 V885 H1980', speed.gigabit);
device(1650, 500, 330, 'access-point', 'quinjet / AC Pro', ['Prabin floor / Wi-Fi 5', '2.4 + 5 GHz', '1G max Ethernet uplink'], 270);
device(1650, 785, 330, 'access-point', 'sanctuary / U6 LR', ['Ground floor / Wi-Fi 6', '2.4 + 5 GHz / guest SSID', '1G max Ethernet uplink'], 270);

text(50, 1040, 'Servers / VLAN 10 • native access links • separate Intel and AMD pools', 21, '#172b46', true);
box(50, 1090, 1930, 295, '#f0ecfa');
const titanImage = readFileSync(new URL('assets/clamshell-laptop.svg', root)).toString('base64');
out.push(`<image x="80" y="1160" width="190" height="120" href="data:image/svg+xml;base64,${titanImage}"/>`);
text(80, 1132, 'Standalone macOS utility host / outside both XCP-ng pools', 23, '#6d46a2', true);
text(305, 1180, 'titan / 2018 MacBook Pro / clamshell', 24, '#172b46', true);
text(305, 1218, '6 cores / 12 threads / 16 GB RAM / ~250 GB SSD', 20);
text(305, 1256, 'Colima: 2 vCPU / 4 GiB RAM / 60 GiB disk', 20);
text(305, 1294, 'Local status, Homepage and Dozzle test services', 20);
text(305, 1332, 'Beszel monitoring / SSH / Screen Sharing', 20);
box(1120, 1155, 820, 185, '#ffffff');
wire('M900 1230 H1120', '#8054b5', true);
text(940, 1208, 'Wi-Fi', 20, '#8054b5', true);
text(1142, 1195, 'Trusted / VLAN 20 / 192.168.20.10', 23, '#6d46a2', true);
text(1142, 1233, 'Wireless membership / no fixed AP association shown', 19);
text(1142, 1271, 'Independent of the server switch and XCP-ng pools', 19);
text(1142, 1309, 'AirPlay requires a logged-in graphical session', 19);
for (const [x, label, color] of [[50, '10G', speed.ten], [240, '2.5G', speed.multi], [440, '1G', speed.gigabit]]) {
  wire(`M${x} 1435 h55`, color);
  text(x + 70, 1442, label, 18, color, true);
}
wire('M620 1435 h55', '#8054b5', true);
text(690, 1442, 'Wi-Fi / logical membership', 18, '#8054b5', true);
out.push('</g></svg>');
writeFileSync(fileURLToPath(new URL('upgrade.svg', root)), out.join('\n') + '\n');
