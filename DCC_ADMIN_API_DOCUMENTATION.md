# Admin API Documentation

## Authentication

### Authorization Requirements

- **All endpoints** require `ADMIN` role
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Token Validation**: JWT is verified and user must be active (`isActive: true`)

### Auth Flow

1. User logs in and receives JWT token
2. Token is included in `Authorization` header as `Bearer <token>`
3. Middleware (`protect`, `authorize`) validates:
   - Token exists and is valid
   - User exists and hasn't been deleted
   - User account is active
   - User has `ADMIN` role
4. If validation fails: **401 Unauthorized** or **403 Forbidden**

### Response Format

All responses follow this structure:

**Success (2xx)**

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    /* response payload */
  }
}
```

**Paginated Success**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    /* array of items */
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

**Error (4xx/5xx)**

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Error Codes

| Status | Error                 | When                                        |
| ------ | --------------------- | ------------------------------------------- |
| 400    | Bad Request           | Invalid input data                          |
| 401    | Unauthorized          | No token / invalid token / inactive account |
| 403    | Forbidden             | User doesn't have ADMIN role                |
| 404    | Not Found             | Resource doesn't exist                      |
| 409    | Conflict              | Duplicate email / resource conflict         |
| 500    | Internal Server Error | Server error                                |

---

## Endpoints

### 1. Dashboard Stats

**GET** `/api/admin/stats`

Returns aggregated dashboard statistics.

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalUsers": 450,
    "totalMembers": 320,
    "activeMembers": 285,
    "totalBusinesses": 75,
    "totalTransactions": 1500,
    "totalSavings": 45000.5,
    "pendingBusinesses": 12,
    "pendingEmployers": 8,
    "pendingAssociations": 3,
    "totalPending": 23,
    "recentMembers": [
      {
        "id": "mem_123",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "district": "George Town",
        "age": 35,
        "createdAt": "2026-04-02T10:30:00Z"
      }
    ],
    "recentBusinesses": [
      {
        "id": "bus_456",
        "name": "Tech Solutions Ltd",
        "email": "info@techsol.ky",
        "status": "APPROVED",
        "isApproved": true,
        "createdAt": "2026-04-02T09:15:00Z"
      }
    ]
  }
}
```

---

### 2. Users Management

#### Get All Users

**GET** `/api/admin/users`

List all users with filtering and pagination.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `role` | string | Filter by role: `MEMBER`, `BUSINESS`, `EMPLOYER`, `ASSOCIATION`, `B2B`, `ADMIN` |
| `search` | string | Search by email (case-insensitive) |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "role": "MEMBER",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2026-03-15T08:00:00Z",
      "member": {
        "firstName": "John",
        "lastName": "Doe",
        "district": "George Town"
      },
      "employer": null,
      "association": null,
      "business": null
    }
  ],
  "pagination": {
    "total": 450,
    "page": 1,
    "limit": 10,
    "pages": 45
  }
}
```

#### Update User Role

**PUT** `/api/admin/users/:id/role`

Change a user's role.

**Request Body**

```json
{
  "role": "BUSINESS"
}
```

**Allowed Roles**: `MEMBER`, `BUSINESS`, `EMPLOYER`, `ASSOCIATION`, `B2B`, `ADMIN`

**Response**

```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": "user_123",
    "role": "BUSINESS"
  }
}
```

#### Toggle User Status (Activate/Deactivate)

**PUT** `/api/admin/users/:id/status`

Activate or deactivate a user account.

**Response**

```json
{
  "success": true,
  "message": "User activated",
  "data": {
    "id": "user_123",
    "isActive": true
  }
}
```

#### Delete User

**DELETE** `/api/admin/users/:id`

Permanently delete a user.

**Response**

```json
{
  "success": true,
  "message": "User deleted",
  "data": {}
}
```

---

### 3. Members Management

#### Get All Members

**GET** `/api/admin/members`

List members with filtering and pagination.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search by first/last name |
| `district` | string | Filter by district (or "all") |
| `membershipStatus` | string | Filter by status: `PENDING`, `ACTIVE`, `EXPIRED` |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "mem_123",
      "userId": "user_456",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1234567890",
      "district": "West Bay",
      "createdAt": "2026-03-20T14:30:00Z",
      "membership": {
        "id": "ms_789",
        "status": "ACTIVE",
        "type": "INDIVIDUAL",
        "startDate": "2026-04-01T00:00:00Z",
        "expiryDate": "2027-04-01T00:00:00Z",
        "priceUSD": 150,
        "paymentStatus": "COMPLETED"
      },
      "user": {
        "id": "user_456",
        "email": "jane@example.com",
        "isActive": true,
        "createdAt": "2026-03-20T14:25:00Z"
      }
    }
  ],
  "pagination": {
    "total": 320,
    "page": 1,
    "limit": 10,
    "pages": 32
  }
}
```

