//! CodeGraph 模块
//!
//! 代码知识图谱的构建和管理

pub mod node;
pub mod edge;

pub use node::{Node, NodeKind};
pub use edge::{Edge, EdgeKind};

use std::collections::HashMap;

/// 代码图
#[derive(Debug, Clone)]
pub struct CodeGraph {
    /// 节点映射: ID -> Node
    nodes: HashMap<String, Node>,
    /// 边列表
    edges: Vec<Edge>,
    /// 文件到节点 ID 的映射
    file_nodes: HashMap<String, Vec<String>>,
}

impl CodeGraph {
    /// 创建新的代码图
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: Vec::new(),
            file_nodes: HashMap::new(),
        }
    }

    /// 添加节点
    pub fn add_node(&mut self, node: Node) {
        let id = node.id.clone();
        let file = node.file.clone();
        self.nodes.insert(id.clone(), node);
        self.file_nodes.entry(file).or_default().push(id);
    }

    /// 添加边
    pub fn add_edge(&mut self, edge: Edge) {
        self.edges.push(edge);
    }

    /// 获取节点
    pub fn get_node(&self, id: &str) -> Option<&Node> {
        self.nodes.get(id)
    }

    /// 获取所有节点
    pub fn all_nodes(&self) -> Vec<&Node> {
        self.nodes.values().collect()
    }

    /// 获取所有边
    pub fn all_edges(&self) -> Vec<&Edge> {
        self.edges.iter().collect()
    }

    /// 获取文件的节点
    pub fn get_file_nodes(&self, file: &str) -> Vec<&Node> {
        self.file_nodes
            .get(file)
            .map(|ids| ids.iter().filter_map(|id| self.nodes.get(id)).collect())
            .unwrap_or_default()
    }

    /// 获取节点的边
    pub fn get_node_edges(&self, node_id: &str) -> Vec<&Edge> {
        self.edges
            .iter()
            .filter(|e| e.from == node_id || e.to == node_id)
            .collect()
    }

    /// 获取节点的调用边
    pub fn get_calls(&self, node_id: &str) -> Vec<&Node> {
        self.edges
            .iter()
            .filter(|e| e.from == node_id && e.kind == EdgeKind::Call)
            .filter_map(|e| self.nodes.get(&e.to))
            .collect()
    }

    /// 节点数量
    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    /// 边数量
    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }
}

impl Default for CodeGraph {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_graph_creation() {
        let graph = CodeGraph::new();
        assert_eq!(graph.node_count(), 0);
        assert_eq!(graph.edge_count(), 0);
    }

    #[test]
    fn test_add_node() {
        let mut graph = CodeGraph::new();
        let node = Node::new("1", NodeKind::Class, "UserService", "UserService.java", 1, 50);
        graph.add_node(node);
        
        assert_eq!(graph.node_count(), 1);
        assert_eq!(graph.get_node("1").unwrap().name, "UserService");
    }

    #[test]
    fn test_add_edge() {
        let mut graph = CodeGraph::new();
        graph.add_node(Node::new("1", NodeKind::Class, "A", "a.java", 1, 10));
        graph.add_node(Node::new("2", NodeKind::Class, "B", "b.java", 1, 10));
        graph.add_edge(Edge::new("e1", "1", "2", EdgeKind::Reference));
        
        assert_eq!(graph.edge_count(), 1);
    }

    #[test]
    fn test_get_file_nodes() {
        let mut graph = CodeGraph::new();
        graph.add_node(Node::new("1", NodeKind::Class, "UserService", "UserService.java", 1, 50));
        graph.add_node(Node::new("2", NodeKind::Method, "getUser", "UserService.java", 10, 20));
        
        let nodes = graph.get_file_nodes("UserService.java");
        assert_eq!(nodes.len(), 2);
    }

    #[test]
    fn test_get_calls() {
        let mut graph = CodeGraph::new();
        graph.add_node(Node::new("1", NodeKind::Method, "foo", "a.java", 1, 10));
        graph.add_node(Node::new("2", NodeKind::Method, "bar", "a.java", 11, 20));
        graph.add_edge(Edge::new("e1", "1", "2", EdgeKind::Call));
        
        let calls = graph.get_calls("1");
        assert_eq!(calls.len(), 1);
        assert_eq!(calls[0].name, "bar");
    }
}