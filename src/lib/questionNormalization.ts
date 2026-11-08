export type QuestionType =
  | 'mcq'
  | 'fillup'
  | 'match'
  | 'order'
  | 'flashcard'
  | 'video'
  | 'assertion_reason'
  | 'statement';

export interface AssertionReasonData {
  assertion: string;
  reason: string;
  standardOptions: boolean;
  evaluationScratchpad?: {
    assertionTrue: boolean | null;
    reasonTrue: boolean | null;
  };
}

export interface StatementData {
  statement1: string;
  statement2: string;
  evaluationScratchpad?: {
    statement1True: boolean | null;
    statement2True: boolean | null;
  };
}

export interface MatrixRowPair {
  id: string;
  leftLabel: string;
  leftText: string;
  rightLabel: string;
  rightText: string;
}

export interface MatrixMatchData {
  pairs: MatrixRowPair[];
  matrixOptions: Record<string, string>;
  isMatrixMCQ: boolean;
}

export interface SyllableData {
  primaryAnswer: string;
  acceptedAnswers: string[];
  syllableTokens: string[];
  distractorTokens: string[];
  tokenRack: string[];
}

export interface OrderItem {
  id: string;
  stepNumber?: number;
  text: string;
}

export interface OrderData {
  items: OrderItem[];
  correctSequence: string[];
  correctOrder: string[];
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface ResolvedDiagram {
  ref: string;
  imageUrl: string | null;
  status: 'resolved' | 'missing' | 'error';
}

export type AnswerPayload =
  | { kind: 'mcq'; selectedOption: number | null }
  | { kind: 'fillup'; value: string; assembledTokens?: string[] }
  | { kind: 'match'; pairs: Record<string, string> }
  | { kind: 'order'; orderedIds: string[] }
  | { kind: 'flashcard'; flipped: boolean; completed: boolean }
  | { kind: 'video'; completed: boolean };

export interface NormalizedQuestion {
  _id?: string;
  id: string;
  questionId: string;
  type: QuestionType;
  rawType?: string;
  subject?: 'physics' | 'chemistry' | 'botany' | 'zoology' | string;
  chapter?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  question: string;
  explanation: string;
  options?: Record<string, any> | any[];
  correctOption?: string | number | null;
  correctAnswer?: string | number | null;
  imageUrl?: string | null;
  explanationImageUrl?: string | null;
  imageId?: string | null;
  videoUrl?: string | null;
  questionDiagramRefs: string[];
  explanationDiagramRefs: string[];
  resolvedQuestionDiagrams: ResolvedDiagram[];
  resolvedExplanationDiagrams: ResolvedDiagram[];
  typeData: {
    kind?: string;
    assertionReason?: AssertionReasonData;
    statementData?: StatementData;
    matrixData?: MatrixMatchData;
    syllables?: SyllableData;
    pairs?: MatrixRowPair[] | MatchPair[];
    items?: OrderItem[];
    correctOrder?: string[];
    isFormula?: boolean;
    [key: string]: any;
  };
  isFormula?: boolean;
  isSupported: boolean;
  unsupportedReason?: string | null;
  sectionKey?: string;
}

const FORMULA_REGEX = /\$\$[\s\S]*?\$\$|\$[^\$\n]+\$|\\\(|\\\[|\\frac|\\sqrt|\\times|\\pm|\\rightarrow|\\Delta|\\theta|\\omega|\\lambda|\\alpha|\\beta|\\mu|\\Omega|[\u03B1-\u03C9\u0391-\u03A9\u221A\u00B2\u00B3\u00B1\u00D7\u00F7\u00B0\u03C0\u03B8]|π|√|²|³|±|×|÷|°/i;
const STMT_REGEX = /(?:Given below are two statements[:\s]*)?Statement\s*(?:I|1)\s*[:.)-]\s*([\s\S]*?)\s*Statement\s*(?:II|2)\s*[:.)-]\s*([\s\S]*?)(?:In the light of the above statements|Choose the correct answer|Select the correct option|$)/i;
const MATCH_HEADER_REGEX = /Column\s*(?:I|1).*Column\s*(?:II|2)|List\s*[-–]?\s*(?:I|1).*List\s*[-–]?\s*(?:II|2)|Match\s+(?:the\s+)?following/i;
const MATRIX_PAIR_REGEX = /\(([a-d])\)\s*([\s\S]+?)\s*[-–]\s*\(([ivx\d]+)\)\s*([^\n\r]+)/gi;
const MATRIX_OPTION_CODE_REGEX = /[a-d]\s*-\s*\([i|v|x\d]+\)/i;

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const DIAGRAM_PATTERNS = [
  /(?:refer(?:\s+the|\s+below|\s+to)?\s+)?diagram\s*\(\s*([^)]+?)\s*\)/gi,
  /\(\s*([A-Za-z0-9_-]{3,})\s*\)\s*$/g,
];

