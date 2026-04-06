# DCC Platform - Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** April 4, 2026  
**Base URL:** `http://localhost:5000/api` (Development) or `https://your-production-url/api`

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [User Management](#3-user-management)
4. [Member Features](#4-member-features)
5. [Business Management](#5-business-management)
6. [Memberships & Subscriptions](#6-memberships--subscriptions)
7. [Payment Processing](#7-payment-processing)
8. [Certificates & Redemption](#8-certificates--redemption)
9. [Offers & Discounts](#9-offers--discounts)
10. [Categories](#10-categories)
11. [Travel & Bookings](#11-travel--bookings)
12. [Employer Management](#12-employer-management)
13. [Association Management](#13-association-management)
14. [B2B Partners](#14-b2b-partners)
15. [Advertisements](#15-advertisements)
16. [Analytics & Reporting](#16-analytics--reporting)
17. [Contact & Support](#17-contact--support)
18. [Admin Dashboard](#18-admin-dashboard)
19. [Upload & Media](#19-upload--media)

---

## 1. Authentication & Authorization

### Overview

All protected endpoints require:

- **Authorization Header**: `Authorization: Bearer <JWT_TOKEN>`
- **JWT Validation**: Token must be valid and user account must be active

### User Roles

| Role          | Use Case                                 |
| ------------- | ---------------------------------------- |
| `MEMBER`      | Individual subscription holder           |
| `BUSINESS`    | Business offering discounts/certificates |
| `EMPLOYER`    | Company providing employee benefits      |
| `ASSOCIATION` | Organization offering member benefits    |
| `B2B`         | B2B partner company                      |
| `ADMIN`       | Platform administrator                   |

### Response Format

**Success Response (2xx)**

```json
{
  "success": true,
  "message": "Description of success",
  "data": {
    /* response payload */
  }
}
```

**Paginated Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    /* items */
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

**Error Response (4xx/5xx)**

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 200  | OK - Request successful                         |
| 201  | Created - Resource created successfully         |
| 400  | Bad Request - Invalid input or validation error |
| 401  | Unauthorized - No token or invalid token        |
| 403  | Forbidden - Insufficient permissions            |
| 404  | Not Found - Resource doesn't exist              |
| 409  | Conflict - Duplicate or conflicting resource    |
| 500  | Server Error - Internal server error            |

---

## 2. Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "MEMBER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-345-222-1234",
  "district": "George Town"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "MEMBER",
      "isEmailVerified": false,
      "isActive": true
    },
    "token": "eyJhbGc..."
  }
}
```

**Status Codes**

- `201` - Account created, verification email sent
- `400` - Missing/invalid fields or validation error
- `409` - Email already registered

---

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "MEMBER",
      "isActive": true
    },
    "token": "eyJhbGc...",
    "expiresIn": 86400
  }
}
```

**Status Codes**

- `200` - Login successful
- `400` - Missing credentials
- `401` - Invalid email or password
- `403` - Account is inactive

---

### Verify Email

**GET** `/auth/verify/:token`

Verify email address using token from email link.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": { "verified": true }
}
```

---

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset email.

**Request Body**

```json
{
  "email": "user@example.com"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### Reset Password

**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body**

```json
{
  "token": "reset_token_xxx",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### Refresh Token

**POST** `/auth/refresh-token`

Get a new JWT token.

**Request Body**

```json
{
  "refreshToken": "xxx"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "expiresIn": 86400
  }
}
```

---

### Get Current User

**GET** `/auth/me`

**Auth Required**: ✅ Bearer token

Get authenticated user's profile information.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "MEMBER",
    "isActive": true,
    "isEmailVerified": true,
    "member": {
      /* member profile */
    },
    "business": {
      /* business profile */
    }
  }
}
```

---

## 3. User Management

### Get All Users

**GET** `/users`

**Auth Required**: ✅ ADMIN only

List all users with optional filtering.

**Query Parameters**

```
page=1              (default: 1)
limit=10            (default: 10)
role=MEMBER         (filter: MEMBER|BUSINESS|EMPLOYER|ASSOCIATION|B2B|ADMIN)
search=john@        (search email - case insensitive)
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "role": "MEMBER",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2026-03-15T08:00:00Z",
      "member": { "firstName": "John", "lastName": "Doe" },
      "business": null
    }
  ],
  "pagination": { "total": 450, "page": 1, "limit": 10, "pages": 45 }
}
```

---

### Get User by ID

**GET** `/users/:id`

**Auth Required**: ✅ Bearer token (own profile or ADMIN)

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "MEMBER",
    "member": {
      /* member data */
    },
    "employer": null,
    "association": null,
    "business": null
  }
}
```

---

### Update User Profile

**PUT** `/users/:id`

**Auth Required**: ✅ Bearer token (own profile or ADMIN)

**Request Body**

```json
{
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    /* updated user */
  }
}
```

---

### Delete User

**DELETE** `/users/:id`

**Auth Required**: ✅ ADMIN only

**Response** `200 OK`

```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## 4. Member Features

### Get Member Profile

**GET** `/member/profile`

**Auth Required**: ✅ MEMBER only

Get authenticated member's profile.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "member_123",
    "userId": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-345-222-1234",
    "district": "George Town",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "profileImage": "https://...",
    "createdAt": "2026-03-15T08:00:00Z"
  }
}
```

---

### Update Member Profile

**PUT** `/member/profile`

**Auth Required**: ✅ MEMBER only

**Request Body**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-345-222-1234",
  "district": "George Town",
  "dateOfBirth": "1990-05-15",
  "gender": "M"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    /* updated member profile */
  }
}
```

---

### Get Member QR Card

**GET** `/member/qr`

**Auth Required**: ✅ MEMBER only

Get member's digital membership QR code.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "memberId": "member_123",
    "membershipId": "membership_123",
    "expiryDate": "2027-03-15"
  }
}
```

---

### Get Savings Dashboard

**GET** `/member/savings`

**Auth Required**: ✅ MEMBER only

View member's accumulated savings and benefits.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalSavings": 5420.5,
    "membershipValue": 999.0,
    "certificatesSaved": 1200.0,
    "discountsSaved": 3221.5,
    "certificatesRedeemed": 12,
    "certificatesPending": 5,
    "lastTransactionDate": "2026-04-03T14:30:00Z"
  }
}
```

---

### Get Transaction History

**GET** `/member/transactions`

**Auth Required**: ✅ MEMBER only

View all member's transactions.

**Query Parameters**

```
page=1
limit=20
type=CERTIFICATE|DISCOUNT|MEMBERSHIP
status=COMPLETED|PENDING
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "trans_123",
      "type": "CERTIFICATE",
      "amount": 150.0,
      "status": "COMPLETED",
      "description": "Certificate purchase - Restaurant discount",
      "createdAt": "2026-04-03T14:30:00Z"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
}
```

---

## 5. Business Management

### List All Businesses

**GET** `/businesses`

**Auth Required**: ❌ Public

List all approved businesses.

**Query Parameters**

```
page=1
limit=20
categoryId=cat_123
search=name or description
district=George Town
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "business_123",
      "name": "Tech Solutions Ltd",
      "email": "info@techsol.ky",
      "phone": "+1-345-222-1111",
      "description": "IT consulting and software development",
      "logo": "https://...",
      "category": { "id": "cat_456", "name": "Technology" },
      "location": { "address": "123 Main St", "district": "George Town" },
      "isApproved": true,
      "createdAt": "2026-03-15T08:00:00Z"
    }
  ]
}
```

---

### Get Business Profile

**GET** `/businesses/:id`

**Auth Required**: ❌ Public (optional auth for member-specific features)

Get detailed business profile and their active offers.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "business_123",
    "name": "Tech Solutions Ltd",
    "description": "IT consulting and software development",
    "email": "info@techsol.ky",
    "phone": "+1-345-222-1111",
    "logo": "https://...",
    "images": ["https://...", "https://..."],
    "category": { "id": "cat_456", "name": "Technology" },
    "location": { "address": "123 Main St", "district": "George Town" },
    "website": "https://techsol.ky",
    "isApproved": true,
    "offers": [
      /* active offers */
    ],
    "certificates": [
      /* available certificates */
    ],
    "discounts": [
      /* active discounts */
    ]
  }
}
```

---

### Get My Business Profile (Business Owner)

**GET** `/businesses/me/profile`

**Auth Required**: ✅ BUSINESS only

Get authenticated business's profile.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* business profile */
  }
}
```

---

### Update Business Profile (Business Owner)

**PUT** `/businesses/me/profile`

**Auth Required**: ✅ BUSINESS only

Update business details.

**Request Body**

```json
{
  "name": "Tech Solutions Ltd",
  "description": "IT consulting services",
  "email": "contact@techsol.ky",
  "phone": "+1-345-222-1111",
  "website": "https://techsol.ky",
  "category": "Technology",
  "address": "123 Main Street",
  "district": "George Town",
  "registrationNumber": "BC123456"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Business profile updated",
  "data": {
    /* updated profile */
  }
}
```

---

### Upload Business Logo

**POST** `/businesses/me/logo`

**Auth Required**: ✅ BUSINESS only

Upload business logo image.

**Form Data**

```
logo: <file>  (image only, max 5MB)
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": { "logoUrl": "https://..." }
}
```

---

### Upload Business Images

**POST** `/businesses/me/images`

**Auth Required**: ✅ BUSINESS only

Upload multiple business gallery images (max 5).

**Form Data**

```
images: <files>  (multiple files, max 5)
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": { "imageUrls": ["https://...", "https://..."] }
}
```

---

## 6. Memberships & Subscriptions

### Get Available Plans

**GET** `/membership/plans`

**Auth Required**: ❌ Public

List all available membership plans.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "plan_individual_monthly",
      "name": "Individual Monthly",
      "type": "INDIVIDUAL",
      "billingCycle": "MONTHLY",
      "price": 29.99,
      "currency": "KYD",
      "benefits": [
        "Access to all discounts",
        "Digital membership card",
        "Member rewards"
      ],
      "limits": {
        "certificatesPerMonth": 10,
        "discountRedeemsPerMonth": 20
      }
    },
    {
      "id": "plan_family_annual",
      "name": "Family Annual",
      "type": "FAMILY",
      "billingCycle": "ANNUAL",
      "price": 199.99,
      "currency": "KYD"
    }
  ]
}
```

---

### Get My Membership

**GET** `/membership/my`

**Auth Required**: ✅ MEMBER only

Get current member's membership status and details.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "membership_123",
    "memberId": "member_123",
    "plan": {
      "id": "plan_individual_monthly",
      "name": "Individual Monthly",
      "type": "INDIVIDUAL",
      "price": 29.99
    },
    "status": "ACTIVE",
    "startDate": "2026-03-15T00:00:00Z",
    "expiryDate": "2026-04-15T00:00:00Z",
    "autoRenew": true,
    "daysRemaining": 11,
    "paymentMethod": "stripe",
    "lastPaymentDate": "2026-03-15T08:30:00Z",
    "nextBillingDate": "2026-04-15T00:00:00Z"
  }
}
```

---

### Subscribe to Plan

**POST** `/membership/subscribe`

**Auth Required**: ✅ MEMBER only

Activate membership after successful payment.

**Request Body**

```json
{
  "planType": "INDIVIDUAL",
  "paymentProvider": "stripe",
  "paymentId": "pi_1234567890"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Membership activated successfully",
  "data": {
    /* membership record */
  }
}
```

---

### Cancel Membership

**PUT** `/membership/:id/cancel`

**Auth Required**: ✅ MEMBER only

Cancel active membership.

**Request Body**

```json
{
  "reason": "Too expensive",
  "feedback": "Looking for alternative service"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Membership cancelled",
  "data": { "status": "CANCELLED", "cancelledAt": "2026-04-03T15:00:00Z" }
}
```

---

## 7. Payment Processing

### Create Stripe Checkout Session (Membership)

**POST** `/payments/stripe/checkout`

**Auth Required**: ✅ MEMBER, EMPLOYER, or BUSINESS

Create Stripe checkout session for membership purchase or banner.

**Request Body**

```json
{
  "planId": "plan_individual_monthly",
  "type": "membership"
}
```

Or for banner:

```json
{
  "bannerTitle": "Summer Sale",
  "bannerImageUrl": "https://...",
  "bannerLinkUrl": "https://...",
  "bannerPosition": "HEADER",
  "bannerDuration": 30,
  "type": "banner"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxxxx",
    "clientSecret": "pi_1234567890_secret_xxxxx",
    "url": "https://checkout.stripe.com/pay/cs_live_xxxxx"
  }
}
```

---

### Create PayPal Checkout Session

**POST** `/payments/paypal/checkout`

**Auth Required**: ✅ MEMBER or EMPLOYER

**Request Body**

```json
{
  "planId": "plan_individual_monthly",
  "returnUrl": "https://your-app.com/success",
  "cancelUrl": "https://your-app.com/cancel"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "EC-5OX10984X1234567T",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=EC-5OX10984X1234567T"
  }
}
```

---

### Capture PayPal Payment

**POST** `/payments/paypal/capture`

**Auth Required**: ✅ MEMBER or EMPLOYER

Capture and process PayPal payment.

**Request Body**

```json
{
  "token": "EC-5OX10984X1234567T",
  "planId": "plan_individual_monthly"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "transactionId": "XXXXX",
    "status": "COMPLETED",
    "membership": {
      /* membership record */
    }
  }
}
```

---

### Verify Stripe Session

**GET** `/payments/stripe/verify`

**Auth Required**: ✅ MEMBER, EMPLOYER, or BUSINESS

Verify payment completion and activate membership.

**Query Parameters**

```
session_id=cs_live_xxxxx
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "type": "membership",
    "activated": true,
    "membership": {
      /* membership details */
    }
  }
}
```

---

### Stripe Webhook Handler

**POST** `/payments/stripe/webhook`

**Auth Required**: ❌ None (Stripe signature verification required)

Handle Stripe webhook events (charge.succeeded, etc.).

---

### Verify Certificate Session

**GET** `/payments/verify-certificate-session`

**Auth Required**: ✅ MEMBER only

Verify certificate purchase payment.

**Query Parameters**

```
session_id=cs_live_xxxxx
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "certificate": {
      /* certificate details */
    },
    "purchase": {
      /* purchase record */
    }
  }
}
```

---

### Redeem Certificate (Member)

**POST** `/payments/redeem`

**Auth Required**: ✅ MEMBER only

Mark VALUE_ADDED certificate as redeemed.

**Request Body**

```json
{
  "purchaseId": "purchase_123"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "certificate": {
    "id": "purchase_123",
    "status": "REDEEMED",
    "redeemedAt": "2026-04-03T15:30:00Z"
  }
}
```

---

## 8. Certificates & Redemption

### Get Available Certificates

**GET** `/certificates/available`

**Auth Required**: ✅ MEMBER or BUSINESS

List all available certificates for purchase.

**Query Parameters**

```
page=1
limit=20
categoryId=cat_123
search=keyword
priceRange=min-max
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cert_123",
      "businessId": "business_456",
      "business": { "name": "Restaurant XYZ" },
      "title": "Dinner Voucher",
      "description": "KYD 50 dining credit",
      "actualValue": 50.0,
      "sellingPrice": 35.0,
      "quantity": 100,
      "expiryDate": "2026-12-31",
      "image": "https://...",
      "category": "Food & Beverage"
    }
  ],
  "pagination": { "total": 245, "page": 1, "limit": 20, "pages": 13 }
}
```

---

### Get My Certificates (Member)

**GET** `/certificates/my`

**Auth Required**: ✅ MEMBER only

View all member's purchased certificates.

**Query Parameters**

```
page=1
limit=20
status=PURCHASED|REDEEMED|EXPIRED|TRANSFERRED
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "purchase_123",
      "certificate": {
        "id": "cert_123",
        "title": "Dinner Voucher",
        "actualValue": 50.0,
        "business": { "name": "Restaurant XYZ" }
      },
      "uniqueCode": "DISC-KYD-123456",
      "purchaseDate": "2026-03-20T10:00:00Z",
      "expiryDate": "2026-12-31",
      "status": "PURCHASED",
      "value": 35.0
    }
  ]
}
```

---

### Get Business Certificates

**GET** `/certificates/business`

**Auth Required**: ✅ BUSINESS only

Get all certificates offered by authenticated business.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cert_123",
      "title": "Dinner Voucher",
      "description": "KYD 50 dining credit",
      "actualValue": 50.0,
      "sellingPrice": 35.0,
      "totalSold": 45,
      "totalRedeemed": 12,
      "quantity": 100,
      "createdAt": "2026-03-15"
    }
  ]
}
```

---

### Create Certificate (Business)

**POST** `/certificates`

**Auth Required**: ✅ BUSINESS only

Create a new certificate for sale.

**Request Body**

```json
{
  "title": "Dinner Voucher",
  "description": "KYD 50 dining credit - Valid on Fridays & Saturdays",
  "actualValue": 50.0,
  "sellingPrice": 35.0,
  "quantity": 100,
  "expiryDate": "2026-12-31",
  "image": "https://...",
  "terms": "Non-transferable. One per transaction."
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Certificate created",
  "data": {
    /* certificate details */
  }
}
```

---

### Check Redeem Eligibility

**POST** `/certificates/redeem-check`

**Auth Required**: ✅ MEMBER only

Check if member can redeem a certificate.

**Request Body**

```json
{
  "certificateId": "cert_123"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "canRedeem": true,
    "membershipStatus": "ACTIVE",
    "reason": null
  }
}
```

Or if ineligible:

```json
{
  "success": true,
  "data": {
    "canRedeem": false,
    "membershipStatus": "INACTIVE",
    "reason": "Active membership required to redeem certificates"
  }
}
```

---

### Purchase Certificate (Member)

**POST** `/certificates/purchase`

**Auth Required**: ✅ MEMBER only

Purchase a certificate (creates checkout session).

**Request Body**

```json
{
  "certificateId": "cert_123",
  "quantity": 1
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxxxx",
    "clientSecret": "pi_1234567890_secret_xxxxx",
    "url": "https://checkout.stripe.com/pay/cs_live_xxxxx"
  }
}
```

---

### Redeem Certificate (Business - by QR)

**POST** `/certificates/redeem`

**Auth Required**: ✅ BUSINESS only

Business redeems certificate by scanning QR (claimCode).

**Request Body**

```json
{
  "claimCode": "CLAIM-ABC123XYZ"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "certificate": {
      /* certificate details */
    },
    "redeemDetails": {
      "claimCode": "CLAIM-ABC123XYZ",
      "redeemedAt": "2026-04-03T15:45:00Z"
    }
  }
}
```

---

### Redeem Certificate by Member Code

**POST** `/certificates/redeem-by-code`

**Auth Required**: ✅ BUSINESS only

Business redeems certificate by member's unique code (DISC-XXXX).

**Request Body**

```json
{
  "uniqueCode": "DISC-KYD-123456"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "member": { "firstName": "John", "lastName": "Doe" },
    "certificate": {
      /* certificate details */
    },
    "status": "REDEEMED"
  }
}
```

---

### Get Redemption History (Business)

**GET** `/certificates/redemptions`

**Auth Required**: ✅ BUSINESS only

View all redemptions for business's certificates.

**Query Parameters**

```
page=1
limit=20
certificateId=cert_123
dateRange=start-date;end-date
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "redemption_123",
      "member": { "firstName": "John", "lastName": "Doe" },
      "certificate": { "title": "Dinner Voucher" },
      "uniqueCode": "DISC-KYD-123456",
      "redeemedAt": "2026-04-03T15:45:00Z",
      "value": 50.0
    }
  ],
  "pagination": { "total": 156, "page": 1, "limit": 20, "pages": 8 }
}
```

---

## 9. Offers & Discounts

### Get Offers by Category

**GET** `/offers/by-category/:categoryId`

**Auth Required**: ❌ Public

Get all offers in a category.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "offer_123",
      "businessId": "business_456",
      "business": { "name": "Tech Store" },
      "title": "20% Off Laptops",
      "description": "Limited time offer on selected laptops",
      "discount": 20,
      "discountType": "PERCENTAGE",
      "validFrom": "2026-04-01",
      "validTo": "2026-04-30",
      "isActive": true
    }
  ]
}
```

