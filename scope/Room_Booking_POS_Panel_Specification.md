# Room Booking POS Panel Specification - Hotel Room Management

## 📋 Overview

The **Room Booking POS Panel** is the core interface for managing hotel room bookings, check-ins, and check-outs.  
It should provide a **fast, visual, single-screen workflow** similar in spirit to the Restaurant POS Panel, but focused on rooms and bookings instead of tables and items.

**Purpose**:  
Front-desk staff can quickly see room status, manage bookings, and process check-ins/check-outs for today and upcoming stays.

---

## 🎯 Key Features

### 1. **Room Grid (Card View)**
- Display all rooms in a responsive card grid.
- Clear color-coded status indicators:
  - `available`, `reserved`, `checked-in / occupied`, `cleaning`, `maintenance`.
- Each card shows key info at a glance (room number, category, floor, guest, check-in/out times).

### 2. **Room Detail / Booking Modal**
- Clicking a room card opens a **modal** with detailed room and booking info.
- Quick actions:
  - Create / edit booking for that room.
  - Check-in / Check-out.
  - View all bookings history for that room (compact).

### 3. **Today Timeline Panel (Right Side)**
- Right-side panel shows **today’s operational list**:
  - Today’s check-outs.
  - Today’s check-ins.
  - Today’s upcoming check-ins/check-outs/bookings (e.g. later today).
- Items are clickable shortcuts to open the same Room Detail / Booking modal.

