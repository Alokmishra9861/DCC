# District Co-Op Card (DCC) API Documentation
### Mobile Application Integration Guide

This document provides a comprehensive specification of every API endpoint, expected request payloads, role-based authorization levels, query parameters, and success response structures. This API is designed to support high-performance mobile clients for standard members, businesses, employers, and associations.

---

## ── General Guidelines ──

### 1. Base URL
All API requests must be directed to the following endpoint structure:
`http://<server-ip-or-domain>:<port>/api` (e.g., `http://localhost:5000/api`)

### 2. Authentication
Secure routes require a standard JSON Web Token (JWT) passed in the `Authorization` HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```
Tokens are issued upon successful login or registration.

### 3. Standard Response Envelope
All API responses follow a structured envelope pattern:

#### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Action completed successfully",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Specific error explanation"
}
```

---

## ── Module Index ──
1. [Authentication & Account Management](#1-authentication--account-management)
2. [Businesses & Directory](#2-businesses--directory)
3. [Discounts & Deals](#3-discounts--deals)
4. [Certificates & Value Cards](#4-certificates--value-cards)
5. [Employer Program (Corporate Benefits)](#5-employer-program-corporate-benefits)
6. [Associations & Member Groups](#6-associations--member-groups)
7. [Transactions & QR Scan Redemption](#7-transactions--qr-scan-redemption)
8. [Rotating Advertisements & Banner Clicks](#8-rotating-advertisements--banner-clicks)
9. [B2B Partner Directory & Enquiries](#9-b2b-partner-directory--enquiries)
10. [Payments & Memberships](#10-payments--memberships)
11. [Generic File Uploads](#11-generic-file-uploads)
12. [Role-Scoped Analytics](#12-role-scoped-analytics)

---

## 1. Authentication & Account Management
**Base Path:** `/auth`

### 1.1 User Registration
* **Endpoint:** `POST /auth/register`
* **Access:** Public (No Auth)
* **Description:** Registers a new user account on the DCC platform. Different roles accept specific fields.
* **Payload Structure:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "MEMBER", // Options: MEMBER, BUSINESS, EMPLOYER, B2B, ASSOCIATION
  
  // Conditionally required if role is MEMBER:
  "firstName": "John",
  "lastName": "Doe",
  "age": 28,
  "sex": "M", // Options: M, F, OTHER
  "district": "George Town",
  "salaryLevel": "MID", // Options: ENTRY, MID, SENIOR, EXECUTIVE
  "employerId": "optional-uuid",
  
  // Conditionally required if role is BUSINESS:
  "businessName": "Super Grocery Mart",
  "phone": "345-555-0199",
  "address": "123 Main St",
  "district": "George Town",
  "categoryId": "category-uuid",
  
  // Conditionally required if role is EMPLOYER:
  "companyName": "Tech Solutions Ltd",
  "website": "https://techsolutions.ky",
  
  // Conditionally required if role is ASSOCIATION:
  "associationName": "Cayman Teachers Union",
  "associationType": "MEMBER", // Options: MEMBER, BUSINESS
  
  // Conditionally required if role is B2B:
  "companyName": "Office Supplies Inc",
  "servicesOffered": "Office chairs, paper supplies, technology hardware"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "MEMBER",
      "isEmailVerified": false
    },
    "token": "jwt_token_string"
  }
}
```

### 1.2 User Login
* **Endpoint:** `POST /auth/login`
* **Access:** Public (No Auth)
* **Description:** Authenticates credentials and returns a JWT token.
* **Payload Structure:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "MEMBER"
    },
    "token": "jwt_token_string"
  }
}
```

### 1.3 Fetch Profile
* **Endpoint:** `GET /auth/profile`
* **Access:** Protected (Any Role)
* **Description:** Retrieves the authenticated user's profile details.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "MEMBER",
    "createdAt": "2026-05-19T00:00:00.000Z",
    "member": {
      "id": "member-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "district": "George Town",
      "totalSavings": 124.50,
      "totalSpent": 1050.00
    }
  }
}
```

### 1.4 Update Profile
* **Endpoint:** `PUT /auth/profile`
* **Access:** Protected (Any Role)
* **Description:** Updates the profile attributes of the authenticated user.
* **Payload Structure:**
```json
{
  // For MEMBER profiles:
  "firstName": "John",
  "lastName": "Doe",
  "age": 29,
  "sex": "M",
  "district": "George Town",
  "salaryLevel": "MID",
  
  // For BUSINESS profiles:
  "name": "Super Grocery Mart Updated",
  "phone": "345-555-9999",
  "address": "456 Ocean Drive",
  "logoUrl": "https://res.cloudinary.com/...jpg",
  "website": "https://supergrocery.ky",
  
  // For EMPLOYER profiles:
  "companyName": "Tech Solutions Group",
  
  // For ASSOCIATION profiles:
  "name": "Teachers Association of Cayman"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "MEMBER"
    // Updated profile fields returned here
  }
}
```

---

## 2. Businesses, Directory & Categories
**Base Path:** `/business` & `/categories`

### 2.0 Fetch All Categories
* **Endpoint:** `GET /api/categories`
* **Access:** Public (No authentication required)
* **Description:** Returns a list of all available business categories, complete with their icons, banner images, and live counts of active deals and businesses associated with each category.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm3r5xk9e0000...",
      "name": "Food & Beverage",
      "slug": "food",
      "description": "Delicious dining experiences, cafes, and beverage deals across the island.",
      "imageUrl": "https://images.unsplash.com/...",
      "icon": "CakeIcon",
      "dealCount": 14,
      "businessCount": 6
    }
  ]
}
```

### 2.0.1 Fetch Single Category with Businesses
* **Endpoint:** `GET /api/categories/:slug`
* **Access:** Public (No authentication required)
* **Description:** Retrieves details for a specific category along with all approved businesses and their active offers within that category.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cm3r5xk9e0000...",
      "name": "Food & Beverage",
      "slug": "food",
      "imageUrl": "https://images.unsplash.com/...",
      "description": "Delicious dining experiences, cafes, and beverage deals across the island."
    },
    "businesses": [
      {
        "id": "biz-uuid",
        "name": "Oceanic Seafood Grille",
        "logoUrl": "https://...",
        "address": "45 Waterfront Dr",
        "district": "George Town",
        "phone": "345-555-4321",
        "website": "https://...",
        "offers": [
          {
            "id": "offer-uuid",
            "title": "20% Off Dinner",
            "type": "PERCENTAGE_DISCOUNT",
            "discountValue": 20,
            "expiryDate": "2026-12-31T00:00:00.000Z",
            "imageUrl": "https://..."
          }
        ]
      }
    ],
    "totalBusinesses": 1,
    "totalOffers": 1
  }
}
```

### 2.1 Fetch Approved Businesses Directory
* **Endpoint:** `GET /business`
* **Access:** Public or Protected
* **Description:** Returns a list of all active approved businesses for directory browsing.
* **Query Parameters:**
  * `category` (optional): Filter by category slug (e.g., `food`)
  * `district` (optional): Filter by geographical district (e.g., `George Town`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Businesses retrieved successfully",
  "data": [
    {
      "id": "business-uuid",
      "name": "Oceanic Seafood Grille",
      "logoUrl": "https://...",
      "district": "George Town",
      "address": "45 Waterfront Dr",
      "phone": "345-555-4321",
      "category": {
        "id": "category-uuid",
        "name": "Food & Beverage",
        "slug": "food"
      }
    }
  ]
}
```

### 2.2 Search Businesses
* **Endpoint:** `GET /business/search`
* **Access:** Public or Protected
* **Description:** Search businesses by name, description, or services.
* **Query Parameters:**
  * `q` (required): Search keyword string
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "business-uuid",
      "name": "Oceanic Seafood Grille",
      "description": "Premium local seafood restaurant..."
    }
  ]
}
```

### 2.3 Get Specific Business Details
* **Endpoint:** `GET /business/:id`
* **Access:** Protected (MEMBER or ADMIN)
* **Description:** Fetches complete profile and active discount/certificate offers for a single business.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "business-uuid",
    "name": "Oceanic Seafood Grille",
    "description": "Premium seafood dining experience",
    "phone": "345-555-4321",
    "email": "restaurant@oceanic.ky",
    "website": "https://oceanic.ky",
    "address": "45 Waterfront Dr",
    "district": "George Town",
    "logoUrl": "https://...",
    "category": {
      "name": "Food & Beverage"
    },
    "offers": [
      {
        "id": "offer-uuid",
        "title": "15% Off Your Entree",
        "description": "Valid Monday to Thursday",
        "type": "DISCOUNT",
        "discountValue": 15.0,
        "expiryDate": "2026-12-31T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 3. Discounts & Deals
**Base Path:** `/discounts`

### 3.1 Get All Active Discounts
* **Endpoint:** `GET /discounts`
* **Access:** Protected (MEMBER or ADMIN)
* **Description:** Returns a paginated list of active discount offers. Note: Business users will receive an empty array to prevent scouting competitors.
* **Query Parameters:**
  * `page` (optional): Default `1`
  * `limit` (optional): Default `20`
  * `category` (optional): Filter by business category name (e.g. `Retail`)
  * `businessId` (optional): Filter offers belonging to a specific business ID
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "discount-offer-uuid",
      "title": "Buy One Get One Free Coffee",
      "description": "Purchase any large espresso drink...",
      "discountValue": 100.0,
      "minSpend": 5.0,
      "expiryDate": "2026-08-31T00:00:00.000Z",
      "business": {
        "id": "business-uuid",
        "name": "Cozy Mug Cafe",
        "logoUrl": "https://...",
        "district": "George Town"
      }
    }
  ],
  "canRedeem": true, // true if member is active, false if expired/inactive
  "membershipStatus": "ACTIVE",
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 3.2 Initiate Redemption (Redeem Attempt)
* **Endpoint:** `POST /discounts/:id/redeem-attempt`
* **Access:** Protected (MEMBER only)
* **Description:** Evaluates if a member is eligible to redeem the discount. Returns explicit flags that the mobile app should use to render modal screens or direct the user to the membership upgrade page.
* **Success Response (Member is ACTIVE):**
```json
{
  "success": true,
  "statusCode": 200,
  "canRedeem": true,
  "membershipStatus": "ACTIVE",
  "offer": {
    "id": "discount-offer-uuid",
    "title": "Buy One Get One Free Coffee",
    "discountValue": 100.0,
    "business": {
      "id": "business-uuid",
      "name": "Cozy Mug Cafe"
    }
  }
}
```
* **Success Response (Member is INACTIVE / Needs Upgrade):**
```json
{
  "success": false,
  "statusCode": 200,
  "canRedeem": false,
  "reason": "NO_ACTIVE_MEMBERSHIP",
  "membershipStatus": "EXPIRED",
  "showUpgradeModal": true, // Mobile app should show membership modal
  "modalData": {
    "title": "Upgrade to Redeem",
    "message": "You need an active DCC membership to redeem this offer.",
    "offer": {
      "id": "discount-offer-uuid",
      "title": "Buy One Get One Free Coffee",
      "businessName": "Cozy Mug Cafe"
    },
    "ctaText": "Get Membership",
    "ctaLink": "/membership"
  }
}
```

### 3.3 Create New Discount Offer
* **Endpoint:** `POST /discounts`
* **Access:** Protected (BUSINESS only)
* **Description:** Allows an approved business to launch a new discount deal.
* **Payload Structure:**
```json
{
  "type": "DISCOUNT",
  "title": "Free Dessert with Main Course",
  "description": "Valid for dine-in tables only.",
  "imageUrl": "https://...",
  "discountValue": 12.0, // Face value/percentage value
  "minSpend": 25.0,
  "expiryDate": "2026-10-31T23:59:59.000Z"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Offer created successfully",
  "data": {
    "id": "new-offer-uuid",
    "title": "Free Dessert with Main Course",
    "isActive": true
  }
}
```

### 3.4 Update Discount Offer
* **Endpoint:** `PUT /discounts/:id`
* **Access:** Protected (BUSINESS / ADMIN)
* **Description:** Modifies existing fields of a discount offer.
* **Payload Structure:**
```json
{
  "title": "Free Dessert & Coffee with Main Course",
  "isActive": true
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Offer updated",
  "data": {
    "id": "offer-uuid",
    "title": "Free Dessert & Coffee with Main Course"
  }
}
```

### 3.5 Delete Discount Offer (Deactivation)
* **Endpoint:** `DELETE /discounts/:id`
* **Access:** Protected (BUSINESS / ADMIN)
* **Description:** Performs a soft delete by setting `isActive` to `false` so historical transactions remain valid.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Offer deactivated"
}
```

