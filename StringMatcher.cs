namespace SmartMatch;

using System;
using System.Collections.Generic;

/// <summary>
/// Implements classical string matching algorithms:
/// 1. Knuth-Morris-Pratt (KMP) with LPS array preprocessing - O(n + m)
/// 2. Rabin-Karp with rolling hash - O(n + m) avg, O(nm) worst
/// 3. Brute Force search - O(nm) baseline
/// Conforms to DAA Project Report (Sections 2, 3, 5, 6).
/// </summary>
public class StringMatcher
{
    private const int BaseB = 256;
    private const int DefaultModulusQ = 101; // Chosen as small prime for DAA demonstration, or 1000000007 for production

    /// <summary>
    /// Computes Longest Prefix Suffix (LPS) / Prefix function array for KMP in O(m) time.
    /// DAA Pseudocode: ComputePrefix(p)
    /// </summary>
    public int[] BuildLpsArray(string pattern)
    {
        int m = pattern.Length;
        int[] lps = new int[m];
        if (m == 0) return lps;

        lps[0] = 0;
        int k = 0;

        for (int i = 1; i < m; i++)
        {
            while (k > 0 && pattern[k] != pattern[i])
            {
                k = lps[k - 1];
            }

            if (pattern[k] == pattern[i])
            {
                k++;
            }

            lps[i] = k;
        }

        return lps;
    }

    /// <summary>
    /// Checks if pattern exists in text using KMP algorithm.
    /// Returns true if found, false otherwise.
    /// </summary>
    public bool KmpSearch(string text, string pattern)
    {
        return KmpSearch(text, pattern, wholeWordOnly: true);
    }

