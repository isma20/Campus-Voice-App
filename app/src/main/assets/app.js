const ADMIN_ACCESS_CODE = 'ADMIN';
const TEACHER_ACCESS_CODE = 'TEACHER';
let currentUserRole = null;
let activeAuthRole = 'student';

const APP_SCREENS = {
    student: document.getElementById('student-app-screen'),
    admin: document.getElementById('admin-app-screen'),
    teacher: document.getElementById('teacher-app-screen')
};

// Configuration - IIUC University details
const UNIVERSITY_CONFIG = {
    emailDomain: '@ugrad.iiuc.ac.bd', // IIUC student email domain
    studentIdPattern: /^e\d+$/, // Student ID starts with 'e' followed by digits (e.g., e221225)
    allowedEmailDomains: ['@ugrad.iiuc.ac.bd'], // IIUC student email domain
    adminEmailDomains: ['@iiuc.bd', '@ugrad.iiuc.ac.bd'], // Admin email domains (add as needed)
    teacherEmailDomains: ['@iiuc.bd', '@ugrad.iiuc.ac.bd'] // Teacher email domains
};

// LocalStorage Functions for Remember Me - Enhanced to save multiple credentials
function saveCredentials(role, email, studentId = null) {
    try {
        // Always save credentials after successful registration/login
        const key = `${role}_saved_credentials`;
        let savedCreds = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Check if this email already exists
        const existingIndex = savedCreds.findIndex(cred => cred.email === email);
        
        if (existingIndex >= 0) {
            // Update existing entry
            savedCreds[existingIndex] = { email, studentId, lastUsed: new Date().toISOString() };
        } else {
            // Add new entry
            savedCreds.push({ email, studentId, lastUsed: new Date().toISOString() });
        }
        
        // Sort by last used (most recent first) and keep max 5
        savedCreds.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
        savedCreds = savedCreds.slice(0, 5);
        
        localStorage.setItem(key, JSON.stringify(savedCreds));
        
        // Also save as the most recent (for auto-fill)
        localStorage.setItem(`${role}_email`, email);
        if (studentId) {
            localStorage.setItem(`${role}_student_id`, studentId);
        }
    } catch (error) {
        console.error('Error saving credentials:', error);
    }
}

function getSavedCredentials(role) {
    try {
        const key = `${role}_saved_credentials`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('Error getting saved credentials:', error);
        return [];
    }
}

function loadSavedCredentials(role) {
    try {
        // Don't auto-fill email - let user select from dropdown
        // Populate saved credentials dropdown
        populateSavedCredentialsDropdown(role);
    } catch (error) {
        console.error('Error loading saved credentials:', error);
    }
}

function populateSavedCredentialsDropdown(role) {
    const savedCreds = getSavedCredentials(role);
    const emailInput = document.getElementById(`${role}-login-email`);
    if (!emailInput) return;
    
    // Remove existing datalist if any
    const existingDatalist = document.getElementById(`${role}-saved-emails-datalist`);
    if (existingDatalist) {
        existingDatalist.remove();
    }
    
    // Remove any separate dropdown boxes
    const existingDropdown = emailInput.parentElement.querySelector('.saved-emails-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Only create datalist if there are saved credentials
    if (savedCreds.length === 0) {
        emailInput.removeAttribute('list');
        return;
    }
    
    // Create datalist for integrated dropdown in the email input
    const datalist = document.createElement('datalist');
    datalist.id = `${role}-saved-emails-datalist`;
    
    // Add saved credentials as options - only show email, not ID
    savedCreds.forEach(cred => {
        const option = document.createElement('option');
        option.value = cred.email;
        option.textContent = cred.email; // Only show email, no ID
        datalist.appendChild(option);
    });
    
    // Link datalist to input - this creates the dropdown in the same input field
    emailInput.setAttribute('list', `${role}-saved-emails-datalist`);
    emailInput.parentElement.appendChild(datalist);
}

// Auto-extract Student ID from Email
function setupAutoExtractStudentId() {
    const emailInput = document.getElementById('student-register-email');
    const studentIdInput = document.getElementById('student-register-student-id');
    
    if (emailInput && studentIdInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && email.includes('@ugrad.iiuc.ac.bd')) {
                const extractedId = extractStudentIdFromEmail(email);
                if (extractedId && !studentIdInput.value.trim()) {
                    studentIdInput.value = extractedId;
                }
            }
        });
    }
}

// Splash Screen Management
function hideSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.classList.add('hiding');
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            splashScreen.classList.remove('active');
        }, 500);
    }
}

// Load saved credentials on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show splash screen for 2 seconds, then hide it and show appropriate screen
    setTimeout(() => {
        hideSplashScreen();
        // After splash hides, check if we need to show auth screen
        setTimeout(() => {
            const authScreen = document.getElementById('auth-screen');
            if (authScreen && !authScreen.classList.contains('active')) {
                // Check if user is logged in, if not show auth screen
                if (!auth.currentUser) {
                    showAuthScreen();
                }
            }
        }, 500);
    }, 2000);
    
    loadSavedCredentials('student');
    loadSavedCredentials('admin');
    setupAutoExtractStudentId();
});

// Email Validation
function validateUniversityEmail(email, role) {
    if (!email || !email.includes('@')) {
        return false;
    }
    
    const emailLower = email.toLowerCase();
    
    if (role === 'student') {
        // Check if email ends with student domain
        const isValidDomain = UNIVERSITY_CONFIG.allowedEmailDomains.some(domain => 
            emailLower.endsWith(domain.toLowerCase())
        );
        
        if (!isValidDomain) return false;
        
        // Extract student ID from email (part before @)
        const studentIdFromEmail = emailLower.split('@')[0];
        
        // Validate that the email prefix matches student ID format (e followed by digits)
        return UNIVERSITY_CONFIG.studentIdPattern.test(studentIdFromEmail);
    } else if (role === 'teacher') {
        // For teacher, check teacher email domains
        return UNIVERSITY_CONFIG.teacherEmailDomains.some(domain => 
            emailLower.endsWith(domain.toLowerCase())
        );
    } else {
        // For admin, check admin email domains
        return UNIVERSITY_CONFIG.adminEmailDomains.some(domain => 
            emailLower.endsWith(domain.toLowerCase())
        );
    }
}

// Student ID Validation
function validateStudentId(studentId) {
    if (!studentId) return false;
    const studentIdLower = studentId.toLowerCase();
    return UNIVERSITY_CONFIG.studentIdPattern.test(studentIdLower);
}

