/**
 * Télécharge les visuels catalogue dans public/images/products/
 * Usage: npm run catalog:images
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public", "images", "products");

const CATEGORIES = [
  "visage-peau",
  "corps-hygiene",
  "cheveux",
  "bebe-maternite",
  "complements",
  "bien-etre",
  "dispositifs",
  "bio-naturel",
];

const FILES = Array.from({ length: 10 }, (_, i) => `${String(i + 1).padStart(2, "0")}.jpg`);

async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 500) throw new Error("Fichier trop petit");
  fs.writeFileSync(dest, buffer);
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

async function ensureImage(category, file) {
  const dir = path.join(publicDir, category);
  const dest = path.join(dir, file);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return "skip";
  }

  const seed = `shifaa-${category}-${file.replace(".jpg", "")}`;
  const url = `https://picsum.photos/seed/${seed}/800/800.jpg`;

  try {
    await downloadFile(url, dest);
    return "ok";
  } catch {
    const fallback = path.join(dir, "01.jpg");
    if (file !== "01.jpg" && fs.existsSync(fallback) && fs.statSync(fallback).size > 1000) {
      copyFile(fallback, dest);
      return "copy";
    }
    throw new Error(`Impossible de créer ${category}/${file}`);
  }
}

async function main() {
  let ok = 0;
  let skip = 0;
  let copy = 0;
  let fail = 0;

  for (const category of CATEGORIES) {
    for (const file of FILES) {
      try {
        process.stdout.write(`→ ${category}/${file} ... `);
        const status = await ensureImage(category, file);
        if (status === "skip") {
          console.log("déjà présent");
          skip++;
        } else if (status === "copy") {
          console.log("copie locale");
          copy++;
        } else {
          console.log("OK");
          ok++;
        }
      } catch (e) {
        console.log("ERREUR", e.message);
        fail++;
      }
    }
  }

  console.log(`\nTerminé : ${ok} téléchargés, ${copy} copiés, ${skip} ignorés, ${fail} erreurs.`);
  if (fail > 0) process.exitCode = 1;
}

main();
