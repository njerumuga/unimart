// src/cloudinary.js

// ✅ SokoHub Cloudinary configuration
export const CLOUDINARY_UPLOAD_PRESET = "ml_default";  // e.g., "unimart_uploads"
export const CLOUDINARY_CLOUD_NAME = "dxisjknbc";      // your Cloudinary cloud name

/**
 * Upload a single image or video file to Cloudinary
 * @param {File} file - The file (image or video) selected by the user
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{ url: string, type: 'image' | 'video', name: string }>} - Returns the secure URL and media type
 */
export async function uploadToCloudinary(file, onProgress) {
    if (!file) throw new Error("No file selected for upload");

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
        throw new Error("Only image (JPEG, PNG, WebP) and video (MP4, WebM, MOV) files are supported.");
    }

    const resourceType = isVideo ? "video" : "image";
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    console.log(`☁️ Uploading ${resourceType} to Cloudinary:`, file.name, `(${file.size} bytes)`);

    try {
        const xhr = new XMLHttpRequest();

        const promise = new Promise((resolve, reject) => {
            xhr.upload.onprogress = (event) => {
                if (onProgress && event.lengthComputable) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    onProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    console.log("✅ Uploaded successfully:", response.secure_url);
                    resolve({
                        url: response.secure_url,
                        type: resourceType,
                        name: file.name,
                    });
                } else {
                    console.error("❌ Cloudinary upload error response:", xhr.responseText);
                    reject(new Error("Upload failed — please check your internet connection or try a smaller file."));
                }
            };

            xhr.onerror = () => reject(new Error("Network connection error during upload."));
        });

        xhr.open("POST", url);
        xhr.send(formData);
        const result = await promise;
        return result.url; // Return URL for backward compatibility, while keeping string format
    } catch (err) {
        console.error("❌ Cloudinary upload failed:", err);
        throw err;
    }
}

/**
 * Upload multiple files (images and/or videos) to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Function} onProgressUpdate - Callback (completedCount, totalCount, overallPercent)
 * @returns {Promise<Array<{ url: string, type: 'image' | 'video', name: string }>>}
 */
export async function uploadMultipleToCloudinary(files, onProgressUpdate) {
    if (!files || files.length === 0) return [];

    const total = files.length;
    const results = [];
    const fileProgresses = new Array(total).fill(0);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const resourceType = isVideo ? "video" : "image";
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const fileResult = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    fileProgresses[i] = Math.round((event.loaded * 100) / event.total);
                    const avg = Math.round(fileProgresses.reduce((a, b) => a + b, 0) / total);
                    if (onProgressUpdate) onProgressUpdate(results.length, total, avg);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    fileProgresses[i] = 100;
                    resolve({
                        url: response.secure_url,
                        type: resourceType,
                        name: file.name,
                    });
                } else {
                    reject(new Error(`Failed to upload ${file.name}`));
                }
            };

            xhr.onerror = () => reject(new Error(`Network error while uploading ${file.name}`));

            xhr.open("POST", url);
            xhr.send(formData);
        });

        results.push(fileResult);
        if (onProgressUpdate) {
            const avg = Math.round(fileProgresses.reduce((a, b) => a + b, 0) / total);
            onProgressUpdate(results.length, total, avg);
        }
    }

    return results;
}
