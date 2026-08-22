import { ProjectItem, CertificateItem, ServiceItem, SkillCategory, TimelineItem, VaultFolderItem, VaultFileItem, MediaLinkItem, MediaPlatform, MediaType } from '../types';

export const PERSONAL_CONFIG = {
  name: 'Ahmmad Sakib',
  firstName: 'Ahmmad',
  lastName: 'Sakib',
  role: 'Developer • Designer • Problem Solver',
  shortBio: 'I build modern, fast and secure digital experiences with clean code and creative design.',
  fullBio: `I am a dedicated software engineer and creative designer passionate about building high-performance web applications, interactive 3D digital architectures, and scalable cloud systems. With a strong foundation in modern frontend ecosystems and secure backend architecture, I merge engineering precision with cinematic user interface design.`,
  location: 'Dhaka, Bangladesh / Remote Worldwide',
  email: 'ahmmadsakib18524@gmail.com',
  availability: 'Available for Select Contracts & High-Impact Projects',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  cvDownloadUrl: '#download-cv',
  ownerEmail: 'ahmmadsakib18524@gmail.com', // System owner primary email
  ownerEmails: [
    'ahmmadsakib18524@gmail.com',
    'farhanthaqib@gmail.com'
  ],
};

export const isAuthorizedOwnerEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === PERSONAL_CONFIG.ownerEmail.toLowerCase() ||
    PERSONAL_CONFIG.ownerEmails.some(e => e.toLowerCase() === clean)
  );
};

export const STATS_CONFIG = [
  {
    id: 'projects',
    value: '0+',
    label: 'Projects Completed',
    icon: 'LayoutGrid',
    subtext: 'Production web, app & 3D apps'
  },
  {
    id: 'clients',
    value: '0',
    label: 'Happy Clients',
    icon: 'Users',
    subtext: 'Global collaborators & startups'
  },
  {
    id: 'experience',
    value: '0',
    label: 'Years Experience',
    icon: 'Award',
    subtext: 'Full-stack & interface engineering'
  },
  {
    id: 'technologies',
    value: '0',
    label: 'Technologies Used',
    icon: 'Cpu',
    subtext: 'Frameworks, clouds & 3D runtimes'
  }
];

export const SERVICES_CONFIG: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Engineering responsive, lightning-fast web applications with modern architectures, clean codebases, and robust security.',
    iconName: 'Code2',
    features: ['React & Next.js Architecture', 'Type-Safe TypeScript Codebases', 'Serverless & Cloud API Integrations', 'SEO & Core Web Vitals Optimization']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'Crafting intuitive, human-centered digital experiences with mathematical typography, cohesive color systems, and fluid ergonomics.',
    iconName: 'PenTool',
    features: ['High-Fidelity Prototyping', 'Design Systems & Component Libraries', 'Micro-Interactions & Motion Design', 'Accessibility (WCAG AA Compliance)']
  },
  {
    id: 'three-d',
    title: '3D & Animation',
    description: 'Immersive WebGL and Three.js visual dimensions that elevate digital storytelling without sacrificing device performance.',
    iconName: 'Box',
    features: ['Interactive Three.js / R3F Scenes', 'Shader & Geometry Programming', 'Smooth Scroll-Triggered Timelines', 'Optimized Low-Poly 3D Assets']
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving',
    description: 'Deconstructing complex engineering bottlenecks, optimizing algorithms, and engineering resilient solutions for mission-critical apps.',
    iconName: 'Lightbulb',
    features: ['Full-Stack Performance Audits', 'Database Query Optimization', 'Cloud Scalability Architecture', 'Secure Zero-Trust Workflows']
  },
  {
    id: 'project-mgmt',
    title: 'Project Management',
    description: 'Guiding technical roadmaps from initial napkin wireframe to production deployment with agile milestones and transparent delivery.',
    iconName: 'Rocket',
    features: ['Agile Sprint Planning', 'Continuous Integration / CD Pipelines', 'Technical Documentation & Architecture Specs', 'Cross-Functional Team Collaboration']
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React 19 & Next.js', level: 'Mastery' },
      { name: 'TypeScript', level: 'Mastery' },
      { name: 'Tailwind CSS', level: 'Mastery' },
      { name: 'Motion / GSAP', level: 'Advanced' },
      { name: 'HTML5 / Modern Web APIs', level: 'Mastery' }
    ]
  },
  {
    category: 'Backend & Cloud',
    skills: [
      { name: 'Node.js & Express', level: 'Mastery' },
      { name: 'Firebase & Firestore', level: 'Advanced' },
      { name: 'PostgreSQL & Cloud SQL', level: 'Advanced' },
      { name: 'REST & GraphQL APIs', level: 'Mastery' },
      { name: 'Docker & Containerization', level: 'Proficient' }
    ]
  },
  {
    category: 'AI & Intelligence',
    skills: [
      { name: 'Google Gemini SDK', level: 'Advanced' },
      { name: 'LLM Prompt Engineering', level: 'Advanced' },
      { name: 'RAG & Vector Embeddings', level: 'Proficient' },
      { name: 'AI Workflow Integration', level: 'Advanced' }
    ]
  },
  {
    category: '3D & Creative Tech',
    skills: [
      { name: 'Three.js / WebGL', level: 'Advanced' },
      { name: 'React Three Fiber & Drei', level: 'Advanced' },
      { name: 'GLSL Shaders & Lighting', level: 'Proficient' },
      { name: 'Blender 3D Modeling', level: 'Proficient' }
    ]
  },
  {
    category: 'Tools & DevOps',
    skills: [
      { name: 'Git & GitHub Workflows', level: 'Mastery' },
      { name: 'Vite & Webpack', level: 'Mastery' },
      { name: 'Figma & UI Systems', level: 'Advanced' },
      { name: 'CI/CD Pipelines', level: 'Proficient' },
      { name: 'Linux & Cloud Run', level: 'Advanced' }
    ]
  }
];

