import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { stagePagesBuild } from '../stage-pages.js';

test('deployment recovers cached-page dependencies and keeps new HTML across subsequent builds', () => {
 const workspace = mkdtempSync(join(tmpdir(), 'trs-stage-test-'));
 try {
  const repository = join(workspace, 'history'), build = join(workspace, 'build'), staging = join(workspace, 'site');
  mkdirSync(repository);
  const git = (...args) => execFileSync('git', args, { cwd: repository, encoding: 'utf8' }).trim();
  git('init', '-q'); git('config', 'user.name', 'Deployment test'); git('config', 'user.email', 'test@example.invalid');
  mkdirSync(join(repository, 'assets'));
  for (const [name, body] of Object.entries({ 'old.css': 'original styles', 'old.js': 'original script', 'old.woff2': 'original font' })) {
   writeFileSync(join(repository, 'assets', name), body);
  }
  writeFileSync(join(repository, 'projects.html'), 'cached page');
  git('add', '.'); git('commit', '-qm', 'Old site');
  git('mv', 'assets/old.css', 'assets/renamed.css'); git('commit', '-qm', 'Renamed style bundle');
  rmSync(join(repository, 'assets'), { recursive: true });
  mkdirSync(join(repository, 'assets')); writeFileSync(join(repository, 'assets', 'current.css'), 'current styles');
  writeFileSync(join(repository, 'projects.html'), 'previous page');
  git('add', '--all'); git('commit', '-qm', 'Site that removed old assets');
  const history = git('rev-parse', 'HEAD');
  cpSync(repository, staging, { recursive: true });
  writeFileSync(join(staging, 'obsolete.html'), 'remove this');
  mkdirSync(join(build, 'assets'), { recursive: true });
  writeFileSync(join(build, 'assets', 'current.css'), 'new styles');
  for (const page of ['index', 'services', 'projects', 'contact']) writeFileSync(join(build, `${page}.html`), `new ${page}`);

  assert.equal(stagePagesBuild({ repository, build, staging, history }), 4);
  for (const [name, body] of Object.entries({ 'old.css': 'original styles', 'renamed.css': 'original styles', 'old.js': 'original script', 'old.woff2': 'original font', 'current.css': 'new styles' })) {
   assert.equal(readFileSync(join(staging, 'assets', name), 'utf8'), body);
  }
  for (const page of ['index', 'services', 'projects', 'contact']) assert.equal(readFileSync(join(staging, `${page}.html`), 'utf8'), `new ${page}`);
  assert.equal(existsSync(join(staging, 'obsolete.html')), false);
  assert.equal(existsSync(join(staging, '.git')), true);
  assert.equal(stagePagesBuild({ repository, build, staging, history }), 0);
  assert.equal(readFileSync(join(staging, 'assets', 'old.css'), 'utf8'), 'original styles');
 } finally { rmSync(workspace, { recursive: true, force: true }); }
});
