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