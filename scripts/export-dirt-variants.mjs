import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "public", "debug", "dirt-variants");

const wrapSvg = (width, height, content) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fff7ef"/>
  ${content}
</svg>
`.trimStart();

const variants = [
  {
    name: "fx-dirt",
    width: 48,
    height: 48,
    content: `
      <circle cx="16" cy="16" r="8" fill="#7e5546" fill-opacity="0.95" />
      <circle cx="24" cy="26" r="11" fill="#7e5546" fill-opacity="0.95" />
      <circle cx="34" cy="18" r="7" fill="#7e5546" fill-opacity="0.95" />
      <circle cx="18" cy="32" r="7" fill="#7e5546" fill-opacity="0.95" />
    `
  },
  {
    name: "fx-dirt-streak",
    width: 72,
    height: 56,
    content: `
      <rect x="8" y="12" width="50" height="10" rx="6" fill="#69352b" fill-opacity="0.94" />
      <rect x="16" y="24" width="42" height="9" rx="5" fill="#69352b" fill-opacity="0.94" />
      <rect x="24" y="35" width="32" height="8" rx="4" fill="#69352b" fill-opacity="0.94" />
      <circle cx="58" cy="15" r="6" fill="#69352b" fill-opacity="0.94" />
      <circle cx="18" cy="39" r="5" fill="#69352b" fill-opacity="0.94" />
      <line x1="12" y1="18" x2="62" y2="6" stroke="#311612" stroke-opacity="0.26" stroke-width="5" stroke-linecap="round" />
      <line x1="22" y1="31" x2="67" y2="20" stroke="#311612" stroke-opacity="0.26" stroke-width="5" stroke-linecap="round" />
    `
  },
  {
    name: "fx-dirt-crumbs",
    width: 70,
    height: 62,
    content: `
      <circle cx="12" cy="18" r="5" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="24" cy="14" r="4" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="38" cy="20" r="6" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="50" cy="16" r="5" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="18" cy="32" r="4" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="30" cy="30" r="5" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="45" cy="34" r="4" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="58" cy="29" r="6" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="14" cy="46" r="5" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="28" cy="48" r="4" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="42" cy="46" r="5" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="55" cy="44" r="4" fill="#5b2f25" fill-opacity="0.98" />
      <circle cx="34" cy="33" r="12" fill="#3e2019" fill-opacity="0.5" />
    `
  },
  {
    name: "fx-dirt-smudge",
    width: 74,
    height: 62,
    content: `
      <ellipse cx="26" cy="28" rx="15" ry="9" fill="#4f2b24" fill-opacity="0.96" />
      <ellipse cx="45" cy="23" rx="13" ry="8" fill="#4f2b24" fill-opacity="0.96" />
      <ellipse cx="52" cy="38" rx="10" ry="7" fill="#4f2b24" fill-opacity="0.96" />
      <ellipse cx="34" cy="26" rx="21" ry="10" fill="#7d4737" fill-opacity="0.52" />
      <ellipse cx="39" cy="30" rx="23" ry="11" fill="none" stroke="#2b1612" stroke-opacity="0.24" stroke-width="6" />
      <line x1="14" y1="37" x2="62" y2="14" stroke="#2b1612" stroke-opacity="0.24" stroke-width="6" stroke-linecap="round" />
      <line x1="20" y1="46" x2="66" y2="26" stroke="#2b1612" stroke-opacity="0.24" stroke-width="6" stroke-linecap="round" />
    `
  }
];

mkdirSync(outputDir, { recursive: true });

for (const variant of variants) {
  const svg = wrapSvg(variant.width, variant.height, variant.content);
  writeFileSync(join(outputDir, `${variant.name}.svg`), svg, "utf8");
}

console.log(`Exported ${variants.length} dirt variants to ${outputDir}`);
