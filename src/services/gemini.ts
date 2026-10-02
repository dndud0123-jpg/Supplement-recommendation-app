import { GoogleGenAI } from '@google/genai';
import type { AiAnalysis } from '../types';

// ─── API Key 관리 ───────────────────────────────────────────

/** 환경변수 VITE_GEMINI_API_KEY가 빌드/배포 시 설정되어 있는지 확인 */
export function isEnvKeyConfigured(): boolean {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof envKey === 'string' && envKey.trim().length > 0;
}

function getApiKey(): string | null {
  // 1. 브라우저 로컬 스토리지에 사용자가 직접 입력한 키가 있으면 최우선 (오버라이드 지원)
  const stored = localStorage.getItem('vitamobile_api_key');
  if (stored && stored.trim().length > 0) return stored.trim();

  // 2. Vercel / Netlify 등 배포 환경변수로 주입된 키 사용
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  return null;
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

export function saveApiKey(key: string): void {
  localStorage.setItem('vitamobile_api_key', key.trim());
}

export function getStoredApiKey(): string {
  return localStorage.getItem('vitamobile_api_key') ?? '';
}

export function removeApiKey(): void {
  localStorage.removeItem('vitamobile_api_key');
}

// ─── 모델 상수 ──────────────────────────────────────────────

/** 정밀 분석용 (자유 입력, 복합 증상) */
const MODEL_FULL = 'gemini-3.5-flash-lite';

/** 경량·빠른 응답용 (퀵 칩, 단순 증상) */
const MODEL_LITE = 'gemini-3.5-flash-lite';

// ─── 시스템 프롬프트 ─────────────────────────────────────────

const SYSTEM_PROMPT = `당신은 한국의 전문 영양제 어드바이저 AI입니다.
사용자가 자신의 증상, 건강 고민, 원하는 효과를 설명하면,
최적의 영양소 조합을 추천합니다.

반드시 아래 JSON 스키마에 맞춰 응답하세요:
{
  "summary": "사용자 증상에 대한 간결한 분석 요약 (2-3문장)",
  "items": [
    {
      "id": "고유한 영문 ID (예: vitamin_d3)",
      "name": "영양소 이름 (한국어)",
      "target": "주요 작용 대상/효과 (예: 뼈 건강, 면역력)",
      "timing": "아침|점심|저녁|식전|식후|취침전 중 하나",
      "why": "이 영양소를 추천하는 과학적 이유 (1-2문장)",
      "caution": "섭취 시 주의사항 (1문장)",
      "synergyWith": [
        { "name": "함께 먹으면 좋은 영양소 이름", "reason": "시너지 효과 이유 (1문장)" }
      ],
      "avoidWith": [
        { "name": "함께 먹을 때 주의할 영양소 이름", "reason": "병용 주의 이유 (1문장)" }
      ]
    }
  ]
}

규칙:
- 3~6개의 영양소를 추천하세요
- timing은 반드시 "아침", "점심", "저녁", "식전", "식후", "취침전" 중 하나
- 각 영양소의 상호작용과 복용 순서를 고려하세요
- 과학적 근거를 바탕으로 추천하세요
- 의학적 진단이나 처방이 아님을 인지하세요
- synergyWith: 해당 영양소와 함께 복용하면 흡수율이 높아지거나 효과가 증폭되는 조합 (예: 철분+비타민C, 비타민D+칼슘). 최소 1개 이상 포함하세요
- avoidWith: 해당 영양소와 동시 복용 시 흡수를 방해하거나 부작용이 우려되는 조합 (예: 철분+칼슘, 아연+구리). 해당 사항이 없으면 빈 배열([])로 반환하세요
- 궁합 정보의 reason에는 반드시 의학적/영양학적 근거를 간결하게 포함하세요`;

// ─── 공통 호출 로직 ──────────────────────────────────────────

function createClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey });
}

async function callGemini(model: string, userInput: string): Promise<AiAnalysis> {
  const ai = createClient();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('EMPTY_RESPONSE');
    }

    const parsed: AiAnalysis = JSON.parse(text);

    // 유효성 검증
    if (!parsed.summary || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error('INVALID_RESPONSE');
    }

    return parsed;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'API_KEY_MISSING') throw error;
      if (error.message === 'EMPTY_RESPONSE') {
        throw new Error('AI로부터 빈 응답을 받았습니다.');
      }
      if (error.message === 'INVALID_RESPONSE') {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }

      // API 키 관련 에러
      const msg = error.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('403')) {
        throw new Error('API 키가 유효하지 않습니다. 설정에서 확인해주세요.');
      }

      // 모델 관련 에러
      if (msg.includes('model') || msg.includes('not found') || msg.includes('404')) {
        throw new Error(`모델(${model})을 찾을 수 없습니다: ${error.message}`);
      }

      // 기타 에러는 원본 메시지 포함
      throw new Error(`AI 분석 중 오류: ${error.message}`);
    }
    throw new Error('AI 분석 중 알 수 없는 오류가 발생했습니다.');
  }
}

// ─── 외부 API ────────────────────────────────────────────────

/**
 * 정밀 분석 (자유 입력, 복합 증상)
 * → gemini-3.8-flash 사용
 */
export async function analyzeSymptoms(userInput: string): Promise<AiAnalysis> {
  return callGemini(MODEL_FULL, userInput);
}

/**
 * 경량 빠른 분석 (퀵 칩, 단순 증상)
 * → gemini-3.5-flash-lite 사용
 */
export async function analyzeQuick(userInput: string): Promise<AiAnalysis> {
  return callGemini(MODEL_LITE, userInput);
}
