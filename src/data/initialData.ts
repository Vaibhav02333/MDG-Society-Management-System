import {
  Flat,
  Resident,
  OwnershipRecord,
  MaintenanceBill,
  GymPlan,
  GymMembership,
  Facility,
  FacilityBooking,
  Visitor,
  ParkingSlot,
  Complaint,
  Parcel,
  SocietyEvent,
  Poll,
  Notice,
  NotificationItem,
  ExpenseRecord,
  DocumentItem,
  ActivityLog,
  User,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Admin',
    email: 'admin@mdgsociety.in',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 2,
    username: 'rahul_sharma',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98451 12345',
    role: 'RESIDENT',
    flatId: 1,
    flatNumber: 'A-101',
    wing: 'A',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 3,
    username: 'sneha_patel',
    fullName: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    phone: '+91 97321 44556',
    role: 'RESIDENT',
    flatId: 18,
    flatNumber: 'B-203',
    wing: 'B',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 4,
    username: 'security_head',
    fullName: 'Vikram Singh',
    email: 'gate1.security@mdgsociety.in',
    phone: '+91 99123 77889',
    role: 'SECURITY',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
];

// Generate all 48 flats: Wings A, B, C; 4 floors each (1 to 4); 4 flats per floor (e.g., 101, 102, 103, 104)
export const generateInitialFlats = (): Flat[] => {
  const flats: Flat[] = [];
  const wings: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  let idCounter = 1;

  wings.forEach((wing) => {
    for (let floor = 1; floor <= 4; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        const flatNumber = `${wing}-${floor}0${unit}`;
        const bhk = unit === 1 ? '1BHK' : unit === 2 ? '2BHK' : unit === 3 ? '2BHK' : '3BHK';
        const areaSqFt = bhk === '1BHK' ? 680 : bhk === '2BHK' ? 1150 : 1580;
        const maintenance = bhk === '1BHK' ? 2500 : bhk === '2BHK' ? 4200 : 5800;

        // Realistic seed distribution: Mostly Owner-Occupied (78%), Tenant-Occupied (17%), Vacant (5%)
        let status: 'Owner-Occupied' | 'Tenant-Occupied' | 'Vacant' = 'Owner-Occupied';
        let ownerName = `Resident ${wing}-${floor}0${unit}`;
        let phone = `+91 98${idCounter.toString().padStart(2, '0')} 11223`;
        let email = `owner.${wing.toLowerCase()}${floor}0${unit}@gmail.com`;
        let pDate = '2023-04-15';
        let pAmount = areaSqFt * 6500;

        if (idCounter === 1) {
          ownerName = 'Rahul Sharma';
          phone = '+91 98451 12345';
          email = 'rahul.sharma@example.com';
          status = 'Owner-Occupied';
        } else if (idCounter === 18) {
          ownerName = 'Sneha Patel';
          phone = '+91 97321 44556';
          email = 'sneha.patel@example.com';
          status = 'Tenant-Occupied';
        } else if (idCounter % 9 === 0) {
          status = 'Vacant';
          ownerName = 'MDG Society Assets';
          phone = '+91 98765 43210';
          email = 'admin@mdgsociety.in';
        } else if (idCounter % 4 === 0) {
          status = 'Tenant-Occupied';
        }

        flats.push({
          id: idCounter,
          flatNumber,
          wing,
          floor,
          bhk,
          areaSqFt,
          occupancyStatus: status,
          currentOwnerName: ownerName,
          currentOwnerPhone: phone,
          currentOwnerEmail: email,
          purchaseDate: pDate,
          purchaseAmount: pAmount,
          monthlyMaintenanceAmount: maintenance,
        });

        idCounter++;
      }
    }
  });

  return flats;
};

