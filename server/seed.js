import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Inline data (previously imported from src/data/initialData.js which is not available on production)
const company = {
  name: 'Conical Hat-Workshop group',
  tagline: 'The art of Vietnamese conical hat making',
  shortIntro:
    'We design hands-on Vietnamese cultural experiences focused on the art of conical hat making. Join our workshops for travellers, teams and remote communities through offline workshops, online sessions and curated DIY kits.',
  mission:
    'To make culture easier to experience, share and remember through beautiful, well-organised and human-led activities.',
  vision:
    'To become a trusted Vietnam-based experience partner for travellers, companies and global communities.',
  hotline: '0778007266',
  email: 'hello@experiencestudio.vn',
  address: 'Da Nang, Vietnam',
  taxCode: '',
  zaloUrl: 'https://zalo.me/0778007266',
  whatsappUrl: 'https://wa.me/84778007266',
  messengerUrl: 'https://m.me/645407261991659',
  lineUrl: '0778007266',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61576310616366&locale=vi_VN',
  instagramUrl: 'https://www.instagram.com/conicalhat.workshopgroup/',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.9880785194164!2d106.65037437604586!3d10.749110089403888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e82110c20ab%3A0x6b245a4a58b5bd82!2sConical%20hat-workshop%20group!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s'
};

const categories = [
  { key: 'offline', name: 'Offline Experience', description: 'Join-in workshops, private events, team building, corporate sessions and travel retreats.' },
  { key: 'online', name: 'Online Workshop', description: 'Live instructor-led workshops via Zoom or Google Meet, with optional DIY kit delivery.' },
  { key: 'diy', name: 'DIY Experience Kits', description: 'Curated cultural kits with guides, QR instructions and optional online support.' }
];

const achievements = [
  '60+ curated workshops and cultural experiences delivered',
  'Trusted by travel partners, corporate teams and event planners',
  'Offline, online and DIY kit formats available',
  'Customisable programs for local and international audiences'
];

