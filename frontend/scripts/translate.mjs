/**
 * Auto-Translation Script for Clarté
 * ------------------------------------
 * Source of truth: messages/fr.json (write ONLY this file manually)
 * Generated automatically: messages/ar.json, messages/en.json
 *
 * Usage:
 *   node scripts/translate.js              → translate all changed strings
 *   node scripts/translate.js --force      → re-translate everything from scratch
 *
 * Requires: OPENAI_API_KEY in environment
 *
 * How it works:
 *   1. Reads fr.json
 *   2. Compares each string against a hash cache (.translation-cache.json)
 *   3. Only sends NEW or CHANGED strings to OpenAI (saves API cost)
 *   4. Merges translated strings into ar.json and en.json
 *   5. Updates the hash cache
 *
 * Cost estimate: gpt-4o-mini @ ~$0.15/1M tokens
 *   A full 300-string UI file ≈ ~3000 tokens ≈ $0.0005 per run
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MESSAGES_DIR = path.join(__dirname, '..', 'messages')
const CACHE_FILE = path.join(MESSAGES_DIR, '.translation-cache.json')
const FORCE = process.argv.includes('--force')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required')
  process.exit(1)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex').slice(0, 8)
}

function flattenJson(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flattenJson(val, fullKey))
    } else {
      acc[fullKey] = typeof val === 'string' ? val : JSON.stringify(val)
    }
    return acc
  }, {})
}

function unflattenJson(flat) {
  const result = {}
  for (const [dotKey, value] of Object.entries(flat)) {
    const keys = dotKey.split('.')
    let cur = result
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {}
      cur = cur[keys[i]]
    }
    // Restore arrays and non-string values
    try { cur[keys.at(-1)] = JSON.parse(value) } catch { cur[keys.at(-1)] = value }
  }
  return result
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {}
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

// ─── OpenAI Translation ────────────────────────────────────────────────────────

async function translateBatch(strings, targetLang) {
  /**
   * strings: { "dotted.key": "French text", ... }
   * Returns: { "dotted.key": "Translated text", ... }
   */

  const langNames = { ar: 'Arabic', en: 'English' }
  const langName = langNames[targetLang]

  // Build a numbered list so the model can return matching numbers
  const entries = Object.entries(strings)
  const numbered = entries.map(([, val], i) => `${i + 1}. ${val}`).join('\n')

  const systemPrompt = `You are a professional translator for a French cleaning services company called "Clarté" (slogan: "Des services de nettoyage qui font briller la vie").

You translate UI copy from French to ${langName}.

Rules:
- Preserve the professional yet friendly brand tone
- Keep placeholders like {name}, {count}, {price} exactly as-is
- Keep HTML tags like <br>, <strong> exactly as-is
- For Arabic: use Modern Standard Arabic with a warm, professional register
- Never add explanations or notes — output translated strings only
- Output EXACTLY the same numbered list format as the input, one translation per line
- Do not add or remove items from the list`

  const userPrompt = `Translate these French UI strings to ${langName}. Return the same numbered list:\n\n${numbered}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,  // low temperature for consistent translation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const raw = data.choices[0].message.content.trim()

  // Parse numbered list back into key-value pairs
  const lines = raw.split('\n').filter(l => l.trim())
  const result = {}

  for (let i = 0; i < entries.length; i++) {
    const [key] = entries[i]
    // Match "1. translated text" format
    const line = lines[i] || ''
    const translated = line.replace(/^\d+\.\s*/, '').trim()
    result[key] = translated || entries[i][1]  // fallback to source if parse fails
  }

  return result
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌐 Clarté Auto-Translator')
  console.log('─'.repeat(40))

  // Load source (French)
  const frPath = path.join(MESSAGES_DIR, 'fr.json')
  if (!fs.existsSync(frPath)) {
    console.error('❌ messages/fr.json not found. Create it first.')
    process.exit(1)
  }

  const frJson = readJson(frPath)
  const frFlat = flattenJson(frJson)
  console.log(`📖 Source: ${Object.keys(frFlat).length} strings in fr.json`)

  // Load cache
  const cache = FORCE ? {} : readJson(CACHE_FILE)

  // Determine which strings need translation
  const toTranslate = {}
  for (const [key, val] of Object.entries(frFlat)) {
    const h = hash(val)
    if (!cache[key] || cache[key].hash !== h || FORCE) {
      toTranslate[key] = val
    }
  }

  if (Object.keys(toTranslate).length === 0) {
    console.log('✅ All translations are up to date. Nothing to do.')
    return
  }

  console.log(`🔄 ${Object.keys(toTranslate).length} strings need translation${FORCE ? ' (--force mode)' : ''}`)

  // Batch into chunks of 50 to avoid token limits
  const BATCH_SIZE = 50
  const keys = Object.keys(toTranslate)
  const batches = []
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batchKeys = keys.slice(i, i + BATCH_SIZE)
    batches.push(Object.fromEntries(batchKeys.map(k => [k, toTranslate[k]])))
  }

  // Translate to each target language
  for (const targetLang of ['ar', 'en']) {
    const langPath = path.join(MESSAGES_DIR, `${targetLang}.json`)
    const existing = readJson(langPath)
    const existingFlat = flattenJson(existing)

    console.log(`\n  → Translating to ${targetLang.toUpperCase()}...`)

    const allTranslated = { ...existingFlat }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const batchNum = `batch ${i + 1}/${batches.length}`
      process.stdout.write(`    ${batchNum} (${Object.keys(batch).length} strings)... `)

      try {
        const translated = await translateBatch(batch, targetLang)
        Object.assign(allTranslated, translated)
        process.stdout.write('✓\n')
      } catch (err) {
        process.stdout.write('✗\n')
        console.error(`    Error: ${err.message}`)
        console.error('    Keeping existing translations for this batch.')
      }

      // Small delay between batches to be kind to rate limits
      if (i < batches.length - 1) await new Promise(r => setTimeout(r, 200))
    }

    // Write output
    const output = unflattenJson(allTranslated)
    writeJson(langPath, output)
    console.log(`  ✅ Wrote messages/${targetLang}.json`)
  }

  // Update cache with new hashes
  const newCache = { ...cache }
  for (const [key, val] of Object.entries(frFlat)) {
    newCache[key] = { hash: hash(val), updated: new Date().toISOString() }
  }
  // Remove cache entries for deleted keys
  for (const key of Object.keys(newCache)) {
    if (!frFlat[key]) delete newCache[key]
  }
  writeJson(CACHE_FILE, newCache)

  console.log('\n🎉 Translation complete!')
  console.log('   Edit messages/fr.json → run this script → ar.json and en.json update automatically')
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
