# Firebase Firestore Production Rules Setup Guide

**Project**: modus-trading
**Purpose**: Migrate from 30-day testing mode to permanent production rules
**Last Updated**: February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Testing vs Production Rules](#testing-vs-production-rules)
3. [Method 1: Firebase Console (Quick)](#method-1-firebase-console-quick)
4. [Method 2: Firebase CLI (Recommended)](#method-2-firebase-cli-recommended)
5. [Verify Rules Are Working](#verify-rules-are-working)
6. [Check Firestore Expiration Status](#check-firestore-expiration-status)
7. [Troubleshooting](#troubleshooting)
8. [Important Notes](#important-notes)

---

## Overview

When you first create a Firestore database, Firebase defaults to **testing mode rules**, which allow anyone to read and write data for 30 days. This is great for development but **not secure for production**.

Your project (`modus-trading`) already has production-ready rules in `firestore.rules` that enforce user-based access control:
- Users can **only read/write their own documents** under `users/{userId}`
- This protects user data from unauthorized access

This guide will walk you through **two ways** to deploy these rules to production.

### Key Fact
> Firestore Rules **only control data access**. Firebase Auth (email/password, Google OAuth) will continue working regardless of rule changes. You won't lose authentication functionality.

---

## Testing vs Production Rules

### Testing Mode Rules (Default - Expires in 30 days)

```firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 10);
    }
  }
}
```

**What it does:**
- Allows **anyone** (logged in or not) to read and write any data
- **Expires on a specific date** (30 days from creation)
- Shows a warning in the Firebase Console when close to expiration
- Good for learning/prototyping, **NOT for production**

### Production Rules (Your firestore.rules file)

```firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

**What it does:**
- Users can **only access their own document** (matched by their UID)
- Requires Firebase Authentication to read/write
- **No expiration date** — rules stay active permanently
- Secure for production use
- Rejects access if `request.auth.uid` doesn't match the document's `userId`

---

## Method 1: Firebase Console (Quick)

### Prerequisites
- Access to Firebase Console at https://console.firebase.google.com
- Ownership/admin access to the `modus-trading` project

### Step-by-Step

#### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com
2. Select the **`modus-trading`** project from the dropdown at the top

#### Step 2: Navigate to Firestore Rules

1. In the left sidebar, click **Build** → expand it
2. Click **Firestore Database**
3. At the top, click the **Rules** tab (next to "Data" and "Indexes")

You should see your current rules in a text editor. If you see the testing mode rules with an expiration date, you're in the right place.

#### Step 3: Replace the Rules

1. Select **all the text** in the rules editor (Ctrl+A / Cmd+A)
2. Delete it
3. Copy and paste the production rules from your `firestore.rules` file:

```firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Or, if your actual `firestore.rules` file has additional rules for other collections, paste those instead.

#### Step 4: Publish the Rules

1. Click the **Publish** button in the top right
2. A dialog will appear asking you to confirm — click **Publish** again
3. Wait for the confirmation message: *"Rules deployed"*

**Done!** Your production rules are now live.

---

## Method 2: Firebase CLI (Recommended)

Using the CLI is better for ongoing updates because:
- Rules are version-controlled in your repo
- One command deploys both rules and other Firebase configs
- Easy to automate in CI/CD pipelines
- Verifiable: you know exactly what version is deployed

### Prerequisites

- Node.js and npm installed on your computer
- Terminal/command line access
- Ownership/admin access to the `modus-trading` Firebase project
- Your repo cloned locally with `firestore.rules` and `firebase.json` files present

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

### Step 2: Login to Firebase

```bash
firebase login
```

This opens a browser window where you sign in with your Google account. Return to the terminal once authenticated.

### Step 3: Select the Project

From your project repo root (where `firestore.rules` and `firebase.json` are located):

```bash
firebase use modus-trading
```

You should see output like:
```
Now using project modus-trading (as default)
```

To verify the correct project is selected:

```bash
firebase list
```

### Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**What this does:**
- Reads the `firestore.rules` file from your repo
- Uploads and activates the rules in your Firebase project
- Keeps everything version-controlled and trackable

### Expected Output

```
=== Deploying to 'modus-trading' ===

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file compiled successfully
i  firestore: uploading rules...
✔  firestore: released new rules to cloud.firestore

Deployment complete!
```

**Done!** Your production rules are now live.

---

## Verify Rules Are Working

After deploying, test that your rules are enforcing user-only access.

### Option A: Firestore Console (Visual Testing)

1. In Firebase Console, go to **Firestore Database** → **Data** tab
2. Create a test document under `users/test-user-id` with sample data (e.g., `{ email: "test@example.com" }`)

### Option B: Test with Your App

1. Log in to your app with a user account
2. Try to **read/write your own user document** — should succeed ✓
3. Log in as a **different user**
4. Try to **read another user's document** using browser dev tools console:

```javascript
// This should fail (Missing or insufficient permissions error)
db.collection('users').doc('some-other-user-id').get()
  .then(doc => console.log(doc.data()))
  .catch(err => console.error(err));
```

**Expected result**: The read succeeds for your own user ID, fails for others.

### Option C: Firebase Console Rules Simulator

1. Go to **Firestore Database** → **Rules** tab
2. Click **Simulator** button (if available in your Firebase plan)
3. Set:
   - **Request type**: `get`
   - **Path**: `users/user-id`
   - **Authentication**: Toggle on, set `uid` to `user-id`
4. Click **Run** — should show "Allowed"

---

## Check Firestore Expiration Status

### Before Deploying Production Rules

1. Go to **Firestore Database** in Firebase Console
2. Look at the top banner/section — if you see:
   - **"Your Security Rules will expire on [DATE]"** — you're in testing mode
   - A yellow warning badge — it's about to expire

3. Click the banner for details on which rules are expiring

### After Deploying Production Rules

Once you publish the production rules, the expiration warning **disappears** because production rules have no expiration date.

To confirm production rules are active:
1. Go to **Firestore Database** → **Rules** tab
2. You should see your custom rules, **not** the testing mode template
3. No expiration date or warning should be visible

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: The rules rejected the request because:
- User is not authenticated (check if Firebase Auth is working)
- User's UID doesn't match the document's `userId` path
- The path doesn't match any `match` statement in the rules

**Solution**:
1. Verify the user is logged in: Check `firebase.auth().currentUser`
2. Check the document path: Is it `users/{their-uid}`?
3. Review the rules in **Rules** tab — ensure the `match` path is correct
4. Try the **Simulator** tool to test the exact path and auth state

### Error: "Invalid rules file"

**Cause**: Syntax error in `firestore.rules`

**Solution**:
1. Check the file for common issues:
   - Missing semicolons
   - Mismatched braces `{ }`
   - Invalid Firebase function names
2. Validate using the Console or CLI output for the specific line number
3. Compare with the [official Firestore Rules documentation](https://firebase.google.com/docs/firestore/security/start)

### Error: "Permission denied" when deploying

**Cause**: Your Firebase account doesn't have deploy permissions for this project

**Solution**:
1. Ask the project owner to add you as an **Editor** or **Owner** in Firebase project settings
2. Or try logging out and back in: `firebase logout` then `firebase login`

### Rules deployed but Console still shows testing mode

**Cause**: Browser cache or page not refreshed

**Solution**:
1. Refresh the Firebase Console (Ctrl+R / Cmd+R)
2. Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
3. Wait 1-2 minutes for propagation
4. Verify via CLI: `firebase rules:describe`

### "Database does not exist"

**Cause**: The `modus-trading` project doesn't have a Firestore database set up

**Solution**:
1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose your region and security rules (doesn't matter — you'll replace them)
4. Try deploying again

---

## Important Notes

### Firebase Auth is Independent of Firestore Rules

- Firestore Rules **control data access** only
- Firebase Auth **controls user login** only
- **Email/password and Google OAuth will keep working** no matter what rules you deploy
- If users can't log in, the issue is with Auth settings, not Firestore Rules

### Firestore Rules Don't Affect the Firebase Console

- You (the project owner) can always see and edit data in the Firebase Console
- Rules only apply to app users accessing data via the SDK
- Console access uses elevated admin permissions

### Vercel Deployment Note

Since your app runs on **Vercel** (not Firebase Hosting):
- Deploy your app separately to Vercel
- Deploy Firestore rules separately to Firebase
- Changes to rules take effect **immediately** — no need to redeploy the app
- App changes and rule changes are independent

### Version Control Best Practice

Keep `firestore.rules` in your git repo:

```bash
git add firestore.rules firebase.json .firebaserc
git commit -m "Update Firestore rules: enforce user-only access"
git push
```

This way:
- Rules changes are tracked in commit history
- Team members can review rule changes in pull requests
- Easy to revert if needed

---

## Summary Checklist

- [ ] Read and understand the testing vs. production rules
- [ ] Choose Method 1 (Console) or Method 2 (CLI)
- [ ] Deploy production rules to Firebase
- [ ] Verify rules are working with a test read/write
- [ ] Confirm expiration warning is gone
- [ ] Test that users can't access other users' documents
- [ ] Keep `firestore.rules` in version control

---

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Auth + Firestore Integration](https://firebase.google.com/docs/auth/users)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Created for the modus-trading learning project**
*Learn Firebase at your own pace — this guide covers the critical production setup.*
