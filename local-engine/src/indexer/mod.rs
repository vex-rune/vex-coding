//! 代码解析器模块

mod language;

pub use language::Language;

use crate::graph::{Node, NodeKind, CodeGraph};
use std::collections::HashMap;

/// 解析错误
#[derive(Debug, thiserror::Error)]
pub enum ParseError {
    #[error("不支持的语言: {0}")]
    UnsupportedLanguage(String),
    
    #[error("解析失败: {0}")]
    ParseFailed(String),
}

/// 代码解析器
pub struct Parser {
    /// 文件扩展名到语言的映射
    language_map: HashMap<String, Language>,
}

impl Parser {
    /// 创建新的解析器
    pub fn new() -> Self {
        let mut language_map = HashMap::new();
        language_map.insert("java".to_string(), Language::Java);
        language_map.insert("py".to_string(), Language::Python);
        language_map.insert("js".to_string(), Language::JavaScript);
        language_map.insert("jsx".to_string(), Language::JavaScript);
        language_map.insert("ts".to_string(), Language::TypeScript);
        language_map.insert("tsx".to_string(), Language::TypeScript);
        language_map.insert("rs".to_string(), Language::Rust);
        language_map.insert("go".to_string(), Language::Go);
        
        Self { language_map }
    }

    /// 从文件路径检测语言
    pub fn detect_language(&self, file_path: &str) -> Option<Language> {
        let ext = std::path::Path::new(file_path)
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase())?;
        
        self.language_map.get(&ext).copied()
    }

    /// 解析代码并构建图
    pub fn parse(&self, source: &str, file_path: &str) -> Result<CodeGraph, ParseError> {
        let language = self.detect_language(file_path)
            .ok_or_else(|| ParseError::UnsupportedLanguage(file_path.to_string()))?;
        
        self.parse_with_language(source, file_path, language)
    }

    /// 使用指定语言解析代码
    pub fn parse_with_language(
        &self,
        source: &str,
        file_path: &str,
        language: Language,
    ) -> Result<CodeGraph, ParseError> {
        let mut graph = CodeGraph::new();
        
        // 简化实现：基于正则匹配提取符号
        // 完整实现需要集成 tree-sitter
        match language {
            Language::Java => self.parse_java(source, file_path, &mut graph),
            Language::Python => self.parse_python(source, file_path, &mut graph),
            Language::JavaScript | Language::TypeScript => {
                self.parse_js(source, file_path, &mut graph)
            }
            Language::Rust => self.parse_rust(source, file_path, &mut graph),
            Language::Go => self.parse_go(source, file_path, &mut graph),
        }
        
        Ok(graph)
    }

    /// 解析 Java 代码
    fn parse_java(&self, source: &str, file_path: &str, graph: &mut CodeGraph) {
        use regex::Regex;
        
        // 提取类
        let class_regex = Regex::new(r"(?:public\s+|private\s+|protected\s+)?class\s+(\w+)").unwrap();
        for cap in class_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Class,
                    name.as_str(),
                    file_path,
                    1,
                    100,
                );
                graph.add_node(node);
            }
        }
        
        // 提取方法
        let method_regex = Regex::new(
            r"(?:public\s+|private\s+|protected\s+)?(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*\{"
        ).unwrap();
        for cap in method_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let name_str = name.as_str();
                // 跳过类名
                if !name_str.chars().next().map(|c| c.is_uppercase()).unwrap_or(false) {
                    let node = Node::new(
                        format!("{}_{}_{}", file_path, name_str, 0),
                        NodeKind::Method,
                        name_str,
                        file_path,
                        1,
                        10,
                    );
                    graph.add_node(node);
                }
            }
        }
    }

    /// 解析 Python 代码
    fn parse_python(&self, source: &str, file_path: &str, graph: &mut CodeGraph) {
        use regex::Regex;
        
        // 提取类
        let class_regex = Regex::new(r"^class\s+(\w+)").unwrap();
        for (i, line) in source.lines().enumerate() {
            if let Some(cap) = class_regex.captures(line) {
                if let Some(name) = cap.get(1) {
                    let node = Node::new(
                        format!("{}_{}", file_path, name.as_str()),
                        NodeKind::Class,
                        name.as_str(),
                        file_path,
                        i as u32 + 1,
                        i as u32 + 10,
                    );
                    graph.add_node(node);
                }
            }
        }
        
        // 提取函数
        let func_regex = Regex::new(r"^def\s+(\w+)").unwrap();
        for (i, line) in source.lines().enumerate() {
            if let Some(cap) = func_regex.captures(line) {
                if let Some(name) = cap.get(1) {
                    let node = Node::new(
                        format!("{}_{}_{}", file_path, name.as_str(), i),
                        NodeKind::Function,
                        name.as_str(),
                        file_path,
                        i as u32 + 1,
                        i as u32 + 5,
                    );
                    graph.add_node(node);
                }
            }
        }
    }

    /// 解析 JS/TS 代码
    fn parse_js(&self, source: &str, file_path: &str, graph: &mut CodeGraph) {
        use regex::Regex;
        
        // 提取类
        let class_regex = Regex::new(r"class\s+(\w+)").unwrap();
        for cap in class_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Class,
                    name.as_str(),
                    file_path,
                    1,
                    50,
                );
                graph.add_node(node);
            }
        }
        
        // 提取函数
        let func_regex = Regex::new(r"(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)").unwrap();
        for cap in func_regex.captures_iter(source) {
            let name = cap.get(1).or(cap.get(2)).and_then(|m| Some(m.as_str()));
            if let Some(name) = name {
                let node = Node::new(
                    format!("{}_{}", file_path, name),
                    NodeKind::Function,
                    name,
                    file_path,
                    1,
                    20,
                );
                graph.add_node(node);
            }
        }
    }

    /// 解析 Rust 代码
    fn parse_rust(&self, source: &str, file_path: &str, graph: &mut CodeGraph) {
        use regex::Regex;
        
        // 提取结构体
        let struct_regex = Regex::new(r"struct\s+(\w+)").unwrap();
        for cap in struct_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Class,
                    name.as_str(),
                    file_path,
                    1,
                    50,
                );
                graph.add_node(node);
            }
        }
        
        // 提取函数
        let func_regex = Regex::new(r"fn\s+(\w+)").unwrap();
        for cap in func_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Function,
                    name.as_str(),
                    file_path,
                    1,
                    20,
                );
                graph.add_node(node);
            }
        }
    }

    /// 解析 Go 代码
    fn parse_go(&self, source: &str, file_path: &str, graph: &mut CodeGraph) {
        use regex::Regex;
        
        // 提取结构体
        let struct_regex = Regex::new(r"type\s+(\w+)\s+struct").unwrap();
        for cap in struct_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Class,
                    name.as_str(),
                    file_path,
                    1,
                    50,
                );
                graph.add_node(node);
            }
        }
        
        // 提取函数
        let func_regex = Regex::new(r"func\s+(\w+)").unwrap();
        for cap in func_regex.captures_iter(source) {
            if let Some(name) = cap.get(1) {
                let node = Node::new(
                    format!("{}_{}", file_path, name.as_str()),
                    NodeKind::Function,
                    name.as_str(),
                    file_path,
                    1,
                    20,
                );
                graph.add_node(node);
            }
        }
    }
}

