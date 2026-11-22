namespace SmartMatch;

using System;
using System.Collections.Generic;

/// <summary>
/// Predefined database of known technical skills and default must-have skill designations.
/// Specified in SE Project Report (Section 5.2 &amp; 7.2).
/// </summary>
public class SkillDatabase
{
    /// <summary>
    /// Master list of known technical skills across programming languages,
    /// frameworks, databases, and core computer science domains.
    /// </summary>
    public static readonly List<string> KnownSkills = new()
    {
        // Core Languages
        "c#", "python", "java", "c++", "javascript", "typescript", "php", "ruby", "c", "sql", "html", "css",
        
        // Frameworks & Runtimes
        ".net", "asp.net", "asp.net core", "ado.net", "react", "angular", "vue", "node.js", "nodejs", 
        "express", "django", "flask", "spring boot", "reactjs",
        
        // Databases
        "sql server", "mysql", "postgresql", "mongodb", "sqlite", "oracle",
        
        // Core Computer Science Concepts
        "data structures", "algorithms", "oop", "object-oriented programming", 
        "dbms", "operating systems", "computer networks",
        
        // Tools & Cloud
        "git", "github", "docker", "kubernetes", "aws", "azure", "linux"
    };

    /// <summary>
    /// Must-have skills as formally documented in Section 7.2 of the SE Report.
    /// These carry double weight (2x) during match percentage calculation.
    /// </summary>
    public static readonly HashSet<string> MustHaveDefaults = new(StringComparer.OrdinalIgnoreCase)
    {
        "c#",
        ".net",
        "sql",
        "data structures",
        "algorithms",
        "oop"
    };

    /// <summary>
    /// Returns whether the given skill is categorized as a must-have skill.
    /// </summary>
    public bool IsMustHave(string skill)
    {
        if (string.IsNullOrWhiteSpace(skill))
            return false;

        string normalized = skill.Trim().ToLowerInvariant();
        if (normalized == "object-oriented programming")
            normalized = "oop";

        return MustHaveDefaults.Contains(normalized);
    }

    /// <summary>
    /// Returns the collection of all recognized skills.
    /// </summary>
    public List<string> GetKnownSkills()
    {
        return new List<string>(KnownSkills);
    }
}
