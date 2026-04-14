/**
 * ============================================
 * الدوال الرئيسية - مركز يثرب الخيري التخصصي
 * ============================================
 * هذا الملف يحتوي على الدوال الرئيسية المستخدمة في جميع صفحات المشروع
 * ============================================
 */

// ============================================
// دوال التنسيق والتحويل
// ============================================

/**
 * تحويل الأرقام إلى الأرقام العربية
 * @param {number|string} num - الرقم المراد تحويله
 * @returns {string} الرقم بالأرقام العربية
 */
function toArabicNumbers(num) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function(d) {
        return arabicNumbers[d];
    });
}

/**
 * تحويل الأرقام إلى الأرقام الإنجليزية
 * @param {string} arabicNum - الرقم بالأرقام العربية
 * @returns {string} الرقم بالأرقام الإنجليزية
 */
function toEnglishNumbers(arabicNum) {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return arabicNum.toString().replace(/[٠-٩]/g, function(d) {
        return englishNumbers[d.charCodeAt(0) - 0x0660];
    });
}

/**
 * تنسيق التاريخ
 * @param {Date|string} date - التاريخ المراد تنسيقه
 * @param {string} format - صيغة التنسيق (default: 'yyyy-mm-dd')
 * @returns {string} التاريخ المنسق
 */
function formatDate(date, format = 'yyyy-mm-dd') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;
    if (format === 'dd/mm/yyyy') return `${day}/${month}/${year}`;
    if (format === 'ar') return `${toArabicNumbers(day)}/${toArabicNumbers(month)}/${toArabicNumbers(year)}`;
    return `${year}-${month}-${day}`;
}

/**
 * تنسيق الوقت
 * @param {string} time - الوقت (hh:mm)
 * @param {boolean} arabic - هل يستخدم الأرقام العربية
 * @returns {string} الوقت المنسق
 */
function formatTime(time, arabic = false) {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    if (arabic) {
        return `${toArabicNumbers(hours)}:${toArabicNumbers(minutes)}`;
    }
    return `${hours}:${minutes}`;
}

/**
 * تنسيق السعر
 * @param {number} price - السعر
 * @param {boolean} arabic - هل يستخدم الأرقام العربية
 * @returns {string} السعر المنسق
 */
function formatPrice(price, arabic = false) {
    if (!price && price !== 0) return '---';
    const formatted = price.toLocaleString();
    if (arabic) {
        return toArabicNumbers(formatted) + ' ج.م';
    }
    return formatted + ' ج.م';
}

// ============================================
// دوال معالجة الأرقام والهواتف
// ============================================

/**
 * تنظيف رقم الهاتف (إزالة الأحرف غير الرقمية)
 * @param {string} phone - رقم الهاتف
 * @returns {string} الرقم المنظف
 */
function cleanPhoneNumber(phone) {
    return phone.toString().replace(/[^0-9+]/g, '');
}

/**
 * فتح واتساب
 * @param {string} phone - رقم الهاتف
 * @param {string} message - الرسالة (اختياري)
 */
function openWhatsApp(phone, message = '') {
    const cleanPhone = cleanPhoneNumber(phone);
    let url = `https://wa.me/${cleanPhone}`;
    if (message) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    window.open(url, '_blank');
}

/**
 * الاتصال بالرقم
 * @param {string} phone - رقم الهاتف
 */
function callPhone(phone) {
    const cleanPhone = cleanPhoneNumber(phone);
    window.location.href = `tel:${cleanPhone}`;
}

/**
 * فتح البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @param {string} subject - الموضوع
 * @param {string} body - نص البريد
 */
function openEmail(email, subject = '', body = '') {
    let url = `mailto:${email}`;
    if (subject) url += `?subject=${encodeURIComponent(subject)}`;
    if (body) url += `&body=${encodeURIComponent(body)}`;
    window.location.href = url;
}

// ============================================
// دوال معالجة الصور
// ============================================

/**
 * تحميل الصورة من الرابط
 * @param {string} url - رابط الصورة
 * @returns {Promise<string>} رابط الصورة
 */
async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('فشل تحميل الصورة'));
        img.src = url;
    });
}

/**
 * الحصول على صورة افتراضية حسب النوع
 * @param {string} type - نوع الصورة (doctor, lab, board, caravan)
 * @returns {string} رابط الصورة الافتراضية
 */
function getPlaceholderImage(type = 'default') {
    const placeholders = {
        doctor: 'https://via.placeholder.com/400x400/0e7c9e/ffffff?text=Doctor',
        lab: 'https://via.placeholder.com/400x400/0e7c9e/ffffff?text=Lab',
        board: 'https://via.placeholder.com/400x400/0e7c9e/ffffff?text=Board',
        caravan: 'https://via.placeholder.com/800x400/0e7c9e/ffffff?text=Caravan',
        default: 'https://via.placeholder.com/400x400/0e7c9e/ffffff?text=Yathreb'
    };
    return placeholders[type] || placeholders.default;
}

// ============================================
// دوال التحقق من الصلاحيات
// ============================================

/**
 * التحقق من أن المستخدم أدمن
 * @returns {Promise<boolean>}
 */
