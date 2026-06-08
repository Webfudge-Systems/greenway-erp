# Greenways Suite — Complete User Manual

**Version:** 1.0  
**Last updated:** June 2026  
**Publisher:** Greenway Mobility (WebFudge)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Access URLs](#3-access-urls)
4. [User Types & Roles](#4-user-types--roles)
5. [Getting Started — Sign In](#5-getting-started--sign-in)
6. [Platform Super Admin — Orbit (Organization Manager)](#6-platform-super-admin--orbit-organization-manager)
7. [Organization Admin — Fudge Base (Accounts)](#7-organization-admin--fudge-base-accounts)
8. [Project Management — Fudge ERP (PM)](#8-project-management--fudge-erp-pm)
9. [CRM & Client Management](#9-crm--client-management)
10. [Permissions & Access Control](#10-permissions--access-control)
11. [Security Settings](#11-security-settings)
12. [Billing & Subscriptions](#12-billing--subscriptions)
13. [Complete Sitemap](#13-complete-sitemap)
14. [Feature Status & Roadmap](#14-feature-status--roadmap)
15. [Troubleshooting & FAQ](#15-troubleshooting--faq)
16. [Glossary](#16-glossary)

---

## 1. Introduction

**Greenways Suite** is a multi-tenant business platform built for **Greenway Mobility**. It brings together organization management, user administration, project delivery, and client relationship data in one connected workspace.

This manual covers every application in the suite, who can use them, how to sign in, and how to use each feature day to day.

### Who should read this manual?

| Audience | Primary apps |
|----------|--------------|
| **Platform Super Admin** | Orbit (Organization Manager) |
| **Organization Admin** | Fudge Base (Accounts) |
| **Managers & Team Members** | Fudge ERP (PM) |
| **IT / Operations** | All apps + Strapi Admin |

---

## 2. System Overview

Greenways Suite is made up of **three web applications** and one **shared API backend**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GREENWAYS SUITE                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Orbit          │  Fudge Base     │  Fudge ERP                  │
│  (Org Manager)  │  (Accounts)     │  (PM / ERP)                 │
│  Port 3000      │  Port 3001      │  Port 3002                  │
│  Super Admin    │  Org Admin      │  Projects, Tasks, Clients   │
└────────┬────────┴────────┬────────┴──────────┬──────────────────┘
         │                 │                    │
         └─────────────────┼────────────────────┘
                           ▼
              ┌────────────────────────┐
              │  Strapi 5 API          │
              │  Port 1337             │
              │  Auth, RBAC, Data      │
              └────────────────────────┘
```

### Application names

| Internal name | Product name | Purpose |
|---------------|--------------|---------|
| Organization Manager | **Orbit** | Create and manage tenant organizations |
| Accounts | **Fudge Base** | Users, roles, security, billing, audit |
| PM | **Fudge ERP** | Projects, tasks, inbox, messages, clients |

> **Note:** There is no standalone CRM web app today. CRM data (contacts, deals, invoices, meetings) is managed through the **Clients** section inside Fudge ERP, and CRM permissions are configured in Fudge Base under **Roles & Permissions**.

---

## 3. Access URLs

### Production

| Application | URL |
|-------------|-----|
| **Orbit** (Organization Manager) | https://orbit.greenway.webfudge.in |
| **Fudge Base** (Accounts) | https://base.greenway.webfudge.in |
| **Fudge ERP** (PM) | https://erp.greenway.webfudge.in |
| **API Backend** | https://greenway-backend-production.up.railway.app |
| **Strapi Admin Panel** | API URL + `/admin` |

### Local development

| Application | URL | Start command |
|-------------|-----|---------------|
| Organization Manager | http://localhost:3000 | `npm run dev:org-manager` |
| Accounts | http://localhost:3001 | `npm run dev:accounts` |
| PM | http://localhost:3002 | `npm run dev:pm` |
| API | http://localhost:1337 | `npm run dev:api` |

Run all apps at once: `npm run dev:all`

---

## 4. User Types & Roles

### 4.1 Platform Super Admin

The highest level of access in the system. Super admins can:

- Log in to **Orbit** (Organization Manager) only
- Create, view, and manage all tenant organizations
- Change organization status (trial, active, suspended, cancelled)
- Open any organization's **Accounts** or **PM** workspace directly

Super admin accounts are identified by the `isPlatformAdmin` flag on the user record. They are **seeded automatically** when the API starts.

| Setting | Default value |
|---------|---------------|
| Email | `superadmin@greenways.in` (override with `PLATFORM_ADMIN_EMAIL`) |
| Password | `Greenways@2026!` (override with `PLATFORM_ADMIN_PASSWORD` in production) |
| Display name | Platform Admin |

> **Security:** Change the default password immediately in production by setting the `PLATFORM_ADMIN_PASSWORD` environment variable on the API server.

### 4.2 Organization-level roles

Every user belongs to one or more **organizations** through an **organization membership**. Each membership has a **role** that controls what they can do.

#### System roles (built-in templates)

| Role | Code | Summary |
|------|------|---------|
| **Admin** | `admin` | Full access to all CRM and PM modules |
| **Manager** | `manager` | Full CRM/PM access except settings (read-only on settings) |
| **Member** | `member` | Limited write access; no invoices, proposals, or settings |

#### Custom roles

Organization admins can create custom roles in **Fudge Base → Roles & Permissions**, assigning any combination of CRM and PM module permissions.

### 4.3 PM-specific row-level rules

Beyond the permission matrix, Fudge ERP applies additional rules based on org role:

| Org role | Create projects | Edit projects | Create tasks |
|----------|----------------|---------------|--------------|
| **Admin** | Yes | All projects | All projects |
| **Manager** | Yes | Only projects they manage | All projects |
| **Member** | No | No | Only on projects they are assigned to |

### 4.4 Permission levels

Each module can be set to one of four access levels:

| Level | What it means |
|-------|---------------|
| **None** | No access to the module |
| **Read** | View only |
| **Write** | Create and edit records |
| **Manage** | Full control including configuration |

---

## 5. Getting Started — Sign In

### 5.1 Standard user login (Fudge Base & Fudge ERP)

1. Open **Fudge Base** (`base.greenway.webfudge.in`) or **Fudge ERP** (`erp.greenway.webfudge.in`).
2. You are redirected to `/login` if not signed in.
3. Enter your **email** and **password**.
4. Click **Sign in**.
5. On success, your session is stored for **7 days**.
6. If you belong to multiple organizations, the first organization is selected automatically. Your active organization is remembered in the browser.

**Public self-registration is disabled.** Users must be invited by an organization admin or created when a new organization is provisioned.

### 5.2 Platform super admin login (Orbit only)

1. Open **Orbit** (`orbit.greenway.webfudge.in`).
2. Go to `/login`.
3. Enter the platform super admin email and password.
4. On success, you are taken to `/organizations`.
5. Non–super-admin users who attempt to log in here are redirected to `/unauthorized`.

### 5.3 Session behavior

- Sessions last **7 days** before the JWT expires.
- Signing out clears your token, organization context, and department selection.
- If your session expires, you are redirected to the login page.

### 5.4 Multi-organization context

When you work in Fudge Base or Fudge ERP:

1. Your **active organization** is stored as `current-org-id` in the browser.
2. All API requests include your organization ID automatically.
3. In Fudge ERP, you can also select a **department** to scope project and task data.

Platform super admins who open a tenant from Orbit have the organization ID set automatically before Accounts or PM opens in a new tab.

### 5.5 Switching between apps

There is no in-app switcher between the three frontends. Navigate directly:

| From | To | How |
|------|----|-----|
| Orbit org detail | Fudge Base | Click **Open Accounts** |
| Orbit org detail | Fudge ERP | Click **Open PM** |
| Any app | Another app | Open the URL in your browser |

Both **Open Accounts** and **Open PM** set the correct organization context and open the target app in a new browser tab.

---

## 6. Platform Super Admin — Orbit (Organization Manager)

**Product name:** Orbit  
**Who can access:** Platform super admins only  
**URL:** https://orbit.greenway.webfudge.in

### 6.1 Sidebar navigation

| Menu item | Route | Description |
|-----------|-------|-------------|
| Organizations | `/organizations` | List all tenant organizations |
| Create organization | `/organizations/new` | Provision a new tenant |

### 6.2 Organizations list (`/organizations`)

The main dashboard for platform administration.

**Features:**
- **KPI cards** — Total, Active, Trial, and Suspended organization counts
- **Status tabs** — Filter by All, Active, Trial, or Suspended
- **Search** — Find organizations by name or slug
- **Organization table** — Name, status, owner, created date, member count

**Actions:**
- Click an organization row to open its detail page
- Use **Create organization** in the sidebar to provision a new tenant

### 6.3 Create organization (`/organizations/new`)

Provision a new tenant workspace and its primary admin user.

**Required fields:**
| Field | Description |
|-------|-------------|
| Organization name | Display name for the tenant workspace |
| Owner email | Email for the primary admin user |

**Optional fields:**
| Field | Description |
|-------|-------------|
| Owner password | If left blank, a password is generated |
| Owner first name | Admin user's first name |
| Owner last name | Admin user's last name |

**What happens on create:**
1. A unique workspace **slug** is generated from the organization name
2. The owner user account is created (or linked if the email already exists)
3. The owner is assigned the **Admin** role in the new organization
4. A trial/active subscription may be created for Fudge Base
5. You are redirected to the new organization's detail page

### 6.4 Organization detail (`/organizations/[id]`)

View and manage a single tenant organization.

**Tabs:**

#### Overview
- Organization profile (name, slug, owner, primary email, trial end date, created date)
- Status badge (Trial, Active, Suspended, Cancelled)
- **Status control** — Change organization status and save
- **Quick launch buttons:**
  - **Open Accounts** — Opens Fudge Base for this organization
  - **Open PM** — Opens Fudge ERP for this organization

#### Members
- Table of all organization members
- Shows name, email, role, join date, and active status

#### Activities
- Timeline of platform-level activity for this organization
- Creation events, status changes, member additions, etc.

### 6.5 Organization statuses

| Status | Meaning |
|--------|---------|
| **Trial** | Organization is in trial period |
| **Active** | Fully active, all features available |
| **Suspended** | Access restricted; organization is paused |
| **Cancelled** | Organization is deactivated |

### 6.6 Super admin workflow — step by step

**Provisioning a new customer:**

1. Sign in to Orbit with super admin credentials
2. Go to **Create organization**
3. Enter the company name and owner email
4. Optionally set a password and owner name
5. Submit the form
6. On the detail page, verify the profile and set status to **Active** or **Trial**
7. Click **Open Accounts** to configure users and roles
8. Click **Open PM** to verify project workspace access

**Managing an existing customer:**

1. Sign in to Orbit
2. Find the organization via search or status tabs
3. Open the detail page
4. Review members and activity
5. Change status if needed (e.g., suspend for non-payment)
6. Launch into Accounts or PM as needed

### 6.7 Strapi Admin Panel (separate from Orbit)

The Strapi Admin Panel is a **developer/content administrator** interface, not an end-user tool.

- **URL:** API base URL + `/admin` (e.g., `http://localhost:1337/admin`)
- **Purpose:** Manage database content types, media, and raw records
- **Access:** Separate Strapi admin credentials (not the platform super admin login)

Use Orbit for tenant management. Use Strapi Admin only for technical administration.

---

## 7. Organization Admin — Fudge Base (Accounts)

**Product name:** Fudge Base  
**Who can access:** Organization members with appropriate permissions; full admin features require the **Admin** role  
**URL:** https://base.greenway.webfudge.in

### 7.1 Sidebar navigation

| Menu item | Route | Admin only? | Status |
|-----------|-------|-------------|--------|
| Dashboard | `/` | No | Live |
| Users | `/users` | No | Live |
| Roles & Permissions | `/roles` | No | Live |
| Departments | `/departments` | No | Live |
| Teams | `/coming-soon?feature=teams` | No | Coming soon |
| Security | `/security` | **Yes** | Live |
| Audit Logs | `/audit-logs` | No | Live |
| Organization | `/settings` | No | Live |
| App Access | `/app-access` | No | Live |

> **Billing** (`/billing`) is reachable from the Dashboard quick actions but is not listed in the sidebar.

### 7.2 Dashboard (`/`)

Your organization administration home page.

**KPI cards:**
- Total users
- Active roles
- Departments
- Teams count

**Widgets:**
- **Security health** — MFA status, session timeout, password rules summary
- **Subscriptions** — Active app subscriptions
- **Quick actions** — Shortcuts to Users, Roles, Security, Billing, Audit Logs
- **Recent activity** — Latest audit log entries

### 7.3 Users (`/users`)

Manage who has access to your organization.

**Features:**
- **Filter tabs** — All, Active, Invited, Suspended
- **Search** — Find users by name or email
- **User table** — Name, email, role, departments, status, last active

**Actions:**
| Action | Description |
|--------|-------------|
| **Invite user** | Send an invitation with email, role, and department assignment |
| **Edit user** | Change role, departments, or profile details |
| **Suspend user** | Block the user from signing in |

**User statuses:**

| Status | Meaning |
|--------|---------|
| Active | Confirmed and can sign in |
| Invited | Invitation sent; not yet confirmed |
| Suspended | Account blocked |

### 7.4 Roles & Permissions (`/roles`)

Configure what each role can do across CRM and PM modules.

**Features:**
- View all roles (system templates + custom roles)
- **Create custom role** — Define a new role with a name and permission matrix
- **Edit role** — Adjust CRM and PM module access levels
- **Delete custom role** — Remove non-system roles
- **Permission presets** — Quick-apply Admin, Manager, or Member-like templates

**Permission matrix columns:**

*CRM modules:*
Dashboard, Leads, Lead companies, Contacts, Deals & pipeline, Client accounts, Client projects, Invoices, Proposals, Meetings, Calendar, Analytics, Settings

*PM modules:*
Dashboard, Projects, Tasks, My tasks, Inbox & messages, Calendar, Analytics, Settings

Each cell is set to: **None**, **Read**, **Write**, or **Manage**.

### 7.5 Departments (`/departments`)

Organize your team into departments.

**Features:**
- Create, edit, and deactivate departments
- Assign a **department lead**
- View member counts per department
- Departments are used in Fudge ERP for scoping projects and tasks

### 7.6 Teams (`/teams`)

> **Status: Coming soon** — The page exists but the sidebar links to a coming-soon placeholder.

When live, teams will allow grouping users under a team leader within a department.

### 7.7 Security (`/security`) — Admin only

Configure organization security policies. Only users with the **Admin** role (or platform super admins) can access this page.

**Settings:**

| Setting | Options / Range | Description |
|---------|-----------------|-------------|
| Require MFA | On / Off | Require multi-factor authentication |
| Session timeout | 1h, 4h, 8h, 24h, 7 days | Auto-logout after inactivity |
| Minimum password length | 6–128 characters | Enforced on password changes |
| Allow password login | On / Off | Disable email/password login if needed |
| Allowed email domains | Comma-separated list | Restrict sign-in to specific domains (e.g., `@company.com`) |

Click **Save changes** to apply. Unsaved changes are highlighted.

### 7.8 Audit Logs (`/audit-logs`)

Review activity across your organization.

**Features:**
- **Timeline view** and **Table view**
- Filter by module (Accounts, CRM, PM)
- Filter by severity
- Shows who did what, when, and on which record

Use audit logs for compliance, troubleshooting, and security reviews.

### 7.9 Organization settings (`/settings`)

Update your organization's profile.

**Fields:**
- Organization name
- Industry
- Company size
- Contact email
- Phone number
- Address / location details

### 7.10 App Access (`/app-access`)

See which applications are enabled for your organization and how roles map to app access.

**Features:**
- CRM and PM enablement status
- Per-role access summary (highest access level per app)
- Module counts for CRM and PM
- Link to **Roles & Permissions** for detailed editing

### 7.11 Billing (`/billing`)

Manage subscriptions and seat utilization. Access via Dashboard quick actions or direct URL.

**Features:**
- Organization billing status
- **Seat utilization** — Used vs. available seats
- **Subscription table** — Per-app status, billing cycle, seats, price (INR), next billing date
- Refresh button to reload data

---

## 8. Project Management — Fudge ERP (PM)

**Product name:** Fudge ERP  
**Who can access:** Organization members with PM module permissions  
**URL:** https://erp.greenway.webfudge.in

### 8.1 Sidebar navigation

The sidebar is organized into three sections: **Navigate**, **Projects**, and **Tools**.

#### Navigate section

| Item | Route | Permission module | Status |
|------|-------|-------------------|--------|
| Dashboard | `/` | `dashboard` | Live |
| My Tasks | `/my-tasks` | `my_tasks` | Live |
| Inbox | `/inbox` | `inbox` | Live |
| Message | `/message` | `inbox` | Live |
| Clients | `/clients/accounts` | `client_accounts` | Live |
| Reports | `/coming-soon?feature=reports` | `analytics` | Coming soon |

#### Projects section (sidebar panel)

- Quick-access list of your recent projects (up to 4, expandable to 6)
- Project health indicator (on track, in progress, needs attention)
- **New project** button (Admin and Manager only)
- **All projects** link to `/projects`

#### Tools section

| Item | Route | Status |
|------|-------|--------|
| Documents | `/coming-soon?feature=documents` | Coming soon |
| Calendar | `/calendar` | Live |

#### Department switcher

At the top of the sidebar, use the **Department Switcher** to filter data by department. This scopes projects, tasks, and related records to the selected department.

### 8.2 Dashboard (`/`)

Your project management home page.

**Widgets:**
- Personalized greeting
- **KPI cards** — To do, In progress, Done, Overdue task counts
- **My Tasks** — Quick view of your assigned tasks
- **Upcoming Deadlines** — Tasks and milestones due soon
- **Task Overview** — Chart of task distribution by status
- **Team Workload** — Who is working on what
- **Projects Overview** — Summary of active projects

### 8.3 My Tasks (`/my-tasks`)

View and manage tasks assigned to you.

**View modes:**

| View | Description |
|------|-------------|
| **List** | Table of tasks with sortable columns |
| **Kanban** | Drag-and-drop board by status |
| **Timeline** | Chronological task timeline |
| **Gantt** | Gantt chart for scheduling |

**Features:**
- Filter by status, priority, project
- Create new tasks (`/my-tasks/add`)
- Subtasks — Expand tasks to see and manage subtasks
- Comments — Add and view task comments
- Assignees — View and change who is assigned
- Status and priority badges
- Overdue highlighting

**Task statuses:** To Do, In Progress, In Review, Done, Cancelled  
**Priority levels:** Low, Medium, High, Urgent

### 8.4 Task detail (`/tasks/[id]`)

Full detail view for a single task.

**Includes:**
- Title, description, status, priority, due date
- Assignees and project link
- Subtasks list
- Comments thread
- Activity history
- Edit and delete actions (based on permissions)

### 8.5 Projects (`/projects`)

Manage all projects in your organization.

**View modes:**
- **List view** — Table with sortable columns
- **Kanban view** — Board organized by project status

**Actions:**
- **Create project** (`/projects/add`) — Admin and Manager only
- Click a project to open its detail page

**Project statuses:** Planning, Active, On Hold, Completed, Cancelled

### 8.6 Project detail (`/projects/[slug]`)

Deep dive into a single project.

**Tabs:**

| Tab | Contents |
|-----|----------|
| **Overview** | Project info, manager, team, dates, progress, description |
| **Tasks** | All tasks in this project |
| **Activity** | Timeline of project events |
| **Files** | Project file attachments |

**Actions:**
- Edit project (`/projects/[slug]/edit`)
- Create tasks within the project
- View progress percentage and task completion stats

### 8.7 Create / Edit project

**Create** (`/projects/add`):
- Project name, description, status
- Project manager assignment
- Team members
- Start and end dates
- Department association

**Edit** (`/projects/[slug]/edit`):
- Same fields as create
- Only Admins can edit any project; Managers can edit projects they manage

### 8.8 Inbox (`/inbox`)

Central notification and activity hub.

**Tabs:**
- **Notifications** — System notifications (read, unread, archived)
- **Activity** — Feed of PM activity across the organization
- **Threads** — Notification threads grouped by topic

Unread notification count appears as a badge on the Inbox sidebar icon.

### 8.9 Messages (`/message`)

Direct messaging between organization members.

**Features:**
- Conversation list with unread counts
- Send and receive direct messages
- @mentions of team members
- Unread message count badge on the Message sidebar icon

### 8.10 Calendar (`/calendar`)

Unified workspace calendar.

**Shows:**
- Meetings
- Task due dates
- Project milestones and deadlines

Filter and navigate by month/week/day views.

### 8.11 Quick Actions FAB

A floating action button (bottom-right) provides shortcuts to:
- Create a new task
- Create a new project (if permitted)

### 8.12 PWA (Progressive Web App)

Fudge ERP supports installation as a PWA:
- **Install prompt** may appear on supported browsers
- **Offline page** at `/~offline` when connectivity is lost

---

## 9. CRM & Client Management

CRM functionality is embedded in Fudge ERP under **Clients**. CRM permissions are configured in Fudge Base.

### 9.1 Clients list (`/clients/accounts`)

View and manage all client accounts.

**Features:**
- Search and filter client accounts
- Table with company name, industry, status, contacts count
- **Create client** (`/clients/accounts/new`)

### 9.2 Create client (`/clients/accounts/new`)

**Fields include:**
- Company name
- Industry
- Company type
- Website, email, phone
- Address / location
- Description and notes

### 9.3 Client detail (`/clients/accounts/[id]`)

Comprehensive view of a client account.

**Sections / tabs:**

| Section | Contents |
|---------|----------|
| **Profile** | Company info, industry, contact details, address |
| **Contacts** | People associated with this client; add, edit, view |
| **Deals** | Sales pipeline deals linked to this client |
| **Invoices** | Billing records and invoice status |
| **Projects** | PM projects linked to this client |
| **Meetings** | Scheduled meetings with this client |
| **Activity** | Timeline of all CRM activity |
| **Comments** | Internal discussion thread |

**Actions:**
- Edit client (`/clients/accounts/[id]/edit`)
- Add contact, deal, invoice, or meeting
- Link existing PM projects
- View and add comments

### 9.4 CRM modules (permission-controlled)

These CRM areas are governed by role permissions even though some do not have dedicated top-level pages yet:

| Module | Where to access today |
|--------|----------------------|
| Leads | Via API / future CRM UI |
| Lead companies | Via API / future CRM UI |
| Contacts | Client detail → Contacts tab |
| Deals & pipeline | Client detail → Deals tab |
| Client accounts | `/clients/accounts` |
| Client projects | Client detail → Projects tab |
| Invoices | Client detail → Invoices tab |
| Proposals | Permission-controlled; limited UI |
| Meetings | Client detail → Meetings tab |
| Calendar | `/calendar` |
| Analytics | Coming soon (Reports) |

---

## 10. Permissions & Access Control

### 10.1 How permissions work

1. Each user has an **organization membership** with a **role**
2. The role defines a **permission matrix** for CRM and PM modules
3. Individual users can have **custom permission overrides** on top of their role
4. The API enforces permissions on every request
5. Frontends hide navigation items and actions the user cannot access

### 10.2 Default role permissions

#### Admin
- **CRM:** Manage on all modules
- **PM:** Manage on all modules

#### Manager
- **CRM:** Manage on all modules except Settings (read-only)
- **PM:** Manage on all modules except Settings (read-only)

#### Member
- **CRM:** Write on leads, companies, contacts, meetings, calendar; Read on deals, client accounts, client projects, dashboard, analytics; None on invoices, proposals, settings
- **PM:** Write on projects, tasks, my tasks, calendar; Read on dashboard, inbox, analytics; None on settings

### 10.3 Checking your access

- In **Fudge Base → App Access**, see a summary of what each role can access
- In **Fudge ERP**, sidebar items you cannot access are hidden automatically
- If you try to access a restricted page, you are redirected to `/unauthorized`

### 10.4 Platform admin impersonation

When a platform super admin opens an organization's Accounts or PM workspace:
- The org ID is set in the browser
- The admin receives **full Admin-level permissions** for that organization
- This allows troubleshooting and setup without a separate user account

---

## 11. Security Settings

Organization security is managed in **Fudge Base → Security** (Admin only).

### Recommended baseline

| Setting | Recommended value |
|---------|-------------------|
| Require MFA | On (when MFA is fully enforced) |
| Session timeout | 8 hours |
| Minimum password length | 12 characters |
| Allow password login | On |
| Allowed email domains | Your company domain(s) |

### Password requirements

- Minimum length is enforced per organization settings (default: 8 characters)
- Users cannot self-register; admins control who gets access

### Session management

- JWT tokens expire after 7 days
- Session timeout setting controls inactivity logout (when enforced by the frontend)
- Signing out clears all session data from the browser

---

## 12. Billing & Subscriptions

Access billing in **Fudge Base → Billing** (via Dashboard quick actions or `/billing`).

### Subscription model

- Each organization can have subscriptions per app (CRM, PM, Accounts)
- Pricing is calculated based on selected modules and seat count
- Currency: **INR** (Indian Rupees)

### Billing overview shows

| Section | Details |
|---------|---------|
| Organization status | Trial, Active, Suspended, Cancelled |
| Seat utilization | Seats used vs. seats purchased |
| Per-app subscriptions | App name, status, billing cycle, seats, monthly price, next billing date |

### Organization statuses and billing

| Status | Billing impact |
|--------|----------------|
| Trial | Limited trial period; may have trial end date |
| Active | Full billing applies |
| Suspended | Access may be restricted |
| Cancelled | Subscription ended |

Platform super admins manage organization status in Orbit. Organization admins view billing details in Fudge Base.

---

## 13. Complete Sitemap

### Orbit — Organization Manager

```
/                          → Redirect to /login
/login                     → Super admin sign in
/signup                    → Redirect to /login (disabled)
/contact                   → Redirect to /login
/unauthorized              → Access denied page

/organizations             → Organization list (KPIs, search, filters)
/organizations/new         → Create organization form
/organizations/[id]        → Organization detail
  ├── Overview tab         → Profile, status control, launch buttons
  ├── Members tab          → Member list
  └── Activities tab       → Activity timeline
```

### Fudge Base — Accounts

```
/                          → Dashboard
/login                     → Standard sign in
/unauthorized              → Access denied page
/coming-soon               → Placeholder for unreleased features

/users                     → User management (invite, edit, suspend)
/roles                     → Roles & permissions matrix
/departments               → Department management
/teams                     → Teams (page exists; nav → coming soon)
/security                  → Security settings (Admin only)
/audit-logs                → Audit log viewer
/settings                  → Organization profile
/app-access                → App enablement & role access summary
/billing                   → Billing & subscriptions
```

### Fudge ERP — PM

```
/                          → Dashboard
/login                     → Standard sign in
/unauthorized              → Access denied page
/coming-soon               → Placeholder (reports, documents)
/~offline                  → PWA offline page

/my-tasks                  → My tasks (list/kanban/timeline/gantt)
/my-tasks/add              → Create task
/tasks/[id]                → Task detail

/projects                  → Projects list (list/kanban)
/projects/add              → Create project
/projects/[slug]            → Project detail (overview/tasks/activity/files)
/projects/[slug]/edit       → Edit project

/inbox                     → Notifications & activity feed
/message                   → Direct messages

/clients                   → Redirect to /clients/accounts
/clients/accounts          → Client accounts list
/clients/accounts/new      → Create client
/clients/accounts/[id]     → Client detail
/clients/accounts/[id]/edit → Edit client

/calendar                  → Unified calendar
/analytics                 → Redirect to coming-soon reports
```

### API — Key endpoints (reference)

```
POST   /api/auth/login              → Standard login
POST   /api/auth/platform-login     → Super admin login
GET    /api/auth/me                 → Current user + memberships
POST   /api/auth/signup             → Disabled

GET    /api/platform/organizations  → List organizations (super admin)
POST   /api/platform/organizations  → Create organization
PATCH  /api/platform/organizations/:id → Update organization
GET    /api/platform/stats          → Platform KPIs

GET    /api/billing/overview        → Billing overview
POST   /api/organizations/:id/invite-users → Invite users
```

---

## 14. Feature Status & Roadmap

| Feature | Status | Notes |
|---------|--------|-------|
| Organization provisioning | ✅ Live | Orbit |
| User management | ✅ Live | Fudge Base |
| Roles & permissions (RBAC) | ✅ Live | CRM + PM matrix |
| Departments | ✅ Live | Fudge Base + PM scoping |
| Security settings | ✅ Live | Admin only |
| Audit logs | ✅ Live | Timeline + table views |
| Billing overview | ✅ Live | INR pricing |
| App access management | ✅ Live | CRM/PM enablement |
| PM dashboard | ✅ Live | KPIs + widgets |
| Projects & tasks | ✅ Live | List, kanban, detail |
| My Tasks views | ✅ Live | List, kanban, timeline, gantt |
| Inbox & notifications | ✅ Live | With unread badges |
| Direct messages | ✅ Live | With @mentions |
| Client accounts (CRM) | ✅ Live | In PM under Clients |
| Calendar | ✅ Live | Unified workspace calendar |
| PWA support | ✅ Live | Install + offline page |
| Teams management | ⚠️ Partial | Page built; nav shows coming soon |
| Global search (Accounts) | ⚠️ Placeholder | UI exists; not functional |
| Reports / Analytics (PM) | ❌ Coming soon | Redirects to placeholder |
| Documents (PM) | ❌ Coming soon | Redirects to placeholder |
| Standalone CRM app | ❌ Not available | CRM via PM Clients + API |
| Public signup | ❌ Disabled | Admin invite only |
| MFA enforcement | ⚠️ Setting exists | Toggle available; full enforcement pending |

---

## 15. Troubleshooting & FAQ

### I cannot log in

1. Verify you are on the correct app URL (Orbit for super admin; Base or ERP for org users)
2. Check your email and password
3. Ensure your account is not suspended
4. For org users, confirm you have an active organization membership
5. Contact your organization admin if you were never invited

### I see "Unauthorized" after logging in

- **On Orbit:** Your account is not a platform super admin. Use Fudge Base or Fudge ERP instead.
- **On Fudge Base Security page:** You need the Admin role.
- **On any page:** Your role may not have permission for that module. Check with your admin.

### I cannot see a sidebar item in Fudge ERP

Sidebar items are hidden based on your role permissions. Ask your organization admin to check **Roles & Permissions** in Fudge Base.

### I cannot create a project

Only **Admin** and **Manager** roles can create projects. **Members** can work on tasks within projects they are assigned to but cannot create new projects.

### How do I switch organizations?

If you belong to multiple organizations, your active organization is stored in the browser. Platform super admins switch organizations via Orbit (Open Accounts / Open PM). Standard users typically work within one organization; contact your admin if you need access to another.

### The app shows a network error on login

The API backend may be down or misconfigured. Verify:
1. The API is running (local: `http://localhost:1337`)
2. `NEXT_PUBLIC_API_URL` points to the correct backend
3. CORS is configured for your frontend URL

### How do I reset my password?

Password reset API methods exist in the system. Contact your organization admin if you need a password reset, as self-service reset may depend on deployment configuration.

### Where is the CRM app?

There is no separate CRM application. Use **Clients** in Fudge ERP for client accounts, contacts, deals, invoices, and meetings. Configure CRM permissions in Fudge Base → Roles & Permissions.

### How do I add a new user to my organization?

1. Sign in to Fudge Base
2. Go to **Users**
3. Click **Invite user**
4. Enter email, select role and departments
5. The user receives an invitation and can sign in once confirmed

### How do I provision a new customer organization?

1. Sign in to Orbit as platform super admin
2. Go to **Create organization**
3. Fill in organization name and owner email
4. Set status on the detail page
5. Use **Open Accounts** to configure the tenant

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Orbit** | Product name for the Organization Manager app |
| **Fudge Base** | Product name for the Accounts app |
| **Fudge ERP** | Product name for the PM (project management) app |
| **Platform Super Admin** | Highest-level user; manages all tenants via Orbit |
| **Organization (Tenant)** | A customer workspace with its own users, data, and settings |
| **Organization Membership** | Link between a user and an organization, with a role |
| **RBAC** | Role-Based Access Control — permissions defined per role per module |
| **Module** | A functional area (e.g., Projects, Client accounts) with its own permission level |
| **Department** | Organizational unit used to scope PM data |
| **Client Account** | A CRM record representing a customer company |
| **Slug** | URL-friendly unique identifier for an organization or project |
| **JWT** | JSON Web Token used for session authentication (7-day expiry) |
| **Strapi** | The headless CMS / API framework powering the backend |
| **PWA** | Progressive Web App — installable web application |

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 2026 | Initial complete user manual |

---

*For technical deployment and developer setup, see [DEPLOY-RAILWAY-VERCEL.md](./DEPLOY-RAILWAY-VERCEL.md) and the root [README.md](../README.md).*