export const INITIAL_OWNERSHIP_RECORDS: OwnershipRecord[] = [
  {
    id: 1,
    flatId: 1,
    flatNumber: 'A-101',
    wing: 'A',
    buyerName: 'Rahul Sharma',
    phone: '+91 98451 12345',
    email: 'rahul.sharma@example.com',
    address: 'A-101, Green Valley Residency, Bengaluru',
    purchaseDate: '2023-01-10',
    purchaseAmount: 8450000,
    previousOwnerName: 'Green Valley Builders Pvt Ltd',
    remarks: 'Original builder allotment registration completed',
  },
  {
    id: 2,
    flatId: 18,
    flatNumber: 'B-203',
    wing: 'B',
    buyerName: 'Amitabh Joshi',
    phone: '+91 98223 99881',
    email: 'amitabh.joshi@example.com',
    address: 'B-203, Green Valley Residency, Bengaluru',
    purchaseDate: '2023-03-22',
    purchaseAmount: 7600000,
    previousOwnerName: 'Green Valley Builders Pvt Ltd',
    remarks: 'Secondary leased out to Sneha Patel',
  },
  {
    id: 3,
    flatId: 35,
    flatNumber: 'C-103',
    wing: 'C',
    buyerName: 'Pooja Sundaram',
    phone: '+91 99001 22334',
    email: 'pooja.s@example.com',
    address: 'C-103, Green Valley Residency, Bengaluru',
    purchaseDate: '2024-02-14',
    purchaseAmount: 9200000,
    previousOwnerName: 'Kunal Deshmukh',
    transferDate: '2024-02-14',
    remarks: 'Ownership transfer deed notarized and stamp duty paid',
  },
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 1,
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98451 12345',
    flatId: 1,
    flatNumber: 'A-101',
    wing: 'A',
    type: 'Owner',
    moveInDate: '2023-01-20',
    emergencyContact: 'Priyanka Sharma (Spouse)',
    emergencyPhone: '+91 98451 98765',
    familyMembers: [
      { id: 1, residentId: 1, fullName: 'Priyanka Sharma', relation: 'Spouse', age: 32, phone: '+91 98451 98765' },
      { id: 2, residentId: 1, fullName: 'Aarav Sharma', relation: 'Child', age: 7 },
    ],
  },
  {
    id: 2,
    fullName: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    phone: '+91 97321 44556',
    flatId: 18,
    flatNumber: 'B-203',
    wing: 'B',
    type: 'Tenant',
    moveInDate: '2023-06-01',
    emergencyContact: 'Rohan Patel (Brother)',
    emergencyPhone: '+91 97321 99900',
    familyMembers: [
      { id: 3, residentId: 2, fullName: 'Rohan Patel', relation: 'Sibling', age: 26, phone: '+91 97321 99900' },
    ],
  },
  {
    id: 3,
    fullName: 'Rohit Kumar',
    email: 'rohit.kumar@example.com',
    phone: '+91 98112 33445',
    flatId: 5,
    flatNumber: 'A-201',
    wing: 'A',
    type: 'Owner',
    moveInDate: '2023-02-10',
    emergencyContact: 'Sunita Kumar (Mother)',
    emergencyPhone: '+91 98112 55667',
    familyMembers: [
      { id: 4, residentId: 3, fullName: 'Sunita Kumar', relation: 'Parent', age: 62 },
    ],
  },
  {
    id: 4,
    fullName: 'Dr. Anita Roy',
    email: 'anita.roy@example.com',
    phone: '+91 94330 66778',
    flatId: 33,
    flatNumber: 'C-101',
    wing: 'C',
    type: 'Owner',
    moveInDate: '2023-03-05',
    emergencyContact: 'Debashis Roy (Spouse)',
    emergencyPhone: '+91 94330 11223',
    familyMembers: [
      { id: 5, residentId: 4, fullName: 'Debashis Roy', relation: 'Spouse', age: 48, phone: '+91 94330 11223' },
      { id: 6, residentId: 4, fullName: 'Diya Roy', relation: 'Child', age: 16 },
    ],
  },
];