export const TIMELINE_CONFIG: TimelineItem[] = [
  {
    id: 't-1',
    year: '2023 — Present',
    title: 'Lead Frontend & 3D Interactive Engineer',
    institution: 'Digital Headquarters & High-Tech Projects',
    description: 'Spearheading modern client-side architectures, spatial 3D user experiences, and secure digital vault infrastructures.',
    type: 'Experience'
  },
  {
    id: 't-2',
    year: '2021 — 2023',
    title: 'Full Stack Software Engineer',
    institution: 'Technology Solutions & Creative Lab',
    description: 'Designed type-safe React applications, cloud databases, serverless microservices, and design systems for international clients.',
    type: 'Experience'
  },
  {
    id: 't-3',
    year: '2019 — 2023',
    title: 'B.Sc. in Computer Science & Engineering',
    institution: 'University of Engineering and Technology',
    description: 'Graduated with strong foundations in Data Structures, Algorithms, Distributed Computing, Software Architecture and Computer Graphics.',
    type: 'Education'
  },
  {
    id: 't-4',
    year: '2024',
    title: 'Digital Vault & Zero-Trust Cloud Architecture',
    institution: 'Independent Research & Deployment',
    description: 'Architected an encrypted digital vault with role-based Firestore access controls and multi-tier authorization layers.',
    type: 'Achievements'
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'AI Neural Assistant & Autonomous Agent',
    slug: 'ai-neural-assistant',
    category: 'AI',
    description: 'A full-stack contextual AI assistant powered by Gemini with multimodal processing and server-side safety layers.',
    longDescription: 'Engineered an end-to-end intelligent agent with natural conversation memory, codebase analysis, and real-time streaming interfaces framed in a dark cyber aesthetic. Features dynamic source citations and granular zero-trust context filtration.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['React 19', 'Gemini 3.7', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python'],
    demoUrl: 'https://demo.example.com/ai-neural',
    githubUrl: 'https://github.com/sakib/ai-neural-assistant',
    featured: true,
    visibility: 'PUBLIC',
    createdAt: '2026-05-12T10:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
    order: 1
  },
  {
    id: 'proj-2',
    title: 'Cyber E-Commerce & Luxury Marketplace',
    slug: 'cyber-ecommerce-marketplace',
    category: 'WEB',
    description: 'High-performance headless e-commerce store with zero layout shift, real-time inventory management, and smooth cart transitions.',
    longDescription: 'Created a customized digital retail experience for designer tech apparel with ultra-low latency checkout, dynamic search indexing, and instant state synchronization via modern cloud databases.',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['Next.js', 'Stripe', 'Tailwind CSS', 'Cloud Firestore', 'Zustand'],
    demoUrl: 'https://demo.example.com/cyber-store',
    githubUrl: 'https://github.com/sakib/cyber-ecommerce',
    featured: true,
    visibility: 'PUBLIC',
    createdAt: '2026-04-18T09:00:00Z',
    updatedAt: '2026-07-22T11:20:00Z',
    order: 2
  },
  {
    id: 'proj-3',
    title: '3D Spatial Portfolio & Interactive Sphere',
    slug: '3d-spatial-portfolio',
    category: '3D',
    description: 'Cinematic 3D WebGL experience featuring volumetric lighting, realistic materials, and smooth orbit camera choreography.',
    longDescription: 'Built with React Three Fiber, custom GLSL shaders, and customized post-processing passes to deliver 60fps across mobile and desktop devices with adaptive device pixel ratios.',
    coverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['Three.js', 'React Three Fiber', 'WebGL', 'GLSL', 'Drei', 'GSAP'],
    demoUrl: 'https://demo.example.com/3d-portfolio',
    githubUrl: 'https://github.com/sakib/3d-spatial-portfolio',
    featured: true,
    visibility: 'PUBLIC',
    createdAt: '2026-03-20T14:15:00Z',
    updatedAt: '2026-08-05T16:45:00Z',
    order: 3
  },
  {
    id: 'proj-4',
    title: 'Mobile Neo-Banking & Wealth Dashboard',
    slug: 'neo-banking-dashboard',
    category: 'APP',
    description: 'Cross-platform mobile banking interface focusing on biometric security, real-time ledger tracking, and encrypted vaults.',
    longDescription: 'Architected instant peer-to-peer microtransactions, multi-currency wallets, automated budget forecasting, and enterprise cryptography with continuous auth token refresh.',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['React Native', 'TypeScript', 'Fintech API', 'Tailwind', 'Motion', 'Python'],
    demoUrl: 'https://demo.example.com/neo-bank',
    githubUrl: 'https://github.com/sakib/neo-banking',
    featured: false,
    visibility: 'PUBLIC',
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-06-30T10:10:00Z',
    order: 4
  },
  {
    id: 'proj-5',
    title: 'Cyber Threat Analytics & Telemetry Grid',
    slug: 'cyber-threat-analytics',
    category: 'WEB',
    description: 'Real-time cybersecurity network monitoring dashboard visualizing traffic spikes, intrusion attempts, and anomaly vectors.',
    longDescription: 'High-frequency telemetry data streams mapped to interactive D3 and WebGL coordinate charts with custom alert rules, threshold triggers, and automated threat quarantine.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['TypeScript', 'D3.js', 'WebSockets', 'Tailwind CSS', 'Docker', 'Python'],
    demoUrl: 'https://demo.example.com/cyber-threat',
    githubUrl: 'https://github.com/sakib/threat-telemetry',
    featured: false,
    visibility: 'PUBLIC',
    createdAt: '2026-01-25T16:40:00Z',
    updatedAt: '2026-05-19T12:00:00Z',
    order: 5
  },
  {
    id: 'proj-6',
    title: 'Futuristic Brand Identity & Design System',
    slug: 'futuristic-brand-design-system',
    category: 'DESIGN',
    description: 'Comprehensive design system, typography tokens, vector iconography, and dark UI specifications for deep tech startups.',
    longDescription: 'Crafted 120+ accessible component primitives, mathematical spacing grids, dark-mode luminosity calibrations, and interactive style guides documented in a live Storybook.',
    coverImage: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1000&auto=format&fit=crop'
    ],
    technologies: ['Figma', 'Design Tokens', 'Design System', 'UI/UX', 'Accessibility'],
    demoUrl: 'https://demo.example.com/brand-system',
    githubUrl: 'https://github.com/sakib/design-tokens',
    featured: false,
    visibility: 'PUBLIC',
    createdAt: '2025-11-10T11:00:00Z',
    updatedAt: '2026-04-02T15:30:00Z',
    order: 6
  }
];

