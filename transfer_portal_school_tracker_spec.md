# Transfer Portal School Tracker — AI Code Agent Build Specification

## 1. Project Overview

Build a polished, production-quality web application using **React + Vite** for a college baseball player in the transfer portal to track schools, recruiting conversations, academic fit, baseball fit, offer details, travel time, and notes.

This should feel like a serious, high-value internal organization tool: clean, fast, reliable, readable, and visually refined. The design style should be **mid-century modern**: warm neutrals, muted accent colors, rounded cards, strong typography, subtle shadows, clean spacing, and tasteful geometric details.

The user should be able to manually add and edit schools, but the most important feature is an **AI-powered “Research School” workflow**. The user types a school name, clicks a button, and the app uses the OpenAI API to research and prefill school data.

The app is not a public marketing site. It is a private dashboard / CRM-style tool for tracking baseball recruiting opportunities.

---

## 2. Core User Goal

The user needs to quickly answer:

- Which schools am I talking to?
- What is the status with each school?
- Which schools have offered?
- Which schools have computer science undergraduate and graduate programs?
- How far is each school from Burlington, North Carolina?
- What conference does the baseball team play in?
- What was the team’s 2026 record?
- What are the cost and tuition details?
- What are the important notes and offer details for each school?

The app should make this information easy to scan, sort, filter, and update.

---

## 3. Technology Requirements

Use the following stack:

- **Frontend:** React with Vite
- **Language:** TypeScript preferred
- **Styling:** CSS Modules, plain CSS, Tailwind, or another lightweight styling approach. Use whichever is already set up or easiest for maintainability.
- **State:** React state/hooks. If needed, use Zustand or Context, but avoid unnecessary complexity.
- **Data persistence:** Start with local persistence using `localStorage` or IndexedDB. Structure the code so a future backend database can be added later.
- **AI research:** OpenAI API through a secure server-side route, serverless function, or backend proxy. Never expose the OpenAI API key in frontend code.

Important security rule:

> Do not put the OpenAI API key directly in any React component, browser code, `.env` variable prefixed with `VITE_`, or client-accessible bundle. The key must only be used on the server side.

Suggested environment variable name:

```bash
OPENAI_API_KEY=your_api_key_here
```

---

## 4. App Name and Branding Direction

Working name options:

- Portal Board
- Transfer Portal Tracker
- School Fit Dashboard
- Recruiting Command Center

Use a professional default name in the UI: **Portal Board**.

Design tone:

- Clean
- Organized
- Confident
- Warm
- Mid-century modern
- Not childish
- Not overly flashy
- Not generic corporate SaaS

---

## 5. Required Pages / Navigation

Create persistent top-level navigation with these main sections:

1. **Dashboard**
2. **Schools**
3. **Add School**
4. **Offers**
5. **Wishlist / Watchlist**
6. **Settings**

The app can be a single-page React app with client-side routing, or a state-driven view switcher if routing is not needed.

### 5.1 Dashboard Page

The dashboard should show a high-level summary of the player’s recruiting situation.

Include summary cards such as:

- Total schools tracked
- Number of offers
- Number of schools pending response
- Number of schools texting
- Number of calls scheduled
- Number of visits scheduled
- Number of schools with undergrad CS
- Number of schools with grad CS
- Closest school by drive time
- Most recent school added

Also include:

- A status breakdown visual section
- A recent activity / recently updated schools section
- A “Needs Follow-Up” section for schools marked as pending, texting, or no response
- Quick action button: **Add School**

### 5.2 Schools Page

This is the main data table / dashboard view.

It must be easy to scan on desktop and mobile.

Required functionality:

- Sort by any major field
- Global search
- Filter by status
- Filter by offer / no offer
- Filter by undergraduate CS available
- Filter by graduate CS available
- Filter by conference
- Toggle between table/list/grid view if practical
- Edit school
- Delete school
- View full school detail

### 5.3 Add School Page

This page should allow two ways to add a school:

#### Option A: AI Research Add

User enters school name and clicks:

