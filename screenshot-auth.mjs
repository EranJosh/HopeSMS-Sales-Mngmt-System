import puppeteer from 'puppeteer'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
const dir = './temporary screenshots'
if (!existsSync(dir)) mkdirSync(dir)
function nextN(label) {
  const existing = readdirSync(dir).filter(f => f.endsWith('.png'))
  const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean)
  return join(dir, `screenshot-${(nums.length ? Math.max(...nums) + 1 : 1)}-${label}.png`)
}
const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Josh/.cache/puppeteer/chrome/win64-127.0.6533.88/chrome-win64/chrome.exe',
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
// Login page (wait for framer-motion animations to settle)
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 3500))
await page.screenshot({ path: nextN('login-new') }); console.log('login done')
// Register page
await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 3200))
await page.screenshot({ path: nextN('register-new') }); console.log('register done')
await browser.close()