export const INITIAL_MAINTENANCE_BILLS: MaintenanceBill[] = [
  {
    id: 1,
    flatId: 1,
    flatNumber: 'A-101',
    wing: 'A',
    residentName: 'Rahul Sharma',
    month: 'April 2025',
    amount: 4200,
    dueDate: '2025-04-10',
    status: 'Paid',
    paidDate: '2025-04-05',
    paymentMode: 'UPI',
    transactionRef: 'UPI/20250405/98231',
    receiptNumber: 'MDG-REC-2025-0401',
  },
  {
    id: 2,
    flatId: 18,
    flatNumber: 'B-203',
    wing: 'B',
    residentName: 'Sneha Patel',
    month: 'April 2025',
    amount: 4200,
    dueDate: '2025-04-10',
    status: 'Paid',
    paidDate: '2025-04-08',
    paymentMode: 'NetBanking',
    transactionRef: 'HDFC/NET/871239',
    receiptNumber: 'MDG-REC-2025-0418',
  },
  {
    id: 3,
    flatId: 5,
    flatNumber: 'A-201',
    wing: 'A',
    residentName: 'Rohit Kumar',
    month: 'April 2025',
    amount: 2500,
    dueDate: '2025-04-10',
    status: 'Pending',
  },
  {
    id: 4,
    flatId: 33,
    flatNumber: 'C-101',
    wing: 'C',
    residentName: 'Dr. Anita Roy',
    month: 'April 2025',
    amount: 5800,
    dueDate: '2025-04-10',
    status: 'Paid',
    paidDate: '2025-04-02',
    paymentMode: 'Card',
    transactionRef: 'TXN-ICICI-66231',
    receiptNumber: 'MDG-REC-2025-0433',
  },
  {
    id: 5,
    flatId: 2,
    flatNumber: 'A-102',
    wing: 'A',
    residentName: 'Resident A-102',
    month: 'March 2025',
    amount: 4200,
    dueDate: '2025-03-10',
    status: 'Overdue',
  },
];

export const INITIAL_GYM_PLANS: GymPlan[] = [
  {
    id: 1,
    name: 'Monthly Fitness Plan',
    durationMonths: 1,
    fee: 1200,
    description: 'Full cardio and weight equipment access during morning and evening hours.',
  },
  {
    id: 2,
    name: 'Quarterly Wellness Plan',
    durationMonths: 3,
    fee: 3200,
    description: 'Includes trainer assistance, locker access, and personal diet orientation.',
  },
  {
    id: 3,
    name: 'Annual Elite Membership',
    durationMonths: 12,
    fee: 10000,
    description: 'All-inclusive 365 days access + priority sauna and guest pass perks.',
  },
];

export const INITIAL_GYM_MEMBERSHIPS: GymMembership[] = [
  {
    id: 1,
    residentId: 1,
    residentName: 'Rahul Sharma',
    flatNumber: 'A-101',
    planId: 3,
    planName: 'Annual Elite Membership',
    startDate: '2024-05-01',
    expiryDate: '2025-05-01',
    feePaid: 10000,
    status: 'Active',
    paymentStatus: 'Paid',
  },
  {
    id: 2,
    residentId: 2,
    residentName: 'Sneha Patel',
    flatNumber: 'B-203',
    planId: 2,
    planName: 'Quarterly Wellness Plan',
    startDate: '2025-02-15',
    expiryDate: '2025-05-15',
    feePaid: 3200,
    status: 'Active',
    paymentStatus: 'Paid',
  },
  {
    id: 3,
    residentId: 3,
    residentName: 'Rohit Kumar',
    flatNumber: 'A-201',
    planId: 1,
    planName: 'Monthly Fitness Plan',
    startDate: '2025-03-18',
    expiryDate: '2025-04-18',
    feePaid: 1200,
    status: 'Active',
    paymentStatus: 'Paid',
  },
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 1,
    name: 'Club House Banquet Hall',
    description: 'Air-conditioned multipurpose event hall with stage, AV projection, and banquet seating for up to 120 people.',
    capacity: 120,
    hourlyRate: 1500,
    timings: '09:00 AM - 10:00 PM',
    rules: 'No loud music after 10:00 PM. Catering waste must be cleared by organizer.',
  },
  {
    id: 2,
    name: 'Community Open Amphitheatre',
    description: 'Open-air stepped amphitheatre for festivals, cultural performances, and evening gatherings.',
    capacity: 200,
    hourlyRate: 800,
    timings: '06:00 AM - 09:30 PM',
    rules: 'Residents can book for non-commercial community celebrations.',
  },
  {
    id: 3,
    name: 'Swimming Pool & Deck',
    description: 'Semi-Olympic temperature-regulated swimming pool with toddler splash zone and poolside loungers.',
    capacity: 35,
    hourlyRate: 300,
    timings: '06:00 AM - 08:00 PM',
    rules: 'Appropriate swimwear mandatory. Children under 12 must be accompanied by adults.',
  },
  {
    id: 4,
    name: 'Badminton & Squash Court',
    description: 'Indoor wooden maple flooring twin courts with LED tournament lighting.',
    capacity: 8,
    hourlyRate: 200,
    timings: '06:00 AM - 10:00 PM',
    rules: 'Non-marking gum sole shoes mandatory. Max 2 slots per flat per week.',
  },
];

