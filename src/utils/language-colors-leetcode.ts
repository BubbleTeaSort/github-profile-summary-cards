export const LANGUAGE_COLORS: { [key: string]: string } = {
    "C++": "#f34b7d",
    "Java": "#b07219",
    "Python3": "#3572A5",
    "Python": "#3572A5",
    "JavaScript": "#f1e05a",
    "TypeScript": "#3178c6",
    "C#": "#178600",
    "C": "#555555",
    "Go": "#00ADD8",
    "Kotlin": "#A97BFF",
    "Swift": "#F05138",
    "Rust": "#dea584",
    "Ruby": "#701516",
    "PHP": "#4F5D95",
    "Dart": "#00B4AB",
    "Scala": "#c22d40",
    "Elixir": "#6e4a7e",
    "Erlang": "#B83998",
    "Racket": "#3c5caa"
};

export const getLanguageColor = (name: string): string => {
    return LANGUAGE_COLORS[name] || "#ffa116";
};