    /// <summary>
    /// KMP Search with option for whole-word boundary matching (handles edge case: 'java' in 'javascript').
    /// </summary>
    public bool KmpSearch(string text, string pattern, bool wholeWordOnly)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern))
            return false;

        if (pattern.Length > text.Length)
            return false;

        int[] lps = BuildLpsArray(pattern);
        int j = 0; // index for pattern

        for (int i = 0; i < text.Length; i++)
        {
            while (j > 0 && pattern[j] != text[i])
            {
                j = lps[j - 1];
            }

            if (pattern[j] == text[i])
            {
                j++;
            }

            if (j == pattern.Length)
            {
                int matchIndex = i - pattern.Length + 1;
                if (!wholeWordOnly || IsWordBoundary(text, matchIndex, pattern.Length))
                {
                    return true;
                }
                j = lps[j - 1]; // continue searching for next occurrence
            }
        }

        return false;
    }

    /// <summary>
    /// Returns all starting indices of pattern in text using KMP and counts total comparisons.
    /// </summary>
    public List<int> FindOccurrencesKmp(string text, string pattern, out long comparisons)
    {
        var found = new List<int>();
        comparisons = 0;

        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern) || pattern.Length > text.Length)
            return found;

        int[] lps = BuildLpsArray(pattern);
        int j = 0;

        for (int i = 0; i < text.Length; i++)
        {
            while (j > 0 && pattern[j] != text[i])
            {
                comparisons++;
                j = lps[j - 1];
            }

            comparisons++;
            if (pattern[j] == text[i])
            {
                j++;
            }

            if (j == pattern.Length)
            {
                found.Add(i - pattern.Length + 1);
                j = lps[j - 1];
            }
        }

        return found;
    }

    /// <summary>
    /// Rabin-Karp pattern search using rolling hash.
    /// DAA Pseudocode: RabinKarp(t, p)
    /// </summary>
    public bool RabinKarpSearch(string text, string pattern)
    {
        return RabinKarpSearch(text, pattern, DefaultModulusQ, wholeWordOnly: true);
    }

    public bool RabinKarpSearch(string text, string pattern, int q, bool wholeWordOnly = true)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern) || pattern.Length > text.Length)
            return false;

        int n = text.Length;
        int m = pattern.Length;

        // h = B^(m-1) % q
        long h = 1;
        for (int i = 0; i < m - 1; i++)
        {
            h = (h * BaseB) % q;
        }

        long hp = 0;
        long ht = 0;

        // Initial hash of pattern and first window
        for (int i = 0; i < m; i++)
        {
            hp = (BaseB * hp + (int)pattern[i]) % q;
            ht = (BaseB * ht + (int)text[i]) % q;
        }

        for (int i = 0; i <= n - m; i++)
        {
            if (hp == ht)
            {
                // Verify character by character
                bool match = true;
                for (int j = 0; j < m; j++)
                {
                    if (text[i + j] != pattern[j])
                    {
                        match = false;
                        break;
                    }
                }

                if (match && (!wholeWordOnly || IsWordBoundary(text, i, m)))
                {
                    return true;
                }
            }

            // Roll hash to next window
            if (i < n - m)
            {
                ht = (BaseB * (ht - (text[i] * h) % q + q) + text[i + m]) % q;
            }
        }

        return false;
    }

    /// <summary>
    /// Rabin-Karp search collecting detailed DAA metrics: hash matches, spurious matches, character checks.
    /// </summary>
    public List<int> FindOccurrencesRabinKarp(string text, string pattern, int q, out long hashMatches, out long spuriousMatches, out long charChecks)
    {
        var found = new List<int>();
        hashMatches = 0;
        spuriousMatches = 0;
        charChecks = 0;

        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern) || pattern.Length > text.Length)
            return found;

        int n = text.Length;
        int m = pattern.Length;

        long h = 1;
        for (int i = 0; i < m - 1; i++)
        {
            h = (h * BaseB) % q;
        }

        long hp = 0;
        long ht = 0;

        for (int i = 0; i < m; i++)
        {
            hp = (BaseB * hp + (int)pattern[i]) % q;
            ht = (BaseB * ht + (int)text[i]) % q;
        }

        for (int i = 0; i <= n - m; i++)
        {
            if (hp == ht)
            {
                hashMatches++;
                bool match = true;
                for (int j = 0; j < m; j++)
                {
                    charChecks++;
                    if (text[i + j] != pattern[j])
                    {
                        match = false;
                        break;
                    }
                }

                if (match)
                {
                    found.Add(i);
                }
                else
                {
                    spuriousMatches++;
                }
            }

            if (i < n - m)
            {
                ht = (BaseB * (ht - (text[i] * h) % q + q) + text[i + m]) % q;
            }
        }

        return found;
    }

    /// <summary>
    /// Brute Force search O(nm) baseline for comparison.
    /// </summary>
    public bool BruteForceSearch(string text, string pattern)
    {
        return BruteForceSearch(text, pattern, wholeWordOnly: true);
    }

    public bool BruteForceSearch(string text, string pattern, bool wholeWordOnly)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern) || pattern.Length > text.Length)
            return false;

        int n = text.Length;
        int m = pattern.Length;

        for (int i = 0; i <= n - m; i++)
        {
            int j = 0;
            while (j < m && text[i + j] == pattern[j])
            {
                j++;
            }

            if (j == m && (!wholeWordOnly || IsWordBoundary(text, i, m)))
            {
                return true;
            }
        }

        return false;
    }

    public List<int> FindOccurrencesBruteForce(string text, string pattern, out long comparisons)
    {
        var found = new List<int>();
        comparisons = 0;

        if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(pattern) || pattern.Length > text.Length)
            return found;

        int n = text.Length;
        int m = pattern.Length;

        for (int i = 0; i <= n - m; i++)
        {
            int j = 0;
            while (j < m)
            {
                comparisons++;
                if (text[i + j] != pattern[j])
                    break;
                j++;
            }

            if (j == m)
            {
                found.Add(i);
            }
        }

        return found;
    }

    /// <summary>
    /// Checks word boundaries around a match to prevent false positives (e.g. 'java' matching 'javascript').
    /// </summary>
    private static bool IsWordBoundary(string text, int index, int length)
    {
        // Character before match must not be alphanumeric or special connector
        if (index > 0)
        {
            char prev = text[index - 1];
            if (char.IsLetterOrDigit(prev))
                return false;
        }

        // Character after match must not be alphanumeric or special connector
        int endIndex = index + length;
        if (endIndex < text.Length)
        {
            char next = text[endIndex];
            if (char.IsLetterOrDigit(next))
                return false;
        }

        return true;
    }
}
