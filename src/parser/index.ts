#!/usr/bin/env node

import * as path from 'path';
import { QuestionParser } from './questionParser';

async function main() {
  try {
    console.log('=== 安全C证题目解析器 ===');
    console.log('');
    
    const parser = new QuestionParser();
    
    // 资源文件目录
    const resDir = path.join(__dirname, '../res');
    
    // 解析所有题目
    const result = parser.parseAllQuestions(resDir);
    
    console.log('');
    console.log('=== 解析结果 ===');
    console.log(`单选题: ${result.singleChoice.length} 道`);
    console.log(`多选题: ${result.multipleChoice.length} 道`);
    console.log(`判断题: ${result.judge.length} 道`);
    console.log(`总计: ${result.total} 道题目`);
    
    // 保存为JSON文件
    const outputPath = path.join(__dirname, '../output/questions.json');
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    const fs = require('fs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    parser.saveToJson(result, outputPath);
    
    console.log('');
    console.log('=== 完成 ===');
    console.log(`所有题目已解析完成并保存为JSON格式`);
    
    // 输出一些示例数据
    console.log('');
    console.log('=== 示例数据 ===');
    if (result.singleChoice.length > 0) {
      console.log('单选题示例:');
      console.log(JSON.stringify(result.singleChoice[0], null, 2));
      console.log('');
    }
    
    if (result.multipleChoice.length > 0) {
      console.log('多选题示例:');
      console.log(JSON.stringify(result.multipleChoice[0], null, 2));
      console.log('');
    }
    
    if (result.judge.length > 0) {
      console.log('判断题示例:');
      console.log(JSON.stringify(result.judge[0], null, 2));
    }
    
  } catch (error) {
    console.error('解析过程中出现错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export { QuestionParser } from './questionParser';
export * from './types';