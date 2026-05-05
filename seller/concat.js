import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

const rootDir = process.cwd();

const outputFile = path.join(rootDir, 'output_concat.txt');
const gitignorePath = path.join(rootDir, '.gitignore');

// Initialiser le filtre "ignore"
const ig = ignore();

if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  ig.add(gitignoreContent);
}

// Ajouter des règles ignorées par défaut (le script lui-même, la sortie et .git)
ig.add(['.git', 'concat.js', 'output_concat.txt']);

// Fonction récursive pour parcourir les dossiers
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const relPath = Math.max(0, path.relative(rootDir, filePath).length) === 0 ? file : path.relative(rootDir, filePath);
    
    // Si le dossier ou fichier est ignoré, on passe au suivant
    if (ig.ignores(relPath)) {
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, files);
    } else {
      files.push({ absolute: filePath, relative: relPath });
    }
  }
  
  return files;
}

function compileFiles() {
  const allFiles = getFiles(rootDir);
  const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file.absolute, 'utf8');
      
      // Ignore les fichiers binaires (qui contiennent des caractères nuls en UTF-8)
      if (content.includes('\0')) {
        continue;
      }

      writeStream.write(`${file.relative}:\n`);
      writeStream.write(`+${content}\n\n`);
    } catch (err) {
      console.error(`Erreur lors de la lecture du fichier : ${file.relative}`);
    }
  }

  writeStream.end();
  console.log(`✅ Concaténation terminée avec succès dans : ${outputFile}`);
}

compileFiles();