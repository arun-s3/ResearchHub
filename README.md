# ResearchHub

A project-based article review workspace inspired by systematic literature review workflows.

ResearchHub allows teams to organize research articles inside projects, assign reviewers, track review decisions, and collaborate through a structured review process.

The application was built as a take-home assignment for EasySLR with a focus on authorization, article import validation, review workflows, and project-level access control.

---

## Project Overview

ResearchHub is organized around four core concepts:

- Organizations
- Projects
- Articles
- Project Members

Organizations contain projects.

Projects contain imported research articles.

Users can be assigned to projects as either reviewers or viewers.

All article visibility and actions are scoped to project membership.

The goal was to provide a practical workflow for screening and reviewing research articles rather than building a generic CRUD application.

---

## Review Workflow

I chose a simple review workflow based on common article screening stages.

Each article can be marked as:

- Pending
- Included
- Excluded
- Maybe

Reviewers can additionally:

- Set article priority (Low / Medium / High)
- Add reviewer notes
- Add a decision reason

Viewers can view articles and review decisions but cannot modify them.

This creates a clear separation between users responsible for reviewing articles and users who only need visibility into project progress.

---

## Permission Model

ResearchHub uses project-level authorization.

### Organization Owner

Can:

- Create projects
- Manage project members
- Assign reviewer/viewer roles
- Access all projects they own

### Reviewer

Can:

- Access assigned projects
- Review articles
- Change status
- Change priority
- Add reviewer notes
- Add decision reasons

Cannot:

- Add project members
- Manage project settings

### Viewer

Can:

- Access assigned projects
- View articles
- View review progress

Cannot:

- Modify article review data
- Add project members
- Change project settings

Authorization is enforced on the server side through dedicated access verification helpers.

Direct URL access to unauthorized projects is blocked even if a user manually enters the project URL.

---

## Application Walkthrough

### Landing Page

The landing page introduces the platform and its workflow.

It highlights:

- Project-based article review
- Team collaboration
- Import workflow
- Access control model
- Research productivity features

Authentication is handled using GitHub OAuth through NextAuth.

Users can sign in with a single click.

---

### Dashboard

The dashboard displays organizations that:

- Are owned by the current user
- Or contain projects where the user has been assigned as a reviewer or viewer

Users can:

- Create organizations with desciption
- Search organizations
- Star organizations
- Sort organizations by:
  - Starred first
  - Recently created
  - Oldest first

Dashboard widgets include:

- Projects requiring attention
- Recently opened project
- Team statistics
- Review progress summaries

Each organization displays:

- Projects
- Team member count
- Review statistics
- Progress indicators

---

### Project Workspace

Each project contains four sections.

#### Overview

Provides project-level insights:

- Total Articles
- Included Articles
- Excluded Articles
- Pending Articles
- Review Progress Percentage

Visualizations include charts:

- Review Status Distribution bar chart
- Priority Distribution pie chart
- Publication Year Distribution area chart

#### Articles

Displays imported articles in a searchable table.

Supported actions:

- Change review status
- Change priority
- Open article review drawer

The review drawer displays article metadata and allows reviewers to add:

- Reviewer Notes
- Decision Reasons

Filtering includes:

- Status
- Priority
- Publication Year

- Clear filters

Search is available across article data.

Bulk Review Actions:
- Multi-select articles
- Bulk update status
- Bulk update priority
This reduces repetitive review work when handling large article datasets.

#### Review Queue

Highlights articles that need attention.

Examples include:

- High-priority articles
- Pending articles
- Articles requiring review decisions

The goal is to reduce time spent manually identifying unfinished work.

#### Import

Articles can be imported through Excel upload.

The import flow supports:

- Drag and drop upload
- Import preview
- Validation feedback
- Partial imports

Only valid rows are imported.

Invalid rows remain excluded until corrected.

CSV Export

- Reviewed articles can be exported as CSV.

- Exports respect the currently filtered dataset, allowing users to share or analyze review results outside the platform.

---
### Project Member Management

Project owners can:

- Search users
- Assign reviewer/viewer roles
- View project membership

User search is debounced to reduce unnecessary requests while typing.

## Article Import Validation

The provided dataset follows a PubMed-style export structure.

Validation decisions were chosen based on what would be most useful during a review workflow.

### Required Fields

The following fields are treated as required:

- PMID
- Title
- Authors
- First Author
- Journal/Book
- Publication Year

