// Authentication State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showAppScreen();
        loadUserData();
    } else {
        // User is signed out
        showAuthScreen();
    }
});

// Show/Hide Screens
function showAuthScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
}

function showAppScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
}

function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    clearAuthMessage();
}

function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    clearAuthMessage();
}

function clearAuthMessage() {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = '';
    messageEl.className = 'message';
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 5000);
}

// Authentication Functions
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const studentId = document.getElementById('register-student-id').value;

    if (!name || !email || !password || !studentId) {
        showMessage('auth-message', 'Please fill in all fields', 'error');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            studentId: studentId,
            role: 'student',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage('auth-message', 'Registration successful!', 'success');
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('auth-message', error.message, 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('auth-message', 'Please fill in all fields', 'error');
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('auth-message', 'Login successful!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showMessage('auth-message', error.message, 'error');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
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
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('user-name').textContent = userData.name || user.email;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }

    // Load all sections
    loadNotices();
    loadAttendance();
    loadReports();
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Add active class to selected nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const btnText = btn.textContent.toLowerCase().trim();
        if ((sectionName === 'notices' && btnText === 'notices') ||
            (sectionName === 'attendance' && btnText === 'attendance') ||
            (sectionName === 'report' && btnText === 'report problem')) {
            btn.classList.add('active');
        }
    });
}

// Notices Functions
async function loadNotices() {
    const noticesList = document.getElementById('notices-list');
    noticesList.innerHTML = '<div class="loading">Loading notices...</div>';

    try {
        const noticesSnapshot = await db.collection('notices')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        if (noticesSnapshot.empty) {
            noticesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📢</div><p>No notices available</p></div>';
            return;
        }

        noticesList.innerHTML = '';
        noticesSnapshot.forEach(doc => {
            const notice = doc.data();
            const noticeCard = createNoticeCard(notice);
            noticesList.appendChild(noticeCard);
        });
    } catch (error) {
        console.error('Error loading notices:', error);
        noticesList.innerHTML = '<div class="empty-state"><p>Error loading notices. Please try again.</p></div>';
    }
}

function createNoticeCard(notice) {
    const card = document.createElement('div');
    card.className = 'notice-card';

    const title = document.createElement('div');
    title.className = 'notice-title';
    title.textContent = notice.title || 'Notice';

    const content = document.createElement('div');
    content.className = 'notice-content';
    content.textContent = notice.content || '';

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
            .orderBy('date', 'desc')
            .get();

        let totalClasses = 0;
        let presentCount = 0;
        let absentCount = 0;

        attendanceList.innerHTML = '';

        if (attendanceSnapshot.empty) {
            attendanceList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No attendance records found</p></div>';
        } else {
            attendanceSnapshot.forEach(doc => {
                const attendance = doc.data();
                totalClasses++;
                if (attendance.status === 'present') {
                    presentCount++;
                } else {
                    absentCount++;
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

// Report Functions
document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        showMessage('report-message', 'Please login to report a problem', 'error');
        return;
    }

    const title = document.getElementById('problem-title').value;
    const category = document.getElementById('problem-category').value;
    const description = document.getElementById('problem-description').value;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        await db.collection('reports').add({
            studentId: userData.studentId,
            studentName: userData.name,
            studentEmail: user.email,
            title: title,
            category: category,
            description: description,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage('report-message', 'Problem reported successfully!', 'success');
        document.getElementById('report-form').reset();
        loadReports();
    } catch (error) {
        console.error('Error submitting report:', error);
        showMessage('report-message', 'Error submitting report. Please try again.', 'error');
    }
});

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

        const reportsSnapshot = await db.collection('reports')
            .where('studentId', '==', studentId)
            .orderBy('createdAt', 'desc')
            .get();

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
        reportsList.innerHTML = '<div class="empty-state"><p>Error loading reports. Please try again.</p></div>';
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
    status.textContent = report.status === 'resolved' ? 'Resolved' : 'Pending';

    footer.appendChild(date);
    footer.appendChild(status);

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(footer);

    return card;
}