const services = [
  {
    id: 'svc-007',
    slug: 'vietnamese-homestyle-cooking-class',
    category: 'offline',
    title: 'Vietnamese Homestyle Cooking Class',
    subtitle: 'Learn to cook authentic Vietnamese homestyle dishes.',
    price: 'From $35 / person',
    duration: '3 hours',
    groupSize: '1–10 guests',
    location: 'Hoa Kitchen, Ho Chi Minh City',
    image: '/pics/cooking_class.png',
    gallery: ['/pics/cooking_class.png', '/pics/product1.jpg'],
    highlights: ['Local market tour', 'Hands-on cooking experience', 'Enjoy your own meal', 'Take-home recipes'],
    description: 'Immerse yourself in Vietnamese culinary culture at Hoa Kitchen. Start with a vibrant local market tour to select the freshest ingredients, then head back to the kitchen to learn traditional cooking techniques from local chefs. You will prepare classic Vietnamese homestyle dishes and enjoy the delicious meal you have cooked in a warm, welcoming environment.',
    includes: ['All fresh ingredients', 'Professional cooking instructor', 'Market tour', 'Lunch/Dinner', 'Recipe book'],
    suitableFor: ['Food lovers', 'Tourists', 'Families', 'Couples'],
    featured: true,
    experienceTags: ['Cultural', 'Hands-on'],
    bookingTags: ['Free cancellation', 'Small group'],
    priorityTags: ['Best seller']
  },
  {
    id: 'svc-008',
    slug: 'miniature-ao-dai-creation-workshop',
    category: 'offline',
    title: 'Miniature Ao Dai Creation Workshop',
    subtitle: 'Craft your own beautiful miniature traditional Ao Dai.',
    price: 'From $25 / person',
    duration: '2 hours',
    groupSize: '1–15 guests',
    location: 'Ho Chi Minh City Studio',
    image: '/pics/ao_dai_workshop.png',
    gallery: ['/pics/ao_dai_workshop.png', '/pics/product2.jpg'],
    highlights: ['Learn about Ao Dai history', 'Hands-on silk crafting', 'Take home your souvenir'],
    description: 'Discover the elegance of the Vietnamese traditional dress. In this hands-on workshop, you will learn about the fascinating history of the Ao Dai and craft your own beautiful miniature version using premium, colorful Vietnamese silk to take home as a unique souvenir.',
    includes: ['Silk fabrics & sewing materials', 'Expert instructor', 'Your miniature Ao Dai souvenir', 'Vietnamese tea'],
    suitableFor: ['Cultural enthusiasts', 'Families', 'Solo travelers'],
    featured: true,
    experienceTags: ['Cultural', 'Local artisan'],
    bookingTags: ['Instant confirmation'],
    priorityTags: ['Signature']
  },
  {
    id: 'svc-009',
    slug: 'traditional-lion-head-crafting',
    category: 'offline',
    title: 'Traditional Lion Head Crafting Workshop',
    subtitle: 'Decorate a mini lion head and hear stories of the lion dance.',
    price: 'From $20 / person',
    duration: '1.5 hours',
    groupSize: '1–20 guests',
    location: 'Ho Chi Minh City Studio',
    image: '/pics/lion_head_craft.png',
    gallery: ['/pics/lion_head_craft.png', '/pics/product3.jpg'],
    highlights: ['Cultural storytelling', 'Creative painting', 'Take home souvenir'],
    description: 'Dive into the vibrant world of Vietnamese lion dancing. Listen to captivating stories about the tradition while decorating your very own miniature paper maché lion head with vibrant colors and patterns. A perfect hands-on cultural experience for all ages.',
    includes: ['Mini lion head', 'Painting materials & brushes', 'Storytelling session', 'Instructor'],
    suitableFor: ['Families', 'Kids', 'Tourists'],
    featured: true,

    // New Fields
    groupName: 'Cultural Crafting',
    shortDescription: 'Dive into the vibrant world of Vietnamese lion dancing by decorating a miniature paper maché lion head.',
    fullDescription: 'Discover the rich history behind the traditional Vietnamese lion dance. In this immersive workshop, you will learn the meanings behind the vivid colors and expressions of the lion head. Following a brief cultural storytelling session, you will get hands-on and paint your own miniature lion head to take home as a memorable souvenir.',
    instructorDescription: 'Local artisan specialized in festive crafts',
    languages: ['English', 'Vietnamese'],
    cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund',
    reservePolicy: 'Keep your travel plans flexible — book your spot and pay nothing today',
    meetingPointTitle: 'The Experience Studio, HCMC',
    meetingPointDescription: 'Our studio is located on the 2nd floor. Please arrive 10 minutes before the workshop starts.',
    whatToBring: ['Comfortable clothing', 'A creative mindset'],
    knowBeforeYouGo: ['Suitable for children aged 5+', 'Aprons are provided to protect your clothes'],
    experienceTags: ['Hands-on', 'Cultural', 'Family friendly'],
    bookingTags: ['Instant confirmation', 'Reserve now & pay later'],
    priorityTags: ['Family favorite', 'Signature'],

    packages: [
      {
        name: 'Standard Experience',
        priceLabel: '$20 / person',
        price: 20,
        currency: 'USD',
        description: 'Includes a standard size mini lion head and all painting materials.',
        duration: '1.5 hours',
        groupSize: 'Up to 15 people',
        sortOrder: 1
      },
      {
        name: 'Premium Experience',
        priceLabel: '$35 / person',
        price: 35,
        currency: 'USD',
        description: 'Includes a large deluxe lion head, premium gold-leaf paints, and a complimentary Vietnamese iced coffee.',
        duration: '2 hours',
        groupSize: 'Up to 10 people',
        sortOrder: 2
      }
    ],
    reviews: [
      {
        reviewerName: 'Sarah M.',
        reviewerCountry: 'Australia',
        rating: 5,
        content: 'Absolutely loved this workshop! The instructor was so patient with the kids and the storytelling part really brought the culture to life. The lion heads we painted look amazing in our living room.',
        reviewDate: 'Oct 2023'
      },
      {
        reviewerName: 'David K.',
        reviewerCountry: 'USA',
        rating: 5,
        content: 'A fantastic way to spend an afternoon in HCMC. Highly recommended for anyone wanting a break from the usual tourist spots.',
        reviewDate: 'Nov 2023'
      }
    ]
  },
  {
    id: 'svc-010',
    slug: 'vietnamese-butterfly-parasol',
    category: 'offline',
    title: 'Vietnamese Butterfly Parasol Workshop',
    subtitle: 'Paint and assemble a traditional butterfly parasol.',
    price: 'From $22 / person',
    duration: '2 hours',
    groupSize: '1–15 guests',
    location: 'Ho Chi Minh City Studio',
    image: '/pics/parasol_workshop.png',
    gallery: ['/pics/parasol_workshop.png', '/pics/product4.jpg'],
    highlights: ['Traditional techniques', 'Creative painting', 'Take home parasol'],
    description: 'Learn the delicate art of crafting a Vietnamese butterfly parasol. Paint your own designs and assemble the bamboo and paper parasol under the guidance of local artisans. A relaxing and rewarding workshop resulting in a stunning piece of art.',
    includes: ['Bamboo frame & paper', 'Paints and tools', 'Instructor guidance'],
    suitableFor: ['Art lovers', 'Families', 'Tourists'],
    featured: false
  },
  {
    id: 'svc-011',
    slug: 'vietnamese-herbal-sachet',
    category: 'offline',
    title: 'Vietnamese Herbal Sachet Workshop',
    subtitle: 'Create a fragrant herbal sachet using traditional Vietnamese herbs.',
    price: 'From $15 / person',
    duration: '1 hour',
    groupSize: '1–20 guests',
    location: 'Ho Chi Minh City Studio',
    image: '/pics/herbal_sachet.png',
    gallery: ['/pics/herbal_sachet.png', '/pics/product5.jpg'],
    highlights: ['Learn about traditional herbs', 'Hands-on mixing', 'Take home sachet'],
    description: 'Discover the therapeutic properties of Vietnamese herbs. Mix your own custom blend of fragrant dried herbs and spices to create a soothing sachet perfect for your wardrobe or car, while learning about traditional Vietnamese natural wellness.',
    includes: ['Aromatic herbs & spices', 'Rustic linen sachet bags', 'Wellness instructor'],
    suitableFor: ['Wellness enthusiasts', 'Families', 'Quick activities'],
    featured: false
  },
  {
    id: 'svc-012',
    slug: 'eco-crafting-recycled-material',
    category: 'offline',
    title: 'Eco Crafting Workshop with Recycled Material',
    subtitle: 'Turn recycled materials into beautiful handmade crafts.',
    price: 'From $18 / person',
    duration: '2 hours',
    groupSize: '1–20 guests',
    location: 'Ho Chi Minh City Studio',
    image: '/pics/eco_crafting.png',
    gallery: ['/pics/eco_crafting.png', '/pics/product6.jpg'],
    highlights: ['Sustainable crafting', 'Creative reuse', 'Take home your craft'],
    description: 'Join our eco-friendly workshop and learn how to transform everyday recycled materials into beautiful, functional handmade items. A fun, sustainable activity that promotes environmental awareness while sparking your creativity.',
    includes: ['Recycled materials', 'Crafting tools', 'Instructor'],
    suitableFor: ['Eco-conscious travelers', 'Families', 'Team building'],
    featured: false
  }
];

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Travel Blogger',
    comment: '"Absolutely loved the conical hat making workshop! The artisans were incredibly patient and I learned so much about Vietnamese culture."',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    name: 'Michael Chen',
    role: 'Corporate Team Leader',
    comment: '"We booked a private team building session and it was the highlight of our company retreat in Da Nang. Highly recommended!"',
    avatar: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    name: 'Emma Dubois',
    role: 'DIY Enthusiast',
    comment: '"Ordered the DIY kit to France and it arrived perfectly. The video instructions were clear and I had a wonderful afternoon crafting."',
    avatar: 'https://i.pravatar.cc/150?u=emma'
  }
];

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient({});

