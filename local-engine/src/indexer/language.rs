//! 语言支持模块

use serde::{Deserialize, Serialize};

/// 支持的编程语言
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Language {
    Java,
    Python,
    JavaScript,
    TypeScript,
    Rust,
    Go,
}

impl Language {
    /// 从文件扩展名检测语言
    pub fn from_extension(ext: &str) -> Option<Self> {
        match ext.to_lowercase().as_str() {
            "java" => Some(Language::Java),
            "py" => Some(Language::Python),
            "js" | "jsx" | "mjs" => Some(Language::JavaScript),
            "ts" | "tsx" => Some(Language::TypeScript),
            "rs" => Some(Language::Rust),
            "go" => Some(Language::Go),
            _ => None,
        }
    }

    /// 从语言名称获取语言
    pub fn from_name(name: &str) -> Option<Self> {
        match name.to_lowercase().as_str() {
            "java" => Some(Language::Java),
            "python" | "py" => Some(Language::Python),
            "javascript" | "js" => Some(Language::JavaScript),
            "typescript" | "ts" => Some(Language::TypeScript),
            "rust" | "rs" => Some(Language::Rust),
            "go" => Some(Language::Go),
            _ => None,
        }
    }

    /// 获取语言名称
    pub fn name(&self) -> &'static str {
        match self {
            Language::Java => "Java",
            Language::Python => "Python",
            Language::JavaScript => "JavaScript",
            Language::TypeScript => "TypeScript",
            Language::Rust => "Rust",
            Language::Go => "Go",
        }
    }

    /// 获取 tree-sitter 语言 ID
    pub fn ts_language(&self) -> &'static str {
        match self {
            Language::Java => "java",
            Language::Python => "python",
            Language::JavaScript => "javascript",
            Language::TypeScript => "typescript",
            Language::Rust => "rust",
            Language::Go => "go",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_language_from_extension() {
        assert_eq!(Language::from_extension("java"), Some(Language::Java));
        assert_eq!(Language::from_extension("py"), Some(Language::Python));
        assert_eq!(Language::from_extension("js"), Some(Language::JavaScript));
        assert_eq!(Language::from_extension("ts"), Some(Language::TypeScript));
        assert_eq!(Language::from_extension("rs"), Some(Language::Rust));
        assert_eq!(Language::from_extension("go"), Some(Language::Go));
        assert_eq!(Language::from_extension("xyz"), None);
    }

    #[test]
    fn test_language_from_name() {
        assert_eq!(Language::from_name("Java"), Some(Language::Java));
        assert_eq!(Language::from_name("python"), Some(Language::Python));
        assert_eq!(Language::from_name("JS"), Some(Language::JavaScript));
        assert_eq!(Language::from_name("unknown"), None);
    }

    #[test]
    fn test_language_name() {
        assert_eq!(Language::Java.name(), "Java");
        assert_eq!(Language::Python.name(), "Python");
    }
}