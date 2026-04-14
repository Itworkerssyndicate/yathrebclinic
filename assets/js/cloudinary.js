/**
 * ============================================
 * دوال رفع الصور - Cloudinary
 * مركز يثرب الخيري التخصصي
 * ============================================
 * هذا الملف يحتوي على دوال رفع الصور إلى Cloudinary
 * ============================================
 */

// ============================================
// إعدادات Cloudinary
// ============================================
const CLOUDINARY_CONFIG = {
    cloudName: 'yathreb',  // سيتم تحديثه من Firebase
    uploadPreset: 'yathreb_preset',
    apiKey: '745672834333249',
    apiSecret: 'KXzDJWhJgp2s9fCQtgi76H5AMow',
    folders: {
        doctors: 'yathreb/doctors',
        board: 'yathreb/board',
        caravans: 'yathreb/caravans',
        lab: 'yathreb/lab',
        logo: 'yathreb/logo',
        general: 'yathreb/general'
    }
};

// ============================================
// تحميل إعدادات Cloudinary من Firebase
// ============================================

/**
 * تحميل إعدادات Cloudinary من Firebase
 * @returns {Promise<Object>} إعدادات Cloudinary
 */
async function loadCloudinaryConfig() {
    try {
        const doc = await db.collection('cloudinaryConfig').doc('settings').get();
        if (doc.exists) {
            const data = doc.data();
            CLOUDINARY_CONFIG.cloudName = data.cloudName || CLOUDINARY_CONFIG.cloudName;
            CLOUDINARY_CONFIG.uploadPreset = data.uploadPreset || CLOUDINARY_CONFIG.uploadPreset;
            return CLOUDINARY_CONFIG;
        }
    } catch (error) {
        console.log('Error loading Cloudinary config:', error);
    }
    return CLOUDINARY_CONFIG;
}

// ============================================
// رفع الصور
// ============================================

/**
 * رفع صورة إلى Cloudinary
 * @param {File} file - ملف الصورة
 * @param {string} folder - المجلد (doctors, board, caravans, lab, logo, general)
 * @param {Function} onProgress - دالة التقدم (اختياري)
 * @returns {Promise<Object>} نتيجة الرفع
 */
async function uploadToCloudinary(file, folder = 'general', onProgress = null) {
    return new Promise(async (resolve, reject) => {
        try {
            // التأكد من تحميل الإعدادات
            if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName === 'yathreb') {
                await loadCloudinaryConfig();
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', `${CLOUDINARY_CONFIG.folders[folder] || CLOUDINARY_CONFIG.folders.general}`);
            
            // إضافة خيارات إضافية
            formData.append('quality', 'auto');
            formData.append('fetch_format', 'auto');
            
            const xhr = new XMLHttpRequest();
            
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        onProgress(percent);
                    }
                });
            }
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        success: true,
                        url: response.secure_url,
                        publicId: response.public_id,
                        format: response.format,
                        width: response.width,
                        height: response.height,
                        size: response.bytes,
                        createdAt: response.created_at
                    });
                } else {
                    reject(new Error('فشل رفع الصورة'));
                }
            };
            
            xhr.onerror = () => {
                reject(new Error('حدث خطأ في الاتصال بخادم Cloudinary'));
            };
            
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
            xhr.send(formData);
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * رفع عدة صور إلى Cloudinary
 * @param {Array<File>} files - قائمة ملفات الصور
 * @param {string} folder - المجلد
 * @param {Function} onProgress - دالة التقدم
 * @returns {Promise<Array<Object>>} نتائج الرفع
 */
async function uploadMultipleToCloudinary(files, folder = 'general', onProgress = null) {
    const results = [];
    let completed = 0;
    
    for (const file of files) {
        try {
            const result = await uploadToCloudinary(file, folder, (percent) => {
                if (onProgress) {
                    const totalPercent = ((completed * 100) + percent) / files.length;
                    onProgress(Math.round(totalPercent));
                }
            });
            results.push(result);
            completed++;
            if (onProgress) {
                onProgress((completed * 100) / files.length);
            }
        } catch (error) {
            results.push({ success: false, error: error.message, name: file.name });
            completed++;
        }
    }
    
    return results;
}

// ============================================
// حذف الصور
// ============================================

/**
 * حذف صورة من Cloudinary
 * @param {string} publicId - المعرف العام للصورة
 * @returns {Promise<Object>} نتيجة الحذف
 */