// Extract Student ID from Email
function extractStudentIdFromEmail(email) {
    if (!email || !email.includes('@')) return null;
    const emailLower = email.toLowerCase();
    if (emailLower.endsWith('@ugrad.iiuc.ac.bd')) {
        return emailLower.split('@')[0];
    }
    return null;
}

// Validate that Student ID matches Email
function validateStudentIdMatchesEmail(email, studentId) {
    const extractedId = extractStudentIdFromEmail(email);
    if (!extractedId) return false;
    return extractedId.toLowerCase() === studentId.toLowerCase();
}

// Authentication State Observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await loadUserData();
    } else {
        resetToAuthState();
    }
});

function resetToAuthState() {
    currentUserRole = null;
    setAuthRole('student');
    hideAppScreens();
    showAuthScreen();
}

function hideAppScreens() {
    Object.values(APP_SCREENS).forEach(screen => screen?.classList.remove('active'));
}

// Show/Hide Screens
function showAuthScreen() {
    // Make sure splash is hidden first
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen && !splashScreen.classList.contains('hidden')) {
        hideSplashScreen();
        setTimeout(() => {
            document.getElementById('auth-screen').classList.add('active');
            hideAppScreens();
        }, 500);
    } else {
        document.getElementById('auth-screen').classList.add('active');
        hideAppScreens();
    }
}

function showAppScreen(role) {
    document.getElementById('auth-screen').classList.remove('active');
    hideAppScreens();

    if (role === 'admin') {
        APP_SCREENS.admin?.classList.add('active');
        showAdminSection('admin-notices');
    } else if (role === 'teacher') {
        APP_SCREENS.teacher?.classList.add('active');
        showTeacherSection('mark-attendance');
    } else {
        APP_SCREENS.student?.classList.add('active');
        showSection('notices');
    }
}

function setAuthRole(role) {
    activeAuthRole = role;
    document.getElementById('student-auth').classList.toggle('active', role === 'student');
    document.getElementById('admin-auth').classList.toggle('active', role === 'admin');
    document.getElementById('teacher-auth').classList.toggle('active', role === 'teacher');
    document.getElementById('role-tab-student').classList.toggle('active', role === 'student');
    document.getElementById('role-tab-admin').classList.toggle('active', role === 'admin');
    document.getElementById('role-tab-teacher').classList.toggle('active', role === 'teacher');
    
    // Update subtitle based on role
    const subtitleEl = document.getElementById('app-subtitle');
    if (subtitleEl) {
        const subtitles = {
            'student': 'IIUC Student Portal',
            'admin': 'IIUC Admin Portal',
            'teacher': 'IIUC Teacher Portal'
        };
        subtitleEl.textContent = subtitles[role] || 'IIUC Portal';
    }
    
    switchAuthForm(role, 'login');
    clearAuthMessage();
    // Load saved credentials when switching roles
    setTimeout(() => {
        loadSavedCredentials(role);
    }, 100);
}

function switchAuthForm(role, form) {
    const loginForm = document.getElementById(`${role}-login-form`);
    const registerForm = document.getElementById(`${role}-register-form`);
    if (!loginForm || !registerForm) return;

    if (form === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        // Load saved credentials when switching to login
        setTimeout(() => {
            loadSavedCredentials(role);
        }, 100);
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        // Clear student ID field to show placeholder example
        if (role === 'student') {
            const studentIdInput = document.getElementById('student-register-student-id');
            if (studentIdInput) {
                studentIdInput.value = '';
                studentIdInput.placeholder = 'ex : e221222';
            }
        }
    }
    clearAuthMessage();
}

function clearAuthMessage() {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = '';
    messageEl.className = 'message';
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        if (messageEl.textContent === message) {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }
    }, 5000);
}

