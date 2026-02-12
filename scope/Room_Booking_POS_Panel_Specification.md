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
- Date selector (default: Today).
- Filters: Status, Category, Floor.
- Search box: Room number, Guest name, Booking number.
- Summary chips: Total Rooms, Available, Occupied, Reserved, Cleaning, Maintenance, Today Check-ins, Today Check-outs.

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
│                      ROOM BOOKING POS PANEL HEADER                          │
│ [Date: Today] [Status Filter] [Category] [Floor] [Search: Room/Guest/Book#] │
│ [Chips: Total | Available | Occupied | Reserved | Cleaning | Maint |        │
│         Today Check‑ins | Today Check‑outs ]                                │
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
- Responsive grid of `RoomCard` components (3–4 columns desktop, 2 tablet, 1 mobile).
- Top controls (inside panel header):
  - Status filter dropdown.
  - Category dropdown.
  - Floor dropdown.
  - Optional quick filter chips (e.g., only Available, only Occupied).
- Scrollable area for large numbers of rooms.

#### `RoomCard`

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
- **Click**: Opens `RoomDetailModal` centered on screen.
- Hover (desktop):
  - Slight scale / shadow.
  - Tooltip with extra notes if truncated (optional).

---

### 2. **TodayTimelinePanel (Right)**

**Purpose**: Focused view of **today’s operations** (check-ins, check-outs, and near-term bookings).

**Layout:**
- Header: “Today’s Activity”
- Subsections (vertical, scrollable):

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

#### 2.3 Upcoming (today window)
- Upcoming bookings for **today** (and optionally near-future window if configured):
  - Later check-ins and check-outs.
  - Bookings without assigned room yet (optional, if supported later).

**Interactions:**
- Click on any row:
  - Opens `RoomDetailModal` for the associated room/booking.
- Optional chips/toggles to show/hide sections if many items.

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

- New main view: `RoomBookingPOS.jsx` (or similar) under `admin/src/views/hotel-room/`.
- Likely sub-components:
  - `RoomGridPanel`
  - `RoomCard`
  - `TodayTimelinePanel`
  - `RoomDetailModal`
- Integrate with:
  - `roomService` (for room list + status).
  - Future `bookingService` (for bookings, today lists).
- Respect existing patterns:
  - React 19 + React Bootstrap + FormFields + PermissionRoute.
  - Use `PermissionRoute` with `BOOKING_READ` / `BOOKING_WRITE` / `HOTEL_ROOM_DASHBOARD_READ` as needed.

---

**Status**: Draft specification for Room Booking POS Panel (UI & workflow only).  
Backend booking APIs and detailed billing integration will be defined in `Room_Management_Plan.md` and related backend specs.  

