import { Episode, VirtualBackgroundOption, LiveViewerStats, LiveComment, NotificationAlert } from '../types';

export const INITIAL_EPISODES: Episode[] = [
  {
    id: 'ep-48',
    title: 'The Anointing for Marketplace Multiplication & Spiritual Governance',
    series: 'Kingdom Enterprise & Apostolic Leadership',
    episodeNumber: 48,
    publishDate: 'September 10, 2026',
    duration: '44:18',
    durationSeconds: 2658,
    description: 'Dr. Caleb Freeman and guest Dr. Elijah Vance explore the biblical mandate for kingdom disciples to build institutions that solve systemic global problems, anchor wealth ethically, and manifest divine governance.',
    host: 'Dr. Caleb Freeman',
    guest: 'Dr. Elijah Vance (Kingdom Wealth Institute)',
    type: 'video',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=inspirational-background-112290.mp3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Marketplace', 'Enterprise', 'Leadership', 'Purpose', 'Spiritual Authority'],
    featured: true,
    isNew: true,
    keyTakeaways: [
      'Deuteronomy 8:18 reveals power to get wealth is not for ego, but to establish His covenant.',
      'Apostolic marketplace leaders view their companies as mission fields and economic sanctuaries.',
      'Multiplication requires internal character calibration before external capital expansion.',
      'Strategic prayer and fasting dismantle spiritual gates hindering regional business breakthroughs.'
    ],
    scriptureReferences: [
      { reference: 'Deuteronomy 8:18', text: 'And you shall remember the LORD your God, for it is He who gives you power to get wealth, that He may establish His covenant.' },
      { reference: 'Isaiah 60:1-3', text: 'Arise, shine; For your light has come! And the glory of the LORD is risen upon you.' },
      { reference: 'Proverbs 16:3', text: 'Commit your works to the LORD, and your thoughts will be established.' }
    ],
    networkLinks: {
      applePodcasts: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      spotify: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      youtubeMusic: 'https://music.youtube.com/channel/UC-cgfkingdomgrowth',
      amazonMusic: 'https://music.amazon.com/podcasts/cgf-kingdom-growth',
      overcast: 'https://overcast.fm/itunes1689000001',
      pocketCasts: 'https://pca.st/cgfkingdomgrowth',
      rssFeed: 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
    },
    transcript: [
      {
        id: 't-1',
        timestamp: 0,
        timeFormatted: '00:00',
        speaker: 'Dr. Caleb Freeman',
        text: 'Welcome beloved family to the CGF Kingdom Growth Podcast. Today is a watershed moment for every leader who has felt the Holy Spirit prompting them to step out of comfortable religious borders into high-impact marketplace territory.',
        isKeyPoint: false
      },
      {
        id: 't-2',
        timestamp: 25,
        timeFormatted: '00:25',
        speaker: 'Dr. Caleb Freeman',
        text: 'I am joined in the studio today by Dr. Elijah Vance, founding dean of the Kingdom Wealth Institute and a global venture builder who has mentored hundreds of founders in over forty nations.',
        isKeyPoint: false
      },
      {
        id: 't-3',
        timestamp: 52,
        timeFormatted: '00:52',
        speaker: 'Dr. Elijah Vance',
        text: 'Caleb, it is an honor. When we look at Scripture, God never segregated the spiritual from the civic or economic. Joseph ruled in Egypt; Daniel governed in Babylon; Nehemiah was the chief cupbearer before rebuilding Jerusalem’s walls.',
        isKeyPoint: true,
        scriptureRef: 'Genesis 41:40'
      },
      {
        id: 't-4',
        timestamp: 88,
        timeFormatted: '01:28',
        speaker: 'Dr. Caleb Freeman',
        text: 'Let us examine Deuteronomy 8:18. "You shall remember the LORD your God, for it is He who gives you power to get wealth, that He may establish His covenant." Elijah, explain the difference between commercial hustle and kingdom empowerment.',
        isKeyPoint: true,
        scriptureRef: 'Deuteronomy 8:18'
      },
      {
        id: 't-5',
        timestamp: 130,
        timeFormatted: '02:10',
        speaker: 'Dr. Elijah Vance',
        text: 'Commercial hustle operates in anxiety, scarcity, and self-glorification. Kingdom empowerment operates from Sonship, divine rest, and covenant faithfulness. When God gives capacity for multiplication, the purpose is always territorial transformation.',
        isKeyPoint: true
      },
      {
        id: 't-6',
        timestamp: 185,
        timeFormatted: '03:05',
        speaker: 'Dr. Caleb Freeman',
        text: 'What are the first three indicators that a believer is entering their appointed marketplace assignment?',
        isKeyPoint: false
      },
      {
        id: 't-7',
        timestamp: 215,
        timeFormatted: '03:35',
        speaker: 'Dr. Elijah Vance',
        text: 'First, a holy discontent with superficial impact. Second, unusual divine intelligence or favor solving stubborn problems. Third, an unwavering commitment to integrity even when compromise promises quick millions.',
        isKeyPoint: true
      },
      {
        id: 't-8',
        timestamp: 270,
        timeFormatted: '04:30',
        speaker: 'Dr. Caleb Freeman',
        text: 'Praise God. If you are watching or listening on your commute right now, tap the bookmark button. We are about to unpack the spiritual blueprints for venture multiplication.',
        isKeyPoint: false
      }
    ]
  },
  {
    id: 'ep-47',
    title: 'The Secret Place: Cultivating Unshakable Intimacy Amid Fast-Paced Growth',
    series: 'Spiritual Foundations & Inner Life',
    episodeNumber: 47,
    publishDate: 'September 03, 2026',
    duration: '38:12',
    durationSeconds: 2292,
    description: 'Pastor Grace Adebayo unpacks Psalm 91 and Matthew 6, demonstrating why outward organizational expansion without deep secret place communion leads to spiritual burnout and compromised vision.',
    host: 'Pastor Grace Adebayo',
    type: 'audio',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=piano-moment-9835.mp3',
    coverImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    tags: ['Prayer', 'Intimacy', 'Rest', 'Holiness', 'Spiritual Life'],
    featured: true,
    isNew: false,
    keyTakeaways: [
      'Your public fruit cannot sustainably outgrow your private root system.',
      'Sabbath is not mere inactivity; it is a declaration that God is Sovereign, not our striving.',
      'The highest form of warfare for a kingdom builder is remaining anchored in worship.'
    ],
    scriptureReferences: [
      { reference: 'Psalm 91:1', text: 'He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.' },
      { reference: 'Matthew 6:6', text: 'But you, when you pray, go into your room, and when you have shut your door, pray to your Father who is in the secret place.' }
    ],
    networkLinks: {
      applePodcasts: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      spotify: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      youtubeMusic: 'https://music.youtube.com/channel/UC-cgfkingdomgrowth',
      amazonMusic: 'https://music.amazon.com/podcasts/cgf-kingdom-growth',
      rssFeed: 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
    },
    transcript: [
      {
        id: 't-11',
        timestamp: 0,
        timeFormatted: '00:00',
        speaker: 'Pastor Grace Adebayo',
        text: 'Grace and peace to everyone tuning in today. Today we are stripping away the noise of notifications, calendars, and organizational metrics to ask a penetrating question: how is your secret place?',
        isKeyPoint: false
      },
      {
        id: 't-12',
        timestamp: 34,
        timeFormatted: '00:34',
        speaker: 'Pastor Grace Adebayo',
        text: 'In Psalm 91 verse 1, David reveals: "He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty." Notice the word "dwells". It is not a hurried five-minute visitation on your way to an executive board meeting.',
        isKeyPoint: true,
        scriptureRef: 'Psalm 91:1'
      },
      {
        id: 't-13',
        timestamp: 75,
        timeFormatted: '01:15',
        speaker: 'Pastor Grace Adebayo',
        text: 'When we study the life of Christ in Luke 5:16, Jesus often withdrew into the wilderness to pray—precisely when the crowds and demands on His ministry were at their peak.',
        isKeyPoint: true,
        scriptureRef: 'Luke 5:16'
      },
      {
        id: 't-14',
        timestamp: 120,
        timeFormatted: '02:00',
        speaker: 'Pastor Grace Adebayo',
        text: 'If your output exceeds your intake, your exhaustion will become your theology. Let the Holy Spirit recharge your spirit this morning.',
        isKeyPoint: true
      }
    ]
  },
  {
    id: 'ep-46',
    title: 'Discipling the Next Generation: Raising Kingdom Giants in Culture and Tech',
    series: 'Family & Generational Legacy',
    episodeNumber: 46,
    publishDate: 'August 27, 2026',
    duration: '49:30',
    durationSeconds: 2970,
    description: 'A deep panel discussion on preparing our youth to be innovators, artificial intelligence ethicists, artists, and culture shapers while walking in uncompromised biblical conviction.',
    host: 'Dr. Caleb Freeman',
    guest: 'Minister Sarah K. & Tech Founder Marcus Chen',
    type: 'video',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=inspiring-emotional-uplifting-piano-122681.mp3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    tags: ['NextGen', 'Technology', 'AI', 'Generational Legacy', 'Culture'],
    featured: false,
    isNew: false,
    keyTakeaways: [
      'We cannot simply complain about corrupt culture; we must commission creative sons and daughters to out-innovate Babylon.',
      'Generational wealth includes wisdom, spiritual heritage, emotional health, and financial stewardship.',
      'Equipping youth with biblical worldview discernment before they enter university campuses.'
    ],
    scriptureReferences: [
      { reference: 'Psalm 127:4-5', text: 'Like arrows in the hand of a warrior, so are the children of one’s youth. Happy is the man who has his quiver full of them.' },
      { reference: '2 Timothy 2:2', text: 'And the things that you have heard from me among many witnesses, commit these to faithful men who will be able to teach others also.' }
    ],
    networkLinks: {
      applePodcasts: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      spotify: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      youtubeMusic: 'https://music.youtube.com/channel/UC-cgfkingdomgrowth',
      rssFeed: 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
    },
    transcript: [
      {
        id: 't-21',
        timestamp: 0,
        timeFormatted: '00:00',
        speaker: 'Dr. Caleb Freeman',
        text: 'Every civilization is only one generation away from apostasy or reformation. Today we discuss our sacred assignment: preparing our youth to lead in technology, media, governance, and the sciences.',
        isKeyPoint: false
      },
      {
        id: 't-22',
        timestamp: 40,
        timeFormatted: '00:40',
        speaker: 'Marcus Chen',
        text: 'Caleb, in the Silicon Valley and fintech corridors, young people are developing artificial general intelligence models and synthetic biology tools. If the Church retreats, we abdicate ethical leadership to godless worldviews.',
        isKeyPoint: true
      },
      {
        id: 't-23',
        timestamp: 95,
        timeFormatted: '01:35',
        speaker: 'Minister Sarah K.',
        text: 'Our children do not need religious sheltering that breeds cowardice; they need biblical fortifying that raises Daniels who can excel in the King’s court while refusing the defiling table.',
        isKeyPoint: true,
        scriptureRef: 'Daniel 1:8'
      }
    ]
  },
  {
    id: 'ep-45',
    title: 'The Blueprint for Territorial Awakening: Prayer Altars in Cities',
    series: 'Kingdom Enterprise & Apostolic Leadership',
    episodeNumber: 45,
    publishDate: 'August 20, 2026',
    duration: '52:10',
    durationSeconds: 3130,
    description: 'Exploring historical revivals and practical kingdom principles for establishing 24/7 prayer shields, unity across denominations, and healing broken neighborhoods.',
    host: 'Dr. Caleb Freeman',
    type: 'audio',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
    tags: ['Revival', 'Intercession', 'Cities', 'Transformation', 'Unity'],
    featured: false,
    isNew: false,
    keyTakeaways: [
      'Territorial authority requires corporate unity; fractured churches cannot heal fractured cities.',
      'Establishing persistent prayer altars changes the atmospheric spiritual climate over regions.',
      'Compassion ministries must accompany apostolic proclamation.'
    ],
    scriptureReferences: [
      { reference: '2 Chronicles 7:14', text: 'If My people who are called by My name will humble themselves, and pray and seek My face, and turn from their wicked ways, then I will hear from heaven.' },
      { reference: 'Jeremiah 29:7', text: 'And seek the peace of the city where I have caused you to be carried away captive, and pray to the LORD for it; for in its peace you will have peace.' }
    ],
    networkLinks: {
      applePodcasts: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      spotify: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      rssFeed: 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
    },
    transcript: [
      {
        id: 't-31',
        timestamp: 0,
        timeFormatted: '00:00',
        speaker: 'Dr. Caleb Freeman',
        text: 'History does not belong to the loudest political pundits; history belongs to the intercessors who refuse to let go of the horns of the altar until Heaven responds.',
        isKeyPoint: true
      },
      {
        id: 't-32',
        timestamp: 45,
        timeFormatted: '00:45',
        speaker: 'Dr. Caleb Freeman',
        text: 'When we study the Hebrides revival or the Welsh awakening, it did not begin with giant advertising campaigns. It began with humble saints praying in barns at 2 AM.',
        isKeyPoint: true
      }
    ]
  },
  {
    id: 'ep-44',
    title: 'Divine Health, Emotional Wholeness, and Resilience Under Fire',
    series: 'Spiritual Foundations & Inner Life',
    episodeNumber: 44,
    publishDate: 'August 13, 2026',
    duration: '41:05',
    durationSeconds: 2465,
    description: 'Navigating grief, trauma, emotional fatigue, and physical vitality through the finished work of the Cross and practical holistic health wisdom.',
    host: 'Pastor Grace Adebayo',
    type: 'audio',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    tags: ['Healing', 'Wholeness', 'Mental Health', 'Resilience', 'Faith'],
    featured: false,
    isNew: false,
    keyTakeaways: [
      'God desires that you prosper and be in health just as your soul prospers (3 John 1:2).',
      'Unforgiveness is spiritual arsenic; release offenders to walk in cellular and emotional healing.',
      'Holy Spirit comfort is experiential and immediate when we cast all cares upon Him.'
    ],
    scriptureReferences: [
      { reference: '3 John 1:2', text: 'Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.' },
      { reference: 'Philippians 4:6-7', text: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.' }
    ],
    networkLinks: {
      applePodcasts: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      spotify: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      rssFeed: 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
    },
    transcript: [
      {
        id: 't-41',
        timestamp: 0,
        timeFormatted: '00:00',
        speaker: 'Pastor Grace Adebayo',
        text: 'Too many passionate believers are limping through life with unhealed wounds in their emotions while trying to fight spiritual battles on empty tanks.',
        isKeyPoint: true
      },
      {
        id: 't-42',
        timestamp: 40,
        timeFormatted: '00:40',
        speaker: 'Pastor Grace Adebayo',
        text: 'Jesus did not only take your sins at Calvary; Isaiah 53 says by His stripes we are healed, and the chastisement for our peace was upon Him.',
        isKeyPoint: true,
        scriptureRef: 'Isaiah 53:5'
      }
    ]
  }
];

export const VIRTUAL_BACKGROUND_PRESETS: VirtualBackgroundOption[] = [
  {
    id: 'studio-gold',
    name: 'CGF Kingdom Studio',
    type: 'preset',
    previewUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm obsidian acoustic studio with gold backlight'
  },
  {
    id: 'bookshelf-library',
    name: 'Scholars Library',
    type: 'preset',
    previewUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    description: 'Mahogany bookshelves with theological texts and warm ambient lamp'
  },
  {
    id: 'cathedral-dawn',
    name: 'Cathedral Sanctuary',
    type: 'preset',
    previewUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1200&q=80',
    description: 'Glorious dawn light pouring through arches and stone pillars'
  },
  {
    id: 'city-penthouse',
    name: 'Kingdom Boardroom',
    type: 'preset',
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Modern glass metropolitan skyline overlooking global city centers'
  },
  {
    id: 'soft-blur',
    name: 'Studio Soft Blur',
    type: 'blur',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'Soft gaussian aesthetic blur focusing on presenter'
  }
];

export const INITIAL_LIVE_STATS: LiveViewerStats = {
  isLive: true,
  currentViewers: 3482,
  peakViewers: 4120,
  streamTitle: 'CGF Kingdom Live: Global Apostolic Gathering & Prayer for the Nations',
  streamHost: 'Dr. Caleb Freeman & Pastor Grace Adebayo',
  startedAt: '45 mins ago',
  countriesCount: 52,
  topRegions: [
    { region: 'United States & Canada', viewers: 1420, flag: '🇺🇸' },
    { region: 'United Kingdom & Europe', viewers: 890, flag: '🇬🇧' },
    { region: 'Nigeria & West Africa', viewers: 670, flag: '🇳🇬' },
    { region: 'South Africa & East Africa', viewers: 310, flag: '🇿🇦' },
    { region: 'Asia-Pacific & Australia', viewers: 192, flag: '🇦🇺' }
  ],
  engagementRate: '96.4%'
};

export const INITIAL_LIVE_COMMENTS: LiveComment[] = [
  {
    id: 'c-1',
    author: 'Pastor Emmanuel K.',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    message: 'Amen! That declaration on economic governance hit home. We are standing in agreement from London!',
    timestamp: 'Just now',
    reactionCount: 24
  },
  {
    id: 'c-2',
    author: 'Sis. Abigail Vance',
    location: 'Atlanta, USA',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
    message: 'Please pray for our startup team—we are launching a kingdom healthcare clinic next month.',
    timestamp: '1m ago',
    isPrayerRequest: true,
    reactionCount: 58
  },
  {
    id: 'c-3',
    author: 'Elder Tunde O.',
    location: 'Lagos, Nigeria',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    message: 'Grace multiplying! The audio and video stream clarity is crystal clear today. Glory to God!',
    timestamp: '2m ago',
    reactionCount: 19
  },
  {
    id: 'c-4',
    author: 'Grace M.',
    location: 'Toronto, Canada',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    message: 'Deuteronomy 8:18 is anchored in our hearts forever. Watching with our whole family.',
    timestamp: '3m ago',
    reactionCount: 31
  }
];

export const INITIAL_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: 'n-1',
    title: 'New Episode Released: Episode 48',
    message: 'The Anointing for Marketplace Multiplication & Spiritual Governance with Dr. Caleb Freeman & Dr. Elijah Vance is now live!',
    timestamp: '15 mins ago',
    type: 'new_episode',
    read: false,
    linkEpisodeId: 'ep-48'
  },
  {
    id: 'n-2',
    title: 'Live Global Broadcast in Progress',
    message: 'Global Apostolic Gathering & Prayer for the Nations is streaming live right now with 3,400+ saints.',
    timestamp: '45 mins ago',
    type: 'live_webcast',
    read: false
  },
  {
    id: 'n-3',
    title: 'Automated Cloud Backup Successful',
    message: 'Your live commentary session on "Cultivating Unshakable Intimacy" backed up to CGF Cloud Storage.',
    timestamp: '2 hours ago',
    type: 'cloud_backup',
    read: true
  }
];