---

### Get Business Offers

**GET** `/offers/:businessId`

**Auth Required**: ❌ Public (optional auth for member features)

Get all offers from a specific business.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "offer_123",
      "title": "20% Off Laptops",
      "description": "Limited time offer",
      "discount": 20,
      "discountType": "PERCENTAGE",
      "validFrom": "2026-04-01",
      "validTo": "2026-04-30",
      "isActive": true,
      "termsAndConditions": "Cannot be combined with other offers"
    }
  ]
}
```

---

### Get All Discounts (Member)

**GET** `/discounts`

**Auth Required**: ✅ Bearer token

List all active discount offers.

**Query Parameters**

```
page=1
limit=20
categoryId=cat_123
search=keyword
sortBy=latest|popular|discount
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "discount_123",
      "business": { "id": "bus_456", "name": "Electronics Store" },
      "title": "25% Off Smartphones",
      "description": "Get 25% discount on all smartphones",
      "discount": 25,
      "discountType": "PERCENTAGE",
      "validFrom": "2026-04-01",
      "validTo": "2026-05-31",
      "category": "Electronics",
      "location": "George Town",
      "image": "https://...",
      "isActive": true
    }
  ],
  "pagination": { "total": 320, "page": 1, "limit": 20, "pages": 16 }
}
```

---

### Get Discount by ID

**GET** `/discounts/:id`

**Auth Required**: ✅ Bearer token

Get detailed discount information.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "discount_123",
    "business": {
      "id": "bus_456",
      "name": "Electronics Store",
      "phone": "+1-345-222-1111",
      "address": "123 Main St"
    },
    "title": "25% Off Smartphones",
    "description": "Get 25% discount on all smartphones",
    "discount": 25,
    "discountType": "PERCENTAGE",
    "validFrom": "2026-04-01",
    "validTo": "2026-05-31",
    "termsAndConditions": "Valid on in-store purchases only",
    "howToRedeem": "Show membership card at checkout"
  }
}
```

