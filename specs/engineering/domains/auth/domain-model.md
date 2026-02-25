# Auth 领域 - 领域规格

**Domain**: auth  
**创建日期**: 2026-02-25  
**状态**: self-checked

---

## 领域职责

负责用户认证、授权、会话管理，确保平台安全访问。支持多租户环境下的用户隔离和权限控制。

---

## 领域模型

### 聚合根

#### User（用户）

```
User
├── id: UserId (UUID)
├── tenantId: TenantId (外键)
├── username: string (登录名)
├── email: string
├── phone: string
├── passwordHash: PasswordHash (值对象)
├── profile: UserProfile (值对象)
├── status: UserStatus (枚举)
├── roles: RoleId[]
├── lastLoginAt: DateTime (可选)
├── createdAt: DateTime
└── updatedAt: DateTime
```

**不变量**:
1. 用户名在租户内唯一
2. 邮箱/手机号在租户内唯一
3. 密码必须符合强度策略
4. 停用租户的用户无法登录

### 值对象

#### UserId
```
UserId
└── value: UUID
```

#### PasswordHash
```
PasswordHash
├── hash: string (bcrypt)
├── salt: string
├── algorithm: string
└── createdAt: DateTime
```

#### UserProfile
```
UserProfile
├── displayName: string
├── avatarUrl: string (可选)
├── department: string (可选)
└── position: string (可选)
```

#### Session
```
Session
├── id: SessionId (UUID)
├── userId: UserId
├── tenantId: TenantId
├── deviceInfo: DeviceInfo
├── ipAddress: string
├── expiresAt: DateTime
└── createdAt: DateTime
```

### 领域服务

#### AuthenticationService
- `login(credentials: LoginCredentials): AuthResult`
- `logout(sessionId: SessionId): void`
- `refreshToken(refreshToken: string): AuthResult`
- `validateToken(token: string): TokenPayload`

#### PasswordService
- `hashPassword(password: string): PasswordHash`
- `verifyPassword(password: string, hash: PasswordHash): boolean`
- `resetPassword(userId: UserId, newPassword: string): void`

#### SessionService
- `createSession(userId: UserId, deviceInfo: DeviceInfo): Session`
- `invalidateSession(sessionId: SessionId): void`
- `invalidateAllSessions(userId: UserId): void`
- `getActiveSessions(userId: UserId): Session[]`

---

## API 契约

### POST /api/v1/auth/login

**描述**: 用户登录

**请求**:
```json
{
  "tenantCode": "string (必需)",
  "username": "string (必需)",
  "password": "string (必需)",
  "mfaCode": "string (可选，如启用 MFA)"
}
```

**响应 (200)**:
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": 7200,
  "user": {
    "id": "uuid",
    "username": "string",
    "displayName": "string",
    "avatarUrl": "string",
    "roles": ["store_manager"]
  },
  "tenant": {
    "id": "uuid",
    "name": "string",
    "branding": {...}
  }
}
```

**错误响应**:
| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | BadRequest | 参数验证失败 |
| 401 | Unauthorized | 用户名或密码错误 |
| 403 | Forbidden | 账户已停用 |
| 409 | Conflict | 租户不存在 |

---

### POST /api/v1/auth/register

**描述**: 用户注册（管理员邀请或自助注册）

**请求**:
```json
{
  "tenantCode": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "inviteCode": "string (可选)"
}
```

**响应 (201)**:
```json
{
  "id": "uuid",
  "username": "string",
  "status": "ACTIVE",
  "requiresVerification": true
}
```

---

### POST /api/v1/auth/refresh

**描述**: 刷新 Access Token

**请求**:
```json
{
  "refreshToken": "string"
}
```

**响应 (200)**:
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 7200
}
```

---

### DELETE /api/v1/auth/sessions/{sessionId}

**描述**: 撤销指定会话

**响应 (204)**: 无内容

---

## 数据模型

### 表：users

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 用户 ID |
| tenant_id | UUID | NOT NULL, FK | 租户 ID |
| username | VARCHAR(50) | NOT NULL | 登录名 |
| email | VARCHAR(100) | NULL | 邮箱 |
| phone | VARCHAR(20) | NULL | 手机号 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| password_salt | VARCHAR(100) | NOT NULL | 盐 |
| display_name | VARCHAR(50) | NULL | 显示名 |
| avatar_url | VARCHAR(500) | NULL | 头像 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'ACTIVE' | 状态 |
| last_login_at | TIMESTAMP | NULL | 最后登录时间 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_users_tenant_username` ON users(tenant_id, username) UNIQUE
- `idx_users_email` ON users(tenant_id, email) UNIQUE
- `idx_users_phone` ON users(tenant_id, phone) UNIQUE

### 表：user_sessions

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 会话 ID |
| user_id | UUID | NOT NULL, FK | 用户 ID |
| tenant_id | UUID | NOT NULL, FK | 租户 ID |
| device_info | JSONB | NOT NULL | 设备信息 |
| ip_address | VARCHAR(45) | NOT NULL | IP 地址 |
| user_agent | TEXT | NOT NULL | User-Agent |
| expires_at | TIMESTAMP | NOT NULL | 过期时间 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

**索引**:
- `idx_sessions_user` ON user_sessions(user_id)
- `idx_sessions_expires` ON user_sessions(expires_at)

---

## 单元测试规格

### User 实体测试

- [ ] 创建有效用户
- [ ] 拒绝重复用户名（同租户）
- [ ] 密码强度验证
- [ ] 停用用户无法登录
- [ ] 租户停用后用户无法登录

### AuthenticationService 测试

- [ ] 正确凭据登录成功
- [ ] 错误密码返回 401
- [ ] 停用账户返回 403
- [ ] JWT Token 生成正确
- [ ] Token 过期验证

### PasswordService 测试

- [ ] 密码哈希正确
- [ ] 密码验证正确
- [ ] 弱密码拒绝

---

## 事件

### 领域事件

| 事件名称 | 触发时机 | 负载 |
|---------|---------|------|
| UserRegistered | 用户注册成功 | {userId, tenantId, username} |
| UserLoggedIn | 用户登录成功 | {userId, sessionId, deviceId} |
| UserLoggedOut | 用户登出 | {userId, sessionId} |
| PasswordChanged | 密码修改 | {userId, changedAt} |
| SessionExpired | 会话过期 | {userId, sessionId} |

---

## 安全设计

### 密码策略
- 最小长度：8 字符
- 必须包含：大小写字母 + 数字
- 历史记录：不能使用最近 5 次密码
- 过期策略：90 天强制更换（可选）

### Token 策略
- Access Token: 2 小时有效期
- Refresh Token: 7 天有效期
- 支持主动撤销

### 防护机制
- 登录失败 5 次锁定 30 分钟
- 支持 MFA（可选）
- 会话并发限制（最多 5 个设备）

---

## 依赖关系

| 依赖 Domain | 关系类型 | 说明 |
|------------|---------|------|
| tenant | 消费者 | 用户属于某个租户 |
| organization | 提供者 | 用户关联组织架构节点 |

---

*文档状态：AI 自检通过*
