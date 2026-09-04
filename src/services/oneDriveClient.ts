/**
 * Microsoft Azure & Microsoft Graph API Client Service for Frontend
 * 
 * Supports:
 * - Azure Active Directory / Entra ID App Registration & MSAL
 * - Tenant: iconicinvesting.onmicrosoft.com
 * - Target User: augustine_a@iconicinvesting.com.au
 * - Base Path: Documents/Abhijith App Test/
 */

export const DEFAULT_CLIENT_SUBFOLDERS = [
  'Contracts',
  'Building & Pest Reports',
  'Finance Documents',
  'Payment Receipts',
  'ID Verification',
  'Other'
] as const;

export type ClientSubfolderName = typeof DEFAULT_CLIENT_SUBFOLDERS[number];

export const ONEDRIVE_DEFAULT_CONFIG = {
  tenantId: 'f8c39088-7bd7-486e-9ff9-56c0935606a8',
  tenantDomain: 'iconicinvesting.onmicrosoft.com',
  userEmail: 'augustine_a@iconicinvesting.com.au',
  basePath: 'Documents/Abhijith App Test',
  endpointTemplate: 'PUT https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{clientName}/{category}/{filename}:/content'
};

export interface OneDriveStatusResponse {
  isConfigured: boolean;
  tenantId: string;
  userEmail: string;
  basePath: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasTenantId: boolean;
  endpointTemplate: string;
  status: 'authenticated' | 'sandbox_ready' | 'auth_error';
  message: string;
  testedAt?: string;
  authority?: string;
  recentUploadsCount?: number;
  config?: {
    tenantId: string;
    userEmail: string;
    basePath: string;
  };
}

export interface OneDriveUploadApiResponse {
  success: boolean;
  mode: 'live' | 'simulated';
  graphEndpoint: string;
  relativePath: string;
  userEmail: string;
  tenant: string;
  driveItemId: string;
  webUrl: string;
  fileSize: number;
  uploadedAt: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface OneDriveSubfolderResult {
  name: string;
  status: 'created' | 'already_exists' | 'simulated';
  path: string;
  driveItemId?: string;
  endpoint: string;
}

export interface OneDriveClientFolderProvisionResult {
  success: boolean;
  clientName: string;
  clientFolderPath: string;
  clientFolderEndpoint: string;
  userEmail: string;
  tenant: string;
  subfoldersCreated: OneDriveSubfolderResult[];
  mode: 'live' | 'simulated';
  createdAt: string;
}

export interface OneDriveStoredFolder {
  id: string;
  name: string;
  path: string;
  webUrl: string;
  subfolders: string[];
  createdAt: string;
  type: 'client' | 'system' | 'custom';
  endpoint: string;
}

export const getOneDriveClientFolderPath = (clientName: string): string => {
  return `${ONEDRIVE_DEFAULT_CONFIG.basePath}/${clientName.trim()}`;
};

export const getOneDriveRelativePath = (
  clientName: string,
  category: string,
  fileName: string
): string => {
  const cleanClient = clientName.trim() || 'General';
  const cleanCat = category.trim() || 'Other';
  const cleanFile = fileName.trim() || 'document.pdf';
  return `${ONEDRIVE_DEFAULT_CONFIG.basePath}/${cleanClient}/${cleanCat}/${cleanFile}`;
};

export const getGraphPutEndpoint = (
  clientName: string,
  category: string,
  fileName: string
): string => {
  const relativePath = getOneDriveRelativePath(clientName, category, fileName);
  return `PUT https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${relativePath}:/content`;
};

export const getGraphFolderCreateEndpoint = (clientName: string): string => {
  const clientPath = getOneDriveClientFolderPath(clientName);
  return `POST https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${clientPath}:/children`;
};

/**
 * Fetch Azure & OneDrive connection status
 */
export async function fetchOneDriveStatus(): Promise<OneDriveStatusResponse> {
  try {
    const res = await fetch('/api/onedrive/status');
    if (!res.ok) throw new Error(`Status HTTP error: ${res.status}`);
    return await res.json();
  } catch {
    return {
      isConfigured: false,
      tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
      userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
      basePath: ONEDRIVE_DEFAULT_CONFIG.basePath,
      hasClientId: false,
      hasClientSecret: false,
      hasTenantId: true,
      endpointTemplate: ONEDRIVE_DEFAULT_CONFIG.endpointTemplate,
      status: 'sandbox_ready',
      message: `Azure MSAL & Microsoft Graph ready in sandbox mode for ${ONEDRIVE_DEFAULT_CONFIG.userEmail}`,
      recentUploadsCount: 0
    };
  }
}

/**
 * Test live connection via MSAL
 */
export async function testOneDriveConnection(): Promise<OneDriveStatusResponse> {
  try {
    const res = await fetch('/api/onedrive/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Test HTTP error: ${res.status}`);
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection test error';
    return {
      isConfigured: false,
      tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
      userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
      basePath: ONEDRIVE_DEFAULT_CONFIG.basePath,
      hasClientId: false,
      hasClientSecret: false,
      hasTenantId: true,
      endpointTemplate: ONEDRIVE_DEFAULT_CONFIG.endpointTemplate,
      status: 'auth_error',
      message: `Azure Test Connection: ${message}`
    };
  }
}

/**
 * Upload document to OneDrive via backend Graph API service
 */
export async function uploadToOneDrive(params: {
  clientName: string;
  category: string;
  filename: string;
  file?: File | null;
  fileContentBase64?: string;
  textContent?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}): Promise<OneDriveUploadApiResponse> {
  let base64 = params.fileContentBase64;
  if (params.file && !base64) {
    base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const b64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(b64);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(params.file!);
    });
  }

