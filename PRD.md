# Product Requirements Document: Treeban

# Product Overview

## Product Vision
Treeban is a web app that helps users learn and remember plants through real-world encounters. Users can identify plants using AI, automatically generate flashcards tied to personal memories and locations, organize discoveries into collections, and quiz themselves over time to build long-term recognition and knowledge.

## Target Users

### Primary Users
- Nature enthusiasts
- Casual hikers/walkers
- Students learning botany
- Travelers who enjoy documenting experiences
- Users interested in mindful journaling

### Secondary Users
- Teachers and educators
- Plant hobbyists
- Gardeners
- Outdoor photographers

## Business Objectives
- Create a highly engaging and habit-forming learning experience
- Increase user retention through memory-based spaced repetition
- Build a visually shareable product with strong identity
- Validate demand for AI-assisted nature learning tools
- Establish foundation for future mobile app expansion

## Success Metrics
- Daily active users (DAU)
- Weekly flashcard review completion rate
- Number of plants saved per user
- Retention after 7 and 30 days
- Average quiz sessions per week
- Average collection size per user

---

# User Personas

## Persona 1: Maya — Casual Nature Explorer

### Demographics
- 24 years old
- Graduate student
- Moderate technical proficiency

### Goals
- Learn plants encountered during walks
- Document meaningful outdoor moments
- Build a visual memory collection

### Pain Points
- Forgets plant names quickly
- Existing plant apps feel too scientific
- Wants a more emotional and aesthetic experience

### User Journey
1. Takes photo during walk
2. Identifies plant
3. Adds personal note
4. Revisits flashcards later through quizzes

## Persona 2: Daniel — Hobby Gardener

### Demographics
- 35 years old
- Software engineer
- High technical proficiency

### Goals
- Learn plant species faster
- Track discoveries over time
- Build knowledge through repetition

### Pain Points
- Traditional flashcards feel disconnected from reality
- Existing plant apps lack learning systems

### User Journey
1. Uploads plant images
2. Saves identified species
3. Uses review mode daily
4. Tracks mastery progress

---

# Feature Requirements

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|---|---|---|---|---|---|
| Plant Identification | Upload or capture image to identify plant | As a user, I want to identify plants from photos | Must | User receives plant result with confidence score within 5 seconds | Plant identification API |
| Flashcard Generation | Give user an option to create flashcards from identified plants | As a user, I want saved plants converted into study cards | Must | Flashcard includes image, plant name. User can dismiss creating a flashcard. User has an option to add personal notes. | Plant data |
| Collections | Organize saved plants into collections by day/month/year | As a user, I want to revisit discoveries chronologically | Must | Plants grouped by timeline and searchable. Collections are a filtered view of plant_identifications by date — no separate table needed. | Database |
| Quiz Mode | Review plants using spaced repetition | As a user, I want to test my memory of plants | Must | Quiz displays saved plants and tracks correct answers. Next review scheduled based on user familiarity rating. | Flashcard system |
| User Authentication | Email-based login and registration | As a user, I want to register and login into the app to use its features | Must | User can register and login with email and password | Database |
| Map View | Display discoveries on a map | As a user, I want to visually explore where I found plants | Nice-to-have | Pins display saved plants | Map API |
| Plant Familiarity System | Track learning mastery | As a user, I want to see improvement over time | Nice-to-have | Plants labeled Unknown/Familiar/Mastered | Quiz data |

---

# User Flows

## Flow 1: Plant Discovery

1. User opens web app
2. User uploads or captures plant image
3. AI identifies plant
4. User confirms plant result
5. User is given an option of creating a flashcard. If user clicks create flashcard, the flashcard is automatically generated with the plant image and name
6. User optionally adds a personal note
7. Plant saved into collection

### Alternative Paths
- AI confidence is low (< 0.5) → user chooses from suggested results
- Upload fails → retry option shown
- API error → show "Identification failed, please try again" message

---

## Flow 2: Flashcard Review

1. User opens review mode
2. App displays plant image
3. User types in the plant name
4. User clicks Check My Answer
5. App shows correct/incorrect result
6. User rates familiarity:
   - Easy
   - Medium
   - Hard
6. App schedules next review based on rating

### Spaced Repetition Logic
- Hard → show again in 1 day
- Medium → show again in 3 days
- Easy → show again in 7 days

### Error States
- No saved plants → user is prompted to create flashcards

---

# Non-Functional Requirements

## Performance
- Load Time: < 3 seconds
- Concurrent Users: 1,000 users
- Response Time: Identification results < 5 seconds

## Security
- Authentication: Email + password login only
- Authorization: User-specific collections only
- Data Protection: Encrypted user data and secure image storage

---

# Technical Specifications

