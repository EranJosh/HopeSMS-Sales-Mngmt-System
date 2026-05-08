import puppeteer from 'puppeteer'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

const url = process.argv[2] || 'http://localhost:5173'
const label = process.argv[3] ? `-${process.argv[3]}` : ''

const dir = './temporary screenshots'
if (!existsSync(dir)) mkdirSync(dir)

const existing = readdirSync(dir).filter(f => f.endsWith('.png'))
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean)
const next = nums.length ? Math.max(...nums) + 1 : 1

const filename = join(dir, `screenshot-${next}${label}.png`)

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Josh/.cache/puppeteer/chrome/win64-127.0.6533.88/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
await page.screenshot({ path: filename, fullPage: false })
await browser.close()

console.log(`Saved: ${filename}`)