export const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert-1',
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud Certified',
    category: 'Cloud & AI',
    issueDate: '2024-03-15',
    credentialId: 'GCP-PCA-984210',
    credentialUrl: 'https://cloud.google.com/certification',
    imageUrl: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?q=80&w=1000&auto=format&fit=crop',
    description: 'Demonstrates expertise in architecting scalable, secure, and resilient enterprise cloud infrastructure on Google Cloud Platform.',
    skills: ['GCP Infrastructure', 'Cloud Security', 'Kubernetes Engine', 'Microservices', 'IAM'],
    visibility: 'PUBLIC'
  },
  {
    id: 'cert-2',
    title: 'Meta Advanced Full Stack Software Engineer',
    issuer: 'Meta / Coursera',
    category: 'Frontend',
    issueDate: '2023-11-20',
    credentialId: 'META-FSE-773194',
    credentialUrl: 'https://coursera.org',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
    description: 'Rigorous specialization covering modern React paradigms, state management, test-driven development, and backend REST APIs.',
    skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Unit Testing', 'CI/CD'],
    visibility: 'PUBLIC'
  },
  {
    id: 'cert-3',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'The Linux Foundation / CNCF',
    category: 'Backend',
    issueDate: '2023-08-10',
    credentialId: 'CKA-LF-55412',
    credentialUrl: 'https://www.cncf.io/certification/cka/',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1000&auto=format&fit=crop',
    description: 'Hands-on performance-based credential validating mastery of Kubernetes cluster architecture, container workloads, and storage orchestration.',
    skills: ['Kubernetes', 'Docker', 'Cluster Networking', 'Storage Volume', 'Troubleshooting'],
    visibility: 'PUBLIC'
  },
  {
    id: 'cert-4',
    title: 'Deep Learning & Neural Architectures Specialization',
    issuer: 'DeepLearning.AI',
    category: 'Cloud & AI',
    issueDate: '2023-04-05',
    credentialId: 'DLAI-NN-32984',
    credentialUrl: 'https://deeplearning.ai',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
    description: 'Comprehensive mastery of neural network architectures, attention models, transformer pipelines, and LLM fine-tuning techniques.',
    skills: ['Transformers', 'LLMs', 'PyTorch', 'Vector Embeddings', 'Model Evaluation', 'Python'],
    visibility: 'PUBLIC'
  },
  {
    id: 'cert-5',
    title: 'Zero-Trust Cybersecurity Practitioner',
    issuer: 'CompTIA / Security Alliance',
    category: 'Cybersecurity',
    issueDate: '2022-12-14',
    credentialId: 'SEC-ZT-881920',
    credentialUrl: 'https://comptia.org',
    imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1000&auto=format&fit=crop',
    description: 'Validated understanding of defense-in-depth principles, cryptographic key protection, ABAC authorization, and API threat protection.',
    skills: ['Zero-Trust', 'ABAC', 'JWT & OAuth2', 'Penetration Testing', 'Data Encryption'],
    visibility: 'PUBLIC'
  }
];