# Frontend
- Technology Stack: Next.js + React + TailwindCSS
- Design System: Minimal earthy UI system
- Responsive Design: Mobile-first responsive layout

## Screen 1: Authentication
- A login/signup page with fields for:
  - Email
  - Password
- A login button and a signup button

## Screen 2: Main Screen
- On the main screen there would be an image of someone holding a camera in front of a tree. This is in cartoon cute style. There are three different buttons at the bottom of the screen:
  1. The first one in the middle is "Plant Identification"
  2. The second one is "Timeline" so the user can click on the timeline and see what plants have been identified
  3. The third button is "Quiz" so the user can click on it to quiz themselves on the plants they have identified

## Screen 3: Plant Identification Screen
- On the plant identification screen, the screen will open up as a camera screen so the user will have a camera button
- Mobile: camera capture + file upload
- Desktop: file upload only
- Once the user clicks on the camera or uploads a file, it will show a loading state and then display the results of the plant, showing the name and the confidence score of the identification
- The results screen will have an option to create a flashcard
- After the user clicks create flashcard, it will show a flashcard creation screen where the user can add a personal note

## Screen 4: Timeline Screen
- The timeline screen will show a list of all the identified plants in chronological order
- Each plant in the timeline will have an image, the name of the plant, and the date it was identified
- Plants are grouped by day, month, and year
- This is a filtered view of plant_identifications sorted by date — no separate collections table

## Screen 5: Quiz Screen
- The quiz screen will show a random plant from the user's identified plants
- The quiz screen shows an image of the plant. The user must type in the full plant name and click Check My Answer
- After checking the answer, it will show the user if their answer was correct or not
- The user will have the option of skipping this plant. If skipped, the plant name will be shown to the user

---

# Backend
- Technology Stack: Next.js API Routes (on Vercel) + Supabase
- Plant.id API is called from Next.js API Routes, never from the browser
- Supabase Edge Functions: not used in MVP
- API Requirements: REST APIs
- Database: PostgreSQL via Supabase

## Architecture

### How the App Communicates
```
User's Browser → Next.js API Route (Vercel) → Plant.id API
User's Browser → Supabase directly (for auth + data)
```

### Client-Side Operations (runs in browser, uses Anon Key)
- User sign up / log in / log out
- Fetching the logged-in user's own plant history
- Displaying results back to the user

### Server-Side Operations (runs in Next.js API Routes, keys stay hidden)
- Receiving the plant image from the user
- Calling Plant.id API with the image
- Storing the identification result to the database

### Environment Variables
All credentials must be read from `.env` and never hardcoded:
```
NEXT_PUBLIC_SUPABASE_URL=      → your Supabase project URL (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY= → used client-side for auth and data access (safe to expose in browser)
SUPABASE_SERVICE_ROLE_KEY=     → used server-side in API Routes only, never in browser
PLANT_API_KEY=                 → used server-side in API Routes only, never in browser
```

### Security Rules
- `PLANT_API_KEY` must never appear in client-side code
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in client-side code
- `NEXT_PUBLIC_` variables are intentionally exposed to the browser — never put secrets in them
- Plant.id API must always be called from a Next.js API Route, never directly from the browser
- Supabase Row Level Security (RLS) must be enabled so users can only access their own data

---

## Plant.id API

### Authentication
Pass your API key in the request header.
The API key should be read from the `.env` file as `PLANT_API_KEY`.
```
Api-Key: your_api_key
```

### Making an Identification (POST)
Send a POST request to `https://plant.id/api/v3/identification` with:
- **Required:** `images` — your photo as a Base64 string or public URL

### Credits
- 1 credit = 1 basic identification
- 2 credits = identification + health assessment (`health: "all"`)
- Free trial = 100 credits
- Check balance anytime via the admin panel or a dedicated API call

### Example Request
```
curl --location 'https://plant.id/api/v3/identification' \
--header 'Api-Key: your_api_key' \
--header 'Content-Type: application/json' \
--data '{
    "images": ["data:image/jpg;base64,/9j/..."],
    "latitude": 49.207,
    "longitude": 16.608,
    "similar_images": true
}'
```

### Response Structure
```
access_token                          → unique ID for this identification (use to retrieve later via GET)
result.is_plant                       → binary (true/false) + probability score
result.classification.suggestions     → list of plant matches, each with:
    - name                            → scientific name
    - probability                     → confidence score (0 to 1)
    - similar_images                  → reference photos (only if requested)
    - details                         → extra info (only if requested)
```

### GET vs POST
- **POST** → sends image, runs the model, costs a credit, returns `access_token`
- **GET** → uses `access_token` to retrieve a previous result, costs nothing