const normalizeDiagramRef = (value: unknown): string =>
  String(value || '')
    .trim()
    .replace(/^diagram\s*\(/i, '')
    .replace(/\)\s*$/i, '')
    .trim();

export const extractDiagramRefs = (value: any): { cleanText: string; refs: string[] } => {
  const text = getText(value);
  if (!hasText(text)) return { cleanText: '', refs: [] };

  const refs: string[] = [];
  let cleanText = text;

  DIAGRAM_PATTERNS.forEach((pattern) => {
    cleanText = cleanText.replace(pattern, (_match, ref) => {
      const normalized = normalizeDiagramRef(ref);
      if (normalized) refs.push(normalized);
      return ' ';
    });
  });

  cleanText = cleanText
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([,.;:?])/g, '$1')
    .trim();

  return {
    cleanText,
    refs: Array.from(new Set(refs)),
  };
};

export const getText = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const resolved =
      value.en ||
      value.english ||
      value.hi ||
      value.hindi ||
      value.text ||
      value.value ||
      Object.values(value).find((item) => typeof item === 'string');
    return typeof resolved === 'string' ? resolved : '';
  }
  return String(value);
};

const normalizeType = (value: any): QuestionType => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'fill-blank' || raw === 'fillblank' || raw === 'numeric') return 'fillup';
  if (raw === 'diagram-label') return 'match';
  if (
    raw === 'match' ||
    raw === 'order' ||
    raw === 'flashcard' ||
    raw === 'video' ||
    raw === 'fillup' ||
    raw === 'assertion_reason' ||
    raw === 'statement'
  ) {
    return raw;
  }
  return 'mcq';
};

const getOptionsArray = (question: any): string[] => {
  const typeOptions = Array.isArray(question?.typeData?.options) ? question.typeData.options : null;
  if (typeOptions?.length) return typeOptions.map((value: any) => getText(value));

  if (Array.isArray(question?.options)) {
    return question.options.map((opt: any) => getText(opt?.text || opt?.value || opt));
  }

  if (question?.options && typeof question.options === 'object') {
    return ['A', 'B', 'C', 'D'].map((label) =>
      getText(question.options[label] ?? question.options[label.toLowerCase()] ?? '')
    );
  }

  return [];
};

const getOptionMap = (question: any): Record<string, string> => {
  if (question?.typeData?.optionMap && typeof question.typeData.optionMap === 'object') {
    return question.typeData.optionMap;
  }

  if (question?.options && !Array.isArray(question.options) && typeof question.options === 'object') {
    return question.options;
  }

  const options = getOptionsArray(question);
  return ['A', 'B', 'C', 'D'].reduce((acc, key, index) => {
    acc[key] = options[index] || '';
    return acc;
  }, {} as Record<string, string>);
};

const splitLegacyMatchPair = (value: any): { left: string; right: string } | null => {
  const text = getText(value).trim();
  if (!hasText(text)) return null;

  const separators = [',', '|', ':', ' - ', '\t'];
  for (const separator of separators) {
    const index = text.indexOf(separator);
    if (index === -1) continue;

    const left = text.slice(0, index).trim();
    const right = text.slice(index + separator.length).trim();
    if (hasText(left) && hasText(right)) return { left, right };
  }

  const lines = text.split(/\r?\n/).map((part) => part.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return {
      left: lines[0],
      right: lines.slice(1).join(' '),
    };
  }

  return null;
};