export const VAULT_FOLDERS: VaultFolderItem[] = [
  {
    id: 'documents',
    name: 'Documents',
    slug: 'documents',
    fileCount: 8,
    totalSize: 45200000, // 45.2 MB
    icon: 'FileText',
    description: 'Architecture specifications, client contracts, and technical whitepapers.'
  },
  {
    id: 'projects',
    name: 'Projects',
    slug: 'projects',
    fileCount: 14,
    totalSize: 128400000, // 128.4 MB
    icon: 'Folder',
    description: 'Source bundles, system architecture blueprints, and environment configurations.'
  },
  {
    id: 'videos',
    name: 'Videos',
    slug: 'videos',
    fileCount: 4,
    totalSize: 450000000, // 450 MB
    icon: 'Video',
    description: 'Product walkthroughs, 3D render animations, and keynote recordings.'
  },
  {
    id: 'images',
    name: 'Images',
    slug: 'images',
    fileCount: 22,
    totalSize: 84300000, // 84.3 MB
    icon: 'Image',
    description: 'High-resolution renders, mockups, design assets, and visual prototypes.'
  },
  {
    id: 'certificates',
    name: 'Certificates',
    slug: 'certificates',
    fileCount: 5,
    totalSize: 16200000, // 16.2 MB
    icon: 'Award',
    description: 'Cryptographically signed diplomas, credentials, and verification keys.'
  },
  {
    id: 'personal',
    name: 'Personal',
    slug: 'personal',
    fileCount: 3,
    totalSize: 8900000, // 8.9 MB
    icon: 'Lock',
    description: 'Encrypted personal notes, recovery seed phrases, and private logs.'
  }
];

