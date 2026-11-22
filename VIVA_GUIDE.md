# SMARTMATCH — VIVA VOCE EXAMINATION PREPARATION GUIDE
**Design and Analysis of Algorithms (DAA) & Software Engineering (SE)**  
**Nandi Institute of Management & Science (NIMS) · BCA V Semester**  
**Team:** Shaik Md Sofiyan (Lead), Shaik Abdul Wadood, Moinuddin, Mohammed Mustafa  
**Faculty Guide:** Prof. Thameemunnisa

---

### PART 1: DESIGN AND ANALYSIS OF ALGORITHMS (DAA) QUESTIONS

#### Q1. Why did you use the KMP algorithm instead of simple Brute-Force search?
**Answer:**  
In simple Brute-Force string matching, whenever a character mismatch occurs after matching $k$ characters, the text pointer backtracks by $k - 1$ steps, giving a worst-case time complexity of $O(n \times m)$ (for text length $n$ and pattern length $m$).  
**Knuth-Morris-Pratt (KMP)** eliminates backtracking completely. It precomputes a **Longest Prefix Suffix (LPS)** array of the pattern in $O(m)$ time. On a mismatch, KMP uses the LPS table to skip redundant comparisons, guaranteeing a linear running time of **$O(n + m)$** regardless of text repetitiveness.

#### Q2. What is the LPS array in KMP and how is it constructed?
**Answer:**  
`lps[i]` stores the length of the longest proper prefix of `pattern[0..i]` that is also a suffix of `pattern[0..i]`.
- **Base Case:** `lps[0] = 0`, `k = 0`.
- **Recurrence:** For each index $i$ from 1 to $m-1$:
  - While $k > 0$ and $pattern[k] \neq pattern[i]$, fall back: $k \leftarrow lps[k - 1]$.
  - If $pattern[k] == pattern[i]$, increment $k \leftarrow k + 1$.
  - Assign $lps[i] \leftarrow k$.
- This takes $O(m)$ time and $O(m)$ auxiliary space.

#### Q3. How does the Rabin-Karp algorithm work, and what is a "rolling hash"?
**Answer:**  
Rabin-Karp treats string windows as numeric values using polynomial hashing:
$$\text{hash}(S) = \left(\sum_{j=0}^{m-1} S[j] \cdot B^{m-1-j}\right) \bmod q$$
Where base $B = 256$ and $q$ is a prime modulus.  
A **rolling hash** allows sliding the window across the text in $O(1)$ time by subtracting the contribution of the exiting character and adding the entering character:
$$H_{\text{new}} = \left( (H_{\text{old}} - T[i] \cdot B^{m-1}) \cdot B + T[i+m] \right) \bmod q$$
Whenever the text window hash equals the pattern hash, character-by-character verification is performed to handle hash collisions.

#### Q4. What is a "spurious hit" in Rabin-Karp?
**Answer:**  
A spurious hit occurs when two completely different strings produce the exact same hash value (hash collision: $\text{hash}(A) \equiv \text{hash}(B) \pmod q$). When this happens, the algorithm spends $O(m)$ time verifying characters only to find they do not match. Using a large prime modulus minimizes spurious hits.

#### Q5. How does the Longest Common Subsequence (LCS) algorithm work in your portal?
**Answer:**  
LCS is implemented using **Dynamic Programming** ($O(mn)$ time and space). It compares two strings (such as a resume skill and a job requirement, or role titles) character by character in sequence, allowing for insertions or deletions.  
**Recurrence Relation:**
$$L[i, j] = \begin{cases} 
0 & \text{if } i = 0 \text{ or } j = 0 \\ 
L[i-1, j-1] + 1 & \text{if } A[i-1] = B[j-1] \\ 
\max(L[i-1, j], L[i, j-1]) & \text{if } A[i-1] \neq B[j-1] 
\end{cases}$$
The normalized similarity ratio is computed as:
$$\text{Similarity}(A, B) = \frac{\text{LCS}(A, B)}{\max(|A|, |B|)}$$
If this score is $\ge 70\%$, the portal treats it as an accepted near-match (e.g. `"nodejs"` vs `"node.js"` = 85.71%).

---

### PART 2: SOFTWARE ENGINEERING (SE) QUESTIONS

#### Q6. Why did you choose the Waterfall SDLC model instead of Agile?
**Answer:**  
The Waterfall model was chosen because:
1. The project has a clearly defined, stable scope and fixed academic submission deadlines.
2. The requirements (DAA algorithms, skill dictionary, scoring rules, report generation) were well understood from the beginning and did not change.
3. Waterfall provides formal sequential milestones (Requirement Analysis $\rightarrow$ System Design $\rightarrow$ Implementation $\rightarrow$ Testing $\rightarrow$ Deployment) which directly maps to our SE project documentation.

#### Q7. How is the principle of "Separation of Concerns" applied in your code?
**Answer:**  
Each responsibility is isolated into its own dedicated class:
- `TextPreprocessor`: Only handles text cleaning, lower-casing, and stop-word filtering.
- `StringMatcher`: Pure algorithmic layer (KMP, Rabin-Karp, Brute Force). Has no dependency on job/resume domain logic.
- `SkillDatabase`: Manages known skills dictionary and must-have weighting rules.
- `ScoreCalculator`: Business logic bridging DAA string algorithms with placement scoring.
- `ReportGenerator`: Presentation layer for formatting and file export (`match_report.txt`).
- `WebServer`: Web presentation and REST API routing.

#### Q8. What is the weighting scheme used for calculating match percentage?
**Answer:**  
As specified in Section 7.2 of the SE Report:
- **Must-Have Skills** (`C#`, `.NET`, `SQL`, `Data Structures`, `Algorithms`, `OOP`): Carry a weight of **2.0 points**.
- **Optional / Auxiliary Skills** (`Git`, `JavaScript`, `Docker`, etc.): Carry a weight of **1.0 point**.
- **Formula:**
$$\text{Match Percentage} = \frac{\sum \text{Earned Weighted Points}}{\sum \text{Total Required Points}} \times 100$$

---

### PART 3: TEST CASES (SECTION 8.2 DEMONSTRATION)

Be ready to explain and run the 5 formal test cases from Section 8.2:
1. **Test 1 (Full Match):** Candidate has all skills required by JD $\rightarrow$ Match score $\approx 100\%$.
2. **Test 2 (Missing Must-Have):** Candidate missing C# $\rightarrow$ Score drops below $80\%$, C# listed under Missing Skills.
3. **Test 3 (Empty Resume):** Empty input file $\rightarrow$ Score $= 0\%$, all JD skills marked missing.
4. **Test 4 (Near-Match Phrasing):** Resume has `"nodejs"`, JD asks for `"node.js"` $\rightarrow$ Matched via LCS Dynamic Programming similarity.
5. **Test 5 (Missing File Error):** Non-existent file path $\rightarrow$ System catches error gracefully with friendly message instead of unhandled crash.
