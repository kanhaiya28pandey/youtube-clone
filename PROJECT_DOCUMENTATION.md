# 🎬 YourTube — Full-Stack YouTube Clone

<p align="center">
  <strong>A feature-rich full-stack YouTube-style video streaming platform built with Next.js, React, Node.js, Express and MongoDB.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay"/>
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Firebase-Integration-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render"/>
</p>

---

## 📌 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Project Highlights](#2-project-highlights)
- [3. Technology Stack](#3-technology-stack)
- [4. Architecture](#4-architecture)
- [5. Complete Repository Structure](#5-complete-repository-structure)
- [6. Frontend Architecture](#6-frontend-architecture)
- [7. Frontend Pages](#7-frontend-pages)
- [8. Frontend Components](#8-frontend-components)
- [9. Backend Architecture](#9-backend-architecture)
- [10. Backend Controllers](#10-backend-controllers)
- [11. Backend Models](#11-backend-models)
- [12. Backend Routes](#12-backend-routes)
- [13. Authentication and OTP](#13-authentication-and-otp)
- [14. Video Management](#14-video-management)
- [15. Likes and Dislikes](#15-likes-and-dislikes)
- [16. Comments and Moderation](#16-comments-and-moderation)
- [17. Watch Later](#17-watch-later)
- [18. Watch History](#18-watch-history)
- [19. Downloads](#19-downloads)
- [20. Premium Plans](#20-premium-plans)
- [21. Razorpay Payment System](#21-razorpay-payment-system)
- [22. Email Notifications and Invoice](#22-email-notifications-and-invoice)
- [23. Watch-Time Management](#23-watch-time-management)
- [24. Region-Based Theme](#24-region-based-theme)
- [25. Gesture-Based Video Player](#25-gesture-based-video-player)
- [26. Video Calling and Real-Time Communication](#26-video-calling-and-real-time-communication)
- [27. Database Design](#27-database-design)
- [28. Environment Variables](#28-environment-variables)
- [29. Installation](#29-installation)
- [30. Running the Project Locally](#30-running-the-project-locally)
- [31. Production Build](#31-production-build)
- [32. Deployment](#32-deployment)
- [33. API Overview](#33-api-overview)
- [34. Screenshots](#34-screenshots)
- [35. Security](#35-security)
- [36. Troubleshooting](#36-troubleshooting)
- [37. Future Improvements](#37-future-improvements)
- [38. Project Status](#38-project-status)
- [39. Author](#39-author)

---

# 1. Project Overview

**YourTube** is a full-stack YouTube-style video streaming platform designed to provide a modern video-sharing experience with authentication, video playback, social interactions, personalized content management, premium plans, payments, downloads and real-time communication.

The project is divided into two major applications:

```text
yourtube/
    └── Next.js + React + TypeScript frontend

server/
    └── Node.js + Express + MongoDB backend

# 2. Project Highlights

YourTube is designed as a complete full-stack video-sharing platform rather than only a video player.

The major features implemented in the project include:

### 👤 User & Authentication

- User registration
- User login
- JWT-based authentication
- OTP verification
- Email-based OTP
- SMS-based OTP using Twilio
- Protected backend routes
- User-specific content and activities

### 🎥 Video Platform

- Video upload
- Video listing
- Video playback
- Video details
- Video view tracking
- Watch-time tracking
- Related videos
- Channel-based videos
- Video search
- Explore section

### ❤️ Social Features

- Like videos
- Dislike videos
- Comments
- Comment interactions
- Watch Later
- Watch History
- Liked Videos

### ⬇️ Download System

- Video downloads
- Download history
- Download management
- Premium-based download access

### 💎 Premium Subscription

The application provides multiple plans:

| Plan | Price | Video Watch Limit |
|------|------:|-------------------|
| Free | ₹0 | 5 minutes |
| Bronze | ₹10 | 7 minutes |
| Silver | ₹50 | 10 minutes |
| Gold | ₹100 | Unlimited |

### 💳 Payment System

- Razorpay integration
- Premium plan purchase
- Payment processing
- Payment confirmation
- Invoice generation
- Email notification after payment

### 📧 Communication

- Email OTP
- Payment/invoice emails
- SMS OTP
- Twilio integration

### 📞 Real-Time Communication

- Video calling
- Room-based communication
- Socket.IO signaling
- Camera state synchronization
- Microphone state synchronization
- WebRTC offer/answer exchange
- ICE candidate exchange

### 🎨 User Experience

- Responsive interface
- Modern YouTube-style UI
- Dark/light theme behavior
- Region/time-based theme logic
- Gesture-based video interactions
- Toast notifications
- Reusable React components


# 3. Technology Stack

## Frontend Technologies

| Technology | Purpose |
|------------|---------|
| Next.js | React framework and frontend application |
| React | Component-based UI development |
| TypeScript | Type-safe frontend development |
| Tailwind CSS | Utility-first styling |
| Axios | REST API communication |
| Socket.IO Client | Real-time communication |
| Firebase | Frontend service integration |
| Radix UI | Accessible UI primitives |
| Lucide React | Icons |
| Sonner | Toast notifications |
| Next Themes | Theme management |
| date-fns | Date and time utilities |
| clsx | Conditional CSS classes |
| tailwind-merge | Tailwind class merging |

### Frontend Versions

```text
Next.js       15.3.3
React         19
TypeScript    5
Tailwind CSS  4

# 4. Architecture

YourTube follows a **full-stack client-server architecture** where the frontend, backend, database and third-party services are separated into distinct layers.

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER / BROWSER                       │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                         │
│                                                              │
│              Next.js + React + TypeScript                    │
│                                                              │
│  Pages │ Components │ API Calls │ Theme │ Notifications      │
└───────────────────────────────┬──────────────────────────────┘
                                │
                         HTTP / REST API
                                │
                         Socket.IO / WebRTC
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                         │
│                                                              │
│                  Node.js + Express.js                        │
│                                                              │
│ Routes → Controllers → Models → Database                     │
│                                                              │
│ Authentication │ Videos │ Comments │ Likes │ Payments        │
│ OTP │ Downloads │ History │ Watch Later │ Watch Time         │
└───────────────┬──────────────────────────┬───────────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│       MongoDB            │    │      External Services       │
│                          │    │                              │
│ Users                    │    │ Razorpay                     │
│ Videos                   │    │ Nodemailer                   │
│ Comments                 │    │ Twilio                       │
│ Likes                    │    │ Firebase                     │
│ History                  │    │ Socket.IO                    │
│ Downloads                │    │ WebRTC                       │
│ Watch Later              │    │                              │
└──────────────────────────┘    └──────────────────────────────┘
```

## 4.1 Frontend Layer

The frontend is implemented using **Next.js, React and TypeScript**.

The frontend is responsible for:

* Rendering application pages
* Managing user interactions
* Calling backend APIs
* Managing client-side state
* Displaying videos and video metadata
* Handling authentication UI
* Managing premium plan selection
* Initiating payment flows
* Displaying notifications
* Providing the real-time communication interface

The frontend source code is organized inside [`yourtube/src`](yourtube/src/).

The main frontend areas are:

* [`pages`](yourtube/src/pages/) — application routes/pages
* [`components`](yourtube/src/components/) — reusable UI components
* [`lib`](yourtube/src/lib/) — shared frontend utilities
* [`styles`](yourtube/src/styles/) — styling resources

---

## 4.2 Backend Layer

The backend is implemented using **Node.js and Express.js**.

It provides REST APIs consumed by the frontend and contains the application's core business logic.

The backend is responsible for:

* Authentication and authorization
* User operations
* Video operations
* Likes and dislikes
* Comments
* Watch Later
* Watch History
* Downloads
* Premium plans
* Razorpay payments
* OTP services
* Watch-time management
* Email communication
* Real-time communication

The backend entry point is [`server/index.js`](server/index.js).

---

## 4.3 Database Layer

MongoDB is used as the application's primary database.

Mongoose is used to define schemas and communicate with MongoDB.

The database layer stores application data such as:

* Users
* Videos
* Comments
* Likes
* Watch History
* Downloads
* Watch Later entries
* Premium-related user information

The corresponding Mongoose models are located in [`server/Models`](server/Models/).

---

## 4.4 External Services

The project integrates several external services.

| Service    | Purpose                                |
| ---------- | -------------------------------------- |
| Razorpay   | Premium plan payments                  |
| Nodemailer | Email communication                    |
| Twilio     | SMS/OTP communication                  |
| Firebase   | Frontend/service integration           |
| Socket.IO  | Real-time communication                |
| WebRTC     | Peer-to-peer video/audio communication |

---

## 4.5 Communication Flow

A typical API request follows this architecture:

```text
User Action
     │
     ▼
React / Next.js Page
     │
     ▼
Axios / Socket.IO Client
     │
     ▼
Express Route
     │
     ▼
Controller
     │
     ▼
Mongoose Model
     │
     ▼
MongoDB
     │
     ▼
Controller Response
     │
     ▼
Frontend UI Update
```

This separation keeps presentation, business logic and data access responsibilities organized.

---

# 5. Complete Repository Structure

The repository is organized into separate frontend, backend and documentation areas.

```text
youtube-clone/
│
├── docs/
│   ├── comments.png
│   ├── downloads.png
│   ├── history.png
│   ├── home.png
│   ├── likes.png
│   ├── login.png
│   ├── payment.png
│   ├── premium.png
│   ├── video-call.png
│   └── video-player.png
│
├── server/
│   ├── Models/
│   ├── controllers/
│   ├── filehelper/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── yourtube/
│   ├── public/
│   ├── src/
│   ├── components.json
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── .gitignore
└── PROJECT_DOCUMENTATION.md
```

---

## 5.1 Documentation Directory

The [`docs/`](docs/) directory contains screenshots captured from the running application.

| File                                        | Purpose                  |
| ------------------------------------------- | ------------------------ |
| [`home.png`](docs/home.png)                 | Home page                |
| [`login.png`](docs/login.png)               | Login interface          |
| [`video-player.png`](docs/video-player.png) | Video player             |
| [`likes.png`](docs/likes.png)               | Like/dislike interaction |
| [`comments.png`](docs/comments.png)         | Comments                 |
| [`history.png`](docs/history.png)           | Watch history            |
| [`downloads.png`](docs/downloads.png)       | Downloads                |
| [`premium.png`](docs/premium.png)           | Premium plans            |
| [`payment.png`](docs/payment.png)           | Payment interface        |
| [`video-call.png`](docs/video-call.png)     | Video calling            |

---

# 6. Frontend Architecture

The frontend is a **Next.js application using the Pages Router**.

The application source code is located inside [`yourtube/src`](yourtube/src/).

```text
yourtube/
│
├── public/
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── styles/
│
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 6.1 Pages

Application-level routes are organized inside:

[`yourtube/src/pages/`](yourtube/src/pages/)

The repository currently contains dedicated page directories for major application areas including:

* Home
* Call
* Channel
* Downloads
* Explore
* History
* Liked videos
* Premium
* Search
* Subscriptions
* Watch Later

The main application entry point is:

[`yourtube/src/pages/index.tsx`](yourtube/src/pages/index.tsx)

---

## 6.2 Application Configuration

The Next.js application uses:

* [`next.config.ts`](yourtube/next.config.ts) — Next.js configuration
* [`tsconfig.json`](yourtube/tsconfig.json) — TypeScript configuration
* [`postcss.config.mjs`](yourtube/postcss.config.mjs) — PostCSS configuration
* [`components.json`](yourtube/components.json) — UI component configuration

The global application wrapper is handled through:

[`yourtube/src/pages/_app.tsx`](yourtube/src/pages/_app.tsx)

The custom document configuration is handled through:

[`yourtube/src/pages/_document.tsx`](yourtube/src/pages/_document.tsx)

---

## 6.3 Components

Reusable UI components are organized inside:

[`yourtube/src/components/`](yourtube/src/components/)

The component architecture helps avoid duplicating UI logic across multiple pages.

Typical responsibilities of reusable components include:

* Navigation
* Video cards
* Video player UI
* Comments
* Interactive controls
* Premium UI
* Dialogs
* Forms
* Notifications
* Real-time communication UI

---

## 6.4 Shared Libraries

Shared frontend utilities are organized inside:

[`yourtube/src/lib/`](yourtube/src/lib/)

This area is used for reusable application-level functionality that does not belong directly to a specific page or visual component.

---

## 6.5 Styling

Frontend styling resources are maintained inside:

[`yourtube/src/styles/`](yourtube/src/styles/)

The project uses **Tailwind CSS** along with supporting styling utilities.

---

# 7. Frontend Pages

YourTube uses separate pages for major user workflows.

## 7.1 Home Page

The home page acts as the primary video discovery interface.

It provides access to the application's main video content and navigation.

**Screenshot:** [`docs/home.png`](docs/home.png)

![YourTube Home Page](docs/home.png)

---

## 7.2 Explore

The Explore section provides another way for users to discover available content.

**Route:** `explore`

**Source:** [`yourtube/src/pages/explore/`](yourtube/src/pages/explore/)

---

## 7.3 Search

The Search page is responsible for displaying search-related results.

**Route:** `search`

**Source:** [`yourtube/src/pages/search/`](yourtube/src/pages/search/)

---

## 7.4 Channel

The Channel section provides channel-specific content.

**Route:** `channel`

**Source:** [`yourtube/src/pages/channel/`](yourtube/src/pages/channel/)

---

## 7.5 Subscriptions

The Subscriptions section provides access to subscribed content.

**Route:** `subscriptions`

**Source:** [`yourtube/src/pages/subscriptions/`](yourtube/src/pages/subscriptions/)

---

## 7.6 Liked Videos

The Liked section provides access to videos that the user has liked.

**Route:** `liked`

**Source:** [`yourtube/src/pages/liked/`](yourtube/src/pages/liked/)

**Screenshot:** [`docs/likes.png`](docs/likes.png)

![Liked Videos](docs/likes.png)

---

## 7.7 Watch History

The History page provides access to previously watched videos.

**Route:** `history`

**Source:** [`yourtube/src/pages/history/`](yourtube/src/pages/history/)

**Screenshot:** [`docs/history.png`](docs/history.png)

![Watch History](docs/history.png)

---

## 7.8 Watch Later

The Watch Later page provides access to videos saved for future viewing.

**Route:** `watch-later`

**Source:** [`yourtube/src/pages/watch-later/`](yourtube/src/pages/watch-later/)

---

## 7.9 Downloads

The Downloads page provides access to downloaded videos.

**Route:** `downloads`

**Source:** [`yourtube/src/pages/downloads/`](yourtube/src/pages/downloads/)

**Screenshot:** [`docs/downloads.png`](docs/downloads.png)

![Downloads](docs/downloads.png)

---

## 7.10 Premium

The Premium page provides the available subscription plans.

**Route:** `premium`

**Source:** [`yourtube/src/pages/premium/`](yourtube/src/pages/premium/)

**Screenshot:** [`docs/premium.png`](docs/premium.png)

![Premium Plans](docs/premium.png)

---

## 7.11 Video Calling

The application contains a dedicated call interface for real-time communication.

**Route:** `call`

**Source:** [`yourtube/src/pages/call/`](yourtube/src/pages/call/)

**Screenshot:** [`docs/video-call.png`](docs/video-call.png)

![Video Calling](docs/video-call.png)

---

# 8. Frontend Components

The frontend follows a reusable component-based architecture.

Instead of placing all UI logic directly inside pages, common functionality is separated into reusable components inside:

[`yourtube/src/components/`](yourtube/src/components/)

This provides several benefits:

* Reusability
* Easier maintenance
* Consistent UI
* Separation of concerns
* Easier feature development
* Reduced code duplication

## Component Responsibilities

The major component categories include:

| Category                 | Responsibility                         |
| ------------------------ | -------------------------------------- |
| Navigation               | Application navigation and user access |
| Video Components         | Video cards, metadata and playback UI  |
| Interaction Components   | Likes, dislikes and comments           |
| Form Components          | User input and application forms       |
| Premium Components       | Plan selection and subscription UI     |
| Payment Components       | Payment-related interface              |
| Communication Components | Video call and real-time UI            |
| Feedback Components      | Toasts, alerts and status messages     |

---

## 8.1 Frontend Data Flow

The frontend generally follows this pattern:

```text
Page
 │
 ├── Reusable Component
 │
 ├── User Interaction
 │
 ▼
API / Socket.IO Request
 │
 ▼
Backend
 │
 ▼
Response
 │
 ▼
Component State Update
 │
 ▼
Updated UI
```

This approach allows individual components to remain focused on presentation and interaction while backend services handle persistent application logic.

---

## 8.2 Frontend API Communication

The project uses **Axios** for HTTP communication between the frontend and backend.

Typical flow:

```text
React / Next.js
      │
      │ Axios Request
      ▼
Express API
      │
      ▼
Controller
      │
      ▼
MongoDB
      │
      ▼
JSON Response
      │
      ▼
Frontend State
```

For real-time functionality, the frontend also uses **Socket.IO Client** to communicate with the backend Socket.IO server.
