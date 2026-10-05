import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { execFileSync } from 'node:child_process';

// Cached HTML must still be able to load its original hashed styles, scripts and fonts.
export function stagePagesBuild({ repository, build, staging, history }) {
 mkdirSync(staging, { recursive: true });
 for (const name of readdirSync(staging)) {
  if (name !== '.git' && name !== 'assets') rmSync(join(staging, name), { recursive: true, force: true });
 }
 cpSync(build, staging, { recursive: true });
 if (!history) return 0;

 const addedAssets = execFileSync('git', ['log', history, '--no-renames', '--format=%H', '--diff-filter=A', '--name-only', '--', 'assets/'], {
  cwd: repository, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
 });
 let commit = '', restored = 0;
 for (const name of addedAssets.split('\n')) {
  if (/^[0-9a-f]{40}$/.test(name)) { commit = name; continue; }
  if (!commit || !name.startsWith('assets/') || posix.normalize(name) !== name) continue;
  const destination = join(staging, name);
  if (existsSync(destination)) continue;
  const contents = execFileSync('git', ['show', `${commit}:${name}`], { cwd: repository, maxBuffer: 8 * 1024 * 1024 });
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents);
  restored++;
 }
 return restored;
}
