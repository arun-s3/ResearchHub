# ResearchHub

A project-based article review workspace inspired by systematic research & review workflows.

ResearchHub is a collaborative research article review platform inspired by systematic literature review workflows. It enables teams to organize articles into projects, assign role-based reviewers, import and validate large datasets, track review decisions, visualize project progress through interactive dashboards, and collaborate within a secure project-level authorization model. The application emphasizes clean workflows, robust access control, scalable architecture, and an intuitive user experience for managing research reviews.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Live Application](#live-application)
* [Video Walkthrough](#video-walkthrough)
* [Application Walkthrough With Images](#application-walkthrough-with-images)
* [Review Workflow](#review-workflow)
* [Permission Model](#permission-model)
* [Article Import Validation](#article-import-validation)
* [Data Model](#data-model)
* [Live Deployment](#live-deployment)
* [Technical Stack](#technical-stack)
* [Architecture](#architecture)
* [Loading, Empty and Error States](#loading-empty-and-error-states)
* [Time Spent](#time-spent)
* [AI Usage](#ai-usage)
* [Tradeoffs](#tradeoffs)
* [Future Improvements](#future-improvements)
* [Local Setup](#local-setup)
* [Notes](#notes)
* [Feedback](#feedback)

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

## Live Application

- **Primary (HTTPS):** https://researchhub.home.kg
- **Alternate (IP):** http://13.207.212.92

## Video Walkthrough

https://youtu.be/04QArVmcOWw

---

## Application Walkthrough With Images

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

![Landing Page](./screenshots/landing-page1.png)
![Landing Page](./screenshots/landing-page2.png)
![Landing Page](./screenshots/auth.png)

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

![Dashboard](./screenshots/dashboard1.png)
![Dashboard](./screenshots/dashboard2.png)
![Dashboard](./screenshots/dashboard3.png)
![Dashboard](./screenshots/create-project.png)

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

![Project workspace overview](./screenshots/project-workspace1.png)
![Project workspace overview](./screenshots/project-workspace2.png)

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

![Project workspace articles](./screenshots/articles1.png)
![Project workspace articles](./screenshots/articles2.png)
![Project workspace articles](./screenshots/articles3.png)
![Project workspace articles](./screenshots/articles4.png)

#### Review Queue

Highlights articles that need attention.

Examples include:

- High-priority articles
- Pending articles
- Articles requiring review decisions

The goal is to reduce time spent manually identifying unfinished work.

![Project workspace review queue](./screenshots/review-queue.png)

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

![Project workspace import](./screenshots/import.png)
![Project workspace import preview](./screenshots/import-preview.png)

---

### Project Member Management

Project owners can:

- Search users
- Assign reviewer/viewer roles
- View project membership

User search is debounced to reduce unnecessary requests while typing.

![Project workspace member management](./screenshots/members1.png)
![Project workspace member management](./screenshots/members2.png)

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

## Live Deployment

The application is deployed on AWS using the following setup:

- EC2 instance (Ubuntu)
- Nginx reverse proxy (port 80 → 3000)
- PM2 process manager for Next.js
- Amazon RDS (PostgreSQL)
- GitHub OAuth (NextAuth)

### Production URL

http://13.207.212.92

### Deployment Notes

- The application (Next.js frontend + API routes) is deployed and running directly on the EC2 instance
- Environment variables are managed on the EC2 instance
- The application runs using PM2 in production mode
- Nginx is used as a reverse proxy to expose the application on port 80
- PostgreSQL database is hosted on AWS RDS
- Environment variables are managed directly on the EC2 instance
- GitHub OAuth callback is configured for production domain

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

## Architecture

### High-Level Request Flow

```text
Client Components
        │
        ▼
App Router (Pages & Layouts)
        │
        ├───────────────┐
        ▼               ▼
 Server Actions     Route Handlers
 (Business Logic)   (API Endpoints)
        │
        ▼
 Authorization Layer
        │
        ▼
     Prisma ORM
        │
        ▼
    PostgreSQL
```

The application follows a feature-oriented architecture where UI, business logic, authorization, and data access are separated to keep the codebase modular, maintainable, and scalable.

### Authentication Flow

```text
GitHub OAuth
      │
      ▼
NextAuth
      │
      ▼
Session
      │
      ▼
Protected Routes
      │
      ▼
Server Actions / Route Handlers
```

Authentication is handled using GitHub OAuth through NextAuth, with protected routes and server-side authorization ensuring only authenticated users can access secured resources.

### Authorization Flow

```text
Client Request
      │
      ▼
Server Action
      │
      ▼
Authorization Layer
      │
      ▼
verifyOrganizationOwner()
verifyProjectAccess()
verifyProjectEditAccess()
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Authorization is centralized through reusable helper functions to enforce ownership and role-based access control before any database operation is performed.

### Folder Organization

| Folder           | Responsibility                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`         | App Router pages, layouts, protected routes, and dynamic route segments that define the application's navigation structure.                                                  |
| `app/actions/` | Server Actions containing business logic for CRUD operations, authorization checks, cache revalidation, and server-side workflows.                                           |
| `app/api/`     | Route Handlers for endpoints such as GitHub OAuth callbacks and Excel export functionality.                                                                                  |
| `app/lib/`     | Shared server-side utilities including authentication configuration, authorization helpers, and the Prisma client.                                                           |
| `components/`  | Feature-based reusable UI components organized into `auth`, `dashboard`, `home`, `project`, `layout`, `shared` & `ui`, with nested folders such as `modals`. |
| `services/`    | Shared service layer for data transformation and aggregation logic (`dashboard.service.ts`, `project.service.ts`).                                                       |
| `types/`       | Shared TypeScript declarations and custom type definitions.                                                                                                                  |
| `prisma/`      | Prisma schema and database migrations.                                                                                                                                       |
| `public/`      | Static assets served by the application (images, icons, etc.).                                                                                                               |
| `screenshots/` | Screenshots used for documentation within the README.                                                                                                                        |

### Core Design Principles

* Feature-oriented folder organization.
* Business logic handled through Server Actions.
* Centralized role-based authorization.
* Type-safe database access using Prisma ORM.
* Clear separation between UI, business logic, and persistence.

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
- Saved search filters
- Activity audit logs
- Email notifications
- End-to-end testing
- AI assisted reviewing, automatic article summaries,suggested inclusion/exclusion decisions, extraction of key study information, similar article recommendations, AI-generated reviewer notes
- Reviewer workload balancing
- AI Reviewer: can suggest statuses, priorities, and notes for human approval.
- AI Viewer: can analyze project data and generate insights without modifying review decisions.

---

## Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd researchhub

### 2. Install Dependencies

```bash
npm install
```

### 2. Create Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=

NEXTAUTH_SECRET=

GITHUB_ID=
GITHUB_SECRET=
```

### 3. Configure PostgreSQL

Create a PostgreSQL database and update `DATABASE_URL` accordingly.

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/researchhub"
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 6. Configure GitHub Authentication

Authentication is handled through GitHub OAuth using NextAuth.

Create a GitHub OAuth Application and provide the following values in your `.env` file:

```env
GITHUB_ID=
GITHUB_SECRET=
```

After configuration, sign in using GitHub from the landing page.

---

## Notes

* Prisma migrations are included in the repository.
* PostgreSQL is required for local development.

---

## Feedback

If you encounter any issues during setup or have questions about the implementation, feel free to reach out.

- Email: arunsudhakaran01@gmail.com
- Phone: 9074688913
- LinkedIn: https://www.linkedin.com/in/arun-s1

I also welcome any feedback or suggestions for improving the project. Your insights are greatly appreciated and will help me continue refining both the application and my engineering practices. Feedback has consistently played an important role in helping me grow as an engineer and build better software, so I truly appreciate every opportunity to learn from it.