---

### Redeem Discount Attempt

**POST** `/discounts/:id/redeem-attempt`

**Auth Required**: ✅ MEMBER only

Check if member can redeem discount (triggers upgrade modal if needed).

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "canRedeem": true,
    "showUpgradeModal": false,
    "modalData": null
  }
}
```

Or if membership upgrade needed:

```json
{
  "success": true,
  "data": {
    "canRedeem": false,
    "showUpgradeModal": true,
    "modalData": {
      "title": "Upgrade Your Membership",
      "message": "This discount requires an active membership",
      "upgradeUrl": "/membership"
    }
  }
}
```

---

### Create Discount (Business)

**POST** `/discounts`

**Auth Required**: ✅ BUSINESS only

Create a new discount offer.

**Request Body**

```json
{
  "title": "25% Off Smartphones",
  "description": "Get 25% discount on all smartphones",
  "discount": 25,
  "discountType": "PERCENTAGE",
  "validFrom": "2026-04-01",
  "validTo": "2026-05-31",
  "termsAndConditions": "Valid on in-store purchases only",
  "howToRedeem": "Show membership card at checkout",
  "image": "https://..."
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Discount created",
  "data": {
    /* discount details */
  }
}
```

---

### Get My Discounts (Business)

**GET** `/discounts/my/offers`

**Auth Required**: ✅ BUSINESS only

Get authenticated business's discount offers.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "discount_123",
      "title": "25% Off Smartphones",
      "discount": 25,
      "validFrom": "2026-04-01",
      "validTo": "2026-05-31",
      "isActive": true,
      "views": 234,
      "redeemAttempts": 45
    }
  ]
}
```

