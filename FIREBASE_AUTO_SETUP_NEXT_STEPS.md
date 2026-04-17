# Firebase Auto-Setup (Option A) - Complete Instructions

## Current Status: 90% Complete ✅

Your Cloud Functions are set up and ready to deploy. Here's what remains:

---

## 🔐 Step 1: Authenticate with Firebase

**The browser window should have opened.** If not, click this link:
```
https://accounts.google.com/o/oauth2/auth?client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&scope=email%20openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloudplatformprojects.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffirebase%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform&response_type=code&state=825486061&redirect_uri=http%3A%2F%2Flocalhost%3A9005
```

1. Sign in with your Google account (the one associated with Firebase project nexusop-2be8b)
2. Approve the permissions
3. Wait for the terminal to show ✔ Success

---

## 🚀 Step 2: Deploy Cloud Functions

Once authenticated, run in terminal:

```bash
cd c:\nexus-opti-mind
firebase deploy --project=nexusop-2be8b --only functions
```

**Expected output:**
```
✔ functions[us-central1-initializeFirestoreCollections]: Successful create operation.
✔ functions[us-central1-dailyMetricsCleanup]: Successful create operation.
functions:
  initializeFirestoreCollections: https://us-central1-nexusop-2be8b.cloudfunctions.net/initializeFirestoreCollections
  dailyMetricsCleanup: us-central1-dailyMetricsCleanup

✔ Deploy complete!
```

---

## 📞 Step 3: Trigger Collection Initialization

Once deployed, trigger the function to auto-create all 11 collections:

### Option A: Using curl (Simple)
```bash
curl -X POST https://us-central1-nexusop-2be8b.cloudfunctions.net/initializeFirestoreCollections \
  -H "Content-Type: application/json" \
  -d '{"overwrite": false}'
```

### Option B: Using PowerShell
```powershell
$url = "https://us-central1-nexusop-2be8b.cloudfunctions.net/initializeFirestoreCollections"
$body = @{ overwrite = $false } | ConvertTo-Json
Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json"
```

### Option C: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/nexusop-2be8b/functions)
2. Select **initializeFirestoreCollections** function
3. Click **Testing** tab
4. Click **Trigger now** (or paste body: `{"overwrite": false}`)

---

## ✅ Step 4: Verify Collections Created

1. Go to [Firebase Console](https://console.firebase.google.com/project/nexusop-2be8b)
2. Click **Firestore Database**
3. You should see all 11 collections:
   - organizations
   - racks
   - detected_vampires
   - thermal_regrets
   - workload_forecasts
   - energy_workloads
   - energy_metrics
   - alerts
   - audit_logs
   - user_preferences

---

## 📋 Deploy Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with rules from **FIREBASE_QUICK_SETUP.md** (bottom section)
3. Click **Publish**

---

## ✨ Done! 🎉

Your Firebase backend is now fully configured with:
- ✅ 11 collections with sample data
- ✅ Cloud Functions deployed
- ✅ Real-time React hooks ready to use
- ✅ Security rules protecting your data

Start using in your React app:
```typescript
import { useVampireServers } from "@/hooks/use-firebase";

export function Dashboard() {
  const { vampires } = useVampireServers();
  return <div>Found {vampires.length} vampires</div>;
}
```

---

## 🆘 Troubleshooting

**Q: "Failed to authenticate"**
- A: Complete the browser login process when prompted

**Q: "Function deployment failed"**
- A: Check `functions/src/initializeCollections.ts` has no syntax errors

**Q: curl command not found**
- A: Use PowerShell option or Firebase Console instead

**Q: Collections empty after trigger**
- A: Check Cloud Function logs for errors: `firebase functions:log --project=nexusop-2be8b`

---

Files prepared and ready:
- ✅ `firebase.json` created
- ✅ `functions/package.json` configured
- ✅ `functions/tsconfig.json` set up
- ✅ `functions/src/index.ts` created
- ✅ `functions/src/initializeCollections.ts` ready
- ✅ Dependencies installed

**Next Action**: Authenticate in browser, then run the deploy command!