export const INITIAL_FACILITY_BOOKINGS: FacilityBooking[] = [
  {
    id: 1,
    facilityId: 1,
    facilityName: 'Club House Banquet Hall',
    residentId: 1,
    residentName: 'Rahul Sharma',
    flatNumber: 'A-101',
    bookingDate: '2025-04-28',
    startTime: '17:00',
    endTime: '21:00',
    totalAmount: 6000,
    status: 'Confirmed',
    purpose: 'Aarav 7th Birthday Party Celebration',
    createdAt: '2025-04-15 11:30',
  },
  {
    id: 2,
    facilityId: 4,
    facilityName: 'Badminton & Squash Court',
    residentId: 2,
    residentName: 'Sneha Patel',
    flatNumber: 'B-203',
    bookingDate: '2025-04-20',
    startTime: '07:00',
    endTime: '08:00',
    totalAmount: 200,
    status: 'Confirmed',
    purpose: 'Morning badminton game with friends',
    createdAt: '2025-04-18 09:15',
  },
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 1,
    visitorName: 'Manoj Verma',
    phone: '+91 99887 66554',
    hostFlatNumber: 'A-101',
    hostResidentName: 'Rahul Sharma',
    purpose: 'Personal guest / family dinner',
    entryTime: '2025-04-27 11:15 AM',
    status: 'Checked-In',
    qrPassCode: 'MDG-PASS-A101-7891',
    vehicleNumber: 'KA-03-MB-4512',
    date: '2025-04-27',
  },
  {
    id: 2,
    visitorName: 'Kavita Sundar',
    phone: '+91 98441 33221',
    hostFlatNumber: 'B-203',
    hostResidentName: 'Sneha Patel',
    purpose: 'Interior design consultation',
    entryTime: '2025-04-27 09:30 AM',
    exitTime: '2025-04-27 10:45 AM',
    status: 'Checked-Out',
    qrPassCode: 'MDG-PASS-B203-3452',
    vehicleNumber: 'KA-01-EQ-9871',
    date: '2025-04-27',
  },
  {
    id: 3,
    visitorName: 'Amazon Delivery Associate',
    phone: '+91 98110 55442',
    hostFlatNumber: 'A-201',
    hostResidentName: 'Rohit Kumar',
    purpose: 'Parcel drop-off',
    status: 'Expected',
    qrPassCode: 'MDG-PASS-A201-1123',
    date: '2025-04-27',
  },
];