// Authentication Functions
async function handleRegister(role = activeAuthRole) {
    const prefix = role === 'admin' ? 'admin' : (role === 'teacher' ? 'teacher' : 'student');
    const name = document.getElementById(`${prefix}-register-name`).value.trim();
    const email = document.getElementById(`${prefix}-register-email`).value.trim();
    const password = document.getElementById(`${prefix}-register-password`).value;

    if (!name || !email || !password) {
        showMessage('auth-message', 'Please fill in all required fields', 'error');
        return;
    }

    // Validate university email
    if (!validateUniversityEmail(email, role)) {
        if (role === 'student') {
            showMessage('auth-message', `Please use a valid IIUC student email (ex : e221222@ugrad.iiuc.ac.bd)`, 'error');
        } else if (role === 'teacher') {
            showMessage('auth-message', `Please use a valid IIUC teacher email`, 'error');
        } else {
            showMessage('auth-message', `Please use a valid IIUC admin email`, 'error');
        }
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showMessage('auth-message', 'Password must be at least 6 characters long', 'error');
        return;
    }

    let studentId = null;
    if (role === 'student') {
        studentId = document.getElementById('student-register-student-id').value.trim();
        if (!studentId) {
            showMessage('auth-message', 'Student ID is required for students', 'error');
            return;
        }
        
        // Validate student ID format (e followed by digits)
        if (!validateStudentId(studentId)) {
            showMessage('auth-message', 'Student ID must start with "e" followed by digits (e.g., e221225)', 'error');
            return;
        }
        
        // Validate that student ID matches the email prefix
        if (!validateStudentIdMatchesEmail(email, studentId)) {
            showMessage('auth-message', 'Student ID must match your email address (ex : if email is e221222@ugrad.iiuc.ac.bd, ID should be e221222)', 'error');
            return;
        }
    } else if (role === 'teacher') {
        const accessCode = document.getElementById('teacher-access-code').value.trim();
        if (!accessCode || accessCode !== TEACHER_ACCESS_CODE) {
            showMessage('auth-message', 'Invalid teacher access code', 'error');
            return;
        }
    } else {
        const accessCode = document.getElementById('admin-access-code').value.trim();
        if (!accessCode || accessCode !== ADMIN_ACCESS_CODE) {
            showMessage('auth-message', 'Invalid admin access code', 'error');
            return;
        }
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Send email verification for students
        if (role === 'student') {
            try {
                await user.sendEmailVerification();
                showMessage('auth-message', 'Registration successful! Please check your email to verify your account before logging in.', 'success');
            } catch (emailError) {
                console.error('Email verification error:', emailError);
                showMessage('auth-message', 'Registration successful! However, verification email could not be sent. You can still login.', 'success');
            }
        } else {
            showMessage('auth-message', 'Registration successful! You can login now.', 'success');
        }

        await db.collection('users').doc(user.uid).set({
            name,
            email,
            studentId: role === 'student' ? studentId : null,
            role,
            emailVerified: false,
            assignedCourses: role === 'student' ? [] : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Always save credentials after successful registration
        saveCredentials(role, email, studentId);

        switchAuthForm(role, 'login');
        
        // Reload saved credentials dropdown
        setTimeout(() => {
            loadSavedCredentials(role);
        }, 100);
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('auth-message', error.message, 'error');
    }
}

async function handleLogin(role = activeAuthRole) {
    const prefix = role === 'admin' ? 'admin' : (role === 'teacher' ? 'teacher' : 'student');
    const email = document.getElementById(`${prefix}-login-email`).value.trim();
    const password = document.getElementById(`${prefix}-login-password`).value;

    if (!email || !password) {
        showMessage('auth-message', 'Please fill in all fields', 'error');
        return;
    }

    // Validate university email
    if (!validateUniversityEmail(email, role)) {
        if (role === 'student') {
            showMessage('auth-message', `Please use a valid IIUC student email (ex : e221222@ugrad.iiuc.ac.bd)`, 'error');
        } else if (role === 'teacher') {
            showMessage('auth-message', `Please use a valid IIUC teacher email`, 'error');
        } else {
            showMessage('auth-message', `Please use a valid IIUC admin email`, 'error');
        }
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();

        if (!userDoc.exists || userDoc.data().role !== role) {
            await auth.signOut();
            showMessage('auth-message', `This account is registered as ${userDoc.data()?.role || 'unknown'}.`, 'error');
            return;
        }

        // Always save credentials after successful login
        const userData = userDoc.data();
        saveCredentials(role, email, userData.studentId || null);

        showMessage('auth-message', 'Login successful!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        // Handle different Firebase auth error codes
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please register first or check your email address.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please check your password and try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address. Please enter a valid IIUC email (ex : e221222@ugrad.iiuc.ac.bd).';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please check your credentials and try again. If you haven\'t registered yet, please register first.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled. Please contact support.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message) {
            // Use Firebase error message as fallback
            errorMessage = error.message;
        }
        
        showMessage('auth-message', errorMessage, 'error');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        resetToAuthState();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Load User Data
async function loadUserData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            showMessage('auth-message', 'User profile not found', 'error');
            await auth.signOut();
            return;
        }

        const userData = userDoc.data();
        currentUserRole = userData.role || 'student';
        if (currentUserRole === 'admin') {
            loadAdminData(userData, user.email);
        } else if (currentUserRole === 'teacher') {
            loadTeacherData(userData, user.email);
        } else {
            loadStudentData(userData, user.email);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function loadStudentData(userData, fallbackEmail) {
    document.getElementById('student-user-name').textContent = userData.name || fallbackEmail;
    showAppScreen('student');
    loadNotices();
    loadAttendance();
    loadReports();
    loadStudentCourses(userData);
}

function loadAdminData(userData, fallbackEmail) {
    document.getElementById('admin-user-name').textContent = userData.name || fallbackEmail;
    showAppScreen('admin');
    loadAdminNotices();
    loadAdminReports();
}

function loadTeacherData(userData, fallbackEmail) {
    document.getElementById('teacher-user-name').textContent = userData.name || fallbackEmail;
    showAppScreen('teacher');
    loadTeacherAttendance();
}

// Navigation
function showSection(sectionName) {
    document.querySelectorAll('#student-app-screen .content-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('#student-app-screen .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('#student-app-screen .nav-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase().trim();
        if ((sectionName === 'notices' && btnText === 'notices') ||
            (sectionName === 'attendance' && btnText === 'attendance') ||
            (sectionName === 'courses' && btnText === 'my courses') ||
            (sectionName === 'report' && btnText === 'report problem')) {
            btn.classList.add('active');
        }
    });
}

function showAdminSection(sectionName) {
    // Hide all content sections
    document.querySelectorAll('#admin-app-screen .content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons (but keep them visible)
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        // Ensure button is always visible
        btn.style.display = 'inline-block';
    });

    // Show the target content section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to the clicked button
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase().trim();
        if ((sectionName === 'admin-notices' && btnText.includes('notices')) ||
            (sectionName === 'admin-reports' && btnText.includes('reports'))) {
            btn.classList.add('active');
        }
    });

    // Load data when switching sections
    if (sectionName === 'admin-reports') {
        loadAdminReports();
    } else if (sectionName === 'admin-notices') {
        loadAdminNotices();
    }
}

// Notices Functions
let noticesListener = null; // Store listener reference to unsubscribe if needed

async function loadNotices() {
    const noticesList = document.getElementById('notices-list');
    if (!noticesList) return;
    
    noticesList.innerHTML = '<div class="loading">Loading notices...</div>';

    // Unsubscribe from previous listener if exists
    if (noticesListener) {
        noticesListener();
        noticesListener = null;
    }

    try {
        // Load all notices from admin - students should see all published notices
        let noticesSnapshot;
        try {
            noticesSnapshot = await db.collection('notices')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
        } catch (orderError) {
            // If orderBy fails, try without it and sort in memory
            console.warn('OrderBy failed for notices, loading without sort:', orderError);
            noticesSnapshot = await db.collection('notices')
                .limit(50)
                .get();
            
            const notices = [];
            noticesSnapshot.forEach(doc => {
                notices.push({ id: doc.id, ...doc.data() });
            });
            
            notices.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return bTime - aTime;
            });
            
            if (notices.length === 0) {
                noticesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><p>No notices available</p></div>';
                // Set up real-time listener without orderBy
                setupNoticesListener(false);
                return;
            }
            
            noticesList.innerHTML = '';
            notices.forEach(notice => {
                const noticeCard = createNoticeCard(notice);
                noticesList.appendChild(noticeCard);
            });
            
            // Set up real-time listener without orderBy
            setupNoticesListener(false);
            return;
        }

        if (noticesSnapshot.empty) {
            noticesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><p>No notices available</p></div>';
            // Set up real-time listener with orderBy
            setupNoticesListener(true);
            return;
        }

        noticesList.innerHTML = '';
        noticesSnapshot.forEach(doc => {
            const notice = doc.data();
            const noticeCard = createNoticeCard(notice);
            noticesList.appendChild(noticeCard);
        });
        
        // Set up real-time listener with orderBy
        setupNoticesListener(true);
    } catch (error) {
        console.error('Error loading notices:', error);
        noticesList.innerHTML = '<div class="empty-state"><p>Error loading notices. Please try again.</p></div>';
    }
}