### Development Tips — Save Your Credits
- Turn off optional features while building. Don't include `health`, `similar_images`, or extra `details` until actually needed
- Reuse one test image. Pick one plant photo and reuse it for every test run
- Save your first successful response. Test your parsing/display logic against that saved JSON instead of making live API calls
- Check your balance before bulk tests. 100 credits goes fast if a loop is running
- Use a saved mock response during development. Build and test all display/parsing logic against a fixture JSON file before making any live API calls

---

## Database Structure (Supabase)

### Table 1: `users`
Handled automatically by Supabase Auth — no need to create manually.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Auto-generated by Supabase Auth |
| email | string | User's email |
| created_at | timestamp | When they signed up |

### Table 2: `plant_identifications`
Each row = one plant scan.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Auto-generated |
| user_id | uuid | Foreign key → users.id |
| image_url | string | Link to image in Supabase Storage |
| plant_name | string | Top result from Plant.id e.g. "Monstera deliciosa" |
| confidence_score | float | Probability score from Plant.id e.g. 0.87 |
| identified_at | timestamp | Auto-generated at time of scan |

### Table 3: `flashcards`
Each row = one flashcard created from a plant identification.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Auto-generated |
| user_id | uuid | Foreign key → users.id |
| plant_identification_id | uuid | Foreign key → plant_identifications.id |
| plant_name | string | From Plant.id result |
| image_url | string | Same image from identification |
| personal_note | string | Optional note added by user |
| next_review_at | timestamp | Scheduled date for next quiz review |
| created_at | timestamp | Auto-generated |

### Table 4: `quiz_history`
Each row = one quiz attempt on a flashcard.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Auto-generated |
| user_id | uuid | Foreign key → users.id |
| flashcard_id | uuid | Foreign key → flashcards.id |
| result | string | "easy", "medium", or "hard" |
| reviewed_at | timestamp | Auto-generated at time of review |

### Table 5: Supabase Storage Bucket — `plant-images`
Where actual image files are stored. The `image_url` column in `plant_identifications` points here.

```
plant-images/
  └── {user_id}/
        └── {identification_id}.jpg
```

### Note on Collections
Collections are **not a separate table**. They are a filtered view of `plant_identifications` sorted and grouped by `identified_at` date (day / month / year).

### Relationships
```
users
  └── has many → plant_identifications
                    └── has one  → image in Supabase Storage
                    └── has one  → flashcard
                                    └── has many → quiz_history
```

### Row Level Security (RLS) Rules
Users can only access their own data.

| Table | Operation | Rule |
|---|---|---|
| plant_identifications | SELECT | user_id = logged in user's ID |
| plant_identifications | INSERT | user_id = logged in user's ID |
| plant_identifications | DELETE | user_id = logged in user's ID |
| flashcards | SELECT | user_id = logged in user's ID |
| flashcards | INSERT | user_id = logged in user's ID |
| flashcards | DELETE | user_id = logged in user's ID |
| quiz_history | SELECT | user_id = logged in user's ID |
| quiz_history | INSERT | user_id = logged in user's ID |

### Flow When a User Scans a Plant
1. User uploads image
2. Image is sent to Next.js API Route
3. API Route calls Plant.id API with image
4. API Route uploads image to Supabase Storage → gets back image_url
5. API Route saves plant_name, confidence_score, image_url, user_id to plant_identifications table
6. Browser fetches user's plant_identifications to show history/gallery

---

# Infrastructure
- Hosting: Vercel
- Scaling: Serverless scaling
- CI/CD: Manual deploy to Vercel (no auto-deploy on push)

---

# Analytics & Monitoring (Second version - not in MVP)

## Key Metrics
- Plants identified
- Flashcards created
- Quiz sessions completed
- Retention rate
- Average session duration

## Events
- Plant scanned
- Flashcard created
- Quiz completed
- Collection viewed
- Note added

## Dashboards
- User growth dashboard
- Retention dashboard
- Quiz engagement dashboard

---

# Release Planning

## MVP (v1.0)

### Features
- Plant identification
- Flashcard creation
- Collections (filtered timeline view)
- Quiz mode with spaced repetition
- Authentication (email + password)
- Personal notes on flashcards

### Timeline
4–6 weeks

### Success Criteria
- 100 active users
- 40% weekly retention
- Average 10+ saved plants per user

---

# Future Releases

## v1.1
- Map view
- Streaks
- Plant mastery system

## v1.2
- AI-generated fun facts
- Social sharing
- Seasonal recap

## v2.0
- Native mobile app
- Offline identification
- AR recognition mode
- Community collections

---

# Assumptions
- Users value emotional memory over pure scientific data
- Learning through personal encounters improves retention
- Users will revisit app primarily for review mode