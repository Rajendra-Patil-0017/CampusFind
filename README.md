# CampusFind 🎒🔍
> **"Find It. Report It. Return It."**

CampusFind is a modern, offline-first mobile application built with **React Native**, **Expo SDK 57**, and **TypeScript**. It is designed specifically for university and college campuses to help students, faculty, and staff quickly report lost items, register found belongings, search campus posts in real time, and safely reconnect with item owners.

---

## 📌 Problem Statement & Objectives
Every day on college campuses, hundreds of valuable items—student IDs, laptops, headphones, keys, and wallets—are misplaced in lecture halls, cafeterias, and libraries. Most campus lost-and-found systems are fragmented across disparate bulletin boards, informal social media groups, or physical desks with limited hours.

**CampusFind** solves this by providing:
- **Instant Decentralized Posting**: Any campus member can report a lost or found item in under 30 seconds.
- **100% Offline-First Architecture**: No server lag, no login friction, no reliance on cellular connectivity in basement classrooms.
- **Smart Campus Filters**: Real-time multi-dimensional filtering by category, status (Lost vs. Found vs. Resolved), location, and recency.
- **Reunification Tools**: Direct tap-to-email / tap-to-call links and native mobile sharing.

---

## ✨ Features Breakdown

### 1. 🔍 Real-Time Feed & Exploration
* **Live Search**: Instant multi-field text search across item titles, detailed descriptions, campus locations, and categories.
* **Filter Chips**: Toggle between *All*, *Lost Items*, and *Found Items* with live count indicators.
* **Resolution Filter**: Filter by *Active Posts* only or view historical *Resolved* returns.
* **Category Carousel**: Quick-filter by 10 campus-tailored categories (Electronics, ID Card, Wallet, Keys, Books, Bags, Clothing, Documents, Accessories, Other).
* **Flexible Sorting**: Sort feed by *Newest First* (default), *Oldest First*, or *Recently Updated*.
* **Pull-to-Refresh**: Native smooth swipe gesture to reload local storage.

### 2. 📝 Report Lost & Found Items
* **Lost vs. Found Selector**: High-contrast, intuitive type toggle with color cues.
* **Full Form Validation**: Real-time client-side validation ensuring clean names, descriptions, locations, and contact info.
* **Category Grid**: Visual grid selector with modern icons.
* **Photo Attachment**: Integrated gallery photo picker with preview and removal capabilities.
* **Duplicate Prevention**: Form disables submit during in-flight storage writes.

### 3. 📂 My Posts Management & Post Lifecycle
* **Local Post Ownership**: Displays only posts created on the local device (`ownerId === 'local-user'`).
* **Active vs. Resolved Tabs**: Segmented view to track open investigations vs. completed handoffs.
* **Edit Post**: Full edit mode with pre-filled details, timestamps, and photo replacement.
* **Status Lifecycle**: Toggle posts between *Active* and *Resolved* with one tap.
* **Safe Deletion with Undo**: Deletion requires explicit confirmation and displays an animated Undo Snackbar.

### 4. 📄 Item Details & Contact
* **Hero Banner / Photo**: High-resolution image preview or thematic category banner.
* **Owner Action Bar**: Quick shortcuts to Edit, Resolve, or Delete for post creators.
* **Finder / Claimant View**: Tap-to-email (`mailto:`) or tap-to-call (`tel:`) buttons.
* **Native Share Sheet**: One-tap share to external apps (WhatsApp, Discord, iMessage) to expand search radius.

### 5. 👤 Profile, Statistics & Backup
* **Campus Overview Stats**: Derived metrics displaying total personal reports, active lost items, active found items, and resolved handoffs.
* **JSON Backup & Export**: Export the complete offline database to a JSON file and share it via system share sheet.
* **Demo Data Reset**: One-click restore to clean campus sample data for demonstrations.

---

## 🛠 Tech Stack

| Component | Technology | Version / Tooling |
| :--- | :--- | :--- |
| **Framework** | Expo | SDK 57 (React Native 0.86, React 19.2) |
| **Routing** | Expo Router | v57 (File-based navigation, typed routes) |
| **Language** | TypeScript | Strict type checking (`noEmit` validated) |
| **Persistence** | `@react-native-async-storage/async-storage` | 100% offline local key-value store |
| **Media & Icons** | `expo-image`, `expo-image-picker`, `@expo/vector-icons` | Optimized assets and camera roll access |
| **Sharing & Files**| `expo-sharing`, `expo-file-system` | Native file share sheets and JSON exports |
| **Animation** | `react-native-reanimated` | Fluid micro-interactions |

---

## 📂 Project Architecture & Directory Structure