---

## 4. Certificates & Value Cards
**Base Paths:** `/certificates` and `/offers`

Value certificates represent prepaid products where members buy upfront for discount benefits (e.g. buy a $100 grocery gift voucher for $85 member price).

### 4.1 Browse Available Certificates
* **Endpoint:** `GET /certificates/available`
* **Access:** Protected (MEMBER / BUSINESS)
* **Description:** Lists all vouchers currently on sale. If called by a Business account, it lists only that business's created certificates.
* **Query Parameters:**
  * `page` (optional): Default `1`
  * `limit` (optional): Default `20`
  * `businessId` (optional): Filter vouchers by specific business
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cert-uuid",
      "faceValue": 100.0,
      "memberPrice": 85.0,
      "expiryDate": "2026-12-31T00:00:00.000Z",
      "offer": {
        "id": "offer-uuid",
        "title": "$100 Grocery Voucher",
        "type": "PREPAID_CERTIFICATE",
        "business": {
          "id": "business-uuid",
          "name": "Super Grocery Mart"
        }
      }
    }
  ],
  "canPurchase": true, // based on member's active status
  "membershipStatus": "ACTIVE",
  "pagination": { "total": 1, "page": 1, "limit": 20 }
}
```

### 4.2 Fetch Member's Purchased Certificates
* **Endpoint:** `GET /certificates/my`
* **Access:** Protected (MEMBER only)
* **Description:** Retrieves the current member's purchase history and unused codes.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "purchase-uuid",
      "uniqueCode": "DISC-KP83-7X9A-8822", // Member displays this code/QR
      "type": "PREPAID_CERTIFICATE",
      "status": "PURCHASED", // PURCHASED, REDEEMED, EXPIRED
      "faceValue": 100.0,
      "amountPaid": 85.0,
      "savingsAmount": 15.0,
      "businessName": "Super Grocery Mart",
      "title": "$100 Grocery Voucher",
      "expiryDate": "2026-12-31T00:00:00.000Z",
      "redeemedAt": null
    }
  ]
}
```

