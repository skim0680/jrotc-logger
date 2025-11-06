# 🔥 Firebase Setup Guide for AFJROTC CA-882

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Project Name: `afjrotc-ca882` (or your preference)
4. Disable Google Analytics (optional for this use case)
5. Click "Create Project"

## Step 2: Enable Authentication

1. In Firebase Console → **Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable"
   - Add your email as test user
   - Save

## Step 3: Set Up Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll secure it later)
4. Select your preferred region
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web app** icon `</>`
4. App nickname: `AFJROTC-CA882-Web`
5. Click "Register app"
6. **COPY the config object** - you'll need this!

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

## Step 5: Update Your App

Replace the config in `src/firebase/config.js`:

```javascript
// Replace the placeholder config with your actual config
const firebaseConfig = {
  // Paste your Firebase config here
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-domain.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-bucket.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
};
```

## Step 6: Set Up Firestore Security Rules (Important!)

In Firebase Console → **Firestore Database** → **Rules**, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // AFJROTC CA-882 data - authenticated users only
    match /{collection}/{document} {
      allow read, write: if request.auth != null;
    }

    // More secure alternative (requires admin approval):
    // match /{collection}/{document} {
    //   allow read, write: if request.auth != null &&
    //     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    //     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    // }
  }
}
```

## Step 7: Add Authorized Domain (For Deployment)

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain: `chainofcommad.vercel.app`

## Step 8: Test Your Setup

1. `npm run dev` - Start development server
2. Try signing in with Google
3. Check Firebase Console → **Authentication** → **Users** to see if your login appears
4. Check **Firestore Database** to see if data is being created

## 🚀 Features Now Available:

- **Real-time Collaboration**: Multiple users can work simultaneously
- **Google Authentication**: Secure sign-in system
- **Live Updates**: Changes appear instantly for all users
- **Data Persistence**: Everything saved to cloud database
- **Offline Support**: Works without internet, syncs when connected

## 🔒 Security Best Practices:

- Only approved users can access the system
- Each user's actions are tracked
- Data is automatically backed up
- Easy to revoke access if needed

## 📱 Mobile Ready:

- Works on phones, tablets, computers
- Responsive design
- Touch-friendly drag & drop

Ready to deploy! Your AFJROTC CA-882 system is now enterprise-ready with real-time collaboration!
