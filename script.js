document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    // --- DOM Elements ---
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    const taskTypeSelect = document.getElementById('task-type');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskAlarmCheckbox = document.getElementById('task-alarm');
    const addTaskBtn = document.getElementById('add-task-btn');
    const titleError = document.getElementById('title-error');
    
    const showBoardBtn = document.getElementById('show-board-btn');
    const showAgendaBtn = document.getElementById('show-agenda-btn');
    const boardView = document.getElementById('board-view');
    const agendaView = document.getElementById('agenda-view');
    const taskBoard = document.getElementById('task-board');
    const loader = document.getElementById('loader');
    
    // --- Search and Filter Elements ---
    const searchInput = document.getElementById('search-input');
    const sortBySelect = document.getElementById('sort-by');
    const advancedFilterBtn = document.getElementById('advanced-filter-btn');
    const advancedFilterPanel = document.getElementById('advanced-filter-panel');
    const filterType = document.getElementById('filter-type');
    const filterStatus = document.getElementById('filter-status');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    const taskModal = document.getElementById('task-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- State Management ---
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [notificationSettings, setNotificationSettings] = useLocalStorage('notificationSettings', {
        enabled: false,
        reminderTime: 60, // دقائق قبل الموعد (افتراضي: ساعة)
        showCompletionNotifications: true
    });
    let currentView = 'board';
    let filteredTasks = [...tasks]; // نسخة من المهام للفلترة
    let activeFilters = {
        search: '',
        sort: 'default',
        type: 'all',
        status: 'all',
        dateFrom: '',
        dateTo: ''
    };
    
    // --- نظام إدارة الأخطاء والإشعارات ---
    const errorMessages = {
        emptyTitle: 'يجب إدخال عنوان للمهمة',
        invalidDate: 'يرجى إدخال تاريخ صحيح',
        pastDate: 'لا يمكن إضافة مهمة بتاريخ في الماضي',
        storageError: 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى',
        loadError: 'تعذر تحميل البيانات المخزنة. سيتم استخدام بيانات افتراضية',
        deleteError: 'تعذر حذف المهمة. يرجى المحاولة مرة أخرى',
        updateError: 'تعذر تحديث المهمة. يرجى المحاولة مرة أخرى',
        notificationPermission: 'يرجى السماح بالإشعارات للاستفادة من تذكيرات المهام',
        browserSupport: 'متصفحك لا يدعم بعض الميزات المطلوبة. قد لا تعمل بعض الوظائف بشكل صحيح'
    };

    // --- Enhanced LocalStorage Management with Fallback ---
    function useLocalStorage(key, initialValue) {
        let storedValue = initialValue;
        let useInMemoryStorage = false;
        let inMemoryStorage = {};
        
        // التحقق من توفر LocalStorage
        const isLocalStorageAvailable = () => {
            try {
                const testKey = '__storage_test__';
                window.localStorage.setItem(testKey, testKey);
                window.localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        };
        
        // تهيئة نظام التخزين البديل إذا كان LocalStorage غير متاح
        if (!isLocalStorageAvailable()) {
            useInMemoryStorage = true;
            console.warn('⚠️ LocalStorage غير متاح، سيتم استخدام التخزين المؤقت في الذاكرة');
            showWarning(
                'التخزين المحلي غير متاح في هذا المتصفح',
                'سيتم استخدام التخزين المؤقت في الذاكرة. ستفقد البيانات عند إغلاق الصفحة أو تحديثها.'
            );
        }
        
        // تحسين تحميل البيانات من LocalStorage مع دعم التخزين البديل
        function loadFromStorage() {
            try {
                if (useInMemoryStorage) {
                    const value = inMemoryStorage[key] || initialValue;
                    if (Array.isArray(storedValue) && Array.isArray(value)) {
                        storedValue.length = 0;
                        Array.prototype.push.apply(storedValue, value);
                    } else {
                        storedValue = value;
                    }
                    return;
                }
                
                const item = window.localStorage.getItem(key);
                if (item) {
                    try {
                        const parsedItem = JSON.parse(item);
                        if (Array.isArray(storedValue) && Array.isArray(parsedItem)) {
                            storedValue.length = 0;
                            Array.prototype.push.apply(storedValue, parsedItem);
                        } else {
                            storedValue = parsedItem;
                        }
                        console.log(`✅ تم تحميل البيانات بنجاح من LocalStorage [${key}]`);
                    } catch (parseError) {
                        console.error(`❌ خطأ في تحليل البيانات من LocalStorage [${key}]:`, parseError);
                        
                        // محاولة إصلاح البيانات التالفة
                        try {
                            // حفظ نسخة من البيانات التالفة للتحليل
                            window.localStorage.setItem(`${key}_corrupted`, item);
                            
                            // استخدام القيمة الافتراضية
                            showError(
                                'تم اكتشاف بيانات تالفة',
                                'تم حفظ نسخة من البيانات التالفة وإعادة تعيين البيانات. يمكنك محاولة استعادة البيانات من خلال الإعدادات.'
                            );
                            
                        } catch (backupError) {
                            console.error('فشل في حفظ نسخة من البيانات التالفة:', backupError);
                        }
                    }
                } else {
                    console.log(`⚠️ لم يتم العثور على بيانات في LocalStorage [${key}]، استخدام القيمة الافتراضية`);
                }
            } catch (error) {
                console.error(`❌ خطأ أثناء تحميل البيانات من LocalStorage [${key}]:`, error);
                
                // التحول إلى التخزين البديل في حالة فشل LocalStorage
                if (!useInMemoryStorage) {
                    useInMemoryStorage = true;
                    showWarning(
                        'تم التحول إلى التخزين المؤقت',
                        'حدث خطأ أثناء الوصول إلى التخزين المحلي. سيتم استخدام التخزين المؤقت في الذاكرة بدلاً من ذلك.'
                    );
                } else {
                    showStorageError('قراءة', error.message);
                }
            }
        }
        
        // تحميل البيانات عند التهيئة
        loadFromStorage();
        
        // تحسين حفظ البيانات في LocalStorage مع دعم التخزين البديل
        const setValue = (value) => {
            try {
                // التحقق من نوع القيمة (دالة أو قيمة مباشرة)
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                
                if (useInMemoryStorage) {
                    // حفظ البيانات في الذاكرة المؤقتة
                    inMemoryStorage[key] = valueToStore;
                    
                    // تحديث القيمة المخزنة محليًا
                    if (Array.isArray(storedValue) && Array.isArray(valueToStore)) {
                        storedValue.length = 0;
                        Array.prototype.push.apply(storedValue, valueToStore);
                    } else {
                        storedValue = valueToStore;
                    }
                    
                    console.log(`✅ تم حفظ البيانات بنجاح في الذاكرة المؤقتة [${key}]`);
                    
                    // محاولة استخدام LocalStorage مرة أخرى في المستقبل
                    if (isLocalStorageAvailable()) {
                        useInMemoryStorage = false;
                        showInfo(
                            'تم استعادة التخزين المحلي',
                            'سيتم استخدام التخزين المحلي مرة أخرى للحفاظ على بياناتك.'
                        );
                    }
                    
                    return true;
                }
                
                // التحقق من المساحة المتاحة في LocalStorage
                const valueSize = JSON.stringify(valueToStore).length;
                if (valueSize > 5000000) { // تقريبًا 5 ميجابايت (حد آمن)
                    // التحول إلى التخزين البديل في حالة البيانات الكبيرة
                    useInMemoryStorage = true;
                    inMemoryStorage[key] = valueToStore;
                    
                    showWarning(
                        'حجم البيانات كبير جدًا للتخزين المحلي',
                        'تم التحول إلى التخزين المؤقت في الذاكرة. قد تفقد البيانات عند إغلاق الصفحة.'
                    );
                    
                    return true;
                }
                
                // حفظ البيانات في LocalStorage
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                
                // تحديث القيمة المخزنة محليًا
                if (Array.isArray(storedValue) && Array.isArray(valueToStore)) {
                    storedValue.length = 0;
                    Array.prototype.push.apply(storedValue, valueToStore);
                } else {
                    storedValue = valueToStore;
                }
                
                console.log(`✅ تم حفظ البيانات بنجاح في LocalStorage [${key}]`);
                
                // إطلاق حدث مخصص للإشارة إلى تحديث البيانات
                const storageEvent = new CustomEvent('localstorage-updated', { 
                    detail: { key, value: valueToStore } 
                });
                window.dispatchEvent(storageEvent);
                
                return true;
            } catch (error) {
                console.error(`❌ خطأ أثناء حفظ البيانات في LocalStorage [${key}]:`, error);
                
                // التحول إلى التخزين البديل في حالة فشل LocalStorage
                if (!useInMemoryStorage) {
                    useInMemoryStorage = true;
                    inMemoryStorage[key] = value instanceof Function ? value(storedValue) : value;
                    
                    showWarning(
                        'تم التحول إلى التخزين المؤقت',
                        'حدث خطأ أثناء الكتابة في التخزين المحلي. سيتم استخدام التخزين المؤقت في الذاكرة بدلاً من ذلك.'
                    );
                    
                    return true;
                } else {
                    showStorageError('كتابة', error.message);
                    return false;
                }
            }
        };
        
        // إضافة دالة لتصدير البيانات
        const exportData = () => {
            try {
                const dataToExport = {
                    tasks: storedValue,
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };
                return JSON.stringify(dataToExport, null, 2);
            } catch (error) {
                console.error('خطأ في تصدير البيانات:', error);
                showError('فشل في تصدير البيانات', 'حدث خطأ أثناء تحضير البيانات للتصدير');
                return null;
            }
        };
        // إضافة دالة لاستيراد البيانات
        const importData = (jsonData) => {
            try {
                const parsedData = JSON.parse(jsonData);
                setValue(parsedData);
                showSuccess('تم استيراد البيانات بنجاح');
                return true;
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                showError('فشل في استيراد البيانات', 'تأكد من صحة تنسيق البيانات');
                return false;
            }
        };
        
        return [storedValue, setValue, loadFromStorage, exportData, importData];
    }
    
    // --- نظام الإشعارات ---
    
    // التحقق من دعم الإشعارات
    function areNotificationsSupported() {
        return 'Notification' in window;
    }
    
    // طلب إذن الإشعارات
    function requestNotificationPermission() {
        return new Promise((resolve, reject) => {
            if (!areNotificationsSupported()) {
                reject(new Error('الإشعارات غير مدعومة في هذا المتصفح'));
                return;
            }
            
            Notification.requestPermission()
                .then(permission => {
                    if (permission === 'granted') {
                        // تحديث إعدادات الإشعارات
                        const updatedSettings = { ...notificationSettings, enabled: true };
                        setNotificationSettings(updatedSettings);
                        resolve(permission);
                    } else {
                        // تحديث إعدادات الإشعارات
                        const updatedSettings = { ...notificationSettings, enabled: false };
                        setNotificationSettings(updatedSettings);
                        reject(new Error('تم رفض إذن الإشعارات'));
                    }
                });
        });
    }
    
    // إرسال إشعار
    function sendNotification(title, options = {}) {
        return new Promise((resolve, reject) => {
            if (!areNotificationsSupported()) {
                reject(new Error('الإشعارات غير مدعومة في هذا المتصفح'));
                return;
            }
            
            if (Notification.permission !== 'granted') {
                reject(new Error('لم يتم منح إذن الإشعارات'));
                return;
            }
            
            try {
                const notification = new Notification(title, {
                    icon: options.icon || '/favicon.ico',
                    body: options.body || '',
                    tag: options.tag || 'todo-app',
                    ...options
                });
                
                notification.onclick = function() {
                    window.focus();
                    if (options.onClick) options.onClick();
                    notification.close();
                };
                
                notification.onclose = function() {
                    if (options.onClose) options.onClose();
                };
                
                resolve(notification);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // إشعار اقتراب موعد المهمة
    function scheduleTaskReminder(task) {
        if (!notificationSettings.enabled || !task.date || !task.time || !task.alarm) {
            return;
        }
        
        const taskDateTime = new Date(`${task.date}T${task.time}`);
        const reminderTime = new Date(taskDateTime.getTime() - (notificationSettings.reminderTime * 60 * 1000));
        const now = new Date();
        
        if (reminderTime > now) {
            const timeoutId = setTimeout(() => {
                sendNotification(`تذكير: ${task.title}`, {
                    body: `موعد المهمة بعد ${notificationSettings.reminderTime} دقيقة`,
                    tag: `reminder-${task.id}`,
                    onClick: () => showTaskDetails(task.id)
                }).catch(error => console.error('خطأ في إرسال إشعار التذكير:', error));
            }, reminderTime.getTime() - now.getTime());
            
            // تخزين معرف المؤقت للإلغاء لاحقًا إذا لزم الأمر
            task.reminderId = timeoutId;
        }
    }
    
    // إشعار إتمام المهمة
    function sendTaskCompletionNotification(task) {
        if (!notificationSettings.enabled || !notificationSettings.showCompletionNotifications) {
            return;
        }
        
        sendNotification('تم إكمال المهمة', {
            body: `تم إكمال المهمة: ${task.title}`,
            tag: `completion-${task.id}`
        }).catch(error => console.error('خطأ في إرسال إشعار إتمام المهمة:', error));
    }
    
    // إلغاء جدولة التذكير
    function cancelTaskReminder(task) {
        if (task.reminderId) {
            clearTimeout(task.reminderId);
            delete task.reminderId;
        }
    }
    
    // تحديث جدولة التذكيرات لجميع المهام
    function updateAllTaskReminders() {
        tasks.forEach(task => {
            // إلغاء أي تذكير موجود
            cancelTaskReminder(task);
            
            // إعادة جدولة التذكير إذا كانت المهمة لم تكتمل بعد
            if (task.status !== 'done' && task.alarm) {
                scheduleTaskReminder(task);
            }
        });
    }

    // --- Icons & Mappings ---
    const icons = {
        delete: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
        nextStatus: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`,
        alarm: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };
    const priorityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };
    const priorityBorder = { low: 'border-green-500', medium: 'border-yellow-500', high: 'border-red-500' };

    // --- Component Functions ---
    function TaskItem(task) {
        const itemHTML = `
            <div id="task-${task.id}" onclick="showTaskDetails('${task.id}')" class="task-item bg-white p-4 rounded-lg shadow-sm border-l-4 ${priorityBorder[task.priority]} cursor-pointer transition-transform transform hover:scale-105">
                <p class="font-semibold text-gray-800">${task.title}</p>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority]}">${task.priority}</span>
                    <div class="flex items-center gap-2">
                        <button onclick="event.stopPropagation(); updateTaskStatus('${task.id}')" class="action-btn status-btn text-gray-400 hover:text-blue-500 p-1 rounded-full transition-colors">${icons.nextStatus}</button>
                        <button onclick="event.stopPropagation(); deleteTask('${task.id}')" class="action-btn delete-btn text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors">${icons.delete}</button>
                    </div>
                </div>
            </div>
        `;
        return itemHTML;
    }

    function TaskListColumn(title, tasks) {
        return `
            <div class="bg-gray-200/70 p-4 rounded-xl">
                <h2 class="font-bold text-lg text-gray-700 mb-4">${title} <span class="text-sm font-normal text-gray-500">(${tasks.length})</span></h2>
                <div class="space-y-3">${tasks.map(TaskItem).join('')}</div>
            </div>
        `;
    }

    // --- Core Functions ---
    function validateAndAddTask() {
        // Validate title
        const title = taskTitleInput.value.trim();
        if (title === '') {
            titleError.textContent = 'حقل العنوان مطلوب.';
            taskTitleInput.classList.add('border-red-500');
            return;
        }
        titleError.textContent = '';
        taskTitleInput.classList.remove('border-red-500');

        // إظهار حالة التحميل
        showLoading(boardView);
        
        try {
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                title, 
                description: taskDescriptionInput.value.trim(),
                date: taskDateInput.value, time: taskTimeInput.value,
                type: taskTypeSelect.value, priority: taskPrioritySelect.value,
                alarm: taskAlarmCheckbox.checked, status: 'todo',
                createdAt: new Date().toISOString()
            };
            
            // Add to tasks array with optimistic UI update
            const updatedTasks = [...tasks, newTask];
            
            // حفظ في LocalStorage
            const saveSuccess = setTasks(updatedTasks);
            
            if (saveSuccess) {
                render();
                // إضافة تأثير متحرك للمهمة الجديدة
                setTimeout(() => {
                    const newTaskElement = document.getElementById(`task-${newTask.id}`);
                    if (newTaskElement) {
                        newTaskElement.classList.add('task-enter');
                    }
                }, 100);
            } else {
                // إظهار إشعار خطأ إذا فشل الحفظ
                showStorageError('حفظ', 'فشل حفظ المهمة الجديدة');
            }
            
            // Reset form
            resetForm();
        } catch (error) {
            console.error('❌ خطأ أثناء إضافة المهمة:', error);
            showStorageError('إضافة مهمة', error.message);
        } finally {
            // إخفاء حالة التحميل
            setTimeout(() => {
                hideLoading(boardView);
            }, 300);
        }
    }

    function resetForm() {
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskDateInput.value = '';
        taskTimeInput.value = '';
        taskAlarmCheckbox.checked = false;
        taskTypeSelect.value = 'عام';
        taskPrioritySelect.value = 'low';
        titleError.textContent = '';
        taskTitleInput.classList.remove('border-red-500');
    }

    window.deleteTask = function(id) {
        if (confirm('هل أنت متأكد أنك تريد حذف هذه المهمة؟')) {
            const taskElement = document.getElementById(`task-${id}`);
            if (taskElement) {
                // إضافة تأثير متحرك للحذف
                taskElement.classList.add('task-exit');
                
                // إظهار حالة التحميل
                showLoading(boardView);
                
                setTimeout(() => {
                    try {
                        // حذف المهمة من المصفوفة
                        const newTasks = tasks.filter(task => task.id !== id);
                        
                        // حفظ في LocalStorage
                        const saveSuccess = setTasks(newTasks);
                        
                        if (!saveSuccess) {
                            // إظهار إشعار خطأ إذا فشل الحذف
                            showStorageError('حذف', 'فشل حذف المهمة من التخزين المحلي');
                        }
                        render();
                    } catch (error) {
                        console.error('❌ خطأ أثناء حذف المهمة:', error);
                        showStorageError('حذف مهمة', error.message);
                    } finally {
                        // إخفاء حالة التحميل
                        hideLoading(boardView);
                    }
                }, 500);
            }
        }
    }

    window.updateTaskStatus = function(id) {
        // إظهار حالة التحميل
        showLoading(boardView);
        
        try {
            // تحديث حالة المهمة
            const statusCycle = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
            const newTasks = tasks.map(task => {
                if (task.id === id) {
                    const oldStatus = task.status;
                    const newStatus = statusCycle[task.status];
                    const updatedTask = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
                    
                    // إذا تم إكمال المهمة، نرسل إشعار إكمال المهمة
                    if (oldStatus !== 'done' && newStatus === 'done' && notificationSettings.enabled && notificationSettings.showCompletionNotifications) {
                        sendTaskCompletionNotification(updatedTask);
                    }
                    
                    // إذا تم إعادة المهمة إلى حالة غير مكتملة، نعيد جدولة التذكير
                    if (oldStatus === 'done' && newStatus !== 'done' && updatedTask.alarm) {
                        scheduleTaskReminder(updatedTask);
                    }
                    
                    return updatedTask;
                }
                return task;
            });
            
            // حفظ في LocalStorage
            const saveSuccess = setTasks(newTasks);
            
            if (!saveSuccess) {
                // إظهار إشعار خطأ إذا فشل التحديث
                showStorageError('تحديث', 'فشل تحديث حالة المهمة في التخزين المحلي');
            }
            render();
        } catch (error) {
            console.error('❌ خطأ أثناء تحديث حالة المهمة:', error);
            showStorageError('تحديث مهمة', error.message);
        } finally {
            // إخفاء حالة التحميل
            setTimeout(() => {
                hideLoading(boardView);
            }, 300);
        }
    }

    // --- View Rendering --
    function renderBoardView() {
        const todoTasks = filteredTasks.filter(t => t.status === 'todo');
        const inprogressTasks = filteredTasks.filter(t => t.status === 'inprogress');
        const doneTasks = filteredTasks.filter(t => t.status === 'done');
        taskBoard.innerHTML = `
            ${TaskListColumn('للقيام به', todoTasks)}
            ${TaskListColumn('قيد التنفيذ', inprogressTasks)}
            ${TaskListColumn('مكتمل', doneTasks)}
        `;
        
        // عرض رسالة إذا لم تكن هناك مهام بعد الفلترة
        if (filteredTasks.length === 0 && tasks.length > 0) {
            taskBoard.innerHTML = '<div class="empty-state p-4 text-center text-gray-500">لا توجد مهام تطابق معايير البحث والفلترة</div>';
        }
    }

    function renderAgendaView() {
        let agendaHTML = '<div class="space-y-6">'
        const today = new Date();
        
        // عرض رسالة إذا لم تكن هناك مهام بعد الفلترة
        if (filteredTasks.length === 0 && tasks.length > 0) {
            agendaHTML = '<div class="empty-state p-4 text-center text-gray-500">لا توجد مهام تطابق معايير البحث والفلترة</div>';
            agendaView.innerHTML = agendaHTML;
            return;
        }
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            const dayString = day.toISOString().split('T')[0];
            const tasksForDay = filteredTasks.filter(t => t.date === dayString).sort((a, b) => (a.time > b.time) ? 1 : -1);

            agendaHTML += `
                <div>
                    <h3 class="font-bold text-lg mb-2 border-b pb-2">${day.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <div class="space-y-2 mt-3">
                        ${tasksForDay.length > 0 ? tasksForDay.map(t => `
                            <div onclick="showTaskDetails('${t.id}')" class="agenda-item p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:shadow-md ${priorityColors[t.priority]}">
                                <span class="font-semibold">${t.title}</span>
                                <span class="text-sm font-mono">${t.time || ''}</span>
                            </div>
                        `).join('') : '<p class="text-gray-500 text-sm p-3">لا توجد مهام لهذا اليوم.</p>'}
                    </div>
                </div>
            `;
        }
        agendaHTML += '</div>';
        agendaView.innerHTML = agendaHTML;
    }

        // --- Search and Filter Functions ---
    function applyFilters() {
        showLoading(currentView === 'board' ? boardView : agendaView);
        
        // نبدأ بجميع المهام
        filteredTasks = [...tasks];
        
        // تطبيق البحث النصي
        if (activeFilters.search) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(activeFilters.search) || 
                (task.description && task.description.toLowerCase().includes(activeFilters.search))
            );
        }
        
        // تطبيق فلتر النوع
        if (activeFilters.type !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.type === activeFilters.type);
        }
        
        // تطبيق فلتر الحالة
        if (activeFilters.status !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === activeFilters.status);
        }
        
        // تطبيق فلتر نطاق التاريخ
        if (activeFilters.dateFrom) {
            const fromDate = new Date(activeFilters.dateFrom);
            filteredTasks = filteredTasks.filter(task => {
                if (!task.date) return false;
                const taskDate = new Date(task.date);
                return taskDate >= fromDate;
            });
        }
        
        if (activeFilters.dateTo) {
            const toDate = new Date(activeFilters.dateTo);
            toDate.setHours(23, 59, 59); // نهاية اليوم
            filteredTasks = filteredTasks.filter(task => {
                if (!task.date) return false;
                const taskDate = new Date(task.date);
                return taskDate <= toDate;
            });
        }
        
        // تطبيق الفرز
        if (activeFilters.sort !== 'default') {
            switch (activeFilters.sort) {
                case 'date-newest':
                    filteredTasks.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                    break;
                case 'date-oldest':
                    filteredTasks.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
                    break;
                case 'priority-high':
                    filteredTasks.sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    });
                    break;
                case 'priority-low':
                    filteredTasks.sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    });
                    break;
            }
        }
        
        // تحديث العرض
        render();
        hideLoading(currentView === 'board' ? boardView : agendaView);
    }

    function render() {
        if (currentView === 'board') {
            renderBoardView();
        } else {
            renderAgendaView();
        }
    }

    // --- Enhanced Modal Logic with Animations ---
    window.showTaskDetails = function(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-bold mb-2 border-b pb-2">${task.title}</h2>
            <p class="text-gray-700 my-4">${task.description || 'لا يوجد وصف.'}</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-gray-100 p-2 rounded-lg"><strong>الحالة:</strong> ${task.status}</div>
                <div class="bg-gray-100 p-2 rounded-lg"><strong>الأولوية:</strong> ${task.priority}</div>
                <div class="bg-gray-100 p-2 rounded-lg"><strong>النوع:</strong> ${task.type}</div>
                <div class="bg-gray-100 p-2 rounded-lg"><strong>التاريخ:</strong> ${task.date || '-'}</div>
                <div class="bg-gray-100 p-2 rounded-lg"><strong>الوقت:</strong> ${task.time || '-'}</div>
                <div class="bg-gray-100 p-2 rounded-lg"><strong>منبه:</strong> ${task.alarm ? 'مفعل' : 'غير مفعل'}</div>
            </div>
        `;
        
        // Show modal with animation
        taskModal.classList.remove('hidden');
        const modalDialog = taskModal.querySelector('.bg-white');
        modalDialog.classList.add('modal-enter');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            modalDialog.classList.remove('modal-enter');
        }, 300);
    }

    function closeModal() {
        const modalDialog = taskModal.querySelector('.bg-white');
        modalDialog.classList.add('modal-exit');
        
        setTimeout(() => {
            taskModal.classList.add('hidden');
            modalDialog.classList.remove('modal-exit');
        }, 200);
    }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', validateAndAddTask);
    closeModalBtn.addEventListener('click', closeModal);
    taskModal.addEventListener('click', (e) => { if(e.target === taskModal) closeModal(); }); // Close on overlay click
    showBoardBtn.addEventListener('click', () => switchView('board'));
    showAgendaBtn.addEventListener('click', () => switchView('agenda'));
    
    // --- Notification Settings Event Listeners ---
    const showNotificationSettingsBtn = document.getElementById('show-notification-settings');
    const notificationSettingsModal = document.getElementById('notification-settings-modal');
    const closeNotificationSettingsBtn = document.getElementById('close-notification-settings');
    const saveNotificationSettingsBtn = document.getElementById('save-notification-settings');
    const enableNotificationsCheckbox = document.getElementById('enable-notifications');
    const reminderTimeSelect = document.getElementById('reminder-time');
    const showCompletionNotificationsCheckbox = document.getElementById('show-completion-notifications');
    
    showNotificationSettingsBtn.addEventListener('click', () => {
        // تحديث حالة عناصر الإعدادات وفقًا للإعدادات المخزنة
        enableNotificationsCheckbox.checked = notificationSettings.enabled;
        reminderTimeSelect.value = notificationSettings.reminderTime.toString();
        showCompletionNotificationsCheckbox.checked = notificationSettings.showCompletionNotifications;
        
        // عرض نافذة الإعدادات
        notificationSettingsModal.classList.remove('hidden');
    });
    
    closeNotificationSettingsBtn.addEventListener('click', () => {
        notificationSettingsModal.classList.add('hidden');
    });
    
    saveNotificationSettingsBtn.addEventListener('click', () => {
        // تحديث الإعدادات
        const updatedSettings = {
            enabled: enableNotificationsCheckbox.checked,
            reminderTime: parseInt(reminderTimeSelect.value),
            showCompletionNotifications: showCompletionNotificationsCheckbox.checked
        };
        
        // حفظ الإعدادات
        setNotificationSettings(updatedSettings);
        
        // إذا تم تفعيل الإشعارات، نطلب الإذن
        if (updatedSettings.enabled && Notification.permission !== 'granted') {
            requestNotificationPermission()
                .then(() => {
                    showStorageSuccess('تم تفعيل الإشعارات بنجاح');
                    updateAllTaskReminders();
                })
                .catch(error => {
                    console.error('خطأ في طلب إذن الإشعارات:', error);
                    showStorageError('notification', 'لم يتم منح إذن الإشعارات');
                });
        } else {
            // تحديث التذكيرات بناءً على الإعدادات الجديدة
            updateAllTaskReminders();
            showStorageSuccess('تم حفظ إعدادات الإشعارات');
        }
        
        // إغلاق نافذة الإعدادات
        notificationSettingsModal.classList.add('hidden');
    });
    
    // --- Search and Filter Event Listeners ---
    searchInput.addEventListener('input', () => {
        activeFilters.search = searchInput.value.trim().toLowerCase();
        applyFilters();
    });

    sortBySelect.addEventListener('change', () => {
        activeFilters.sort = sortBySelect.value;
        applyFilters();
    });

    advancedFilterBtn.addEventListener('click', () => {
        advancedFilterPanel.classList.toggle('hidden');
    });

    applyFiltersBtn.addEventListener('click', () => {
        activeFilters.type = filterType.value;
        activeFilters.status = filterStatus.value;
        activeFilters.dateFrom = filterDateFrom.value;
        activeFilters.dateTo = filterDateTo.value;
        applyFilters();
        advancedFilterPanel.classList.add('hidden');
    });

    resetFiltersBtn.addEventListener('click', () => {
        // إعادة تعيين عناصر الفلترة
        searchInput.value = '';
        sortBySelect.value = 'default';
        filterType.value = 'all';
        filterStatus.value = 'all';
        filterDateFrom.value = '';
        filterDateTo.value = '';
        
        // إعادة تعيين حالة الفلترة
        activeFilters = {
            search: '',
            sort: 'default',
            type: 'all',
            status: 'all',
            dateFrom: '',
            dateTo: ''
        };
        
        applyFilters();
        advancedFilterPanel.classList.add('hidden');
    });
    
    // مزامنة LocalStorage بين علامات التبويب المختلفة
    window.addEventListener('storage', (e) => {
        if (e.key === 'tasks') {
            try {
                const updatedTasks = JSON.parse(e.newValue);
                if (JSON.stringify(tasks) !== JSON.stringify(updatedTasks)) {
                    console.log('🔄 تم اكتشاف تغييرات في LocalStorage من نافذة أخرى، جاري التحديث...');
                    tasks.length = 0;
                    Array.prototype.push.apply(tasks, updatedTasks);
                    render();
                    showSyncNotification();
                }
            } catch (error) {
                console.error('❌ خطأ أثناء مزامنة البيانات من نافذة أخرى:', error);
                showStorageError('مزامنة', error.message);
            }
        }
    });
    
    // الاستماع لأحداث تحديث LocalStorage المخصصة
    window.addEventListener('localstorage-updated', (e) => {
        if (e.detail.key === 'tasks') {
            console.log('🔄 تم تحديث LocalStorage، جاري تحديث واجهة المستخدم...');
            render();
        }
    });
    
    // --- View Switching with Slide Transitions ---
    function switchView(view) {
        if (view === currentView) return;

        const oldViewElement = currentView === 'board' ? boardView : agendaView;
        const newViewElement = view === 'board' ? boardView : agendaView;

        // Update button styles with enhanced animations
        if (view === 'board') {
            showBoardBtn.classList.add('bg-blue-500', 'text-white', 'active');
            showBoardBtn.classList.remove('bg-gray-200', 'text-gray-700');
            showAgendaBtn.classList.add('bg-gray-200', 'text-gray-700');
            showAgendaBtn.classList.remove('bg-blue-500', 'text-white', 'active');
        } else {
            showAgendaBtn.classList.add('bg-blue-500', 'text-white', 'active');
            showAgendaBtn.classList.remove('bg-gray-200', 'text-gray-700');
            showBoardBtn.classList.add('bg-gray-200', 'text-gray-700');
            showBoardBtn.classList.remove('bg-blue-500', 'text-white', 'active');
        }

        // Animate out the old view
        oldViewElement.classList.add('view-slide-out');
        oldViewElement.addEventListener('animationend', () => {
            oldViewElement.classList.add('hidden');
            oldViewElement.classList.remove('view-slide-out');

            // Update current view and render new content
            currentView = view;
            render();

            // Animate in the new view
            newViewElement.classList.remove('hidden');
            newViewElement.classList.add('view-slide-in');
            newViewElement.addEventListener('animationend', () => {
                newViewElement.classList.remove('view-slide-in');
            }, { once: true });

        }, { once: true });
    }

    // --- Loading State Functions ---
    function showLoading(container) {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = container.querySelector('.loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            loadingOverlay.appendChild(spinner);
            
            container.style.position = 'relative';
            container.appendChild(loadingOverlay);
        }
        
        // Activate the loading overlay
        setTimeout(() => {
            loadingOverlay.classList.add('active');
        }, 0);
    }
    
    function hideLoading(container) {
        const loadingOverlay = container.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
    
    // التحقق من سلامة البيانات في LocalStorage
    function validateStorageData() {
        try {
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                const parsedTasks = JSON.parse(storedTasks);
                
                // التحقق من أن البيانات هي مصفوفة
                if (!Array.isArray(parsedTasks)) {
                    console.error('❌ بيانات المهام في LocalStorage ليست بالتنسيق الصحيح');
                    // إعادة تعيين البيانات
                    localStorage.setItem('tasks', JSON.stringify([]));
                    return false;
                }
                
                // التحقق من سلامة كل مهمة
                const isValid = parsedTasks.every(task => {
                    return (
                        task && 
                        typeof task === 'object' &&
                        typeof task.id === 'string' &&
                        typeof task.title === 'string' &&
                        typeof task.status === 'string'
                    );
                });
                
                if (!isValid) {
                    console.error('❌ بعض المهام في LocalStorage تحتوي على بيانات غير صالحة');
                    // يمكن تنفيذ إصلاح للبيانات هنا إذا لزم الأمر
                    return false;
                }
                
                return true;
            }
        } catch (error) {
            console.error('❌ خطأ أثناء التحقق من سلامة البيانات:', error);
            showStorageError('تحقق', error.message);
            return false;
        }
        
        return true;
    }
    
    // --- Initialize ---
    validateStorageData();
    filteredTasks = [...tasks]; // تهيئة المهام المفلترة
    
    // تهيئة نظام الإشعارات
    if (areNotificationsSupported()) {
        // إذا كانت الإشعارات مفعلة، نتحقق من الإذن
        if (notificationSettings.enabled) {
            if (Notification.permission === 'granted') {
                // تحديث تذكيرات جميع المهام
                updateAllTaskReminders();
            } else if (Notification.permission !== 'denied') {
                // طلب إذن الإشعارات عند أول استخدام
                requestNotificationPermission()
                    .then(() => {
                        updateAllTaskReminders();
                    })
                    .catch(error => {
                        console.error('خطأ في طلب إذن الإشعارات:', error);
                    });
            }
        }
    } else {
        // إخفاء زر إعدادات الإشعارات إذا كانت الإشعارات غير مدعومة
        document.getElementById('show-notification-settings').classList.add('hidden');
    }
    
    // --- Enhanced Initial Render with Loading Animation ---
    setTimeout(() => {
        // التحقق من سلامة البيانات قبل التحميل
        if (!validateStorageData()) {
            console.warn('⚠️ تم اكتشاف مشكلة في بيانات LocalStorage، جاري استخدام بيانات افتراضية');
            showStorageError('تحميل', 'تم اكتشاف مشكلة في البيانات المخزنة، تم استخدام بيانات افتراضية');
        }
        
        // تهيئة عناصر البحث والفلترة
        searchInput.value = '';
        sortBySelect.value = 'default';
        filterType.value = 'all';
        filterStatus.value = 'all';
        filterDateFrom.value = '';
        filterDateTo.value = '';
        
        switchView('board'); // Start with the board view
        render();
        
        // Enhanced loading animation sequence
        loader.classList.add('loader-fade-out');
        container.classList.add('container-fade-in');
        container.style.opacity = 1;
        
        // Show loading state while rendering initial board
        showLoading(boardView);
        setTimeout(() => {
            hideLoading(boardView);
            loader.style.display = 'none';
            
            // إظهار إشعار نجاح تحميل البيانات
            if (tasks.length > 0) {
                const notification = document.createElement('div');
                notification.className = 'storage-success-notification';
                notification.innerHTML = `
                    <div class="success-icon">✅</div>
                    <div class="success-content">
                        <p>تم تحميل ${tasks.length} مهمة بنجاح</p>
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
        }, 500);
    }, 800); // Increased delay for better loading experience
});