#### Update Member

**PATCH** `/api/admin/members/:id`

Update member information.

**Request Body** (all optional)

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "district": "West Bay",
  "email": "jane.smith@example.com"
}
```

**Response**

```json
{
  "success": true,
  "message": "Member updated",
  "data": {
    "id": "mem_123",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "district": "West Bay",
    "userId": "user_456",
    "createdAt": "2026-03-20T14:30:00Z"
  }
}
```

#### Delete Member

**DELETE** `/api/admin/members/:id`

Delete a member and all related data (memberships, transactions, certificates).

**Response**

```json
{
  "success": true,
  "message": "Member deleted",
  "data": {}
}
```

---

### 4. Pending Approvals

#### Get All Pending Approvals

**GET** `/api/admin/pending`

Get all pending items across all entity types in a single call.

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "employers": [
      {
        "id": "emp_123",
        "userId": "user_789",
        "companyName": "Tech Corp",
        "createdAt": "2026-03-25T10:00:00Z",
        "user": {
          "id": "user_789",
          "email": "admin@techcorp.ky",
          "createdAt": "2026-03-25T09:55:00Z"
        }
      }
    ],
    "associations": [
      {
        "id": "ass_456",
        "userId": "user_012",
        "name": "Chamber of Commerce",
        "createdAt": "2026-03-24T15:30:00Z",
        "user": {
          "id": "user_012",
          "email": "info@chamber.ky",
          "createdAt": "2026-03-24T15:25:00Z"
        }
      }
    ],
    "businesses": [
      {
        "id": "bus_789",
        "userId": "user_345",
        "name": "Restaurant XYZ",
        "createdAt": "2026-03-23T12:00:00Z",
        "user": {
          "id": "user_345",
          "email": "owner@restaurantxyz.ky",
          "createdAt": "2026-03-23T11:55:00Z"
        }
      }
    ],
    "b2bPartners": [
      {
        "id": "b2b_567",
        "userId": "user_678",
        "companyName": "Logistics Plus",
        "servicesOffered": "Freight, Warehousing",
        "createdAt": "2026-03-22T09:00:00Z",
        "user": {
          "id": "user_678",
          "email": "sales@logisticsplus.ky",
          "createdAt": "2026-03-22T08:55:00Z"
        }
      }
    ]
  }
}
```

---

### 5. Memberships

#### Get Pending Memberships

**GET** `/api/admin/memberships/pending`