impl Default for Parser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parser_creation() {
        let parser = Parser::new();
        assert_eq!(parser.detect_language("test.java"), Some(Language::Java));
        assert_eq!(parser.detect_language("test.py"), Some(Language::Python));
        assert_eq!(parser.detect_language("test.js"), Some(Language::JavaScript));
        assert_eq!(parser.detect_language("test.xyz"), None);
    }

    #[test]
    fn test_parse_java_class() {
        let parser = Parser::new();
        let source = r#"
            public class UserService {
                public void getUser() {}
                private void saveUser() {}
            }
        "#;
        
        let graph = parser.parse(source, "UserService.java").unwrap();
        // 应该至少包含一个类节点
        assert!(graph.node_count() >= 1);
    }

    #[test]
    fn test_parse_python_functions() {
        let parser = Parser::new();
        let source = r#"
class UserService:
    def get_user(self):
        pass

def standalone_function():
    pass
        "#;
        
        let graph = parser.parse(source, "service.py").unwrap();
        // 至少应该解析到类和函数
        assert!(graph.node_count() >= 1);
    }

    #[test]
    fn test_parse_js_functions() {
        let parser = Parser::new();
        let source = r#"
            function getUser() {
                return null;
            }
            
            const saveUser = () => {
                console.log('save');
            };
        "#;
        
        let graph = parser.parse(source, "service.js").unwrap();
        assert!(graph.node_count() >= 2);
    }

    #[test]
    fn test_parse_unsupported_language() {
        let parser = Parser::new();
        let result = parser.parse("some code", "file.xyz");
        assert!(result.is_err());
    }
}