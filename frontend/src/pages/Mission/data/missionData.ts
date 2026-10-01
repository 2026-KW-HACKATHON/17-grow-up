export interface MissionData {
  id: string
  title: string
  category: string
  point: number
  carbon: number
  image: string
  backgroundColor: string
  description: string
  availablePlace: string
}

export const missions: MissionData[] = [
  {
    id: 'tumbler',
    title: '텀블러 사용하기',
    category: '카페',
    point: 50,
    carbon: 230,
    image: '/tumbler.svg',
    backgroundColor: '#E9F4EC',
    description: '카페에서 음료를 구매할 때 개인 텀블러를 사용해요.',
    availablePlace: '월계1동 제휴 카페 전체',
  },
  {
    id: 'shopping-bag',
    title: '장바구니 사용하기',
    category: '마트 · 편의점',
    point: 50,
    carbon: 180,
    image: '/shopping-bag.svg',
    backgroundColor: '#FFF5E0',
    description: '장보기 시 일회용 봉투 대신 장바구니를 사용해요.',
    availablePlace: '월계1동 제휴 마트 · 편의점 전체',
  },
  {
    id: 'container',
    title: '포장 시 다회용기 사용하기',
    category: '음식점',
    point: 50,
    carbon: 200,
    image: '/container.svg',
    backgroundColor: '#EDF3FC',
    description: '음식을 포장할 때 일회용 용기 대신 다회용기를 사용해요.',
    availablePlace: '월계1동 제휴 음식점 전체',
  },
  {
    id: 'empty-plate',
    title: '음식 남기지 않기',
    category: '음식점',
    point: 50,
    carbon: 150,
    image: '/empty-plate.svg',
    backgroundColor: '#FCE8E5',
    description: '먹을 만큼만 주문하고 음식을 남기지 않아요.',
    availablePlace: '월계1동 제휴 음식점 전체',
  },
  {
    id: 'no-disposable',
    title: '일회용 수저·빨대 받지 않기',
    category: '카페 · 음식점',
    point: 50,
    carbon: 120,
    image: '/no-disposable.svg',
    backgroundColor: '#DFE5FB',
    description: '일회용 수저와 빨대 대신 다회용품을 사용해요.',
    availablePlace: '월계1동 제휴 카페 · 음식점 전체',
  },
]
