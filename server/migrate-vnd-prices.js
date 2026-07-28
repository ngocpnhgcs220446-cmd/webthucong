import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting VND price migration...');

  try {
    // Migrate Services (price is String, defaultEstimatedPrice is Float)
    const servicesToMigrate = await prisma.service.findMany({
      where: {
        currency: 'VND',
      }
    });

    console.log(`Found ${servicesToMigrate.length} services to check.`);
    for (const service of servicesToMigrate) {
      const priceNum = Number(service.price);
      let updated = false;
      let newPriceStr = service.price;
      let newDefaultEst = service.defaultEstimatedPrice;

      if (service.price && Number.isFinite(priceNum) && priceNum < 100000) {
        newPriceStr = String(priceNum * 1000);
        updated = true;
      }
      if (service.defaultEstimatedPrice && service.defaultEstimatedPrice < 100000) {
        newDefaultEst = service.defaultEstimatedPrice * 1000;
        updated = true;
      }

      if (updated) {
        await prisma.service.update({
          where: { id: service.id },
          data: {
            price: newPriceStr,
            defaultEstimatedPrice: newDefaultEst
          }
        });
        console.log(`Updated Service: ${service.id} - old price: ${service.price} -> new price: ${newPriceStr}`);
      }
    }

    // Migrate Service Packages
    const packagesToMigrate = await prisma.servicePackage.findMany({
      where: {
        currency: 'VND',
        price: {
          lt: 100000
        }
      }
    });

    console.log(`Found ${packagesToMigrate.length} packages to migrate.`);
    for (const pkg of packagesToMigrate) {
      await prisma.servicePackage.update({
        where: { id: pkg.id },
        data: {
          price: pkg.price * 1000
        }
      });
      console.log(`Updated Package: ${pkg.id} - old price: ${pkg.price} -> new price: ${pkg.price * 1000}`);
    }

    // Migrate Leads (packagePriceSnapshot) if any
    const leadsToMigrate = await prisma.lead.findMany({
      where: {
        packageCurrencySnapshot: 'VND',
        packagePriceSnapshot: {
          lt: 100000
        }
      }
    });

    console.log(`Found ${leadsToMigrate.length} leads to migrate.`);
    for (const lead of leadsToMigrate) {
      if (lead.packagePriceSnapshot) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            packagePriceSnapshot: lead.packagePriceSnapshot * 1000
          }
        });
        console.log(`Updated Lead: ${lead.id} - old price: ${lead.packagePriceSnapshot} -> new price: ${lead.packagePriceSnapshot * 1000}`);
      }
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
