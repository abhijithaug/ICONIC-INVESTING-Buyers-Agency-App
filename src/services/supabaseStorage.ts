import { supabase, SUPABASE_STORAGE_BUCKET, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export { SUPABASE_STORAGE_BUCKET, SUPABASE_URL, SUPABASE_ANON_KEY };

export const SUPABASE_DOCUMENT_CATEGORIES = [
  'Contracts',
  'Building & Pest Reports',
  'Finance Documents',
  'Payment Receipts',
  'ID Verification',
  'Other'
] as const;

export type SupabaseDocumentCategory = typeof SUPABASE_DOCUMENT_CATEGORIES[number];

export interface SupabaseStorageUploadResult {
  success: boolean;
  path?: string;
  fullPath?: string;
  publicUrl?: string;
  fileName?: string;
  category?: string;
  clientFullName?: string;
  error?: string;
}

export interface SupabaseStoredFile {
  name: string;
  id?: string;
  category: string;
  clientFullName: string;
  fullPath: string; // e.g. "Marcus Vance/Contracts/Contract.pdf"
  sizeBytes?: number;
  sizeFormatted: string;
  createdAt?: string;
  updatedAt?: string;
  publicUrl: string;
}

/**
 * Format bytes to friendly string (KB/MB)
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Upload a document to Supabase Storage bucket 'client-documents'
 * Path: {Client Full Name}/{Category}/{filename}
 * With upsert: true
 * Calls onProgress(0..100) during upload
 */
export async function uploadClientDocumentToSupabase(params: {
  clientFullName: string;
  category: string;
  file: File | Blob;
  customFileName?: string;
  onProgress?: (progress: number) => void;
}): Promise<SupabaseStorageUploadResult> {
  const { clientFullName, category, file, customFileName, onProgress } = params;

  // Clean and sanitize names for path
  const sanitizedClient = clientFullName.trim();
  const sanitizedCategory = category.trim();
  const rawFileName = customFileName?.trim() || (file instanceof File ? file.name : `document_${Date.now()}.pdf`);
  // Ensure safe file name without leading/trailing slashes
  const cleanFileName = rawFileName.replace(/^\/+|\/+$/g, '');
  const storagePath = `${sanitizedClient}/${sanitizedCategory}/${cleanFileName}`;

  try {
    if (onProgress) onProgress(10);

    // Try XMLHttpRequest first for granular progress events
    const uploadedViaXhr = await new Promise<boolean>((resolve) => {
      try {
        if (typeof XMLHttpRequest === 'undefined') {
          resolve(false);
          return;
        }

        const xhr = new XMLHttpRequest();
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodeURI(storagePath)}`;

        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
        xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
        xhr.setRequestHeader('x-upsert', 'true');
        if (file.type) {
          xhr.setRequestHeader('Content-Type', file.type);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.min(95, Math.max(10, Math.round((event.loaded / event.total) * 100)));
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true);
          } else {
            console.warn('[Supabase Storage] XHR upload returned status:', xhr.status, xhr.responseText);
            resolve(false);
          }
        };

        xhr.onerror = () => {
          console.warn('[Supabase Storage] XHR upload failed, falling back to client SDK.');
          resolve(false);
        };

        xhr.send(file);
      } catch (xhrErr) {
        console.warn('[Supabase Storage] XHR exception, falling back to client SDK:', xhrErr);
        resolve(false);
      }
    });

    if (!uploadedViaXhr) {
      // Fallback to official Supabase JS SDK client
      let progressTimer: any = null;
      if (onProgress) {
        let currentProgress = 20;
        onProgress(currentProgress);
        progressTimer = setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += 15;
            onProgress(currentProgress);
          }
        }, 150);
      }

      const { data, error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });

      if (progressTimer) clearInterval(progressTimer);

      if (error) {
        console.error('[Supabase Storage] SDK upload error:', error);
        return {
          success: false,
          error: error.message || 'Failed to upload document to Supabase Storage'
        };
      }
    }

    if (onProgress) onProgress(100);

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      success: true,
      path: storagePath,
      fullPath: `${SUPABASE_STORAGE_BUCKET}/${storagePath}`,
      publicUrl: publicUrlData?.publicUrl || '',
      fileName: cleanFileName,
      category: sanitizedCategory,
      clientFullName: sanitizedClient
    };
  } catch (err: any) {
    console.error('[Supabase Storage] Unexpected upload exception:', err);
    return {
      success: false,
      error: err?.message || 'Unexpected network or storage error occurred'
    };
  }
}

/**
 * Lists all stored files for a specific client across category subfolders
 * Path prefix: {Client Full Name}/
 */
export async function listClientDocumentsFromSupabase(clientFullName: string): Promise<{
  files: SupabaseStoredFile[];
  error?: string;
}> {
  const sanitizedClient = clientFullName.trim();
  if (!sanitizedClient) {
    return { files: [] };
  }

  const allFiles: SupabaseStoredFile[] = [];
  const processedPaths = new Set<string>();

  try {
    // 1. List all items in the client's root folder {Client Full Name}
    const { data: topLevelItems, error: topError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list(sanitizedClient, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (topError) {
      console.warn(`[Supabase Storage] Error listing folder '${sanitizedClient}':`, topError.message);
    }

    const categoriesToCheck = new Set<string>(SUPABASE_DOCUMENT_CATEGORIES);

    if (topLevelItems && topLevelItems.length > 0) {
      for (const item of topLevelItems) {
        const isFolder = !item.id || item.metadata === null || item.id === '';
        if (isFolder) {
          categoriesToCheck.add(item.name);
        } else if (item.name && item.name !== '.emptyFolderPlaceholder' && item.name !== '.keep') {
          // Direct file under client root {Client Full Name}/{fileName}
          const fullFilePath = `${sanitizedClient}/${item.name}`;
          if (!processedPaths.has(fullFilePath)) {
            processedPaths.add(fullFilePath);
            const { data: pubData } = supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .getPublicUrl(fullFilePath);

            const size = (item.metadata as any)?.size || 0;
            allFiles.push({
              name: item.name,
              id: item.id || `file-${Date.now()}-${item.name}`,
              category: 'Other',
              clientFullName: sanitizedClient,
              fullPath: fullFilePath,
              sizeBytes: size,
              sizeFormatted: formatBytes(size),
              createdAt: item.created_at || item.updated_at || new Date().toISOString(),
              updatedAt: item.updated_at,
              publicUrl: pubData?.publicUrl || ''
            });
          }
        }
      }
    }

    // 2. Fetch files from each category subfolder: {Client Full Name}/{categoryName}
    for (const categoryName of Array.from(categoriesToCheck)) {
      const subPath = `${sanitizedClient}/${categoryName}`;
      const { data: subFiles, error: subError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .list(subPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!subError && subFiles) {
        for (const file of subFiles) {
          if (file.name && file.name !== '.emptyFolderPlaceholder' && file.name !== '.keep') {
            const fullFilePath = `${sanitizedClient}/${categoryName}/${file.name}`;
            if (!processedPaths.has(fullFilePath)) {
              processedPaths.add(fullFilePath);
              const { data: pubData } = supabase.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .getPublicUrl(fullFilePath);

              const size = (file.metadata as any)?.size || 0;
              allFiles.push({
                name: file.name,
                id: file.id || `file-${Date.now()}-${file.name}`,
                category: categoryName,
                clientFullName: sanitizedClient,
                fullPath: fullFilePath,
                sizeBytes: size,
                sizeFormatted: formatBytes(size),
                createdAt: file.created_at || file.updated_at || (file.metadata as any)?.created_at || new Date().toISOString(),
                updatedAt: file.updated_at,
                publicUrl: pubData?.publicUrl || ''
              });
            }
          }
        }
      }
    }

    return { files: allFiles };
  } catch (err: any) {
    console.error('[Supabase Storage] List error:', err);
    return { files: [], error: err?.message || 'Failed to list client documents' };
  }
}

/**
 * Auto-creates placeholder .keep files in Supabase Storage to set up the folder structure at:
 * {Client Full Name}/Contracts/.keep
 * {Client Full Name}/Building & Pest Reports/.keep
 * {Client Full Name}/Finance Documents/.keep
 * {Client Full Name}/Payment Receipts/.keep
 * {Client Full Name}/ID Verification/.keep
 * {Client Full Name}/Other/.keep
 * 
 * Ensures the folder structure appears in Supabase Storage as soon as a client is added.
 */
export async function createClientSupabaseFolders(clientFullName: string): Promise<{
  success: boolean;
  foldersCreated: string[];
  errors?: string[];
}> {
  const sanitizedClient = clientFullName.trim();
  if (!sanitizedClient) {
    return { success: false, foldersCreated: [], errors: ['Client full name cannot be empty'] };
  }

  const keepContent = new Blob([''], { type: 'text/plain' });
  const foldersCreated: string[] = [];
  const errors: string[] = [];

  console.log(`[Supabase Storage] Auto-creating client folder structure for: "${sanitizedClient}"`);

  const results = await Promise.allSettled(
    SUPABASE_DOCUMENT_CATEGORIES.map(async (category) => {
      const keepPath = `${sanitizedClient}/${category}/.keep`;
      const { error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(keepPath, keepContent, {
          upsert: true,
          contentType: 'text/plain',
          cacheControl: '3600'
        });

      if (error) {
        console.warn(`[Supabase Storage] Notice creating placeholder '${keepPath}':`, error.message);
        throw new Error(`${category}: ${error.message}`);
      }

      return category;
    })
  );

  results.forEach((res, idx) => {
    const category = SUPABASE_DOCUMENT_CATEGORIES[idx];
    if (res.status === 'fulfilled') {
      foldersCreated.push(res.value);
    } else {
      errors.push(res.reason?.message || `${category} placeholder setup failed`);
    }
  });

  return {
    success: foldersCreated.length > 0,
    foldersCreated,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Delete a document from Supabase Storage
 */
export async function deleteClientDocumentFromSupabase(fullPath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([fullPath]);

    if (error) {
      console.error('[Supabase Storage] Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase Storage] Delete exception:', err);
    return { success: false, error: err?.message || 'Failed to delete file' };
  }
}
