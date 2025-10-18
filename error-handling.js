// نظام متكامل لعرض الإشعارات والأخطاء
function showNotification(options) {
    const defaults = {
        type: 'info', // info, success, error, warning
        title: '',
        message: '',
        solution: '',
        duration: 5000,
        position: 'bottom-right',
        dismissible: true
    };

    const settings = { ...defaults, ...options };

    // تحديد الألوان والأيقونات حسب نوع الإشعار
    const styles = {
        info: { bg: 'bg-blue-500', icon: 'ℹ️' },
        success: { bg: 'bg-green-500', icon: '✅' },
        error: { bg: 'bg-red-500', icon: '❌' },
        warning: { bg: 'bg-yellow-500', icon: '⚠️' }
    };

    const notification = document.createElement('div');
    notification.className = `fixed ${settings.position.includes('top') ? 'top-4' : 'bottom-4'} ${settings.position.includes('left') ? 'left-4' : 'right-4'} ${styles[settings.type].bg} text-white p-4 rounded-lg shadow-lg z-50 transform translate-y-20 opacity-0 transition-all duration-300 max-w-md`;
    notification.style.direction = 'rtl';

    let content = `
        <div class="flex items-start">
            <div class="mr-2 mt-1">${styles[settings.type].icon}</div>
            <div class="flex-1">
                ${settings.title ? `<p class="font-bold mb-1">${settings.title}</p>` : ''}
                <p>${settings.message}</p>
                ${settings.solution ? `<p class="mt-2 text-sm bg-white bg-opacity-20 p-2 rounded">${settings.solution}</p>` : ''}
            </div>
            ${settings.dismissible ? `
            <button class="ml-2 text-white hover:text-gray-200 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>` : ''}
        </div>
    `;

    notification.innerHTML = content;
    document.body.appendChild(notification);

    // إظهار الإشعار بتأثير حركي
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 10);

    // إضافة مستمع حدث لزر الإغلاق
    if (settings.dismissible) {
        const closeButton = notification.querySelector('button');
        closeButton.addEventListener('click', () => {
            closeNotification();
        });
    }

    // دالة إغلاق الإشعار
    function closeNotification() {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // إغلاق الإشعار تلقائيًا بعد المدة المحددة
    if (settings.duration > 0) {
        setTimeout(() => {
            closeNotification();
        }, settings.duration);
    }

    // إرجاع كائن يحتوي على دالة إغلاق الإشعار
    return {
        close: closeNotification
    };
}

// دوال مختصرة لأنواع الإشعارات المختلفة
window.showSuccess = function(message, solution = '', duration = 3000) {
    return showNotification({
        type: 'success',
        title: 'تم بنجاح',
        message,
        solution,
        duration
    });
}

window.showError = function(message, solution = '', duration = 5000) {
    return showNotification({
        type: 'error',
        title: 'حدث خطأ',
        message,
        solution,
        duration
    });
}

window.showWarning = function(message, solution = '', duration = 4000) {
    return showNotification({
        type: 'warning',
        title: 'تنبيه',
        message,
        solution,
        duration
    });
}

window.showInfo = function(message, solution = '', duration = 4000) {
    return showNotification({
        type: 'info',
        title: 'معلومات',
        message,
        solution,
        duration
    });
}

// دوال متخصصة لعرض رسائل التخزين
window.showStorageSuccess = function(message) {
    showSuccess(message || 'تم حفظ البيانات بنجاح');
}

window.showStorageError = function(type, message) {
    let errorMessage = message;
    let solution = '';

    // تقديم حلول مناسبة حسب نوع الخطأ
    if (message.includes('quota') || message.includes('حجم البيانات كبير')) {
        solution = 'حاول حذف بعض المهام القديمة لتوفير مساحة تخزين';
    } else if (message.includes('غير متاح')) {
        solution = 'جرب استخدام متصفح آخر أو تحديث المتصفح الحالي';
    }

    showError(`خطأ في ${type} البيانات: ${errorMessage}`, solution);

    // تسجيل الخطأ للتحليل
    console.error(`[Storage Error] Type: ${type}, Message: ${message}`);
}

// إظهار إشعار المزامنة
window.showSyncNotification = function() {
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.innerHTML = `
        <div class="sync-icon">🔄</div>
        <div class="sync-content">
            <p>تم مزامنة البيانات بنجاح</p>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
