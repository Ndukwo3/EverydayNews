# Everyday News - Modern News & Finance Portal

Everyday News is a state-of-the-art, high-performance news blogging and financial tracking platform. It offers a premium, responsive user experience for consuming daily articles, breaking flash news, and real-time financial market updates.

---

## 🎨 Visual Identity & UI Design System

Based on the design mockup, the platform adheres to a clean, modern, and striking visual layout:

- **Typography**: Sleek, modern sans-serif fonts (e.g., _Inter_ or _Outfit_).
- **Color Palette**:
  - Primary Accent: `#E53E3E` (Vibrant Red) for logo, tags, alert bars, and call-to-action buttons.
  - Text Colors: `#0F172A` (Slate Dark) for headings, `#475569` for body copy.
  - Backgrounds: `#FFFFFF` (White) and `#F8FAFC` (Off-white / Slate 50) for card borders and section backgrounds.
- **Header Navigation**:
  - Logo (`Everyday News` with red "Everyday" and gray/black "News").
  - Categories: News, Business, Finance, Sport, Travel, Earth, Culture.
  - Tools: Search bar activation, notifications bell, and user authentication portal ("Login" button).
- **Interactive Tickers**:
  - Top "FLASH" marquee bar for breaking news alerts with interactive slider controls.
  - Real-time stock/commodity price sidebar featuring price direction indicators (green/red trend arrows) for gold, BIST, and NASDAQ stocks.
- **Article Presentation**:
  - Category badges (e.g., "POLITICS", "FINANCE") using high-contrast pills.
  - Image ratios optimized for masonry-like grid layouts.
  - Rich metadata (dates, authors with avatars, estimated reading times).

---

## 🛠 Tech Stack Proposal

To build a premium, scalable, and responsive application, the recommended tech stack includes:

### 1. Frontend

- **Framework**: **React (Vite)** or **Next.js** for a dynamic, component-driven, single-page application.
- **Styling**: **Vanilla CSS / CSS Modules** to implement exact custom layouts, smooth glassmorphism, responsive grid systems, and custom micro-animations (like hover zooms and marquee text loops).
- **Icons**: Lucide Icons (Search, Bell, Login, Chevrons).

### 2. Backend

- **Framework**: **Python (FastAPI)** for highly performant, type-safe REST APIs with automatic documentation (Swagger).
- **Database**: SQLite or PostgreSQL for relational data storage of users, posts, categories, and financial data.
- **Scraper / Feed Simulator**: Background task runner using `Apscheduler` to fetch mock or real-world stock prices and headlines.
- **AI Agent Engine**: Integration with the **Google Gemini API** (via the Python Google GenAI/GenerativeAI SDK) to autonomously generate, structure, and format articles.

---

## 🚀 Core Features

1. **Flash Banner**: Interactive, scrolling marquee containing latest headlines with manual navigation buttons.
2. **Dynamic Article Grid**: Responsive layouts organizing news into Featured, Standard Cards, and Sidebar Articles.
3. **Financial Widget**: Live stock ticker listing prices, currencies, and percentage directions with dynamic styling.
4. **Autonomous AI Reporter**: An embedded AI agent that scans trending topics, writes comprehensive news articles, assigns category badges, and publishes them autonomously under the "Everyday AI" author profile.
5. **Auth Flow**: Secure login modal/page for users and administrators.
6. **Admin Dashboard**: (To be expanded) Interface for writers (and managing the AI agent's prompt/schedule) to publish, edit, and delete news articles.
