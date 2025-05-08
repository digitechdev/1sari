import { Injectable } from '@angular/core';
// FileObject might not be a public export, upload data typically gives { path: string }
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment'; // Assuming environment setup

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    // Initialize Supabase client
    // IMPORTANT: Replace with your actual Supabase URL and anon key
    // You should store these securely, e.g., in environment variables
    this.supabase = createClient(
      environment.supabaseUrl, // Get from environment.ts
      environment.supabaseKey  // Get from environment.ts
    );
  }

  /**
   * Uploads a file to the specified Supabase Storage bucket.
   * @param bucket The name of the bucket.
   * @param path The path (including filename) where the file will be stored in the bucket.
   * @param file The file to upload (File, Blob, ArrayBuffer, etc.).
   * @param fileOptions Optional file options like contentType, upsert.
   * @returns Promise resolving to the upload response, typically { data: { path: string } | null, error: Error | null }
   */
  async uploadFile(
    bucket: string, 
    path: string, 
    file: File | Blob | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | Buffer, 
    fileOptions?: { contentType?: string, upsert?: boolean }
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    const options = { cacheControl: '3600', upsert: fileOptions?.upsert || false, ...fileOptions };    
    return this.supabase.storage.from(bucket).upload(path, file, options);
  }

  /**
   * Gets the public URL for a file in Supabase Storage.
   * @param bucket The name of the bucket.
   * @param path The path (including filename) of the file in the bucket.
   * @returns The public URL string.
   * @throws Error if the public URL cannot be retrieved.
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    if (!data || !data.publicUrl) {
      throw new Error(`Could not get public URL for ${path} in bucket ${bucket}`);
    }
    return data.publicUrl;
  }

  // You might also want a deleteFile method in the future:
  // async deleteFile(bucket: string, paths: string[]) {
  //   return this.supabase.storage.from(bucket).remove(paths);
  // }
}