const normalizeMatchPairs = (question: any): MatchPair[] => {
  const storedPairs = Array.isArray(question?.typeData?.pairs) ? question.typeData.pairs : [];
  const normalizedStoredPairs = storedPairs
    .map((pair: any, index: number) => ({
      id: String(pair?.id || pair?.left || index),
      left: getText(pair?.left),
      right: getText(pair?.right),
    }))
    .filter((pair: MatchPair) => hasText(pair.left) && hasText(pair.right));

  if (normalizedStoredPairs.length > 0) return normalizedStoredPairs;
  if (question?.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
    return ['A', 'B', 'C', 'D']
      .map((label, index) => {
        const parsed = splitLegacyMatchPair(question.options[label] ?? question.options[label.toLowerCase()]);
        if (!parsed) return null;
        return {
          id: String(label || index),
          left: parsed.left,
          right: parsed.right,
        };
      })
      .filter((pair): pair is MatchPair => Boolean(pair));
  }

  return [];
};

const clientDetectFormula = (questionText: string, options: any, explanation: string): boolean => {
  if (FORMULA_REGEX.test(questionText || '')) return true;
  if (FORMULA_REGEX.test(explanation || '')) return true;
  const optionList = Array.isArray(options) ? options : Object.values(options || {});
  for (const val of optionList) {
    const text = typeof val === 'object' && val !== null ? (val.text || val.value || '') : String(val || '');
    if (FORMULA_REGEX.test(text)) return true;
  }
  return false;
};

const clientParseAssertionReason = (questionText: string): AssertionReasonData | null => {
  if (!questionText || typeof questionText !== 'string') return null;
  const cleaned = questionText.replace(/^(?:Consider the following\s+)?Assertion\s*(?:\(A\))?\s*(?:and|&)\s*Reason\s*(?:\(R\))?[:\s]*/i, '').trim();
  const regex = /(?:Assertion\s*(?:\(A\)|[-:])|\bA\s*[:.-])\s*([\s\S]*?)\s*(?:Reason\s*(?:\(R\)|[-:])|\bR\s*[:.-])\s*([\s\S]*?)(?:Choose the correct statement|Select the correct option|Choose the correct answer|$)/i;
  const match = cleaned.match(regex);
  if (!match) return null;

  const assertion = match[1].replace(/^\s*[:.-]\s*/, '').trim();
  const reason = match[2].replace(/^\s*[:.-]\s*/, '').trim();

  if (!assertion || !reason) return null;

  return {
    assertion,
    reason,
    standardOptions: true,
  };
};

const clientParseStatementQuestion = (questionText: string): StatementData | null => {
  if (!questionText || typeof questionText !== 'string') return null;
  const match = questionText.match(STMT_REGEX);
  if (!match) return null;

  const statement1 = match[1].replace(/^\s*[:.-]\s*/, '').trim();
  const statement2 = match[2].replace(/^\s*[:.-]\s*/, '').trim();

  if (!statement1 || !statement2) return null;

  return { statement1, statement2 };
};

