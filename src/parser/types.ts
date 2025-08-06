// 题目类型定义
export interface BaseQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'judge';
}

// 单选题接口
export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

// 多选题接口
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: string[];
}

// 判断题接口
export interface JudgeQuestion extends BaseQuestion {
  type: 'judge';
  correctAnswer: boolean;
}

// 联合类型
export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | JudgeQuestion;

// 解析结果接口
export interface ParseResult {
  singleChoice: SingleChoiceQuestion[];
  multipleChoice: MultipleChoiceQuestion[];
  judge: JudgeQuestion[];
  total: number;
}