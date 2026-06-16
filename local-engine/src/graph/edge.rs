//! 代码图边定义

use serde::{Deserialize, Serialize};

/// 边类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EdgeKind {
    /// 调用关系
    Call,
    /// 引用关系
    Reference,
    /// 继承关系
    Inherit,
    /// 包含关系
    Contain,
    /// 实现关系
    Implement,
    /// 使用关系
    Use,
}

impl EdgeKind {
    /// 从字符串转换为 EdgeKind
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "call" => Some(EdgeKind::Call),
            "reference" | "ref" => Some(EdgeKind::Reference),
            "inherit" | "extends" => Some(EdgeKind::Inherit),
            "contain" | "contains" => Some(EdgeKind::Contain),
            "implement" | "implements" => Some(EdgeKind::Implement),
            "use" | "uses" => Some(EdgeKind::Use),
            _ => None,
        }
    }
}

/// 代码图边
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    /// 边唯一 ID
    pub id: String,
    /// 起始节点 ID
    pub from: String,
    /// 目标节点 ID
    pub to: String,
    /// 边类型
    pub kind: EdgeKind,
}

impl Edge {
    /// 创建新边
    pub fn new(
        id: impl Into<String>,
        from: impl Into<String>,
        to: impl Into<String>,
        kind: EdgeKind,
    ) -> Self {
        Self {
            id: id.into(),
            from: from.into(),
            to: to.into(),
            kind,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_edge_creation() {
        let edge = Edge::new("e1", "node1", "node2", EdgeKind::Call);
        assert_eq!(edge.id, "e1");
        assert_eq!(edge.from, "node1");
        assert_eq!(edge.to, "node2");
        assert_eq!(edge.kind, EdgeKind::Call);
    }

    #[test]
    fn test_edge_kind_from_str() {
        assert_eq!(EdgeKind::from_str("call"), Some(EdgeKind::Call));
        assert_eq!(EdgeKind::from_str("reference"), Some(EdgeKind::Reference));
        assert_eq!(EdgeKind::from_str("EXTENDS"), Some(EdgeKind::Inherit));
        assert_eq!(EdgeKind::from_str("unknown"), None);
    }
}