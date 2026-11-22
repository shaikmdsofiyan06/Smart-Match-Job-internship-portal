# SMARTMATCH — Smart Internship & Job-Matching Portal
**Department of Computer Application · Nandi Institute of Management & Science (NIMS)**  
**BCA V Semester (Academic Year 2026–2027)**

---

### Project Overview
**SmartMatch** is an algorithmic Applicant Tracking & Job-Matching System developed in C# (.NET). It evaluates candidate resumes against internship and job descriptions using classical string-matching algorithms and Dynamic Programming:
- **Knuth-Morris-Pratt (KMP) Algorithm** ($O(n + m)$): Fast, exact skill extraction using precomputed Longest Prefix Suffix (LPS) tables without backtracking.
- **Rabin-Karp Algorithm** ($O(n + m)$ avg, $O(nm)$ worst): Rolling hash keyword scanning with collision verification ($q = 101, B = 256$).
- **Longest Common Subsequence (LCS)** ($O(mn)$ Dynamic Programming): Computes partial similarity ratios to capture near-matching skill phrasing (e.g. `nodejs` vs `node.js` = 85.71% similarity).
- **Interactive Web Portal**: Full student, recruiter, and DAA analytics dashboard running locally on ASP.NET Core.

---

### Project Team Members
| Name | Role | UUCMS Registration No. |
| :--- | :--- | :--- |
| **Shaik Md Sofiyan** | Team Lead | U16NB24S0149 |
| **Shaik Abdul Wadood** | Team Member | U16NB24S0092 |
| **Moinuddin** | Team Member | U16NB24S0105 |
| **Mohammed Mustafa** | Team Member | U16NB24S095 |

- **DAA Lecturer / Guide:** Prof. Thameemunnisa  
- **Subjects Covered:** Design and Analysis of Algorithms (DAA) & Software Engineering (SE)

---

### Architecture & Modular Structure

```
SmartMatch/
├── TextPreprocessor.cs      # Lower-casing, tokenization, stop-word removal, symbol preservation (#, +, .)
├── StringMatcher.cs         # KMP, Rabin-Karp, Brute-Force, and word-boundary validation
├── SkillDatabase.cs         # Known technical skill catalog & double-weighted must-have rules
├── ScoreCalculator.cs       # KMP skill extraction + LCS Dynamic Programming similarity scoring
├── ReportGenerator.cs       # Formatted console output & export to match_report.txt
├── WebServer.cs             # ASP.NET Core REST API & static file web server
├── Program.cs               # CLI menu, automated pipeline runner, DAA benchmarks
├── wwwroot/                 # Web Portal UI assets
│   ├── index.html           # Responsive HTML5 UI (Student, Recruiter, DAA Studio)
│   ├── style.css            # Modern responsive CSS styles
│   └── app.js               # REST client logic & interactive benchmark runner
├── resume.txt               # Sample BCA candidate resume
├── job_description.txt      # Sample junior software engineer job description
└── match_report.txt         # Auto-generated fit score & gap analysis report
```

---

### Algorithmic Complexity Summary

| Algorithm | Paradigm | Best Case | Average Case | Worst Case | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **KMP Search** | Amortized Prefix Analysis | $O(n + m)$ | $O(n + m)$ | $O(n + m)$ | $O(m)$ |
| **Rabin-Karp** | Rolling Hash | $O(n + m)$ | $O(n + m)$ | $O(nm)$ | $O(1)$ |
| **Brute Force** | Exhaustive Comparison | $O(n)$ | $O(nm)$ | $O(nm)$ | $O(1)$ |
| **LCS Similarity**| Dynamic Programming | $O(mn)$ | $O(mn)$ | $O(mn)$ | $O(mn)$ |

---

### How to Run the Project

#### 1. Interactive Web Portal (Browser UI)
Launch the web server and open the portal in your browser:
```bash
dotnet run -- --web
```
Then navigate to: **`http://localhost:5000`**
- **Student Portal**: Paste or load sample resumes, select internship listings, and see live fit scores with skill chips.
- **Recruiter Panel**: Post new jobs, configure requirements, and view applicants.
- **DAA Algorithm Studio**: Run live KMP vs Rabin-Karp benchmarks and test the LCS DP sandbox.

#### 2. Interactive Console Application
```bash
dotnet run
```
Presents a 6-option numbered menu in your terminal.

#### 3. Direct CLI Pipeline
```bash
dotnet run -- resume.txt job_description.txt
```
Evaluates the candidate profile against the job posting and exports the report to `match_report.txt`.

#### 4. Run DAA Runtime Benchmarks
```bash
dotnet run -- --benchmark
```
Runs KMP vs Rabin-Karp across $n = 1,000$, $10,000$, and $100,000$ characters.

#### 5. Run LCS Dynamic Programming Demo
```bash
dotnet run -- --lcs
```

#### 6. Run Software Engineering Test Suite (Section 8.2)
```bash
dotnet run -- --test
```
Verifies all 5 formal test cases (100% match, missing must-haves, empty input, near-matches, and missing file error handling).
