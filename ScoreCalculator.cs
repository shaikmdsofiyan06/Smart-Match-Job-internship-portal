namespace SmartMatch;

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Bridge between the DAA layer (KMP, LCS) and the application layer.
/// Extracts skills, computes LCS similarities, and calculates weighted percentage match scores.
/// Specified in SE Report (Section 5.2 &amp; 7.2) and DAA Report (Section 2, 3 &amp; 4).
/// </summary>
public class ScoreCalculator
{
    private readonly StringMatcher _matcher;
    private readonly TextPreprocessor _preprocessor;
    private readonly SkillDatabase _skillDatabase;

    // Minimum LCS similarity ratio to consider two skill phrases a near-match (e.g. "nodejs" vs "node.js")
    private const double NearMatchThreshold = 0.70;

    public ScoreCalculator()
    {
        _matcher = new StringMatcher();
        _preprocessor = new TextPreprocessor();
        _skillDatabase = new SkillDatabase();
    }

    /// <summary>
    /// Dynamic Programming implementation of Longest Common Subsequence (LCS).
    /// Recurrence:
    ///   L[i,j] = 0 if i = 0 or j = 0
    ///   L[i,j] = L[i-1,j-1] + 1 if a[i-1] == b[j-1]
    ///   L[i,j] = max(L[i-1,j], L[i,j-1]) otherwise
    /// Complexity: Time O(mn), Space O(mn)
    /// </summary>
    public int LcsLength(string a, string b)
    {
        if (string.IsNullOrEmpty(a) || string.IsNullOrEmpty(b))
            return 0;

        int m = a.Length;
        int n = b.Length;
        int[,] table = new int[m + 1, n + 1];

        for (int i = 1; i <= m; i++)
        {
            for (int j = 1; j <= n; j++)
            {
                if (char.ToLowerInvariant(a[i - 1]) == char.ToLowerInvariant(b[j - 1]))
                {
                    table[i, j] = table[i - 1, j - 1] + 1;
                }
                else
                {
                    table[i, j] = Math.Max(table[i - 1, j], table[i, j - 1]);
                }
            }
        }

        return table[m, n];
    }

    /// <summary>
    /// Computes normalized LCS similarity ratio: LCS(a, b) / max(|a|, |b|).
    /// Returns a value between 0.0 and 1.0.
    /// </summary>
    public double LcsSimilarity(string a, string b)
    {
        if (string.IsNullOrEmpty(a) && string.IsNullOrEmpty(b))
            return 1.0;
        if (string.IsNullOrEmpty(a) || string.IsNullOrEmpty(b))
            return 0.0;

        int lcs = LcsLength(a, b);
        int maxLen = Math.Max(a.Length, b.Length);
        return (double)lcs / maxLen;
    }

    /// <summary>
    /// Scans text and extracts all recognized technical skills using KMP search.
    /// </summary>
    public List<string> ExtractSkills(string text)
    {
        var detected = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(text))
            return detected.ToList();

        string normalized = _preprocessor.Normalize(text);

        foreach (string skill in _skillDatabase.GetKnownSkills())
        {
            if (_matcher.KmpSearch(normalized, skill))
            {
                // Normalize equivalent skills (e.g., "object-oriented programming" -> "oop")
                string canonical = CanonicalizeSkill(skill);
                detected.Add(canonical);
            }
        }

        return detected.OrderBy(s => s).ToList();
    }

    /// <summary>
    /// Computes the weighted match between resume skills and job description skills.
    /// Incorporates must-have weighting (2x weight) and LCS fallback for near-matches.
    /// </summary>
    public MatchResult ComputeMatch(List<string> resumeSkills, List<string> jdSkills)
    {
        var result = new MatchResult
        {
            TotalRequiredSkills = jdSkills.Count
        };

        if (jdSkills.Count == 0)
        {
            result.MatchPercentage = 0.0;
            return result;
        }

        var resumeSkillSet = new HashSet<string>(resumeSkills, StringComparer.OrdinalIgnoreCase);
        double totalWeightedPoints = 0.0;
        double earnedWeightedPoints = 0.0;

        foreach (string jdSkill in jdSkills)
        {
            string canonicalJd = CanonicalizeSkill(jdSkill);
            double weight = _skillDatabase.IsMustHave(canonicalJd) ? 2.0 : 1.0;
            totalWeightedPoints += weight;

            // 1. Check exact match
            if (resumeSkillSet.Contains(canonicalJd))
            {
                result.MatchedSkills.Add(canonicalJd);
                earnedWeightedPoints += weight;
                continue;
            }

            // 2. Fallback: Check LCS near-match against resume skills (e.g. "nodejs" vs "node.js")
            string? bestNearMatch = null;
            double highestSim = 0.0;

            foreach (string resSkill in resumeSkillSet)
            {
                double sim = LcsSimilarity(canonicalJd, resSkill);
                if (sim >= NearMatchThreshold && sim > highestSim)
                {
                    highestSim = sim;
                    bestNearMatch = resSkill;
                }
            }

            if (bestNearMatch != null)
            {
                result.MatchedSkills.Add(canonicalJd);
                result.NearMatches[canonicalJd] = $"{bestNearMatch} (LCS Similarity: {highestSim:P0})";
                earnedWeightedPoints += weight;
            }
            else
            {
                result.MissingSkills.Add(canonicalJd);
            }
        }

        result.MatchPercentage = totalWeightedPoints > 0 
            ? Math.Round((earnedWeightedPoints / totalWeightedPoints) * 100.0, 2) 
            : 0.0;

        return result;
    }

    private static string CanonicalizeSkill(string skill)
    {
        string trimmed = skill.Trim().ToLowerInvariant();
        if (trimmed == "object-oriented programming") return "oop";
        if (trimmed == "reactjs") return "react";
        return trimmed;
    }
}
