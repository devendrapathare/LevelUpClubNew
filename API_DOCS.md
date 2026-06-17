# LevelUp Club API Documentation

## Authentication

### Register a new user

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student" // Optional, defaults to "student"
}
```

**Response:**

```json
{
  "msg": "User registered successfully!",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "msg": "Login successful!",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

## Users

### Get user profile

**GET** `/api/users/:id`

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "headline": "Software Developer",
    "bio": "Passionate developer with 5 years of experience",
    "location": "San Francisco, CA",
    "profile_picture_url": "https://example.com/profile.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "profile": {
      // Extended profile data
    }
  }
}
```

### Update user profile

**PUT** `/api/users/:id`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "John Doe",
  "headline": "Senior Software Developer",
  "bio": "Passionate developer with 5 years of experience",
  "location": "San Francisco, CA",
  "profile_picture_url": "https://example.com/profile.jpg"
}
```

**Response:**

```json
{
  "msg": "Profile updated successfully!",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "headline": "Senior Software Developer",
    "bio": "Passionate developer with 5 years of experience",
    "location": "San Francisco, CA",
    "profile_picture_url": "https://example.com/profile.jpg",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

### Search users

**GET** `/api/users?skills=javascript&location=San Francisco&role=professional`

**Response:**

```json
{
  "msg": "Users fetched successfully!",
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "professional",
      "headline": "Senior Software Developer",
      "bio": "Passionate developer with 5 years of experience",
      "location": "San Francisco, CA",
      "profile_picture_url": "https://example.com/profile.jpg",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Assessments

### List assessments

**GET** `/api/assessments`

**Response:**

```json
{
  "msg": "Assessments fetched successfully!",
  "assessments": [
    {
      "id": "uuid",
      "name": "RIASEC Interest Inventory",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get assessment details

**GET** `/api/assessments/:id`

**Response:**

```json
{
  "msg": "Assessment fetched successfully!",
  "assessment": {
    "id": "uuid",
    "name": "RIASEC Interest Inventory",
    "schema": {
      // Assessment questions and scoring rules
    },
    "created_by": "admin_uuid",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Submit assessment

**POST** `/api/assessments/:id/attempt`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "answers": {
    // Assessment answers
  }
}
```

**Response:**

```json
{
  "msg": "Assessment submitted successfully!",
  "attempt": {
    "id": "uuid",
    "user_id": "user_uuid",
    "assessment_id": "assessment_uuid",
    "answers": {
      // Submitted answers
    },
    "scores": {
      // Calculated scores
    }
  }
}
```

## Career Recommendations

### Generate career recommendations

**POST** `/api/career/recommend`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "snapshot": {
    // User profile, test results, preferences, and context
  }
}
```

**Response:**

```json
{
  "msg": "Career recommendations generated successfully!",
  "matches": [
    {
      "career_id": "software_engineer",
      "career_name": "Software Engineer",
      "match_score": 92,
      "description": "Design, develop, and maintain software systems and applications.",
      "why_this_fit": [
        "High aptitude in logical reasoning",
        "Strong interest in investigative and creative tasks"
      ],
      "required_skills": [
        "JavaScript",
        "Python",
        "Algorithms",
        "Data Structures"
      ],
      "learning_path": [
        {
          "step": 1,
          "title": "Master JavaScript fundamentals",
          "resources": ["https://javascript.info"],
          "estimated_hours": 40
        }
      ],
      "salary_estimate": {
        "United States": "$70,000 - $120,000"
      },
      "companies_hiring": [
        {
          "name": "Google",
          "note": "Representative"
        }
      ]
    }
  ]
}
```

### Get user's career recommendations

**GET** `/api/career/:user_id`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Career recommendations fetched successfully!",
  "recommendation": {
    // Career match data
  }
}
```

## Connections

### Send connection request

**POST** `/api/connections/request`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "receiver_id": "receiver_uuid"
}
```

**Response:**

```json
{
  "msg": "Connection request sent successfully!",
  "connection": {
    "id": "uuid",
    "requester_id": "requester_uuid",
    "receiver_id": "receiver_uuid",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Accept connection request

**POST** `/api/connections/:id/accept`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Connection request accepted!",
  "connection": {
    "id": "uuid",
    "requester_id": "requester_uuid",
    "receiver_id": "receiver_uuid",
    "status": "accepted",
    "created_at": "2023-01-01T00:00:00.000Z",
    "accepted_at": "2023-01-02T00:00:00.000Z"
  }
}
```

### List connections

**GET** `/api/connections/:user_id`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Connections fetched successfully!",
  "sentRequests": [],
  "receivedRequests": [],
  "connections": [
    {
      "id": "user_uuid",
      "name": "Jane Smith",
      "headline": "Product Manager",
      "profile_picture_url": "https://example.com/profile.jpg"
    }
  ]
}
```

## Jobs

### Create job posting

**POST** `/api/jobs`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Software Engineer",
  "description": "We are looking for a talented software engineer...",
  "requirements": ["JavaScript", "React", "Node.js"],
  "location": "San Francisco, CA",
  "remote_flag": false,
  "salary_range": "$100,000 - $150,000",
  "expires_at": "2023-12-31T00:00:00.000Z"
}
```