### 4.3 Purchase Certificate Checkout Session
* **Endpoint:** `POST /certificates/purchase`
* **Access:** Protected (MEMBER only)
* **Description:** Initiates Stripe checkout for a certificate voucher.
* **Payload Structure:**
```json
{
  "certificateId": "cert-uuid",
  "paymentProvider": "STRIPE", // PayPal or Stripe
  "successUrl": "dccapp://payment/success?session_id={CHECKOUT_SESSION_ID}", // Custom app scheme url
  "cancelUrl": "dccapp://payment/cancel"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "sessionId": "cs_test_..."
  }
}
```

### 4.4 Create Certificate Voucher (Staff Offer Setup)
* **Endpoint:** `POST /certificates`
* **Access:** Protected (BUSINESS only)
* **Description:** Creates stockable certificates under a predefined certificate-type offer.
* **Payload Structure:**
```json
{
  "offerId": "offer-uuid",
  "faceValue": 50.0,
  "memberPrice": 40.0,
  "expiryDate": "2026-11-30T00:00:00.000Z"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "data": {
    "id": "certificate-uuid",
    "faceValue": 50.0,
    "memberPrice": 40.0,
    "claimCode": "AB3F8C" // Used for manual business claim QR
  }
}
```

### 4.5 Business Staff Voids / Redeems Voucher (Member Code Scan)
* **Endpoint:** `POST /certificates/redeem-by-code`
* **Access:** Protected (BUSINESS only)
* **Description:** Redeems a member's purchased prepaid certificate when scanned at check-out via unique code.
* **Payload Structure:**
```json
{
  "uniqueCode": "DISC-KP83-7X9A-8822"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Certificate redeemed successfully! 🎉",
  "data": {
    "uniqueCode": "DISC-KP83-7X9A-8822",
    "status": "REDEEMED",
    "redeemedAt": "2026-05-19T06:40:00.000Z",
    "businessName": "Super Grocery Mart",
    "faceValue": 100.0,
    "memberPrice": 85.0,
    "type": "PREPAID_CERTIFICATE",
    "title": "$100 Grocery Voucher",
    "memberEmail": "member@example.com"
  }
}
```