- **Research School**
- **Research & Add**

The app should call the AI research endpoint and return structured data.

The result should be shown in a review form before final save, so the user can correct anything.

Important: AI-researched fields should not be blindly trusted. Show a small notice:

> AI-filled information should be reviewed for accuracy before relying on it.

#### Option B: Manual Add

User can manually fill out all fields without AI.

### 5.4 Offers Page

Show only schools with offer-related information.

Include:

- School name
- Offer status
- Scholarship details
- Roster role / pitching role
- Academic details
- Important dates
- Notes
- Contact info if available

### 5.5 Wishlist / Watchlist Page

Show schools the player is interested in but not yet actively talking to.

A school can have status `Wishlist` or a boolean `isWishlist`.

### 5.6 Settings Page

Include basic app settings:

- Player home location: default to **Burlington, North Carolina**
- Player academic interest: default to **Computer Science**
- API status / AI feature enabled indicator
- Data export / import options
- Clear all local data option with confirmation

---

## 6. Main Data Fields

Each school should have the following fields.

### 6.1 Core School Info

```ts
type School = {
  id: string;
  name: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  fullLocation?: string;
  schoolWebsite?: string;
  athleticsWebsite?: string;

  tuitionInState?: number;
  tuitionOutOfState?: number;
  estimatedCostOfAttendance?: number;
  costTypeUsed?: 'in-state' | 'out-of-state' | 'unknown';
  costNotes?: string;

  hasUndergradCS?: boolean | 'unknown';
  undergradCSProgramName?: string;
  undergradCSUrl?: string;

  hasGradCS?: boolean | 'unknown';
  gradCSProgramName?: string;
  gradCSUrl?: string;

  baseballConference?: string;
  baseballDivision?: string;
  baseball2026Record?: string;
  baseballRecordSourceUrl?: string;

  driveTimeFromBurlingtonNC?: string;
  driveDistanceFromBurlingtonNC?: string;
  mapsUrl?: string;

  status: RecruitingStatus;
  priority?: 'High' | 'Medium' | 'Low';
  isWishlist?: boolean;

  contacts?: SchoolContact[];
  offer?: OfferDetails;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;

  aiResearchSummary?: string;
  aiSources?: ResearchSource[];
  confidence?: 'High' | 'Medium' | 'Low';

  createdAt: string;
  updatedAt: string;
};
```

### 6.2 Recruiting Status

Use the following statuses:

```ts
type RecruitingStatus =
  | 'Wishlist'
  | 'Not Contacted'
  | 'Pending Response'
  | 'Texting'
  | 'Call Scheduled'
  | 'Called'
  | 'Visit Scheduled'
  | 'Visited'
  | 'Offer'
  | 'Committed'
  | 'Passed'
  | 'No Longer Interested';
```

Each status should have a clear visual tag.

Suggested color direction:

- Offer: warm green
- Texting: muted blue
- Call Scheduled: amber
- Visit Scheduled: rust/orange
- Pending Response: tan/yellow
- Wishlist: lavender or muted purple
- Passed / No Longer Interested: gray
- Committed: deep green or navy

### 6.3 Offer Details

```ts
type OfferDetails = {
  hasOffer: boolean;
  offerDate?: string;
  scholarshipType?: 'Full' | 'Partial' | 'Walk-on' | 'Unknown';
  scholarshipAmount?: string;
  academicAid?: string;
  rosterRole?: string;
  pitchingRole?: string;
  housingIncluded?: boolean | 'unknown';
  importantConditions?: string;
  deadline?: string;
  notes?: string;
};
```

### 6.4 Contacts

```ts
type SchoolContact = {
  id: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  twitterX?: string;
  notes?: string;
};
```

### 6.5 AI Research Sources

```ts
type ResearchSource = {
  title: string;
  url: string;
  fieldSupported?: string;
};
```

---

## 7. Data Table / Dashboard Requirements

The Schools page should be modeled after a clean collection dashboard, but adapted for college baseball recruiting.

### 7.1 Required Table Columns

Include these columns where screen size allows:

1. School Name
   - Text
   - Include logo thumbnail placeholder if no logo is available
2. Location
   - City, state
3. Status
   - Categorical tag with distinct styling
4. Offer
   - Yes / No / Details
5. Cost of Attendance
   - Currency-formatted
6. Undergrad CS
   - Yes / No / Unknown
7. Grad CS
   - Yes / No / Unknown
8. Baseball Conference
   - Text
9. 2026 Baseball Record
   - Text
10. Drive Time
   - Text
11. Last Contact
   - Date
12. Next Follow-Up
   - Date
13. Priority
   - High / Medium / Low
14. Actions
   - View
   - Edit
   - Delete

### 7.2 Sorting

Users must be able to sort the schools by:

- Name
- Status
- Offer status
- Cost
- Undergrad CS
- Grad CS
- Conference
- Baseball record
- Drive time
- Last contact date
- Next follow-up date
- Priority
- Date added
- Last updated

### 7.3 Search

Add a global search bar that filters in real time.

Search should match at least:

- School name
- City
- State
- Conference
- Status
- Notes
- Contact names

### 7.4 Filtering

Add filter controls for:

- Status
- Has offer
- Has undergrad CS
- Has grad CS
- Priority
- Conference
- Wishlist only
- Needs follow-up

### 7.5 Responsive Layout

Desktop:

- Full table view with sticky header if possible.

Tablet:

- Condensed table or card list.

Mobile:

- Card/list view is preferred over a cramped table.
- Each school card should show the most important information first:
  - School name
  - Status
  - Offer tag
  - Location
  - Conference
  - Drive time
  - CS indicators
  - Follow-up date

### 7.6 Actions

Each school row/card should have:

- View Details
- Edit
- Delete

Delete should require confirmation.

---

## 8. School Detail View

Clicking a school should open a full detail page or modal.

Include sections:

1. Overview
2. Recruiting Status
3. Offer Details
4. Academics
5. Baseball Program
6. Cost / Financial Info
7. Travel Info
8. Contacts
9. Notes
10. AI Research Sources

The user should be able to edit from this view.

---

## 9. AI Research Workflow

This is one of the most important parts of the app.

### 9.1 User Flow

1. User goes to Add School.
2. User types a school name.
3. User clicks **Research School**.
4. App sends the school name and home location to a secure backend/API route.
5. Backend calls OpenAI.
6. OpenAI returns structured JSON.
7. Frontend displays the result in an editable review form.
8. User reviews and clicks **Save School**.

### 9.2 Important AI Safety / Accuracy Rules

- The AI should return structured JSON only.
- The AI should include source URLs when possible.
- The AI should mark uncertain data as `unknown`, not guess.
- The AI should include a confidence level.
- The UI should make it clear that AI-filled data must be reviewed.
- Do not overwrite manually edited user data without confirmation.

### 9.3 Server-Side Endpoint

Create an endpoint like:

```txt
POST /api/research-school
```

Request body:

```json
{
  "schoolName": "East Tennessee State University",
  "homeLocation": "Burlington, North Carolina",
  "academicInterest": "Computer Science"
}
```

Response body should match the `School` shape as closely as possible.

### 9.4 OpenAI Prompt Requirements

The backend should send a prompt similar to this:

```txt
You are helping build a transfer portal college baseball school tracking dashboard.

Research the following college/university and return structured JSON only.

School name: {{schoolName}}
Home location for drive time: {{homeLocation}}
Academic interest: Computer Science

Find the following information if available:
- Official school name
- City and state
- School website
- Athletics website
- Estimated tuition/cost of attendance
- Whether the school has an undergraduate Computer Science program
- Whether the school has a graduate Computer Science program
- Baseball conference
- NCAA division
- 2026 baseball team record
- Estimated driving time and distance from Burlington, North Carolina
- Useful notes for a transfer portal baseball player
- Source URLs for important claims

Rules:
- Return JSON only.
- Do not include markdown.
- If a field is uncertain or unavailable, use null or "unknown".
- Do not invent exact tuition, records, or program details.
- Include a confidence value: High, Medium, or Low.
```