---

### Update Discount (Business)

**PUT** `/discounts/:id`

**Auth Required**: ✅ BUSINESS or ADMIN only

Update an existing discount.

**Request Body**

```json
{
  "title": "30% Off Smartphones",
  "discount": 30,
  "validTo": "2026-06-30"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Discount updated",
  "data": {
    /* updated discount */
  }
}
```

---

### Delete Discount (Business)

**DELETE** `/discounts/:id`

**Auth Required**: ✅ BUSINESS or ADMIN only

Delete a discount offer.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Discount deleted"
}
```

---

## 10. Categories

### Get All Categories

**GET** `/categories`

**Auth Required**: ❌ Public

List all categories with live deal counts.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Food & Beverage",
      "slug": "food-beverage",
      "description": "Restaurants, cafes, and food delivery services",
      "icon": "🍽️",
      "image": "https://...",
      "activeDeals": 45,
      "activeBusinesses": 23,
      "relatedCategories": ["cat_456", "cat_789"]
    },
    {
      "id": "cat_124",
      "name": "Electronics",
      "slug": "electronics",
      "activeDeals": 32,
      "activeBusinesses": 18
    }
  ]
}
```

---

### Get Category by Slug

**GET** `/categories/:slug`

**Auth Required**: ❌ Public

Get category details with its businesses and offers.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "cat_123",
    "name": "Food & Beverage",
    "slug": "food-beverage",
    "description": "Restaurants, cafes, and food delivery",
    "image": "https://...",
    "businesses": [
      {
        "id": "bus_123",
        "name": "Gourmet Restaurant",
        "location": "George Town",
        "offers": [
          /* active offers */
        ]
      }
    ],
    "discounts": [
      /* all discounts in category */
    ],
    "statistics": {
      "totalBusinesses": 23,
      "totalOffers": 45,
      "averageDiscount": 18.5
    }
  }
}
```

---

## 11. Travel & Bookings

### Search Locations

**GET** `/travel/locations`

**Auth Required**: ✅ Bearer token

Autocomplete location search using Amadeus API.

**Query Parameters**

```
query=Cayman     (search term)
limit=10
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "iataCode": "CUN",
      "name": "Cancun",
      "subType": "CITY",
      "timeZoneOffset": "-05:00"
    },
    {
      "iataCode": "MIA",
      "name": "Miami",
      "subType": "CITY"
    }
  ]
}
```

---

### Search Hotels

**GET** `/travel/hotels`

**Auth Required**: ✅ Bearer token

Search hotels using Amadeus Hotel Search API.

**Query Parameters**

```
checkInDate=2026-06-01       (YYYY-MM-DD)
checkOutDate=2026-06-05
adults=2
children=0
roomQuantity=1
locationCode=LON              (IATA code)
radius=20
radiusUnit=KM
limit=20
page=1
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "RTKXS50",
        "name": "Hotel 1 - George Town",
        "availableCount": 5,
        "ratedCount": 100,
        "rating": 4.5,
        "address": "123 Main Street, George Town",
        "image": "https://...",
        "offers": [
          {
            "id": "1",
            "checkInDate": "2026-06-01",
            "checkOutDate": "2026-06-05",
            "ratedSupplier": "Amadeus",
            "room": {
              "type": "DOUBLE",
              "typeEstimated": { "category": "DELUXE" },
              "description": { "text": "Double room with sea view" }
            },
            "guests": [{ "adults": 2 }],
            "price": {
              "currency": "KYD",
              "base": "500.00",
              "total": "550.00",
              "variations": {
                "average": { "base": "100.00" },
                "total": "110.00"
              }
            },
            "policies": { "cancellation": { "type": "FREE" } }
          }
        ]
      }
    ],
    "pagination": { "totalCount": 245, "pageCount": 13, "currentPage": 1 }
  }
}
```

---

### Get Hotel Offer Details

**GET** `/travel/hotels/:offerId`

**Auth Required**: ✅ Bearer token

Get detailed information for a hotel offer.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "hotel": {
      /* hotel details */
    },
    "offer": {
      "id": "1",
      "room": { "type": "DOUBLE", "description": "Deluxe double room" },
      "price": { "base": "500.00", "total": "550.00" },
      "policies": { "cancellation": { "type": "FREE" } }
    }
  }
}
```

---

### Search Flights

**GET** `/travel/flights`

**Auth Required**: ✅ Bearer token

Search flights using Amadeus Flight Search API.

**Query Parameters**

```
originLocationCode=CYM       (IATA code)
destinationLocationCode=MIA
departureDate=2026-06-01
returnDate=2026-06-05        (optional)
adults=2
children=0
travelClass=ECONOMY
limit=20
currencyCode=KYD
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "source": "GDS",
      "instantTicketingRequired": false,
      "nonHomogeneous": false,
      "oneWay": false,
      "lastTicketingDate": "2026-05-25",
      "numberOfBookableSeats": 4,
      "itineraries": [
        {
          "duration": "PT10H30M",
          "segments": [
            {
              "departure": {
                "iataCode": "CYM",
                "at": "2026-06-01T10:00:00"
              },
              "arrival": {
                "iataCode": "MIA",
                "at": "2026-06-01T15:45:00"
              },
              "carrierCode": "AA",
              "number": "100",
              "aircraft": { "code": "788" },
              "operating": { "carrierCode": "AA" },
              "stops": [],
              "class": "ECONOMY"
            }
          ]
        }
      ],
      "price": {
        "currency": "KYD",
        "total": "450.00",
        "base": "400.00",
        "granularBreakdown": {
          "pricePerAdult": { "total": "225.00", "base": "200.00" }
        }
      }
    }
  ]
}
```

---

### Get Packages

**GET** `/travel/packages`

**Auth Required**: ✅ Bearer token