### 4.6 Get Redemption History
* **Endpoint:** `GET /certificates/redemptions`
* **Access:** Protected (BUSINESS only)
* **Description:** Lists all redeemed/purchased vouchers belonging to the business.
* **Query Parameters:**
  * `page` (optional): Default `1`
  * `limit` (optional): Default `20`
  * `status` (optional): Filter status (e.g. `REDEEMED`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "purchase-uuid",
      "uniqueCode": "DISC-KP83-7X9A-8822",
      "status": "REDEEMED",
      "faceValue": 100.0,
      "amountPaid": 85.0,
      "title": "$100 Grocery Voucher",
      "redeemedAt": "2026-05-19T06:40:00.000Z",
      "memberEmail": "member@example.com"
    }
  ]
}
```

---

## 5. Employer Program (Corporate Benefits)
**Base Path:** `/employer`

Employers register to DCC to offer subsidized cards or corporate coupon perks to employees.

### 5.1 Join Corporate Account via Invite Code
* **Endpoint:** `POST /employer/join`
* **Access:** Protected (MEMBER only)
* **Description:** Associates a standard Member profile with their corporate employer.
* **Payload Structure:**
```json
{
  "inviteCode": "TECHSO-9X82"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Joined Tech Solutions Group successfully",
  "data": {
    "employerName": "Tech Solutions Group"
  }
}
```

### 5.2 Fetch Employer Profile
* **Endpoint:** `GET /employer/profile`
* **Access:** Protected (EMPLOYER only)
* **Description:** Retrieves the logged-in corporate employer's registration details.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "employer-uuid",
    "companyName": "Tech Solutions Group",
    "inviteCode": "TECHSO-9X82",
    "inviteCodeEnabled": true
  }
}
```

