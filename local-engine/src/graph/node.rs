//! 代码图节点定义

use serde::{Deserialize, Serialize};

/// 节点类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NodeKind {
    Class,
    Function,
    Method,
    Variable,
    Interface,
    Enum,
    Module,
    Import,
}

impl NodeKind {
    /// 从 tree-sitter 节点类型转换为 NodeKind
    pub fn from_ts_kind(kind: &str) -> Option<Self> {
        match kind {
            "class_declaration" | "class" => Some(NodeKind::Class),
            "function_definition" | "function_declaration" | "function" => Some(NodeKind::Function),
            "method_definition" | "method_declaration" => Some(NodeKind::Method),
            "variable_declaration" | "variable" => Some(NodeKind::Variable),
            "interface_declaration" | "interface" => Some(NodeKind::Interface),
            "enum_declaration" | "enum" => Some(NodeKind::Enum),
            "module" | "namespace" => Some(NodeKind::Module),
            "import_statement" | "import" => Some(NodeKind::Import),
            _ => None,
        }
    }
}

/// 代码图节点
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    /// 节点唯一 ID
    pub id: String,
    /// 节点类型
    pub kind: NodeKind,
    /// 符号名称
    pub name: String,
    /// 所属文件
    pub file: String,
    /// 开始行号
    pub start_line: u32,
    /// 结束行号
    pub end_line: u32,
    /// 父节点 ID
    pub parent_id: Option<String>,
}

impl Node {
    /// 创建新节点
    pub fn new(
        id: impl Into<String>,
        kind: NodeKind,
        name: impl Into<String>,
        file: impl Into<String>,
        start_line: u32,
        end_line: u32,
    ) -> Self {
        Self {
            id: id.into(),
            kind,
            name: name.into(),
            file: file.into(),
            start_line,
            end_line,
            parent_id: None,
        }
    }

    /// 设置父节点
    pub fn with_parent(mut self, parent_id: impl Into<String>) -> Self {
        self.parent_id = Some(parent_id.into());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_node_creation() {
        let node = Node::new("1", NodeKind::Class, "UserService", "UserService.java", 1, 50);
        assert_eq!(node.id, "1");
        assert_eq!(node.kind, NodeKind::Class);
        assert_eq!(node.name, "UserService");
        assert_eq!(node.start_line, 1);
        assert_eq!(node.end_line, 50);
    }

    #[test]
    fn test_node_kind_from_ts() {
        assert_eq!(NodeKind::from_ts_kind("class_declaration"), Some(NodeKind::Class));
        assert_eq!(NodeKind::from_ts_kind("function_definition"), Some(NodeKind::Function));
        assert_eq!(NodeKind::from_ts_kind("method_definition"), Some(NodeKind::Method));
        assert_eq!(NodeKind::from_ts_kind("unknown"), None);
    }

    #[test]
    fn test_node_with_parent() {
        let node = Node::new("2", NodeKind::Method, "getUser", "UserService.java", 10, 20)
            .with_parent("1");
        assert_eq!(node.parent_id, Some("1".to_string()));
    }
}