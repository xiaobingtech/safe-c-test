const fs = require('fs');
const path = require('path');

// 清理和最终化题目数据
function cleanAndFinalize() {
  try {
    console.log('开始清理和最终化题目数据...');
    
    // 读取解析后的JSON文件
    const inputPath = path.join(__dirname, '../output/questions_advanced.json');
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    
    // 清理函数：移除多余的换行符和空格
    function cleanText(text) {
      if (typeof text !== 'string') return text;
      return text
        .replace(/\r\n/g, '') // 移除 \r\n
        .replace(/\n/g, '') // 移除 \n
        .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
        .trim(); // 移除前后空格
    }
    
    // 清理所有题目
    const cleanedData = {
      metadata: {
        ...data.metadata,
        cleanedDate: new Date().toISOString(),
        version: '1.0.0',
        description: '安全C证考试题库 - 包含单选题、多选题、判断题'
      },
      questions: {
        singleChoice: data.questions.singleChoice.map(q => ({
          ...q,
          question: cleanText(q.question),
          options: {
            A: cleanText(q.options.A),
            B: cleanText(q.options.B),
            C: cleanText(q.options.C),
            D: cleanText(q.options.D)
          }
        })),
        multipleChoice: data.questions.multipleChoice.map(q => {
          const cleaned = {
            ...q,
            question: cleanText(q.question),
            options: {
              A: cleanText(q.options.A),
              B: cleanText(q.options.B),
              C: cleanText(q.options.C),
              D: cleanText(q.options.D)
            }
          };
          if (q.options.E) {
            cleaned.options.E = cleanText(q.options.E);
          }
          return cleaned;
        }),
        judge: data.questions.judge.map(q => ({
          ...q,
          question: cleanText(q.question)
        }))
      }
    };
    
    // 保存清理后的数据
    const outputPath = path.join(__dirname, '../output/questions_final.json');
    fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf-8');
    
    console.log('=== 最终统计 ===');
    console.log(`单选题: ${cleanedData.questions.singleChoice.length} 道`);
    console.log(`多选题: ${cleanedData.questions.multipleChoice.length} 道`);
    console.log(`判断题: ${cleanedData.questions.judge.length} 道`);
    console.log(`总计: ${cleanedData.metadata.totalQuestions} 道题目`);
    console.log(`清理后的JSON文件已保存到: ${outputPath}`);
    
    // 生成分类的JSON文件
    const singleChoicePath = path.join(__dirname, '../output/single_choice_questions.json');
    const multipleChoicePath = path.join(__dirname, '../output/multiple_choice_questions.json');
    const judgePath = path.join(__dirname, '../output/judge_questions.json');
    
    fs.writeFileSync(singleChoicePath, JSON.stringify({
      metadata: {
        type: 'single_choice',
        count: cleanedData.questions.singleChoice.length,
        description: '单选题题库'
      },
      questions: cleanedData.questions.singleChoice
    }, null, 2), 'utf-8');
    
    fs.writeFileSync(multipleChoicePath, JSON.stringify({
      metadata: {
        type: 'multiple_choice',
        count: cleanedData.questions.multipleChoice.length,
        description: '多选题题库'
      },
      questions: cleanedData.questions.multipleChoice
    }, null, 2), 'utf-8');
    
    fs.writeFileSync(judgePath, JSON.stringify({
      metadata: {
        type: 'judge',
        count: cleanedData.questions.judge.length,
        description: '判断题题库'
      },
      questions: cleanedData.questions.judge
    }, null, 2), 'utf-8');
    
    console.log('');
    console.log('=== 分类文件已生成 ===');
    console.log(`单选题文件: ${singleChoicePath}`);
    console.log(`多选题文件: ${multipleChoicePath}`);
    console.log(`判断题文件: ${judgePath}`);
    
    // 显示示例数据
    console.log('');
    console.log('=== 清理后的示例数据 ===');
    console.log('单选题示例:');
    console.log(JSON.stringify(cleanedData.questions.singleChoice[0], null, 2));
    console.log('');
    console.log('多选题示例:');
    console.log(JSON.stringify(cleanedData.questions.multipleChoice[0], null, 2));
    console.log('');
    console.log('判断题示例:');
    console.log(JSON.stringify(cleanedData.questions.judge[0], null, 2));
    
  } catch (error) {
    console.error('清理过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行清理函数
cleanAndFinalize();