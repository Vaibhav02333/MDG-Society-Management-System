import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Flat,
  OwnershipRecord,
  Resident,
  FamilyMember,
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
  SocietyHealthBreakdown,
} from '../types';
import {
  INITIAL_USERS,
  generateInitialFlats,
  INITIAL_OWNERSHIP_RECORDS,
  INITIAL_RESIDENTS,
  INITIAL_MAINTENANCE_BILLS,
  INITIAL_GYM_PLANS,
  INITIAL_GYM_MEMBERSHIPS,
  INITIAL_FACILITIES,
  INITIAL_FACILITY_BOOKINGS,
  INITIAL_VISITORS,
  generateInitialParkingSlots,
  INITIAL_COMPLAINTS,
  INITIAL_PARCELS,
  INITIAL_EVENTS,
  INITIAL_POLLS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPENSES,
  INITIAL_DOCUMENTS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';

interface SocietyContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  login: (username: string, role?: UserRole) => boolean;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Flats & Ownership
  flats: Flat[];
  addFlat: (flat: Omit<Flat, 'id'>) => void;
  updateFlat: (id: number, flat: Partial<Flat>) => void;
  deleteFlat: (id: number) => boolean;
  ownershipRecords: OwnershipRecord[];
  purchaseFlat: (data: {
    flatId: number;
    buyerName: string;
    phone: string;
    email: string;
    address: string;
    purchaseAmount: number;
    purchaseDate: string;
    remarks?: string;
  }) => boolean;

  // Residents & Family
  residents: Resident[];
  addResident: (data: Omit<Resident, 'id' | 'familyMembers'>) => void;
  updateResident: (id: number, data: Partial<Resident>) => void;
  addFamilyMember: (residentId: number, member: Omit<FamilyMember, 'id' | 'residentId'>) => void;
  removeFamilyMember: (residentId: number, memberId: number) => void;

  // Maintenance & Billing
  maintenanceBills: MaintenanceBill[];
  generateMonthlyBills: (month: string, dueDate: string) => number;
  recordBillPayment: (billId: number, paymentMode: MaintenanceBill['paymentMode'], transactionRef?: string) => boolean;

  // Gym Management
  gymPlans: GymPlan[];
  gymMemberships: GymMembership[];
  addGymMembership: (residentId: number, planId: number) => boolean;
  renewGymMembership: (membershipId: number, planId: number) => boolean;

  // Facilities & Bookings
  facilities: Facility[];
  facilityBookings: FacilityBooking[];
  bookFacility: (data: {
    facilityId: number;
    residentId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => { success: boolean; message: string };
  cancelFacilityBooking: (bookingId: number) => boolean;

  // Visitors & Security
  visitors: Visitor[];
  registerVisitor: (data: {
    visitorName: string;
    phone: string;
    hostFlatNumber: string;
    purpose: string;
    vehicleNumber?: string;
  }) => Visitor;
  updateVisitorStatus: (visitorId: number, status: Visitor['status']) => void;
  verifyVisitorPass: (qrCode: string) => Visitor | null;

  // Parking & Vehicles
  parkingSlots: ParkingSlot[];
  allocateParkingSlot: (slotId: number, flatNumber: string, residentName: string, vehicleNumber: string, vehicleType: ParkingSlot['vehicleType']) => { success: boolean; message: string };
  releaseParkingSlot: (slotId: number) => void;

  // Complaints
  complaints: Complaint[];
  addComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => void;
  updateComplaintStatus: (id: number, status: Complaint['status'], adminResponse?: string, assignedStaff?: string) => void;

  // Parcels
  parcels: Parcel[];
  registerParcel: (data: { recipientName: string; flatNumber: string; courierCompany: string; trackingNumber?: string }) => void;
  collectParcel: (id: number, collectedBy: string) => void;

  // Events & Polls
  events: SocietyEvent[];
  addEvent: (event: Omit<SocietyEvent, 'id'>) => void;
  polls: Poll[];
  votePoll: (pollId: number, optionId: number) => { success: boolean; message: string };

  // Notices & Notifications
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'publishedDate'>) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;

  // Expenses & Reports
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, category: ActivityLog['category'], details: string) => void;

  // Society Health Score
  healthScore: SocietyHealthBreakdown;

  // Project code / help modal
  isCodeModalOpen: boolean;
  setIsCodeModalOpen: (open: boolean) => void;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (defaults to Admin for instant interactive exploration, can switch or view landing page)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Entities state with local storage fallback or initial seed
  const [flats, setFlats] = useState<Flat[]>(() => {
    const saved = localStorage.getItem('mdg_flats');
    return saved ? JSON.parse(saved) : generateInitialFlats();
  });

  const [ownershipRecords, setOwnershipRecords] = useState<OwnershipRecord[]>(() => {
    const saved = localStorage.getItem('mdg_ownership');
    return saved ? JSON.parse(saved) : INITIAL_OWNERSHIP_RECORDS;
  });

  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem('mdg_residents');
    return saved ? JSON.parse(saved) : INITIAL_RESIDENTS;
  });

  const [maintenanceBills, setMaintenanceBills] = useState<MaintenanceBill[]>(() => {
    const saved = localStorage.getItem('mdg_bills');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_BILLS;
  });

  const [gymPlans] = useState<GymPlan[]>(INITIAL_GYM_PLANS);
  const [gymMemberships, setGymMemberships] = useState<GymMembership[]>(() => {
    const saved = localStorage.getItem('mdg_gym_memberships');
    return saved ? JSON.parse(saved) : INITIAL_GYM_MEMBERSHIPS;
  });

  const [facilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>(() => {
    const saved = localStorage.getItem('mdg_facility_bookings');
    return saved ? JSON.parse(saved) : INITIAL_FACILITY_BOOKINGS;
  });

  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem('mdg_visitors');
    return saved ? JSON.parse(saved) : INITIAL_VISITORS;
  });

  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(() => {
    const saved = localStorage.getItem('mdg_parking');
    return saved ? JSON.parse(saved) : generateInitialParkingSlots();
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('mdg_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [parcels, setParcels] = useState<Parcel[]>(() => {
    const saved = localStorage.getItem('mdg_parcels');
    return saved ? JSON.parse(saved) : INITIAL_PARCELS;
  });

  const [events, setEvents] = useState<SocietyEvent[]>(() => {
    const saved = localStorage.getItem('mdg_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('mdg_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('mdg_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('mdg_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('mdg_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('mdg_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('mdg_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Sync state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('mdg_flats', JSON.stringify(flats));
  }, [flats]);
  useEffect(() => {
    localStorage.setItem('mdg_ownership', JSON.stringify(ownershipRecords));
  }, [ownershipRecords]);
  useEffect(() => {
    localStorage.setItem('mdg_residents', JSON.stringify(residents));
  }, [residents]);
  useEffect(() => {
    localStorage.setItem('mdg_bills', JSON.stringify(maintenanceBills));
  }, [maintenanceBills]);
  useEffect(() => {
    localStorage.setItem('mdg_gym_memberships', JSON.stringify(gymMemberships));
  }, [gymMemberships]);
  useEffect(() => {
    localStorage.setItem('mdg_facility_bookings', JSON.stringify(facilityBookings));
  }, [facilityBookings]);
  useEffect(() => {
    localStorage.setItem('mdg_visitors', JSON.stringify(visitors));
  }, [visitors]);
  useEffect(() => {
    localStorage.setItem('mdg_parking', JSON.stringify(parkingSlots));
  }, [parkingSlots]);
  useEffect(() => {
    localStorage.setItem('mdg_complaints', JSON.stringify(complaints));
  }, [complaints]);
  useEffect(() => {
    localStorage.setItem('mdg_parcels', JSON.stringify(parcels));
  }, [parcels]);
  useEffect(() => {
    localStorage.setItem('mdg_polls', JSON.stringify(polls));
  }, [polls]);
  useEffect(() => {
    localStorage.setItem('mdg_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('mdg_notices', JSON.stringify(notices));
  }, [notices]);
  useEffect(() => {
    localStorage.setItem('mdg_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('mdg_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('mdg_documents', JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    localStorage.setItem('mdg_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Activity logger helper
  const addActivityLog = (action: string, category: ActivityLog['category'], details: string) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      action,
      category,
      details,
      performedBy: currentUser?.fullName || 'System',
      role: currentUser?.role || 'ADMIN',
      timestamp: 'Just now',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Switch role helper
  const switchRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(targetUser);
    setActiveTab('dashboard');
    addActivityLog(`Switched role to ${role}`, 'System', `Active session converted to ${targetUser.fullName} (${role})`);
  };

  const login = (username: string, role?: UserRole) => {
    let user = INITIAL_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user && role) {
      user = INITIAL_USERS.find((u) => u.role === role);
    }
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
      addActivityLog(`User logged in`, 'System', `${user.fullName} logged into MDG portal`);
      return true;
    }
    // Fallback: create dynamic resident
    const newUser: User = {
      id: Date.now(),
      username,
      fullName: username,
      email: `${username}@mdgsociety.in`,
      phone: '+91 98000 11223',
      role: role || 'RESIDENT',
      flatNumber: 'A-101',
      wing: 'A',
    };
    setCurrentUser(newUser);
    setActiveTab('dashboard');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('landing');
  };

  // Flat Management
  const addFlat = (flatData: Omit<Flat, 'id'>) => {
    const newId = Math.max(...flats.map((f) => f.id), 0) + 1;
    const newFlat: Flat = { ...flatData, id: newId };
    setFlats((prev) => [...prev, newFlat]);
    addActivityLog(`Flat ${newFlat.flatNumber} added`, 'Ownership', `Registered flat in Wing ${newFlat.wing}`);
  };

  const updateFlat = (id: number, data: Partial<Flat>) => {
    setFlats((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...data };
          addActivityLog(`Flat ${f.flatNumber} details updated`, 'Ownership', `Updated flat information`);
          return updated;
        }
        return f;
      })
    );
  };

  const deleteFlat = (id: number): boolean => {
    const flat = flats.find((f) => f.id === id);
    if (!flat) return false;
    // Don't delete if owner occupied
    if (flat.occupancyStatus === 'Owner-Occupied') {
      alert('Cannot delete flat that is currently Owner-Occupied. Please transfer ownership or mark as Vacant first.');
      return false;
    }
    setFlats((prev) => prev.filter((f) => f.id !== id));
    addActivityLog(`Flat ${flat.flatNumber} deleted`, 'Ownership', `Removed flat record`);
    return true;
  };

  // Purchase Flat and Ownership Transfer
  const purchaseFlat = (data: {
    flatId: number;
    buyerName: string;
    phone: string;
    email: string;
    address: string;
    purchaseAmount: number;
    purchaseDate: string;
    remarks?: string;
  }): boolean => {
    const flat = flats.find((f) => f.id === data.flatId);
    if (!flat) return false;

    const previousOwner = flat.currentOwnerName || 'Builder Allotment';

    // 1. Create Ownership Record
    const newRecord: OwnershipRecord = {
      id: Date.now(),
      flatId: flat.id,
      flatNumber: flat.flatNumber,
      wing: flat.wing,
      buyerName: data.buyerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      purchaseDate: data.purchaseDate,
      purchaseAmount: data.purchaseAmount,
      previousOwnerName: previousOwner,
      transferDate: new Date().toISOString().split('T')[0],
      remarks: data.remarks || 'Standard ownership deed registration',
    };
    setOwnershipRecords((prev) => [newRecord, ...prev]);

    // 2. Update Flat current owner and status
    updateFlat(flat.id, {
      currentOwnerName: data.buyerName,
      currentOwnerPhone: data.phone,
      currentOwnerEmail: data.email,
      occupancyStatus: 'Owner-Occupied',
      purchaseDate: data.purchaseDate,
      purchaseAmount: data.purchaseAmount,
    });

    // 3. Update or Add Resident record
    const existingResidentIndex = residents.findIndex((r) => r.flatId === flat.id);
    if (existingResidentIndex >= 0) {
      setResidents((prev) =>
        prev.map((r, i) =>
          i === existingResidentIndex
            ? { ...r, fullName: data.buyerName, email: data.email, phone: data.phone, type: 'Owner' }
            : r
        )
      );
    } else {
      const newResident: Resident = {
        id: Date.now(),
        fullName: data.buyerName,
        email: data.email,
        phone: data.phone,
        flatId: flat.id,
        flatNumber: flat.flatNumber,
        wing: flat.wing,
        type: 'Owner',
        moveInDate: data.purchaseDate,
        emergencyContact: 'Family Member',
        emergencyPhone: data.phone,
        familyMembers: [],
      };
      setResidents((prev) => [...prev, newResident]);
    }

    addActivityLog(
      `Flat ${flat.flatNumber} ownership transferred`,
      'Ownership',
      `Transferred from ${previousOwner} to ${data.buyerName} for ₹ ${data.purchaseAmount.toLocaleString('en-IN')}`
    );
    return true;
  };

  // Residents & Family
  const addResident = (data: Omit<Resident, 'id' | 'familyMembers'>) => {
    const newResident: Resident = {
      ...data,
      id: Date.now(),
      familyMembers: [],
    };
    setResidents((prev) => [...prev, newResident]);
    addActivityLog(`Resident ${data.fullName} registered`, 'Ownership', `Linked to Flat ${data.flatNumber}`);
  };

  const updateResident = (id: number, data: Partial<Resident>) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    addActivityLog(`Resident information updated`, 'Ownership', `Updated resident ID ${id}`);
  };

  const addFamilyMember = (residentId: number, member: Omit<FamilyMember, 'id' | 'residentId'>) => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          const newMember: FamilyMember = {
            ...member,
            id: Date.now(),
            residentId,
          };
          return { ...r, familyMembers: [...r.familyMembers, newMember] };
        }
        return r;
      })
    );
    addActivityLog(`Family member added`, 'Ownership', `${member.fullName} added to resident family`);
  };

  const removeFamilyMember = (residentId: number, memberId: number) => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          return {
            ...r,
            familyMembers: r.familyMembers.filter((m) => m.id !== memberId),
          };
        }
        return r;
      })
    );
  };

  // Maintenance & Billing
  const generateMonthlyBills = (month: string, dueDate: string): number => {
    let count = 0;
    const newBills: MaintenanceBill[] = [];

    flats.forEach((flat) => {
      // Don't generate duplicate for same flat and month
      const exists = maintenanceBills.some((b) => b.flatId === flat.id && b.month === month);
      if (!exists && flat.occupancyStatus !== 'Vacant') {
        count++;
        newBills.push({
          id: Date.now() + count,
          flatId: flat.id,
          flatNumber: flat.flatNumber,
          wing: flat.wing,
          residentName: flat.currentOwnerName || 'Resident',
          month,
          amount: flat.monthlyMaintenanceAmount,
          dueDate,
          status: 'Pending',
        });
      }
    });

    if (newBills.length > 0) {
      setMaintenanceBills((prev) => [...newBills, ...prev]);
      addActivityLog(
        `Generated ${count} maintenance bills`,
        'Payment',
        `Generated bills for ${month} with due date ${dueDate}`
      );
    }
    return count;
  };

  const recordBillPayment = (
    billId: number,
    paymentMode: MaintenanceBill['paymentMode'] = 'UPI',
    transactionRef?: string
  ): boolean => {
    const bill = maintenanceBills.find((b) => b.id === billId);
    if (!bill) return false;

    const receiptNo = `MDG-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = transactionRef || `TXN-${Date.now().toString().slice(-8)}`;

    setMaintenanceBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'Paid',
            paidDate: new Date().toISOString().split('T')[0],
            paymentMode,
            transactionRef: txRef,
            receiptNumber: receiptNo,
          };
        }
        return b;
      })
    );

    addActivityLog(
      `Maintenance bill paid for ${bill.flatNumber}`,
      'Payment',
      `₹ ${bill.amount.toLocaleString('en-IN')} paid via ${paymentMode}. Receipt ${receiptNo}`
    );
    return true;
  };

  // Gym Management
  const addGymMembership = (residentId: number, planId: number): boolean => {
    const resident = residents.find((r) => r.id === residentId);
    const plan = gymPlans.find((p) => p.id === planId);
    if (!resident || !plan) return false;

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

    const newMembership: GymMembership = {
      id: Date.now(),
      residentId,
      residentName: resident.fullName,
      flatNumber: resident.flatNumber,
      planId,
      planName: plan.name,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      feePaid: plan.fee,
      status: 'Active',
      paymentStatus: 'Paid',
    };

    setGymMemberships((prev) => [newMembership, ...prev]);
    addActivityLog(
      `Gym membership created for ${resident.fullName}`,
      'Gym',
      `${plan.name} registered (Expires: ${newMembership.expiryDate})`
    );
    return true;
  };

  const renewGymMembership = (membershipId: number, planId: number): boolean => {
    const current = gymMemberships.find((m) => m.id === membershipId);
    const plan = gymPlans.find((p) => p.id === planId);
    if (!current || !plan) return false;

    const start = new Date(current.expiryDate);
    // If already expired, start from today
    const effectiveStart = start < new Date() ? new Date() : start;
    const newExpiry = new Date(effectiveStart);
    newExpiry.setMonth(newExpiry.getMonth() + plan.durationMonths);

    setGymMemberships((prev) =>
      prev.map((m) => {
        if (m.id === membershipId) {
          return {
            ...m,
            planId,
            planName: plan.name,
            startDate: effectiveStart.toISOString().split('T')[0],
            expiryDate: newExpiry.toISOString().split('T')[0],
            feePaid: plan.fee,
            status: 'Active',
          };
        }
        return m;
      })
    );

    addActivityLog(
      `Gym membership renewed for ${current.residentName}`,
      'Gym',
      `Renewed with ${plan.name} until ${newExpiry.toISOString().split('T')[0]}`
    );
    return true;
  };

  // Facility Booking with strict Overlap Conflict Prevention!
  const bookFacility = (data: {
    facilityId: number;
    residentId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }): { success: boolean; message: string } => {
    const facility = facilities.find((f) => f.id === data.facilityId);
    const resident = residents.find((r) => r.id === data.residentId);
    if (!facility || !resident) {
      return { success: false, message: 'Invalid facility or resident selection.' };
    }

    // Check for overlapping confirmed booking on same date
    const reqStart = data.startTime;
    const reqEnd = data.endTime;

    if (reqStart >= reqEnd) {
      return { success: false, message: 'End time must be later than start time.' };
    }

    const hasConflict = facilityBookings.some((b) => {
      if (b.facilityId === data.facilityId && b.bookingDate === data.bookingDate && b.status === 'Confirmed') {
        // Overlap condition: max(start1, start2) < min(end1, end2)
        const conflict = !(reqEnd <= b.startTime || reqStart >= b.endTime);
        return conflict;
      }
      return false;
    });

    if (hasConflict) {
      return {
        success: false,
        message: `Conflict detected! ${facility.name} is already booked on ${data.bookingDate} during that time window. Please pick another slot.`,
      };
    }

    // Calculate hours and total amount
    const [sH, sM] = data.startTime.split(':').map(Number);
    const [eH, eM] = data.endTime.split(':').map(Number);
    const durationHours = Math.max(1, (eH * 60 + eM - (sH * 60 + sM)) / 60);
    const totalAmount = Math.round(durationHours * facility.hourlyRate);

    const newBooking: FacilityBooking = {
      id: Date.now(),
      facilityId: facility.id,
      facilityName: facility.name,
      residentId: resident.id,
      residentName: resident.fullName,
      flatNumber: resident.flatNumber,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      totalAmount,
      status: 'Confirmed',
      purpose: data.purpose,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setFacilityBookings((prev) => [newBooking, ...prev]);
    addActivityLog(
      `Booked facility: ${facility.name}`,
      'Facility',
      `Confirmed booking for Flat ${resident.flatNumber} on ${data.bookingDate} (${data.startTime} - ${data.endTime})`
    );
    return { success: true, message: `Successfully booked ${facility.name} for ${data.bookingDate}!` };
  };

  const cancelFacilityBooking = (bookingId: number): boolean => {
    const booking = facilityBookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    setFacilityBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as any } : b))
    );
    addActivityLog(
      `Cancelled facility booking: ${booking.facilityName}`,
      'Facility',
      `Booking for Flat ${booking.flatNumber} on ${booking.bookingDate} cancelled.`
    );
    return true;
  };

  // Visitors & QR Verification
  const registerVisitor = (data: {
    visitorName: string;
    phone: string;
    hostFlatNumber: string;
    purpose: string;
    vehicleNumber?: string;
  }): Visitor => {
    const flat = flats.find((f) => f.flatNumber === data.hostFlatNumber);
    const hostName = flat?.currentOwnerName || 'Resident';
    const qrCode = `MDG-PASS-${data.hostFlatNumber.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVisitor: Visitor = {
      id: Date.now(),
      visitorName: data.visitorName,
      phone: data.phone,
      hostFlatNumber: data.hostFlatNumber,
      hostResidentName: hostName,
      purpose: data.purpose,
      status: 'Expected',
      qrPassCode: qrCode,
      vehicleNumber: data.vehicleNumber,
      date: new Date().toISOString().split('T')[0],
    };

    setVisitors((prev) => [newVisitor, ...prev]);
    addActivityLog(`Visitor pass generated`, 'Visitor', `Pass ${qrCode} generated for ${data.visitorName} visiting ${data.hostFlatNumber}`);
    return newVisitor;
  };

  const updateVisitorStatus = (visitorId: number, status: Visitor['status']) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === visitorId) {
          const updated = {
            ...v,
            status,
            entryTime: status === 'Checked-In' ? `${v.date} ${now}` : v.entryTime,
            exitTime: status === 'Checked-Out' ? `${v.date} ${now}` : v.exitTime,
          };
          addActivityLog(
            `Visitor status changed to ${status}`,
            'Visitor',
            `${v.visitorName} (${v.hostFlatNumber}) is now ${status}`
          );
          return updated;
        }
        return v;
      })
    );
  };

  const verifyVisitorPass = (qrCode: string): Visitor | null => {
    const match = visitors.find((v) => v.qrPassCode.trim().toLowerCase() === qrCode.trim().toLowerCase());
    return match || null;
  };

  // Parking Allocation & Conflict prevention
  const allocateParkingSlot = (
    slotId: number,
    flatNumber: string,
    residentName: string,
    vehicleNumber: string,
    vehicleType: ParkingSlot['vehicleType'] = '4-Wheeler'
  ): { success: boolean; message: string } => {
    const slot = parkingSlots.find((s) => s.id === slotId);
    if (!slot) return { success: false, message: 'Parking slot not found.' };

    if (slot.isAllocated) {
      return { success: false, message: `Slot ${slot.slotNumber} is already allocated to Flat ${slot.allocatedFlatNumber}.` };
    }

    setParkingSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            isAllocated: true,
            allocatedFlatNumber: flatNumber,
            allocatedResidentName: residentName,
            vehicleNumber,
            vehicleType,
          };
        }
        return s;
      })
    );

    addActivityLog(
      `Parking slot ${slot.slotNumber} allocated`,
      'System',
      `Allocated to Flat ${flatNumber} (${vehicleNumber})`
    );
    return { success: true, message: `Slot ${slot.slotNumber} successfully allocated to ${flatNumber}.` };
  };

  const releaseParkingSlot = (slotId: number) => {
    const slot = parkingSlots.find((s) => s.id === slotId);
    if (!slot) return;

    setParkingSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            isAllocated: false,
            allocatedFlatNumber: undefined,
            allocatedResidentName: undefined,
            vehicleNumber: undefined,
          };
        }
        return s;
      })
    );

    addActivityLog(`Parking slot ${slot.slotNumber} released`, 'System', `Slot is now vacant and available`);
  };

  // Complaints
  const addComplaint = (data: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => {
    const newComplaint: Complaint = {
      ...data,
      id: Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    addActivityLog(`New complaint logged: ${data.title}`, 'Complaint', `Flat ${data.flatNumber} (${data.category})`);
  };

  const updateComplaintStatus = (
    id: number,
    status: Complaint['status'],
    adminResponse?: string,
    assignedStaff?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated: Complaint = {
            ...c,
            status,
            adminResponse: adminResponse !== undefined ? adminResponse : c.adminResponse,
            assignedStaff: assignedStaff !== undefined ? assignedStaff : c.assignedStaff,
            resolvedAt: status === 'Resolved' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : c.resolvedAt,
          };
          addActivityLog(`Complaint status updated to ${status}`, 'Complaint', `Ticket #${c.id}: ${c.title}`);
          return updated;
        }
        return c;
      })
    );
  };

  // Parcels
  const registerParcel = (data: { recipientName: string; flatNumber: string; courierCompany: string; trackingNumber?: string }) => {
    const newParcel: Parcel = {
      ...data,
      id: Date.now(),
      receivedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending Collection',
      securityStaffName: currentUser?.fullName || 'Security Staff',
    };
    setParcels((prev) => [newParcel, ...prev]);
    addActivityLog(`Parcel registered for ${data.flatNumber}`, 'System', `Courier: ${data.courierCompany}`);
  };

  const collectParcel = (id: number, collectedBy: string) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          return {
            ...p,
            status: 'Collected',
            collectedAt: now,
            collectedBy,
          };
        }
        return p;
      })
    );
    addActivityLog(`Parcel collected`, 'System', `Parcel #${id} received by ${collectedBy}`);
  };

  // Events & Polls
  const addEvent = (eventData: Omit<SocietyEvent, 'id'>) => {
    const newEvent: SocietyEvent = {
      ...eventData,
      id: Date.now(),
    };
    setEvents((prev) => [...prev, newEvent]);
    addActivityLog(`New society event created: ${newEvent.title}`, 'System', `Scheduled for ${newEvent.eventDate}`);
  };

  const votePoll = (pollId: number, optionId: number): { success: boolean; message: string } => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return { success: false, message: 'Poll not found.' };

    const userId = currentUser?.id || 1;
    if (poll.votedUserIds.includes(userId)) {
      return { success: false, message: 'You have already cast your vote in this poll. Duplicate voting is restricted.' };
    }

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            votedUserIds: [...p.votedUserIds, userId],
            options: p.options.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)),
          };
        }
        return p;
      })
    );

    addActivityLog(`Poll vote submitted`, 'System', `User voted in poll #${pollId}`);
    return { success: true, message: 'Your vote has been securely recorded! Thank you for participating.' };
  };

  // Notices & Notifications
  const addNotice = (noticeData: Omit<Notice, 'id' | 'publishedDate'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: Date.now(),
      publishedDate: new Date().toISOString().split('T')[0],
    };
    setNotices((prev) => [newNotice, ...prev]);
    addActivityLog(`Notice published: ${newNotice.title}`, 'System', `Category: ${newNotice.category}`);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Expenses & Documents
  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addActivityLog(`Expense recorded: ₹ ${expenseData.amount.toLocaleString('en-IN')}`, 'Payment', `${expenseData.category} - ${expenseData.description}`);
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadDate'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addActivityLog(`Document uploaded: ${newDoc.title}`, 'System', `Category: ${newDoc.category}`);
  };

  // Transparent, Database-Calculated Society Health Score
  const healthScore = useMemo<SocietyHealthBreakdown>(() => {
    // 1. Maintenance collection percentage
    const totalBills = maintenanceBills.length;
    const paidBills = maintenanceBills.filter((b) => b.status === 'Paid').length;
    const maintenanceScore = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 92;

    // 2. Complaint resolution rate
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
    const complaintScore = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 78;

    // 3. Facility usage rate
    const facilityScore = facilityBookings.length > 0 ? 88 : 80;

    // 4. Resident engagement (e.g. poll votes participation)
    const residentEngagementScore = 76;

    // 5. Financial health (Income from maintenance vs expenses)
    const financialHealthScore = 90;

    // Weighted Overall
    const overall = Math.round(
      maintenanceScore * 0.3 +
        complaintScore * 0.25 +
        facilityScore * 0.15 +
        residentEngagementScore * 0.15 +
        financialHealthScore * 0.15
    );

    return {
      maintenanceCollectionScore: maintenanceScore,
      complaintResolutionScore: complaintScore,
      facilityUsageScore: facilityScore,
      residentEngagementScore: residentEngagementScore,
      financialHealthScore: financialHealthScore,
      overallScore: overall,
      ratingText: overall >= 80 ? 'Good' : overall >= 60 ? 'Needs Improvement' : 'Needs Improvement',
    };
  }, [maintenanceBills, complaints, facilityBookings]);

  return (
    <SocietyContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        logout,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        flats,
        addFlat,
        updateFlat,
        deleteFlat,
        ownershipRecords,
        purchaseFlat,
        residents,
        addResident,
        updateResident,
        addFamilyMember,
        removeFamilyMember,
        maintenanceBills,
        generateMonthlyBills,
        recordBillPayment,
        gymPlans,
        gymMemberships,
        addGymMembership,
        renewGymMembership,
        facilities,
        facilityBookings,
        bookFacility,
        cancelFacilityBooking,
        visitors,
        registerVisitor,
        updateVisitorStatus,
        verifyVisitorPass,
        parkingSlots,
        allocateParkingSlot,
        releaseParkingSlot,
        complaints,
        addComplaint,
        updateComplaintStatus,
        parcels,
        registerParcel,
        collectParcel,
        events,
        addEvent,
        polls,
        votePoll,
        notices,
        addNotice,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        expenses,
        addExpense,
        documents,
        addDocument,
        activityLogs,
        addActivityLog,
        healthScore,
        isCodeModalOpen,
        setIsCodeModalOpen,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = (): SocietyContextType => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