### 4. **Filters & Summary**
- **Row 1**: Date, Status, Category (Cat), Floor, Search (Room / Guest / #) — all filters in a single row with compact widths.
- **Row 2**: Summary badges — Total, Avail, Occ, Res, Clean, Maint (default Bootstrap badge size).
- Date selector (default: Today). Filters: Status, Category, Floor. Search: Room number, Guest name, Booking number.

### 5. **Single-Screen Management**
- Primary workflow runs on a single page:
  - Left/center: Room grid.
  - Right: Today timeline panel.
  - Modals overlay for detailed room/booking operations.

---

## 🖥️ UI Layout - Split Screen Design (Rooms + Today Timeline)

### Layout Structure (Desktop)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  ROOM BOOKING POS PANEL HEADER (compact)                                    │
│  Row 1: [Date] [Status] [Cat] [Floor] [Search: Room / Guest / #]            │
│  Row 2: [Total 40] [Avail 16] [Occ 8] [Res 6] [Clean 4] [Maint 4]           │
└──────────────────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────┬──────────────────────────────┐
│                                               │                              │
│                 ROOM GRID PANEL               │   TODAY TIMELINE PANEL       │
│                (Left / Center)                │          (Right)            │
│                                               │                              │
│  [Room Cards Grid]                            │  [Today’s Check‑outs]       │
│   ┌─────────────┐  ┌─────────────┐            │   - list of bookings        │
│   │ 101 Deluxe  │  │ 102 Std     │            │     with check‑out = today  │
│   │ [Occupied]  │  │ [Available] │            │                              │
│   │ Floor: 1    │  │ Floor: 1    │            │  [Today’s Check‑ins]        │
│   │ Guest: John │  │             │            │   - list with check‑in=today│
│   │ Out: 11:00  │  │             │            │                              │
│   └─────────────┘  └─────────────┘            │  [Upcoming (today window)]   │
│   ...                                         │   - upcoming check‑ins /    │
│                                               │     check‑outs / bookings   │
│  - Status badge + color                       │     within configured range │
│  - Category, floor, max occupancy             │                              │
│  - Current guest + booking snippet            │  - Each row clickable → open│
│                                               │    Room Detail / Booking     │
│  CLICK: Room Card → opens **Modal**:          │    modal for that booking    │
│   - Room information                          │                              │
│   - Current/next booking                      │  ~30% width                  │
│   - Quick actions (New Booking / Check‑in /   │  Scrollable content          │
│     Check‑out / View history)                 │                              │
│                                               │
│  ~70% width                                   │
└───────────────────────────────────────────────┴──────────────────────────────┘
```

### Responsive Breakpoints

- **Desktop (> 1200px)**: Split layout as above (Room Grid ~70%, Today Timeline ~30%).
- **Tablet (768px - 1200px)**:
  - Panels still side-by-side but may adjust to ~60% / 40%.
  - Larger room cards and list rows for touch.
- **Mobile (< 768px)**:
  - **Stacked layout**:
    - First: Room grid (full width).
    - Second: Today timeline (accordion or tab).
  - Room detail modal becomes full-screen on mobile.

---

## 📦 Component Structure

### 1. **RoomGridPanel (Left / Center)**

**Purpose**: Show all rooms in a card grid with status and key info.

**Layout & Behavior**:
- Responsive grid of `RoomCard` components: 6 columns on xl, 4 on sm, 3 on md, 2 on mobile (xs). Grid gap `g-2`. Scrollable area for many rooms (e.g. 40+).
- Filters live in the main header (not inside this panel). Panel shows "Room Grid (n)" header.

#### `RoomCard` (compact)

**Display:**
- Room number (primary, large & bold).
- Status badge with color:
  - Available (green), Reserved (amber), Checked‑in/Occupied (red), Cleaning (gray), Maintenance (gray/amber).
- Category (e.g., Deluxe, Standard, Suite).
- Floor number.
- Max occupancy (adults/children icons or text).
- If there is an active / upcoming booking:
  - Guest name.
  - Booking type: Walk‑in / Advance / Online.
  - Check‑in and expected check‑out datetime.
  - Small pill: “Due Check‑in”, “Due Check‑out”, “Overstay”, or “Upcoming”.

**Interactions:**
- **Click**: Opens `RoomDetailModal`.
- Hover: slight lift and shadow, border highlight.

---

### 2. **TodayTimelinePanel (Right)**

**Purpose**: Focused view of **today’s operations** (check-ins, check-outs, and near-term bookings).

**Layout:**
- Header: “Today’s Activity”
- Subsections with compact list items.

#### 2.1 Today’s Check-outs
- List of items:
  - Time (e.g., 11:00 AM).
  - Room number + category.
  - Guest name.
  - Nights / booking type.
  - Status badge (e.g., “Due”, “Checked-out”).
- Sorted by expected check-out time.

#### 2.2 Today’s Check-ins
- Similar list:
  - Time, room, guest, booking type (Walk‑in / Advance / Online).
  - Status: “Due”, “Checked-in”.
- Sorted by check-in time.

#### 2.3 Upcoming
- Time, room, guest, action (Check-out / Check-in).

**Interactions:**
- Click any row opens `RoomDetailModal` for that room/booking.

---

### 3. **RoomDetailModal**

**Purpose**: Central place to view/mange one room and its booking(s).

**Trigger**:
- Clicking a `RoomCard` in the grid.
- Clicking an item in TodayTimelinePanel.

**Layout (Desktop):**
- Large modal (`size="xl"`, fullscreen on mobile), similar style to `CustomerLedgerModal` / `BillViewModal`.

**Sections:**

1. **Room Summary (top)**
   - Room number + status badge.
   - Category, floor, max occupancy.
   - Notes / features (optional).

2. **Current / Upcoming Booking**
   - Booking number, booking type.
   - Guest name + mobile.
   - Check-in and expected check-out date/time.
   - Adults / Children counts.
   - Booking status (Booked, Checked-in, Checked-out, Cancelled).

3. **Quick Booking Form (for this room)**
   - If no active booking:
     - `Guest / Customer` picker (tie-in with unified Customer system).
     - Booking type: Walk‑in / Advance / Online.
     - Check-in date/time, expected check-out date/time.
     - Occupancy (adults/children).
     - Notes.
   - If existing booking:
     - Editable fields allowed based on business rules (e.g., before check-in).

4. **Actions (footer of modal)**
   - Primary buttons (based on state):
     - **New Booking** (when room is available).
     - **Check-In** (when status = Booked and time conditions allow).
     - **Check-Out** (when status = Checked-in).
     - **Cancel Booking** (when status = Booked).
   - Secondary:
     - **View Booking History** (small inline link or button).
     - **Close**.

---

## 🔄 Workflow & User Flows

### Flow 1: New Booking from Room Card

1. User opens Room Booking POS page (date = Today by default).
2. Click on an **Available** room card.
3. `RoomDetailModal` opens:
   - Room summary.
   - Empty booking section with quick booking form.
4. User fills booking details and clicks **Save / New Booking**.
5. Room status changes to **Reserved** (or directly **Occupied** for walk-in check-in, depending on rules).
6. TodayTimelinePanel updates if booking is for today.

### Flow 2: Check-In from Timeline

1. In TodayTimelinePanel → “Today’s Check-ins”, user clicks a row.
2. `RoomDetailModal` opens with relevant room & booking loaded.
3. User verifies details and clicks **Check-In**.
4. Room status changes to **Checked-in / Occupied**.
5. Timeline row moves from “Upcoming” to “Today’s Check-ins (Checked-in)” with updated status.

### Flow 3: Check-Out from Timeline

1. In “Today’s Check-outs”, user clicks the entry.
2. `RoomDetailModal` opens.
3. User reviews stay details; from here, final **Check-Out** action will eventually lead to:
   - Room set to **Cleaning**.
   - Booking status set to **Checked-out**.
   - (In later phases) trigger Room Billing & invoice workflow.

---

## 📌 Business Rules (Billing, Linked Bills, Dates)

*These notes are from product discussion and must be reflected in API/database and UI when implementing room billing and linked stays.*

### 1. One bill per room

- Each room has **its own bill** (room charges + addon services for that room).
- Check-in, check-out, add services, and **pay** can be done **per room** individually.
- No shared "group bill" record: the "combined" view is a sum of individual room bills (see Linked bills below).

### 2. Linked bills (flat group)

- Bills can be **linked** to form a group (e.g. same guest/group, multiple rooms).
- **No main vs linked hierarchy**: all bills in a link group are equal.
- **From any bill in the group**:
  - User can **see all linked bills** (list + combined total).
  - User can **perform all actions**: pay this bill, pay all linked bills in one shot, add services, check-out, etc.
- Implementation: store a **link group id** (or equivalent) on each bill; "linked bills" = all bills sharing that id. Combined total = sum of those bills' totals.

### 3. Per-room check-in and check-out date/time

- **Each room has its own check-in and check-out date/time.** They may be the same across rooms (e.g. group arrives/leaves together) or different (e.g. Room 101 checks in Monday, Room 102 Tuesday).
- **All calculations are per room** using **that room's** check-in and check-out:
  - Nights stayed.
  - Room charges (e.g. rate × nights).
  - Any date-based addons or services.
- When showing **linked bills** or "pay all", the total is the **sum of each room's own calculated amount** (each from its own dates). Do not assume one common date range for the whole group.

### 4. Summary for API/DB

| Concept | Rule |
|--------|------|
| Bill | One bill per room (room + addons). |
| Link | Bills can belong to a link group (same id); no main/linked hierarchy. |
| View & actions | From any bill in the group: view all linked bills + combined total; pay this / pay all; same actions everywhere. |
| Dates | Check-in/check-out stored per room (or per booking-room); calculations (nights, charges) always use that room's dates. |

---

## 💾 Data Structure (High-Level)

### Room Object (for POS)

```javascript
{
  id: 101,
  roomNumber: "101",
  categoryName: "Deluxe",
  floorNumber: 1,
  maxOccupancy: 3,
  status: "occupied", // available, reserved, occupied, cleaning, maintenance
  isActive: true,
  // Optional booking snapshot for current/next booking
  activeBooking: {
    id: 25,
    bookingNumber: "#BOOK25",
    bookingType: "walk_in", // walk_in, advance, online
    guestName: "John Doe",
    checkInAt: "2025-01-15T10:30:00Z",
    expectedCheckOutAt: "2025-01-16T11:00:00Z",
    status: "checked_in" // booked, checked_in, checked_out, cancelled
  }
}
```

### Booking Object (simplified for POS)

```javascript
{
  id: 25,
  bookingNumber: "#BOOK25",
  customerId: 10,          // links to unified customers table
  guestName: "John Doe",
  guestMobile: "9999999999",
  bookingType: "advance",  // walk_in, advance, online
  checkInAt: "2025-01-15T12:00:00Z",
  expectedCheckOutAt: "2025-01-16T11:00:00Z",
  actualCheckInAt: null,
  actualCheckOutAt: null,
  rooms: [101, 102],       // multiple rooms per booking (future phases)
  adultsCount: 2,
  childrenCount: 1,
  status: "booked"         // booked, checked_in, checked_out, cancelled
}
```

### Today Timeline Item

```javascript
{
  type: "check_out",       // "check_in" | "check_out" | "upcoming"
  time: "11:00",
  roomId: 101,
  roomNumber: "101",
  categoryName: "Deluxe",
  bookingId: 25,
  bookingNumber: "#BOOK25",
  guestName: "John Doe",
  nights: 1,
  status: "due"            // due, checked_in, checked_out, cancelled
}
```

---

## 🎨 UI/UX Guidelines

- **Look & Feel**:
  - Match existing admin theme (teal primary `#0d9488`, light/dark modes).
  - Use card-based UI for rooms with soft shadows and rounded corners.
  - Use clear, consistent status colors (same mapping across app).

- **Readability**:
  - Room number and status must be **immediately visible**.
  - Guest name and timings secondary but still readable.
  - Timeline rows compact but not cramped.

- **Interactions**:
  - Large click targets for room cards and timeline rows.
  - Smooth transitions for modals and hover states.

---

## 🔧 Technical Notes (Frontend)

### Implemented (UI with mock data)

| Item | Location |
|------|----------|
| Main view | `admin/src/views/hotel-room/RoomBookingPOS.jsx` |
| Room grid panel | `admin/src/components/pages/hotel-room/RoomGridPanel.jsx` |
| Room card | `admin/src/components/pages/hotel-room/RoomCard.jsx` |
| Today timeline | `admin/src/components/pages/hotel-room/TodayTimelinePanel.jsx` |
| Room detail modal | `admin/src/components/pages/hotel-room/RoomDetailModal.jsx` |

- **Route**: `/hotel-room/booking-pos`. Nav: Hotel Room → "Room Booking POS".
- **Permission**: `ROOM_READ` (or `BOOKING_READ` / `HOTEL_ROOM_DASHBOARD_READ`) for access.
- **Mock data**: 40 rooms (floors 1–4, 10 rooms/floor), mix of Standard/Deluxe/Suite and statuses. Timeline derived from mock rooms (occupied → check-outs, reserved → check-ins).
- **Filter widths**: Date 180px, Status 165px, Cat 155px, Floor 140px, Search 220px (maxWidth).
- **Styles**: Room card status backgrounds and timeline hover in `admin/src/scss/style.scss` (`.room-card--available`, `.room-card--occupied`, etc.; `.timeline-item`).

### Integration (when backend ready)

- `roomService` for room list + status.
- `bookingService` for bookings, today check-ins/check-outs, create/check-in/check-out/cancel.
- Replace mock rooms and mock timeline with API responses.

### Patterns

- React 19 + React Bootstrap + FormFields + PermissionRoute.
- Modal: `react-bootstrap` Modal, `size="xl"`, `fullscreen="lg-down"`.

---

**Status**: **UI implemented** with mock data. Use this UI as the blueprint for booking API and database design.  
Backend booking APIs and billing integration: see `Room_Management_Plan.md` and related backend specs.  

