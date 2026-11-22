// SmartMatch Production Client Engine
// Matches the exact design layout: Landing, Student Dashboard, Recruiter Dashboard, DAA Studio, Auth Modals
// All algorithms execute strictly on the C# .NET Backend

let currentUser = null;
let activeJobs = [];
let lastMatchResult = null;
let currentSelectedJobId = 1;
let signupRole = 'Student';

document.addEventListener('DOMContentLoaded', () => {
    // Check saved session
    const savedUser = localStorage.getItem('smartmatch_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateNavAuth();
        } catch {
            currentUser = null;
        }
    }

    fetchJobs();
    initDropzone();
});

// Toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : (type === 'danger' ? '✗' : 'ℹ');
    toast.innerHTML = `<span><strong>${icon}</strong> ${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Navigation between all 12 views matching the mockup
function navigateTo(view) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide all standalone views and dashboard
    const views = ['view-landing', 'view-internships', 'view-jobs', 'view-applications', 'view-profile', 'view-dashboard-layout'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Reset screen pills
    document.querySelectorAll('.screen-pill').forEach(pill => pill.classList.remove('active'));

    if (view === 'landing') {
        document.getElementById('view-landing').style.display = 'block';
        setActiveNavLink('Home');
        highlightScreenPill('pill-landing');
    } else if (view === 'student') {
        if (!currentUser) {
            currentUser = {
                id: 1,
                name: 'Shaik Md Sofiyan (Team Lead)',
                email: 'sofiyan@nims.edu.in',
                role: 'Student',
                rollNoOrCompany: 'U16NB24S0149'
            };
            localStorage.setItem('smartmatch_user', JSON.stringify(currentUser));
            updateNavAuth();
        }
        document.getElementById('view-dashboard-layout').style.display = 'flex';
        showStudentDashboard();
        highlightScreenPill('pill-student');
    } else if (view === 'recruiter') {
        if (!currentUser || currentUser.role !== 'Recruiter') {
            currentUser = {
                id: 8,
                name: 'TechNova Solutions HR',
                email: 'hr@technova.com',
                role: 'Recruiter',
                rollNoOrCompany: 'TechNova Solutions Ltd.'
            };
            localStorage.setItem('smartmatch_user', JSON.stringify(currentUser));
            updateNavAuth();
        }
        document.getElementById('view-dashboard-layout').style.display = 'flex';
        showRecruiterDashboard();
        highlightScreenPill('pill-recruiter');
    } else if (view === 'daa') {
        document.getElementById('view-dashboard-layout').style.display = 'flex';
        showDaaStudio();
        highlightScreenPill('pill-daa');
    } else if (view === 'internships') {
        document.getElementById('view-internships').style.display = 'block';
        setActiveNavLink('Internships');
        highlightScreenPill('pill-internships');
    } else if (view === 'jobs') {
        document.getElementById('view-jobs').style.display = 'block';
        setActiveNavLink('Jobs');
        highlightScreenPill('pill-jobs');
    } else if (view === 'applications') {
        document.getElementById('view-applications').style.display = 'block';
        setActiveNavLink('Applications');
        highlightScreenPill('pill-applications');
    } else if (view === 'profile') {
        document.getElementById('view-profile').style.display = 'block';
        highlightScreenPill('pill-profile');
    } else if (view === 'about') {
        document.getElementById('view-landing').style.display = 'block';
        scrollToSection('about-section');
        setActiveNavLink('About');
        highlightScreenPill('pill-about');
    } else if (view === 'contact') {
        document.getElementById('view-landing').style.display = 'block';
        scrollToSection('contact-section');
        setActiveNavLink('Contact');
    } else if (view === 'dashboard') {
        openCurrentRoleDashboard();
    }
}

function highlightScreenPill(pillId) {
    const p = document.getElementById(pillId);
    if (p) p.classList.add('active');
}

function filterDedicatedInternships(val) {
    const q = val.toLowerCase().trim();
    document.querySelectorAll('#dedicated-internships-grid .opp-card-mockup').forEach(card => {
        const text = (card.getAttribute('data-title') || '') + ' ' + card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
    });
}

function filterDedicatedJobs(val) {
    const q = val.toLowerCase().trim();
    document.querySelectorAll('#dedicated-jobs-grid .opp-card-mockup').forEach(card => {
        const text = (card.getAttribute('data-title') || '') + ' ' + card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
    });
}

function filterApplicationsDisplay(filterType) {
    document.querySelectorAll('.filter-pills-row .pill-btn').forEach(btn => btn.classList.remove('active'));
    if (filterType === 'all') document.getElementById('btn-app-filter-all')?.classList.add('active');
    else if (filterType === 'internship') document.getElementById('btn-app-filter-internships')?.classList.add('active');
    else if (filterType === 'job') document.getElementById('btn-app-filter-jobs')?.classList.add('active');

    document.querySelectorAll('#dedicated-apps-list .app-track-row').forEach(row => {
        const type = row.getAttribute('data-type');
        if (filterType === 'all' || type === filterType) {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
        }
    });
}

function setActiveNavLink(name) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.textContent.trim() === name);
    });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// User role dashboard router
function openCurrentRoleDashboard() {
    if (!currentUser) {
        openAuthModal('login');
        return;
    }

    document.getElementById('view-landing').style.display = 'none';
    document.getElementById('view-dashboard-layout').style.display = 'flex';

    if (currentUser.role === 'Student') {
        showStudentDashboard();
    } else if (currentUser.role === 'Recruiter') {
        showRecruiterDashboard();
    } else {
        showDaaStudio();
    }
}

function showStudentDashboard() {
    document.getElementById('sidebar-student-menu').style.display = 'flex';
    document.getElementById('sidebar-recruiter-menu').style.display = 'none';
    document.getElementById('sidebar-daa-menu').style.display = 'none';

    document.getElementById('dash-student-container').style.display = 'block';
    document.getElementById('dash-recruiter-container').style.display = 'none';
    document.getElementById('dash-daa-container').style.display = 'none';

    document.getElementById('dash-main-title').textContent = 'Student Dashboard';
    document.getElementById('dash-main-sub').textContent = 'Your journey towards a better career';
    document.getElementById('dash-greeting').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
    document.getElementById('dash-avatar-letter').textContent = currentUser.name[0];

    updateGauge(85);
    renderRecommendedOpportunities();
    loadStudentApplications();
}

function showRecruiterDashboard() {
    document.getElementById('sidebar-student-menu').style.display = 'none';
    document.getElementById('sidebar-recruiter-menu').style.display = 'flex';
    document.getElementById('sidebar-daa-menu').style.display = 'none';

    document.getElementById('dash-student-container').style.display = 'none';
    document.getElementById('dash-recruiter-container').style.display = 'block';
    document.getElementById('dash-daa-container').style.display = 'none';

    document.getElementById('dash-main-title').textContent = 'Recruiter Dashboard';
    document.getElementById('dash-main-sub').textContent = 'Find the right talent for your team';
    document.getElementById('dash-greeting').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('dash-avatar-letter').textContent = 'R';

    loadCandidateLeaderboard();
}

function showDaaStudio() {
    document.getElementById('sidebar-student-menu').style.display = 'none';
    document.getElementById('sidebar-recruiter-menu').style.display = 'none';
    document.getElementById('sidebar-daa-menu').style.display = 'flex';

    document.getElementById('dash-student-container').style.display = 'none';
    document.getElementById('dash-recruiter-container').style.display = 'none';
    document.getElementById('dash-daa-container').style.display = 'block';

    document.getElementById('dash-main-title').textContent = 'DAA Analytics Studio';
    document.getElementById('dash-main-sub').textContent = 'Explore String Matching Algorithms & Empirical Performance';

    switchDaaTab('daa-kmp');
}

// Switch dashboard tabs internally
function switchDashboardTab(tabId) {
    if (tabId === 'dash-student-home') {
        showStudentDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'dash-student-applications') {
        showStudentDashboard();
        document.getElementById('student-apps-card').scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'dash-student-upload' || tabId === 'dash-student-analytics') {
        showStudentDashboard();
        document.getElementById('skill-matcher-box').scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'dash-recruiter-home') {
        showRecruiterDashboard();
    } else if (tabId === 'dash-recruiter-post') {
        openPostJobModal('job');
    } else if (tabId === 'dash-recruiter-applicants') {
        showRecruiterDashboard();
        document.getElementById('recruiter-leaderboard-card').scrollIntoView({ behavior: 'smooth' });
    }
}

// Circular Gauge visual updater
function updateGauge(percentage) {
    const circle = document.getElementById('gauge-progress-circle');
    const text = document.getElementById('gauge-text-val');
    const topMatch = document.getElementById('dash-top-match-val');
    const verdict = document.getElementById('gauge-verdict');

    if (!circle || !text) return;

    // Circumference = 2 * PI * 42 ≈ 264
    const offset = 264 - (264 * percentage / 100);
    circle.style.strokeDashoffset = offset;
    text.textContent = `${Math.round(percentage)}%`;
    if (topMatch) topMatch.textContent = `${Math.round(percentage)}%`;

    if (percentage >= 80) {
        verdict.textContent = 'Excellent Match!';
        verdict.style.color = '#10b981';
        circle.style.stroke = '#10b981';
    } else if (percentage >= 60) {
        verdict.textContent = 'Moderate Match!';
        verdict.style.color = '#f59e0b';
        circle.style.stroke = '#f59e0b';
    } else {
        verdict.textContent = 'Preparation Needed!';
        verdict.style.color = '#ef4444';
        circle.style.stroke = '#ef4444';
    }
}

// Render Recommended Opportunities (Matches Screenshot)
function renderRecommendedOpportunities() {
    const list = document.getElementById('dash-recommended-list');
    if (!list) return;

    list.innerHTML = `
        <div class="rec-item-card">
            <div class="rec-left">
                <span class="company-logo-circle" style="background:#fee2e2; color:#ea4335;">G</span>
                <div class="rec-info">
                    <h4>Software Development Intern</h4>
                    <span>Google · Remote · 3 Months</span>
                </div>
            </div>
            <button class="btn-primary btn-sm" onclick="applyDirect('Software Development Intern', 'Google')">Apply</button>
        </div>
        <div class="rec-item-card">
            <div class="rec-left">
                <span class="company-logo-circle" style="background:#e0e7ff; color:#4f46e5;">M</span>
                <div class="rec-info">
                    <h4>Full Stack Developer</h4>
                    <span>Microsoft · Hybrid · 1-2 Years</span>
                </div>
            </div>
            <button class="btn-primary btn-sm" onclick="applyDirect('Full Stack Developer', 'Microsoft')">Apply</button>
        </div>
    `;
}

function applyDirect(title, company) {
    showToast(`Application submitted to ${company} for ${title}!`, 'success');
    loadStudentApplications();
}

// DAA Studio Tabs
function switchDaaTab(tabName) {
    document.querySelectorAll('.daa-pill').forEach(pill => {
        pill.classList.toggle('active', pill.textContent.toLowerCase().includes(tabName.replace('daa-', '')));
    });

    const title = document.getElementById('daa-algo-title');
    const desc = document.getElementById('daa-algo-desc');
    const comp = document.getElementById('daa-complexity-val');

    if (tabName === 'daa-kmp') {
        title.textContent = 'KMP Algorithm';
        desc.textContent = 'Fast pattern matching using Longest Prefix Suffix (LPS) table without backtracking in text.';
        comp.textContent = 'O(n + m)';
    } else if (tabName === 'daa-rabin') {
        title.textContent = 'Rabin-Karp Algorithm';
        desc.textContent = 'Hash-based pattern scanner utilizing a rolling polynomial hash with prime modulus q=101.';
        comp.textContent = 'O(n + m) avg / O(nm) worst';
    } else if (tabName === 'daa-lcs') {
        title.textContent = 'Longest Common Subsequence (LCS)';
        desc.textContent = 'Dynamic Programming approach measuring character alignment to capture near-matching skill phrasing.';
        comp.textContent = 'O(mn)';
    } else {
        title.textContent = 'Benchmark Suite';
        desc.textContent = 'Empirical execution time measurements on the C# backend using high-precision Stopwatch.';
        comp.textContent = 'Empirical Comparison';
    }
}

// ================= AUTHENTICATION MODAL =================

function openAuthModal(mode = 'login') {
    document.getElementById('auth-modal').style.display = 'flex';
    toggleModalAuthMode(mode);
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function toggleModalAuthMode(mode) {
    const loginView = document.getElementById('modal-login-view');
    const signupView = document.getElementById('modal-signup-view');
    if (mode === 'login') {
        loginView.style.display = 'block';
        signupView.style.display = 'none';
    } else {
        loginView.style.display = 'none';
        signupView.style.display = 'block';
    }
}

function setSignupRole(role) {
    signupRole = role;
    document.getElementById('btn-role-student').classList.toggle('active', role === 'Student');
    document.getElementById('btn-role-recruiter').classList.toggle('active', role === 'Recruiter');
    const rollInput = document.getElementById('modal-reg-roll');
    rollInput.placeholder = role === 'Student' ? 'College Roll No (e.g. U16NB24S0149)' : 'Company Name (e.g. TechNova Ltd.)';
}

function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function quickFillModalLogin(email, password) {
    document.getElementById('modal-login-email').value = email;
    document.getElementById('modal-login-password').value = password;
    showToast(`Loaded demo credentials for ${email}`, 'info');
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('modal-login-email').value.trim();
    const password = document.getElementById('modal-login-password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem('smartmatch_user', JSON.stringify(currentUser));
            showToast(`Welcome back, ${currentUser.name}!`, 'success');
            closeAuthModal();
            updateNavAuth();
            openCurrentRoleDashboard();
        } else {
            showToast(data.error || 'Invalid credentials.', 'danger');
        }
    } catch (err) {
        console.error(err);
        showToast('Login failed. Cannot reach C# backend.', 'danger');
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('modal-reg-name').value.trim(),
        email: document.getElementById('modal-reg-email').value.trim(),
        password: document.getElementById('modal-reg-password').value,
        role: signupRole,
        rollNoOrCompany: document.getElementById('modal-reg-roll').value.trim(),
        phone: '+91 98450 12345'
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem('smartmatch_user', JSON.stringify(currentUser));
            showToast(`Account created! Welcome, ${currentUser.name}`, 'success');
            closeAuthModal();
            updateNavAuth();
            openCurrentRoleDashboard();
        } else {
            showToast(data.error || 'Registration failed.', 'danger');
        }
    } catch (err) {
        console.error(err);
        showToast('Registration failed.', 'danger');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('smartmatch_user');
    showToast('Signed out of SmartMatch.', 'info');
    updateNavAuth();
    navigateTo('landing');
}

function updateNavAuth() {
    const authActions = document.getElementById('nav-auth-actions');
    const userActions = document.getElementById('nav-user-actions');
    if (currentUser) {
        authActions.style.display = 'none';
        userActions.style.display = 'flex';
        document.getElementById('nav-user-name').textContent = currentUser.name.split(' ')[0];
        document.getElementById('nav-user-role').textContent = currentUser.role;
        document.getElementById('nav-avatar-initial').textContent = currentUser.name[0];
    } else {
        authActions.style.display = 'flex';
        userActions.style.display = 'none';
    }
}

// ================= FILE UPLOAD & DROPZONE =================

function initDropzone() {
    const dropzone = document.getElementById('file-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) processFile(files[0]);
    });
}

function triggerFileInput() {
    document.getElementById('resume-file-input').click();
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

async function processFile(file) {
    const statusLabel = document.getElementById('file-status-label');
    statusLabel.textContent = `Extracting ${file.name}...`;

    if (file.name.endsWith('.pdf')) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            document.getElementById('resume-input').value = fullText.trim();
            statusLabel.textContent = `✓ Loaded: ${file.name} (${pdf.numPages}p)`;
            showToast(`PDF "${file.name}" extracted!`, 'success');
        } catch (err) {
            console.error(err);
            statusLabel.textContent = 'Error parsing PDF.';
        }
    } else {
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.getElementById('resume-input').value = evt.target.result;
            statusLabel.textContent = `✓ Loaded: ${file.name}`;
            showToast(`File "${file.name}" loaded!`, 'success');
        };
        reader.readAsText(file);
    }
}

// ================= JOBS FETCH & RENDER =================

async function fetchJobs() {
    try {
        const res = await fetch('/api/jobs');
        activeJobs = await res.json();
        renderLandingJobs(activeJobs);
        populateJobDropdown(activeJobs);
        if (activeJobs.length > 0) selectPreloadedJob();
    } catch (err) {
        console.error('Failed to load jobs:', err);
    }
}

function renderLandingJobs(jobs) {
    const intGrid = document.getElementById('landing-internships-grid');
    const jobsGrid = document.getElementById('landing-jobs-grid');
    if (!intGrid || !jobsGrid) return;

    intGrid.innerHTML = '';
    jobsGrid.innerHTML = '';

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'opp-card';
        card.innerHTML = `
            <div class="opp-top">
                <span class="company-logo-circle">${job.company[0]}</span>
                <span class="opp-badge-featured">Featured</span>
            </div>
            <h3>${job.title}</h3>
            <span class="opp-company">${job.company}</span>
            <div class="opp-meta">📍 ${job.location}</div>
            <p>${job.description.slice(0, 110)}...</p>
            <div class="opp-footer">
                <span class="opp-stipend">${job.stipend}</span>
                <button class="btn-primary btn-sm" onclick="applyDirect('${job.title}', '${job.company}')">Apply Now ➔</button>
            </div>
        `;

        if (job.title.toLowerCase().includes('intern')) {
            intGrid.appendChild(card);
        } else {
            jobsGrid.appendChild(card);
        }
    });
}

function populateJobDropdown(jobs) {
    const select = document.getElementById('preloaded-jobs');
    const lbSelect = document.getElementById('leaderboard-job-select');
    if (!select || !lbSelect) return;

    select.innerHTML = '';
    lbSelect.innerHTML = '';

    jobs.forEach(j => {
        const opt = document.createElement('option');
        opt.value = j.id;
        opt.textContent = `${j.title} · ${j.company}`;
        select.appendChild(opt);

        const lbOpt = document.createElement('option');
        lbOpt.value = j.id;
        lbOpt.textContent = `${j.title} (${j.company})`;
        lbSelect.appendChild(lbOpt);
    });
}

function selectPreloadedJob() {
    const select = document.getElementById('preloaded-jobs');
    const id = parseInt(select.value) || 1;
    currentSelectedJobId = id;
    const job = activeJobs.find(j => j.id === id);
    if (job) {
        document.getElementById('jd-input').value = `Role: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nStipend: ${job.stipend}\nCategory: ${job.category}\n\nDescription:\n${job.description}\n\nRequired Skills:\n${job.requiredSkills.join(', ')}`;
    }
}

function loadSampleResume(who = 'sofiyan') {
    if (who === 'sofiyan') {
        document.getElementById('resume-input').value = `Candidate Name: Shaik Md Sofiyan (Lead)