function setupNoticesListener(useOrderBy) {
    const noticesList = document.getElementById('notices-list');
    if (!noticesList) return;
    
    // Unsubscribe from previous listener if exists
    if (noticesListener) {
        noticesListener();
    }
    
    try {
        if (useOrderBy) {
            noticesListener = db.collection('notices')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .onSnapshot((snapshot) => {
                    updateNoticesList(snapshot, noticesList);
                }, (error) => {
                    console.error('Real-time listener error with orderBy:', error);
                    // Fallback to listener without orderBy
                    setupNoticesListener(false);
                });
        } else {
            noticesListener = db.collection('notices')
                .limit(50)
                .onSnapshot((snapshot) => {
                    updateNoticesList(snapshot, noticesList, true);
                }, (error) => {
                    console.error('Real-time listener error:', error);
                });
        }
    } catch (error) {
        console.error('Error setting up notices listener:', error);
    }
}

function updateNoticesList(snapshot, noticesList, needsSort = false) {
    if (snapshot.empty) {
        noticesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><p>No notices available</p></div>';
        return;
    }
    
    let notices = [];
    snapshot.forEach(doc => {
        notices.push({ id: doc.id, ...doc.data() });
    });
    
    if (needsSort) {
        notices.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bTime - aTime;
        });
    }
    
    noticesList.innerHTML = '';
    notices.forEach(notice => {
        const noticeCard = createNoticeCard(notice);
        noticesList.appendChild(noticeCard);
    });
}

function createNoticeCard(notice) {
    const card = document.createElement('div');
    // Add highlight class if notice has attachment
    card.className = notice.attachmentUrl || notice.isHighlight ? 'notice-card notice-highlight' : 'notice-card';

    const title = document.createElement('div');
    title.className = 'notice-title';
    title.textContent = notice.title || 'Notice';
    
    // Add highlight badge if has attachment
    if (notice.attachmentUrl || notice.isHighlight) {
        const badge = document.createElement('span');
        badge.className = 'notice-badge';
        badge.textContent = '⭐ Highlight';
        badge.style.cssText = 'background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem;';
        title.appendChild(badge);
    }

    const content = document.createElement('div');
    content.className = 'notice-content';
    content.textContent = notice.content || '';

    // Add attachment if exists
    if (notice.attachmentUrl) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'notice-attachment';
        attachmentDiv.style.cssText = 'margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);';
        
        if (notice.attachmentType === 'image') {
            const img = document.createElement('img');
            img.src = notice.attachmentUrl;
            img.alt = notice.attachmentName || 'Notice attachment';
            img.style.cssText = 'max-width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem; box-shadow: var(--shadow);';
            img.onclick = () => window.open(notice.attachmentUrl, '_blank');
            img.style.cursor = 'pointer';
            attachmentDiv.innerHTML = '<strong>📎 Attachment:</strong> ' + (notice.attachmentName || 'Image');
            attachmentDiv.appendChild(img);
        } else {
            const link = document.createElement('a');
            link.href = notice.attachmentUrl;
            link.target = '_blank';
            link.textContent = '📄 ' + (notice.attachmentName || 'Download Document');
            link.style.cssText = 'color: var(--primary-blue); text-decoration: none; font-weight: 500; display: inline-block; margin-top: 0.5rem;';
            link.onmouseover = () => link.style.textDecoration = 'underline';
            link.onmouseout = () => link.style.textDecoration = 'none';
            attachmentDiv.innerHTML = '<strong>📎 Attachment:</strong>';
            attachmentDiv.appendChild(document.createElement('br'));
            attachmentDiv.appendChild(link);
        }
        content.appendChild(attachmentDiv);
    }

    const date = document.createElement('div');
    date.className = 'notice-date';
    if (notice.createdAt) {
        const dateObj = notice.createdAt.toDate ? notice.createdAt.toDate() : new Date(notice.createdAt);
        date.textContent = `Posted on: ${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString()}`;
    }

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(date);

    return card;
}

function refreshNotices() {
    loadNotices();
}

// Attendance Functions
async function loadAttendance() {
    const user = auth.currentUser;
    if (!user) return;

    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '<div class="loading">Loading attendance...</div>';

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const studentId = userDoc.data()?.studentId;

        if (!studentId) {
            attendanceList.innerHTML = '<div class="empty-state"><p>Student ID not found</p></div>';
            return;
        }

        const attendanceSnapshot = await db.collection('attendance')
            .where('studentId', '==', studentId)
            .get();

        let totalClasses = 0;
        let presentCount = 0;
        let absentCount = 0;
        const attendanceBySubject = {};

        attendanceList.innerHTML = '';

        if (attendanceSnapshot.empty) {
            attendanceList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No attendance records found</p></div>';
        } else {
            // Convert to array and sort by date
            const attendances = [];
            attendanceSnapshot.forEach(doc => {
                attendances.push(doc.data());
            });
            
            // Sort by date descending
            attendances.sort((a, b) => {
                const aTime = a.date?.toDate ? a.date.toDate().getTime() : 0;
                const bTime = b.date?.toDate ? b.date.toDate().getTime() : 0;
                return bTime - aTime;
            });
            
            attendances.forEach(attendance => {
                totalClasses++;
                if (attendance.status === 'present') {
                    presentCount++;
                } else {
                    absentCount++;
                }

                // Group by subject
                const subject = attendance.subject || 'General';
                if (!attendanceBySubject[subject]) {
                    attendanceBySubject[subject] = { present: 0, absent: 0, total: 0 };
                }
                attendanceBySubject[subject].total++;
                if (attendance.status === 'present') {
                    attendanceBySubject[subject].present++;
                } else {
                    attendanceBySubject[subject].absent++;
                }

                const attendanceItem = createAttendanceItem(attendance);
                attendanceList.appendChild(attendanceItem);
            });
        }

        // Update stats
        document.getElementById('total-classes').textContent = totalClasses;
        document.getElementById('present-count').textContent = presentCount;
        document.getElementById('absent-count').textContent = absentCount;
        const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
        document.getElementById('attendance-percentage').textContent = `${percentage}%`;

        // Display attendance by subject
        displayAttendanceBySubject(attendanceBySubject);
    } catch (error) {
        console.error('Error loading attendance:', error);
        attendanceList.innerHTML = '<div class="empty-state"><p>Error loading attendance. Please try again.</p></div>';
    }
}