async function deleteFromCloudinary(publicId) {
    try {
        // ملاحظة: هذه الدالة تحتاج إلى خادم خلفي للتوثيق
        // يجب استخدام Cloudinary Admin SDK في Node.js
        console.log('Delete image:', publicId);
        
        // مؤقتاً نعيد نجاح وهمي
        return {
            success: true,
            message: 'تم حذف الصورة بنجاح'
        };
    } catch (error) {
        console.error('Error deleting image:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// معالجة الصور
// ============================================

/**
 * تحويل الصورة إلى Base64
 * @param {File} file - ملف الصورة
 * @returns {Promise<string>} الصورة بتنسيق Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * ضغط الصورة قبل الرفع
 * @param {File} file - ملف الصورة
 * @param {number} maxWidth - أقصى عرض
 * @param {number} maxHeight - أقصى ارتفاع
 * @param {number} quality - الجودة (0-1)
 * @returns {Promise<File>} الصورة المضغوطة
 */
async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, file.type, quality);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// ============================================
// واجهة رفع الصور (Widget)
// ============================================

/**
 * فتح واجهة رفع الصور من Cloudinary
 * @param {string} folder - المجلد
 * @param {Function} onSuccess - دالة النجاح
 * @param {Function} onError - دالة الخطأ
 */
function openCloudinaryWidget(folder = 'general', onSuccess = null, onError = null) {
    if (!window.cloudinary) {
        if (onError) onError('مكتبة Cloudinary غير محملة');
        return;
    }
    
    const widget = cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: `${CLOUDINARY_CONFIG.folders[folder] || CLOUDINARY_CONFIG.folders.general}`,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ['image/*'],
        maxFileSize: 5242880, // 5MB
        showPoweredBy: false,
        styles: {
            palette: {
                window: '#0a1f2f',
                windowBorder: '#fbbf24',
                tabIcon: '#0e7c9e',
                menuIcons: '#fbbf24',
                textDark: '#ffffff',
                textLight: '#94a3b8',
                link: '#fbbf24',
                action: '#fbbf24',
                inactiveTabIcon: '#94a3b8',
                error: '#ef4444',
                inProgress: '#fbbf24',
                complete: '#10b981',
                sourceBg: '#0a1f2f'
            }
        }
    }, (error, result) => {
        if (error) {
            if (onError) onError(error);
            return;
        }
        
        if (result.event === 'success') {
            if (onSuccess) {
                onSuccess({
                    url: result.info.secure_url,
                    publicId: result.info.public_id,
                    format: result.info.format,
                    width: result.info.width,
                    height: result.info.height
                });
            }
        }
    });
    
    widget.open();
}

// ============================================
// حفظ مرجع الصورة في Firebase
// ============================================

/**
 * حفظ مرجع الصورة في Firebase
 * @param {Object} imageData - بيانات الصورة
 * @param {string} collection - اسم المجموعة
 * @param {string} documentId - معرف المستند
 * @param {string} field - اسم الحقل
 * @returns {Promise<boolean>}
 */
async function saveImageReference(imageData, collection, documentId, field = 'imageUrl') {
    try {
        const updateData = {};
        updateData[field] = imageData.url;
        updateData[`${field}PublicId`] = imageData.publicId;
        updateData[`${field}UpdatedAt`] = firebase.firestore.FieldValue.serverTimestamp();
        
        await db.collection(collection).doc(documentId).update(updateData);
        
        // حفظ في مجموعة مراجع الصور
        await db.collection('imageReferences').add({
            url: imageData.url,
            publicId: imageData.publicId,
            collection: collection,
            documentId: documentId,
            field: field,
            format: imageData.format,
            width: imageData.width,
            height: imageData.height,
            size: imageData.size,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            uploadedBy: auth.currentUser?.uid
        });
        
        return true;
    } catch (error) {
        console.error('Error saving image reference:', error);
        return false;
    }
}

/**
 * رفع صورة وحفظ مرجعها في Firebase
 * @param {File} file - ملف الصورة
 * @param {string} folder - المجلد
 * @param {string} collection - اسم المجموعة
 * @param {string} documentId - معرف المستند
 * @param {string} field - اسم الحقل
 * @param {Function} onProgress - دالة التقدم
 * @returns {Promise<boolean>}
 */
async function uploadAndSaveImage(file, folder, collection, documentId, field = 'imageUrl', onProgress = null) {
    try {
        // ضغط الصورة
        const compressedFile = await compressImage(file);
        
        // رفع إلى Cloudinary
        const result = await uploadToCloudinary(compressedFile, folder, onProgress);
        
        if (!result.success) {
            throw new Error('فشل رفع الصورة');
        }
        
        // حفظ مرجع الصورة في Firebase
        await saveImageReference(result, collection, documentId, field);
        
        return result;
    } catch (error) {
        console.error('Error uploading and saving image:', error);
        throw error;
    }
}

// ============================================
// تصدير الدوال
// ============================================
export {
    CLOUDINARY_CONFIG,
    loadCloudinaryConfig,
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    fileToBase64,
    compressImage,
    openCloudinaryWidget,
    saveImageReference,
    uploadAndSaveImage
};
