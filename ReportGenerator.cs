namespace SmartMatch;

using System;
using System.IO;
using System.Text;

/// <summary>
/// Formats and renders the job match evaluation report to console and text files.
/// Specified in SE Project Report (Section 5.2, 5.3 &amp; 7.1).
/// </summary>
public class ReportGenerator
{
    /// <summary>
    /// Displays the detailed match report in the console with formatted sections and metrics.
    /// </summary>
    public void PrintReport(MatchResult result)
    {
        Console.WriteLine(GenerateReportString(result));
    }

    /// <summary>
    /// Saves the generated match evaluation report to the specified file path (default: match_report.txt).
    /// </summary>
    public void SaveReportToFile(MatchResult result, string path = "match_report.txt")
    {
        string content = GenerateReportString(result);
        File.WriteAllText(path, content, Encoding.UTF8);
        Console.WriteLine($"[Success] Full report successfully exported to: {Path.GetFullPath(path)}");
    }

    /// <summary>
    /// Constructs the formatted report string.
    /// </summary>
    public string GenerateReportString(MatchResult result)
    {
        var sb = new StringBuilder();
        var skillDb = new SkillDatabase();

        sb.AppendLine("================================================================================");
        sb.AppendLine("                 SMARTMATCH - RESUME EVALUATION & FIT REPORT                    ");
        sb.AppendLine("          Department of Computer Application - Nandi Institute (NIMS)           ");
        sb.AppendLine("================================================================================");
        sb.AppendLine($"Generated On          : {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine($"Overall Fit Score     : {result.MatchPercentage:F2}%");
        sb.AppendLine($"Total Required Skills : {result.TotalRequiredSkills}");
        sb.AppendLine($"Skills Matched        : {result.MatchedSkills.Count}");
        sb.AppendLine($"Skills Missing        : {result.MissingSkills.Count}");
        sb.AppendLine($"Score Assessment      : {GetAssessmentBadge(result.MatchPercentage)}");
        sb.AppendLine("--------------------------------------------------------------------------------");

        // Matched Skills Breakdown
        sb.AppendLine("1. MATCHED TECHNICAL SKILLS:");
        if (result.MatchedSkills.Count == 0)
        {
            sb.AppendLine("   (No matching technical skills detected)");
        }
        else
        {
            foreach (string skill in result.MatchedSkills)
            {
                bool isMustHave = skillDb.IsMustHave(skill);
                string tag = isMustHave ? "[MUST-HAVE (2x Weight)]" : "[OPTIONAL  (1x Weight)]";
                
                if (result.NearMatches.TryGetValue(skill, out string? nearMatchInfo))
                {
                    sb.AppendLine($"   [✓] {skill.ToUpperInvariant(),-15} {tag,-26} (Near-Match via LCS: {nearMatchInfo})");
                }
                else
                {
                    sb.AppendLine($"   [✓] {skill.ToUpperInvariant(),-15} {tag,-26} (Exact Match via KMP Search)");
                }
            }
        }

        sb.AppendLine();

        // Missing Skills Breakdown
        sb.AppendLine("2. MISSING SKILLS & GAP ANALYSIS:");
        if (result.MissingSkills.Count == 0)
        {
            sb.AppendLine("   [✓] Perfect technical coverage! No required skills are missing.");
        }
        else
        {
            foreach (string skill in result.MissingSkills)
            {
                bool isMustHave = skillDb.IsMustHave(skill);
                string tag = isMustHave ? "[CRITICAL MUST-HAVE GAP]" : "[OPTIONAL DESIRABLE GAP]";
                sb.AppendLine($"   [✗] {skill.ToUpperInvariant(),-15} {tag}");
            }
        }

        sb.AppendLine();

        // Actionable Recommendations
        sb.AppendLine("3. ACTIONABLE PLACEMENT RECOMMENDATION:");
        if (result.MatchPercentage >= 80.0)
        {
            sb.AppendLine("   -> Highly Recommended: Candidate demonstrates excellent alignment with core requirements.");
            sb.AppendLine("      Ready for immediate interview scheduling.");
        }
        else if (result.MatchPercentage >= 60.0)
        {
            sb.AppendLine("   -> Moderate Match: Candidate meets fundamental requirements but has gaps in specific tools.");
            sb.AppendLine("      Recommend technical screening with focus on missing skills.");
        }
        else
        {
            sb.AppendLine("   -> Low Match: Significant gap in essential must-have skills.");
            sb.AppendLine("      Recommend candidate upskill in highlighted areas before re-applying.");
        }

        sb.AppendLine("================================================================================");
        return sb.ToString();
    }

    private static string GetAssessmentBadge(double percentage)
    {
        if (percentage >= 85.0) return "EXCELLENT FIT (Tier 1 Match)";
        if (percentage >= 70.0) return "STRONG FIT (Tier 2 Match)";
        if (percentage >= 50.0) return "MODERATE FIT (Potential Candidate)";
        return "LOW FIT (Requires Upskilling)";
    }
}
