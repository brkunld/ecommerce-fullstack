import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı tohumlama (seed) başlatılıyor...');

  // Temizleme
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Şifreler
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const customerPassword = await bcrypt.hash('Customer123!', 10);

  // Kullanıcılar
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      name: 'Yönetici Burak',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+90 555 111 2233',
      address: 'Maslak, Sarıyer, İstanbul'
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@ecommerce.com',
      name: 'Ahmet Yılmaz',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+90 555 444 5566',
      address: 'Kadıköy, Moda Cad. No:14, İstanbul'
    }
  });

  // Müşteri için boş sepet
  await prisma.cart.create({
    data: {
      userId: customer.id
    }
  });

  console.log('✅ Kullanıcılar oluşturuldu:');
  console.log(`   Admin: admin@ecommerce.com (Şifre: Admin123!)`);
  console.log(`   Müşteri: customer@ecommerce.com (Şifre: Customer123!)`);

  // Kategoriler
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Elektronik & Teknoloji',
        slug: 'elektronik-teknoloji',
        description: 'En yeni akıllı telefonlar, bilgisayarlar ve ses sistemleri.',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Moda & Giyim',
        slug: 'moda-giyim',
        description: 'Tarzınızı yansıtacak en şık kıyafet ve aksesuarlar.',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Ev & Yaşam',
        slug: 'ev-yasam',
        description: 'Konforlu, modern ev dekorasyon ve aydınlatma ürünleri.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Spor & Outdoor',
        slug: 'spor-outdoor',
        description: 'Fitness, doğa yürüyüşü ve spor ekipmanları.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
      }
    })
  ]);

  const [elektronik, moda, ev, spor] = categories;
  console.log(`✅ ${categories.length} kategori eklendi.`);

  // Ürünler
  const productsData = [
    {
      name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
      slug: 'sony-wh-1000xm5-kablosuz-kulaklik',
      description: 'Endüstri lideri gürültü engelleme, kristal netliğinde eller serbest arama ve 30 saat pil ömrü ile kusursuz ses deneyimi.',
      price: 14499.90,
      stock: 35,
      featured: true,
      categoryId: elektronik.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Apple MacBook Pro 16" M3 Max',
      slug: 'apple-macbook-pro-16-m3-max',
      description: 'Profesyoneller için üst düzey performans. Liquid Retina XDR ekran ve 36 GB birleşik bellek ile sınırları zorlayın.',
      price: 119999.00,
      stock: 12,
      featured: true,
      categoryId: elektronik.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Mekanik RGB Oyuncu Klavyesi',
      slug: 'mekanik-rgb-oyuncu-klavyesi',
      description: 'Özelleştirilebilir tuş anahtarları, alüminyum gövde ve dinamik RGB aydınlatma ile ultra düşük gecikmeli tepki süresi.',
      price: 3250.00,
      stock: 45,
      featured: false,
      categoryId: elektronik.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Minimalist Deri Kol Saati',
      slug: 'minimalist-deri-kol-saati',
      description: 'Safir kristal cam, hakiki İtalyan deri kordon ve Japon kuvars mekanizma ile zamansız bir zarafet.',
      price: 4890.00,
      stock: 28,
      featured: true,
      categoryId: moda.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Premium Yün Karışımlı Trençkot',
      slug: 'premium-yun-karisimli-trenckot',
      description: 'Modern kesim, su itici kumaş ve sıcak tutan yün astarı ile sonbahar ve kış aylarının vazgeçilmezi.',
      price: 7650.00,
      stock: 18,
      featured: false,
      categoryId: moda.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'İskandinav Ahşap Çalışma Masası Lambası',
      slug: 'iskandinav-ahsap-calisma-masasi-lambasi',
      description: 'Doğal meşe ahşap ve mat metal detaylar, kısılabilir sıcak LED ışık ile göz yormayan çalışma ortamı.',
      price: 1890.00,
      stock: 50,
      featured: true,
      categoryId: ev.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'El Yapımı Seramik Kahve Fincan Seti (4\'lü)',
      slug: 'el-yapimi-seramik-kahve-fincan-seti',
      description: 'Usta zanaatkarlar tarafından elde şekillendirilmiş, bulaşık makinesinde yıkanabilir rustik espresso fincanları.',
      price: 1250.00,
      stock: 30,
      featured: false,
      categoryId: ev.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Pro Mat Kaymaz Yoga & Egzersiz Matı',
      slug: 'pro-mat-kaymaz-yoga-egzersiz-mati',
      description: 'Çevre dostu TPE materyal, 6mm optimum kalınlık ve eklem koruyucu çift taraflı kaymaz doku.',
      price: 1450.00,
      stock: 60,
      featured: true,
      categoryId: spor.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
      ])
    },
    {
      name: 'Termo Yalıtımlı Çelik Su Matarası 1L',
      slug: 'termo-yalitimli-celik-su-matarasi-1l',
      description: 'Çift katmanlı vakumlu paslanmaz çelik, 24 saat soğuk ve 12 saat sıcak tutma performansı.',
      price: 890.00,
      stock: 85,
      featured: false,
      categoryId: spor.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
      ])
    }
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }

  console.log(`✅ ${productsData.length} ürün başarıyla eklendi.`);

  // Örnek bir sipariş ekleyelim
  const sampleProduct = await prisma.product.findFirst();
  if (sampleProduct) {
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: customer.id,
        status: 'PREPARING',
        totalAmount: sampleProduct.price,
        shippingAddress: 'Kadıköy, Moda Cad. No:14, İstanbul',
        contactPhone: '+90 555 444 5566',
        note: 'Lütfen zile basmadan önce arayınız.',
        items: {
          create: {
            productId: sampleProduct.id,
            quantity: 1,
            price: sampleProduct.price
          }
        }
      }
    });
    console.log('✅ Örnek sipariş oluşturuldu.');
  }

  console.log('🎉 Veritabanı tohumlama başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
