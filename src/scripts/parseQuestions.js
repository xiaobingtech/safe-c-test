const fs = require('fs');
const path = require('path');

// 题目解析器类
class QuestionParser {
  
  /**
   * 解析单选题文件
   */
  parseSingleChoice(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          let question = questionMatch[2].trim();
          
          i++; // 移动到下一行
          
          // 如果题目跨行，继续读取直到遇到A选项
          while (i < lines.length && !lines[i].startsWith('A.') && 
                 !lines[i].startsWith('正确答案：') && 
                 !this.isQuestionLine(lines[i])) {
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
          if (i < lines.length && lines[i].startsWith('A.')) {
            options.A = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析B选项
          if (i < lines.length && lines[i].startsWith('B.')) {
            options.B = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析C选项
          if (i < lines.length && lines[i].startsWith('C.')) {
            options.C = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析D选项
          if (i < lines.length && lines[i].startsWith('D.')) {
            options.D = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析正确答案
          let correctAnswer = '';
          if (i < lines.length && lines[i].startsWith('正确答案：')) {
            correctAnswer = lines[i].substring(5).trim();
            i++;
          }
          
          // 只有当选项不为空时才添加题目
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
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 解析多选题文件
   */
  parseMultipleChoice(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          let question = questionMatch[2].trim();
          
          i++; // 移动到下一行
          
          // 如果题目跨行，继续读取直到遇到A选项
          while (i < lines.length && !lines[i].startsWith('A.') && 
                 !lines[i].startsWith('正确答案：') && 
                 !this.isQuestionLine(lines[i])) {
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
          if (i < lines.length && lines[i].startsWith('A.')) {
            options.A = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析B选项
          if (i < lines.length && lines[i].startsWith('B.')) {
            options.B = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析C选项
          if (i < lines.length && lines[i].startsWith('C.')) {
            options.C = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析D选项
          if (i < lines.length && lines[i].startsWith('D.')) {
            options.D = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析E选项（如果有）
          if (i < lines.length && lines[i].startsWith('E.')) {
            options.E = lines[i].substring(2).trim();
            i++;
          }
          
          // 解析正确答案
          let correctAnswerStr = '';
          if (i < lines.length && lines[i].startsWith('正确答案：')) {
            correctAnswerStr = lines[i].substring(5).trim();
            i++;
          }
          
          // 将答案字符串转换为数组
          const correctAnswer = correctAnswerStr.split('').filter(char => 
            ['A', 'B', 'C', 'D', 'E'].includes(char)
          );
          
          // 只有当选项不为空时才添加题目
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
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 解析判断题文件
   */
  parseJudgeQuestions(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          let question = questionMatch[2].trim();
          
          i++; // 移动到下一行
          
          // 如果题目跨行，继续读取直到遇到答案
          while (i < lines.length && 
                 lines[i] !== '正确' && 
                 lines[i] !== '错误' && 
                 !this.isQuestionLine(lines[i])) {
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
          
          // 只有当有答案时才添加题目
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
        }
      } else {
        i++;
      }
    }
    
    return questions;
  }
  
  /**
   * 判断是否为题目行
   */
  isQuestionLine(line) {
    return /^\d+\./.test(line);
  }
  
  /**
   * 解析所有题目文件
   */
  parseAllQuestions(resDir) {
    const singleChoicePath = path.join(resDir, '安全C证单选题.txt');
    const multipleChoicePath = path.join(resDir, '安全C证多选题.txt');
    const judgePath = path.join(resDir, '安全C证判断题.txt');
    
    console.log('开始解析单选题...');
    const singleChoice = this.parseSingleChoice(singleChoicePath);
    console.log(`单选题解析完成，共 ${singleChoice.length} 道题`);
    
    console.log('开始解析多选题...');
    const multipleChoice = this.parseMultipleChoice(multipleChoicePath);
    console.log(`多选题解析完成，共 ${multipleChoice.length} 道题`);
    
    console.log('开始解析判断题...');
    const judge = this.parseJudgeQuestions(judgePath);
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