async function main() {
  console.log(`Start seeding...`);

  const isProduction = process.env.NODE_ENV === 'production';
  const allowDestructive = process.env.ALLOW_DESTRUCTIVE_SEED === 'true';

  const serviceCount = await prisma.service.count();

  if (serviceCount > 0 && !allowDestructive) {
    console.log(`Database already contains ${serviceCount} services. Skipping seed.`);
    console.log('Set ALLOW_DESTRUCTIVE_SEED=true to force re-seed.');
    return;
  }

  if (serviceCount > 0 && allowDestructive) {
    console.log('[DESTRUCTIVE SEED] Clearing existing data...');
    await prisma.serviceReview.deleteMany();
    await prisma.servicePackage.deleteMany();
    await prisma.service.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.teamMember.deleteMany();
    console.log('Cleared existing data.');
  }

  for (const s of services) {
    const service = await prisma.service.create({
      data: {
        id: s.id,
        slug: s.slug,
        category: s.category,
        title: s.title,
        subtitle: s.subtitle,
        price: s.price,
        duration: s.duration,
        groupSize: s.groupSize,
        location: s.location,
        imageUrl: s.imageUrl || s.image || null,
        imagePublicId: s.imagePublicId || null,
        gallery: JSON.stringify(s.gallery),
        highlights: JSON.stringify(s.highlights),
        description: s.description,
        includes: JSON.stringify(s.includes),
        suitableFor: JSON.stringify(s.suitableFor),
        featured: s.featured,

        groupName: s.groupName || '',
        shortDescription: s.shortDescription || '',
        fullDescription: s.fullDescription || '',
        instructorDescription: s.instructorDescription || '',
        languages: JSON.stringify(s.languages || []),
        cancellationPolicy: s.cancellationPolicy || '',
        reservePolicy: s.reservePolicy || '',
        meetingPointTitle: s.meetingPointTitle || '',
        meetingPointDescription: s.meetingPointDescription || '',
        whatToBring: JSON.stringify(s.whatToBring || []),
        knowBeforeYouGo: JSON.stringify(s.knowBeforeYouGo || []),
        rating: s.reviews ? 5.0 : 0,
        reviewCount: s.reviews ? s.reviews.length : 0
      },
    });

    if (s.packages) {
      for (const p of s.packages) {
        await prisma.servicePackage.create({
          data: {
            serviceId: service.id,
            name: p.name,
            priceLabel: p.priceLabel,
            price: p.price,
            currency: p.currency,
            description: p.description,
            duration: p.duration,
            groupSize: p.groupSize,
            sortOrder: p.sortOrder
          }
        });
      }
    }

    if (s.reviews) {
      for (const r of s.reviews) {
        await prisma.serviceReview.create({
          data: {
            serviceId: service.id,
            reviewerName: r.reviewerName,
            reviewerCountry: r.reviewerCountry,
            rating: r.rating,
            content: r.content,
            reviewDate: r.reviewDate
          }
        });
      }
    }

    console.log(`Created service with id: ${service.id}`);
  }

  // Clear and seed settings
  await prisma.setting.deleteMany();
  const settingsEntries = [
    { key: 'companyName', value: company.name },
    { key: 'tagline', value: company.tagline },
    { key: 'shortIntro', value: company.shortIntro },
    { key: 'mission', value: company.mission },
    { key: 'vision', value: company.vision },
    { key: 'address', value: company.address },
    { key: 'hotline', value: company.hotline },
    { key: 'email', value: company.email },
    { key: 'mapEmbed', value: company.mapEmbed },
    { key: 'whatsappUrl', value: company.whatsappUrl },
    { key: 'zaloUrl', value: company.zaloUrl },
    { key: 'messengerUrl', value: company.messengerUrl },
    { key: 'facebookUrl', value: company.facebookUrl },
    { key: 'instagramUrl', value: company.instagramUrl },
    { key: 'lineUrl', value: company.lineUrl },
    { key: 'taxCode', value: company.taxCode },
    { key: 'aboutHeroEyebrow', value: 'Our Story' },
    { key: 'aboutHeroTitle', value: 'Preserving the Art of Vietnamese Craftsmanship' },
    { key: 'aboutHeroDescription', value: company.shortIntro },
    { key: 'aboutHeroImage', value: '/pics/product4.jpg' },
    { key: 'aboutStoryEyebrow', value: 'Brand story' },
    { key: 'aboutStoryTitle', value: 'A passion for cultural heritage' },
    { key: 'aboutStoryDescription', value: 'Our workshop was created to help travellers, companies and remote communities experience the traditional Vietnamese art of conical hat making through well-designed workshops and curated activities.' },
    { key: 'aboutStoryBody', value: 'Instead of offering a generic tour, our workshop focuses on guided participation: crafting, storytelling, and creating take-home memories. Every activity is designed to be simple to understand, easy to book and flexible enough for different audiences.' },
    { key: 'aboutStoryImage', value: '/pics/product1.jpg' },
    { key: 'aboutMission', value: company.mission },
    { key: 'aboutVision', value: company.vision },
    { key: 'aboutAchievements', value: JSON.stringify(achievements) },
    { key: 'homeHeroEyebrow', value: 'Conical Hat Making Workshops' },
    { key: 'homeHeroTitle', value: 'The Art of Vietnamese Conical Hat Making' },
    { key: 'homeHeroDescription', value: company.shortIntro },
    { key: 'homeValuesTitle', value: 'The Authentic Experience' },
    { key: 'homeValuesDescription', value: 'We are dedicated to preserving heritage through high-quality, hands-on activities.' },
    { key: 'homeIntroTitle', value: 'Preserving a Vietnamese Tradition' },
    { key: 'homeIntroBody', value: company.mission },
    { key: 'homeFeaturedTitle', value: 'Featured Workshops' },
    { key: 'homeFeaturedDescription', value: 'Discover our most popular workshops, designed for individuals, groups, and corporate teams.' },
    { key: 'homeCtaTitle', value: 'Ready to create your own masterpiece?' },
    { key: 'homeCtaDescription', value: 'Join our workshops or get a DIY kit to experience the art of conical hat making, wherever you are.' },
    { key: 'homeHeroPrimaryCta', value: 'Explore services' },
    { key: 'homeHeroSecondaryCta', value: 'Send inquiry' },
    { key: 'homeCtaButtonText', value: 'Explore All Services' },
  ];
  for (const s of settingsEntries) {
    await prisma.setting.create({ data: s });
  }
  console.log(`Seeded settings.`);

  // Clear and seed testimonials
  await prisma.testimonial.deleteMany();
  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        avatar: t.avatar,
        comment: t.comment
      }
    });
  }
  console.log(`Seeded testimonials.`);

  console.log(`Seeded testimonials.`);

  // Clear and seed Team Members
  await prisma.teamMember.deleteMany();
  const teamMembers = [
    {
      name: 'Hoa',
      role: 'Lead Artisan',
      bio: 'With over 20 years of experience, Hoa is a master of the conical hat making tradition. She loves sharing her passion with visitors from all over the world.',
      image: '/pics/product2.jpg',
      sortOrder: 1
    },
    {
      name: 'Bao',
      role: 'Workshop Host',
      bio: 'Bao is a friendly and engaging host who will guide you through the workshop. He is fluent in English and Vietnamese.',
      image: '/pics/product3.jpg',
      sortOrder: 2
    },
    {
      name: 'Linh',
      role: 'Event Coordinator',
      bio: 'Linh is our expert event coordinator, ensuring that every workshop runs smoothly. She can help you plan private events and corporate workshops.',
      image: '/pics/product4.jpg',
      sortOrder: 3
    }
  ];
  for (const t of teamMembers) {
    await prisma.teamMember.create({ data: t });
  }
  console.log(`Seeded team members.`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
