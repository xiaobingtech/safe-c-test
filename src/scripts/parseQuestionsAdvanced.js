const fs = require('fs');
const path = require('path');

// 改进的题目解析器类
class AdvancedQuestionParser {
  
  /**
   * 解析单选题文件 - 改进版
   */
  parseSingleChoice(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字.开头）
      const questionMatch = lines[i].match(/^(\d+)\.(.*)$/);
      if (questionMatch) {
        const id = parseInt(questionMatch[1]);
        let question = questionMatch[2].trim();
        
        i++; // 移动到下一行
        
        // 继续读取题目内容，直到遇到选项A
        while (i < lines.length && !lines[i].match(/^A[\.\uff0e]/) && 
               !lines[i].startsWith('正确答案')) {
          question += lines[i];
          i++;
        }
        
        // 解析选项
        const options = {
          A: '',
          B: '',
          C: '',
          D: ''
        };
        
        // 解析A选项
        if (i < lines.length && lines[i].match(/^A[\.\uff0e]/)) {
          options.A = lines[i].replace(/^A[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析B选项
        if (i < lines.length && lines[i].match(/^B[\.\uff0e]/)) {
          options.B = lines[i].replace(/^B[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析C选项
        if (i < lines.length && lines[i].match(/^C[\.\uff0e]/)) {
          options.C = lines[i].replace(/^C[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析D选项
        if (i < lines.length && lines[i].match(/^D[\.\uff0e]/)) {
          options.D = lines[i].replace(/^D[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析正确答案
        let correctAnswer = '';
        if (i < lines.length && lines[i].match(/^正确答案[：:]/)) {
          correctAnswer = lines[i].replace(/^正确答案[：:]/, '').trim();
          i++;
        }
        
        // 添加题目（只要有有效的选项）
        if (options.A || options.B || options.C || options.D) {
          questions.push({
            id,
            question,
            type: 'single',
            options,
            correctAnswer
          });
        } else {
          console.warn(`跳过无效的单选题 ${id}: 选项为空`);
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 解析多选题文件 - 改进版
   */
  parseMultipleChoice(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字.开头）
      const questionMatch = lines[i].match(/^(\d+)\.(.*)$/);
      if (questionMatch) {
        const id = parseInt(questionMatch[1]);
        let question = questionMatch[2].trim();
        
        i++; // 移动到下一行
        
        // 继续读取题目内容，直到遇到选项A
        while (i < lines.length && !lines[i].match(/^A[\.\uff0e]/) && 
               !lines[i].startsWith('正确答案')) {
          question += lines[i];
          i++;
        }
        
        // 解析选项
        const options = {
          A: '',
          B: '',
          C: '',
          D: ''
        };
        
        // 解析A选项
        if (i < lines.length && lines[i].match(/^A[\.\uff0e]/)) {
          options.A = lines[i].replace(/^A[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析B选项
        if (i < lines.length && lines[i].match(/^B[\.\uff0e]/)) {
          options.B = lines[i].replace(/^B[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析C选项
        if (i < lines.length && lines[i].match(/^C[\.\uff0e]/)) {
          options.C = lines[i].replace(/^C[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析D选项
        if (i < lines.length && lines[i].match(/^D[\.\uff0e]/)) {
          options.D = lines[i].replace(/^D[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析E选项（如果有）
        if (i < lines.length && lines[i].match(/^E[\.\uff0e]/)) {
          options.E = lines[i].replace(/^E[\.\uff0e]/, '').trim();
          i++;
        }
        
        // 解析正确答案
        let correctAnswerStr = '';
        if (i < lines.length && lines[i].match(/^正确答案[：:]/)) {
          correctAnswerStr = lines[i].replace(/^正确答案[：:]/, '').trim();
          i++;
        }
        
        // 将答案字符串转换为数组
        const correctAnswer = correctAnswerStr.split('').filter(char => 
          ['A', 'B', 'C', 'D', 'E'].includes(char)
        );
        
        // 添加题目（只要有有效的选项）
        if (options.A || options.B || options.C || options.D) {
          questions.push({
            id,
            question,
            type: 'multiple',
            options,
            correctAnswer
          });
        } else {
          console.warn(`跳过无效的多选题 ${id}: 选项为空`);
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 解析判断题文件 - 改进版
   */
  parseJudgeQuestions(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字.开头）
      const questionMatch = lines[i].match(/^(\d+)\.(.*)$/);
      if (questionMatch) {
        const id = parseInt(questionMatch[1]);
        let question = questionMatch[2].trim();
        
        i++; // 移动到下一行
        
        // 继续读取题目内容，直到遇到答案
        while (i < lines.length && 
               lines[i] !== '正确' && 
               lines[i] !== '错误' && 
               !lines[i].match(/^\d+\./)) {
          question += lines[i];
          i++;
        }
        
        // 解析答案
        let correctAnswer = false;
        let hasAnswer = false;
        if (i < lines.length && (lines[i] === '正确' || lines[i] === '错误')) {
          correctAnswer = lines[i] === '正确';
          hasAnswer = true;
          i++;
        }
        
        // 添加题目
        if (hasAnswer) {
          questions.push({
            id,
            question,
            type: 'judge',
            correctAnswer
          });
        } else {
          console.warn(`跳过无效的判断题 ${id}: 没有找到答案`);
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 基于正则表达式的块状解析方法
   */
  parseByBlocks(filePath, questionType) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = [];
    
    if (questionType === 'single') {
      // 单选题匹配模式：题目 + 4个选项 + 答案
      const pattern = /(\d+)\.([^]*?)A[\.\uff0e]([^]*?)B[\.\uff0e]([^]*?)C[\.\uff0e]([^]*?)D[\.\uff0e]([^]*?)正确答案[：:]([ABCD])/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, id, question, optionA, optionB, optionC, optionD, answer] = match;
        questions.push({
          id: parseInt(id),
          question: question.trim(),
          type: 'single',
          options: {
            A: optionA.trim(),
            B: optionB.trim(),
            C: optionC.trim(),
            D: optionD.trim()
          },
          correctAnswer: answer.trim()
        });
      }
    } else if (questionType === 'multiple') {
      // 多选题匹配模式：题目 + 选项（4-5个） + 答案
      const pattern = /(\d+)\.([^]*?)A[\.\uff0e]([^]*?)B[\.\uff0e]([^]*?)C[\.\uff0e]([^]*?)D[\.\uff0e]([^]*?)(?:E[\.\uff0e]([^]*?))?正确答案[：:]([ABCDE]+)/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, id, question, optionA, optionB, optionC, optionD, optionE, answer] = match;
        const options = {
          A: optionA.trim(),
          B: optionB.trim(),
          C: optionC.trim(),
          D: optionD.trim()
        };
        if (optionE) {
          options.E = optionE.trim();
        }
        
        questions.push({
          id: parseInt(id),
          question: question.trim(),
          type: 'multiple',
          options,
          correctAnswer: answer.trim().split('')
        });
      }
    } else if (questionType === 'judge') {
      // 判断题匹配模式：题目 + 答案
      const pattern = /(\d+)\.([^]*?)(正确|错误)/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, id, question, answer] = match;
        questions.push({
          id: parseInt(id),
          question: question.trim(),
          type: 'judge',
          correctAnswer: answer === '正确'
        });
      }
    }
    
    return questions;
  }
  
  /**
   * 解析所有题目文件 - 使用更健壮的方法
   */
  parseAllQuestions(resDir) {
    const singleChoicePath = path.join(resDir, '安全C证单选题.txt');
    const multipleChoicePath = path.join(resDir, '安全C证多选题.txt');
    const judgePath = path.join(resDir, '安全C证判断题.txt');
    
    console.log('开始解析单选题（使用正则表达式方法）...');
    let singleChoice = this.parseByBlocks(singleChoicePath, 'single');
    console.log(`单选题解析完成，共 ${singleChoice.length} 道题`);
    
    console.log('开始解析多选题（使用正则表达式方法）...');
    let multipleChoice = this.parseByBlocks(multipleChoicePath, 'multiple');
    console.log(`多选题解析完成，共 ${multipleChoice.length} 道题`);
    
    console.log('开始解析判断题（使用正则表达式方法）...');
    let judge = this.parseByBlocks(judgePath, 'judge');
    console.log(`判断题解析完成，共 ${judge.length} 道题`);
    
    const total = singleChoice.length + multipleChoice.length + judge.length;
    
    return {
      singleChoice,
      multipleChoice,
      judge,
      total
    };
  }
  
  /**
   * 保存解析结果为JSON文件
   */
  saveToJson(result, outputPath) {
    const jsonData = {
      metadata: {
        totalQuestions: result.total,
        singleChoiceCount: result.singleChoice.length,
        multipleChoiceCount: result.multipleChoice.length,
        judgeCount: result.judge.length,
        parseDate: new Date().toISOString()
      },
      questions: {
        singleChoice: result.singleChoice,
        multipleChoice: result.multipleChoice,
        judge: result.judge
      }
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`JSON文件已保存到: ${outputPath}`);
  }
}

// 主函数
function main() {
  try {
    console.log('=== 安全C证题目解析器（改进版）===');
    console.log('');
    
    const parser = new AdvancedQuestionParser();
    
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
    const outputPath = path.join(__dirname, '../output/questions_advanced.json');
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
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

// 运行主函数
main();