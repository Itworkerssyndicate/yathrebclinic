/**
 * ============================================
 * إعدادات Firebase - مركز يثرب الخيري التخصصي
 * ============================================
 * هذا الملف يحتوي على إعدادات Firebase الأساسية
 * يستخدم في جميع صفحات المشروع
 * ============================================
 */

// ============================================
// إعدادات Firebase
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyDMXfjOsas18yb0b8mbbhGqJj78yFFTVyU",
    authDomain: "yathreb-10909.firebaseapp.com",
    projectId: "yathreb-10909",
    storageBucket: "yathreb-10909.firebasestorage.app",
    messagingSenderId: "525635197745",
    appId: "1:525635197745:web:99e1cbab31693af790ae10",
    measurementId: "G-K6ZCNDLCE1"
};

// ============================================
// تهيئة Firebase
// ============================================
// التحقق من عدم وجود تهيئة سابقة لتجنب الأخطاء
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // استخدام التهيئة الموجودة
}

// ============================================
// المصادقة (Authentication)
// ============================================
const auth = firebase.auth();

// ============================================
// قاعدة البيانات (Firestore)
// ============================================
const db = firebase.firestore();

// ============================================
// التخزين (Storage)
// ============================================
const storage = firebase.storage();

// ============================================
// دوال مساعدة
// ============================================

/**
 * الحصول على المستخدم الحالي
 * @returns {Promise<Object|null>} بيانات المستخدم أو null
 */
async function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
}

/**
 * الحصول على بيانات المستخدم من Firestore
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object|null>} بيانات المستخدم
 */
async function getUserData(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * التحقق من صلاحيات المستخدم
 * @param {string} userId - معرف المستخدم
 * @param {Array<string>} allowedRoles - الأدوار المسموح بها
 * @returns {Promise<boolean>} هل المستخدم مصرح له
 */
async function checkUserPermission(userId, allowedRoles) {
    try {
        const userData = await getUserData(userId);
        if (!userData) return false;
        return allowedRoles.includes(userData.role);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * تسجيل الخروج
 */
async function logout() {
    try {
        await auth.signOut();
        window.location.href = '/admin/login.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

/**
 * عرض رسالة للمستخدم
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success, error, warning)
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        font-family: 'Cairo', sans-serif;
        font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// تصدير الدوال والمتغيرات
// ============================================
export { 
    auth, 
    db, 
    storage, 
    getCurrentUser, 
    getUserData, 
    checkUserPermission, 
    logout, 
    showToast 
};
