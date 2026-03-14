# Discount Club Cayman (DCC) — Full Project Documentation

> **Version:** 1.0.0  
> **Stack:** React 19 + Vite (Frontend) · Node.js / Express 5 + MongoDB (Backend)  
> **Location:** Cayman Islands

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Backend](#4-backend)
   - 4.1 [Server Setup](#41-server-setup)
   - 4.2 [Database](#42-database)
   - 4.3 [Data Models](#43-data-models)
   - 4.4 [API Endpoints](#44-api-endpoints)
   - 4.5 [Authentication & Authorization](#45-authentication--authorization)
   - 4.6 [Payment Integration](#46-payment-integration)
5. [Frontend](#5-frontend)
   - 5.1 [App Entry & Routing](#51-app-entry--routing)
   - 5.2 [Pages & Features](#52-pages--features)
   - 5.3 [User Types & Role System](#53-user-types--role-system)
   - 5.4 [Services Layer (API Client)](#54-services-layer-api-client)
   - 5.5 [Admin Panel](#55-admin-panel)
6. [Authentication Flow](#6-authentication-flow)
7. [Membership & Payment Flow](#7-membership--payment-flow)
8. [Environment Variables](#8-environment-variables)
9. [Running the Project](#9-running-the-project)

---

## 1. Project Overview

**Discount Club Cayman** is a membership-based discount and benefits platform for the Cayman Islands. It connects four categories of users with businesses and exclusive offers:

| User Type   | Role in DB    | Purpose                                                                |
| ----------- | ------------- | ---------------------------------------------------------------------- |
| Individual  | `member`      | Personal discount membership (monthly/annual, individual/family plans) |
| Employer    | `employer`    | Offer DCC membership benefits to their employees                       |
| Business    | `business`    | List their business and publish discount offers to DCC members         |
| Association | `association` | Connect their member organisation with DCC benefits                    |
| Admin       | `admin`       | Full platform management                                               |

**Core features:**

- Role-based sign-up and login with per-role dashboards
- Stripe-powered membership subscriptions (Individual/Family)
- Digital membership QR card for in-store redemption
- Discount browsing, certificate issuance & QR-scan redemption
- Travel deals marketplace (hotels, flights, car rentals, activities)
- Business directory with category filtering and search
- Admin dashboard with platform-wide statistics and CRUD controls
- Contact / inquiry system

---

## 2. Tech Stack

### Backend

| Package      | Version | Purpose                   |
| ------------ | ------- | ------------------------- |
| Node.js      | —       | Runtime                   |
| Express      | ^5.2.1  | HTTP framework            |
| MongoDB      | —       | Database                  |
| Mongoose     | ^9.2.4  | ODM / schema layer        |
| jsonwebtoken | ^9.0.3  | JWT authentication        |
| bcrypt       | ^6.0.0  | Password hashing          |
| Stripe       | ^20.4.1 | Payment processing        |
| helmet       | ^8.1.0  | HTTP security headers     |
| cors         | ^2.8.6  | Cross-origin requests     |
| dotenv       | ^17.3.1 | Environment variables     |
| morgan       | ^1.10.1 | HTTP request logging      |
| nodemon      | ^3.1.14 | Hot-reload in development |

### Frontend

| Package                 | Version  | Purpose                 |
| ----------------------- | -------- | ----------------------- |
| React                   | ^19.2.0  | UI library              |
| React DOM               | ^19.2.0  | DOM renderer            |
| Vite                    | ^8.0.0   | Build tool & dev server |
| React Router DOM        | ^7.13.1  | Client-side routing     |
| Tailwind CSS            | ^4.2.1   | Utility-first CSS       |
| @stripe/react-stripe-js | ^5.6.1   | Stripe card elements    |
| @stripe/stripe-js       | ^8.9.0   | Stripe.js loader        |
| @heroicons/react        | ^2.2.0   | Icon library            |
| framer-motion           | ^12.34.3 | Animations              |
| qrcode.react            | ^4.2.0   | QR code generation      |
| react-hot-toast         | ^2.6.0   | Toast notifications     |
| recharts                | ^3.7.0   | Admin charts            |

---

## 3. Project Structure

```
DCC/
├── Backend/
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middlewares/
│   │   ├── auth.js                # JWT protect middleware
│   │   └── roleGuard.js           # Role-based authorize middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Category.js
│   │   ├── Certificate.js
│   │   ├── ContactInquiry.js
│   │   ├── Discount.js
│   │   ├── Membership.js          # MembershipPlan + Membership schemas
│   │   └── Travel.js
│   └── routes/
│       ├── auth.routes.js
│       ├── user.routes.js
│       ├── business.routes.js
│       ├── category.routes.js
│       ├── certificate.routes.js
│       ├── contact.routes.js
│       ├── discount.routes.js
│       ├── membership.routes.js
│       ├── payment.routes.js
│       ├── travel.routes.js
│       └── admin.routes.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                # Root router + layout
        ├── main.jsx
        ├── index.css
        ├── services/
        │   └── api.js             # API client, token helpers, ROLE_ROUTES
        ├── admin/
        │   ├── Admin.jsx          # Admin shell (routes /admin/*)
        │   ├── Navbar.jsx
        │   └── component/
        │       ├── dashboard/Dashboard.jsx
        │       └── sidebar/Sidebar.jsx
        └── user/
            ├── components/
            │   ├── common/
            │   │   ├── Header.jsx
            │   │   ├── Footer.jsx
            │   │   └── PaypalPayment.jsx
            │   └── ui/
            │       ├── AppIcon.jsx
            │       └── AppImage.jsx
            └── pages/
                ├── Homepage/
                ├── About/
                ├── Contact/
                ├── Pricing/
                ├── Login/
                ├── SignUp/
                ├── Auth/              # OAuth callback
                ├── Membership/
                ├── Categories/
                ├── BrowseDiscounts/
                ├── Discounts/
                ├── Certificates/
                ├── Travel/
                ├── Advertise/
                ├── Businessprofile/
                ├── ForIndividulas/
                ├── ForBusinesses/
                ├── ForEmployers/
                ├── ForAssociations/
                ├── MemberDashboard/
                ├── BusinessDashboard/
                ├── EmployerDashboard/
                ├── AssociationDashboard/
                ├── B2BDashboard/
                ├── AdminDashboard/
                └── NotFoundPage.jsx
```

---

## 4. Backend

### 4.1 Server Setup

File: `Backend/server.js`

The Express server initialises with the following middleware pipeline:

1. **`helmet()`** — Sets secure HTTP headers (XSS protection, frameguard, etc.)
2. **`cors()`** — Restricts cross-origin requests to `CLIENT_URL` (default: `http://localhost:5173`)
3. **`morgan('dev')`** — Logs HTTP requests in development
4. **`express.json()`** — Parses JSON request bodies
5. **All API routes** — Mounted under `/api/`
6. **Global 404 handler** — Returns `{ message: "Route ... not found" }`
7. **Global error handler** — Returns 500 with stack trace in development

The server listens on `process.env.PORT` (default: `5000`).

---

### 4.2 Database

File: `Backend/config/db.js`

Connects to MongoDB using `process.env.MONGO_URI` via Mongoose. The process exits with code `1` if the connection fails, preventing the server from running without a database.

---

### 4.3 Data Models

#### User (`models/User.js`)

| Field        | Type     | Notes                                                                               |
| ------------ | -------- | ----------------------------------------------------------------------------------- |
| `name`       | String   | Required                                                                            |
| `email`      | String   | Unique, lowercase                                                                   |
| `password`   | String   | Bcrypt-hashed (12 rounds), excluded from queries by default                         |
| `role`       | Enum     | `member`, `business`, `employer`, `association`, `b2b`, `admin` — default: `member` |
| `phone`      | String   | Optional                                                                            |
| `address`    | Object   | `street`, `city`, `country` (default: Cayman Islands)                               |
| `avatar`     | String   | URL                                                                                 |
| `isActive`   | Boolean  | Default `true`; deactivated accounts cannot log in                                  |
| `membership` | ObjectId | Ref → Membership                                                                    |

- Passwords are hashed via a `pre('save')` hook.
- `toJSON()` strips the password from all responses.
- `matchPassword(enteredPassword)` — instance method for login comparison.

---

#### Business (`models/Business.js`)

| Field                                  | Type           | Notes                                                             |
| -------------------------------------- | -------------- | ----------------------------------------------------------------- |
| `name`, `description`                  | String         | Required                                                          |
| `logo`, `images`                       | String / Array | URLs                                                              |
| `category`                             | ObjectId       | Ref → Category                                                    |
| `owner`                                | ObjectId       | Ref → User                                                        |
| `location`                             | Object         | `address`, `city`, `district`, `country`, `coordinates (lat/lng)` |
| `phone`, `email`, `website`            | String         | Contact info                                                      |
| `socialMedia`                          | Object         | `facebook`, `instagram`, `twitter`                                |
| `discountHighlight`                    | String         | e.g. "Up to 20% off"                                              |
| `tags`                                 | Array          | For search                                                        |
| `isActive`, `isApproved`, `isFeatured` | Boolean        | Workflow states                                                   |
| `averageRating`, `reviewCount`         | Number         | Ratings                                                           |

Full-text search index on `name`, `description`, and `tags`.

---

#### Category (`models/Category.js`)

| Field                          | Type    | Notes                          |
| ------------------------------ | ------- | ------------------------------ |
| `name`, `slug`                 | String  | `slug` is unique and lowercase |
| `description`, `icon`, `image` | String  | Display fields                 |
| `isActive`                     | Boolean |                                |
| `order`                        | Number  | Display sort order             |

---

#### Discount (`models/Discount.js`)

| Field                      | Type     | Notes                                             |
| -------------------------- | -------- | ------------------------------------------------- |
| `title`, `description`     | String   | Required                                          |
| `business`                 | ObjectId | Ref → Business                                    |
| `category`                 | ObjectId | Ref → Category                                    |
| `discountType`             | Enum     | `percentage`, `fixed`, `buy-x-get-y`, `free-item` |
| `value`                    | Number   | Percentage or dollar amount                       |
| `minimumPurchase`          | Number   | Default 0                                         |
| `validFrom`, `validTo`     | Date     | Validity window                                   |
| `usageLimit`, `usageCount` | Number   | Cap on total uses                                 |
| `isActive`                 | Boolean  |                                                   |
| `terms`, `image`           | String   | Additional info                                   |

---

#### Certificate (`models/Certificate.js`)

| Field                     | Type     | Notes                                  |
| ------------------------- | -------- | -------------------------------------- |
| `code`                    | String   | Auto-generated 6-byte hex, unique      |
| `user`                    | ObjectId | Ref → User                             |
| `business`                | ObjectId | Ref → Business                         |
| `discount`                | ObjectId | Ref → Discount                         |
| `qrData`                  | String   | Auto-generated as `DCC-{code}-{_id}`   |
| `status`                  | Enum     | `active`, `redeemed`, `expired`        |
| `expiresAt`, `redeemedAt` | Date     |                                        |
| `redeemedBy`              | ObjectId | Ref → User (business user who scanned) |

---

#### Membership (`models/Membership.js`)

Two schemas in one file:

**MembershipPlan** — the product tier:
| Field | Notes |
|---|---|
| `name` | e.g. "Individual", "Employer" |
| `type` | Enum: `individual`, `employer`, `association`, `b2b`, `business` |
| `price`, `billingCycle` | Cost and frequency |
| `features` | Array of feature strings |
| `maxEmployees`, `maxMembers` | Limits for org plans |

**Membership** — user subscription record:
| Field | Notes |
|---|---|
| `user` | Ref → User |
| `plan` | Ref → MembershipPlan |
| `planType` | `individual`, `family`, `employer`, `association`, `b2b`, `business` |
| `billingCycle` | `monthly` or `annual` |
| `status` | `active`, `expired`, `cancelled`, `pending` |
| `startDate`, `endDate` | Subscription period |
| `paypalOrderId`, `stripePaymentIntentId`, `stripeSubscriptionId` | Payment references |
| `amount` | Amount paid |

---

#### Travel (`models/Travel.js`)

| Field                                  | Notes                                                        |
| -------------------------------------- | ------------------------------------------------------------ |
| `title`, `description`, `destination`  | Required                                                     |
| `type`                                 | Enum: `hotel`, `flight`, `car-rental`, `activity`, `package` |
| `originalPrice`, `discountedPrice`     | Pricing                                                      |
| `discountPercentage`                   | Auto-calculated on save                                      |
| `image`, `images`                      | Media                                                        |
| `partner`, `partnerLogo`, `bookingUrl` | Partner info                                                 |
| `validFrom`, `validTo`                 | Availability window                                          |
| `isActive`, `isFeatured`               | Display flags                                                |

---

#### ContactInquiry (`models/ContactInquiry.js`)

| Field                                          | Notes                                               |
| ---------------------------------------------- | --------------------------------------------------- |
| `name`, `email`, `phone`, `subject`, `message` | Form fields                                         |
| `type`                                         | Enum: `general`, `business`, `advertise`, `support` |
| `status`                                       | Enum: `pending`, `read`, `responded`                |
| `response`, `respondedAt`                      | Admin reply fields                                  |

---

### 4.4 API Endpoints

All endpoints are prefixed with `/api`.

#### Auth — `/api/auth`

| Method | Path        | Access  | Description                                                                                       |
| ------ | ----------- | ------- | ------------------------------------------------------------------------------------------------- |
| POST   | `/register` | Public  | Register a new user. Body: `{ name, email, password, role?, phone? }`. Returns `{ token, user }`. |
| POST   | `/login`    | Public  | Log in. Body: `{ email, password }`. Returns `{ token, user }`.                                   |
| GET    | `/me`       | Private | Get the currently authenticated user (with membership populated).                                 |

**Allowed roles on register:** `member`, `business`, `employer`, `association`, `b2b`. Any other value defaults to `member`.

---

#### Users — `/api/users`

| Method | Path   | Access                | Description                                               |
| ------ | ------ | --------------------- | --------------------------------------------------------- |
| GET    | `/`    | Admin                 | List all users. Query: `role`, `search`, `page`, `limit`. |
| GET    | `/:id` | Private (own) / Admin | Get single user with membership.                          |
| PUT    | `/:id` | Private (own) / Admin | Update user profile.                                      |
| DELETE | `/:id` | Admin                 | Deactivate/delete user.                                   |

---

#### Businesses — `/api/businesses`

| Method | Path   | Access           | Description                                                                                |
| ------ | ------ | ---------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/`    | Public           | List approved active businesses. Query: `category`, `search`, `featured`, `page`, `limit`. |
| GET    | `/:id` | Public           | Get single business.                                                                       |
| POST   | `/`    | Business / Admin | Create a business listing (starts as pending approval).                                    |
| PUT    | `/:id` | Owner / Admin    | Update business. Only admins can set `isApproved` / `isFeatured`.                          |
| DELETE | `/:id` | Owner / Admin    | Delete business.                                                                           |

---

#### Categories — `/api/categories`

| Method | Path     | Access | Description                                    |
| ------ | -------- | ------ | ---------------------------------------------- |
| GET    | `/`      | Public | List all active categories, sorted by `order`. |
| GET    | `/:slug` | Public | Get category by slug.                          |
| POST   | `/`      | Admin  | Create category.                               |
| PUT    | `/:slug` | Admin  | Update category.                               |
| DELETE | `/:slug` | Admin  | Delete category.                               |

---

#### Discounts — `/api/discounts`

| Method | Path   | Access           | Description                                                                      |
| ------ | ------ | ---------------- | -------------------------------------------------------------------------------- |
| GET    | `/`    | Private          | List active discounts. Query: `category`, `businessId`, `type`, `page`, `limit`. |
| GET    | `/:id` | Private          | Get single discount.                                                             |
| POST   | `/`    | Business / Admin | Create a discount offer (business owner must own the business).                  |
| PUT    | `/:id` | Business / Admin | Update discount.                                                                 |
| DELETE | `/:id` | Business / Admin | Delete discount.                                                                 |

---

#### Membership — `/api/membership`

| Method | Path          | Access  | Description                                                                                                            |
| ------ | ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | `/plans`      | Public  | List all active membership plans.                                                                                      |
| GET    | `/my`         | Private | Get the current user's active membership.                                                                              |
| POST   | `/subscribe`  | Private | Subscribe to a plan (after PayPal payment). Body: `{ planId, paypalOrderId }`. Cancels any existing active membership. |
| PUT    | `/:id/cancel` | Private | Cancel a membership by ID.                                                                                             |

---

#### Certificates — `/api/certificates`

| Method | Path                 | Access                     | Description                                                                                        |
| ------ | -------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/my`                | Private                    | Get all certificates belonging to the logged-in user.                                              |
| GET    | `/:code/verify`      | Public                     | Verify a certificate by its code (used by business QR scanners). Auto-expires if past `expiresAt`. |
| POST   | `/issue/:discountId` | Private                    | Issue a new certificate for a discount. Prevents duplicates and respects usage limits.             |
| PUT    | `/:code/redeem`      | Private (Business / Admin) | Mark a certificate as redeemed.                                                                    |

---

#### Travel — `/api/travel`

| Method | Path   | Access  | Description                                                           |
| ------ | ------ | ------- | --------------------------------------------------------------------- |
| GET    | `/`    | Private | List active travel deals. Query: `type`, `featured`, `page`, `limit`. |
| GET    | `/:id` | Private | Get single travel deal.                                               |
| POST   | `/`    | Admin   | Create a travel deal.                                                 |
| PUT    | `/:id` | Admin   | Update a travel deal.                                                 |
| DELETE | `/:id` | Admin   | Delete a travel deal.                                                 |

---

#### Contact — `/api/contact`

| Method | Path           | Access | Description                                                                              |
| ------ | -------------- | ------ | ---------------------------------------------------------------------------------------- |
| POST   | `/`            | Public | Submit a contact form inquiry. Body: `{ name, email, phone?, subject, message, type? }`. |
| GET    | `/`            | Admin  | List all inquiries. Query: `status`.                                                     |
| PUT    | `/:id/respond` | Admin  | Respond to an inquiry. Updates `status` → `responded`.                                   |

---

#### Payment — `/api/payment`

| Method | Path                     | Access  | Description                                                                                                                                                                       |
| ------ | ------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/create-payment-intent` | Public  | Create a Stripe PaymentIntent for a membership. Body: `{ planType, billingCycle }`. Returns `{ clientSecret }`.                                                                   |
| POST   | `/complete-signup`       | Public  | After Stripe payment success: registers user, activates membership, returns `{ token, user }`. Body: `{ name, email, phone, password, planType, billingCycle, paymentIntentId }`. |
| POST   | `/create-order`          | Private | Create a PayPal order. Body: `{ amount, description }`.                                                                                                                           |
| POST   | `/capture-order`         | Private | Capture a PayPal payment. Body: `{ orderId }`.                                                                                                                                    |

**Membership prices (Stripe):**
| Plan | Monthly | Annual |
|---|---|---|
| Individual | $15 | $150 |
| Family | $25 | $250 |

---

#### Admin — `/api/admin`

All routes require `protect` + `authorize('admin')`.

| Method | Path                      | Description                                                                                                         |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| GET    | `/stats`                  | Dashboard stats: user counts, business counts, memberships, certificates, inquiries, travel deals, recent activity. |
| GET    | `/users`                  | List all users with search and role filter.                                                                         |
| PUT    | `/users/:id`              | Update any user (including role and `isActive`).                                                                    |
| GET    | `/businesses`             | List all businesses (including pending).                                                                            |
| PUT    | `/businesses/:id/approve` | Approve a business listing.                                                                                         |
| GET    | `/inquiries`              | List contact inquiries.                                                                                             |
| PUT    | `/inquiries/:id`          | Update inquiry status / add response.                                                                               |

---

### 4.5 Authentication & Authorization

**`middlewares/auth.js` — `protect`**

- Reads `Authorization: Bearer <token>` header.
- Verifies the JWT using `JWT_SECRET`.
- Attaches the decoded user to `req.user`.
- Returns `401` if no token, invalid token, user not found, or account is deactivated.

**`middlewares/roleGuard.js` — `authorize(...roles)`**

- Used **after** `protect`.
- Checks `req.user.role` against the allowed roles array.
- Returns `403` if the role is not permitted.

Example usage:

```js
router.post("/businesses", protect, authorize("business", "admin"), handler);
```

---

### 4.6 Payment Integration

**Stripe** (primary — used for individual/family membership sign-up):

1. Frontend calls `POST /api/payment/create-payment-intent` → receives `clientSecret`.
2. Frontend confirms payment via `stripe.confirmCardPayment(clientSecret, ...)`.
3. On success, frontend calls `POST /api/payment/complete-signup` with user details + `paymentIntentId`.
4. Backend verifies the PaymentIntent status with Stripe, registers the user, activates the membership, and returns `{ token, user }`.

**PayPal** (secondary — used for membership plan subscriptions post-signup):

- `POST /api/payment/create-order` and `POST /api/payment/capture-order` support PayPal flow.
- `POST /api/membership/subscribe` activates a plan using a `paypalOrderId`.

---

## 5. Frontend

### 5.1 App Entry & Routing

File: `frontend/src/App.jsx`

The app uses a two-layout structure:

- **`/admin/*`** → `<Admin />` component (standalone admin shell with its own Navbar/Sidebar)
- **All other routes** → `<UserLayout />` which wraps content with `<Header />` and `<Footer />`

A `<ScrollToTop />` component resets scroll position on every route change.

**`<UserLayout />` routes:**

| Path                        | Component                     | Access      |
| --------------------------- | ----------------------------- | ----------- |
| `/`                         | `HomePage`                    | Public      |
| `/about`                    | `AboutContent`                | Public      |
| `/contact`                  | `Contact`                     | Public      |
| `/pricing`                  | `PricingContent`              | Public      |
| `/login`                    | `LoginContent`                | Public      |
| `/sign-up`                  | `SignupContent`               | Public      |
| `/membership`               | `MemberShipFormContent`       | Public      |
| `/for-individuals`          | `ForIndividualsContent`       | Public      |
| `/for-businesses`           | `ForBusinessContent`          | Public      |
| `/for-employers`            | `ForEmployersContent`         | Public      |
| `/for-associations`         | `ForAssociationsContent`      | Public      |
| `/browse-discounts`         | `BrowseDiscountsContent`      | Public      |
| `/advertise`                | `AdvertiseContent`            | Public      |
| `/categories`               | `CategoriesPage`              | Public      |
| `/categoriespage/:category` | `CategoriesDetailsPage`       | Public      |
| `/travel`                   | `TravelContent`               | Member      |
| `/certification`            | `CertificationContent`        | Member      |
| `/discounts`                | `DiscountsContent`            | Member      |
| `/business-profile/:id`     | `BusinessProfileContent`      | Member      |
| `/member-dashboard`         | `MemberDashboardContent`      | Member      |
| `/business-dashboard`       | `BusinessDashboardContent`    | Business    |
| `/employer-dashboard`       | `EmployerDashboardContent`    | Employer    |
| `/association-dashboard`    | `AssociationDashboardContent` | Association |
| `/b2b-dashboard`            | `B2BDashboardContent`         | B2B         |
| `/admin-dashboard`          | `AdminDashboardContent`       | Admin       |
| `*`                         | `NotFoundPage`                | —           |

---

### 5.2 Pages & Features

#### Homepage (`/`)

Multi-section marketing page:

- `HeroSection` — main headline and CTA
- `LocalSavings` — highlight of local discount offers
- `RedeemableCertificates` — explains the certificate system
- `FinalCTA` — call to action to sign up

#### Login (`/login`)

- **4-tab role selector**: Individual · Employer · Business · Association
- Displays "Signing in as [Role]" label inside the form
- On success, redirects to the role's dashboard using `ROLE_ROUTES`
- "Continue with Google" button (UI only, pending OAuth integration)
- "Forgot password?" link (UI only)

#### Sign Up (`/sign-up`)

- **4-tab role selector** at the top of the page
- **Individual tab** → Full multi-step flow:
  - Step 1: Choose plan (Individual / Family) and billing cycle (Monthly / Annual)
  - Step 2: Account information (name, email, phone, password, confirm password)
  - Step 3: Add family members (Family plan only — up to 3 additional members)
  - Step 4: Stripe payment (CardElement) with order summary sidebar
- **Employer / Business / Association tabs** → Simplified direct registration form:
  - Organisation name (label changes per role: "Company Name", "Business Name", "Association Name")
  - Contact person name
  - Email, phone, password, confirm password
  - Terms & Privacy Policy checkbox
  - Registers immediately via `authAPI.register()` with the selected role

#### Member Dashboard (`/member-dashboard`)

- Rotating QR code (regenerates every 10 minutes) for in-store discount redemption
- Travel deals section
- New discounts
- Unbeatable deals
- New certificates
- Hot certificates
- Provider directory

#### Business Dashboard (`/business-dashboard`)

Business owners can manage their listings, view discount performance, and track certificate redemptions.

#### Employer Dashboard (`/employer-dashboard`)

Employers can manage employee benefit enrollments.

#### Association Dashboard (`/association-dashboard`)

Associations can manage their member access to DCC benefits.

#### B2B Dashboard (`/b2b-dashboard`)

B2B partner management interface.

#### Admin Dashboard (`/admin-dashboard`)

Platform-wide administration (separate from the `/admin/*` panel).

#### Discounts (`/discounts`)

Browse and filter all active discount offers. Members only.

#### Certificates (`/certification`)

View and manage issued discount certificates with QR codes.

#### Travel (`/travel`)

Browse exclusive travel deals (hotels, flights, car rentals, activities, packages).

#### Browse Discounts (`/browse-discounts`)

Public-facing preview of available discount categories.

#### Categories (`/categories`, `/categoriespage/:category`)

Browse all business categories and filter businesses by category.

#### Business Profile (`/business-profile/:id`)

Detailed view of a specific business listing.

#### Pricing (`/pricing`)

Membership plan comparison and pricing.

#### Membership Form (`/membership`)

Post-login membership subscription form.

#### Contact (`/contact`)

Contact form with inquiry type selection. Submissions are saved to the database.

#### Advertise (`/advertise`)

Information page for businesses wanting to advertise.

#### For [Audience] pages

Marketing/information pages:

- `/for-individuals`
- `/for-businesses`
- `/for-employers`
- `/for-associations`

---

### 5.3 User Types & Role System

The platform supports 5 user roles (+ admin):

| Role                | DB value      | Sign-up path                                    | Dashboard route          |
| ------------------- | ------------- | ----------------------------------------------- | ------------------------ |
| Individual / Member | `member`      | `/sign-up` (Individual tab, Stripe payment)     | `/member-dashboard`      |
| Employer            | `employer`    | `/sign-up` (Employer tab, free registration)    | `/employer-dashboard`    |
| Business            | `business`    | `/sign-up` (Business tab, free registration)    | `/business-dashboard`    |
| Association         | `association` | `/sign-up` (Association tab, free registration) | `/association-dashboard` |
| B2B                 | `b2b`         | —                                               | `/b2b-dashboard`         |
| Admin               | `admin`       | Manually assigned                               | `/admin`                 |

**Role mapping (`services/api.js`):**

```js
export const ROLE_ROUTES = {
  member: "/member-dashboard",
  business: "/business-dashboard",
  employer: "/employer-dashboard",
  association: "/association-dashboard",
  b2b: "/b2b-dashboard",
  admin: "/admin",
};
```

After login or registration, the user is automatically redirected to their correct dashboard based on `data.user.role`.

---

### 5.4 Services Layer (API Client)

File: `frontend/src/services/api.js`

A centralised `fetch` wrapper that automatically:

- Attaches `Authorization: Bearer <token>` from localStorage
- Sets `Content-Type: application/json`
- Throws errors with the server's `message` field

**Token / user helpers:**

```js
getToken() / setToken(token) / removeToken();
getUser() / setUser(user) / removeUser();
```

**API modules:**

| Export           | Methods                                           | Endpoints         |
| ---------------- | ------------------------------------------------- | ----------------- |
| `authAPI`        | `login`, `register`, `me`                         | `/auth/*`         |
| `userAPI`        | `getById`, `update`                               | `/users/:id`      |
| `businessAPI`    | `getAll`, `getById`, `create`, `update`, `delete` | `/businesses/*`   |
| `categoryAPI`    | `getAll`, `getBySlug`                             | `/categories/*`   |
| `discountAPI`    | `getAll`, `getById`                               | `/discounts/*`    |
| `membershipAPI`  | `getPlans`, `getMy`, `subscribe`, `cancel`        | `/membership/*`   |
| `certificateAPI` | `getMy`, `verify`, `issue`, `redeem`              | `/certificates/*` |
| `travelAPI`      | `getAll`, `getById`                               | `/travel/*`       |
| `contactAPI`     | `submit`                                          | `/contact`        |
| `paymentAPI`     | `createOrder`, `captureOrder`                     | `/payment/*`      |
| `stripeAPI`      | `createPaymentIntent`, `completeSignup`           | `/payment/*`      |

---

### 5.5 Admin Panel

Path prefix: `/admin/*`

File: `frontend/src/admin/Admin.jsx`

The admin panel is a standalone SPA within the app, with its own:

- `Navbar` — top navigation bar
- `Sidebar` — left-hand navigation
- `Dashboard` — stats overview with charts (via Recharts)

Accessible only to users with `role === "admin"`. All admin API calls go through `/api/admin/*` which is guarded by `protect + authorize('admin')` on the backend.

---

## 6. Authentication Flow

```
User fills Login form (with role tab selected)
        │
        ▼
POST /api/auth/login  { email, password }
        │
        ▼
Backend: find user by email → compare bcrypt password
        │
        ├── Invalid → 401 "Invalid email or password"
        │
        └── Valid →
              Generate JWT (30-day expiry)
              Return { token, user: { _id, name, email, role, ... } }
                      │
                      ▼
Frontend: setToken(token) → localStorage
          setUser(user)   → localStorage
          navigate(ROLE_ROUTES[user.role])
```

**Registration flow (Employer / Business / Association):**

```
User fills Org Sign-up form
        │
        ▼
POST /api/auth/register  { name, email, password, role, phone }
        │
        └── Backend creates User with selected role
              Return { token, user }
                      │
                      ▼
              Redirect to role dashboard
```

**Registration flow (Individual — Stripe):**

```
Step 1-3: Collect plan / account / family info
        │
        ▼
Step 4: POST /api/payment/create-payment-intent  { planType, billingCycle }
        ← clientSecret
        │
        ▼
stripe.confirmCardPayment(clientSecret, { card, billing_details })
        │
        ▼
POST /api/payment/complete-signup  { name, email, phone, password, planType,
                                     billingCycle, paymentIntentId }
        │
        └── Backend: verify Stripe PaymentIntent → create User (role: member)
              → create active Membership → return { token, user }
                      │
                      ▼
              Redirect to /member-dashboard
```

---

## 7. Membership & Payment Flow

### Individual / Family Plans

| Plan             | Monthly | Annual  | Savings |
| ---------------- | ------- | ------- | ------- |
| Individual       | $15/mo  | $150/yr | $30/yr  |
| Family (up to 4) | $25/mo  | $250/yr | $50/yr  |

Payment is collected via **Stripe** at sign-up. The backend:

1. Creates a `PaymentIntent` for the selected amount.
2. On completion, verifies the `PaymentIntent` status = `succeeded`.
3. Creates the `User` record with `role: "member"`.
4. Creates a `Membership` record with `status: "active"`, sets `startDate` and `endDate`.
5. Links the membership to the user via `user.membership`.

### Org Plans (Employer / Business / Association)

These users register without an upfront payment. Access to premium features can be gated by checking their active membership status, which can be activated later via:

```
POST /api/membership/subscribe  { planId, paypalOrderId }
```

### Certificate Redemption Flow

```
Member browses Discounts → issues certificate
        │
        ▼
POST /api/certificates/issue/:discountId
Creates Certificate { code, qrData: "DCC-CODE-ID", status: "active" }
        │
        ▼
Member presents QR code in-store
        │
        ▼
Business staff scans QR → GET /api/certificates/:code/verify
Returns certificate details + validity status
        │
        ▼
PUT /api/certificates/:code/redeem  (Business user)
Sets status → "redeemed", records redeemedAt + redeemedBy
```

---

## 8. Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dcc
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 9. Running the Project

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys for development)

### Backend

```bash
cd Backend
npm install
# Create .env file with variables from Section 8
npm run dev        # Development (nodemon)
npm start          # Production
```

Server starts on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
# Create .env file with VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY
npm run dev        # Development server (Vite)
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

Dev server starts on `http://localhost:5173`.

### Build for Production

```bash
cd frontend
npm run build
# Serve dist/ with any static file server (nginx, Vercel, Netlify, etc.)
```

---

_Documentation generated: March 2026_
