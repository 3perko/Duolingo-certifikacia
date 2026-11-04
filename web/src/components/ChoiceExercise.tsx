import { useMemo, useState } from "react";
import { isCorrect, shuffle } from "../engine/exam";
import { useStore } from "../store";
import type { ChoiceItem, Lang } from "../types";
import { Tutor } from "./Tutor";

export function ChoiceBody({
  item,
  lang,
  selected,
  onToggle,
  reveal,
  order,
}: {
  item: ChoiceItem;
  lang: Lang;
  /** Indices into item.options; selection and answers always use original indices. */
  selected: number[];
  onToggle: (i: number) => void;
  reveal: boolean;
  /** Display order of the options (shuffled so the answer position carries no signal). */
  order: number[];
}) {
  const { t } = useStore();
  const multi = item.correct.length > 1;
  return (
    <>
      {item.artifact && (
        <div className="artifact">
          <div className="artifact-title">🤖 {item.artifact.title[lang]}</div>
          <pre>{item.artifact.body[lang]}</pre>
        </div>
      )}
      <h2 className="question">{item.question[lang]}</h2>
      {multi && <p className="muted small">{t("chooseN", { n: item.correct.length })}</p>}
      <div className="options" role={multi ? "group" : "radiogroup"}>
        {order.map((i, pos) => {
          const o = item.options[i];
          const isSel = selected.includes(i);
          let state = isSel ? "selected" : "";
          if (reveal) state = item.correct.includes(i) ? "right" : isSel ? "wrong" : "";
          return (
            <button
              key={i}
              className={`option ${state}`}
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSel}
              disabled={reveal}
              onClick={() => onToggle(i)}
            >
              <span className="opt-key">{String.fromCharCode(65 + pos)}</span>
              {o[lang]}
            </button>
          );
        })}
      </div>
    </>
  );
}

export const shuffledOrder = (item: ChoiceItem) => shuffle(item.options.map((_, i) => i));

export function toggle(selected: number[], i: number, multi: boolean): number[] {
  if (!multi) return [i];
  return selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i];
}

/** Task types 1 and 3 with immediate feedback, explanation and the AI tutor. */
export function ChoiceExercise({ item, onDone }: { item: ChoiceItem; onDone: (correct: boolean) => void }) {
  const { lang, qLang, t } = useStore();
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const order = useMemo(() => shuffledOrder(item), [item]);
  const ok = checked && isCorrect(item, selected);

  return (
    <div className="exercise">
      <ChoiceBody item={item} lang={qLang} selected={selected} onToggle={(i) => setSelected(toggle(selected, i, item.correct.length > 1))} reveal={checked} order={order} />
      {checked && (
        <div className={`feedback ${ok ? "ok" : "bad"}`}>
          <strong>{ok ? `✅ ${t("correct")} +10 XP` : `💭 ${t("wrong")}`}</strong>
          <p>{item.explanation[lang]}</p>
          <Tutor concept={item.concept} context={item.question[lang]} fallback={item.explanation} />
        </div>
      )}
      <div className="actions">
        {!checked ? (
          <button className="btn primary" disabled={!selected.length} onClick={() => setChecked(true)}>
            {t("check")}
          </button>
        ) : (
          <button className="btn primary" onClick={() => onDone(ok)}>
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}