export const INITIAL_VAULT_FILES: VaultFileItem[] = [
  {
    id: 'file-1',
    name: 'System_Architecture_Whitepaper_2026.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 4850000,
    storagePath: 'vault/documents/System_Architecture_Whitepaper_2026.pdf',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'documents',
    visibility: 'PRIVATE',
    isTrash: false,
    createdAt: '2026-06-10T14:30:00Z',
    updatedAt: '2026-06-10T14:30:00Z',
    contentPreview: 'Confidential system architecture diagram describing multi-region container orchestration, zero-trust perimeter, and edge computing nodes.',
    tags: ['Architecture', 'Zero-Trust', 'Cloud', 'Whitepaper']
  },
  {
    id: 'file-2',
    name: 'Ahmmad_Sakib_Executive_CV.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 1420000,
    storagePath: 'vault/documents/Ahmmad_Sakib_Executive_CV.pdf',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'documents',
    visibility: 'PUBLIC',
    isTrash: false,
    createdAt: '2026-07-01T09:15:00Z',
    updatedAt: '2026-07-01T09:15:00Z',
    contentPreview: 'Verified executive curriculum vitae of Ahmmad Sakib with certified credentials, full-stack track record, and experience timeline.',
    tags: ['Resume', 'Career', 'CV', 'Profile']
  },
  {
    id: 'file-3',
    name: 'Neural_Engine_3D_Sculpture_Pass.mp4',
    type: 'mp4',
    mimeType: 'video/mp4',
    size: 42000000,
    storagePath: 'vault/videos/Neural_Engine_3D_Sculpture_Pass.mp4',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'videos',
    visibility: 'SHARED',
    isTrash: false,
    createdAt: '2026-07-15T18:22:00Z',
    updatedAt: '2026-07-15T18:22:00Z',
    contentPreview: '4K Cinema 3D Render showcasing the signature red/black illuminated geometric core in full rotational fidelity.',
    tags: ['3D', 'Render', 'Video', 'AI', 'WebGL']
  },
  {
    id: 'file-4',
    name: 'Cyber_Identity_Design_Tokens.json',
    type: 'json',
    mimeType: 'application/json',
    size: 245000,
    storagePath: 'vault/projects/Cyber_Identity_Design_Tokens.json',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'projects',
    visibility: 'PRIVATE',
    isTrash: false,
    createdAt: '2026-07-20T11:40:00Z',
    updatedAt: '2026-07-20T11:40:00Z',
    contentPreview: '{\n  "colors": {\n    "bg": "#080808",\n    "accent": "#E51F2A",\n    "crimson": "#8C0B12"\n  },\n  "tokens": 128\n}',
    tags: ['Design', 'Tokens', 'JSON', 'Cyber']
  },
  {
    id: 'file-5',
    name: 'Google_Cloud_Architect_Credential.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 2890000,
    storagePath: 'vault/certificates/Google_Cloud_Architect_Credential.pdf',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'certificates',
    visibility: 'PUBLIC',
    isTrash: false,
    createdAt: '2026-08-01T16:05:00Z',
    updatedAt: '2026-08-01T16:05:00Z',
    contentPreview: 'Official verification record for Google Cloud Professional Architect certification.',
    tags: ['Certification', 'Google Cloud', 'GCP', 'Architecture']
  },
  {
    id: 'file-6',
    name: 'Python_AI_Model_Benchmark_Results.csv',
    type: 'csv',
    mimeType: 'text/csv',
    size: 512000,
    storagePath: 'vault/projects/Python_AI_Model_Benchmark_Results.csv',
    downloadUrl: '#',
    ownerId: 'owner-root',
    folderId: 'projects',
    visibility: 'PRIVATE',
    isTrash: false,
    createdAt: '2026-08-05T14:10:00Z',
    updatedAt: '2026-08-05T14:10:00Z',
    contentPreview: 'model_name,latency_ms,throughput_tokens_per_sec,vram_usage_gb\nGemini_3_7_Flash,18.4,142.6,3.8\nPython_PyTorch_Custom_Transformer,34.2,88.1,6.2',
    tags: ['Python', 'AI', 'Benchmark', 'Metrics']
  }
];

