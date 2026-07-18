import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    where: { id: { not: 'svc-009' } }
  });
  
  for (const s of services) {
    const isCooking = s.id === 'svc-007';
    
    // Update main fields
    await prisma.service.update({
      where: { id: s.id },
      data: {
        groupName: isCooking ? 'Culinary Experience' : 'Cultural Crafting',
        shortDescription: s.subtitle,
        fullDescription: s.description + ' Join us for an unforgettable experience where you will learn traditional techniques from local artisans and take home a beautiful handmade souvenir.',
        instructorDescription: isCooking ? 'Local Chef specialized in authentic recipes' : 'Master Artisan with years of experience',
        languages: JSON.stringify(['English', 'Vietnamese']),
        cancellationPolicy: 'Cancel up to 24 hours in advance for a full refund',
        reservePolicy: 'Keep your travel plans flexible — book your spot and pay nothing today',
        meetingPointTitle: 'The Experience Studio, HCMC',
        meetingPointDescription: 'Our studio is located centrally. Please arrive 10 minutes before the workshop starts.',
        whatToBring: JSON.stringify(['Comfortable clothing', 'A creative mindset', 'A camera for memories']),
        knowBeforeYouGo: JSON.stringify(['Suitable for ages 5+', 'All materials are provided', 'Wheelchair accessible']),
      }
    });

    // Add Packages
    const basePrice = parseInt(s.price.replace(/\D/g, '')) || 25;
    
    // Check if packages already exist
    const existingPackages = await prisma.servicePackage.count({ where: { serviceId: s.id } });
    if (existingPackages === 0) {
      await prisma.servicePackage.createMany({
        data: [
          {
            serviceId: s.id,
            name: 'Standard Experience',
            priceLabel: `$${basePrice} / person`,
            price: basePrice,
            currency: 'USD',
            description: 'Includes all basic materials and standard guidance.',
            duration: s.duration,
            groupSize: 'Up to 15 people',
            sortOrder: 1
          },
          {
            serviceId: s.id,
            name: 'Premium Experience',
            priceLabel: `$${basePrice + 15} / person`,
            price: basePrice + 15,
            currency: 'USD',
            description: 'Includes premium materials, a take-home gift, and a complimentary Vietnamese iced coffee.',
            duration: parseInt(s.duration) ? `${parseInt(s.duration) + 0.5} hours` : 'Extended',
            groupSize: 'Up to 8 people',
            sortOrder: 2
          }
        ]
      });
    }

    // Add Reviews
    const existingReviews = await prisma.serviceReview.count({ where: { serviceId: s.id } });
    if (existingReviews === 0) {
      await prisma.serviceReview.createMany({
        data: [
          {
            serviceId: s.id,
            reviewerName: 'Emma T.',
            reviewerCountry: 'United Kingdom',
            rating: 5,
            content: 'An absolutely incredible experience! The host was super friendly and the entire workshop was well organized. Highly recommend this to anyone visiting Vietnam!',
            reviewDate: 'Jan 2024'
          },
          {
            serviceId: s.id,
            reviewerName: 'Michael R.',
            reviewerCountry: 'USA',
            rating: 5,
            content: 'Loved every minute of it. It gave us such a unique insight into the local culture that you just do not get from standard tours.',
            reviewDate: 'Dec 2023'
          }
        ]
      });
    }
  }
  
  console.log('Successfully enriched all services with packages and reviews!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