### 5.3 Fetch Employer Dashboard Statistics
* **Endpoint:** `GET /employer/dashboard`
* **Access:** Protected (EMPLOYER only)
* **Description:** Returns aggregate stats on employee headcount and overall employee co-op savings.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "employerName": "Tech Solutions Group",
    "inviteCode": "TECHSO-9X82",
    "memberCounts": {
      "total": 45,
      "active": 40,
      "invited": 5,
      "removed": 0
    },
    "totalSavings": 4250.75
  }
}
```

### 5.4 Add/Invite One Employee
* **Endpoint:** `POST /employer/members`
* **Access:** Protected (EMPLOYER only)
* **Description:** Triggers an email invite link to a single employee to register on DCC under the corporate pool.
* **Payload Structure:**
```json
{
  "name": "Jane Miller",
  "email": "jane@techsolutions.ky"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee invited successfully",
  "data": {
    "id": "emp-member-uuid",
    "name": "Jane Miller",
    "email": "jane@techsolutions.ky",
    "status": "INVITED"
  }
}
```

### 5.5 Bulk Upload Employees
* **Endpoint:** `POST /employer/members/bulk`
* **Access:** Protected (EMPLOYER only)
* **Description:** Uploads a JSON array of multiple employees.
* **Payload Structure:**
```json
{
  "members": [
    { "name": "Jack Vance", "email": "jack@techsolutions.ky" },
    { "name": "Clara Oswald", "email": "clara@techsolutions.ky" }
  ]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "2 employees invited successfully",
  "data": {
    "created": 2,
    "skipped": 0,
    "skippedEmails": []
  }
}
```

### 5.6 Remove Employee
* **Endpoint:** `DELETE /employer/members/:id`
* **Access:** Protected (EMPLOYER only)
* **Description:** Unlinks an employee from the employer group.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee removed successfully"
}
```