export const generateInitialParkingSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  const wings: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  let id = 1;

  wings.forEach((wing) => {
    for (let i = 1; i <= 16; i++) {
      const slotNumber = `P-${wing}${i.toString().padStart(2, '0')}`;
      const isAllocated = i <= 11;
      slots.push({
        id,
        slotNumber,
        wing,
        floorLevel: i <= 8 ? 'Basement 1' : 'Basement 2',
        isAllocated,
        allocatedFlatNumber: isAllocated ? `${wing}-${Math.ceil(i / 4)}0${((i - 1) % 4) + 1}` : undefined,
        allocatedResidentName: isAllocated ? `Resident ${wing}-${Math.ceil(i / 4)}0${((i - 1) % 4) + 1}` : undefined,
        vehicleNumber: isAllocated ? `KA-04-MD-${(1000 + id).toString()}` : undefined,
        vehicleType: i % 5 === 0 ? 'EV 4-Wheeler' : i % 2 === 0 ? '4-Wheeler' : '2-Wheeler',
      });
      id++;
    }
  });

  return slots;
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 1,
    title: 'Water pressure drop in master bathroom',
    category: 'Plumbing',
    description: 'Very low water pressure during morning hours between 7 AM and 9 AM on the top floor.',
    flatNumber: 'A-401',
    residentName: 'Priya Nambiar',
    residentPhone: '+91 98450 12099',
    priority: 'Medium',
    status: 'In Progress',
    assignedStaff: 'Ramesh (Society Plumber)',
    deadline: '2025-04-29',
    createdAt: '2025-04-26 14:20',
    adminResponse: 'Assigned plumber Ramesh to inspect booster pump manifold on terrace.',
  },
  {
    id: 2,
    title: 'Corridor lights flickering in Wing B 2nd floor',
    category: 'Electrical',
    description: 'Two LED tube lights outside flat B-203 and B-204 are blinking continuously at night.',
    flatNumber: 'B-203',
    residentName: 'Sneha Patel',
    residentPhone: '+91 97321 44556',
    priority: 'Low',
    status: 'Resolved',
    assignedStaff: 'Mahesh (Electrician)',
    deadline: '2025-04-27',
    createdAt: '2025-04-25 18:30',
    resolvedAt: '2025-04-26 11:00',
    adminResponse: 'Driver chokes replaced for both corridor fixtures. Working properly now.',
  },
  {
    id: 3,
    title: 'Wing C passenger elevator abnormal grinding sound',
    category: 'Elevator',
    description: 'Lift #2 makes a distinct metallic vibration sound when decelerating at Floor 3.',
    flatNumber: 'C-302',
    residentName: 'Karthik Rao',
    residentPhone: '+91 98901 33445',
    priority: 'High',
    status: 'Pending',
    assignedStaff: 'Schindler AMC Team',
    deadline: '2025-04-28',
    createdAt: '2025-04-27 08:45',
    adminResponse: 'Technician visit scheduled for Monday 10:00 AM under AMC warranty.',
  },
];

export const INITIAL_PARCELS: Parcel[] = [
  {
    id: 1,
    recipientName: 'Rahul Sharma',
    flatNumber: 'A-101',
    courierCompany: 'Amazon',
    trackingNumber: 'AMZ-IN-889123',
    receivedAt: '2025-04-27 09:15 AM',
    status: 'Pending Collection',
    securityStaffName: 'Vikram Singh',
  },
  {
    id: 2,
    recipientName: 'Sneha Patel',
    flatNumber: 'B-203',
    courierCompany: 'BlueDart Express',
    trackingNumber: 'BD-BLR-441092',
    receivedAt: '2025-04-26 16:20 PM',
    status: 'Collected',
    collectedAt: '2025-04-26 19:30 PM',
    collectedBy: 'Sneha Patel (Self)',
    securityStaffName: 'Vikram Singh',
  },
  {
    id: 3,
    recipientName: 'Dr. Anita Roy',
    flatNumber: 'C-101',
    courierCompany: 'DTDC',
    trackingNumber: 'DTDC-99214',
    receivedAt: '2025-04-27 11:40 AM',
    status: 'Pending Collection',
    securityStaffName: 'Vikram Singh',
  },
];

