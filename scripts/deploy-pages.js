import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { stagePagesBuild } from './stage-pages.js';
const root = process.cwd();
const run = (command, args, cwd = root, options = {}) => execFileSync(command, args, { cwd, stdio: 'inherit', ...options });
const readGit = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const origin = readGit(['remote', 'get-url', 'origin']);
if (!/tamrong2519-collab\/trs-asphalt-website(?:\.git)?$/.test(origin)) throw new Error('Check the deployment repository before using this script.');
run('npm', ['run', 'build'], root, { env: { ...process.env, SITE_BASE: '/', VITE_SITE_URL: 'https://www.trsasphalt.com/' } });
const staging = mkdtempSync(join(tmpdir(), 'trs-pages-'));
try {
 run('git', ['init', '-b', 'gh-pages', staging]);
 const existing = readGit(['ls-remote', 'origin', 'refs/heads/gh-pages']);
 let history = '';
 if (existing) {
  run('git', ['fetch', 'origin', 'gh-pages']);
  history = readGit(['rev-parse', 'FETCH_HEAD']);
  run('git', ['fetch', root, history], staging);
  run('git', ['reset', '--hard', 'FETCH_HEAD'], staging);
 }
 const restored = stagePagesBuild({ repository: root, build: join(root, 'dist'), staging, history });
 console.log(`Kept previously published assets and recovered ${restored} missing files for cached pages.`);
 run('git', ['config', 'user.name', readGit(['config', 'user.name'])], staging);
 run('git', ['config', 'user.email', readGit(['config', 'user.email'])], staging);
 run('git', ['add', '--all'], staging);
 const changes = execFileSync('git', ['status', '--porcelain'], { cwd: staging, encoding: 'utf8' });
 if (changes) run('git', ['commit', '-m', 'Deploy TRS ASPHALT website to GitHub Pages'], staging);
 run('git', ['fetch', staging, 'HEAD']);
 run('git', ['push', 'origin', 'FETCH_HEAD:refs/heads/gh-pages']);
 console.log('Uploaded gh-pages. Enable Settings > Pages > Deploy from a branch > gh-pages / (root).');
 console.log('Expected URL after Pages is enabled: https://www.trsasphalt.com/');
} finally { rmSync(staging, { recursive: true, force: true }); }