function createAttendanceItem(attendance) {
    const item = document.createElement('div');
    item.className = 'attendance-item';

    const date = document.createElement('div');
    date.className = 'attendance-date';
    if (attendance.date) {
        const dateObj = attendance.date.toDate ? attendance.date.toDate() : new Date(attendance.date);
        date.textContent = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    const status = document.createElement('div');
    status.className = `attendance-status ${attendance.status || 'absent'}`;
    status.textContent = attendance.status === 'present' ? 'Present' : 'Absent';

    if (attendance.subject) {
        const subject = document.createElement('div');
        subject.textContent = attendance.subject;
        subject.style.color = 'var(--text-light)';
        item.appendChild(subject);
    }

    item.appendChild(date);
    item.appendChild(status);

    return item;
}

function refreshAttendance() {
    loadAttendance();
}

// Load and display student's assigned courses
async function loadStudentCourses(userData) {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;
    
    coursesList.innerHTML = '<div class="loading">Loading courses...</div>';

    try {
        // Get fresh data from Firestore to ensure we have latest courses
        const user = auth.currentUser;
        if (!user) return;
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        const currentUserData = userDoc.data();
        const assignedCourses = currentUserData?.assignedCourses || [];
        
        if (assignedCourses.length === 0) {
            coursesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><p>No courses assigned yet. Submit a report to get course assignments from admin.</p></div>';
            return;
        }

        coursesList.innerHTML = '';
        assignedCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.style.cssText = 'padding: 1rem; margin-bottom: 1rem; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--primary-blue); box-shadow: var(--shadow);';
            
            courseCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">${course}</h3>
                        <p style="margin: 0.5rem 0 0 0; color: var(--text-light); font-size: 0.9rem;">Assigned by Admin</p>
                    </div>
                    <div style="font-size: 2rem;">📖</div>
                </div>
            `;
            
            coursesList.appendChild(courseCard);
        });
        
        // Set up real-time listener for course updates
        db.collection('users').doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const updatedData = doc.data();
                const updatedCourses = updatedData.assignedCourses || [];
                if (JSON.stringify(updatedCourses) !== JSON.stringify(assignedCourses)) {
                    loadStudentCourses(updatedData);
                }
            }
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesList.innerHTML = '<div class="empty-state"><p>Error loading courses: ' + error.message + '</p></div>';
    }
}

// Add function to display attendance by subject
function displayAttendanceBySubject(attendanceBySubject) {
    const attendanceSection = document.getElementById('attendance-section');
    let subjectStatsDiv = document.getElementById('attendance-by-subject');
    
    if (!subjectStatsDiv) {
        subjectStatsDiv = document.createElement('div');
        subjectStatsDiv.id = 'attendance-by-subject';
        subjectStatsDiv.className = 'attendance-by-subject';
        subjectStatsDiv.style.cssText = 'margin-top: 2rem; padding: 1.5rem; background: var(--card-bg); border-radius: 12px;';
        attendanceSection.appendChild(subjectStatsDiv);
    }
    
    subjectStatsDiv.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--text-primary);">Attendance by Subject</h3>';
    
    if (Object.keys(attendanceBySubject).length === 0) {
        subjectStatsDiv.innerHTML += '<p style="color: var(--text-light);">No subject-wise attendance data available</p>';
        return;
    }
    
    Object.keys(attendanceBySubject).forEach(subject => {
        const stats = attendanceBySubject[subject];
        const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-attendance-card';
        subjectCard.style.cssText = 'padding: 1rem; margin-bottom: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--primary-blue);';
        
        subjectCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong style="color: var(--text-primary);">${subject}</strong>
                <span style="color: var(--primary-blue); font-weight: 600;">${percentage}%</span>
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--text-light);">
                <span>Present: ${stats.present}</span>
                <span>Absent: ${stats.absent}</span>
                <span>Total: ${stats.total}</span>
            </div>
        `;
        
        subjectStatsDiv.appendChild(subjectCard);
    });
}

// Report Functions (Student)
const reportForm = document.getElementById('report-form');
if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            showMessage('report-message', 'Please login to report a problem', 'error');
            return;
        }

        const title = document.getElementById('problem-title').value.trim();
        const category = document.getElementById('problem-category').value;
        const description = document.getElementById('problem-description').value.trim();

        if (!title || !category || !description) {
            showMessage('report-message', 'Please complete the form', 'error');
            return;
        }

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            await db.collection('reports').add({
                studentId: userData.studentId,
                studentName: userData.name,
                studentEmail: user.email,
                title,
                category,
                description,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('report-message', 'Problem reported successfully!', 'success');
            reportForm.reset();
            loadReports();
        } catch (error) {
            console.error('Error submitting report:', error);
            showMessage('report-message', 'Error submitting report. Please try again.', 'error');
        }
    });
}

async function loadReports() {
    const user = auth.currentUser;
    if (!user) return;

    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = '<div class="loading">Loading your reports...</div>';

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const studentId = userDoc.data()?.studentId;

        if (!studentId) {
            reportsList.innerHTML = '<div class="empty-state"><p>Student ID not found</p></div>';
            return;
        }

        let reportsSnapshot;
        try {
            // Try with orderBy first
            reportsSnapshot = await db.collection('reports')
                .where('studentId', '==', studentId)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (orderError) {
            // If orderBy fails (index not created), try without it and sort in memory
            console.warn('OrderBy failed, loading without sort:', orderError);
            reportsSnapshot = await db.collection('reports')
                .where('studentId', '==', studentId)
                .get();
            
            // Sort in memory
            const reports = [];
            reportsSnapshot.forEach(doc => {
                reports.push({ id: doc.id, ...doc.data() });
            });
            reports.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return bTime - aTime;
            });
            
            if (reports.length === 0) {
                reportsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No reports submitted yet</p></div>';
                return;
            }
            
            reportsList.innerHTML = '';
            reports.forEach(report => {
                const reportCard = createReportCard(report);
                reportsList.appendChild(reportCard);
            });
            return;
        }

        if (reportsSnapshot.empty) {
            reportsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No reports submitted yet</p></div>';
            return;
        }

        reportsList.innerHTML = '';
        reportsSnapshot.forEach(doc => {
            const report = doc.data();
            const reportCard = createReportCard(report);
            reportsList.appendChild(reportCard);
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        reportsList.innerHTML = '<div class="empty-state"><p>Error loading reports. Please try again later.</p></div>';
    }
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';

    const header = document.createElement('div');
    header.className = 'report-header';

    const title = document.createElement('div');
    title.className = 'report-title';
    title.textContent = report.title || 'Untitled Report';

    const category = document.createElement('div');
    category.className = 'report-category';
    category.textContent = report.category || 'other';

    header.appendChild(title);
    header.appendChild(category);

    const description = document.createElement('div');
    description.className = 'report-description';
    description.textContent = report.description || '';

    const footer = document.createElement('div');
    footer.className = 'report-footer';

    const date = document.createElement('div');
    if (report.createdAt) {
        const dateObj = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt);
        date.textContent = `Submitted: ${dateObj.toLocaleDateString()}`;
    }

    const status = document.createElement('div');
    status.className = `report-status ${report.status || 'pending'}`;
    let statusText = 'Pending';
    if (report.status === 'approved') {
        statusText = 'Approved';
        status.className = 'report-status approved';
    } else if (report.status === 'resolved') {
        statusText = 'Resolved';
        status.className = 'report-status resolved';
    }
    status.textContent = statusText;

    footer.appendChild(date);
    footer.appendChild(status);

    // Show assigned course if approved
    if (report.status === 'approved' && report.assignedCourse) {
        const courseInfo = document.createElement('div');
        courseInfo.className = 'report-course';
        courseInfo.style.cssText = 'margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; font-size: 0.9rem;';
        courseInfo.innerHTML = `<strong>Assigned Course:</strong> ${report.assignedCourse}`;
        card.appendChild(courseInfo);
    }

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(footer);

    return card;
}

