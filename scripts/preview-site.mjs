// Site d'aperçu (onglet « Modifier le site » du Studio Sanity) : brouillons + repères cliquables.
//   npm run build:preview   → construit l'aperçu dans dist-preview/ (le site public reste dans dist/)
//   npm run deploy:preview  → construit puis déploie sur le worker « maison-muses-preview »
// Le nom du worker est forcé ici : l'aperçu ne doit jamais remplacer le site public (« maison-muses »).
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const PREVIEW_WORKER = 'maison-muses-preview';
const deploy = process.argv[2] === 'deploy';

const run = (cmd, args, env = {}) => {
  const r = spawnSync(`${cmd} ${args.join(' ')}`, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} a échoué (code ${r.status})`);
};

// Fichier de redirection laissé par l'adaptateur Cloudflare après un build serveur : sans ce ménage,
// un « wrangler deploy » du site public enverrait l'aperçu à sa place
const cleanRedirect = () => rmSync('.wrangler/deploy', { recursive: true, force: true });

try {
  run('npx', ['astro', 'build'], { PUBLIC_SANITY_VISUAL_EDITING: 'true' });
  if (deploy) run('npx', ['wrangler', 'deploy', '--name', PREVIEW_WORKER]);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  cleanRedirect();
}
