# 任务 2：Middleware 层测试补充技术方案

> 文档版本：v1.0  
> 作者：系统架构师  
> 日期：2026-04-10  
> 任务：补充 middleware 层测试

---

## 一、现状分析

### 1.1 现有 Middleware 清单

| 文件 | 功能 | 测试覆盖率 |
|------|------|-----------|
| `server/middleware/auth.js` | 用户认证 | 0% |
| `server/middleware/permission.js` | 权限验证 | 0% |
| `server/middleware/audit.js` | 审计日志 | 0% |
| `server/middleware/rateLimit.js` | 速率限制 | 0% |
| `server/middleware/cors.js` | CORS 配置 | 0% |

### 1.2 测试缺口

- 所有中间件缺少单元测试
- 缺少异常场景测试
- 缺少集成测试验证中间件链

---

## 二、测试架构设计

### 2.1 测试分层架构

```
┌─────────────────────────────────────────────────────┐
│                  测试金字塔                          │
│                                                      │
│                     /\                              │
│                    /  \                             │
│                   / E2E \      (5%)                 │
│                  /________\                         │
│                 /          \                        │
│                / Integration\  (20%)                │
│               /______________\                      │
│              /                \                     │
│             /   Unit Tests     \ (75%)              │
│            /____________________\                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2.2 测试框架选型

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 测试运行器 | Jest | 主流，支持 mock |
| 断言库 | Jest 内置 | 简洁 |
| HTTP 测试 | supertest | Express 专用 |
| Mock DB | sqlite3-mock | 内存数据库 |
| 覆盖率 | Jest coverage | 自动生成 |

---

## 三、测试用例设计

### 3.1 认证中间件测试

```javascript
// tests/middleware/auth.test.js

const authMiddleware = require('../../server/middleware/auth');
const request = require('supertest');
const express = require('express');

describe('Auth Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(authMiddleware);
    app.get('/protected', (req, res) => {
      res.json({ user: req.user });
    });
  });
  
  describe('GET /protected', () => {
    test('should return 200 with valid session', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Cookie', ['connect.sid=valid_session']);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
    });
    
    test('should return 401 without session', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
    
    test('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(res.status).toBe(401);
    });
  });
});
```

### 3.2 权限中间件测试

```javascript
// tests/middleware/permission.test.js

const { requirePermission } = require('../../server/middleware/permission');

describe('Permission Middleware', () => {
  let mockReq, mockRes, nextFn;
  
  beforeEach(() => {
    mockReq = {
      user: { id: 'user1', role: 'viewer' },
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFn = jest.fn();
  });
  
  describe('requirePermission("agents", "delete")', () => {
    test('should call next() for admin user', () => {
      mockReq.user.role = 'admin';
      const middleware = requirePermission('agents', 'delete');
      middleware(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalled();
    });
    
    test('should return 403 for viewer user', () => {
      mockReq.user.role = 'viewer';
      const middleware = requirePermission('agents', 'delete');
      middleware(mockReq, mockRes, nextFn);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
    
    test('should return 403 for operator on delete action', () => {
      mockReq.user.role = 'operator';
      const middleware = requirePermission('agents', 'delete');
      middleware(mockReq, mockRes, nextFn);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
```

### 3.3 速率限制中间件测试

```javascript
// tests/middleware/rateLimit.test.js

const rateLimit = require('../../server/middleware/rateLimit');

describe('Rate Limit Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(rateLimit({ windowMs: 60000, max: 10 }));
    app.get('/api/test', (req, res) => res.json({ ok: true }));
  });
  
  test('should allow requests under limit', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/api/test');
      expect(res.status).toBe(200);
    }
  });
  
  test('should return 429 after limit exceeded', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/test');
    }
    
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(429);
    expect(res.headers['x-ratelimit-reset']).toBeDefined();
  });
});
```

### 3.4 审计中间件测试

```javascript
// tests/middleware/audit.test.js

const auditMiddleware = require('../../server/middleware/audit');
const db = require('../../server/database');

describe('Audit Middleware', () => {
  test('should log successful action', async () => {
    const mockReq = {
      user: { id: 'user1', username: 'test' },
      body: { name: 'test' },
      ip: '127.0.0.1',
      method: 'POST',
      url: '/api/users'
    };
    
    const mockRes = {
      statusCode: 200,
      getHeader: () => 'application/json'
    };
    
    const next = jest.fn();
    
    await auditMiddleware(mockReq, mockRes, next);
    
    // 验证审计日志已写入
    const log = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 1').get();
    expect(log.action).toBe('user.create');
    expect(log.user_id).toBe('user1');
    expect(log.status).toBe('success');
  });
});
```

---

## 四、测试配置

### 4.1 Jest 配置

```javascript
// jest.config.js

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'server/middleware/**/*.js',
    '!server/middleware/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};
```

### 4.2 测试数据工厂

```javascript
// tests/factories.js

const factory = {
  user(role = 'viewer') {
    return {
      id: `user_${Date.now()}`,
      username: `test_${Date.now()}`,
      role,
      permissions: role === 'admin' ? ['*:*'] : []
    };
  },
  
  session(user) {
    return {
      userId: user.id,
      expires: Date.now() + 86400000
    };
  },
  
  permission(resource, action) {
    return {
      id: `perm_${resource}_${action}`,
      resource,
      action
    };
  }
};

module.exports = factory;
```

---

## 五、CI/CD 集成

### 5.1 GitHub Actions 配置

```yaml
# .github/workflows/test.yml

name: Middleware Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:middleware -- --coverage
      - uses: codecov/codecov-action@v3
```

---

## 六、验收标准

- [ ] 所有中间件单元测试覆盖率 > 90%
- [ ] 认证中间件 100% 覆盖正常/异常流程
- [ ] 权限中间件覆盖所有角色组合
- [ ] 速率限制中间件验证限流效果
- [ ] 审计中间件验证日志完整性
- [ ] CI 流水线自动运行测试

---

*文档版本：v1.0 | 状态：待评审*