Get curated travel packages.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_123",
      "title": "Miami Beach Getaway",
      "description": "5 days in Miami with flights and accommodation",
      "destination": "Miami, USA",
      "duration": "5 days",
      "price": 1299.99,
      "currency": "KYD",
      "image": "https://...",
      "inclusions": ["Flights", "Hotel", "Transfers"],
      "highlights": ["Beach time", "Water sports", "Shopping"]
    }
  ]
}
```

---

### Get Cruises

**GET** `/travel/cruises`

**Auth Required**: ✅ Bearer token

Get available cruise options.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cruise_123",
      "name": "Caribbean Adventure",
      "ship": "Royal Caribbean",
      "departureDate": "2026-06-15",
      "duration": "7 nights",
      "ports": ["Miami", "Nassau", "Cayman Islands", "Cozumel"],
      "priceFrom": 899.99,
      "currency": "KYD",
      "image": "https://..."
    }
  ]
}
```

---

### Create Booking Checkout

**POST** `/travel/bookings/checkout`

**Auth Required**: ✅ MEMBER only

Create Stripe checkout session for travel booking.

**Request Body**

```json
{
  "type": "hotel|flight|package|cruise",
  "offerData": {
    "hotelId": "RTKXS50",
    "offerId": "1",
    "checkInDate": "2026-06-01",
    "checkOutDate": "2026-06-05",
    "guests": [{ "firstName": "John", "age": 35 }]
  }
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxxxx",
    "url": "https://checkout.stripe.com/pay/cs_live_xxxxx"
  }
}
```

---

### Verify Travel Booking

**GET** `/travel/bookings/verify`

**Auth Required**: ✅ MEMBER only

Verify booking completion after payment.

**Query Parameters**

```
session_id=cs_live_xxxxx
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_123",
      "type": "hotel",
      "bookingReference": "DXCRYQ",
      "hotel": { "name": "Hotel 1 - George Town" },
      "checkInDate": "2026-06-01",
      "checkOutDate": "2026-06-05",
      "totalPrice": 550.0,
      "status": "CONFIRMED"
    }
  }
}
```

---

### Get My Bookings

**GET** `/travel/my/bookings`

**Auth Required**: ✅ MEMBER only

View all member's travel bookings.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "booking_123",
      "type": "hotel",
      "bookingReference": "DXCRYQ",
      "destination": "George Town, Cayman Islands",
      "checkInDate": "2026-06-01",
      "checkOutDate": "2026-06-05",
      "totalPrice": 550.0,
      "status": "CONFIRMED",
      "bookingDate": "2026-04-03"
    }
  ]
}
```

---

### Travel Booking Webhook

**POST** `/travel/bookings/webhook`

**Auth Required**: ❌ None (Stripe webhook)

Handle travel booking payment completion webhook.

---

## 12. Employer Management

### Accept Invite

**POST** `/employer/employees/accept-invite/:token`

**Auth Required**: ❌ None

Employee accepts invite and sets password.

**Request Body**

```json
{
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Account activated",
  "data": {
    "user": {
      /* user data */
    },
    "token": "eyJhbGc..."
  }
}
```

---

### Get Employer Profile

**GET** `/employer/profile`

**Auth Required**: ✅ EMPLOYER only

Get authenticated employer's profile.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "emp_123",
    "userId": "user_456",
    "companyName": "Tech Corp Inc",
    "industry": "Technology",
    "registrationNumber": "BC123456",
    "taxId": "TAX123456",
    "contactEmail": "hr@techcorp.ky",
    "contactPhone": "+1-345-222-1111",
    "address": "123 Business Park",
    "district": "George Town",
    "website": "https://techcorp.ky",
    "isApproved": true,
    "createdAt": "2026-03-15"
  }
}
```

---

### Get Employer Dashboard

**GET** `/employer/dashboard`

**Auth Required**: ✅ EMPLOYER only

Get employer's dashboard with stats.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "companyName": "Tech Corp Inc",
    "totalEmployees": 45,
    "activeSubscriptions": 32,
    "pendingInvites": 5,
    "totalSaved": 12450.75,
    "recentActivity": [
      /* recent employee actions */
    ]
  }
}
```

---

### Bulk Purchase Membership

**POST** `/employer/bulk-purchase`

**Auth Required**: ✅ EMPLOYER only

Purchase memberships for multiple employees at once.

**Request Body**

```json
{
  "planType": "INDIVIDUAL",
  "quantity": 10,
  "paymentMethod": "stripe"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxxxx",
    "url": "https://checkout.stripe.com/pay/cs_live_xxxxx"
  }
}
```

---

### Get Employees

**GET** `/employer/employees`

**Auth Required**: ✅ EMPLOYER only

List all employees.

**Query Parameters**

```
page=1
limit=20
status=ACTIVE|INACTIVE|PENDING
search=name or email
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "emp_user_123",
      "email": "john@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "membershipStatus": "ACTIVE",
      "membershipExpiryDate": "2026-05-15",
      "inviteSentDate": "2026-03-20",
      "acceptedDate": "2026-03-22"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
}
```

---

### Add Employee

**POST** `/employer/employees`

**Auth Required**: ✅ EMPLOYER only

Add single employee.

**Request Body**

```json
{
  "email": "john@company.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Employee added and invite sent",
  "data": {
    /* employee record */
  }
}
```

---

### Bulk Add Employees

**POST** `/employer/employees/bulk`

**Auth Required**: ✅ EMPLOYER only

Add multiple employees from CSV or array.

**Request Body**

```json
{
  "employees": [
    { "email": "john@company.com", "firstName": "John", "lastName": "Doe" },
    { "email": "jane@company.com", "firstName": "Jane", "lastName": "Smith" }
  ]
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Employees added",
  "data": {
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

### Resend Employee Invite

**POST** `/employer/employees/:id/resend-invite`

**Auth Required**: ✅ EMPLOYER only

Resend invitation email to employee.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Invitation resent to employee"
}
```

---

### Remove Employee

**DELETE** `/employer/employees/:id`

**Auth Required**: ✅ EMPLOYER only

Remove employee from company.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Employee removed"
}
```

---

## 13. Association Management

### Accept Member Invite

**POST** `/association/members/accept-invite/:token`

**Auth Required**: ❌ None

Member accepts association invite.

**Request Body**

```json
{
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* member account */
  }
}
```

---

### Accept Business Invite

**POST** `/association/businesses/accept-invite/:token`

**Auth Required**: ❌ None

Business accepts association invite.

**Request Body**

```json
{
  "password": "SecurePassword123!"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* business account */
  }
}
```

---

### Join Association by Code

**POST** `/association/join`

**Auth Required**: ✅ MEMBER only

Member joins association using code.

**Request Body**

```json
{
  "joinCode": "ASSOC123ABC"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Joined association successfully",
  "data": {
    /* association details */
  }
}
```

---

### Get Association Profile

**GET** `/association/profile`

**Auth Required**: ✅ ASSOCIATION only

Get authenticated association's profile.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "assoc_123",
    "name": "Professional Association",
    "description": "Association for professionals",
    "type": "MEMBER",
    "registrationNumber": "ASSOC123",
    "contactEmail": "contact@association.ky",
    "website": "https://association.ky",
    "logoUrl": "https://...",
    "totalMembers": 250,
    "totalBusinesses": 0,
    "isApproved": true
  }
}
```

---

### Get Association Dashboard

**GET** `/association/dashboard`

**Auth Required**: ✅ ASSOCIATION only

Get association's dashboard with stats.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "name": "Professional Association",
    "type": "MEMBER",
    "totalMembers": 250,
    "activeMembers": 200,
    "totalBusinesses": 45,
    "totalSaved": 34500.0,
    "recentActivity": [
      /* recent actions */
    ]
  }
}
```

