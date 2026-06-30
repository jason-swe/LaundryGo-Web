export const SHOP_REMOTE_IMAGES = [
  'https://i.pinimg.com/1200x/9e/c8/9c/9ec89c8b1c5a689939d4580499b2058b.jpg',
  'https://i.pinimg.com/736x/98/04/3c/98043c7a207d69426073f7ba7b765875.jpg',
  'https://i.pinimg.com/1200x/33/3a/60/333a6009e79964ef5c625db241ce3460.jpg',
  'https://i.pinimg.com/736x/74/94/32/749432cce97b092b029832b4da30dd10.jpg',
  'https://i.pinimg.com/1200x/20/eb/04/20eb04a2b0a36ae97e5e2277bd45cab0.jpg',
  'https://i.pinimg.com/736x/8c/74/7d/8c747df743c15b4262c3527e1cb00e01.jpg',
  'https://i.pinimg.com/736x/9e/0e/36/9e0e361830066776fcba05e6dec66c7d.jpg',
  'https://i.pinimg.com/736x/6f/64/1e/6f641e66f67ccdde79449471100c4d02.jpg',
  'https://i.pinimg.com/1200x/16/2f/1b/162f1b67190d53de00e1fae1a5aaddb1.jpg',
]

export const SHOP_LOCAL_IMAGES = [
  '/laundryshop1.jpg',
  '/laundryshop2.jpg',
  '/laundryshop3.jpg',
  '/laundryshop4.jpg',
  '/laundryshop5.jpg',
  '/laundryshop6.jpg',
  '/laundryshop7.jpg',
  '/laundryshop8.jpg',
  '/laundryshop9.jpg',
  '/laundryshop10.jpg',
  '/laundryshop11.jpg',
  '/laundryshop12.jpg',
]

const SHOP_IMAGE_POOL = [...SHOP_REMOTE_IMAGES, ...SHOP_LOCAL_IMAGES]

const normalizeShopId = (shopId) => String(shopId || '').trim()

const getShopIndex = (shopId, fallbackIndex = 0) => {
  const id = normalizeShopId(shopId)
  const numericId = Number(id)
  if (Number.isFinite(numericId) && numericId > 0) return numericId - 1

  const idNumberMatch = id.match(/(\d+)$/)
  if (idNumberMatch) {
    const matchedNumber = Number(idNumberMatch[1])
    if (Number.isFinite(matchedNumber) && matchedNumber > 0) return matchedNumber - 1
  }

  return fallbackIndex
}

export const getShopFallbackImage = (shopId, fallbackIndex = 0) => {
  const imageIndex = getShopIndex(shopId, fallbackIndex)
  return SHOP_IMAGE_POOL[Math.abs(imageIndex) % SHOP_IMAGE_POOL.length]
}

export const getShopCoverImage = (shop, fallbackIndex = 0) => {
  const imageUrl = shop?.imageUrl || shop?.coverImageUrl || shop?.image || ''
  return {
    image: imageUrl || getShopFallbackImage(shop?.id, fallbackIndex),
    hasRealImage: Boolean(imageUrl),
  }
}
