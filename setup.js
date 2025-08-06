#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 安全C证模拟考试系统 - 快速启动脚本');
console.log('');

// 检查 .env 文件
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 创建 .env 文件...');
  const envContent = `DATABASE_URL="postgresql://neondb_owner:npg_0NjAKgl4IaiR@ep-raspy-union-a1lxo76h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-2025`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env 文件创建成功');
} else {
  console.log('✅ .env 文件已存在');
}

// 检查题库文件
const questionsPath = path.join(__dirname, 'src', 'output', 'questions.json');
if (!fs.existsSync(questionsPath)) {
  console.log('❌ 题库文件不存在: src/output/questions.json');
  console.log('请确保题库文件存在后重新运行');
  process.exit(1);
} else {
  try {
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    console.log('✅ 题库文件检查通过');
    console.log(`   - 单选题: ${questionsData.questions.singleChoice.length} 道`);
    console.log(`   - 多选题: ${questionsData.questions.multipleChoice.length} 道`);
    console.log(`   - 判断题: ${questionsData.questions.judge.length} 道`);
    console.log(`   - 总计: ${questionsData.metadata.totalQuestions} 道题目`);
  } catch (error) {
    console.log('❌ 题库文件格式错误');
    console.log('请检查 src/output/questions.json 文件格式');
    process.exit(1);
  }
}

console.log('');
console.log('🎯 接下来请手动执行以下命令:');
console.log('');
console.log('1. 安装依赖:');
console.log('   npm install');
console.log('');
console.log('2. 生成Prisma客户端:');
console.log('   npx prisma generate');
console.log('');
console.log('3. 推送数据库schema:');
console.log('   npx prisma db push');
console.log('');
console.log('4. 启动开发服务器:');
console.log('   npm run dev');
console.log('');
console.log('5. 打开浏览器访问:');
console.log('   http://localhost:3000');
console.log('');
console.log('📚 详细说明请查看 SETUP.md 文件');
console.log('');
console.log('🎉 准备完成！开始您的安全C证模拟考试之旅吧！');