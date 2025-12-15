/**
 * 상품명에 따라 적절한 이미지를 반환하는 유틸리티 함수
 * imageUrls가 비어있을 때 사용하는 fallback 이미지 매핑
 */

// 사용 가능한 상품 이미지 목록
export const PRODUCT_IMAGES = {
  // 토마토 관련
  TOMATO: '/fresh-organic-cherry-tomatoes.jpg',
  TOMATO_ON_VINE: '/fresh-organic-cherry-tomatoes-on-vine.jpg',
  TOMATO_BASKET: '/organic-cherry-tomatoes-in-basket.jpg',
  TOMATO_CLOSE_UP: '/cherry-tomatoes-close-up.jpg',

  // 상추/채소 관련
  LETTUCE: '/fresh-organic-lettuce.png',
  LETTUCE_HARVEST: '/lettuce-harvest-korean-meal.jpg',

  // 딸기 관련
  STRAWBERRY: '/images/strawberries.png',
  STRAWBERRY_BASKET: '/fresh-strawberries-basket.jpg',

  // 감자 관련
  POTATO: '/fresh-organic-potatoes.jpg',

  // 사과 관련
  APPLE: '/images/apples.png',
  APPLE_PICKING: '/apple-picking-experience.jpg',

  // 당근 관련
  CARROT: '/fresh-organic-carrots.jpg',

  // 블루베리 관련
  BLUEBERRY: '/fresh-organic-blueberries.jpg',
  BLUEBERRY_JAM: '/blueberry-jam-making.jpg',

  // 브로콜리 관련
  BROCCOLI: '/fresh-organic-broccoli.jpg',

  // 추가 채소/야채 이미지
  ONION: '/fresh-organic-onion.jpg',
  GARLIC: '/fresh-organic-garlic.jpg',
  NAPA_CABBAGE: '/fresh-organic-napa-cabbage.jpg',
  CABBAGE: '/fresh-organic-cabbage.jpg',
  BELL_PEPPER: '/fresh-organic-bell-pepper.jpg',
  SPINACH: '/fresh-organic-spinach.jpg',
  RADISH: '/fresh-organic-radish.jpg',
  PUMPKIN: '/fresh-organic-pumpkin.jpg',
  SWEET_POTATO: '/fresh-organic-sweet-potato.jpg',
  CAULIFLOWER: '/fresh-organic-cauliflower.jpg',
  KALE: '/fresh-organic-kale.jpg',
  ASPARAGUS: '/fresh-organic-asparagus.jpg',

  // 버섯 이미지
  ENOKI_MUSHROOM: '/fresh-organic-enoki-mushroom.jpg',
  OYSTER_MUSHROOM: '/fresh-organic-oyster-mushroom.jpg',
  SHIITAKE_MUSHROOM: '/fresh-organic-shiitake-mushroom.jpg',
  KING_OYSTER_MUSHROOM: '/fresh-organic-king-oyster-mushroom.jpg',
  BUTTON_MUSHROOM: '/fresh-organic-button-mushroom.jpg',

  // 농장/체험 관련
  FARM_GREENHOUSE: '/sunny-farm-with-greenhouse.jpg',
  STRAWBERRY_FARM: '/strawberry-farm-greenhouse.jpg',
  STRAWBERRY_PICKING: '/strawberry-picking-farm-experience.jpg',
  POTATO_HARVEST: '/potato-harvesting-farm-experience.jpg',
  TOMATO_EXPERIENCE: '/tomato-harvesting-cooking-farm-experience.jpg',
} as const

// Fallback 이미지 목록 (매칭되지 않을 때 사용)
const FALLBACK_IMAGES = [
  PRODUCT_IMAGES.TOMATO,
  PRODUCT_IMAGES.LETTUCE,
  PRODUCT_IMAGES.STRAWBERRY,
  PRODUCT_IMAGES.POTATO,
  PRODUCT_IMAGES.APPLE,
  PRODUCT_IMAGES.CARROT,
  PRODUCT_IMAGES.BLUEBERRY,
  PRODUCT_IMAGES.BROCCOLI,
] as const

/**
 * 상품명에 따라 적절한 이미지를 반환합니다.
 * @param productName - 상품명
 * @param productId - 상품 ID (fallback 이미지 선택 시 일관성을 위해 사용)
 * @returns 이미지 경로
 */