### 9.5 Expected AI JSON Shape

```json
{
  "name": "",
  "city": "",
  "state": "",
  "fullLocation": "",
  "schoolWebsite": "",
  "athleticsWebsite": "",
  "tuitionInState": null,
  "tuitionOutOfState": null,
  "estimatedCostOfAttendance": null,
  "costTypeUsed": "unknown",
  "costNotes": "",
  "hasUndergradCS": "unknown",
  "undergradCSProgramName": "",
  "undergradCSUrl": "",
  "hasGradCS": "unknown",
  "gradCSProgramName": "",
  "gradCSUrl": "",
  "baseballConference": "",
  "baseballDivision": "",
  "baseball2026Record": "",
  "baseballRecordSourceUrl": "",
  "driveTimeFromBurlingtonNC": "",
  "driveDistanceFromBurlingtonNC": "",
  "mapsUrl": "",
  "aiResearchSummary": "",
  "aiSources": [
    {
      "title": "",
      "url": "",
      "fieldSupported": ""
    }
  ],
  "confidence": "Medium"
}
```

### 9.6 Important Note About OpenAI Browsing

Do not assume the basic OpenAI API can browse the live web unless the selected tool/model supports web search or a separate search API is integrated.

Implementation should choose one of these approaches:

#### Preferred approach

Use OpenAI with a web-search-capable tool/model if available in the project environment.

#### Alternate approach

Use a search API or manually curated sources, then pass the gathered text/URLs into OpenAI for extraction and formatting.

#### Fallback approach

Allow the AI to fill what it can from model knowledge but clearly mark low-confidence or unknown fields.

The app must be honest with the user when data cannot be verified.

---

## 10. Manual Editing Requirements

The user must be able to manually edit every field, including AI-filled fields.

Important editing features:

- Save changes
- Cancel changes
- Required school name
- Optional fields can be blank
- Date inputs for contact/follow-up dates
- Dropdowns for status and priority
- Textarea for notes
- Offer details section should expand/collapse

---

## 11. Data Persistence

Start with local persistence.

Create a storage abstraction so it can later be replaced with a real backend.

Suggested structure:

```ts
interface SchoolRepository {
  getAll(): Promise<School[]>;
  getById(id: string): Promise<School | null>;
  create(input: School): Promise<School>;
  update(id: string, updates: Partial<School>): Promise<School>;
  delete(id: string): Promise<void>;
}
```

Initial implementation can wrap `localStorage`.

Use a single key such as:

```ts
portal-board-schools
```

Also provide:

- Export JSON
- Import JSON
- Clear data with confirmation

---

## 12. Visual Design Requirements

### 12.1 Mid-Century Modern Style

Use a warm, polished, mid-century modern visual system.

Suggested palette:

```css
:root {
  --color-cream: #f5efe6;
  --color-paper: #fffaf2;
  --color-walnut: #5a3e2b;
  --color-rust: #c46a3a;
  --color-olive: #7a8450;
  --color-mustard: #d6a43b;
  --color-teal: #2f6f73;
  --color-charcoal: #27221f;
  --color-muted: #8a7f73;
  --color-border: #dfd2c2;
}
```

Use these ideas, not necessarily these exact values.

### 12.2 Typography

Use clean, modern typography.

Good font directions:

- Headings: bold geometric sans-serif
- Body: readable sans-serif
- Avoid overly decorative fonts

Suggested CSS font stack:

```css
font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
```

### 12.3 Layout Style

Use:

- Rounded cards
- Subtle shadows
- Cream background
- High contrast text
- Muted color accents
- Spacious layout
- Clear section headings
- Pill tags for statuses
- Consistent button styles

### 12.4 UI Components

Build reusable components:

- `AppShell`
- `TopNav`
- `DashboardCard`
- `StatusBadge`
- `SchoolTable`
- `SchoolCard`
- `SchoolForm`
- `OfferDetailsForm`
- `FilterBar`
- `SearchInput`
- `ConfirmDialog`
- `EmptyState`
- `LoadingState`
- `SourceList`

