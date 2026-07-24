import re

with open("server/index.js", "r") as f:
    text = f.read()

# Add verifySmtpConnection to imports
old_import = "import { sendAdminLeadNotification, sendCustomerLeadConfirmation, sendCustomerStatusChangeEmail } from './email.js';"
new_import = "import { sendAdminLeadNotification, sendCustomerLeadConfirmation, sendCustomerStatusChangeEmail, verifySmtpConnection } from './email.js';"

if old_import in text:
    text = text.replace(old_import, new_import)
    print("Patched imports")

# Add the verify call right after prisma init
old_init = """const prisma = new PrismaClient();
const app = express();"""
new_init = """const prisma = new PrismaClient();

// Verify SMTP once on startup
verifySmtpConnection().catch(err => console.error('[SMTP] Startup verification error:', err));

const app = express();"""

if old_init in text:
    text = text.replace(old_init, new_init)
    print("Patched startup call")

with open("server/index.js", "w") as f:
    f.write(text)
