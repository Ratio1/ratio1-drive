import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let uploadResult;
    
    if (contentType?.includes('multipart/form-data')) {
      // Streaming upload
      const formData = await request.formData();
      uploadResult = await ApiClient.uploadFileStreaming(formData);
    } else {
      // Base64 upload
      const data = await request.json();
      uploadResult = await ApiClient.uploadFileBase64(data);
    }

    // Extract CID and ee_node_address from upload result
    const cid = uploadResult?.result?.cid;
    const eeNodeAddress = uploadResult?.ee_node_address;

    if (!cid || !eeNodeAddress) {
      console.error('Missing CID or ee_node_address in upload result:', uploadResult);
      return NextResponse.json(uploadResult); // Return original result if missing required fields
    }

    try {
      // Get current CID array for this node
      const hashGetResult = await ApiClient.hashGet(config.HKEY, eeNodeAddress);
      
      let cidArray: string[] = [];
      
      // Handle different response cases
      if (hashGetResult.result === null || hashGetResult.result === undefined) {
        // No existing array for this node - create new one
        console.log(`No existing CID array found for node ${eeNodeAddress}, creating new array`);
        cidArray = [];
      } else {
        // Try to parse existing array
        try {
          cidArray = JSON.parse(hashGetResult.result);
          console.log(`Found existing CID array for node ${eeNodeAddress}:`, cidArray);
        } catch (parseError) {
          console.warn('Could not parse existing CID array, starting with empty array:', parseError);
          cidArray = [];
        }
      }

      // Add new CID to array if it's not already there
      if (!cidArray.includes(cid)) {
        cidArray.push(cid);
        console.log(`Added CID ${cid} to array. New array:`, cidArray);
      } else {
        console.log(`CID ${cid} already exists in array`);
      }

      // Update hash store with new CID array
      await ApiClient.hashSet(config.HKEY, eeNodeAddress, JSON.stringify(cidArray));

      console.log(`Successfully added CID ${cid} to node ${eeNodeAddress}`);
      
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