**Response:**

```json
{
  "msg": "Job posted successfully!",
  "job": {
    "id": "uuid",
    "recruiter_id": "recruiter_uuid",
    "title": "Software Engineer",
    "description": "We are looking for a talented software engineer...",
    "requirements": ["JavaScript", "React", "Node.js"],
    "location": "San Francisco, CA",
    "remote_flag": false,
    "salary_range": "$100,000 - $150,000",
    "created_at": "2023-01-01T00:00:00.000Z",
    "expires_at": "2023-12-31T00:00:00.000Z"
  }
}
```

### List jobs

**GET** `/api/jobs?search=software&location=San Francisco&remote=true`

**Response:**

```json
{
  "msg": "Jobs fetched successfully!",
  "jobs": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "We are looking for a talented software engineer...",
      "requirements": ["JavaScript", "React", "Node.js"],
      "location": "San Francisco, CA",
      "remote_flag": true,
      "salary_range": "$100,000 - $150,000",
      "created_at": "2023-01-01T00:00:00.000Z",
      "expires_at": "2023-12-31T00:00:00.000Z",
      "recruiter": {
        "id": "recruiter_uuid",
        "name": "Tech Company",
        "headline": "Innovative tech company",
        "profile_picture_url": "https://example.com/company.jpg"
      }
    }
  ]
}
```

### Apply for job

**POST** `/api/jobs/:id/apply`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "resume_url": "https://example.com/resume.pdf",
  "message": "I'm excited to apply for this position..."
}
```

**Response:**

```json
{
  "msg": "Job application submitted successfully!",
  "application": {
    "id": "uuid",
    "job_id": "job_uuid",
    "user_id": "user_uuid",
    "resume_url": "https://example.com/resume.pdf",
    "message": "I'm excited to apply for this position...",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

## Community

### Create post

**POST** `/api/posts`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "content": "This is my first post on LevelUp Club!",
  "media_urls": ["https://example.com/image.jpg"],
  "visibility": "public" // or "connections"
}
```

**Response:**

```json
{
  "msg": "Post created successfully!",
  "post": {
    "id": "uuid",
    "user_id": "user_uuid",
    "content": "This is my first post on LevelUp Club!",
    "media_urls": ["https://example.com/image.jpg"],
    "visibility": "public",
    "created_at": "2023-01-01T00:00:00.000Z",
    "user": {
      "id": "user_uuid",
      "name": "John Doe",
      "headline": "Software Developer",
      "profile_picture_url": "https://example.com/profile.jpg"
    }
  }
}
```

### Get posts feed

**GET** `/api/posts?visibility=public&limit=20&offset=0`

**Response:**

```json
{
  "msg": "Posts fetched successfully!",
  "posts": [
    {
      "id": "uuid",
      "user_id": "user_uuid",
      "content": "This is my first post on LevelUp Club!",
      "media_urls": ["https://example.com/image.jpg"],
      "visibility": "public",
      "created_at": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": "user_uuid",
        "name": "John Doe",
        "headline": "Software Developer",
        "profile_picture_url": "https://example.com/profile.jpg"
      },
      "comments": [],
      "likes": []
    }
  ]
}
```

### Add comment to post

**POST** `/api/posts/:id/comments`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "content": "Great post!"
}
```

