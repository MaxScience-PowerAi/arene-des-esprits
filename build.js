// Script pour zipper le projet final (vu que les fichiers ont déjà été générés par l'Agent IA)
// Utilisation : node build.js
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const output = fs.createWriteStream(path.join(__dirname, 'arene-des-esprits-v3.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Compression maximale
});

output.on('close', function() {
  console.log(`\n✅ ZIP généré avec succès: arene-des-esprits-v3.zip`);
  console.log(`Total bytes: ${archive.pointer()}`);
  console.log(`\nLe projet est prêt à être déployé (Vercel, Firebase Hosting, Netlify).`);
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Ajouter tout le contenu du dossier courant au ZIP (sauf node_modules et le zip lui-même)
archive.glob('**/*', {
  cwd: __dirname,
  ignore: ['node_modules/**', 'arene-des-esprits-v3.zip', 'build.js', '.git/**']
});

archive.finalize();

console.log('Création du fichier ZIP en cours...');