Get all memberships awaiting approval.

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "ms_999",
      "memberId": "mem_123",
      "status": "PENDING",
      "type": "INDIVIDUAL",
      "startDate": null,
      "expiryDate": null,
      "priceUSD": 150,
      "paymentStatus": "COMPLETED",
      "createdAt": "2026-04-01T10:00:00Z",
      "member": {
        "id": "mem_123",
        "userId": "user_456",
        "firstName": "John",
        "lastName": "Doe",
        "district": "George Town",
        "user": {
          "id": "user_456",
          "email": "john.doe@example.com"
        }
      }
    }
  ]
}
```

#### Approve Membership

**PATCH** `/api/admin/memberships/:id/approve`

Approve a pending membership. Sets status to `ACTIVE`, generates QR code, and emails the member.

**Response**

```json
{
  "success": true,
  "message": "Membership approved",
  "data": {
    "id": "ms_999",
    "memberId": "mem_123",
    "status": "ACTIVE",
    "type": "INDIVIDUAL",
    "startDate": "2026-04-02T12:00:00Z",
    "expiryDate": "2027-04-02T12:00:00Z",
    "priceUSD": 150,
    "paymentStatus": "COMPLETED",
    "paymentId": "ADMIN_APPROVED",
    "createdAt": "2026-04-01T10:00:00Z"
  }
}
```

---

### 6. Employers

#### Approve Employer

**PATCH** `/api/admin/employers/:id/approve`

Approve an employer application. Sets `isApproved: true` and emails them.

**Response**

```json
{
  "success": true,
  "message": "Employer approved",
  "data": {}
}
```

#### Reject Employer

**PATCH** `/api/admin/employers/:id/reject`

Reject an employer application with optional reason.

**Request Body**

```json
{
  "reason": "Insufficient company documentation"
}
```

**Response**

```json
{
  "success": true,
  "message": "Employer rejected",
  "data": {}
}
```

---

### 7. Associations

#### Approve Association

**PATCH** `/api/admin/associations/:id/approve`

Approve an association. Sets `isApproved: true`.

**Response**

```json
{
  "success": true,
  "message": "Association approved",
  "data": {}
}
```

---

### 8. Businesses

#### Get All Businesses

**GET** `/api/admin/businesses`

List all businesses with filtering and pagination.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | Filter: `APPROVED`, `PENDING`, `REJECTED` |
| `search` | string | Search by name |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "bus_123",
      "userId": "user_789",
      "name": "Paradise Hotel",
      "category": {
        "id": "cat_456",
        "name": "Hospitality",
        "slug": "hospitality"
      },
      "district": "Seven Mile Beach",
      "status": "APPROVED",
      "createdAt": "2026-02-10T08:30:00Z",
      "logoUrl": "https://cdn.example.com/logo.png",
      "user": {
        "id": "user_789",
        "email": "info@paradisehotel.ky",
        "isActive": true
      }
    }
  ],
  "pagination": {
    "total": 75,
    "page": 1,
    "limit": 10,
    "pages": 8
  }
}
```

#### Update Business

**PATCH** `/api/admin/businesses/:id`

Update business information and/or category.

**Request Body** (all optional)

```json
{
  "name": "Paradise Hotel Ltd",
  "categoryId": "cat_456",
  "categoryName": "Hotel",
  "categorySlug": "hotel",
  "description": "Luxury beachfront resort",
  "phone": "+1-345-555-0100",
  "email": "info@paradisehotel.ky",
  "address": "123 Beach Road",
  "district": "Seven Mile Beach",
  "website": "https://paradisehotel.ky",
  "status": "APPROVED"
}
```

**Notes**:

- If `categorySlug` or `categoryName` provided but category doesn't exist, it's created
- Prefer using `categoryId` if you know the exact category

**Response**

```json
{
  "success": true,
  "message": "Business updated",
  "data": {
    "id": "bus_123",
    "name": "Paradise Hotel Ltd",
    "categoryId": "cat_456",
    "description": "Luxury beachfront resort",
    "phone": "+1-345-555-0100",
    "email": "info@paradisehotel.ky",
    "address": "123 Beach Road",
    "district": "Seven Mile Beach",
    "website": "https://paradisehotel.ky",
    "status": "APPROVED",
    "userId": "user_789"
  }
}
```

#### Approve Business

**PATCH** `/api/admin/businesses/:id/approve`

Approve a business. Sets `status: APPROVED` and `isApproved: true`.

**Response**

```json
{
  "success": true,
  "message": "Business approved",
  "data": {}
}
```

#### Reject Business

**PATCH** `/api/admin/businesses/:id/reject`

Reject a business. Sets `status: REJECTED` and `isApproved: false`.

**Response**

```json
{
  "success": true,
  "message": "Business rejected",
  "data": {}
}
```

---

### 9. B2B Partners

#### Get B2B Partners

**GET** `/api/admin/b2b`