---

## 6. Associations & Member Groups
**Base Path:** `/association`

Associations represent community unions (e.g. credit unions, professional groups) grouping either Members or Businesses together.

### 6.1 Join Association via Join Code
* **Endpoint:** `POST /association/join`
* **Access:** Protected (MEMBER only)
* **Description:** Associates the logged-in Member with a Member-type Association.
* **Payload Structure:**
```json
{
  "joinCode": "TEACHERS-A3X9"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Joined Cayman Teachers Union successfully",
  "data": {
    "associationName": "Cayman Teachers Union"
  }
}
```

### 6.2 Fetch Association Dashboard
* **Endpoint:** `GET /association/dashboard`
* **Access:** Protected (ASSOCIATION only)
* **Description:** Retrieves aggregate member co-op savings, active links, or catalog counts depending on whether the association type is `MEMBER` or `BUSINESS`.
* **Success Response (MEMBER-type Association):**
```json
{
  "success": true,
  "data": {
    "associationType": "MEMBER",
    "joinCode": "TEACHERS-A3X9",
    "memberCounts": {
      "total": 120,
      "active": 110,
      "invited": 10,
      "removed": 0
    },
    "totalSavings": 12380.50,
    "topMembers": [
      {
        "id": "member-assoc-uuid",
        "name": "Sarah Connor",
        "email": "sarah@teachers.ky",
        "totalSavings": 420.00,
        "totalRedemptions": 18
      }
    ]
  }
}
```
* **Success Response (BUSINESS-type Association):**
```json
{
  "success": true,
  "data": {
    "associationType": "BUSINESS",
    "businessCounts": {
      "total": 12,
      "linked": 10,
      "pending": 2,
      "removed": 0
    },
    "totalActiveOffers": 24
  }
}
```

### 6.3 Link Business to Association
* **Endpoint:** `POST /association/businesses/link`
* **Access:** Protected (ASSOCIATION only)
* **Description:** Links an existing registered, approved business to a BUSINESS-type association.
* **Payload Structure:**
```json
{
  "businessId": "business-uuid"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Oceanic Seafood Grille linked successfully",
  "data": {
    "id": "link-uuid",
    "status": "LINKED",
    "business": {
      "id": "business-uuid",
      "name": "Oceanic Seafood Grille",
      "district": "George Town"
    }
  }
}
```

### 6.4 Invite New Unregistered Business
* **Endpoint:** `POST /association/businesses/invite`
* **Access:** Protected (ASSOCIATION only)
* **Description:** Sends an email invite to a new business to register under the association's banner.
* **Payload Structure:**
```json
{
  "businessName": "George Town Bakery",
  "email": "bakery@gt.ky"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Business invited successfully"
}
```

---

## 7. Transactions & QR Scan Redemption
**Base Path:** `/transactions`

### 7.1 Record QR Scan Transaction
* **Endpoint:** `POST /transactions/scan`
* **Access:** Protected (BUSINESS only)
* **Description:** Processed by the business staff's app after scanning a customer's member card QR code. Decodes demographic metrics, calculates co-op savings, and logs stats.
* **Payload Structure:**
```json
{
  "qrData": "MEMBER-ID-OR-SIGNED-PAYLOAD-STRING", // scanned from user screen QR
  "saleAmount": 85.50,
  "offerId": "optional-offer-uuid" // optional: specific discount applied
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Transaction recorded. Member saved $12.82.",
  "data": {
    "transaction": {
      "id": "transaction-uuid",
      "saleAmount": 85.50,
      "savingsAmount": 12.82, // calculated based on co-op discount
      "transactionDate": "2026-05-19T06:50:00.000Z",
      "status": "COMPLETED"
    },
    "memberName": "John Doe",
    "savingsAmount": 12.82
  }
}
```

