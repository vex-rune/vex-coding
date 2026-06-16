//! 缓存管理模块

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// 聊天消息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// 聊天历史
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatHistory {
    pub messages: Vec<ChatMessage>,
    pub context_files: Vec<String>,
}

impl ChatHistory {
    /// 创建新的聊天历史
    pub fn new() -> Self {
        Self {
            messages: Vec::new(),
            context_files: Vec::new(),
        }
    }

    /// 添加用户消息
    pub fn add_user_message(&mut self, content: impl Into<String>) {
        self.messages.push(ChatMessage {
            role: "user".to_string(),
            content: content.into(),
        });
    }

    /// 添加助手消息
    pub fn add_assistant_message(&mut self, content: impl Into<String>) {
        self.messages.push(ChatMessage {
            role: "assistant".to_string(),
            content: content.into(),
        });
    }

    /// 获取消息数量
    pub fn len(&self) -> usize {
        self.messages.len()
    }

    /// 检查是否为空
    pub fn is_empty(&self) -> bool {
        self.messages.is_empty()
    }

    /// 清空历史
    pub fn clear(&mut self) {
        self.messages.clear();
        self.context_files.clear();
    }
}

impl Default for ChatHistory {
    fn default() -> Self {
        Self::new()
    }
}

/// 对话缓存管理器
pub struct ChatCache {
    histories: HashMap<String, ChatHistory>,
    max_histories: usize,
}

impl ChatCache {
    /// 创建新的缓存管理器
    pub fn new() -> Self {
        Self {
            histories: HashMap::new(),
            max_histories: 100,
        }
    }

    /// 获取或创建聊天历史
    pub fn get_or_create(&mut self, session_id: &str) -> &mut ChatHistory {
        self.histories
            .entry(session_id.to_string())
            .or_insert_with(ChatHistory::new)
    }

    /// 删除聊天历史
    pub fn remove(&mut self, session_id: &str) {
        self.histories.remove(session_id);
    }

    /// 清空所有历史
    pub fn clear_all(&mut self) {
        self.histories.clear();
    }

    /// 获取缓存数量
    pub fn len(&self) -> usize {
        self.histories.len()
    }

    /// 设置最大缓存数
    pub fn set_max_histories(&mut self, max: usize) {
        self.max_histories = max;
        self.evict_if_needed();
    }

    /// 清理超出的缓存
    fn evict_if_needed(&mut self) {
        while self.histories.len() > self.max_histories {
            if let Some(key) = self.histories.keys().next().cloned() {
                self.histories.remove(&key);
            }
        }
    }
}

impl Default for ChatCache {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_history() {
        let mut history = ChatHistory::new();
        history.add_user_message("Hello");
        history.add_assistant_message("Hi there!");
        
        assert_eq!(history.len(), 2);
        assert_eq!(history.messages[0].role, "user");
        assert_eq!(history.messages[1].role, "assistant");
    }

    #[test]
    fn test_chat_cache() {
        let mut cache = ChatCache::new();
        
        let history = cache.get_or_create("session1");
        history.add_user_message("Test");
        
        let history = cache.get_or_create("session1");
        assert_eq!(history.len(), 1);
        
        assert_eq!(cache.len(), 1);
        
        cache.remove("session1");
        assert_eq!(cache.len(), 0);
    }

    #[test]
    fn test_max_histories() {
        let mut cache = ChatCache::new();
        
        cache.get_or_create("s1");
        cache.get_or_create("s2");
        cache.get_or_create("s3");
        
        // 设置最大数为 2，触发清理
        cache.set_max_histories(2);
        
        // set_max_histories 会立即调用 evict_if_needed
        assert!(cache.len() <= 2);
    }
}