---

## 13. Suggested File Structure

Use a clean structure like this:

```txt
src/
  api/
    researchSchool.ts
  components/
    AppShell.tsx
    TopNav.tsx
    DashboardCard.tsx
    StatusBadge.tsx
    SchoolTable.tsx
    SchoolCard.tsx
    SchoolForm.tsx
    OfferDetailsForm.tsx
    FilterBar.tsx
    SearchInput.tsx
    ConfirmDialog.tsx
    EmptyState.tsx
    LoadingState.tsx
    SourceList.tsx
  data/
    sampleSchools.ts
  hooks/
    useSchools.ts
  pages/
    DashboardPage.tsx
    SchoolsPage.tsx
    AddSchoolPage.tsx
    OffersPage.tsx
    WishlistPage.tsx
    SettingsPage.tsx
  services/
    schoolRepository.ts
    localStorageSchoolRepository.ts
  types/
    school.ts
  utils/
    formatCurrency.ts
    formatDate.ts
    sortSchools.ts
    filterSchools.ts
  styles/
    globals.css
    theme.css
  App.tsx
  main.tsx
```

If using a serverless or backend folder, add something like:

```txt
api/
  research-school.ts
```

or, if using Express:

```txt
server/
  index.ts
  routes/
    researchSchool.ts
```

---

## 14. Functional Details

### 14.1 Dashboard Stats

Calculate stats dynamically from saved school data.

Examples:

```ts
const totalSchools = schools.length;
const offerCount = schools.filter(s => s.offer?.hasOffer || s.status === 'Offer').length;
const pendingCount = schools.filter(s => s.status === 'Pending Response').length;
const textingCount = schools.filter(s => s.status === 'Texting').length;
const callScheduledCount = schools.filter(s => s.status === 'Call Scheduled').length;
const visitScheduledCount = schools.filter(s => s.status === 'Visit Scheduled').length;
const undergradCSCount = schools.filter(s => s.hasUndergradCS === true).length;
const gradCSCount = schools.filter(s => s.hasGradCS === true).length;
```

### 14.2 Needs Follow-Up Logic

A school should appear in “Needs Follow-Up” if:

- `nextFollowUpDate` is today or earlier
- status is `Pending Response`
- status is `Texting` and `lastContactDate` is older than a few days
- user manually marks it high priority

### 14.3 Status Badge Component

Create a reusable badge component.

Example:

```tsx
<StatusBadge status={school.status} />
```

Each status should be visually distinct but consistent.

### 14.4 Empty States

Use helpful empty states.

Examples:

- No schools yet: “Add your first school to start tracking your portal process.”
- No offers yet: “Offers will appear here once you mark a school as offered.”
- No wishlist schools: “Add schools to your wishlist to track future opportunities.”

---

## 15. Validation Rules

Required:

- School name
- Status

Recommended validation:

- URLs should be valid if provided
- Dates should use `YYYY-MM-DD`
- Cost fields should be numeric if provided
- Boolean/unknown fields should not be stored as random strings

---

## 16. Accessibility Requirements

The site should be accessible and keyboard-friendly.

Requirements:

- Buttons must use real `<button>` elements
- Inputs must have labels
- Color should not be the only way to communicate status
- Text contrast should be strong
- Modals/dialogs should be keyboard usable
- Focus states should be visible
- Tables should use semantic table markup on desktop

---

## 17. Loading and Error States

For AI research:

- Show loading state while researching
- Disable duplicate submit while loading
- Show clear error message if AI research fails
- Allow user to continue manually if AI fails

Example error copy:

> School research could not be completed. You can try again or add the school manually.

---

## 18. AI Research API Implementation Guidance

### 18.1 Frontend Call

Create a function like:

```ts
export async function researchSchool(schoolName: string) {
  const response = await fetch('/api/research-school', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schoolName,
      homeLocation: 'Burlington, North Carolina',
      academicInterest: 'Computer Science',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to research school');
  }

  return response.json();
}
```