---

### Generate Join Code

**POST** `/association/join-code/generate`

**Auth Required**: ✅ ASSOCIATION only

Generate a join code for members.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "joinCode": "ASSOC123ABC",
    "expiryDate": "2026-05-03",
    "createdAt": "2026-04-03"
  }
}
```

---

### Toggle Join Code

**PATCH** `/association/join-code/toggle`

**Auth Required**: ✅ ASSOCIATION only

Enable/disable join code.

**Request Body**

```json
{
  "isActive": true
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": { "isActive": true }
}
```

---

### Get Association Members

**GET** `/association/members`

**Auth Required**: ✅ ASSOCIATION only

List all members in association.

**Query Parameters**

```
page=1
limit=20
status=ACTIVE|INACTIVE|PENDING
search=email
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "member_123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "joinDate": "2026-03-20",
      "membershipStatus": "ACTIVE"
    }
  ],
  "pagination": { "total": 250, "page": 1, "limit": 20, "pages": 13 }
}
```

---

### Add Member

**POST** `/association/members`

**Auth Required**: ✅ ASSOCIATION only

Add single member to association.

**Request Body**

```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Member added and invite sent",
  "data": {
    /* member record */
  }
}
```

---

### Bulk Add Members

**POST** `/association/members/bulk`

**Auth Required**: ✅ ASSOCIATION only

Add multiple members.

**Request Body**

```json
{
  "members": [
    { "email": "john@example.com", "firstName": "John", "lastName": "Doe" },
    { "email": "jane@example.com", "firstName": "Jane", "lastName": "Smith" }
  ]
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Members added",
  "data": {
    "successful": 2,
    "failed": 0
  }
}
```

---

### Resend Member Invite

**POST** `/association/members/:id/resend-invite`

**Auth Required**: ✅ ASSOCIATION only

Resend invite to member.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Invite resent"
}
```

---

### Remove Member

**DELETE** `/association/members/:id`

**Auth Required**: ✅ ASSOCIATION only

Remove member from association.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Member removed"
}
```

---

### Get Linked Businesses

**GET** `/association/businesses`

**Auth Required**: ✅ ASSOCIATION only (BUSINESS-type only)

List all linked businesses.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "assoc_business_123",
      "businessId": "business_456",
      "business": {
        "name": "Tech Store",
        "category": "Electronics",
        "email": "info@techstore.ky"
      },
      "linkedDate": "2026-03-20",
      "status": "ACTIVE"
    }
  ]
}
```

---

### Get Linked Business Detail

**GET** `/association/businesses/:id/detail`

**Auth Required**: ✅ ASSOCIATION only

Get detailed business information.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "business": {
      /* full business details */
    },
    "linkedDate": "2026-03-20",
    "status": "ACTIVE",
    "offers": [
      /* business offers */
    ]
  }
}
```

---

### Link Business

**POST** `/association/businesses/link`

**Auth Required**: ✅ ASSOCIATION only

Link external business to association.

**Request Body**

```json
{
  "businessId": "business_456"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Business linked",
  "data": {
    /* linked business */
  }
}
```

---

### Invite Business

**POST** `/association/businesses/invite`

**Auth Required**: ✅ ASSOCIATION only

Send invite to business to join association.

**Request Body**

```json
{
  "email": "info@business.ky",
  "businessName": "Tech Store"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Invitation sent to business"
}
```

---

### Remove Business

**DELETE** `/association/businesses/:id`

**Auth Required**: ✅ ASSOCIATION only

Remove business from association.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Business removed"
}
```

---

## 14. B2B Partners

### Get B2B Directory

**GET** `/b2b/directory`

**Auth Required**: ❌ Public

List all approved B2B partners.

**Query Parameters**

```
page=1
limit=20
search=keyword
industry=technology
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "b2b_123",
      "companyName": "Tech Solutions Ltd",
      "description": "B2B software solutions",
      "industry": "Technology",
      "logo": "https://...",
      "contactEmail": "sales@techsolutions.ky",
      "website": "https://techsolutions.ky",
      "isApproved": true
    }
  ],
  "pagination": { "total": 45, "page": 1 }
}
```

---

### Get B2B Profile

**GET** `/b2b/profile`

**Auth Required**: ✅ B2B only

Get authenticated B2B partner's profile.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "b2b_123",
    "userId": "user_456",
    "companyName": "Tech Solutions Ltd",
    "description": "B2B software solutions",
    "industry": "Technology",
    "logo": "https://...",
    "registrationNumber": "BC123456",
    "contactEmail": "sales@techsolutions.ky",
    "contactPhone": "+1-345-222-1111",
    "website": "https://techsolutions.ky",
    "address": "456 Tech Park",
    "isApproved": true
  }
}
```

---

### Update B2B Profile

**PUT** `/b2b/profile`

**Auth Required**: ✅ B2B only

Update B2B partner profile.

**Request Body**

```json
{
  "companyName": "Tech Solutions Ltd",
  "description": "B2B software and consulting",
  "industry": "Technology",
  "website": "https://techsolutions.ky"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    /* updated profile */
  }
}
```

---

### Get B2B Stats

**GET** `/b2b/stats`

**Auth Required**: ✅ B2B only

Get B2B partner's statistics.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalEnquiries": 45,
    "pendingEnquiries": 8,
    "respondedEnquiries": 37,
    "responseTime": "2.4 hours",
    "rating": 4.7
  }
}
```

---

### Get Enquiries

**GET** `/b2b/enquiries`

**Auth Required**: ✅ B2B only

View all received enquiries.

**Query Parameters**

```
page=1
limit=20
status=PENDING|RESPONDED|CLOSED
dateRange=start-date;end-date
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "enq_123",
      "fromUser": { "firstName": "John", "email": "john@example.com" },
      "fromRole": "MEMBER",
      "subject": "Partnership inquiry",
      "message": "Interested in your services",
      "createdAt": "2026-04-03T10:00:00Z",
      "status": "PENDING",
      "response": null
    }
  ],
  "pagination": { "total": 45, "page": 1 }
}
```

---

### Submit Enquiry

**POST** `/b2b/enquire/:partnerId`

**Auth Required**: ✅ MEMBER, EMPLOYER, ASSOCIATION, or BUSINESS

Submit enquiry to B2B partner.

**Request Body**

```json
{
  "subject": "Partnership inquiry",
  "message": "Interested in your services for our platform"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Enquiry submitted",
  "data": {
    /* enquiry record */
  }
}
```

---

## 15. Advertisements

### Get Active Advertisements

**GET** `/advertisements`

**Auth Required**: ❌ Public (optional auth)

Get active advertisements for a placement.

**Query Parameters**

```
placement=header|sidebar|footer
position=TOP|MIDDLE|BOTTOM
limit=5
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "ad_123",
      "title": "Summer Sale",
      "imageUrl": "https://...",
      "linkUrl": "https://business.ky/summer-sale",
      "business": { "name": "Tech Store" },
      "placement": "header",
      "position": "TOP",
      "expiryDate": "2026-05-31",
      "clicks": 234
    }
  ]
}
```

---

### Track Ad Click

**POST** `/advertisements/:id/click`

**Auth Required**: ❌ None

Track advertisement click.

**Response** `200 OK`

```json
{
  "success": true,
  "data": { "clicks": 235 }
}
```

---

### Create Advertisement

**POST** `/advertisements`

