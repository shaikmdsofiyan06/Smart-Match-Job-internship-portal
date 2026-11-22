namespace SmartMatch;

using System.Collections.Generic;

/// <summary>
/// Data transfer object holding the computed matching outcome.
/// Specified in SE Project Report Class Diagram (Figure 5.2).
/// </summary>
public class MatchResult
{
    /// <summary>
    /// Skills from the Job Description successfully found in the Resume.
    /// </summary>
    public List<string> MatchedSkills { get; set; } = new();

    /// <summary>
    /// Skills required by the Job Description but absent from the Resume.
    /// </summary>
    public List<string> MissingSkills { get; set; } = new();

    /// <summary>
    /// Near-matching skill explanations identified via LCS Dynamic Programming (e.g. 'nodejs' ~ 'node.js').
    /// </summary>
    public Dictionary<string, string> NearMatches { get; set; } = new();

    /// <summary>
    /// Weighted match percentage (0.0 to 100.0%).
    /// Must-have skills carry 2x weight relative to optional skills.
    /// </summary>
    public double MatchPercentage { get; set; }

    /// <summary>
    /// Total count of distinct technical skills required by the Job Description.
    /// </summary>
    public int TotalRequiredSkills { get; set; }
}