export const INITIAL_EVENTS: SocietyEvent[] = [
  {
    id: 1,
    title: 'Annual Day Celebration & Cultural Evening',
    description: 'Join us for cultural dance performances by kids, musical night, food stalls, and president address.',
    eventDate: '2025-04-28',
    eventTime: '05:00 PM',
    location: 'Community Hall & Amphitheatre',
    category: 'Cultural',
    bannerGradient: 'from-purple-600 to-indigo-700',
  },
  {
    id: 2,
    title: 'Morning Holistic Yoga & Pranayama Session',
    description: 'Certified yoga instructor masterclass focusing on breathing techniques and spine mobility.',
    eventDate: '2025-05-02',
    eventTime: '07:00 AM',
    location: 'Club House Terrace Lawn',
    category: 'Health',
    bannerGradient: 'from-emerald-600 to-teal-700',
  },
  {
    id: 3,
    title: 'Annual General Body Society Meeting (AGM)',
    description: 'Review of audited annual accounts, solar rooftop project proposal, and election committee update.',
    eventDate: '2025-05-10',
    eventTime: '06:00 PM',
    location: 'Conference Room',
    category: 'Meeting',
    bannerGradient: 'from-blue-600 to-sky-700',
  },
  {
    id: 4,
    title: 'Free Preventive Health Checkup Camp',
    description: 'Comprehensive blood sugar, ECG, vitals, eye checkup and dentist consultation in collaboration with Manipal Hospital.',
    eventDate: '2025-05-15',
    eventTime: '10:00 AM',
    location: 'Community Hall',
    category: 'Health',
    bannerGradient: 'from-rose-600 to-pink-700',
  },
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 1,
    question: 'Should we install a 50kW Rooftop Solar Grid for Common Area Lighting?',
    description: 'The capital expenditure of ₹ 22 Lakhs will be funded from the sinking reserve, reducing monthly common electricity costs by ~45%.',
    options: [
      { id: 1, text: 'Yes, proceed with rooftop solar installation', votes: 42 },
      { id: 2, text: 'Need a detailed vendor quote comparison first', votes: 14 },
      { id: 3, text: 'No, postpone capital expenditure', votes: 3 },
    ],
    totalVotes: 59,
    votedUserIds: [1, 2],
    endDate: '2025-05-05',
    isActive: true,
  },
  {
    id: 2,
    question: 'Preferred hours for EV Charging Stations usage in Basement 1?',
    description: 'Decide priority slot hours to ensure all registered EV owners get fair overnight charging access.',
    options: [
      { id: 1, text: 'Standard 4-hour time slots (Round the clock)', votes: 28 },
      { id: 2, text: 'Overnight priority 10 PM - 6 AM', votes: 35 },
    ],
    totalVotes: 63,
    votedUserIds: [2],
    endDate: '2025-05-12',
    isActive: true,
  },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 1,
    title: 'Overhead Water Tank Cleaning & Disinfection Schedule',
    content: 'Please note that overhead water tanks of Wing A, B and C will be cleaned on Tuesday, 29th April from 10:00 AM to 03:00 PM. Kindly store sufficient water in advance.',
    category: 'Maintenance',
    publishedBy: 'Estate Manager',
    publishedDate: '2025-04-26',
    isPinned: true,
  },
  {
    id: 2,
    title: 'Fire Safety Drill & Extinguisher Training Demonstration',
    content: 'A mock emergency evacuation drill and live fire extinguisher hands-on training will be held on Saturday 3rd May at 11:00 AM at the central driveway. All residents and staff are requested to participate.',
    category: 'Security',
    publishedBy: 'Management Committee',
    publishedDate: '2025-04-25',
    isPinned: false,
  },
  {
    id: 3,
    title: 'Revised Visitor Parking Rules and Night Timings',
    content: 'Visitor vehicles must not be parked beyond 11:00 PM without prior written confirmation from the host flat. Security will verify passes at Gate 1.',
    category: 'General',
    publishedBy: 'Security Supervisor',
    publishedDate: '2025-04-24',
    isPinned: false,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'New maintenance bill generated',
    message: 'Maintenance bill for April 2025 generated for Flat A-101 (₹ 4,200).',
    category: 'bill',
    timestamp: '2 hours ago',
    isRead: false,
    targetRole: 'RESIDENT',
    targetFlatNumber: 'A-101',
  },
  {
    id: 2,
    title: 'Complaint updated',
    message: 'Plumbing issue status changed to In Progress. Technician assigned.',
    category: 'complaint',
    timestamp: '4 hours ago',
    isRead: false,
  },
  {
    id: 3,
    title: 'Visitor check-in',
    message: 'Guest Manoj Verma checked in at Gate 1 for Flat A-101.',
    category: 'visitor',
    timestamp: '5 hours ago',
    isRead: true,
    targetFlatNumber: 'A-101',
  },
  {
    id: 4,
    title: 'Gym membership expiring',
    message: 'Rohit Kumar (A-201) monthly gym membership expires in 3 days.',
    category: 'gym',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: 5,
    title: 'Event registration confirmed',
    message: 'Confirmed your seat for Annual Day Celebration & Cultural Evening.',
    category: 'event',
    timestamp: '1 day ago',
    isRead: true,
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 1,
    category: 'Security Staff',
    amount: 145000,
    expenseDate: '2025-04-05',
    description: 'Monthly payroll for 8 security guards and 2 gate supervisors (Eagle Security Agency).',
    vendorName: 'Eagle Security & Guarding Services',
    paymentMode: 'Bank Transfer',
    invoiceNumber: 'INV-EAG-2025-04',
  },
  {
    id: 2,
    category: 'Electricity & Water',
    amount: 98450,
    expenseDate: '2025-04-08',
    description: 'BESCOM common area lighting, pumps, clubhouse electricity bill and BWSSB water charges.',
    vendorName: 'BESCOM & BWSSB',
    paymentMode: 'Bank Transfer',
    invoiceNumber: 'BESCOM-9812401',
  },
  {
    id: 3,
    category: 'Elevator AMC',
    amount: 45000,
    expenseDate: '2025-04-12',
    description: 'Quarterly comprehensive maintenance contract for 6 Schindler high-speed elevators.',
    vendorName: 'Schindler Elevators India Ltd',
    paymentMode: 'Cheque',
    invoiceNumber: 'SCH-AMC-Q1-2025',
  },
  {
    id: 4,
    category: 'Gardening & Housekeeping',
    amount: 62000,
    expenseDate: '2025-04-14',
    description: 'Daily housekeeping staff, garbage segregation, pool chlorination and landscaped garden upkeep.',
    vendorName: 'CleanGreen Facility Management',
    paymentMode: 'Bank Transfer',
    invoiceNumber: 'CG-INV-4401',
  },
  {
    id: 5,
    category: 'Repairs',
    amount: 18500,
    expenseDate: '2025-04-18',
    description: 'Replaced terrace pressure pump check valve and manifold flange seals.',
    vendorName: 'Apex Water Works & Valves',
    paymentMode: 'UPI',
    invoiceNumber: 'AWW-8819',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    title: 'Society Registered Bye-Laws & Rules Manual',
    category: 'Society Bye-Laws',
    fileSize: '3.4 MB',
    uploadDate: '2024-01-15',
    allowedRoles: ['ADMIN', 'RESIDENT'],
  },
  {
    id: 2,
    title: 'Fire Safety NOC & Compliance Certificate 2024-2027',
    category: 'Fire NOC',
    fileSize: '1.8 MB',
    uploadDate: '2024-03-20',
    allowedRoles: ['ADMIN', 'RESIDENT', 'SECURITY'],
  },
  {
    id: 3,
    title: 'Audited Financial Statements & Balance Sheet FY24',
    category: 'Audited Accounts',
    fileSize: '4.6 MB',
    uploadDate: '2024-08-10',
    allowedRoles: ['ADMIN'],
  },
  {
    id: 4,
    title: 'Sale Deed & Allotment Paper - Flat A-101',
    category: 'Ownership Document',
    fileSize: '5.2 MB',
    uploadDate: '2023-01-15',
    allowedRoles: ['ADMIN', 'RESIDENT'],
    flatNumber: 'A-101',
  },
  {
    id: 5,
    title: 'Annual General Meeting (AGM) Minutes of Meeting',
    category: 'Meeting Minutes',
    fileSize: '1.2 MB',
    uploadDate: '2024-09-30',
    allowedRoles: ['ADMIN', 'RESIDENT'],
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    action: 'Flat A-101 ownership updated',
    category: 'Ownership',
    details: 'Ownership verified and registered to Rahul Sharma by Admin.',
    performedBy: 'Admin',
    role: 'ADMIN',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    action: 'Maintenance bill paid',
    category: 'Payment',
    details: '₹ 4,200 paid for Flat B-203 via NetBanking. Receipt #MDG-REC-2025-0418 generated.',
    performedBy: 'Sneha Patel',
    role: 'RESIDENT',
    timestamp: '4 hours ago',
  },
  {
    id: 3,
    action: 'Visitor entry recorded',
    category: 'Visitor',
    details: 'Guest Manoj Verma checked in at Main Gate 1 for Flat A-101.',
    performedBy: 'Vikram Singh',
    role: 'SECURITY',
    timestamp: '5 hours ago',
  },
  {
    id: 4,
    action: 'New complaint registered',
    category: 'Complaint',
    details: 'Ticket #3 registered for Wing C elevator vibration.',
    performedBy: 'Karthik Rao',
    role: 'RESIDENT',
    timestamp: '6 hours ago',
  },
  {
    id: 5,
    action: 'Gym membership renewed',
    category: 'Gym',
    details: 'Quarterly Wellness Plan activated for Sneha Patel (Flat B-203).',
    performedBy: 'Sneha Patel',
    role: 'RESIDENT',
    timestamp: '1 day ago',
  },
];