**Auth Required**: ✅ BUSINESS only

Create new advertisement banner.

**Form Data**

```
image: <file>
title: "Summer Sale"
linkUrl: "https://business.ky/summer-sale"
placement: "header"
startDate: "2026-04-05"
endDate: "2026-05-31"
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Advertisement created and pending approval",
  "data": {
    /* ad details */
  }
}
```

---

### Update Ad Status

**PATCH** `/advertisements/:id/status`

**Auth Required**: ✅ ADMIN only

Update advertisement status.

**Request Body**

```json
{
  "status": "ACTIVE|INACTIVE|REJECTED"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* updated ad */
  }
}
```

---

### Get Pending Ads (Admin)

**GET** `/advertisements/admin/pending`

**Auth Required**: ✅ ADMIN only

Get all pending advertisements for review.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "ad_123",
      "title": "Summer Sale",
      "business": { "name": "Tech Store", "email": "info@techstore.ky" },
      "imageUrl": "https://...",
      "status": "PENDING",
      "createdAt": "2026-04-03T10:00:00Z"
    }
  ]
}
```

---

## 16. Analytics & Reporting

### Get Role Analytics

**GET** `/analytics/role-stats`

**Auth Required**: ✅ Bearer token

Get analytics for authenticated user's role.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "role": "MEMBER",
    "totalMembers": 1250,
    "activememberships": 980,
    "averageMembershipValue": 159.99,
    "certificatesSold": 5000,
    "certificatesRedeemed": 2500,
    "totalSavings": 125000.0
  }
}
```

---

### Get Platform Overview

**GET** `/analytics/overview`

**Auth Required**: ✅ ADMIN only

Get overall platform statistics.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalUsers": 5600,
    "totalMembers": 3200,
    "activeMembers": 2800,
    "totalBusinesses": 480,
    "approvedBusinesses": 420,
    "totalTransactions": 15000,
    "totalSavings": 500000.0,
    "revenueThisMonth": 45000.0,
    "growth": {
      "membersGrowth": 12.5,
      "businessGrowth": 8.3,
      "transactionGrowth": 18.9
    }
  }
}
```

---

### Get Savings by Category

**GET** `/analytics/by-category`

**Auth Required**: ✅ ADMIN only

Get savings breakdown by category.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "category": "Food & Beverage",
      "totalSavings": 125000.0,
      "transactionCount": 3500,
      "averageSavingPerTransaction": 35.71
    },
    {
      "category": "Electronics",
      "totalSavings": 98500.0,
      "transactionCount": 1200
    }
  ]
}
```

---

### Get Savings by District

**GET** `/analytics/by-district`

**Auth Required**: ✅ ADMIN only

Get savings breakdown by geographic district.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "district": "George Town",
      "totalSavings": 250000.0,
      "memberCount": 1500,
      "averageSavingPerMember": 166.67
    },
    {
      "district": "West Bay",
      "totalSavings": 125000.0,
      "memberCount": 800
    }
  ]
}
```

---

### Get Savings by Demographics

**GET** `/analytics/by-demographics`

**Auth Required**: ✅ ADMIN only

Get savings by age group, gender, etc.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "byAgeGroup": [
      { "ageGroup": "18-25", "totalSavings": 45000.0, "memberCount": 320 },
      { "ageGroup": "26-35", "totalSavings": 125000.0, "memberCount": 890 }
    ],
    "byGender": [
      { "gender": "M", "totalSavings": 250000.0, "memberCount": 1600 },
      { "gender": "F", "totalSavings": 180000.0, "memberCount": 1200 }
    ]
  }
}
```

---

### Get Membership Analytics

**GET** `/analytics/membership`

**Auth Required**: ✅ ADMIN only

Get detailed membership statistics.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalMemberships": 3200,
    "activeMemberships": 2800,
    "expiredMemberships": 400,
    "pendingMemberships": 0,
    "byPlan": [
      { "plan": "Individual Monthly", "count": 1500, "revenue": 45000.0 },
      { "plan": "Individual Annual", "count": 900, "revenue": 179100.0 }
    ],
    "churnRate": 5.3,
    "retentionRate": 94.7,
    "averageLifetimeValue": 312.5
  }
}
```

---

### Get Time Series Analytics

**GET** `/analytics/time-series`

**Auth Required**: ✅ ADMIN only

Get time-series analytics data.

**Query Parameters**

```
metric=members|transactions|savings|revenue
period=daily|weekly|monthly
startDate=2026-03-01
endDate=2026-04-03
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    { "date": "2026-03-01", "value": 145 },
    { "date": "2026-03-02", "value": 158 },
    { "date": "2026-03-03", "value": 162 }
  ]
}
```

---

### Export Report

**GET** `/analytics/export`

**Auth Required**: ✅ ADMIN only

Export analytics as CSV or PDF.

**Query Parameters**

```
format=csv|pdf
reportType=full|summary|quarterly
```

**Response** `200 OK`

Returns downloadable file (CSV/PDF).

---

## 17. Contact & Support

### Submit Contact Inquiry

**POST** `/contact`

**Auth Required**: ❌ Public

Submit general contact inquiry.

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-345-222-1234",
  "subject": "Partnership opportunity",
  "message": "I'm interested in partnering with DCC",
  "type": "PARTNERSHIP"
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you soon!",
  "data": {
    /* inquiry record */
  }
}
```

---

### Get Inquiries (Admin)

**GET** `/contact`

**Auth Required**: ✅ ADMIN only

Get all contact inquiries.

**Query Parameters**

```
page=1
limit=20
status=NEW|RESPONDED|CLOSED
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "inquiry_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-345-222-1234",
      "subject": "Partnership opportunity",
      "message": "I'm interested in partnering with DCC",
      "type": "PARTNERSHIP",
      "status": "NEW",
      "createdAt": "2026-04-03T10:00:00Z",
      "response": null
    }
  ],
  "pagination": { "total": 156, "page": 1 }
}
```

---

### Update Inquiry Status

**PUT** `/contact/:id/status`

**Auth Required**: ✅ ADMIN only

Update inquiry status and send response.

**Request Body**

```json
{
  "status": "RESPONDED",
  "response": "Thank you for your interest. We'll contact you shortly."
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Inquiry updated",
  "data": {
    "id": "inquiry_123",
    "status": "RESPONDED",
    "respondedAt": "2026-04-03T15:30:00Z"
  }
}
```

---

## 18. Admin Dashboard

### Get Dashboard Stats

**GET** `/admin/stats`

**Auth Required**: ✅ ADMIN only

