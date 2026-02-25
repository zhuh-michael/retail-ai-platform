-- 创建枚举类型
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED');
CREATE TYPE plan_type AS ENUM ('BASIC', 'STANDARD', 'ENTERPRISE');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE plan_status AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'SUBMITTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE item_status AS ENUM ('PENDING', 'ADJUSTED', 'CONFIRMED');
CREATE TYPE member_level AS ENUM ('NORMAL', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE style_preference AS ENUM ('CASUAL', 'BUSINESS', 'ELEGANT', 'SPORTY', 'TRENDY');

-- 租户表
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status tenant_status NOT NULL DEFAULT 'ACTIVE',
    contact_info JSONB NOT NULL,
    subscription JSONB NOT NULL,
    branding JSONB,
    quota JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_expires_at ON tenants(expires_at);

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(100) NOT NULL,
    display_name VARCHAR(50),
    avatar_url VARCHAR(500),
    status user_status NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    roles JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, username),
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, phone)
);

CREATE INDEX idx_users_tenant_username ON users(tenant_id, username);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_phone ON users(tenant_id, phone);

-- 补货计划表
CREATE TABLE replenishment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    status plan_status NOT NULL DEFAULT 'DRAFT',
    generated_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    confirmed_by UUID,
    forecast_model VARCHAR(50) NOT NULL,
    external_factors JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replenishment_plans_store_status ON replenishment_plans(store_id, status);
CREATE INDEX idx_replenishment_plans_tenant ON replenishment_plans(tenant_id);

-- 补货明细表
CREATE TABLE replenishment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES replenishment_plans(id) ON DELETE CASCADE,
    sku_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    current_stock INTEGER NOT NULL,
    suggested_quantity INTEGER NOT NULL,
    adjusted_quantity INTEGER,
    forecast_data JSONB NOT NULL,
    reasoning TEXT NOT NULL,
    adjustment_reason TEXT,
    status item_status NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX idx_replenishment_items_plan ON replenishment_items(plan_id);
CREATE INDEX idx_replenishment_items_sku ON replenishment_items(sku_id);

-- 会员表
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_code VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    level member_level NOT NULL DEFAULT 'NORMAL',
    points INTEGER NOT NULL DEFAULT 0,
    birthday DATE,
    style_preferences JSONB,
    total_purchases DECIMAL(10,2) NOT NULL DEFAULT 0,
    visit_count INTEGER NOT NULL DEFAULT 0,
    last_visit_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, member_code)
);

CREATE INDEX idx_members_tenant_phone ON members(tenant_id, phone);
CREATE INDEX idx_members_tenant_code ON members(tenant_id, member_code);
CREATE INDEX idx_members_birthday ON members(birthday);

-- 更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_replenishment_plans_updated_at BEFORE UPDATE ON replenishment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