const clientParseMatrixMatch = (questionText: string, options: Record<string, string>): MatrixMatchData | null => {
  if (!questionText || typeof questionText !== 'string') return null;
  if (!MATCH_HEADER_REGEX.test(questionText)) return null;

  const pairs: MatrixRowPair[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(MATRIX_PAIR_REGEX);
  while ((match = regex.exec(questionText)) !== null) {
    pairs.push({
      id: match[1].toUpperCase(),
      leftLabel: `(${match[1]})`,
      leftText: match[2].trim(),
      rightLabel: `(${match[3]})`,
      rightText: match[4].trim(),
    });
  }

  const optionCodes: Record<string, string> = {};
  let isMatrixOptions = false;
  ['A', 'B', 'C', 'D'].forEach((key) => {
    const val = options[key] || options[key.toLowerCase()];
    if (typeof val === 'string') {
      optionCodes[key] = val.trim();
      if (MATRIX_OPTION_CODE_REGEX.test(val)) {
        isMatrixOptions = true;
      }
    }
  });

  if (pairs.length >= 2 || isMatrixOptions) {
    return {
      pairs,
      matrixOptions: optionCodes,
      isMatrixMCQ: isMatrixOptions,
    };
  }

  return null;
};

const clientParseFillupSyllables = (options: Record<string, any>, correctAnswer: string): SyllableData => {
  const primaryRaw = options?.A || options?.a || options?.primary;
  if (!primaryRaw || typeof primaryRaw !== 'string') {
    return {
      primaryAnswer: correctAnswer,
      acceptedAnswers: [correctAnswer].filter(Boolean),
      syllableTokens: [],
      distractorTokens: [],
      tokenRack: [],
    };
  }

  const rawTokens = primaryRaw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const cleanAnswer = String(correctAnswer || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const syllableTokens: string[] = [];
  const distractorTokens: string[] = [];

  rawTokens.forEach((token) => {
    const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanAnswer.includes(cleanToken) && cleanToken.length > 0) {
      syllableTokens.push(token);
    } else {
      distractorTokens.push(token);
    }
  });

  const finalSyllables = syllableTokens.length ? syllableTokens : rawTokens;
  const tokenRack = [...finalSyllables, ...distractorTokens].sort(() => Math.random() - 0.5);

  return {
    primaryAnswer: correctAnswer,
    acceptedAnswers: [correctAnswer].filter(Boolean),
    syllableTokens: finalSyllables,
    distractorTokens,
    tokenRack,
  };
};

const clientParseOrderQuestion = (options: Record<string, any>, correctAnswer: string): OrderData | null => {
  const items: OrderItem[] = [];
  const labels = ['A', 'B', 'C', 'D'];

  labels.forEach((label) => {
    const raw = options[label] || options[label.toLowerCase()];
    if (!raw || typeof raw !== 'string') return;

    const commaIdx = raw.indexOf(',');
    if (commaIdx !== -1) {
      const stepNum = parseInt(raw.slice(0, commaIdx).trim(), 10);
      const text = raw.slice(commaIdx + 1).trim();
      items.push({
        id: label,
        stepNumber: isNaN(stepNum) ? items.length + 1 : stepNum,
        text,
      });
    } else {
      items.push({
        id: label,
        stepNumber: items.length + 1,
        text: raw.trim(),
      });
    }
  });

  if (items.length < 2) return null;

  const splitChar = String(correctAnswer || '').includes('>')
    ? '>'
    : String(correctAnswer || '').includes('→')
      ? '→'
      : ',';
  const correctSequence = String(correctAnswer || '')
    .split(splitChar)
    .map((s) => s.trim())
    .filter(Boolean);

  const correctOrder = items
    .slice()
    .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
    .map((item) => item.id);

  return {
    items,
    correctSequence,
    correctOrder,
  };
};

const normalizeOrderItems = (question: any): { items: OrderItem[]; correctOrder: string[] } => {
  const rawItems = Array.isArray(question?.typeData?.items) ? question.typeData.items : [];
  const items = rawItems
    .map((item: any, index: number) => ({
      id: String(item?.id || index),
      stepNumber: typeof item?.stepNumber === 'number' ? item.stepNumber : index + 1,
      text: getText(item?.text ?? item),
    }))
    .filter((item: OrderItem) => hasText(item.text));

  const correctOrder = Array.isArray(question?.typeData?.correctOrder)
    ? question.typeData.correctOrder.map((value: any) => String(value))
    : items.map((item) => item.id);

  return { items, correctOrder };
};

export const normalizeQuestion = (question: any): NormalizedQuestion => {
  const rawType = String(question?.type || question?.questionType || 'mcq');
  let type = normalizeType(rawType);
  const id = String(question?._id || question?.id || question?.questionId || '');
  const questionId = String(question?.questionId || question?._id || question?.id || '');
  const questionText = extractDiagramRefs(question?.question);
  const explanationText = extractDiagramRefs(question?.explanation);
  const questionImageUrl = question?.questionImageUrl || question?.imageUrl || null;
  const explanationImageUrl = question?.typeData?.explanationImageUrl || question?.explanationImageUrl || null;
  const options = getOptionsArray(question);
  const optionMap = getOptionMap(question);
  const matchPairs = normalizeMatchPairs(question);
  const order = normalizeOrderItems(question);

  const isFormula = typeof question?.isFormula === 'boolean'
    ? question.isFormula
    : clientDetectFormula(questionText.cleanText, optionMap, explanationText.cleanText);

  const correctAnswer = question?.correctAnswer ?? question?.correct_answer ?? question?.correct_option ?? null;

  const baseTypeData: Record<string, any> = question?.typeData && typeof question.typeData === 'object'
    ? { ...question.typeData }
    : {};

  if (type === 'mcq') {
    baseTypeData.options = options;
    baseTypeData.optionMap = optionMap;
    baseTypeData.correctOption = baseTypeData.correctOption || correctAnswer;

    if (!baseTypeData.kind) {
      const ar = clientParseAssertionReason(questionText.cleanText);
      if (ar) {
        baseTypeData.kind = 'assertion_reason';
        baseTypeData.assertionReason = ar;
      } else {
        const stmt = clientParseStatementQuestion(questionText.cleanText);
        if (stmt) {
          baseTypeData.kind = 'statement';
          baseTypeData.statementData = stmt;
        } else {
          const mm = clientParseMatrixMatch(questionText.cleanText, optionMap);
          if (mm) {
            baseTypeData.kind = 'match';
            baseTypeData.matrixData = mm;
          }
        }
      }
    }
  } else if (type === 'fillup') {
    baseTypeData.primaryAnswer = baseTypeData.primaryAnswer || correctAnswer;
    baseTypeData.acceptedAnswers = Array.isArray(baseTypeData.acceptedAnswers)
      ? baseTypeData.acceptedAnswers
      : [baseTypeData.primaryAnswer || correctAnswer].filter(Boolean);

    if (!baseTypeData.syllables) {
      const parsedSyllables = clientParseFillupSyllables(optionMap, String(correctAnswer || ''));
      if (parsedSyllables.syllableTokens.length > 0) {
        baseTypeData.syllables = parsedSyllables;
      }
    }
  } else if (type === 'match') {
    if (!baseTypeData.pairs || baseTypeData.pairs.length === 0) {
      baseTypeData.pairs = matchPairs;
    }
  } else if (type === 'order') {
    if (!baseTypeData.items || baseTypeData.items.length === 0) {
      if (order.items.length > 0) {
        baseTypeData.items = order.items;
        baseTypeData.correctOrder = order.correctOrder;
      } else {
        const recovered = clientParseOrderQuestion(optionMap, String(correctAnswer || ''));
        if (recovered) {
          baseTypeData.items = recovered.items;
          baseTypeData.correctOrder = recovered.correctOrder;
          baseTypeData.correctSequence = recovered.correctSequence;
        }
      }
    }
  } else if (type === 'flashcard') {
    baseTypeData.front = getText(baseTypeData.front || question?.question);
    baseTypeData.back = getText(baseTypeData.back || question?.explanation);
  } else if (type === 'video') {
    baseTypeData.videoUrl = baseTypeData.videoUrl || question?.videoUrl || null;
    baseTypeData.prompt = getText(baseTypeData.prompt || question?.question);
  }

  let isSupported = question?.isSupported !== false;
  let unsupportedReason = question?.unsupportedReason || null;
  if (type === 'order' && (!baseTypeData.items || baseTypeData.items.length === 0)) {
    isSupported = false;
    unsupportedReason = 'Order items are not available';
  } else if (type === 'order') {
    isSupported = true;
    unsupportedReason = null;
  }

  return {
    _id: question?._id ? String(question._id) : undefined,
    id,
    questionId,
    type,
    rawType,
    question: questionText.cleanText,
    explanation: explanationText.cleanText,
    options: question?.options || optionMap,
    questionDiagramRefs: questionText.refs,
    explanationDiagramRefs: explanationText.refs,
    resolvedQuestionDiagrams: questionText.refs.map((ref) => ({
      ref,
      imageUrl: questionImageUrl,
      status: questionImageUrl ? ('resolved' as const) : ('missing' as const),
    })),
    resolvedExplanationDiagrams: explanationText.refs.map((ref) => ({
      ref,
      imageUrl: explanationImageUrl || questionImageUrl,
      status: explanationImageUrl || questionImageUrl ? ('resolved' as const) : ('missing' as const),
    })),
    subject: question?.subject || '',
    chapter: question?.chapter || question?.chapterId || '',
    topic: question?.topic || question?.topicId || '',
    difficulty: question?.difficulty || '',
    imageUrl: questionImageUrl,
    explanationImageUrl,
    imageId: question?.imageId || null,
    videoUrl: question?.videoUrl || baseTypeData.videoUrl || null,
    correctAnswer,
    correctOption: question?.correctOption ?? question?.correct_option ?? baseTypeData.correctOption ?? null,
    typeData: baseTypeData,
    isFormula,
    isSupported,
    unsupportedReason,
    sectionKey: question?.sectionKey || baseTypeData?.sectionKey || undefined,
  };
};

export const normalizeQuestions = (questions: any[]): NormalizedQuestion[] =>
  Array.isArray(questions) ? questions.map((question) => normalizeQuestion(question)) : [];

export const applyResolvedDiagrams = (
  questions: NormalizedQuestion[],
  resolvedItems: Array<{ questionId?: string | null; resolved?: ResolvedDiagram[] }>
): NormalizedQuestion[] => {
  const resolvedMap = new Map<string, ResolvedDiagram[]>();
  resolvedItems.forEach((item) => {
    const questionId = String(item?.questionId || '').trim();
    if (!questionId) return;
    resolvedMap.set(
      questionId,
      Array.isArray(item?.resolved)
        ? item.resolved.map((entry) => ({
            ref: normalizeDiagramRef(entry?.ref),
            imageUrl: entry?.imageUrl || null,
            status: entry?.status === 'resolved' || entry?.status === 'missing' ? entry.status : 'error',
          }))
        : []
    );
  });

  return questions.map((question) => {
    const resolved = resolvedMap.get(String(question.questionId || question.id)) || [];
    const resolvedByRef = new Map(resolved.map((entry) => [normalizeDiagramRef(entry.ref), entry]));
    return {
      ...question,
      resolvedQuestionDiagrams: question.questionDiagramRefs.map((ref) =>
        resolvedByRef.get(normalizeDiagramRef(ref)) || { ref, imageUrl: null, status: 'missing' as const }
      ),
      resolvedExplanationDiagrams: question.explanationDiagramRefs.map((ref) =>
        resolvedByRef.get(normalizeDiagramRef(ref)) || { ref, imageUrl: null, status: 'missing' as const }
      ),
    };
  });
};

export const answerPayloadFromAttempt = (question: NormalizedQuestion, answer: any): AnswerPayload | null => {
  if (!answer) return null;
  const payload = answer?.answerPayload;
  if (payload && typeof payload === 'object' && payload.kind) {
    return payload as AnswerPayload;
  }

  if (
    question.type === 'mcq' ||
    question.typeData?.kind === 'assertion_reason' ||
    question.typeData?.kind === 'statement' ||
    question.typeData?.kind === 'match'
  ) {
    const selected =
      typeof answer?.selectedOption === 'string'
        ? answer.selectedOption.toUpperCase().charCodeAt(0) - 65
        : typeof answer?.selectedOption === 'number'
          ? answer.selectedOption
          : null;
    return { kind: 'mcq', selectedOption: Number.isInteger(selected) && selected! >= 0 ? selected : null };
  }

  return null;
};

export const isAnswerPayloadAttempted = (payload: AnswerPayload | null | undefined): boolean => {
  if (!payload) return false;
  switch (payload.kind) {
    case 'mcq':
      return Number.isInteger(payload.selectedOption);
    case 'fillup':
      return hasText(payload.value);
    case 'match':
      return Object.keys(payload.pairs || {}).length > 0;
    case 'order':
      return Array.isArray(payload.orderedIds) && payload.orderedIds.length > 0;
    case 'flashcard':
      return Boolean(payload.flipped || payload.completed);
    case 'video':
      return Boolean(payload.completed);
    default:
      return false;
  }
};

export const getCorrectOptionIndex = (question: NormalizedQuestion): number | null => {
  const correctAnswer = question.typeData?.correctOption ?? question.correctAnswer ?? question.correctOption;
  if (typeof correctAnswer === 'number' && Number.isFinite(correctAnswer)) return correctAnswer;
  if (typeof correctAnswer === 'string') {
    const upper = correctAnswer.trim().toUpperCase();
    if (/^[A-D]$/.test(upper)) return upper.charCodeAt(0) - 65;
    const numeric = Number(upper);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
};