  const response = await fetch('/api/onedrive/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: params.clientName,
      category: params.category,
      filename: params.filename,
      fileContentBase64: base64,
      textContent: params.textContent,
      contentType: params.contentType,
      metadata: params.metadata
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errData.error || `HTTP ${response.status}: Failed to upload to OneDrive`);
  }

  return response.json();
}

/**
 * Fetch recent uploads & audit logs
 */
export async function fetchRecentOneDriveUploads(): Promise<{
  uploads: OneDriveUploadApiResponse[];
  totalCount: number;
  tenantId: string;
  userEmail: string;
  basePath: string;
}> {
  const res = await fetch('/api/onedrive/recent-uploads');
  if (!res.ok) {
    return {
      uploads: [],
      totalCount: 0,
      tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
      userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
      basePath: ONEDRIVE_DEFAULT_CONFIG.basePath
    };
  }
  return res.json();
}

/**
 * Auto-create 6-subfolder structure for a client in OneDrive via Graph API
 */
export async function createClientOneDriveFolders(
  clientName: string
): Promise<OneDriveClientFolderProvisionResult> {
  const res = await fetch('/api/onedrive/create-client-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientName })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create client folders' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Query / Inspect client folder structure in OneDrive
 */
export async function fetchClientOneDriveFolders(
  clientName: string
): Promise<OneDriveClientFolderProvisionResult> {
  const res = await fetch(`/api/onedrive/client-folders/${encodeURIComponent(clientName)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to inspect client folders' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch stored folders list in Documents/Abhijith App Test/
 */
export async function fetchOneDriveFolders(): Promise<{
  folders: OneDriveStoredFolder[];
  totalFolders: number;
  basePath: string;
  userEmail: string;
  tenantId: string;
  sharePointRootUrl: string;
}> {
  const res = await fetch('/api/onedrive/folders');
  if (!res.ok) {
    return {
      folders: [],
      totalFolders: 0,
      basePath: ONEDRIVE_DEFAULT_CONFIG.basePath,
      userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
      tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
      sharePointRootUrl: `https://${ONEDRIVE_DEFAULT_CONFIG.tenantDomain.replace('.onmicrosoft.com', '')}-my.sharepoint.com/personal/${ONEDRIVE_DEFAULT_CONFIG.userEmail.replace(/[@.]/g, '_')}/Documents`
    };
  }
  return res.json();
}

/**
 * Create custom or generic folder in OneDrive
 */
export async function createOneDriveFolder(params: {
  folderName: string;
  subfolders?: string[];
  parentPath?: string;
  type?: 'client' | 'system' | 'custom';
}): Promise<{
  success: boolean;
  folder: OneDriveStoredFolder;
  subfolderResults: OneDriveSubfolderResult[];
}> {
  const res = await fetch('/api/onedrive/create-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create folder in OneDrive' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Batch create client folders in OneDrive
 */
export async function batchCreateClientOneDriveFolders(clientNames: string[]): Promise<{
  success: boolean;
  provisionedCount: number;
  results: OneDriveClientFolderProvisionResult[];
  basePath: string;
  sharePointUrl: string;
}> {
  const res = await fetch('/api/onedrive/batch-create-client-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientNames })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Batch folder creation failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
