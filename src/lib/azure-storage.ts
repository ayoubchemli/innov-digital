
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

// Configuration for Azure Blob Storage
const sasUrl = process.env.AZURE_STORAGE_SAS_URL || "";

// Initialize the Blob Service Client
let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

try {
  if (sasUrl) {
    blobServiceClient = new BlobServiceClient(sasUrl);
    // Default container for document storage
    containerClient = blobServiceClient.getContainerClient("documents");
  }
} catch (error) {
  console.error("Azure Blob Storage initialization error:", error);
}

/**
 * Upload a file to Azure Blob Storage
 * @param file The file to upload
 * @param directory Optional subdirectory within the container
 * @returns Object with upload status and details
 */
export const uploadFile = async (file: File, directory: string = ""): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> => {
  if (!containerClient) {
    return {
      success: false,
      message: "Azure Blob Storage is not configured correctly",
    };
  }

  try {
    const timestamp = new Date().getTime();
    const fileName = `${directory ? directory + "/" : ""}${timestamp}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    await blockBlobClient.uploadData(await file.arrayBuffer(), {
      blobHTTPHeaders: { blobContentType: file.type },
    });

    return {
      success: true,
      url: blockBlobClient.url,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      message: "Failed to upload file to Azure Blob Storage",
    };
  }
};

/**
 * Download a file from Azure Blob Storage
 * @param blobName The name of the blob to download
 * @returns Blob data or null if failed
 */
export const downloadFile = async (blobName: string): Promise<Blob | null> => {
  if (!containerClient) return null;

  try {
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadResponse = await blobClient.download();
    
    if (!downloadResponse.blobBody) return null;
    return await downloadResponse.blobBody;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
};

/**
 * Delete a file from Azure Blob Storage
 * @param blobName The name of the blob to delete
 * @returns Success status
 */
export const deleteFile = async (blobName: string): Promise<boolean> => {
  if (!containerClient) return false;

  try {
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.delete();
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