### 7.2 Get Business Sales & Savings Given History
* **Endpoint:** `GET /transactions/business`
* **Access:** Protected (BUSINESS only)
* **Description:** Fetches transaction logs for the authenticated business dashboard.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-uuid",
        "saleAmount": 85.50,
        "savingsAmount": 12.82,
        "transactionDate": "2026-05-19T06:50:00.000Z"
      }
    ],
    "totalRevenue": 85.50,
    "totalSavingsGiven": 12.82
  }
}
```

---

## 8. Rotating Advertisements & Banner Clicks
**Base Path:** `/advertisements`

Used to serve home screen ad carousels on the mobile app.

### 8.1 Fetch Rotating Ad Banners
* **Endpoint:** `GET /advertisements`
* **Access:** Public or Protected
* **Description:** Returns rotating, active, approved visual ad banners. Shuffles randomly to ensure fair exposure.
* **Query Parameters:**
  * `placement` (optional): e.g. `header`
  * `position` (optional): e.g. `home_top`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "ad-banner-uuid",
      "title": "Visit Cayman Diving School",
      "imageUrl": "https://res.cloudinary.com/...jpg",
      "linkUrl": "https://caymandiving.ky",
      "placement": "header",
      "business": {
        "name": "Cayman Diving School"
      }
    }
  ]
}
```

### 8.2 Track Ad Banner Click
* **Endpoint:** `POST /advertisements/:id/click`
* **Access:** Public or Protected
* **Description:** Registers a click metric count. Call this in the app when the user taps an ad.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {}
}
```

### 8.3 Purchase & Upload Banner Ad
* **Endpoint:** `POST /advertisements`
* **Access:** Protected (BUSINESS only)
* **Description:** Uploads a custom promotional poster banner. Requires image attachment.
* **Request Format:** `multipart/form-data`
* **Payload Fields:**
  * `image` (File, required): Banner JPG/PNG file
  * `title` (String, required): "Weekend Summer Sale"
  * `linkUrl` (String, optional): "https://..."
  * `placement` (String, optional): Default `header`
  * `startDate` (ISO Date, optional)
  * `endDate` (ISO Date, optional)
* **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Advertisement created and pending approval",
  "data": {
    "id": "ad-uuid",
    "title": "Weekend Summer Sale",
    "imageUrl": "https://res.cloudinary.com/...jpg",
    "status": "PENDING"
  }
}
```

---

## 9. B2B Partner Directory & Enquiries
**Base Path:** `/b2b`

Serves professional services listing directories (e.g. accounting, shipping, marketing) for local businesses.

### 9.1 Browse B2B Directory
* **Endpoint:** `GET /b2b/directory`
* **Access:** Public or Protected
* **Description:** Fetch approved co-op service companies.
* **Query Parameters:**
  * `search` (optional): Query keyword filter
  * `page` (optional): Default `1`
  * `limit` (optional): Default `20`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": "b2b-partner-uuid",
        "companyName": "Apex Accounting Services",
        "servicesOffered": "Corporate tax filing, bookkeeping, audit consulting",
        "phone": "345-555-8811",
        "email": "info@apex.ky",
        "logoUrl": "https://...",
        "website": "https://apex.ky"
      }
    ],
    "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

### 9.2 Submit Business Inquiry
* **Endpoint:** `POST /b2b/enquire/:partnerId`
* **Access:** Protected (MEMBER, EMPLOYER, ASSOCIATION, or BUSINESS)
* **Description:** Sends a contact/rfp inquiry request straight to the B2B partner's DCC inbox.
* **Payload Structure:**
```json
{
  "name": "David Miller",
  "email": "david@mycafe.ky",
  "phone": "345-555-9281",
  "subject": "Corporate audit service quote request",
  "message": "Hello, we would like to get a quote for a monthly audit of our café..."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Enquiry sent successfully",
  "data": {
    "id": "inquiry-uuid"
  }
}
```

---

## 10. Payments & Memberships
**Base Path:** `/payments`

