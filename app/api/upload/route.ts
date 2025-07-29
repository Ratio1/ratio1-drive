import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';
import { config } from '@/lib/config';
import { FileMetadata } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let uploadResult;
    let filename = '';
    let owner = '';
    let secret = '';

    if (contentType?.includes('multipart/form-data')) {
      // Streaming upload - verify true streaming behavior
      console.log('🚀 [STREAMING] Starting streaming upload...');
      const startTime = Date.now();

      const formData = await request.formData();
      const file = formData.get('file') as File;
      filename = formData.get('filename') as string || file?.name || 'unknown';
      secret = formData.get('secret') as string;
      owner = formData.get('owner') as string;

      console.log(`📁 [STREAMING] File info: ${filename} (${file?.size} bytes)`);

      // Create a new FormData with the secret included
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      if (filename) uploadFormData.append('filename', filename);
      if (secret) uploadFormData.append('secret', secret);

      // Pass FormData directly to SDK for true streaming (no buffering)
      uploadResult = await ApiClient.uploadFileStreaming(uploadFormData);

      const endTime = Date.now();
      console.log(`✅ [STREAMING] Upload completed in ${endTime - startTime}ms`);
    } else {
      // Base64 upload
      console.log('🔄 [BASE64] Starting base64 upload...');
      const data = await request.json();
      filename = data.filename || 'unknown';
      secret = data.secret || '';
      owner = data.owner || '';
      uploadResult = await ApiClient.uploadFileBase64(data);
    }
    console.log(`✅ [STREAMING] Upload result: ${uploadResult}`);

    // Extract CID and ee_node_address from upload result
    const cid = uploadResult?.result?.cid;
    const eeNodeAddress = uploadResult?.ee_node_address;

    if (!cid || !eeNodeAddress) {
      console.error('Missing CID or ee_node_address in upload result:', uploadResult);
      return NextResponse.json(uploadResult); // Return original result if missing required fields
    }

    try {
      // Get current metadata array for this node
      const hashGetResult = await ApiClient.hashGet(config.HKEY, eeNodeAddress);

      console.log(`🔍 [HASH GET] Existing metadata for node ${hashGetResult}`);

      let metadataArray: FileMetadata[] = [];

      // Handle different response cases
      if (hashGetResult === null || hashGetResult === undefined) {
        // No existing array for this node - create new one
        console.log(`No existing metadata array found for node ${eeNodeAddress}, creating new array`);
        metadataArray = [];
      } else {
        // Try to parse existing array
        try {
          const parsed = JSON.parse(hashGetResult);
          // Handle both old format (string array) and new format (metadata array)
          if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string') {
              // Old format - convert to new format
              metadataArray = parsed.map((cid: string) => ({
                cid,
                filename: `file_${cid.substring(0, 8)}`,
                date_uploaded: new Date().toISOString(),
                owner: 'Unknown',
                isEncryptedWithCustomKey: false
              }));
            } else {
              // New format - already metadata objects
              metadataArray = parsed;
            }
          }
          console.log(`Found existing metadata array for node ${eeNodeAddress}:`, metadataArray);
        } catch (parseError) {
          console.warn('Could not parse existing metadata array, starting with empty array:', parseError);
          metadataArray = [];
        }
      }

      // Create new metadata object
      const newMetadata: FileMetadata = {
        cid,
        filename,
        date_uploaded: new Date().toISOString(),
        owner: owner || 'Unknown',
        isEncryptedWithCustomKey: !!(secret && secret.trim())
      };

      // Add new metadata to array if CID is not already there
      const existingIndex = metadataArray.findIndex(item => item.cid === cid);
      if (existingIndex === -1) {
        metadataArray.push(newMetadata);
        console.log(`Added metadata for CID ${cid} to array. New array:`, metadataArray);
      } else {
        // Update existing metadata
        metadataArray[existingIndex] = newMetadata;
        console.log(`Updated metadata for existing CID ${cid}`);
      }

      // Update hash store with new metadata array
      await ApiClient.hashSet(config.HKEY, eeNodeAddress, JSON.stringify(metadataArray));

      console.log(`Successfully added metadata for CID ${cid} to node ${eeNodeAddress}`);

    } catch (hashError) {
      console.error('Error updating hash store:', hashError);
      // Continue and return the upload result even if hash store update fails
    }

    return NextResponse.json(uploadResult);

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
