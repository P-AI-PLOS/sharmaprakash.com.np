import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../../public/images/blog/building-my-homelab/', import.meta.url);
const out = [];
const speed = { ten: '#2563eb', multi: '#16818b', gigabit: '#b66a08' };
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
// Match the current diagram's compact cards and typography. Keep this renderer
// self-contained so operational snapshot updates cannot change the upgrade.
function device(x, y, width, asset, title, subtitle, rows) {
  box(x, y, width, 240);
  const data = readFileSync(new URL(`assets/${asset}.svg`, root)).toString('base64');
  out.push(`<image x="${x + width - 112}" y="${y + 18}" width="90" height="58" href="data:image/svg+xml;base64,${data}"/>`);
  text(x + 22, y + 45, title, 25, '#12243c', true);
  text(x + 22, y + 101, subtitle, 18, '#52647a');
  rows.forEach((row, i) => text(x + 22, y + 143 + i * 29, row, 18));
}
function group(x, y, width, height, label, fill, color, labelY) {
  box(x, y, width, height, fill);
  text(x + 22, labelY, label, 23, color, true);
}

out.push('<svg xmlns="http://www.w3.org/2000/svg" width="2640" height="1780" viewBox="0 0 2640 1780" role="img" aria-labelledby="title desc"><title id="title">homelab</title><desc id="desc">UDR7 connects to the unmanaged TEG-S562 and Vyas at 10G. Shuri, Talokan and Asgard connect at 2.5G; Knowhere at 1G. Servers use untagged VLAN 10. The managed Enterprise network carries household VLAN trunks. Titan uses Trusted Wi-Fi without a fixed AP association.</desc><rect width="2640" height="1780" fill="#f5f8fc"/><g font-family="Arial, sans-serif">');
text(50, 52, 'homelab', 32, '#12243c', true);
text(50, 84, 'Physical connections / VLAN membership', 17, '#64748b');
for (const [x, label, color] of [[1760, '1G', speed.gigabit], [1970, '2.5G', speed.multi], [2210, '10G', speed.ten]]) {
  wire(`M${x} 66 h60`, color);
  text(x + 76, 72, label, 20, color, true);
}
group(20, 955, 420, 330, 'Standalone Ubuntu', '#edf7f5', speed.multi, 1260);
group(450, 955, 410, 330, 'vibranium / XCP-ng', '#f0ecfa', '#6d46a2', 1260);
group(870, 955, 840, 330, 'marvel-cosmos / XCP-ng pool', '#eaf2fa', speed.ten, 1260);
group(1720, 955, 410, 330, 'Shared storage', '#edf1f6', '#52647a', 1260);
group(2160, 110, 440, 755, 'Wi-Fi access points', '#eaf2fa', speed.ten, 148);
group(2160, 920, 440, 365, 'Trusted clients · VLAN 20', '#f0ecfa', '#6d46a2', 958);

wire('M390 280 H470', speed.gigabit);
text(403, 257, '1G', 18, speed.gigabit, true);
wire('M860 280 H1730', speed.multi);
text(1010, 255, 'UDR7 ↔ Enterprise / 2.5G household trunk', 20, speed.multi, true);
wire('M665 390 V470 H1295 V530', speed.ten);
text(840, 446, 'UDR7 ↔ TEG-S562 / 10G', 20, speed.ten, true);
wire('M2120 270 H2180', speed.gigabit);
wire('M2120 340 H2140 V680 H2180', speed.gigabit);

// Ordered fan-out: the outer cables turn first, so no server cables cross.
const links = [
  [1130, 800, 235, 'Shuri / 2.5G', speed.multi, 280],
  [1200, 840, 665, 'Talokan / 2.5G', speed.multi, 700],
  [1270, 880, 1085, 'Asgard / 2.5G', speed.multi, 1095],
  [1340, 850, 1505, 'Knowhere / 1G', speed.gigabit, 1380],
  [1430, 810, 1935, 'Vyas / 10G', speed.ten, 1750],
];
for (const [source, turn, target, label, color, labelX] of links) {
  wire(`M${source} 770 V${turn} H${target} V980`, color);
  text(labelX, turn - 15, label, 19, color, true);
}
device(40, 150, 350, "router", "WorldLink", "ISP gateway / 192.168.1.254", ["UDR7 WAN / 1G"]);
device(470, 150, 390, "router", "UDR7", "UniFi Dream Router 7", ["192.168.2.1 / routing + firewall", "Built-in Wi-Fi: 2.4 / 5 / 6 GHz"]);
device(1730, 150, 390, "switch", "Enterprise 8", "USW Enterprise 8 PoE", ["p7 → Quinjet / 1G max trunk", "p4 → Sanctuary / 1G max trunk"]);
device(1100, 530, 390, "switch", "TEG-S562", "TRENDnet / unmanaged", ["4 × multigig RJ45 / 2 × SFP+", "Untagged Servers / VLAN 10", "All six ports occupied"]);
device(40, 980, 380, "minisforum", "shuri", "UM880 Plus / 192.168.10.15", ["64 GB / 2 × 32 GB / 5600 MT/s", "Ubuntu / Radeon 780M / 2 TB", "Gaming / local AI / Incus"]);
device(470, 980, 370, "minisforum", "talokan", "UM760 Slim / 192.168.10.28", ["96 GB / 2 × 48 GB / 5600 MT/s", "Single-host pool / 2 TB NVMe", "Builders / runners / infra VMs"]);
device(900, 980, 370, "mini-pc", "asgard", "J4125 / 192.168.10.11", ["16 GB / 459 GB local SR", "Pool member / eth1 uplink", "Heimdall / K3s control"]);
device(1320, 980, 370, "mini-pc", "knowhere", "N150 / 192.168.10.10", ["12 GB / 459 GB local SR", "Pool master / eth1 uplink", "Quill / Factory"]);
device(1750, 980, 360, "rack-nas", "vyas", "RS1221+ / 192.168.10.9", ["32 GB ECC / NFS / backups", "10G adapter + interconnect", "Media / VMM / Tailscale", "9.49 TiB usable / RAID5"]);
device(2180, 180, 400, "access-point", "quinjet", "AC Pro / Prabin floor", ["Wi-Fi 5 / 2.4 + 5 GHz", "SSID → VLAN mapping below"]);
device(2180, 580, 400, "access-point", "sanctuary", "U6 LR / ground floor", ["Wi-Fi 6 / 2.4 + 5 GHz"]);
device(2180, 980, 400, "clamshell-laptop", "titan", "MacBook Pro / 192.168.20.10", ["16 GB / 250.7 GB SSD", "Wi-Fi through a Trusted SSID", "Standalone macOS / AP may vary"]);

