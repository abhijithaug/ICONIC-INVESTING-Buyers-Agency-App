import { createClient } from '@supabase/supabase-js';

// Supabase Configuration from environment variables
export const SUPABASE_URL: string = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY: string = process.env.SUPABASE_ANON_KEY || '';

export const SUPABASE_STORAGE_BUCKET = 'client-documents';

// Initialise the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface SupabaseConnectionStatus {
  connected: boolean;
  testedAt: string;
  url: string;
  message: string;
  bucketsCount?: number;
  error?: string;
}

/**
 * Tests the connection to Supabase storage on page load
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[Supabase] Testing connection to ${SUPABASE_URL}...`);
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.warn('[Supabase] Connection warning:', error.message);
      return {
        connected: false,
        testedAt: timestamp,
        url: SUPABASE_URL,
        message: `Connection returned an error: ${error.message}`,
        error: error.message
      };
    }

    const count = data?.length ?? 0;
    console.log(`[Supabase] Connection successful! Storage service responded (${count} bucket${count === 1 ? '' : 's'}).`);
    
    return {
      connected: true,
      testedAt: timestamp,
      url: SUPABASE_URL,
      message: `Supabase Storage connected successfully (${count} bucket${count === 1 ? '' : 's'} accessible)`,
      bucketsCount: count
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network error while connecting to Supabase';
    console.error('[Supabase] Connection test exception:', err);
    return {
      connected: false,
      testedAt: timestamp,
      url: SUPABASE_URL,
      message: `Supabase connection failed: ${errorMsg}`,
      error: errorMsg
    };
  }
}
