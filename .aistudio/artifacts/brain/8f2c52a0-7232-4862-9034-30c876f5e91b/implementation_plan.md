# Guide & Plan: Configuring Administrator Environment Variables in AI Studio

## 1. How to Reopen the Secrets & Environment Variables Panel in Google AI Studio

In Google AI Studio, environment variables and runtime secrets are managed through the native platform interface. Follow these steps to reopen the panel:

1. **Locate the Secrets / Settings Icon in the AI Studio Header**:
   - In the top-right toolbar (or upper navigation bar) of the Google AI Studio Build interface, look for the **Key icon** (labeled **Secrets**) or the **Gear icon** (**Settings / Project Settings**).
   - Alternatively, check the left-hand navigation sidebar for the **Secrets & Config** tab.
2. **Open the Secrets Modal**:
   - Click the **Key icon** or **Manage Secrets** button.
   - The Environment Variables dialog will slide open.
3. **Add the Required Keys & Values**:
   Click **+ Add Secret** or **Add Variable** for each of the following:

   | Key | Recommended / Required Value | Purpose |
   |---|---|---|
   | `ADMIN_USERNAME` | `Karachi Bytes` | Exact authorized administrator username |
   | `ADMIN_EMAIL` | `mshamikhsheikh2@gmail.com` *(or your preferred email)* | Administrator email login identifier |
   | `ADMIN_PASSWORD` | *(Your private strong password)* | Server-salted and hashed password |
   | `DATA_DIR` | `./data` | Local filesystem storage path |

4. **Save and Apply**:
   - Click **Save** or **Apply Changes**. AI Studio will automatically inject these variables into the runtime environment.

---

## 2. Server Synchronization & Idempotent Account Update

Your existing codebase in `src/server/db.ts` is already wired to read these exact environment variables without requiring any resets or code rewrites:

```typescript
export function initializeAdminAccount(): void {
  const users = loadUsers();
  const adminUsername = process.env.ADMIN_USERNAME || 'Karachi Bytes';
  const adminEmail = (process.env.ADMIN_EMAIL || 'mshamikhsheikh2@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'KarachiBites@2026!';
  // Hashes password with cryptographically secure random salt using scrypt
  // Updates existing administrator record or provisions the initial record idempotently
}
```

### Safety Guarantees
- **Zero Data Loss**: Your existing orders (`KB-1001`, `KB-1002`, `KB-1003`, etc.) in `orders.json` are completely preserved.
- **Menu Preserved**: All 12 authentic Karachi Bites dishes, prices (e.g. Chicken Malai Boti Rs. 850, Mutton Karahi Rs. 1650), images, and tags remain untouched.
- **Idempotent**: Re-running the application with new values updates only the administrator hash and contact details without duplicating accounts.

---

## 3. Verification Plan

After you input your values in the Secrets panel:
1. Restart the development server to reload `process.env`.
2. Open the Karachi Bites website.
3. Click **Staff Management Portal** in the footer (or navigate to `/#admin`).
4. Log in using your configured username (`Karachi Bytes`) or email, along with your private password.
5. Verify access to the live kitchen dispatch order queue and branch filters.