Get admin dashboard statistics.

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalUsers": 5600,
    "totalMembers": 3200,
    "activeMembers": 2800,
    "totalBusinesses": 480,
    "totalTransactions": 15000,
    "totalSavings": 500000.0,
    "pendingBusinesses": 12,
    "pendingEmployers": 8,
    "pendingAssociations": 3,
    "totalPending": 23,
    "recentMembers": [
      {
        "id": "mem_123",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1-345-222-1234",
        "district": "George Town",
        "createdAt": "2026-04-02T10:30:00Z"
      }
    ],
    "recentBusinesses": [
      {
        "id": "bus_456",
        "name": "Tech Solutions Ltd",
        "email": "info@techsol.ky",
        "status": "APPROVED",
        "createdAt": "2026-04-02T09:15:00Z"
      }
    ]
  }
}
```

---

### Get All Users (Admin)

**GET** `/admin/users`

**Auth Required**: ✅ ADMIN only

List all users with filters.

**Query Parameters**

```
page=1
limit=10
role=MEMBER|BUSINESS
search=email
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* array of users */
  ],
  "pagination": { "total": 450, "page": 1 }
}
```

---

### Update User Role (Admin)

**PUT** `/admin/users/:id/role`

**Auth Required**: ✅ ADMIN only

Change user's role.

**Request Body**

```json
{
  "role": "BUSINESS"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* updated user */
  }
}
```

---

### Toggle User Status (Admin)

**PUT** `/admin/users/:id/status`

**Auth Required**: ✅ ADMIN only

Enable/disable user account.

**Request Body**

```json
{
  "isActive": false
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": { "isActive": false }
}
```

---

### Delete User (Admin)

**DELETE** `/admin/users/:id`

**Auth Required**: ✅ ADMIN only

Delete user account.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### Get Admin Members

**GET** `/admin/members`

**Auth Required**: ✅ ADMIN only

List all members with admin capabilities.

**Query Parameters**

```
page=1
limit=20
status=ACTIVE|INACTIVE
search=email
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* members */
  ],
  "pagination": {
    /* pagination */
  }
}
```

---

### Update Member (Admin)

**PATCH** `/admin/members/:id`

**Auth Required**: ✅ ADMIN only

Update member details.

**Request Body**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "district": "West Bay"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* updated member */
  }
}
```

---

### Delete Member (Admin)

**DELETE** `/admin/members/:id`

**Auth Required**: ✅ ADMIN only

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Member deleted"
}
```

---

### Get Pending Approvals

**GET** `/admin/pending`

**Auth Required**: ✅ ADMIN only

Get all items pending approval (businesses, employers, associations).

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "pendingBusinesses": [
      /* businesses awaiting approval */
    ],
    "pendingEmployers": [
      /* employers awaiting approval */
    ],
    "pendingAssociations": [
      /* associations awaiting approval */
    ],
    "total": 23
  }
}
```

---

### Get Admin Businesses

**GET** `/admin/businesses`

**Auth Required**: ✅ ADMIN only

List all businesses.

**Query Parameters**

```
page=1
limit=20
status=PENDING|APPROVED|REJECTED
search=name
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* businesses */
  ],
  "pagination": {
    /* pagination */
  }
}
```

---

### Update Business (Admin)

**PATCH** `/admin/businesses/:id`

**Auth Required**: ✅ ADMIN only

Update business details.

**Request Body**

```json
{
  "name": "Tech Solutions Ltd",
  "category": "Technology"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* updated business */
  }
}
```

---

### Approve Business

**PATCH** `/admin/businesses/:id/approve`

**Auth Required**: ✅ ADMIN only

Approve pending business.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Business approved",
  "data": {
    /* approved business */
  }
}
```

---

### Reject Business

**PATCH** `/admin/businesses/:id/reject`

**Auth Required**: ✅ ADMIN only

Reject pending business.

**Request Body**

```json
{
  "reason": "Incomplete registration information"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Business rejected"
}
```

---

### Approve Employer

**PATCH** `/admin/employers/:id/approve`

**Auth Required**: ✅ ADMIN only

Approve pending employer.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Employer approved"
}
```

---

### Reject Employer

**PATCH** `/admin/employers/:id/reject`

**Auth Required**: ✅ ADMIN only

Reject pending employer.

**Request Body**

```json
{
  "reason": "Registration verification failed"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Employer rejected"
}
```

---

### Approve Association

**PATCH** `/admin/associations/:id/approve`

**Auth Required**: ✅ ADMIN only

Approve pending association.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Association approved"
}
```

---

### Get B2B Partners (Admin)

**GET** `/admin/b2b`

**Auth Required**: ✅ ADMIN only

List all B2B partners.

**Query Parameters**

```
page=1
limit=20
status=pending|approved
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* B2B partners */
  ],
  "pagination": {
    /* pagination */
  }
}
```

---

### Approve B2B Partner

**PATCH** `/admin/b2b/:id/approve`

**Auth Required**: ✅ ADMIN only

Approve B2B partner.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "B2B partner approved"
}
```

---

### Reject B2B Partner

**PATCH** `/admin/b2b/:id/reject`

**Auth Required**: ✅ ADMIN only

Reject B2B partner.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "B2B partner rejected"
}
```

---

### Get Pending Memberships (Admin)

**GET** `/admin/memberships/pending`

**Auth Required**: ✅ ADMIN only

Get memberships awaiting approval.

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* pending memberships */
  ]
}
```

---

### Approve Membership (Admin)

**PATCH** `/admin/memberships/:id/approve`

**Auth Required**: ✅ ADMIN only

Approve pending membership.

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Membership approved"
}
```

---

### Get Inquiries (Admin)

**GET** `/admin/inquiries`

**Auth Required**: ✅ ADMIN only

Get contact inquiries.

**Query Parameters**

```
page=1
limit=20
status=NEW|RESPONDED|CLOSED
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    /* inquiries */
  ],
  "pagination": {
    /* pagination */
  }
}
```

---

### Update Inquiry Status (Admin)

**PUT** `/admin/inquiries/:id/status`

**Auth Required**: ✅ ADMIN only

Update inquiry status.

**Request Body**

```json
{
  "status": "RESPONDED"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": {
    /* updated inquiry */
  }
}
```

---

### Get Audit Log (Admin)

**GET** `/admin/audit`

**Auth Required**: ✅ ADMIN only

View system audit log.

**Query Parameters**

```
page=1
limit=50
action=CREATE|UPDATE|DELETE
entityType=BUSINESS|MEMBERSHIP|USER
dateRange=start-date;end-date
```

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "audit_123",
      "action": "UPDATE",
      "entityType": "BUSINESS",
      "entityId": "bus_456",
      "userId": "user_789",
      "changes": { "status": "from PENDING to APPROVED" },
      "timestamp": "2026-04-03T15:30:00Z"
    }
  ],
  "pagination": {
    /* pagination */
  }
}
```

---

## 19. Upload & Media

### Upload Image

**POST** `/upload/image`

**Auth Required**: ✅ Bearer token

Generic image upload (profile avatars, etc.).

**Form Data**

```
file: <image-file>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "url": "https://cloudinary-cdn.com/image-xyz.jpg"
  }
}
```

---

## Common Errors & Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required field: email",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided or invalid token",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions for this action",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 409
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Rate Limiting

- **Auth endpoints**: 5 requests per minute per IP
- **General endpoints**: 30 requests per minute per user
- **Admin endpoints**: 60 requests per minute per admin

---

## Response Pagination

Most list endpoints support pagination:

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 10-20)

**Response Includes**:

```json
{
  "success": true,
  "data": [
    /* items */
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

## Webhook Events

### Stripe Webhooks

- `charge.succeeded` - Payment completed
- `charge.failed` - Payment failed
- `customer.subscription.created` - Membership created
- `customer.subscription.updated` - Membership updated
- `customer.subscription.deleted` - Membership cancelled

### Travel Booking Webhooks

- `booking.confirmed` - Booking confirmed
- `booking.cancelled` - Booking cancelled

---

## API Versioning

Current API Version: **v1** (default)

All endpoints use `/api/` prefix. Future versions will use `/api/v2/` format.

---

## Support & Documentation

- **Base Documentation**: See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Admin API Details**: See [DCC_ADMIN_API_DOCUMENTATION.md](DCC_ADMIN_API_DOCUMENTATION.md)
- **Email Support**: support@dcc.ky
- **Technical Support**: tech@dcc.ky

---

**Last Updated**: April 4, 2026