box(40, 1300, 1250, 445);
text(64, 1342, "VLANs / separate networks on shared cables", 25, "#12243c", true);
text(64, 1386, "Network", 18, "#52647a", true);
text(315, 1386, "VLAN", 18, "#52647a", true);
text(470, 1386, "Subnet", 18, "#52647a", true);
text(790, 1386, "Members / purpose", 18, "#52647a", true);
text(64, 1430, "Default", 18, "#334155", false);
text(315, 1430, "Native", 18, "#334155", false);
text(470, 1430, "192.168.2.0/26", 18, "#334155", false);
text(790, 1430, "Gateway / switch / AP management", 18, "#334155", false);
text(64, 1472, "Servers", 18, "#334155", false);
text(315, 1472, "10", 18, "#334155", false);
text(470, 1472, "192.168.10.0/26", 18, "#334155", false);
text(790, 1472, "XCP-ng hosts, Shuri, NAS and guests", 18, "#334155", false);
text(64, 1514, "Trusted", 18, "#334155", false);
text(315, 1514, "20", 18, "#334155", false);
text(470, 1514, "192.168.20.0/28", 18, "#334155", false);
text(790, 1514, "Personal devices / Titan", 18, "#334155", false);
text(64, 1556, "Family", 18, "#334155", false);
text(315, 1556, "30", 18, "#334155", false);
text(470, 1556, "192.168.30.0/24", 18, "#334155", false);
text(790, 1556, "Household devices", 18, "#334155", false);
text(64, 1598, "IoT", 18, "#334155", false);
text(315, 1598, "40", 18, "#334155", false);
text(470, 1598, "192.168.40.0/26", 18, "#334155", false);
text(790, 1598, "Smart devices / media clients", 18, "#334155", false);
text(64, 1640, "Cameras", 18, "#334155", false);
text(315, 1640, "45", 18, "#334155", false);
text(470, 1640, "192.168.45.0/28", 18, "#334155", false);
text(790, 1640, "Camera devices", 18, "#334155", false);
text(64, 1682, "Guest", 18, "#334155", false);
text(315, 1682, "50", 18, "#334155", false);
text(470, 1682, "192.168.50.0/24", 18, "#334155", false);
text(790, 1682, "Visitor network / SSID disabled", 18, "#334155", false);

box(1330, 1300, 1250, 445, '#edf7f5');
text(1354, 1342, 'How VLANs travel through this topology', 25, '#12243c', true);
text(1354, 1392, 'HOUSEHOLD TRUNKS / UDR7 ↔ Enterprise ↔ APs', 20, speed.multi, true);
text(1354, 1426, 'Managed links carry household VLAN tags; Default remains native for management.', 20);
text(1354, 1476, 'SERVER UPLINK / UDR7 ↔ TEG-S562', 20, speed.ten, true);
text(1354, 1510, 'The UDR7 supplies Servers VLAN 10 as the native, untagged network.', 20);
text(1354, 1560, 'SERVER ACCESS / all four compute hosts + Vyas', 20, speed.multi, true);
text(1354, 1594, 'TEG-S562 connections use untagged traffic. Household trunks stay on Enterprise.', 20);
text(1354, 1644, 'WIRELESS / SSID selects VLAN', 20, '#6d46a2', true);
text(1354, 1678, 'Trusted → 20 / Family → 30 / IoT → 40 / Cameras → 45 / Guest → 50', 20);
text(1354, 1715, 'UDR7 firewall policy controls traffic between networks. A trunk is not permission.', 18);
out.push('</g></svg>');
writeFileSync(fileURLToPath(new URL('upgrade.svg', root)), out.join('\n') + '\n');
