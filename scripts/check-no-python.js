import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
]);

const forbiddenNames = new Set([
  'requirements.txt',
  'Pipfile',
  'Pipfile.lock',
  'pyproject.toml',
  'poetry.lock',
]);

const forbiddenDirectories = new Set([
  '__pycache__',
  '.venv',
  'venv',
  '.pytest_cache',
  '.mypy_cache',
]);

const violations = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (forbiddenDirectories.has(entry.name)) {
        violations.push(relativePath);
        continue;
      }
      walk(fullPath);
      continue;
    }

    if (entry.name.endsWith('.py') || entry.name.endsWith('.pyc') || forbiddenNames.has(entry.name)) {
      violations.push(relativePath);
    }
  }
}

walk(root);

if (violations.length > 0) {
  console.error('Forbidden Python files found:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('No forbidden Python files found.');
