
import { UserTier, UserRole, UserProfile, Post, Transaction, DirectMessage } from './types';

export const APP_NAME = "Edcall";
export const CURRENCY = "TZS";
export const ADMIN_WHATSAPP = "255621275922";

export const ADMIN_MOBILE_MONEY = {
  'AIRTEL-MONEY': '0757232716 (EDSON SADICK)',
  'M-PESA': '0757232716 (GRACE KILEKA)',
  'HALOPESA': '0621275922 (EDSON SADICK)',
  'TIGO-PESA': '0655333444',
};

export const ADMIN_PAYMENT_NAME = "EDSON SADICK";

export const PRICES = {
  MONTHLY: 25000,
  WEEKLY: 5000,
  PER_MINUTE: 500,
  PROFILE_BOOST: 3000,
};

export const EARNING_RATES = {
  DAILY_LOGIN: 50,
  COMPLETE_PROFILE: 500,
  COMPLETED_CALL: 200,
  SUCCESSFUL_MATCH: 100,
  REFERRAL: 1000,
  CONTENT_CREATION: 300,
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'admin-001',
    name: 'Edson Sadick',
    age: 35,
    bio: 'Official Edcall Admin.',
    location: 'Dodoma',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop',
    interests: ['Security', 'Management'],
    isOnline: true,
    tier: UserTier.PREMIUM,
    role: UserRole.ADMIN,
    points: 0,
    trialCallsRemaining: 0,
    joinedAt: '2023-01-01',
    lastLogin: '2024-05-20',
    completionPercentage: 100,
    followingIds: [],
    isBlocked: false
  },
  {
    id: '1',
    name: 'Neema K.',
    age: 24,
    bio: 'Art lover from Dar es Salaam. Looking for someone adventurous.',
    location: 'Dar es Salaam',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop',
    interests: ['Art', 'Beaches', 'Music'],
    isOnline: true,
    tier: UserTier.FREE,
    role: UserRole.USER,
    points: 1200,
    trialCallsRemaining: 3,
    joinedAt: '2024-01-15',
    lastLogin: '2024-05-20',
    completionPercentage: 85,
    followingIds: ['2'],
    isBlocked: false
  },
  {
    id: '2',
    name: 'Juma M.',
    age: 29,
    bio: 'Tech entrepreneur. I love coding and hiking.',
    location: 'Arusha',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop',
    interests: ['Tech', 'Hiking', 'Coffee'],
    isOnline: true,
    tier: UserTier.PREMIUM,
    role: UserRole.USER,
    points: 4500,
    trialCallsRemaining: 0,
    joinedAt: '2023-11-10',
    lastLogin: '2024-05-20',
    completionPercentage: 100,
    followingIds: [],
    isBlocked: false
  },
  {
    id: 'u102',
    name: 'Zuri',
    age: 25,
    bio: 'Zanzibar Queen 🏝️',
    location: 'Zanzibar',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=500&auto=format&fit=crop',
    interests: ['Beach', 'Cooking'],
    isOnline: false,
    tier: UserTier.PREMIUM,
    role: UserRole.USER,
    points: 1500,
    trialCallsRemaining: 0,
    joinedAt: '2024-02-15',
    lastLogin: '2024-05-19',
    completionPercentage: 100,
    isBlocked: false
  },
  {
    id: 'u104',
    name: 'Sifa',
    age: 27,
    bio: 'Adventure seeker in Arusha.',
    location: 'Arusha',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=500&auto=format&fit=crop',
    interests: ['Hiking', 'Nature'],
    isOnline: true,
    tier: UserTier.FREE,
    role: UserRole.USER,
    points: 800,
    trialCallsRemaining: 1,
    joinedAt: '2024-03-10',
    lastLogin: '2024-05-20',
    completionPercentage: 95,
    isBlocked: false
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: '1',
    userName: 'Neema K.',
    amount: 5000,
    currency: 'TZS',
    type: 'WEEKLY_PASS',
    status: 'COMPLETED',
    provider: 'M-PESA',
    timestamp: '2024-05-18T10:30:00Z',
    reference: 'MP8214X991'
  },
  {
    id: 'tx-2',
    userId: '2',
    userName: 'Juma M.',
    amount: 25000,
    currency: 'TZS',
    type: 'SUBSCRIPTION',
    status: 'COMPLETED',
    provider: 'TIGO-PESA',
    timestamp: '2024-05-19T14:20:00Z',
    reference: 'TP1212K112'
  },
  {
    id: 'tx-3',
    userId: '1',
    userName: 'Neema K.',
    amount: 3000,
    currency: 'TZS',
    type: 'MINUTES_PURCHASE',
    status: 'PENDING',
    provider: 'HALOPESA',
    timestamp: '2024-05-20T09:15:00Z',
    reference: 'HP9910Z221'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p2',
    userId: 'u102',
    userName: 'Zuri',
    userPhoto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop',
    content: 'Sunset in Zanzibar is pure magic. ✨ Finding peace and maybe someone to share it with.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200&auto=format&fit=crop',
    likes: 3450,
    comments: 156,
    timestamp: '5 hours ago',
    isHot: true,
    visibility: 'PUBLIC',
    featured: true
  },
  {
    id: 'p4',
    userId: 'u104',
    userName: 'Sifa',
    userPhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    content: 'Golden hour in Arusha. Hiking always clears my mind. Who\'s up for an adventure this weekend?',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
    likes: 890,
    comments: 24,
    timestamp: '10 mins ago',
    isHot: false,
    visibility: 'PUBLIC',
    featured: false
  },
  {
    id: 'p5',
    userId: '2',
    userName: 'Juma M.',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    content: 'Coffee and code in Arusha. Anyone nearby who loves tech? Let\'s chat! 💻☕',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
    likes: 560,
    comments: 12,
    timestamp: '3 hours ago',
    isHot: false,
    visibility: 'PUBLIC',
    featured: false
  }
];

export const MOCK_DMS: DirectMessage[] = [
  {
    id: 'dm1',
    senderId: '2',
    receiverId: '1',
    text: 'Habari Neema! Nimependa profile yako.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  },
  {
    id: 'dm2',
    senderId: '1',
    receiverId: '2',
    text: 'Asante Juma! Karibu tuchati.',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    isRead: true
  }
];
