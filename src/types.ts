export type UserRole = 'OWNER' | 'TRUSTED' | 'LIMITED';
export type UserStatus = 'active' | 'disabled' | 'pending' | 'suspended' | 'denied';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  notes?: string;
}

export type ResourceType = 'FILE' | 'FOLDER' | 'VIDEO' | 'PROJECT' | 'CERTIFICATE';
export type PermissionAction = 'READ' | 'DOWNLOAD' | 'WRITE' | 'DELETE' | 'SHARE';

export interface PermissionItem {
  id: string;
  userId: string;
  userEmail: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  permissions: PermissionAction[];
  grantedBy: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt: string | null; // ISO Date string or null for permanent
}

export interface VaultVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  storagePath: string;
  duration?: string;
  size: number;
  uploadDate: string;
  projectId?: string;
  projectName?: string;
  visibility: FileVisibility;
  mimeType: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory = 'ALL' | 'WEB' | 'DESIGN' | '3D' | 'APP' | 'AI' | 'OTHER';

export interface ProjectResourceItem {
  id: string;
  name: string;
  type: 'FILE' | 'VIDEO' | 'DOC' | 'ARCHIVE' | 'IMAGE';
  url?: string;
  storagePath?: string;
  size?: number;
  visibility: FileVisibility;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: 'WEB' | 'DESIGN' | '3D' | 'APP' | 'AI' | 'OTHER';
  description: string;
  longDescription?: string;
  technologies: string[];
  coverImage: string;
  gallery?: string[];
  demoUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  videoDemoUrl?: string;
  sourceArchiveUrl?: string;
  resources?: ProjectResourceItem[];
  featured?: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
  createdAt: string;
  updatedAt: string;
  order?: number;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  category: 'Cloud & AI' | 'Frontend' | 'Backend' | 'Cybersecurity' | 'Architecture';
  issueDate: string;
  credentialId: string;
  credentialUrl?: string;
  imageUrl: string;
  downloadUrl?: string;
  description: string;
  skills: string[];
  createdAt?: string;
  order?: number;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'SHARED';
}

export type FileVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface VaultFileItem {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl?: string;
  ownerId: string;
  folderId: string;
  visibility: FileVisibility;
  isTrash?: boolean;
  trashedAt?: string;
  createdAt: string;
  updatedAt: string;
  contentPreview?: string;
  tags?: string[];
}

export interface VaultFolderItem {
  id: string;
  name: string;
  slug: string;
  fileCount: number;
  totalSize: number;
  icon: string;
  description: string;
  visibility?: FileVisibility;
}

export type ActivityAction = 
  | 'GRANT_ACCESS'
  | 'REVOKE_ACCESS'
  | 'UPDATE_PERMISSION'
  | 'FILE_UPLOADED'
  | 'FILE_DOWNLOADED'
  | 'FILE_DELETED'
  | 'FILE_TRASHED'
  | 'FILE_RESTORED'
  | 'FILE_PERMANENT_DELETED'
  | 'FILE_RENAMED'
  | 'FILE_MOVED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'USER_ADDED'
  | 'ROLE_CHANGED'
  | 'USER_DISABLED'
  | 'USER_ENABLED'
  | 'SECURITY_AUDIT'
  | 'AI_QUERY'
  | 'LOGIN_SUCCESS';

export interface ActivityLogItem {
  id: string;
  userId: string;
  userEmail: string;
  actor: string;
  targetUser?: string;
  resource?: string;
  action: ActivityAction | string;
  resourceType?: string;
  resourceId?: string;
  targetResource?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: {
    type: 'FILE' | 'PROJECT' | 'CERTIFICATE';
    id: string;
    title: string;
    url?: string;
  }[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface SkillCategory {
  category: string;
  skills: {
    name: string;
    level: string;
    iconName?: string;
  }[];
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  institution: string;
  description: string;
  type: 'Education' | 'Experience' | 'Projects' | 'Achievements';
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type MediaPlatform = 'YOUTUBE' | 'SPOTIFY' | 'SOUNDCLOUD' | 'OTHER';
export type MediaType = 'VIDEO' | 'PLAYLIST' | 'TRACK' | 'ALBUM' | 'PODCAST';
export type MediaApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'FLAGGED';

export interface MediaLinkItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  platform: MediaPlatform;
  mediaType: MediaType;
  username: string; // Submitter handle/name
  userId?: string;
  userAvatar?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  likes?: number;
  featured?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'SHARED';
  status?: MediaApprovalStatus;
  verified?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

