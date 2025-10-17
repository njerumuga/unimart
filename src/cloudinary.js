// src/cloudinary.js

// ✅ Replace these with your actual Cloudinary details
export const CLOUDINARY_UPLOAD_PRESET = "ml_default";  // e.g., "unimart_uploads"
export const CLOUDINARY_CLOUD_NAME = "dxisjknbc";      // your Cloudinary cloud name

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file selected by the user
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} - Returns the secure URL of the uploaded image
 */
export async function uploadToCloudinary(file, onProgress) {
    if (!file) throw new Error("No file selected for upload");

    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed (JPEG, PNG, etc.)");
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    console.log("☁️ Uploading to Cloudinary:", file.name, "(", file.type, ")");

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
                    console.log("✅ Uploaded:", response.secure_url);
                    resolve(response.secure_url);
                } else {
                    console.error("❌ Upload error:", xhr.responseText);
                    reject(new Error("Upload failed — check Cloudinary preset or API settings."));
                }
            };

            xhr.onerror = () => reject(new Error("Network error during upload."));
        });

        xhr.open("POST", url);
        xhr.send(formData);
        return promise;
    } catch (err) {
        console.error("❌ Cloudinary upload failed:", err);
        throw new Error("Image upload failed. Please try again later.");
    }
}