Articles missing these fields are rejected.

### Duplicate Detection

Duplicate articles are identified using:

- PMID
- DOI

Duplicates already present in the project are skipped.

### Format Validation

Validation includes:

- PMID format checks
- DOI format checks
- Publication year validity

### Row-Level Feedback

The import preview identifies:

- Invalid rows
- Duplicate rows
- Missing values

Each row displays a clear validation state before import.

This allows users to import valid records while reviewing problematic entries separately.

---

## Data Model

Core entities:

- User
- Organization
- Project
- ProjectMember
- Article
- ArticleReview

Relationships:

Organization → Projects

Project → Articles

Project → Members

Article → Reviews

The model separates article metadata from review activity and keeps permissions scoped at the project level.

---

## Technical Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- Next.js Server Actions
- Prisma ORM
- PostgreSQL

### Authentication

- NextAuth (Auth.js)
- GitHub OAuth

### Charts & Visualizations

- Recharts

### Notifications

- Sonner

---

## Architecture Notes

A few implementation decisions:

### Server Actions

Server Actions were used for:

- Organization management
- Project management
- Article review updates
- Member assignment
- Import operations

This kept most mutations close to the components that use them.

### Authorization Helpers

Authorization logic is centralized into reusable helpers such as:

- verifyOrganizationOwner
- verifyProjectAccess
- verifyProjectEditAccess

This avoids duplicating permission checks throughout the application.

### Prisma

I had previous experience with MongoDB and Mongoose but not Prisma.

One goal of this project was to learn relational modeling with PostgreSQL while keeping the schema explicit and strongly typed.

---

## Loading, Empty and Error States

The application includes dedicated states for:

- Empty organizations
- Empty projects
- Empty article lists
- Failed imports
- Unauthorized access
- Loading project data
- Loading search results

Toast notifications are used to provide feedback for user actions.

---

## Time Spent

Approximately 8 days.

The first 2–3 days were spent learning:

- Prisma
- PostgreSQL
- Next.js App Router patterns
- NextAuth

My previous experience was primarily with:

- React
- Express
- MongoDB
- Mongoose

The remaining time was spent building the product workflow, authorization model, article import system, and dashboard experience.

---

## AI Usage

AI tools were used during development for:

- Learning unfamiliar parts of the stack
- Exploring Prisma patterns
- Reviewing implementation approaches
- Generating alternative solutions during debugging
- Debugging issues and discussing implementation tradeoffs.
- Generating small, repetitive components and boilerplate structures to speed up development.
- Reviewing code for potential simplifications and TypeScript improvements.

All generated code was manually reviewed and tested before being added to the project.

One example where AI suggestions were not used directly was authorization handling. Initial suggestions returned inconsistent response types, which were later simplified and adjusted to better fit the application's access control model.

---
## Tradeoffs

To stay within the assignment scope, I intentionally prioritized:

- A complete end-to-end review workflow
- Server-side authorization
- Import validation
- Clear project boundaries

Instead of implementing:

- Real-time collaboration
- Email notifications
- Audit logs
- Complex multi-reviewer conflict resolution

These would be the next areas I would explore if the project evolved beyond the assignment scope.

## Future Improvements

If given additional time, I would focus on:

- Real-time collaborations
- Review history timeline
- Activity audit logs
- Email notifications
- End-to-end testing
- AI assisted reviewing, automatic article summaries,s uggested inclusion/exclusion decisions, extraction of key study information, similar article recommendations, AI-generated reviewer notes
- AI Reviewer: can suggest statuses, priorities, and notes for human approval.
- AI Viewer: can analyze project data and generate insights without modifying review decisions.

---

## Local Setup

### Clone Repository

```bash
git clone <repository-url>
cd researchhub

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=

NEXTAUTH_SECRET=

GITHUB_ID=
GITHUB_SECRET=
```

### 4. Configure PostgreSQL

Create a PostgreSQL database and update `DATABASE_URL` accordingly.

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/researchhub"
```

### 5. Run Prisma Migrations

```bash
npx prisma migrate dev
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 7. Configure GitHub Authentication

Authentication is handled through GitHub OAuth using NextAuth.

Create a GitHub OAuth Application and provide the following values in your `.env` file:

```env
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

After configuration, sign in using GitHub from the landing page.

---

## Notes

* Prisma migrations are included in the repository.
* PostgreSQL is required for local development.
