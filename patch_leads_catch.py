import re

with open("server/index.js", "r") as f:
    text = f.read()

# We need to find the specific catch block for app.post('/api/leads'
old_catch = """      } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('referenceCode')) {
          retries--;
          if (retries === 0) throw err;
        } else {
          throw err;
        }
      }
    }"""
new_catch = """      } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('referenceCode')) {
          retries--;
          if (retries === 0) throw err;
        } else {
          throw err;
        }
      }
    }"""

# Wait, this is just the retry loop's catch block. The route's outer catch block is:
outer_old = """    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      warning,
      lead: {
        id: newLead.id,
        referenceCode: newLead.referenceCode,
        name: newLead.name,
        email: newLead.email,
        serviceNameSnapshot: newLead.serviceNameSnapshot
      },
      email: {
        adminNotification: adminNotificationStatus,
        customerConfirmation: customerConfirmationStatus
      }
    });
  } catch (error) {
    next(error);
  }
});"""

outer_new = """    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      warning,
      lead: {
        id: newLead.id,
        referenceCode: newLead.referenceCode,
        name: newLead.name,
        email: newLead.email,
        serviceNameSnapshot: newLead.serviceNameSnapshot
      },
      email: {
        adminNotification: adminNotificationStatus,
        customerConfirmation: customerConfirmationStatus
      }
    });
  } catch (error) {
    console.error('[Lead Submit] Failed:', {
      name: error?.name || null,
      code: error?.code || null,
      message: error?.message || null,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    next(error);
  }
});"""

if outer_old in text:
    text = text.replace(outer_old, outer_new)
    with open("server/index.js", "w") as f:
        f.write(text)
    print("Lead route catch block patched.")
else:
    print("WARNING: Old outer catch block not found!")