// Admin Notice Management
const adminNoticeForm = document.getElementById('admin-notice-form');
if (adminNoticeForm) {
    adminNoticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('notice-title').value.trim();
        const content = document.getElementById('notice-content').value.trim();
        const attachmentFile = document.getElementById('notice-attachment').files[0];

        if (!title || !content) {
            showMessage('admin-notice-message', 'Please fill in all notice fields', 'error');
            return;
        }

        try {
            showMessage('admin-notice-message', 'Publishing notice...', 'success');
            
            let attachmentUrl = null;
            let attachmentType = null;
            let attachmentName = null;

            // Upload file if provided (make it optional)
            if (attachmentFile) {
                try {
                    const storageRef = storage.ref();
                    const fileRef = storageRef.child(`notices/${Date.now()}_${attachmentFile.name}`);
                    await fileRef.put(attachmentFile);
                    attachmentUrl = await fileRef.getDownloadURL();
                    attachmentType = attachmentFile.type.startsWith('image/') ? 'image' : 'document';
                    attachmentName = attachmentFile.name;
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    // Continue with notice publishing even if file upload fails
                    showMessage('admin-notice-message', 'Notice will be published, but file upload failed. You can try uploading the file again later.', 'error');
                }
            }

            // Always publish notice, even if file upload fails
            await db.collection('notices').add({
                title,
                content,
                attachmentUrl: attachmentUrl || null,
                attachmentType: attachmentType || null,
                attachmentName: attachmentName || null,
                isHighlight: attachmentUrl ? true : false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('admin-notice-message', 'Notice published successfully!', 'success');
            adminNoticeForm.reset();
            loadAdminNotices();
            loadNotices();
        } catch (error) {
            console.error('Error publishing notice:', error);
            
            // Check if it's a permissions error
            let errorMessage = 'Failed to publish notice: ' + error.message;
            const errorMsgLower = error.message.toLowerCase();
            const errorCode = error.code || '';
            
            if (errorCode === 'permission-denied' || 
                errorCode === 'permissions-denied' ||
                errorMsgLower.includes('permission') || 
                errorMsgLower.includes('insufficient permissions') ||
                errorMsgLower.includes('missing or insufficient')) {
                errorMessage = 'Permission denied: Your Firestore security rules are blocking notice creation. ' +
                              'Please update your Firestore rules in Firebase Console to allow admins to publish notices. ' +
                              'See HOW_TO_FIX_NOTICE_PERMISSIONS.md file for step-by-step instructions.';
            }
            
            showMessage('admin-notice-message', errorMessage, 'error');
        }
    });
}

async function loadAdminNotices() {
    const noticesList = document.getElementById('admin-notices-list');
    if (!noticesList) {
        console.error('admin-notices-list element not found');
        return;
    }
    noticesList.innerHTML = '<div class="loading">Loading notices...</div>';

    try {
        let snapshot;
        try {
            snapshot = await db.collection('notices')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
        } catch (orderError) {
            // If orderBy fails, try without it and sort in memory
            console.warn('OrderBy failed for admin notices, loading without sort:', orderError);
            snapshot = await db.collection('notices')
                .limit(50)
                .get();
            
            const notices = [];
            snapshot.forEach(doc => {
                notices.push({ id: doc.id, ...doc.data() });
            });
            
            notices.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return bTime - aTime;
            });
            
            if (notices.length === 0) {
                noticesList.innerHTML = '<div class="empty-state"><p>No notices found</p></div>';
                return;
            }
            
            noticesList.innerHTML = '';
            notices.forEach(notice => {
                noticesList.appendChild(createAdminNoticeCard(notice.id, notice));
            });
            return;
        }

        if (snapshot.empty) {
            noticesList.innerHTML = '<div class="empty-state"><p>No notices found</p></div>';
            return;
        }

        noticesList.innerHTML = '';
        snapshot.forEach(doc => {
            noticesList.appendChild(createAdminNoticeCard(doc.id, doc.data()));
        });
    } catch (error) {
        console.error('Error loading admin notices:', error);
        noticesList.innerHTML = '<div class="empty-state"><p>Error loading notices. Please try again.</p></div>';
    }
}

