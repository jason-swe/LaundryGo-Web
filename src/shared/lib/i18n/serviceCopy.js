const SERVICE_COPY_KEYS_BY_LABEL = {
  'Everyday Wear (per kg)': 'everydayWear',
  'Bedding & Linen (per kg)': 'beddingLinen',
  'Two-piece Suit': 'twoPieceSuit',
  'Dress Shirt (Pressed)': 'dressShirtPressed',
  'Winter Coat': 'winterCoat',
  'Individual Item': 'individualItem',
}

export const getServiceCopyKey = (label) => SERVICE_COPY_KEYS_BY_LABEL[label] || null

export const translateServiceCopy = (t, label, field, fallback) => {
  const key = getServiceCopyKey(label)
  if (!key) return fallback

  const translationKey = `shopDetail.serviceItems.${key}.${field}`
  const translated = t(translationKey)
  return translated === translationKey ? fallback : translated
}