College: Nandi Institute of Management & Science (NIMS)
Registration No: U16NB24S0149 · BCA V Sem

Summary:
Proficient in C# and modern .NET development. Solid foundations in Algorithms, Data Structures, and Object-Oriented Programming (OOP).

Technical Skills:
- Languages: C#, Python, JavaScript, SQL
- Frameworks: .NET, ASP.NET Core, Node.js, ADO.NET, Git
- Databases: SQL Server, MySQL
- Core Concepts: Algorithms, Data Structures, OOP, DBMS`;
    } else if (who === 'abdul') {
        document.getElementById('resume-input').value = `Candidate: Shaik Abdul Wadood
Registration No: U16NB24S0092 · BCA V Sem (NIMS)
Technical Skills: C#, SQL, HTML, CSS, JavaScript, .NET Framework, OOP, Git`;
    } else {
        document.getElementById('resume-input').value = `Candidate: Moinuddin
Registration No: U16NB24S0105 · BCA V Sem (NIMS)
Technical Skills: Python, SQL, Git, Linux, Algorithms, Data Structures, introductory C#`;
    }

    showToast(`Loaded sample profile for ${who.toUpperCase()}`, 'info');
}

// ================= C# BACKEND ALGORITHM CALLS =================

// 1. Run Matching (STRICTLY C# BACKEND)
async function runMatching() {
    const resumeText = document.getElementById('resume-input').value.trim();
    const jdText = document.getElementById('jd-input').value.trim();

    if (!resumeText || !jdText) {
        showToast('Please provide both Resume and Job Description.', 'danger');
        return;
    }

    try {
        const res = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText, jobDescriptionText: jdText })
        });

        const data = await res.json();
        lastMatchResult = data;

        document.getElementById('match-results-panel').style.display = 'block';
        document.getElementById('backend-timing-tag').textContent = `⚡ Executed in C# Backend (${data.backendExecutionTimeMs} ms)`;
        document.getElementById('result-score-big').textContent = `${data.matchPercentage}% FIT`;
        document.getElementById('matched-count').textContent = data.matchedSkills.length;
        document.getElementById('missing-count').textContent = data.missingSkills.length;

        // Update Gauge in Overview
        updateGauge(data.matchPercentage);

        const matchedWrap = document.getElementById('matched-chips');
        matchedWrap.innerHTML = '';
        data.matchedSkills.forEach(s => {
            const chip = document.createElement('span');
            chip.className = 'chip chip-matched';
            chip.textContent = `✓ ${s.toUpperCase()}`;
            matchedWrap.appendChild(chip);
        });

        const missingWrap = document.getElementById('missing-chips');
        missingWrap.innerHTML = '';
        if (data.missingSkills.length === 0) {
            missingWrap.innerHTML = '<span style="color:#10b981; font-weight:700;">✓ Perfect alignment! Zero skills missing.</span>';
        } else {
            data.missingSkills.forEach(s => {
                const chip = document.createElement('span');
                chip.className = 'chip chip-missing';
                chip.textContent = `✗ ${s.toUpperCase()}`;
                missingWrap.appendChild(chip);
            });
        }

        showToast(`C# Match executed: ${data.matchPercentage}% fit score!`, 'success');
        document.getElementById('match-results-panel').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        showToast('Error connecting to C# backend.', 'danger');
    }
}

