# Campus Voice

Android campus management app for the IIUC Student Portal. Connects students and admins through attendance tracking, a notice board and digital problem reporting.

Team project, Department of CCE, IIUC: Mosammat Tabasum, Umme Joynob, Lamyea Rashad.

## Problem
- Manual problem reporting is slow and inconvenient
- Students face attendance tracking issues
- Important notices are often missed
- Campus communication isn't centralized

## Features
**Student**
- Secure login
- Attendance summary (total classes, present, absent, attendance %)
- Notice board
- Report a problem (Academic, Infrastructure, Administrative, Other) and view your reports

**Admin**
- Admin login
- Add and manage notices, with optional image or document attachments
- Update attendance
- View and handle student reports
- Manage students and data

## Screenshots
![Attendance, notices and report screens](screenshots/1_attendance_notices_report.png)
![Student portal](screenshots/2_student_portal_screens.png)
![Student login](screenshots/3_student_login.png)
![Admin login](screenshots/4_admin_login.png)

## Tech
Kotlin (Android), Firebase / API backend, HTML + CSS, role-based authentication

## Run locally
1. Clone the repo: `git clone https://github.com/isma20/Campus-Voice-App.git`
2. Open it in Android Studio and let Gradle sync
3. Add your own Firebase config (`google-services.json`) if the project uses Firebase
4. Run on an emulator or device