export function parseMediaUrl(inputUrl: string): {
  platform: MediaPlatform;
  mediaType: MediaType;
  embedUrl: string;
  thumbnailUrl: string;
  cleanUrl: string;
  detectedTitle?: string;
} {
  const url = (inputUrl || '').trim();
  
  // 1. YouTube link matching (Standard video, shorts, shortened youtu.be, embed, or playlist)
  const ytVideoMatch = url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const ytPlaylistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/i);

  if (ytVideoMatch || (url.includes('youtube.com') && ytPlaylistMatch)) {
    if (ytPlaylistMatch && !ytVideoMatch) {
      const listId = ytPlaylistMatch[1];
      return {
        platform: 'YOUTUBE',
        mediaType: 'PLAYLIST',
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`,
        thumbnailUrl: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80`,
        cleanUrl: url,
        detectedTitle: 'YouTube Curated Playlist'
      };
    }
    const videoId = ytVideoMatch ? ytVideoMatch[1] : '';
    const embedUrl = ytPlaylistMatch
      ? `https://www.youtube-nocookie.com/embed/${videoId}?list=${ytPlaylistMatch[1]}`
      : `https://www.youtube-nocookie.com/embed/${videoId}`;
    return {
      platform: 'YOUTUBE',
      mediaType: 'VIDEO',
      embedUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      cleanUrl: url,
      detectedTitle: 'YouTube Video'
    };
  }

  // 2. Spotify link matching (Playlist, Track, Album, Episode, Show)
  const spotifyMatch = url.match(/open\.spotify\.com\/(playlist|track|album|episode|show)\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch) {
    const type = spotifyMatch[1].toLowerCase();
    const id = spotifyMatch[2];
    const mediaType: MediaType = type === 'playlist' ? 'PLAYLIST' : type === 'album' ? 'ALBUM' : type === 'track' ? 'TRACK' : 'PODCAST';
    return {
      platform: 'SPOTIFY',
      mediaType,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      cleanUrl: url,
      detectedTitle: `Spotify ${mediaType}`
    };
  }

  // 3. GitHub link matching
  if (url.includes('github.com')) {
    return {
      platform: 'GITHUB',
      mediaType: 'DOCUMENT',
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
      cleanUrl: url,
      detectedTitle: 'GitHub Repository'
    };
  }

  // 4. Google Drive matching
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return {
      platform: 'GOOGLE_DRIVE',
      mediaType: 'DOCUMENT',
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
      cleanUrl: url,
      detectedTitle: 'Google Drive Document'
    };
  }

  // 5. Social Media matching
  if (url.includes('instagram.com') || url.includes('twitter.com') || url.includes('x.com') || url.includes('linkedin.com')) {
    return {
      platform: 'SOCIAL',
      mediaType: 'OTHER',
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
      cleanUrl: url,
      detectedTitle: 'Social Media Post'
    };
  }

  return {
    platform: 'WEBSITE',
    mediaType: 'ARTICLE',
    embedUrl: url,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    cleanUrl: url
  };
}