// 2. Apply for Current Job
async function applyForCurrentJob() {
    if (!lastMatchResult) {
        showToast('Calculate match fit first.', 'danger');
        return;
    }

    const payload = {
        jobId: currentSelectedJobId,
        candidateName: currentUser ? currentUser.name : 'Shaik Md Sofiyan (Lead)',
        candidateEmail: currentUser ? currentUser.email : 'sofiyan@nims.edu.in',
        candidateRollNo: currentUser ? currentUser.rollNoOrCompany : 'U16NB24S0149',
        matchPercentage: lastMatchResult.matchPercentage
    };

    try {
        const res = await fetch('/api/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.isExisting) {
            showToast(`Already applied! Current Status: ${data.application.status}`, 'info');
        } else {
            showToast(`Application submitted with Fit Score: ${lastMatchResult.matchPercentage}%!`, 'success');
        }
        loadStudentApplications();
    } catch (err) {
        console.error(err);
    }
}

// 3. Load Student Applications (Matches Screenshot Table)
async function loadStudentApplications() {
    const tbody = document.getElementById('my-apps-body');
    if (!tbody) return;

    try {
        const email = currentUser ? currentUser.email : 'sofiyan@nims.edu.in';
        const res = await fetch(`/api/applications?email=${encodeURIComponent(email)}`);
        const apps = await res.json();

        const countEl = document.getElementById('dash-applied-count');
        if (countEl) countEl.textContent = apps.length;

        tbody.innerHTML = '';
        apps.forEach(a => {
            let badgeClass = 'badge-fit-green';
            if (a.status === 'Under Review') badgeClass = 'tag-skill';
            else if (a.status === 'Interview Scheduled') badgeClass = 'badge-fit-green';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${a.jobTitle}</strong></td>
                <td>${a.company}</td>
                <td>${a.appliedAt}</td>
                <td><strong class="text-purple">${a.matchPercentage}%</strong></td>
                <td><span class="${badgeClass}">${a.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

// 4. Recruiter Candidate Leaderboard (QuickSort C# Backend)
async function loadCandidateLeaderboard() {
    const jobId = document.getElementById('leaderboard-job-select').value || 1;
    const tbody = document.getElementById('leaderboard-body');
    const sortBanner = document.getElementById('sort-metrics-banner');
    if (!tbody) return;

    try {
        const res = await fetch(`/api/candidates/rank/${jobId}`);
        const data = await res.json();

        sortBanner.innerHTML = `⚡ <strong>C# QuickSort Executed:</strong> ${data.totalCandidates} candidates partitioned & sorted in <strong>${data.sortingTimeMs} ms</strong> (${data.sortingComparisons} key comparisons). Algorithm: <em>${data.sortingAlgorithm}</em>`;

        tbody.innerHTML = '';
        data.candidates.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${idx + 1}</strong></td>
                <td><strong>${c.name}</strong><br><small style="color:#64748b;">${c.email}</small></td>
                <td><code>${c.rollNo}</code></td>
                <td><strong class="badge-fit-green">${c.matchPercentage}%</strong></td>
                <td><small style="color:#10b981; font-weight:700;">${Array.isArray(c.matchedSkills) ? c.matchedSkills.join(', ') : c.matchedSkills}</small></td>
                <td><small style="color:#ef4444;">${Array.isArray(c.missingSkills) ? (c.missingSkills.length > 0 ? c.missingSkills.join(', ') : 'None (100% Match)') : (c.missingSkills || 'None (100% Match)')}</small></td>
                <td>
                    <button class="btn-primary btn-sm" onclick="showToast('Interview scheduled for ${c.name}!', 'success')">Schedule</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

// 5. DAA 2D DP LCS Table Generator (C# Backend)
async function generateDpMatrix() {
    const str1 = document.getElementById('dp-str1').value.trim();
    const str2 = document.getElementById('dp-str2').value.trim();

    try {
        const res = await fetch('/api/lcs/matrix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ str1, str2 })
        });
        const data = await res.json();

        document.getElementById('dp-matrix-container').style.display = 'block';
        document.getElementById('dp-lcs-len').textContent = data.lcsLength;
        document.getElementById('dp-max-len').textContent = Math.max(data.str1.length, data.str2.length);
        document.getElementById('dp-similarity').textContent = `${data.similarity}%`;
        document.getElementById('dp-backend-time').textContent = `${data.backendTimeMs} ms`;

        const pathSet = new Set(data.path.map(p => `${p[0]},${p[1]}`));
        const wrapper = document.getElementById('matrix-table-wrapper');
        let html = '<table class="dp-table"><thead><tr><th>a \\ b</th><th>∅</th>';
        for (let j = 0; j < data.str2.length; j++) html += `<th>${data.str2[j]}</th>`;
        html += '</tr></thead><tbody>';

        for (let i = 0; i <= data.str1.length; i++) {
            html += '<tr>';
            html += `<th>${i === 0 ? '∅' : data.str1[i - 1]}</th>`;
            for (let j = 0; j <= data.str2.length; j++) {
                const isTrace = pathSet.has(`${i},${j}`);
                html += `<td class="${isTrace ? 'dp-cell-trace' : ''}">${data.matrix[i][j]}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        wrapper.innerHTML = html;
        showToast(`2D DP Matrix computed in C# in ${data.backendTimeMs} ms!`, 'info');
    } catch (err) {
        console.error(err);
    }
}

function setDpPreset(s1, s2) {
    document.getElementById('dp-str1').value = s1;
    document.getElementById('dp-str2').value = s2;
    generateDpMatrix();
}

// 6. DAA Benchmark (C# Backend)
async function runBenchmark() {
    const tbody = document.getElementById('benchmark-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Benchmarking KMP vs Rabin-Karp on C# backend...</td></tr>';

    try {
        const res = await fetch('/api/benchmark');
        const rows = await res.json();
        tbody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${r.n.toLocaleString()}</strong></td>
                <td>${r.kmpComps.toLocaleString()}</td>
                <td>${r.rkMatches.toLocaleString()}</td>
                <td>${r.rkSpurious.toLocaleString()}</td>
                <td>${r.rkChecks.toLocaleString()}</td>
                <td><strong style="color:#6366f1;">${r.kmpTimeMs} ms</strong></td>
                <td><strong style="color:#06b6d4;">${r.rkTimeMs} ms</strong></td>
            `;
            tbody.appendChild(tr);
        });
        showToast('C# Stopwatch Benchmark finished!', 'success');
    } catch (err) {
        console.error(err);
    }
}

// 7. Post Job Modal
function openPostJobModal(type) {
    document.getElementById('post-job-modal').style.display = 'flex';
}

function closePostJobModal() {
    document.getElementById('post-job-modal').style.display = 'none';
}

async function handleRecruiterPostSubmit(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('post-title').value,
        company: document.getElementById('post-company').value,
        location: document.getElementById('post-location').value,
        stipend: document.getElementById('post-stipend').value,
        category: 'General Software',
        description: document.getElementById('post-desc').value
    };

    try {
        const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast('Opening published to C# backend!', 'success');
            closePostJobModal();
            fetchJobs();
        }
    } catch (err) {
        console.error(err);
    }
}

// Print Certificate
function printOfficialCertificate() {
    window.print();
}

function handleLandingSearch() {
    const val = document.getElementById('landing-search-input').value.trim();
    if (val) {
        showToast(`Searching opportunities matching "${val}"...`, 'info');
        scrollToSection('landing-internships-grid');
    }
}
