-- LevelUp Club Database Setup Script
-- Run this script in your PostgreSQL database

-- Create the database (run this as a superuser)
-- CREATE DATABASE levelupclub;

-- Connect to the levelupclub database
-- \c levelupclub;

-- The following tables will be created by Prisma migrations
-- This is just for reference of the database structure

/*
Users table:
- id (UUID)
- name (String)
- email (String, unique)
- password_hash (String)
- role (Enum: student, professional, recruiter, admin)
- created_at (DateTime)
- updated_at (DateTime)

Profiles table:
- id (UUID)
- user_id (UUID, foreign key to Users)
- bio (String)
- skills (String)
- experience (String)
- education (String)
- avatar_url (String)
- created_at (DateTime)
- updated_at (DateTime)

Assessments table:
- id (UUID)
- user_id (UUID, foreign key to Users)
- type (String)
- completed (Boolean)
- created_at (DateTime)
- completed_at (DateTime)

TestAttempts table:
- id (UUID)
- assessment_id (UUID, foreign key to Assessments)
- test_type (String)
- answers (JSON)
- score (Int)
- created_at (DateTime)

CareerMatches table:
- id (UUID)
- user_id (UUID, foreign key to Users)
- career_title (String)
- match_percentage (Int)
- description (String)
- skills (String)
- created_at (DateTime)

Connections table:
- id (UUID)
- requester_id (UUID, foreign key to Users)
- recipient_id (UUID, foreign key to Users)
- status (Enum: pending, accepted, rejected)
- created_at (DateTime)
- updated_at (DateTime)

Posts table:
- id (UUID)
- user_id (UUID, foreign key to Users)
- content (String)
- created_at (DateTime)
- updated_at (DateTime)

Comments table:
- id (UUID)
- post_id (UUID, foreign key to Posts)
- user_id (UUID, foreign key to Users)
- content (String)
- created_at (DateTime)
- updated_at (DateTime)

Likes table:
- id (UUID)
- post_id (UUID, foreign key to Posts)
- user_id (UUID, foreign key to Users)
- created_at (DateTime)

Jobs table:
- id (UUID)
- title (String)
- company (String)
- location (String)
- type (String)
- description (String)
- requirements (String)
- salary (String)
- posted_by (UUID, foreign key to Users)
- created_at (DateTime)
- updated_at (DateTime)

JobApplications table:
- id (UUID)
- job_id (UUID, foreign key to Jobs)
- user_id (UUID, foreign key to Users)
- cover_letter (String)
- resume_url (String)
- status (Enum: pending, reviewed, accepted, rejected)
- created_at (DateTime)
- updated_at (DateTime)

Conversations table:
- id (UUID)
- created_at (DateTime)
- updated_at (DateTime)

Messages table:
- id (UUID)
- conversation_id (UUID, foreign key to Conversations)
- sender_id (UUID, foreign key to Users)
- content (String)
- read (Boolean)
- created_at (DateTime)

ConversationParticipants table:
- id (UUID)
- conversation_id (UUID, foreign key to Conversations)
- user_id (UUID, foreign key to Users)
- joined_at (DateTime)
*/

-- To set up the database schema, run the following command in the server directory:
-- npx prisma migrate dev