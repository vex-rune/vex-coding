//! 符号表索引模块

use rusqlite::{Connection, Result as SqlResult};
use std::path::Path;

/// 符号信息
#[derive(Debug, Clone)]
pub struct Symbol {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub file: String,
    pub line: u32,
}

/// 搜索结果
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub symbol: Symbol,
    pub score: f32,
}

/// 符号索引
pub struct SymbolIndex {
    conn: Connection,
}

impl SymbolIndex {
    /// 创建内存索引
    pub fn memory() -> SqlResult<Self> {
        let conn = Connection::open_in_memory()?;
        Self::init_schema(&conn)?;
        Ok(Self { conn })
    }

    /// 从文件打开索引
    pub fn from_file(path: &Path) -> SqlResult<Self> {
        let conn = Connection::open(path)?;
        Self::init_schema(&conn)?;
        Ok(Self { conn })
    }

    /// 初始化数据库模式
    fn init_schema(conn: &Connection) -> SqlResult<()> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS symbols (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                kind TEXT NOT NULL,
                file TEXT NOT NULL,
                line INTEGER NOT NULL
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name)",
            [],
        )?;
        
        Ok(())
    }

    /// 插入符号
    pub fn insert(&self, symbol: &Symbol) -> SqlResult<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO symbols (id, name, kind, file, line) VALUES (?1, ?2, ?3, ?4, ?5)",
            (&symbol.id, &symbol.name, &symbol.kind, &symbol.file, symbol.line),
        )?;
        Ok(())
    }

    /// 搜索符号
    pub fn search(&self, query: &str) -> SqlResult<Vec<SearchResult>> {
        let pattern = format!("%{}%", query.to_lowercase());
        
        let mut stmt = self.conn.prepare(
            "SELECT id, name, kind, file, line FROM symbols 
             WHERE LOWER(name) LIKE ?1
             ORDER BY LENGTH(name), name
             LIMIT 50"
        )?;
        
        let symbols = stmt.query_map([pattern], |row| {
            Ok(Symbol {
                id: row.get(0)?,
                name: row.get(1)?,
                kind: row.get(2)?,
                file: row.get(3)?,
                line: row.get(4)?,
            })
        })?;
        
        let mut results = Vec::new();
        for symbol in symbols {
            if let Ok(symbol) = symbol {
                results.push(SearchResult {
                    symbol,
                    score: 1.0,
                });
            }
        }
        
        Ok(results)
    }

    /// 按文件搜索
    pub fn search_in_file(&self, file: &str) -> SqlResult<Vec<Symbol>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, kind, file, line FROM symbols WHERE file = ?1"
        )?;
        
        let symbols = stmt.query_map([file], |row| {
            Ok(Symbol {
                id: row.get(0)?,
                name: row.get(1)?,
                kind: row.get(2)?,
                file: row.get(3)?,
                line: row.get(4)?,
            })
        })?;
        
        symbols.collect()
    }

    /// 清空索引
    pub fn clear(&self) -> SqlResult<()> {
        self.conn.execute("DELETE FROM symbols", [])?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_and_search() {
        let index = SymbolIndex::memory().unwrap();
        
        let symbol = Symbol {
            id: "1".to_string(),
            name: "calculateTotal".to_string(),
            kind: "function".to_string(),
            file: "Calculator.java".to_string(),
            line: 10,
        };
        
        index.insert(&symbol).unwrap();
        
        let results = index.search("calc").unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].symbol.name, "calculateTotal");
    }

    #[test]
    fn test_search_in_file() {
        let index = SymbolIndex::memory().unwrap();
        
        index.insert(&Symbol {
            id: "1".to_string(),
            name: "foo".to_string(),
            kind: "function".to_string(),
            file: "A.java".to_string(),
            line: 1,
        }).unwrap();
        
        index.insert(&Symbol {
            id: "2".to_string(),
            name: "bar".to_string(),
            kind: "function".to_string(),
            file: "B.java".to_string(),
            line: 5,
        }).unwrap();
        
        let results = index.search_in_file("A.java").unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "foo");
    }

    #[test]
    fn test_clear() {
        let index = SymbolIndex::memory().unwrap();
        
        index.insert(&Symbol {
            id: "1".to_string(),
            name: "test".to_string(),
            kind: "function".to_string(),
            file: "Test.java".to_string(),
            line: 1,
        }).unwrap();
        
        index.clear().unwrap();
        
        let results = index.search("test").unwrap();
        assert_eq!(results.len(), 0);
    }
}