**Response:**

```json
{
  "msg": "Comment added successfully!",
  "comment": {
    "id": "uuid",
    "post_id": "post_uuid",
    "user_id": "user_uuid",
    "content": "Great post!",
    "created_at": "2023-01-01T00:00:00.000Z",
    "user": {
      "id": "user_uuid",
      "name": "Jane Smith",
      "profile_picture_url": "https://example.com/profile.jpg"
    }
  }
}
```

### Like/unlike post

**POST** `/api/posts/:id/like`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (like):**

```json
{
  "msg": "Post liked successfully!",
  "like": {
    "id": "uuid",
    "post_id": "post_uuid",
    "user_id": "user_uuid",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Response (unlike):**

```json
{
  "msg": "Post unliked successfully!"
}
```

## Admin

### Get reports

**GET** `/api/admin/reports`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Reports fetched successfully!",
  "reports": [
    {
      "id": "report_uuid",
      "type": "post",
      "content_id": "post_uuid",
      "reason": "Inappropriate content",
      "reported_by": "user_uuid",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Verify professional

**POST** `/api/admin/verify-professional`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "user_id": "user_uuid"
}
```

**Response:**

```json
{
  "msg": "Professional verified successfully!",
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "professional"
  }
}
```

### Get analytics

**GET** `/api/admin/analytics`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Analytics fetched successfully!",
  "analytics": {
    "users": {
      "total": 1000,
      "byRole": [
        {
          "role": "student",
          "_count": {
            "role": 700
          }
        }
      ]
    },
    "assessments": {
      "total": 5,
      "attempts": 2500
    },
    "careerMatches": {
      "total": 2000
    },
    "connections": {
      "total": 5000
    },
    "jobs": {
      "total": 100,
      "applications": 500
    },
    "community": {
      "posts": 3000,
      "comments": 10000,
      "likes": 50000
    }
  }
}
```

## Messaging

### List conversations

**GET** `/api/conversations`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Conversations fetched successfully!",
  "conversations": [
    {
      "id": "conversation_uuid",
      "participants": [
        {
          "user": {
            "id": "user_uuid",
            "name": "John Doe",
            "profile_picture_url": "https://example.com/profile.jpg"
          }
        }
      ],
      "messages": [
        {
          "content": "Hello!",
          "sent_at": "2023-01-01T00:00:00.000Z"
        }
      ],
      "last_message_at": "2023-01-01T00:00:00.000Z",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create conversation

**POST** `/api/conversations`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "participant_ids": ["user2_uuid", "user3_uuid"]
}
```

**Response:**

```json
{
  "msg": "Conversation created successfully!",
  "conversation": {
    "id": "conversation_uuid",
    "participants": [
      {
        "user": {
          "id": "user_uuid",
          "name": "John Doe",
          "profile_picture_url": "https://example.com/profile.jpg"
        }
      }
    ]
  }
}
```

### Send message

**POST** `/api/conversations/:id/messages`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "content": "Hello everyone!",
  "attachments": ["https://example.com/file.pdf"]
}
```

**Response:**

```json
{
  "msg": "Message sent successfully!",
  "message": {
    "id": "message_uuid",
    "conversation_id": "conversation_uuid",
    "sender_id": "user_uuid",
    "content": "Hello everyone!",
    "attachments": ["https://example.com/file.pdf"],
    "sent_at": "2023-01-01T00:00:00.000Z",
    "sender": {
      "id": "user_uuid",
      "name": "John Doe",
      "profile_picture_url": "https://example.com/profile.jpg"
    }
  }
}
```

### Get conversation messages

**GET** `/api/conversations/:id/messages?limit=50&offset=0`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "msg": "Messages fetched successfully!",
  "messages": [
    {
      "id": "message_uuid",
      "conversation_id": "conversation_uuid",
      "sender_id": "user_uuid",
      "content": "Hello everyone!",
      "attachments": ["https://example.com/file.pdf"],
      "sent_at": "2023-01-01T00:00:00.000Z",
      "sender": {
        "id": "user_uuid",
        "name": "John Doe",
        "profile_picture_url": "https://example.com/profile.jpg"
      }
    }
  ]
}
```