export function getProductImage(productName: string, productId: string): string {
  const name = productName.toLowerCase()

  // 토마토 관련
  if (name.includes('토마토') || name.includes('tomato')) {
    return PRODUCT_IMAGES.TOMATO
  }

  // 상추 관련
  if (name.includes('상추') || name.includes('lettuce')) {
    return PRODUCT_IMAGES.LETTUCE
  }

  // 딸기 관련
  if (name.includes('딸기') || name.includes('strawberry')) {
    return PRODUCT_IMAGES.STRAWBERRY
  }

  // 감자 관련
  if (name.includes('감자') || name.includes('potato')) {
    return PRODUCT_IMAGES.POTATO
  }

  // 사과 관련
  if (name.includes('사과') || name.includes('apple')) {
    return PRODUCT_IMAGES.APPLE
  }

  // 당근 관련
  if (name.includes('당근') || name.includes('carrot')) {
    return PRODUCT_IMAGES.CARROT
  }

  // 블루베리 관련
  if (name.includes('블루베리') || name.includes('blueberry')) {
    return PRODUCT_IMAGES.BLUEBERRY
  }

  // 브로콜리 관련
  if (name.includes('브로콜리') || name.includes('broccoli')) {
    return PRODUCT_IMAGES.BROCCOLI
  }

  // 오이 관련
  if (name.includes('오이') || name.includes('cucumber')) {
    // 오이 전용 이미지가 없으므로 상추 이미지 사용
    return PRODUCT_IMAGES.LETTUCE
  }

  // 배추 관련
  if (name.includes('배추') || name.includes('napa cabbage')) {
    return PRODUCT_IMAGES.NAPA_CABBAGE
  }

  // 양파 관련
  if (name.includes('양파') || name.includes('onion')) {
    return PRODUCT_IMAGES.ONION
  }

  // 고추 관련
  if (name.includes('고추') || name.includes('chili') || name.includes('chile')) {
    // 고추 전용 이미지가 없으므로 토마토 이미지 사용
    return PRODUCT_IMAGES.TOMATO
  }

  // 귤/오렌지 관련
  if (
    name.includes('귤') ||
    name.includes('orange') ||
    name.includes('mandarin') ||
    name.includes('tangerine')
  ) {
    return PRODUCT_IMAGES.APPLE // 귤 전용 이미지가 없으므로 사과 이미지 사용
  }

  // 포도 관련
  if (name.includes('포도') || name.includes('grape')) {
    return PRODUCT_IMAGES.BLUEBERRY // 포도 전용 이미지가 없으므로 블루베리 이미지 사용
  }

  // 수박 관련
  if (name.includes('수박') || name.includes('watermelon')) {
    return PRODUCT_IMAGES.STRAWBERRY // 수박 전용 이미지가 없으므로 딸기 이미지 사용
  }

  // 참외 관련
  if (name.includes('참외') || name.includes('oriental melon')) {
    return PRODUCT_IMAGES.APPLE // 참외 전용 이미지가 없으므로 사과 이미지 사용
  }

  // 옥수수 관련
  if (name.includes('옥수수') || name.includes('corn') || name.includes('maize')) {
    return PRODUCT_IMAGES.POTATO // 옥수수 전용 이미지가 없으므로 감자 이미지 사용
  }

  // 버섯 관련
  if (name.includes('버섯') || name.includes('mushroom')) {
    return PRODUCT_IMAGES.BROCCOLI // 버섯 전용 이미지가 없으므로 브로콜리 이미지 사용
  }

  // 시금치 관련
  if (name.includes('시금치') || name.includes('spinach')) {
    return PRODUCT_IMAGES.SPINACH
  }

  // 양배추 관련
  if (name.includes('양배추') || (name.includes('cabbage') && !name.includes('napa'))) {
    return PRODUCT_IMAGES.CABBAGE
  }

  // 가지 관련
  if (name.includes('가지') || name.includes('eggplant') || name.includes('aubergine')) {
    // 가지 전용 이미지가 없으므로 토마토 이미지 사용
    return PRODUCT_IMAGES.TOMATO
  }

  // 호박 관련
  if (
    name.includes('호박') ||
    name.includes('pumpkin') ||
    name.includes('squash') ||
    name.includes('zucchini')
  ) {
    return PRODUCT_IMAGES.PUMPKIN
  }

  // 고구마 관련
  if (name.includes('고구마') || name.includes('sweet potato') || name.includes('yam')) {
    return PRODUCT_IMAGES.SWEET_POTATO
  }

  // 무 관련
  if (name.includes('무') || name.includes('radish') || name.includes('daikon')) {
    return PRODUCT_IMAGES.RADISH
  }

  // 파/대파 관련
  if (
    name.includes('파') ||
    name.includes('green onion') ||
    name.includes('scallion') ||
    name.includes('leek')
  ) {
    return PRODUCT_IMAGES.LETTUCE // 파 전용 이미지가 없으므로 상추 이미지 사용
  }

  // 마늘 관련
  if (name.includes('마늘') || name.includes('garlic')) {
    return PRODUCT_IMAGES.GARLIC
  }

  // 생강 관련
  if (name.includes('생강') || name.includes('ginger')) {
    return PRODUCT_IMAGES.CARROT // 생강 전용 이미지가 없으므로 당근 이미지 사용
  }

  // 쪽파/부추 관련
  if (
    name.includes('쪽파') ||
    name.includes('부추') ||
    name.includes('chive') ||
    name.includes('chives')
  ) {
    return PRODUCT_IMAGES.LETTUCE // 쪽파/부추 전용 이미지가 없으므로 상추 이미지 사용
  }

  // 미나리 관련
  if (name.includes('미나리') || name.includes('water dropwort') || name.includes('minari')) {
    return PRODUCT_IMAGES.LETTUCE // 미나리 전용 이미지가 없으므로 상추 이미지 사용
  }

  // 쑥갓 관련
  if (name.includes('쑥갓') || name.includes('crown daisy') || name.includes('chrysanthemum')) {
    return PRODUCT_IMAGES.LETTUCE // 쑥갓 전용 이미지가 없으므로 상추 이미지 사용
  }

  // 깻잎 관련
  if (name.includes('깻잎') || name.includes('perilla') || name.includes('sesame leaf')) {
    return PRODUCT_IMAGES.LETTUCE // 깻잎 전용 이미지가 없으므로 상추 이미지 사용
  }

  // 케일 관련
  if (name.includes('케일') || name.includes('kale')) {
    return PRODUCT_IMAGES.KALE
  }

  // 아스파라거스 관련
  if (name.includes('아스파라거스') || name.includes('asparagus')) {
    return PRODUCT_IMAGES.ASPARAGUS
  }

  // 콜리플라워 관련
  if (name.includes('콜리플라워') || name.includes('cauliflower')) {
    return PRODUCT_IMAGES.CAULIFLOWER
  }

  // 피망/파프리카 관련
  if (
    name.includes('피망') ||
    name.includes('파프리카') ||
    name.includes('bell pepper') ||
    name.includes('paprika')
  ) {
    return PRODUCT_IMAGES.BELL_PEPPER
  }

  // 버섯 관련 (더 세분화)
  if (name.includes('팽이버섯') || name.includes('enoki')) {
    return PRODUCT_IMAGES.ENOKI_MUSHROOM
  }
  if (name.includes('느타리') || name.includes('oyster mushroom')) {
    return PRODUCT_IMAGES.OYSTER_MUSHROOM
  }
  if (name.includes('표고') || name.includes('shiitake')) {
    return PRODUCT_IMAGES.SHIITAKE_MUSHROOM
  }
  if (name.includes('새송이') || name.includes('king oyster')) {
    return PRODUCT_IMAGES.KING_OYSTER_MUSHROOM
  }
  if (name.includes('양송이') || name.includes('button mushroom')) {
    return PRODUCT_IMAGES.BUTTON_MUSHROOM
  }
  if (name.includes('버섯') || name.includes('mushroom')) {
    // 일반 버섯은 브로콜리 이미지 사용
    return PRODUCT_IMAGES.BROCCOLI
  }

  // 뿌리채소 카테고리 관련 (더 세분화)
  if (
    name.includes('뿌리') ||
    name.includes('root') ||
    name.includes('순무') ||
    name.includes('turnip') ||
    name.includes('비트') ||
    name.includes('beet') ||
    name.includes('우엉') ||
    name.includes('burdock')
  ) {
    return PRODUCT_IMAGES.CARROT // 뿌리채소 전용 이미지가 없으므로 당근 이미지 사용
  }

  // 채소 카테고리 일반 매칭 (위에서 매칭되지 않은 경우)
  if (name.includes('채소') || name.includes('vegetable') || name.includes('야채')) {
    // 채소 카테고리면 상추나 브로콜리 중 하나 선택
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % 2 === 0 ? PRODUCT_IMAGES.LETTUCE : PRODUCT_IMAGES.BROCCOLI
  }

  // 매칭되지 않으면 상품 ID를 기반으로 일관된 랜덤 선택
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length]
}

/**
 * imageUrls가 비어있을 때 상품명에 맞는 이미지를 반환합니다.
 * @param productName - 상품명
 * @param productId - 상품 ID
 * @param imageUrls - 기존 이미지 URL 배열
 * @returns 이미지 URL 배열 (imageUrls가 있으면 그대로, 없으면 fallback 이미지)
 */
export function getProductImages(
  productName: string,
  productId: string,
  imageUrls: string[] = []
): string[] {
  if (imageUrls.length > 0) {
    return imageUrls
  }

  const fallbackImage = getProductImage(productName, productId)
  return [fallbackImage]
}
