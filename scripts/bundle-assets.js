const fs = require('fs');
const path = require('path');

const assetsDir = path.resolve(__dirname, '../lib/assets/img');
const outputFile = path.resolve(__dirname, '../lib/assets/assets.ts');

function getAllSvgFilesRecursively(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllSvgFilesRecursively(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      files.push({ key: relPath.replace(/\\/g, '/'), filePath: fullPath });
    }
  }

  return files;
}

const svgFiles = getAllSvgFilesRecursively(assetsDir);

const entries = svgFiles.map(({ key, filePath }) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const base64 = Buffer.from(content).toString('base64');
  const dataUri = 'data:image/svg+xml;base64,' + base64;
  return `  "${key}": ${JSON.stringify(dataUri)}`;
});

const output = `// AUTO-GENERATED - DO NOT EDIT
export const assets:  Record<string, string> = {
${entries.join(',\n')}
} as const;

export type SvgAssetPath = keyof typeof assets;
`;

fs.writeFileSync(outputFile, output, 'utf8');

