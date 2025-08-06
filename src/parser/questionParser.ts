import * as fs from 'fs';
import * as path from 'path';
import { 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  JudgeQuestion, 
  ParseResult 
} from './types';

export class QuestionParser {
  
  /**
   * 解析单选题文件
   */
  public parseSingleChoice(filePath: string): SingleChoiceQuestion[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions: SingleChoiceQuestion[] = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          const question = questionMatch[2].trim();
          
          // 解析选项
          const options = {
            A: '',
            B: '',
            C: '',
            D: ''
          };
          
          i++; // 移动到选项行
          
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
          
          questions.push({
            id,
            question,
            type: 'single',
            options,
            correctAnswer
          });
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
  public parseMultipleChoice(filePath: string): MultipleChoiceQuestion[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions: MultipleChoiceQuestion[] = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          let question = questionMatch[2].trim();
          
          i++; // 移动到下一行
          
          // 如果题目跨行，继续读取
          while (i < lines.length && !lines[i].startsWith('A.') && 
                 !lines[i].startsWith('正确答案：') && 
                 !this.isQuestionLine(lines[i])) {
            question += lines[i];
            i++;
          }
          
          // 解析选项
          const options: any = {
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
          
          questions.push({
            id,
            question,
            type: 'multiple',
            options,
            correctAnswer
          });
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
  public parseJudgeQuestions(filePath: string): JudgeQuestion[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions: JudgeQuestion[] = [];
    
    let i = 0;
    while (i < lines.length) {
      // 查找题目行（以数字开头）
      if (this.isQuestionLine(lines[i])) {
        const questionMatch = lines[i].match(/^(\d+)\.(.+)$/);
        if (questionMatch) {
          const id = parseInt(questionMatch[1]);
          let question = questionMatch[2].trim();
          
          i++; // 移动到下一行
          
          // 如果题目跨行，继续读取
          while (i < lines.length && 
                 lines[i] !== '正确' && 
                 lines[i] !== '错误' && 
                 !this.isQuestionLine(lines[i])) {
            question += lines[i];
            i++;
          }
          
          // 解析答案
          let correctAnswer = false;
          if (i < lines.length && (lines[i] === '正确' || lines[i] === '错误')) {
            correctAnswer = lines[i] === '正确';
            i++;
          }
          
          questions.push({
            id,
            question,
            type: 'judge',
            correctAnswer
          });
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
  private isQuestionLine(line: string): boolean {
    return /^\d+\./.test(line);
  }
  
  /**
   * 解析所有题目文件
   */
  public parseAllQuestions(resDir: string): ParseResult {
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
  public saveToJson(result: ParseResult, outputPath: string): void {
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