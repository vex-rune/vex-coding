//! 存储管理模块

use crate::graph::{CodeGraph, Node, Edge};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{self, BufReader, BufWriter, Write};
use std::path::PathBuf;

/// 存储错误
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("IO 错误: {source}")]
    IoError {
        #[from]
        source: io::Error,
    },
    
    #[error("序列化错误: {0}")]
    SerializeError(String),
    
    #[error("目录不存在: {0}")]
    DirectoryNotFound(String),
}

/// 索引配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexConfig {
    pub version: String,
    pub language_version: String,
    pub indexed_at: String,
}

impl Default for IndexConfig {
    fn default() -> Self {
        Self {
            version: "1.0".to_string(),
            language_version: env!("CARGO_PKG_VERSION").to_string(),
            indexed_at: chrono_lite_now(),
        }
    }
}

/// 简单的日期时间字符串
fn chrono_lite_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap();
    format!("{}", duration.as_secs())
}

/// 存储管理器
pub struct Storage {
    root: PathBuf,
}

impl Storage {
    /// 创建新的存储管理器
    pub fn new(root: PathBuf) -> Result<Self, StorageError> {
        let storage = Self { root };
        storage.ensure_dirs()?;
        Ok(storage)
    }

    /// 获取项目根目录
    pub fn project_root(&self) -> &PathBuf {
        &self.root
    }

    /// 确保目录存在
    pub fn ensure_dirs(&self) -> Result<(), StorageError> {
        let dirs = [
            "graph",
            "symbols",
            "vectors",
            "cache",
            "rules",
        ];
        
        for dir in dirs {
            let path = self.root.join(".vexcoding").join(dir);
            if !path.exists() {
                fs::create_dir_all(&path)?;
            }
        }
        
        Ok(())
    }

    /// 保存代码图
    pub fn save_graph(&self, graph: &CodeGraph) -> Result<(), StorageError> {
        let nodes_path = self.root.join(".vexcoding/graph/nodes.json");
        let edges_path = self.root.join(".vexcoding/graph/edges.json");
        
        let nodes: Vec<&Node> = graph.all_nodes();
        let edges: Vec<&Edge> = graph.all_edges();
        
        let nodes_json = serde_json::to_string_pretty(&nodes)
            .map_err(|e| StorageError::SerializeError(e.to_string()))?;
        let edges_json = serde_json::to_string_pretty(&edges)
            .map_err(|e| StorageError::SerializeError(e.to_string()))?;
        
        fs::write(&nodes_path, nodes_json)?;
        fs::write(&edges_path, edges_json)?;
        
        Ok(())
    }

    /// 加载代码图
    pub fn load_graph(&self) -> Result<CodeGraph, StorageError> {
        let nodes_path = self.root.join(".vexcoding/graph/nodes.json");
        let edges_path = self.root.join(".vexcoding/graph/edges.json");
        
        let mut graph = CodeGraph::new();
        
        if nodes_path.exists() {
            let nodes_content = fs::read_to_string(&nodes_path)?;
            let nodes: Vec<Node> = serde_json::from_str(&nodes_content)
                .map_err(|e| StorageError::SerializeError(e.to_string()))?;
            
            for node in nodes {
                graph.add_node(node);
            }
        }
        
        if edges_path.exists() {
            let edges_content = fs::read_to_string(&edges_path)?;
            let edges: Vec<Edge> = serde_json::from_str(&edges_content)
                .map_err(|e| StorageError::SerializeError(e.to_string()))?;
            
            for edge in edges {
                graph.add_edge(edge);
            }
        }
        
        Ok(graph)
    }

    /// 保存配置
    pub fn save_config(&self, config: &IndexConfig) -> Result<(), StorageError> {
        let config_path = self.root.join(".vexcoding/config.json");
        let config_json = serde_json::to_string_pretty(config)
            .map_err(|e| StorageError::SerializeError(e.to_string()))?;
        fs::write(&config_path, config_json)?;
        Ok(())
    }

    /// 加载配置
    pub fn load_config(&self) -> Result<IndexConfig, StorageError> {
        let config_path = self.root.join(".vexcoding/config.json");
        if !config_path.exists() {
            return Ok(IndexConfig::default());
        }
        
        let content = fs::read_to_string(&config_path)?;
        let config: IndexConfig = serde_json::from_str(&content)
            .map_err(|e| StorageError::SerializeError(e.to_string()))?;
        Ok(config)
    }

    /// 检查是否需要重新索引
    pub fn needs_reindex(&self, source_mtime: std::time::SystemTime) -> bool {
        let config_path = self.root.join(".vexcoding/config.json");
        if !config_path.exists() {
            return true;
        }
        
        if let Ok(metadata) = fs::metadata(&config_path) {
            if let Ok(modified) = metadata.modified() {
                return modified < source_mtime;
            }
        }
        
        true
    }

    /// 获取 .vexcoding 目录路径
    pub fn vexcoding_dir(&self) -> PathBuf {
        self.root.join(".vexcoding")
    }

    /// 获取忽略规则路径
    pub fn ignore_file_path(&self) -> PathBuf {
        self.root.join(".vexcodingignore")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_storage_creation() {
        let temp_dir = TempDir::new().unwrap();
        let storage = Storage::new(temp_dir.path().to_path_buf()).unwrap();
        assert_eq!(storage.project_root(), temp_dir.path());
    }

    #[test]
    fn test_save_load_graph() {
        let temp_dir = TempDir::new().unwrap();
        let storage = Storage::new(temp_dir.path().to_path_buf()).unwrap();
        
        let mut graph = CodeGraph::new();
        graph.add_node(Node::new("1", crate::graph::NodeKind::Class, "Test", "Test.java", 1, 10));
        
        storage.save_graph(&graph).unwrap();
        let loaded = storage.load_graph().unwrap();
        
        assert_eq!(loaded.node_count(), 1);
    }

    #[test]
    fn test_save_load_config() {
        let temp_dir = TempDir::new().unwrap();
        let storage = Storage::new(temp_dir.path().to_path_buf()).unwrap();
        
        let config = IndexConfig {
            version: "1.0".to_string(),
            language_version: "1.0.0".to_string(),
            indexed_at: "1234567890".to_string(),
        };
        
        storage.save_config(&config).unwrap();
        let loaded = storage.load_config().unwrap();
        
        assert_eq!(loaded.version, "1.0");
    }
}