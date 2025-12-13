'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  Package,
  Users,
  Clock,
  Shield,
  Leaf,
  ArrowLeft,
  Heart,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function FarmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)

  const farm = {
    id: 1,
    name: '햇살농장',
    location: '충남 당진',
    region: '충청',
    images: [
      '/sunny-farm-with-greenhouse.jpg',
      '/farm-greenhouse-interior.jpg',
      '/farm-field-landscape.jpg',
    ],
    rating: 4.8,
    reviews: 124,
    products: 12,
    experiences: 3,
    specialties: ['유기농 토마토', '무농약 상추', '친환경 오이'],
    certification: ['유기농 인증', 'GAP 인증', '무농약 인증'],
    phone: '010-1234-5678',
    email: 'sunshine@barofarm.com',
    description:
      '햇살농장은 2010년부터 유기농 농산물을 재배해온 경험 많은 농장입니다. 화학비료와 농약을 전혀 사용하지 않고 자연의 힘으로 건강한 농산물을 키워냅니다. 가족이 함께 운영하는 소규모 농장으로, 각 상품에 정성을 담아 재배하고 있습니다.',
    established: '2010년',
    area: '약 3,000㎡',
    mainProducts: ['토마토', '상추', '오이', '당근'],
    farmingMethod: '유기농 재배',
    delivery: '수확 후 당일 배송',
  }

  const farmProducts = [
    {
      id: 1,
      name: '유기농 방울토마토',
      price: 8500,
      originalPrice: 12000,
      image: '/fresh-organic-cherry-tomatoes.jpg',
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: '무농약 상추',
      price: 5000,
      originalPrice: 7000,
      image: '/fresh-organic-lettuce.png',
      rating: 4.9,
      reviews: 89,
    },
    {
      id: 3,
      name: '친환경 오이',
      price: 6000,
      originalPrice: 8000,
      image: '/fresh-organic-cucumber.jpg',
      rating: 4.7,
      reviews: 67,
    },
    {
      id: 4,
      name: '유기농 당근',
      price: 7000,
      originalPrice: 9000,
      image: '/fresh-organic-carrots.jpg',
      rating: 4.9,
      reviews: 95,
    },
  ]

  const farmExperiences = [
    {
      id: 1,
      title: '토마토 수확 & 요리',
      price: 35000,
      duration: '4시간',
      capacity: '최대 8명',
      image: '/tomato-harvesting-cooking-farm-experience.jpg',
      rating: 4.9,
      reviews: 45,
    },
    {
      id: 2,
      title: '상추 수확 체험',
      price: 20000,
      duration: '2시간',
      capacity: '최대 10명',
      image: '/lettuce-harvesting-experience.jpg',
      rating: 4.8,
      reviews: 32,
    },
    {
      id: 3,
      title: '농장 투어 & 시식',
      price: 15000,
      duration: '1.5시간',
      capacity: '최대 15명',
      image: '/farm-tour-tasting.jpg',
      rating: 4.7,
      reviews: 28,
    },
  ]

  const farmReviews = [
    {
      id: 1,
      author: '김**',
      rating: 5,
      date: '2024.12.01',
      content:
        '정말 신뢰할 수 있는 농장입니다. 상품도 신선하고 배송도 빠르네요. 계속 주문할 예정입니다!',
      helpful: 24,
    },
    {
      id: 2,
      author: '이**',
      rating: 5,
      date: '2024.11.28',
      content: '체험 프로그램도 재밌고 농장 주인분도 친절하세요. 아이들이 정말 좋아했습니다.',
      helpful: 18,
    },
    {
      id: 3,
      author: '박**',
      rating: 4,
      date: '2024.11.25',
      content:
        '유기농 인증도 받아서 믿을 수 있고, 상품 품질도 좋습니다. 다만 배송비가 조금 부담스러워요.',
      helpful: 12,
    },
  ]

  const relatedFarms = [
    {
      id: 2,
      name: '초록들판',
      location: '경기 양평',
      image: '/farm-2.jpg',
      rating: 4.9,
      reviews: 89,
    },
    {
      id: 3,
      name: '달콤농원',
      location: '전북 완주',
      image: '/farm-3.jpg',
      rating: 5.0,
      reviews: 203,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      {/* Farm Info Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <Image
                  src={farm.images[selectedImage] || '/placeholder.svg'}
                  alt={farm.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {farm.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${farm.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Details */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{farm.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* TODO: 찜하기 기능 추가 예정 */}
                  {/* <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button> */}
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {/* TODO: 평점 및 리뷰 기능 추가 예정 */}
                {/* <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-xl font-semibold">{farm.rating}</span>
                  <span className="text-muted-foreground">({farm.reviews})</span>
                </div>
                <div className="h-4 w-px bg-border" /> */}
                <div className="text-sm text-muted-foreground">
                  판매 상품 <span className="font-semibold text-foreground">{farm.products}개</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="text-sm text-muted-foreground">
                  체험 프로그램{' '}
                  <span className="font-semibold text-foreground">{farm.experiences}개</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {farm.certification.map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{farm.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{farm.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">설립년도</div>
                  <div className="text-lg font-semibold">{farm.established}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">농장 규모</div>
                  <div className="text-lg font-semibold">{farm.area}</div>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <Link href={`/products?farm=${farm.id}`}>
                    <Package className="h-4 w-4 mr-2" />
                    상품 보기
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/experiences?farm=${farm.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    체험 예약
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Farm Description */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">농장 소개</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{farm.description}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  주요 상품
                </h3>
                <div className="flex flex-wrap gap-2">
                  {farm.mainProducts.map((product) => (
                    <Badge key={product} variant="outline">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  재배 방식
                </h3>
                <p className="text-muted-foreground">{farm.farmingMethod}</p>
              </div>
            </div>
          </Card>

          {/* Products Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">판매 상품</h2>
              <Button variant="outline" asChild>
                <Link href={`/products?farm=${farm.id}`}>전체보기</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {farmProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      {/* TODO: 평점 및 리뷰 기능 추가 예정 */}
                      {/* <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">({product.reviews})</span>
                      </div> */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {product.price.toLocaleString()}원
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Experiences Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">체험 프로그램</h2>
              <Button variant="outline" asChild>
                <Link href={`/experiences?farm=${farm.id}`}>전체보기</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {farmExperiences.map((experience) => (
                <Card
                  key={experience.id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/experiences/${experience.id}`}>
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <Image
                        src={experience.image || '/placeholder.svg'}
                        alt={experience.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold mb-3">{experience.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{experience.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{experience.capacity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-primary">
                          {experience.price.toLocaleString()}원
                        </div>
                        {/* TODO: 평점 및 리뷰 기능 추가 예정 */}
                        {/* <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{experience.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({experience.reviews})
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* TODO: 리뷰 섹션 - 나중에 추가될 예정 */}
          {/* Reviews Section */}
          {/* <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">리뷰 ({farm.reviews})</h2>
            <div className="space-y-6">
              {farmReviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{review.author}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-primary text-primary'
                                : 'fill-muted text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{review.date}</div>
                  </div>
                  <p className="text-muted-foreground mb-3">{review.content}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8">
                      도움됨 {review.helpful}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              리뷰 더보기
            </Button>
          </Card> */}

          {/* Related Farms */}
          <div>
            <h2 className="text-2xl font-bold mb-6">비슷한 농장</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedFarms.map((relatedFarm) => (
                <Card
                  key={relatedFarm.id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/farms/${relatedFarm.id}`}>
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <Image
                        src={relatedFarm.image || '/placeholder.svg'}
                        alt={relatedFarm.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold mb-1">{relatedFarm.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>{relatedFarm.location}</span>
                      </div>
                      {/* TODO: 평점 및 리뷰 기능 추가 예정 */}
                      {/* <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{relatedFarm.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({relatedFarm.reviews})
                        </span>
                      </div> */}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
