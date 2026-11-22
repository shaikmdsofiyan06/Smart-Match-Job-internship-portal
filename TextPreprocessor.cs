namespace SmartMatch;

using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

/// <summary>
/// Handles text normalization, tokenization, and stop-word removal.
/// Formally specified in SE Project Report (Section 5.2 &amp; 5.3).
/// </summary>
public class TextPreprocessor
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
        "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", 
        "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
        "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", 
        "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", 
        "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", 
        "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", 
        "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", 
        "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", 
        "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
    };

    /// <summary>
    /// Normalizes raw text by converting to lower case and replacing unnecessary whitespace/punctuation.
    /// Preserves technical characters like '#', '+', and '.' for skills like C#, C++, .NET, Node.js.
    /// </summary>
    public string Normalize(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Convert to lowercase as required by DAA specification
        string lower = text.ToLowerInvariant();

        // Replace carriage returns and newlines with space
        lower = lower.Replace("\r", " ").Replace("\n", " ");

        // Replace punctuation marks (except +, #, ., - which belong to technical names)
        var sb = new StringBuilder();
        foreach (char c in lower)
        {
            if (char.IsLetterOrDigit(c) || c == '#' || c == '+' || c == '.' || c == '-' || char.IsWhiteSpace(c))
            {
                sb.Append(c);
            }
            else
            {
                sb.Append(' ');
            }
        }

        // Collapse multiple consecutive spaces into a single space
        return Regex.Replace(sb.ToString(), @"\s+", " ").Trim();
    }

    /// <summary>
    /// Normalizes text specifically for string matching algorithms (KMP, Rabin-Karp).
    /// </summary>
    public string NormalizeForSearch(string text)
    {
        return Normalize(text);
    }

    /// <summary>
    /// Tokenizes the input text into a list of words, filtering out common English stop-words.
    /// </summary>
    public List<string> Tokenize(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return new List<string>();

        string normalized = Normalize(text);
        string[] parts = normalized.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

        var tokens = new List<string>();
        foreach (string part in parts)
        {
            string clean = part.Trim('.', '-', ',');
            if (!string.IsNullOrEmpty(clean) && !StopWords.Contains(clean))
            {
                tokens.Add(clean);
            }
        }

        return tokens;
    }
}
