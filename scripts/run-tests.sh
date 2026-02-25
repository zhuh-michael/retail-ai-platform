#!/bin/bash

# RetailAI Copilot - 测试运行脚本

set -e

echo "🧪 开始运行测试..."
echo ""

cd /opt/code/retail-ai-platform/apps/api

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 运行单元测试
echo ""
echo "📝 运行单元测试..."
npm test -- --verbose --coverage

# 显示测试结果
echo ""
echo "✅ 测试完成！"
echo ""
echo "📊 测试覆盖率报告："
echo "   - HTML: coverage/index.html"
echo "   - Text: coverage/coverage-final.json"
echo ""

# 运行 E2E 测试（如果有）
if [ -f "test/jest-e2e.json" ]; then
    echo "📝 运行 E2E 测试..."
    npm run test:e2e
fi

echo "🎉 所有测试完成！"
