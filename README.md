# SportVision: Athlete Performance Analytics System

## Project Idea

SportVision is a MERN platform for sports academies to record athlete assessments, follow development over time, and help coaches make individualized training decisions. Coaches can review squad trends, inspect an athlete's strengths and development areas, and turn recommendations into focused training sessions. The project will prioritize clear, explainable performance summaries rather than replacing a coach's judgment.

## Capstone Plan

| Day | Plan |
| --- | --- |
| 1 | Confirm user roles, core requirements, success criteria, and the initial GitHub project board. |
| 2 | Finalize user journeys, wireframes, and the MongoDB data model for athletes, assessments, and sessions. |
| 3 | Set up the MERN application, environment configuration, shared code conventions, and basic CI checks. |
| 4 | Build the Express API structure, database connection, and athlete and assessment endpoints. |
| 5 | Add authentication and role-aware access for coaches and academy administrators. |
| 6 | Build the React overview, athlete roster, and searchable athlete profile screens. |
| 7 | Add assessment history, performance visualizations, and individual development summaries. |
| 8 | Implement training-session planning and connect coaching recommendations to athlete profiles. |
| 9 | Test key user journeys, validate API and UI behavior, address accessibility and responsive layout issues. |
| 10 | Deploy the application, document setup and usage, review outstanding issues, and prepare the final walkthrough. |

## Mock UX Design

[Open the interactive Mock UX](https://raw.githack.com/kalviumcommunity/S91-Sathya-SportVision-Athlete-Performance-Analytics-System/feature/mock-ux-design/mock-ux.html) · [View the HTML source](mock-ux.html)

This mock UX covers the coach overview, athlete roster and profiles, personalized recommendations, training plans, and academy insights. The primary journey moves from squad trends to an athlete’s development needs and a targeted training follow-up.

## Mongoose Data Models

The initial MongoDB schemas are in `server/src/models`:

- `Athlete` stores athlete identity, sport, squad group, optional position/date of birth, and active status.
- `Assessment` belongs to an athlete and stores a dated overall score, one or more measured metrics, and optional coach notes.
- `TrainingSession` stores its schedule, duration, focus areas, participating athletes, and planned/completed/cancelled status.

All three models enable Mongoose timestamps. Assessment history and squad/session queries have supporting indexes. To type-check the models, run `npm install` and `npm run typecheck` from `server`.

## Database-backed API

The Express API connects to MongoDB before it starts listening. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your MongoDB connection string. Set `CLIENT_ORIGIN` to the exact deployed client origin when the client and API are hosted separately; local Vite requests use a same-origin development proxy. Then run the server and client in separate terminals:

```sh
cd server
npm install
npm run dev
```

```sh
cd client
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`. The athlete roster and its latest assessment details are loaded from MongoDB. API routes support database-backed reads and writes for athletes, assessments, and training sessions:

| Resource | Routes |
| --- | --- |
| Athletes | `GET /api/athletes`, `GET /api/athletes/:id`, `POST /api/athletes`, `PATCH /api/athletes/:id`, `DELETE /api/athletes/:id` |
| Assessments | `GET /api/assessments`, `GET /api/assessments/:id`, `POST /api/assessments`, `PATCH /api/assessments/:id`, `DELETE /api/assessments/:id` |
| Training sessions | `GET /api/training-sessions`, `GET /api/training-sessions/:id`, `POST /api/training-sessions`, `PATCH /api/training-sessions/:id`, `DELETE /api/training-sessions/:id` |
| Dashboard | `GET /api/dashboard/summary?period=week\|month\|quarter`, `GET /api/dashboard/performance-trend`, `GET /api/dashboard/upcoming-sessions?limit=5` |

Dashboard summary counts and average scores are calculated from MongoDB; the average uses each athlete's latest assessment in the requested period. The performance-trend endpoint returns eight UTC weeks of assessment averages, including empty weeks. Upcoming sessions are planned sessions ordered by schedule and can be limited to 1–20 results. Assessment and training-session lists can be queried from MongoDB and include populated athlete records; assessment lists also accept an optional `?athlete=<id>` filter. `GET /api/health` reports API/database readiness. Writes validate fields against the existing Mongoose schemas, and athlete deletion is rejected while records still reference that athlete.

Example athlete creation:

```sh
curl -X POST http://localhost:3000/api/athletes \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Maya","lastName":"Chen","sport":"Football","group":"U18","position":"Midfielder"}'
```