async function isAdmin() {
    try {
        const user = await getCurrentUser();
        if (!user) return false;
        const userData = await getUserData(user.uid);
        return userData && (userData.role === 'super_admin' || userData.role === 'admin');
    } catch (error) {
        console.error('Error checking admin:', error);
        return false;
    }
}

/**
 * التحقق من أن المستخدم سوبر أدمن
 * @returns {Promise<boolean>}
 */
async function isSuperAdmin() {
    try {
        const user = await getCurrentUser();
        if (!user) return false;
        const userData = await getUserData(user.uid);
        return userData && userData.role === 'super_admin';
    } catch (error) {
        console.error('Error checking super admin:', error);
        return false;
    }
}

/**
 * التحقق من المصادقة وإعادة التوجيه إذا لم يكن مسجلاً
 * @param {Array<string>} allowedRoles - الأدوار المسموح بها
 */
async function requireAuth(allowedRoles = ['super_admin', 'admin']) {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/admin/login.html';
        return false;
    }
    
    if (allowedRoles && allowedRoles.length > 0) {
        const userData = await getUserData(user.uid);
        if (!userData || !allowedRoles.includes(userData.role)) {
            window.location.href = '/admin/login.html';
            return false;
        }
    }
    
    return true;
}

// ============================================
// دوال التحميل
// ============================================

/**
 * تحميل البيانات من Firestore مع تخزين مؤقت
 * @param {string} collection - اسم المجموعة
 * @param {string} docId - معرف المستند (اختياري)
 * @param {number} cacheTime - وقت التخزين المؤقت (بالمللي ثانية)
 * @returns {Promise<Object|Array>}
 */
async function fetchData(collection, docId = null, cacheTime = 60000) {
    const cacheKey = `cache_${collection}${docId ? `_${docId}` : ''}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTime) {
            return data;
        }
    }
    
    let result;
    if (docId) {
        const doc = await db.collection(collection).doc(docId).get();
        result = doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
        const snapshot = await db.collection(collection).get();
        result = [];
        snapshot.forEach(doc => {
            result.push({ id: doc.id, ...doc.data() });
        });
    }
    
    localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
    }));
    
    return result;
}

/**
 * مسح التخزين المؤقت
 * @param {string} collection - اسم المجموعة (اختياري)
 */
function clearCache(collection = null) {
    if (collection) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(`cache_${collection}`)) {
                localStorage.removeItem(key);
            }
        });
    } else {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

// ============================================
// دوال العناصر التفاعلية
// ============================================

/**
 * إضافة تأثير ripple عند النقر
 * @param {HTMLElement} element - العنصر
 */
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

/**
 * إضافة تأثير التحميل للزر
 * @param {HTMLElement} button - الزر
 * @param {string} text - النص أثناء التحميل
 * @returns {Function} دالة لإيقاف التحميل
 */
function showButtonLoading(button, text = 'جاري التحميل...') {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> ${text}`;
    return () => {
        button.disabled = false;
        button.innerHTML = originalText;
    };
}

/**
 * إغلاق النوافذ المنبثقة عند النقر خارجها
 * @param {HTMLElement} modal - عنصر المودال
 * @param {HTMLElement} closeBtn - زر الإغلاق
 */
function setupModalClose(modal, closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// ============================================
// دوال الرسوم البيانية
// ============================================

/**
 * إنشاء رسم بياني خطي
 * @param {string} canvasId - معرف العنصر
 * @param {Array} labels - التسميات
 * @param {Array} data - البيانات
 * @param {string} label - تسمية البيانات
 * @returns {Chart} كائن الرسم البياني
 */
function createLineChart(canvasId, labels, data, label = 'القيم') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

/**
 * إنشاء رسم بياني دائري
 * @param {string} canvasId - معرف العنصر
 * @param {Array} labels - التسميات
 * @param {Array} data - البيانات
 * @returns {Chart} كائن الرسم البياني
 */
function createDoughnutChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const colors = ['#0e7c9e', '#fbbf24', '#10b981', '#8b5cf6', '#f97316', '#ef4444'];
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } }
            }
        }
    });
}

// ============================================
// دوال التاريخ والوقت
// ============================================

/**
 * حساب المدة بين تاريخين
 * @param {Date|string} startDate - تاريخ البداية
 * @param {Date|string} endDate - تاريخ النهاية
 * @returns {Object} المدة (days, hours, minutes, seconds)
 */
function getDateDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
}

/**
 * التحقق من أن التاريخ صالح
 * @param {string} dateString - التاريخ
 * @returns {boolean}
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// ============================================
// تصدير الدوال
// ============================================
export {
    toArabicNumbers,
    toEnglishNumbers,
    formatDate,
    formatTime,
    formatPrice,
    cleanPhoneNumber,
    openWhatsApp,
    callPhone,
    openEmail,
    loadImage,
    getPlaceholderImage,
    isAdmin,
    isSuperAdmin,
    requireAuth,
    fetchData,
    clearCache,
    addRippleEffect,
    showButtonLoading,
    setupModalClose,
    createLineChart,
    createDoughnutChart,
    getDateDifference,
    isValidDate
};
