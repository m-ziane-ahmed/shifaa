/**
 * Crée ou met à jour un compte de test dans data/store/users.json
 * Usage : node scripts/seed-test-user.mjs --email x@y.z --password secret --name "Nom"
 */
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeDir = path.join(__dirname, "..", "data", "store");
const usersFile = path.join(storeDir, "users.json");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    out[key] = args[i + 1];
  }
  return out;
}

const { email, password, name = "Compte test" } = parseArgs();

if (!email || !password) {
  console.error("Usage: node scripts/seed-test-user.mjs --email EMAIL --password PASSWORD [--name NOM]");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Le mot de passe doit contenir au moins 8 caractères.");
  process.exit(1);
}

if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });

const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, "utf-8")) : [];
const normalized = email.toLowerCase();
const hash = await bcrypt.hash(password, 10);
const existing = users.find((u) => u.email === normalized);

if (existing) {
  existing.passwordHash = hash;
  existing.name = name;
  console.log(`Compte mis à jour : ${normalized}`);
} else {
  users.push({
    id: uuid(),
    email: normalized,
    passwordHash: hash,
    name,
    createdAt: new Date().toISOString(),
  });
  console.log(`Compte créé : ${normalized}`);
}

fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
console.log(`Fichier : ${usersFile}`);