function createAdminNoticeCard(id, notice) {
    const card = document.createElement('div');
    card.className = notice.attachmentUrl || notice.isHighlight ? 'notice-card notice-highlight' : 'notice-card';

    const title = document.createElement('div');
    title.className = 'notice-title';
    title.textContent = notice.title || 'Notice';
    
    if (notice.attachmentUrl || notice.isHighlight) {
        const badge = document.createElement('span');
        badge.className = 'notice-badge';
        badge.textContent = '⭐ Has Attachment';
        badge.style.cssText = 'background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem;';
        title.appendChild(badge);
    }

    const content = document.createElement('div');
    content.className = 'notice-content';
    content.textContent = notice.content || '';

    // Add attachment if exists
    if (notice.attachmentUrl) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'notice-attachment';
        attachmentDiv.style.cssText = 'margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);';
        
        if (notice.attachmentType === 'image') {
            const img = document.createElement('img');
            img.src = notice.attachmentUrl;
            img.alt = notice.attachmentName || 'Notice attachment';
            img.style.cssText = 'max-width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem; box-shadow: var(--shadow);';
            img.onclick = () => window.open(notice.attachmentUrl, '_blank');
            img.style.cursor = 'pointer';
            attachmentDiv.innerHTML = '<strong>📎 Attachment:</strong> ' + (notice.attachmentName || 'Image');
            attachmentDiv.appendChild(img);
        } else {
            const link = document.createElement('a');
            link.href = notice.attachmentUrl;
            link.target = '_blank';
            link.textContent = '📄 ' + (notice.attachmentName || 'Download Document');
            link.style.cssText = 'color: var(--primary-blue); text-decoration: none; font-weight: 500; display: inline-block; margin-top: 0.5rem;';
            link.onmouseover = () => link.style.textDecoration = 'underline';
            link.onmouseout = () => link.style.textDecoration = 'none';
            attachmentDiv.innerHTML = '<strong>📎 Attachment:</strong>';
            attachmentDiv.appendChild(document.createElement('br'));
            attachmentDiv.appendChild(link);
        }
        content.appendChild(attachmentDiv);
    }

    const footer = document.createElement('div');
    footer.className = 'notice-date';
    if (notice.createdAt) {
        const dateObj = notice.createdAt.toDate ? notice.createdAt.toDate() : new Date(notice.createdAt);
        footer.textContent = `Posted on: ${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
    }

    const actions = document.createElement('div');
    actions.className = 'admin-controls';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-secondary admin-action-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteNotice(id);

    actions.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(footer);
    card.appendChild(actions);

    return card;
}

async function deleteNotice(id) {
    try {
        await db.collection('notices').doc(id).delete();
        showMessage('admin-notice-message', 'Notice deleted', 'success');
        loadAdminNotices();
        loadNotices();
    } catch (error) {
        console.error('Error deleting notice:', error);
        showMessage('admin-notice-message', 'Failed to delete notice', 'error');
    }
}

// Admin Report Management
async function loadAdminReports() {
    const adminReportsList = document.getElementById('admin-reports-list');
    if (!adminReportsList) {
        console.error('admin-reports-list element not found');
        return;
    }
    adminReportsList.innerHTML = '<div class="loading">Loading reports...</div>';

    try {
        let snapshot;
        try {
            snapshot = await db.collection('reports')
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();
        } catch (orderError) {
            // If orderBy fails, try without it and sort in memory
            console.warn('OrderBy failed, loading without sort:', orderError);
            snapshot = await db.collection('reports')
                .limit(100)
                .get();
            
            const reports = [];
            snapshot.forEach(doc => {
                reports.push({ id: doc.id, ...doc.data() });
            });
            reports.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return bTime - aTime;
            });
            
            if (reports.length === 0) {
                adminReportsList.innerHTML = '<div class="empty-state"><p>No reports submitted yet</p></div>';
                return;
            }
            
            adminReportsList.innerHTML = '';
            reports.forEach(report => {
                adminReportsList.appendChild(createAdminReportCard(report.id, report));
            });
            return;
        }

        if (snapshot.empty) {
            adminReportsList.innerHTML = '<div class="empty-state"><p>No reports submitted yet</p></div>';
            return;
        }

        adminReportsList.innerHTML = '';
        snapshot.forEach(doc => {
            adminReportsList.appendChild(createAdminReportCard(doc.id, doc.data()));
        });
    } catch (error) {
        console.error('Error loading admin reports:', error);
        adminReportsList.innerHTML = '<div class="empty-state"><p>Error loading reports. Please try again later.</p></div>';
    }
}

function createAdminReportCard(id, report) {
    const card = document.createElement('div');
    card.className = 'report-card';

    const header = document.createElement('div');
    header.className = 'report-header';

    const title = document.createElement('div');
    title.className = 'report-title';
    title.textContent = report.title || 'Untitled Report';

    const category = document.createElement('div');
    category.className = 'report-category';
    category.textContent = report.category || 'other';

    header.appendChild(title);
    header.appendChild(category);

    const details = document.createElement('div');
    details.className = 'report-description';
    details.innerHTML = `
        <strong>Student:</strong> ${report.studentName || 'Unknown'} (${report.studentId || 'N/A'})<br>
        <strong>Email:</strong> ${report.studentEmail || 'N/A'}<br><br>
        ${report.description || ''}
    `;

    const footer = document.createElement('div');
    footer.className = 'report-footer';

    const date = document.createElement('div');
    if (report.createdAt) {
        const dateObj = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt);
        date.textContent = `Submitted: ${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
    }

    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'admin-controls';
    statusWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

    const statusSelect = document.createElement('select');
    statusSelect.className = 'status-select';
    statusSelect.style.cssText = 'padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color);';
    ['pending', 'approved', 'resolved'].forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
        statusSelect.appendChild(option);
    });
    statusSelect.value = report.status || 'pending';

    // Add course selection when approving
    const courseWrapper = document.createElement('div');
    courseWrapper.style.cssText = 'display: none;';
    courseWrapper.id = `course-wrapper-${id}`;
    
    const courseLabel = document.createElement('label');
    courseLabel.textContent = 'Assign Course:';
    courseLabel.style.cssText = 'font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.25rem; display: block;';
    
    const courseSelect = document.createElement('select');
    courseSelect.id = `course-select-${id}`;
    courseSelect.className = 'form-control';
    courseSelect.style.cssText = 'padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); width: 100%;';
    courseSelect.innerHTML = `
        <option value="">Select Course</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Physics">Physics</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Computer Science">Computer Science</option>
        <option value="English">English</option>
        <option value="Bangla">Bangla</option>
        <option value="Islamic Studies">Islamic Studies</option>
    `;
    
    if (report.assignedCourse) {
        courseSelect.value = report.assignedCourse;
    }
    
    courseWrapper.appendChild(courseLabel);
    courseWrapper.appendChild(courseSelect);

    // Add button to confirm approval with course
    const approveBtn = document.createElement('button');
    approveBtn.type = 'button';
    approveBtn.className = 'btn btn-primary';
    approveBtn.textContent = 'Approve with Course';
    approveBtn.style.cssText = 'padding: 0.5rem 1rem; margin-top: 0.5rem; display: none;';
    approveBtn.id = `approve-btn-${id}`;
    
    approveBtn.addEventListener('click', () => {
        const selectedCourse = courseSelect.value;
        if (!selectedCourse) {
            showMessage('admin-report-message', 'Please select a course before approving', 'error');
            return;
        }
        updateReportStatus(id, 'approved', selectedCourse);
    });
    
    statusSelect.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        if (newStatus === 'approved') {
            courseWrapper.style.display = 'block';
            courseSelect.required = true;
            approveBtn.style.display = courseSelect.value ? 'block' : 'none';
        } else {
            courseWrapper.style.display = 'none';
            courseSelect.required = false;
            approveBtn.style.display = 'none';
            updateReportStatus(id, newStatus, null);
        }
    });
    
    courseSelect.addEventListener('change', () => {
        if (statusSelect.value === 'approved') {
            approveBtn.style.display = courseSelect.value ? 'block' : 'none';
        }
    });

    statusWrapper.appendChild(statusSelect);
    statusWrapper.appendChild(courseWrapper);
    statusWrapper.appendChild(approveBtn);

    // Show course if already assigned
    if (report.status === 'approved' && report.assignedCourse) {
        courseWrapper.style.display = 'block';
    }

    footer.appendChild(date);
    footer.appendChild(statusWrapper);

    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(footer);

    return card;
}