### 18.2 Backend Pseudocode

```ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function researchSchoolHandler(req, res) {
  const { schoolName, homeLocation, academicInterest } = req.body;

  if (!schoolName) {
    return res.status(400).json({ error: 'School name is required' });
  }

  const prompt = buildResearchPrompt({
    schoolName,
    homeLocation,
    academicInterest,
  });

  const result = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
  });

  const parsed = parseAndValidateJson(result.output_text);

  return res.json(parsed);
}
```

Important:

- Adjust the model name based on what is available in the account/project.
- Validate the returned JSON before sending it to the frontend.
- Never trust raw AI output without parsing and fallback handling.

---

## 19. Sample Seed Data

Include a few sample records so the UI does not look empty during development.

Example:

```ts
export const sampleSchools: School[] = [
  {
    id: 'sample-etsu',
    name: 'East Tennessee State University',
    city: 'Johnson City',
    state: 'TN',
    fullLocation: 'Johnson City, Tennessee',
    status: 'Texting',
    priority: 'High',
    hasUndergradCS: true,
    hasGradCS: true,
    baseballConference: 'Southern Conference',
    baseballDivision: 'NCAA Division I',
    baseball2026Record: 'Unknown',
    driveTimeFromBurlingtonNC: 'Approx. 3 hr 30 min',
    driveDistanceFromBurlingtonNC: 'Approx. 210 miles',
    notes: 'Sample school for development only. Verify all data before using.',
    offer: {
      hasOffer: false,
    },
    aiSources: [],
    confidence: 'Low',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

Make sure sample data is clearly fake/sample if it has not been verified.

---

## 20. Data Export / Import

Add JSON export/import so the user does not lose data.

Export:

- Download all school data as a JSON file.

Import:

- Upload a JSON file.
- Validate structure.
- Ask whether to merge or replace existing schools.

---

## 21. Polish Requirements

The final site should feel complete.

Include:

- Consistent spacing
- Strong empty states
- Smooth hover/focus states
- Clear buttons
- No default ugly browser UI where avoidable
- No broken mobile layout
- No console errors
- No unused starter Vite content
- No exposed API key
- No fake claims presented as verified facts

---

## 22. Suggested Implementation Order for the AI Code Agent

Build in this order:

1. Set up clean Vite React TypeScript project structure.
2. Create global theme and mid-century modern styling.
3. Define TypeScript types for school data.
4. Build localStorage repository.
5. Build main app shell and navigation.
6. Build Dashboard page with summary cards.
7. Build Schools page with table/card view, sorting, searching, and filtering.
8. Build Add School page with manual form.
9. Add edit/delete/view detail flows.
10. Build Offers and Wishlist pages.
11. Add settings page with export/import/clear data.
12. Add secure backend/serverless AI research endpoint.
13. Connect Research School button to endpoint.
14. Add AI result review-before-save workflow.
15. Add error/loading states.
16. Test desktop, tablet, and mobile layouts.
17. Remove placeholder code and polish UI.

---

## 23. Acceptance Criteria

The project is complete when:

- The user can add a school manually.
- The user can type a school name and use AI research to prefill school info.
- The user can review and edit AI-filled information before saving.
- The user can view all schools in a dashboard/table/card layout.
- The user can sort, search, and filter schools.
- The user can edit and delete schools.
- The user can track recruiting status and offer details.
- The user can see dashboard summary stats.
- The user can export and import data.
- The UI is responsive and attractive on desktop and mobile.
- The OpenAI API key is not exposed in frontend code.
- The design follows a mid-century modern style.

---

## 24. Final Notes for the Code Agent

Prioritize reliability, readability, and data organization over flashy animation.

The app should feel like a personal recruiting command center. The most important design goal is that the user can open the site and immediately understand where every school stands.

Do not overcomplicate the first version with authentication, a full database, or unnecessary backend infrastructure unless the user explicitly asks for it. Build the app in a way that can evolve later.

The AI research feature should be helpful, but the app should still work perfectly without it.
