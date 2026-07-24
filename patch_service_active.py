import re

with open("server/index.js", "r") as f:
    text = f.read()

# Fix 1: Route signature and 'next' parameter
old_route = "app.post('/api/leads', leadLimiter, async (req, res) => {"
new_route = "app.post('/api/leads', leadLimiter, async (req, res, next) => {"

if old_route in text:
    text = text.replace(old_route, new_route)
    print("Fixed route signature.")
else:
    print("WARNING: Could not find route signature.")

# Fix 2: Remove 'active' from Prisma select and condition
old_service = """    if (serviceId) {
      const service = await prisma.service.findUnique({ 
        where: { id: serviceId },
        select: { id: true, title: true, slug: true, status: true, active: true }
      });
      if (!service || !service.active) {"""

new_service = """    if (serviceId) {
      const service = await prisma.service.findUnique({ 
        where: { id: serviceId },
        select: { id: true, title: true, slug: true, status: true }
      });
      if (!service || service.status !== 'published') {"""

if old_service in text:
    text = text.replace(old_service, new_service)
    print("Fixed service select and status condition.")
else:
    print("WARNING: Could not find service select block.")

# Fix 3: Remove 'active' from ServicePackage check just in case
old_package = """      if (packageId) {
        const pkg = await prisma.servicePackage.findFirst({
          where: { id: packageId, serviceId: serviceId, active: true }
        });
        if (!pkg) {"""
new_package = """      if (packageId) {
        const pkg = await prisma.servicePackage.findFirst({
          where: { id: packageId, serviceId: serviceId }
        });
        if (!pkg) {"""
if old_package in text:
    text = text.replace(old_package, new_package)
    print("Fixed package active condition.")
else:
    print("WARNING: Could not find package active condition. Might not exist or differ.")


with open("server/index.js", "w") as f:
    f.write(text)