Handles DCC Annual Membership subscriptions ($89.99/yr) and voucher transactions.

### 10.1 Create Membership Stripe Subscription
* **Endpoint:** `POST /payments/stripe/checkout`
* **Access:** Protected (MEMBER, EMPLOYER, or BUSINESS)
* **Description:** Creates a Stripe billing checkout session.
* **Payload Structure:**
```json
{
  "type": "membership",
  "items": [],
  "metadata": {}
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "sessionId": "cs_test_..."
  }
}
```

### 10.2 Create Membership PayPal Checkout Order
* **Endpoint:** `POST /payments/paypal/checkout`
* **Access:** Protected (MEMBER or EMPLOYER)
* **Description:** Places an order in PayPal systems for co-op subscription purchase.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "orderId": "pay-order-uuid",
    "links": [
      { "href": "https://www.sandbox.paypal.com/checkoutnow?token=...", "rel": "approve", "method": "GET" }
    ]
  }
}
```

### 10.3 Verify Stripe Membership Payment (Session Verification)
* **Endpoint:** `GET /payments/stripe/verify` (Alternative alias: `GET /payments/verify-session`)
* **Access:** Protected (Any logged-in buyer role)
* **Description:** Verifies Stripe checkout sessions, flags membership profile as active, and returns activation details.
* **Query Parameters:**
  * `session_id` (required): Stripe session code
* **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Membership verified",
  "data": {
    "type": "membership",
    "activated": true
  }
}
```

### 10.4 Verify Purchased Certificate Session
* **Endpoint:** `GET /payments/verify-certificate-session`
* **Access:** Protected (MEMBER only)
* **Description:** Verifies payment details for certificate checkout sessions.
* **Query Parameters:**
  * `session_id` (required): Stripe session code
* **Success Response (200 OK):**
```json
{
  "success": true,
  "certificate": {
    "id": "purchase-uuid",
    "uniqueCode": "DISC-AB3X-KP7Q-MN2R",
    "status": "PURCHASED",
    "faceValue": 100.0,
    "amountPaid": 85.0
  }
}
```

---

## 11. Generic File Uploads
**Base Path:** `/upload`

### 11.1 Image Upload to Cloudinary
* **Endpoint:** `POST /upload/image`
* **Access:** Protected (Any Role)
* **Description:** Uploads a profile picture, receipt image, or banner logo directly.
* **Request Format:** `multipart/form-data`
* **Payload Fields:**
  * `file` (File, required): Image file (JPG/PNG)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "url": "https://res.cloudinary.com/dcc-cloud/image/upload/v129381/general/my-uploaded-file.png"
  }
}
```

---

## 12. Role-Scoped Analytics
**Base Path:** `/analytics`

Allows mobile clients to fetch role-specific metric stats for beautiful user dashboards.

### 12.1 Get Scoped User Stats
* **Endpoint:** `GET /analytics/role-stats`
* **Access:** Protected (Any Authenticated Role)
* **Description:** Automatically detects the user's role and returns custom aggregate co-op metrics.
* **Query Parameters:**
  * `period` (optional): Default `month_to_date`. Options: `current_week`, `last_week`, `month_to_date`, `year_to_date`, `prior_year`, `lifetime`.
* **Success Response (MEMBER role):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "period": "month_to_date",
    "role": "MEMBER",
    "totalTransactions": 14,
    "totalSavings": 182.40,
    "totalSpent": 1240.00,
    "certificatesPurchased": 3
  }
}
```
* **Success Response (BUSINESS role):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "period": "month_to_date",
    "role": "BUSINESS",
    "totalTransactions": 234,
    "totalSales": 18450.00,
    "totalSavingsGiven": 2767.50,
    "totalRedemptions": 142,
    "certificatesRedeemed": 18
  }
}
```
* **Success Response (EMPLOYER role):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "period": "month_to_date",
    "role": "EMPLOYER",
    "totalEmployees": 45,
    "activeMembers": 40,
    "totalTransactions": 180,
    "totalSavings": 4250.75
  }
}
```
