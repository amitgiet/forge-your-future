import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Keyboard, Layers, RotateCcw } from 'lucide-react';
import type { NormalizedQuestion, AnswerPayload } from '@/lib/questionNormalization';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SpecializedRendererProps {
  question: NormalizedQuestion;
  answerPayload: AnswerPayload | null;
  onChange: (payload: AnswerPayload | null) => void;
  readOnly?: boolean;
}

interface RackToken {
  id: string;
  text: string;
}

export const SyllableChipAssembler: React.FC<SpecializedRendererProps> = ({
  question,
  answerPayload,
  onChange,
  readOnly = false,
}) => {
  const syllables = question.typeData?.syllables;

  const rawRack: string[] = useMemo(() => {
    if (syllables?.tokenRack && syllables.tokenRack.length > 0) {
      return syllables.tokenRack;
    }
    if (syllables?.syllableTokens && syllables.syllableTokens.length > 0) {
      return [...syllables.syllableTokens, ...(syllables.distractorTokens || [])];
    }
    return [];
  }, [syllables]);

  const allTokens: RackToken[] = useMemo(() => {
    return rawRack.map((token, index) => ({
      id: `token-${index}-${token}`,
      text: token,
    }));
  }, [rawRack]);

  const tokenById = useMemo(() => {
    const map = new Map<string, string>();
    allTokens.forEach((t) => map.set(t.id, t.text));
    return map;
  }, [allTokens]);

  const [keyboardMode, setKeyboardMode] = useState<boolean>(rawRack.length === 0);
  const [assembledIds, setAssembledIds] = useState<string[]>([]);

  // Sync with answerPayload if assembledTokens are provided or restored
  useEffect(() => {
    if (answerPayload?.kind === 'fillup') {
      if (answerPayload.assembledTokens && answerPayload.assembledTokens.length > 0) {
        // Match tokens from allTokens pool
        const matchedIds: string[] = [];
        const usedTokenIndices = new Set<number>();

        answerPayload.assembledTokens.forEach((tokenText) => {
          const foundIdx = allTokens.findIndex(
            (t, idx) => t.text === tokenText && !usedTokenIndices.has(idx)
          );
          if (foundIdx !== -1) {
            usedTokenIndices.add(foundIdx);
            matchedIds.push(allTokens[foundIdx].id);
          }
        });

        if (matchedIds.length > 0) {
          setAssembledIds(matchedIds);
          return;
        }
      }
    } else if (!answerPayload) {
      setAssembledIds([]);
    }
  }, [answerPayload, allTokens]);

  const availableTokens = useMemo(() => {
    const usedSet = new Set(assembledIds);
    return allTokens.filter((t) => !usedSet.has(t.id));
  }, [allTokens, assembledIds]);

  const assembledList = useMemo(() => {
    return assembledIds.map((id) => ({ id, text: tokenById.get(id) || '' }));
  }, [assembledIds, tokenById]);

  const currentValue = answerPayload?.kind === 'fillup' ? answerPayload.value : '';

  const handleAssembleToken = (token: RackToken) => {
    if (readOnly) return;
    const nextIds = [...assembledIds, token.id];
    setAssembledIds(nextIds);
    const nextVal = nextIds.map((id) => tokenById.get(id) || '').join('');
    onChange({
      kind: 'fillup',
      value: nextVal,
      assembledTokens: nextIds.map((id) => tokenById.get(id) || ''),
    });
  };

  const handleReturnToken = (tokenId: string) => {
    if (readOnly) return;
    const nextIds = assembledIds.filter((id) => id !== tokenId);
    setAssembledIds(nextIds);
    const nextVal = nextIds.map((id) => tokenById.get(id) || '').join('');
    onChange(
      nextVal.length > 0
        ? {
            kind: 'fillup',
            value: nextVal,
            assembledTokens: nextIds.map((id) => tokenById.get(id) || ''),
          }
        : null
    );
  };

  const handlePopToken = () => {
    if (readOnly || assembledIds.length === 0) return;
    const nextIds = assembledIds.slice(0, -1);
    setAssembledIds(nextIds);
    const nextVal = nextIds.map((id) => tokenById.get(id) || '').join('');
    onChange(
      nextVal.length > 0
        ? {
            kind: 'fillup',
            value: nextVal,
            assembledTokens: nextIds.map((id) => tokenById.get(id) || ''),
          }
        : null
    );
  };

  const handleResetTokens = () => {
    if (readOnly) return;
    setAssembledIds([]);
    onChange(null);
  };

  const handleTextChange = (text: string) => {
    if (readOnly) return;
    const clean = text.trimStart();
    onChange(clean.length > 0 ? { kind: 'fillup', value: clean } : null);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-xl border-2 border-primary/30 bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {keyboardMode ? 'Typed Answer' : 'Assembled Term'}
          </span>

          <div className="flex items-center gap-1.5">
            {rawRack.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setKeyboardMode(!keyboardMode)}
                className="h-7 px-2.5 text-xs font-medium gap-1.5"
              >
                {keyboardMode ? (
                  <>
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Tiles</span>
                  </>
                ) : (
                  <>
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Type</span>
                  </>
                )}
              </Button>
            )}

            {!keyboardMode && assembledIds.length > 0 && !readOnly && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePopToken}
                  className="h-7 px-2.5 text-xs font-medium gap-1 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Pop</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetTokens}
                  className="h-7 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:bg-muted"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {keyboardMode ? (
          <Input
            value={currentValue}
            placeholder="Type scientific term..."
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={readOnly}
            className="h-11 text-base font-semibold"
          />
        ) : (
          <div className="min-h-[52px] rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center flex-wrap gap-2">
            {assembledList.length === 0 ? (
              <span className="text-xs italic text-muted-foreground">
                Click syllable tiles below to assemble the answer...
              </span>
            ) : (
              <AnimatePresence>
                {assembledList.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => handleReturnToken(item.id)}
                    disabled={readOnly}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={readOnly ? {} : { scale: 1.05 }}
                    whileTap={readOnly ? {} : { scale: 0.95 }}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-wide shadow-sm hover:bg-primary/90 transition-colors"
                    title={readOnly ? '' : 'Click to remove token'}
                  >
                    {item.text}
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {!keyboardMode && rawRack.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Available Syllables & Distractors
          </p>

          <div className="flex flex-wrap gap-2.5">
            {availableTokens.map((token) => (
              <motion.button
                key={token.id}
                type="button"
                onClick={() => handleAssembleToken(token)}
                disabled={readOnly}
                whileHover={readOnly ? {} : { scale: 1.05 }}
                whileTap={readOnly ? {} : { scale: 0.95 }}
                className="px-4 py-2 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-foreground font-bold text-sm transition-all shadow-sm"
              >
                {token.text}
              </motion.button>
            ))}
            {availableTokens.length === 0 && (
              <span className="text-xs text-muted-foreground italic">
                All syllables placed into assembled slot.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllableChipAssembler;
