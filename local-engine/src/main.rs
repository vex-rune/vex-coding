//! Vex-Coding 本地引擎入口
//!
//! 负责代码解析、图构建、索引存储

mod graph;
mod indexer;
mod search;
mod storage;
mod cache;

use std::path::PathBuf;

/// 引擎错误类型
#[derive(Debug, thiserror::Error)]
pub enum EngineError {
    #[error("解析失败: {0}")]
    ParseError(String),
    
    #[error("存储失败: {source}")]
    StorageError {
        #[from]
        source: std::io::Error,
    },
    
    #[error("数据库错误: {0}")]
    DatabaseError(String),
    
    #[error("不支持的语言: {0}")]
    UnsupportedLanguage(String),
}

/// 引擎主结构
pub struct Engine {
    storage: storage::Storage,
}

impl Engine {
    /// 创建新的引擎实例
    pub fn new(project_root: PathBuf) -> Result<Self, EngineError> {
        let storage = storage::Storage::new(project_root)?;
        Ok(Self { storage })
    }
}

fn main() {
    tracing_subscriber::fmt::init();
    
    println!("Vex-Coding Local Engine v{}", env!("CARGO_PKG_VERSION"));
}