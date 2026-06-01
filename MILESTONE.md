# Build Plan — Treeban

## How to use this document
Build and fully test each milestone before moving to the next.
Do not scaffold features from future milestones early.

---

## Milestone 1: Project Setup ✅
- [x] Initialize Next.js project with TailwindCSS
- [x] Connect Supabase project
- [x] Deploy empty app to Vercel
- [x] Deploy to Vercel manually and confirm app is live with no errors

✅ Done when: App is live on Vercel with no errors

---

## Milestone 2: Authentication ✅
- [x] Email + password sign up
- [x] Email + password log in
- [x] Log out
- [x] Protect routes (redirect to login if not authenticated)

✅ Done when: User can register, log in, and log out successfully

---

## Milestone 3: Plant Identification ✅
- [x] Image upload UI on identification screen
- [x] In-browser camera viewfinder using getUserMedia (Use Camera + Upload Photo as two entry points)
- [x] Next.js API Route that calls Plant.id API
- [x] Display plant name and confidence score from result
- [x] Handle low confidence (< 0.5 confidence score — show multiple suggestions)
- [x] Set up mock/fixture Plant.id response for local dev to avoid burning API credits (USE_MOCK=true)
- [x] Handle API errors gracefully

✅ Done when: User can upload a photo and see a real Plant.id result

---

## Milestone 4: Flashcard Creation ✅
- [x] "Create Flashcard" button appears after identification result
- [x] Image uploaded to Supabase Storage, identification saved to plant_identifications at identify time
- [x] Flashcard saved to Supabase (plant_name, image_url, personal_note)
- [x] User can add optional personal note before saving
- [x] User can dismiss and skip flashcard creation

✅ Done when: User can create and save a flashcard from an identification

---

## Milestone 5: Timeline (Collections)
- [ ] Timeline screen shows all user's plant_identifications
- [ ] Sorted chronologically, grouped by day/month/year
- [ ] Each entry shows image, plant name, and date

✅ Done when: User can scroll through their full identification history

---

## Milestone 6: Quiz Mode
- [ ] Quiz screen shows a random flashcard image
- [ ] User types in plant name and clicks Check My Answer
- [ ] App shows correct/incorrect result
- [ ] User rates Easy / Medium / Hard
- [ ] next_review_at updated in Supabase based on rating
- [ ] Skip option shows the correct answer without rating

✅ Done when: User can complete a full quiz session with spaced repetition scheduling

---
