import fs from 'fs'
// 1x1 black PNG bytes — placeholder only, replace with real assets in prod
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63f8cfc0d000010000020001a17b85cb0000000049454e44ae426082', 'hex')
fs.mkdirSync('public/icons', { recursive: true })
fs.writeFileSync('public/icons/icon-192.png', png)
fs.writeFileSync('public/icons/icon-512.png', png)
fs.writeFileSync('public/icons/icon-maskable.png', png)
console.log('Generated 3 placeholder PWA icons in public/icons/')