async function updateReportStatus(reportId, status, assignedCourse = null) {
    try {
        const updateData = { status };
        
        // If approving, require course assignment
        if (status === 'approved') {
            if (!assignedCourse) {
                // Try to get course from select element
                const courseSelect = document.getElementById(`course-select-${reportId}`);
                if (courseSelect && courseSelect.value) {
                    assignedCourse = courseSelect.value;
                } else {
                    showMessage('admin-report-message', 'Please select a course before approving', 'error');
                    return;
                }
            }
            updateData.assignedCourse = assignedCourse;
            updateData.approvedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            // Update student's assigned courses
            const reportDoc = await db.collection('reports').doc(reportId).get();
            const reportData = reportDoc.data();
            
            if (reportData && reportData.studentId) {
                // Find student by studentId and update their courses
                const studentsSnapshot = await db.collection('users')
                    .where('studentId', '==', reportData.studentId)
                    .where('role', '==', 'student')
                    .limit(1)
                    .get();
                
                if (!studentsSnapshot.empty) {
                    const studentDoc = studentsSnapshot.docs[0];
                    const studentData = studentDoc.data();
                    const currentCourses = studentData.assignedCourses || [];
                    
                    if (!currentCourses.includes(assignedCourse)) {
                        await db.collection('users').doc(studentDoc.id).update({
                            assignedCourses: firebase.firestore.FieldValue.arrayUnion(assignedCourse)
                        });
                    }
                }
            }
        }
        
        await db.collection('reports').doc(reportId).update(updateData);
        showMessage('admin-report-message', status === 'approved' ? `Report approved and course assigned!` : 'Report status updated', 'success');
        loadAdminReports();
        loadReports();
    } catch (error) {
        console.error('Error updating report status:', error);
        showMessage('admin-report-message', 'Failed to update status: ' + error.message, 'error');
    }
}

// Teacher Panel Functions
function showTeacherSection(sectionName) {
    document.querySelectorAll('#teacher-app-screen .content-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.teacher-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('.teacher-nav .nav-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase().trim();
        if ((sectionName === 'mark-attendance' && btnText.includes('attendance')) ||
            (sectionName === 'teacher-subjects' && btnText.includes('subjects'))) {
            btn.classList.add('active');
        }
    });
}

async function loadTeacherAttendance() {
    const studentsList = document.getElementById('students-list');
    if (!studentsList) return;
    
    studentsList.innerHTML = '<div class="loading">Loading students...</div>';

    try {
        const studentsSnapshot = await db.collection('users')
            .where('role', '==', 'student')
            .get();

        if (studentsSnapshot.empty) {
            studentsList.innerHTML = '<div class="empty-state"><p>No students found</p></div>';
            return;
        }

        studentsList.innerHTML = '';
        studentsSnapshot.forEach(doc => {
            const student = doc.data();
            const studentCard = createStudentCardForAttendance(doc.id, student);
            studentsList.appendChild(studentCard);
        });
    } catch (error) {
        console.error('Error loading students:', error);
        studentsList.innerHTML = '<div class="empty-state"><p>Error loading students: ' + error.message + '</p></div>';
    }
}

function createStudentCardForAttendance(studentId, student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.style.cssText = 'padding: 1rem; margin-bottom: 1rem; background: var(--card-bg); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;';

    const info = document.createElement('div');
    info.innerHTML = `
        <div style="font-weight: 600; color: var(--text-primary);">${student.name || 'Unknown'}</div>
        <div style="font-size: 0.9rem; color: var(--text-light);">${student.studentId || 'N/A'}</div>
    `;

    const form = document.createElement('form');
    form.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;';
    
    const subjectSelect = document.createElement('select');
    subjectSelect.className = 'form-control';
    subjectSelect.style.cssText = 'padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); min-width: 150px;';
    subjectSelect.innerHTML = `
        <option value="">Select Subject</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Physics">Physics</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Computer Science">Computer Science</option>
        <option value="English">English</option>
        <option value="Bangla">Bangla</option>
    `;

    const statusSelect = document.createElement('select');
    statusSelect.className = 'form-control';
    statusSelect.style.cssText = 'padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color);';
    statusSelect.innerHTML = `
        <option value="present">Present</option>
        <option value="absent">Absent</option>
    `;

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Mark';
    submitBtn.style.cssText = 'padding: 0.5rem 1rem;';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = subjectSelect.value;
        const status = statusSelect.value;

        if (!subject) {
            showMessage('teacher-message', 'Please select a subject', 'error');
            return;
        }

        try {
            await db.collection('attendance').add({
                studentId: student.studentId,
                studentName: student.name,
                subject: subject,
                status: status,
                markedBy: auth.currentUser.uid,
                date: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('teacher-message', `Attendance marked for ${student.name} - ${subject}`, 'success');
            subjectSelect.value = '';
        } catch (error) {
            console.error('Error marking attendance:', error);
            showMessage('teacher-message', 'Error marking attendance: ' + error.message, 'error');
        }
    });

    form.appendChild(subjectSelect);
    form.appendChild(statusSelect);
    form.appendChild(submitBtn);

    card.appendChild(info);
    card.appendChild(form);

    return card;
}