List all B2B partners with optional filtering.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `approved` or `pending` |
| `search` | string | Search by company name or services |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "b2b_789",
      "userId": "user_012",
      "companyName": "Island Logistics",
      "servicesOffered": "Shipping, Warehousing, Distribution",
      "isApproved": true,
      "createdAt": "2026-03-15T11:00:00Z",
      "user": {
        "id": "user_012",
        "email": "sales@islandlogistics.ky",
        "isActive": true
      }
    }
  ]
}
```

#### Approve B2B Partner

**PATCH** `/api/admin/b2b/:id/approve`

Approve a B2B partner. Sets `isApproved: true` (now appears in public directory) and sends approval email.

**Response**

```json
{
  "success": true,
  "message": "B2B partner approved — now visible in directory",
  "data": {}
}
```

#### Reject B2B Partner

**PATCH** `/api/admin/b2b/:id/reject`

Reject a B2B partner application with optional reason.

**Request Body**

```json
{
  "reason": "Services do not align with platform offerings"
}
```

**Response**

```json
{
  "success": true,
  "message": "B2B partner application rejected",
  "data": {}
}
```

---

### 10. Contact Inquiries

#### Get Inquiries

**GET** `/api/admin/inquiries`

List contact form submissions with pagination.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | Filter: `new`, `responded`, `archived` |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "inq_456",
      "name": "Robert Chen",
      "email": "robert@example.com",
      "phone": "+1-345-555-0101",
      "subject": "Partnership inquiry",
      "message": "I'm interested in becoming a B2B partner...",
      "status": "new",
      "response": null,
      "respondedAt": null,
      "createdAt": "2026-04-01T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 28,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Update Inquiry Status

**PUT** `/api/admin/inquiries/:id/status`

Mark inquiry as responded and optionally add a response.

**Request Body**

```json
{
  "status": "responded",
  "response": "Thank you for your inquiry. We will contact you shortly."
}
```

**Valid Statuses**: `new`, `responded`, `archived`

**Response**

```json
{
  "success": true,
  "message": "Inquiry updated",
  "data": {
    "id": "inq_456",
    "name": "Robert Chen",
    "email": "robert@example.com",
    "subject": "Partnership inquiry",
    "status": "responded",
    "response": "Thank you for your inquiry. We will contact you shortly.",
    "respondedAt": "2026-04-02T09:15:00Z",
    "createdAt": "2026-04-01T14:30:00Z"
  }
}
```

---

### 11. Audit Log

#### Get Audit Log

**GET** `/api/admin/audit`

Retrieve admin action logs with pagination.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "log_123",
      "adminId": "user_admin_1",
      "action": "APPROVED_MEMBERSHIP",
      "entityType": "MEMBERSHIP",
      "entityId": "ms_999",
      "details": {
        "memberId": "mem_123",
        "timestamp": "2026-04-02T10:30:00Z"
      },
      "createdAt": "2026-04-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 542,
    "page": 1,
    "limit": 10,
    "pages": 55
  }
}
```

---

## Common Patterns

### Pagination

Most list endpoints support pagination. Include in query string:

```
GET /api/admin/users?page=2&limit=20
```

**Response includes**:

- `data`: Array of items
- `pagination.total`: Total number of items
- `pagination.page`: Current page
- `pagination.limit`: Items per page
- `pagination.pages`: Total number of pages

### Error Handling

Always check `success` field:

```javascript
if (!response.success) {
  console.error(response.message);
  // Handle based on statusCode
}
```

### Approval Workflows

**Memberships**: Only memberships with `status: PENDING` and `paymentStatus: COMPLETED` can be approved.

**Employers/Associations/Businesses/B2B**:

- Approval changes `isApproved: true` and/or updates `status`
- Confirmation emails are sent automatically
- Some rejections require a `reason` parameter

---

## Example Requests

### cURL

**Get Dashboard Stats**

```bash
curl -X GET "http://localhost:5000/api/admin/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Approve a Membership**

```bash
curl -X PATCH "http://localhost:5000/api/admin/memberships/ms_999/approve" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

**Get Pending Approvals**

```bash
curl -X GET "http://localhost:5000/api/admin/pending" \
  -H "Authorization: Bearer <TOKEN>"
```

### JavaScript/Fetch

```javascript
async function approveMembership(membershipId) {
  const response = await fetch(
    `/api/admin/memberships/${membershipId}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();
  if (!result.success) {
    console.error(result.message);
    return;
  }

  console.log("Membership approved:", result.data);
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Email notifications are sent asynchronously; failure doesn't block the response
- Member QR codes are auto-generated on membership approval
- Deleting a member cascades to delete all related records
- Admin has no special restrictions beyond the `ADMIN` role requirement
