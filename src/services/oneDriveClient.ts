import { ClientDocument } from '../types';

export interface OneDriveStatusResponse {
  isConfigured: boolean;
  tenantId: string;
  userEmail: string;
  basePath: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasTenantId: boolean;
  endpointTemplate: string;
  status: 'connected' | 'ready' | 'unconfigured' | 'auth_error';
  message: string;
  testedAt?: string;
  recentUploadsCount?: number;
  driveInfo?: {
    driveType?: string;
    ownerName?: string;
    totalBytes?: number;
    usedBytes?: number;
    remainingBytes?: number;
  };
}

export interface OneDriveUploadPayload {
  clientName: string;
  category: string;
  filename: string;
  file?: File | null;
  fileContentBase64?: string;
  textContent?: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

export interface OneDriveUploadApiResponse {
  success: boolean;
  mode: 'live' | 'simulated';
  graphEndpoint: string;
  relativePath: string;
  userEmail: string;
  tenant: string;
  driveItemId?: string;
  webUrl?: string;
  fileSize?: number;
  uploadedAt: string;
  error?: string;
  warning?: string;
  details?: any;
}

export const DEFAULT_CLIENT_SUBFOLDERS = [
  'Contracts',
  'Building & Pest Reports',
  'Finance Documents',
  'Payment Receipts',
  'ID Verification',
  'Other'
] as const;

export type ClientSubfolderName = typeof DEFAULT_CLIENT_SUBFOLDERS[number];

export interface OneDriveSubfolderResult {
  name: string;
  endpoint: string;
  relativePath: string;
  status: 'created' | 'already_exists' | 'simulated' | 'failed';
  driveItemId?: string;
  webUrl?: string;
  error?: string;
}

export interface OneDriveClientFolderProvisionResult {
  success: boolean;
  clientName: string;
  userEmail: string;
  tenant: string;
  mode: 'live' | 'simulated';
  clientFolderPath: string;
  clientFolderEndpoint: string;
  subfoldersCreated: OneDriveSubfolderResult[];
  createdAt: string;
  error?: string;
  details?: any;
}

export const ONEDRIVE_DEFAULT_CONFIG = {
  tenantId: 'iconicinvesting.onmicrosoft.com',
  userEmail: 'augustine_a@iconicinvesting.com.au',
  basePath: 'Documents/Abhijith App Test',
  endpointTemplate: 'PUT https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{clientName}/{category}/{filename}:/content',
  folderEndpointTemplate: 'POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{clientName}:/children'
};

/**
 * Computes the official Graph API POST endpoint for creating subfolders inside a client's folder
 */
export function getGraphFolderCreateEndpoint(clientName: string): string {
  return `POST https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${ONEDRIVE_DEFAULT_CONFIG.basePath}/${clientName}:/children`;
}

/**
 * Computes the root OneDrive path for a client
 */
export function getOneDriveClientFolderPath(clientName: string): string {
  return `${ONEDRIVE_DEFAULT_CONFIG.basePath}/${clientName}`;
}

/**
 * Computes the official Graph API PUT endpoint for a file
 */
export function getGraphPutEndpoint(clientName: string, category: string, filename: string): string {
  return `PUT https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${ONEDRIVE_DEFAULT_CONFIG.basePath}/${clientName}/${category}/${filename}:/content`;
}

/**
 * Computes the relative OneDrive destination path
 */
export function getOneDriveRelativePath(clientName: string, category: string, filename: string): string {
  return `${ONEDRIVE_DEFAULT_CONFIG.basePath}/${clientName}/${category}/${filename}`;
}

/**
 * Convert browser File object to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip metadata header: data:*/*;base64,
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Fetch current OneDrive & Azure App Registration status
 */
export async function fetchOneDriveStatus(): Promise<OneDriveStatusResponse> {
  try {
    const res = await fetch('/api/onedrive/status');
    if (!res.ok) {
      throw new Error(`Failed to fetch OneDrive status (${res.status})`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      isConfigured: false,
      tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
      userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
      basePath: ONEDRIVE_DEFAULT_CONFIG.basePath,
      hasClientId: false,
      hasClientSecret: false,
      hasTenantId: true,
      endpointTemplate: ONEDRIVE_DEFAULT_CONFIG.endpointTemplate,
      status: 'ready',
      message: err.message || 'Offline ready mode'
    };
  }
}

/**
 * Test MSAL authentication against Microsoft Graph API
 */
export async function testOneDriveConnection(): Promise<OneDriveStatusResponse> {
  const res = await fetch('/api/onedrive/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Test connection failed (${res.status})`);
  }
  return await res.json();
}

/**
 * Upload a document directly to OneDrive for Business via Graph API
 */
export async function uploadToOneDrive(payload: OneDriveUploadPayload): Promise<OneDriveUploadApiResponse> {
  let base64Data = payload.fileContentBase64;
  let fileType = payload.contentType;

  if (payload.file && !base64Data) {
    base64Data = await fileToBase64(payload.file);
    fileType = payload.file.type || 'application/pdf';
  }

  const response = await fetch('/api/onedrive/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: payload.clientName,
      category: payload.category,
      filename: payload.filename,
      fileContentBase64: base64Data,
      textContent: payload.textContent,
      contentType: fileType,
      metadata: payload.metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `OneDrive upload failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Query recent uploads log
 */
export async function fetchRecentOneDriveUploads() {
  const res = await fetch('/api/onedrive/recent-uploads');
  if (!res.ok) return { uploads: [], totalCount: 0 };
  return await res.json();
}

/**
 * Automatically provision client folder and standard 6 subfolders in OneDrive:
 * Path: Documents/Abhijith App Test/{Client Full Name}/
 * Subfolders: Contracts, Building & Pest Reports, Finance Documents, Payment Receipts, ID Verification, Other
 * Endpoint: POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{clientName}:/children
 */
export async function createClientOneDriveFolders(clientName: string): Promise<OneDriveClientFolderProvisionResult> {
  if (!clientName || !clientName.trim()) {
    throw new Error('Client name is required to create OneDrive folders.');
  }

  const res = await fetch('/api/onedrive/create-client-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientName: clientName.trim() })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create OneDrive folders (${res.status})`);
  }

  return await res.json();
}

/**
 * Fetch / inspect client OneDrive folder status
 */
export async function fetchClientOneDriveFolders(clientName: string): Promise<OneDriveClientFolderProvisionResult> {
  const res = await fetch(`/api/onedrive/client-folders/${encodeURIComponent(clientName)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to inspect client folders (${res.status})`);
  }
  return await res.json();
}