```
campusfind/
├── app.json                  # Expo SDK 57 configuration & scheme
├── package.json              # App dependencies & scripts
├── tsconfig.json             # TypeScript path alias configurations
├── assets/                   # App icons, splash screens, and images
└── src/
    ├── app/                  # Expo Router file-based screens
    │   ├── _layout.tsx       # Root Stack Navigator & Theme Provider
    │   ├── index.tsx         # Splash screen with auto-navigation
    │   ├── (tabs)/           # Bottom Tab Navigator
    │   │   ├── _layout.tsx   # Tabs layout (Home, Report, My Posts, Profile)
    │   │   ├── index.tsx     # Home feed, search, and filter chips
    │   │   ├── add.tsx       # Report Item (Lost / Found form)
    │   │   ├── my-posts.tsx  # My Posts manager (Active / Resolved + Undo)
    │   │   └── profile.tsx   # Profile, stats, JSON backup & reset
    │   ├── item/
    │   │   ├── [id].tsx      # Item details, contact actions, share
    │   │   └── edit/[id].tsx # Edit post form
    │   └── about.tsx         # Mission, features, and safety guidelines
    ├── components/           # Reusable UI component library
    │   ├── CategoryPicker.tsx# Grid & horizontal category selectors
    │   ├── ConfirmDialog.tsx # Accessible modal confirmation dialogs
    │   ├── EmptyState.tsx    # Empty states with action CTAs
    │   ├── FilterChip.tsx    # Filter pill toggles
    │   ├── ItemCard.tsx      # Lost & found feed item card
    │   ├── LoadingState.tsx  # Activity spinner states
    │   ├── PrimaryButton.tsx # Multi-variant touchable buttons
    │   ├── ScreenHeader.tsx  # Screen header with safe back navigation
    │   ├── SearchBar.tsx     # Real-time search with clear button
    │   ├── Snackbar.tsx      # Animated toast with Undo action
    │   ├── StatusBadge.tsx   # Visual status and type badges
    │   ├── themed-text.tsx   # Semantic themed typography
    │   └── themed-view.tsx   # Semantic themed view container
    ├── constants/            # Design tokens & configurations
    │   ├── categories.ts     # Centralized category list & icon maps
    │   ├── colors.ts         # Light & Dark color palettes
    │   ├── config.ts         # App config, IDs, keys, timeout constants
    │   └── theme.ts          # Spacing, typography, border radius, shadows
    ├── hooks/                # Custom React hooks (theme, color scheme)
    ├── services/             # Data access layer
    │   └── storage.ts        # Robust AsyncStorage CRUD & seed engine
    ├── types/                # TypeScript interfaces & types
    │   └── item.ts           # LostFoundItem data model & filter types
    └── utils/                # Pure utility functions
        ├── filters.ts        # Search, filter, and multi-sort algorithms
        ├── formatters.ts     # Relative time, date, and text formatters
        └── validation.ts     # Strict client-side form validation
```

---

## 🚀 Getting Started & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* [Expo Go](https://expo.dev/go) app on your iOS or Android device (optional for physical device testing)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/campusfind.git
   cd campusfind
   ```

2. Install SDK-compatible dependencies:
   ```bash
   npx expo install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your target platform:
   - **Android**: Press `a` in terminal (or scan QR code in Expo Go).
   - **iOS**: Press `i` in terminal (or scan QR code with iOS Camera).
   - **Web**: Press `w` in terminal to run in browser.

---

## 🧪 Quality & Verification Checklist

- [x] **Zero TypeScript Errors**: Tested and verified with `npx tsc --noEmit`.
- [x] **Zero Lint Issues**: Validated with `npx expo lint`.
- [x] **Expo Doctor**: 21/21 checks passing with `npx expo-doctor`.
- [x] **Splash Auto-Advance**: Seamlessly transitions to Home after seeding demo data.
- [x] **Full CRUD Lifecycle**: Create, Read, Update, Delete with confirmation and 5-second Undo toast.
- [x] **Multi-Dimensional Search & Filtering**: Real-time search combinable with Lost/Found/Resolved and 10 categories.
- [x] **Offline Data Safety**: Corrupted storage recovery, graceful fallbacks, JSON backup export.

---

## 🔮 Future Scope (Roadmap for v2)

* **Cloud Sync Backend**: Firebase / Supabase integration for cross-device synchronization.
* **Campus SSO & Student Verification**: Institutional `.edu` email authentication and student identity badges.
* **Push Notifications**: Instant alerts when an item matching your lost description is posted.
* **Secure In-App Chat**: End-to-end masked messaging between finder and owner without exposing phone numbers.
* **AI Image Matching**: Visual vector search matching uploaded lost item photos with found item pictures.
* **Campus Safety Desk Integration**: Direct hand-off confirmation at verified campus security drop boxes.

---

## 📄 License & Attribution
Distributed under the MIT License. Built with ❤️ for university campuses worldwide.