export const INITIAL_MEDIA_LINKS: MediaLinkItem[] = [
  {
    id: 'media-1',
    title: 'Cyberpunk Synthwave & Dark Electro • Deep Coding Focus',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXd8cOUiye1o2',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXd8cOUiye1o2?utm_source=generator&theme=0',
    platform: 'SPOTIFY',
    mediaType: 'PLAYLIST',
    username: 'ahmmad_sakib',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    description: 'High-energy retro-futuristic synthwave and darksynth rhythms designed for non-stop engineering flow states and night coding sessions.',
    category: 'Coding Beats',
    tags: ['Cyberpunk', 'Synthwave', 'Flow State', 'Night Dev'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    likes: 42,
    featured: true,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-02T10:00:00Z',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'media-2',
    title: 'Lofi Hip Hop Beats • Study & Engineering Ambience',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    username: 'farhan_thaqib',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    description: 'Peaceful chilled beats and gentle lo-fi soundscapes for calm problem solving, algorithmic architecture design, and quiet workflows.',
    category: 'Lofi & Chill',
    tags: ['Lofi', 'Relax', 'Coding', 'Ambient'],
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    likes: 38,
    featured: true,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-06T14:30:00Z',
    createdAt: '2026-08-05T14:30:00Z'
  },
  {
    id: 'media-3',
    title: 'Deep Focus Ambient • Pure Electronic Brain Flow',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4t95PaoR1zy',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4t95PaoR1zy?utm_source=generator&theme=0',
    platform: 'SPOTIFY',
    mediaType: 'PLAYLIST',
    username: 'ahmmad_sakib',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    description: 'Minimalist atmospheric soundscapes, binaural tones, and meditative electronic drones for maximum cognitive endurance.',
    category: 'Deep Focus',
    tags: ['Electronic', 'Minimalist', 'Brain Food', 'Study'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    likes: 29,
    featured: false,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-09T18:20:00Z',
    createdAt: '2026-08-08T18:20:00Z'
  },
  {
    id: 'media-4',
    title: 'Three.js & WebGL 3D Interactive Web Architecture Masterclass',
    url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/SqcY0GlETPk',
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    username: 'dev_explorer',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    description: 'Comprehensive breakdown on building cinematic 3D web landscapes, shader nodes, interactive physics, and smooth web performance.',
    category: 'Tech & Tutorials',
    tags: ['ThreeJS', 'WebGL', '3D UI', 'Masterclass'],
    thumbnailUrl: 'https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg',
    likes: 51,
    featured: true,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-13T09:15:00Z',
    createdAt: '2026-08-12T09:15:00Z'
  },
  {
    id: 'media-5',
    title: 'Chill Lo-Fi Instrumental Beats • Coffeehouse Coding',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    platform: 'SPOTIFY',
    mediaType: 'PLAYLIST',
    username: 'cloud_architect',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    description: 'Warm acoustic guitars, dusty drum samples, and smooth jazz-infused beats to keep your creativity buzzing all day.',
    category: 'Lofi & Chill',
    tags: ['Beats', 'Instrumental', 'Coffee', 'Vibes'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    likes: 34,
    featured: false,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-16T12:00:00Z',
    createdAt: '2026-08-15T12:00:00Z'
  },
  {
    id: 'media-6',
    title: 'Space Synth Ambient • Deep Galaxy Coding Odyssey',
    url: 'https://www.youtube.com/watch?v=tNkZsRW7h2c',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tNkZsRW7h2c',
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    username: 'neural_coder',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    description: 'Immersive deep cosmic space ambient synthesizers crafted for deep thought, system diagramming, and algorithmic modeling.',
    category: 'Coding Beats',
    tags: ['Space', 'Ambient', 'Cosmic', 'Synthesizer'],
    thumbnailUrl: 'https://img.youtube.com/vi/tNkZsRW7h2c/hqdefault.jpg',
    likes: 27,
    featured: false,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    reviewedBy: 'ahmmadsakib01@gmail.com',
    reviewedAt: '2026-08-19T16:45:00Z',
    createdAt: '2026-08-18T16:45:00Z'
  },
  {
    id: 'media-pending-1',
    title: 'Synthwave Radio Live 24/7 • Cyberpunk Beats to Chill / Study to',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    embedUrl: 'https://www.youtube-nocookie.com/embed/4xDzrJKXOOY',
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    username: 'community_pulsar',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    description: 'Community submitted continuous live cyberpunk radio stream for non-stop hacking.',
    category: 'Cyberpunk',
    tags: ['Live', 'Synthwave', 'Radio', 'Community'],
    thumbnailUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    likes: 5,
    featured: false,
    visibility: 'PUBLIC',
    status: 'PENDING',
    verified: false,
    createdAt: '2026-08-20T04:15:00Z'
  },
  {
    id: 'media-pending-2',
    title: 'Electronic Focus Flow • Algorithmic Deep Work Beats',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5trt9i14X7j?utm_source=generator&theme=0',
    platform: 'SPOTIFY',
    mediaType: 'PLAYLIST',
    username: 'alex_frontend',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    description: 'Submitted Spotify playlist featuring minimal techno and atmospheric soundscapes.',
    category: 'Deep Focus',
    tags: ['Spotify', 'DeepWork', 'Focus', 'Electronic'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    likes: 3,
    featured: false,
    visibility: 'PUBLIC',
    status: 'PENDING',
    verified: false,
    createdAt: '2026-08-20T05:30:00Z'
  }
];

