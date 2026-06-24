"""Append English explanations for a question range to quiz_first_50_english.json."""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
OUT_PATH = ROOT / "quiz_first_50_english.json"
QUIZ_PATH = ROOT / "quiz.json"


def build_explanation(q: dict, trans: dict) -> str:
    correct = q["correct"]
    lines = [f"Answer: {correct}", "", "--- English Translation ---", f"Question: {trans['question']}"]
    for opt in q["options"]:
        letter = opt["letter"]
        lines.append(f"{letter}: {trans['options'][letter]}")
    lines.extend(["", "--- Keywords ---"])
    lines.extend(trans["keywords"])
    lines.extend(["", "--- Explanation ---", trans["simple"], "", f"Correct answer: {correct}"])
    return "\n".join(lines)


def load_translations(start: int, end: int) -> dict:
    translations: dict = {}
    if start <= 100 and end >= 51:
        from translations_51_100 import TRANSLATIONS_51_100
        translations.update(TRANSLATIONS_51_100)
    if start <= 150 and end >= 101:
        from translations_101_150 import TRANSLATIONS_101_150
        translations.update(TRANSLATIONS_101_150)
    if start <= 200 and end >= 151:
        from translations_151_200 import TRANSLATIONS_151_200
        translations.update(TRANSLATIONS_151_200)
    if start <= 250 and end >= 201:
        from translations_201_250 import TRANSLATIONS_201_250
        translations.update(TRANSLATIONS_201_250)
    if start <= 300 and end >= 251:
        from translations_251_300 import TRANSLATIONS_251_300
        translations.update(TRANSLATIONS_251_300)
    if start <= 309 and end >= 301:
        from translations_301_309 import TRANSLATIONS_301_309
        translations.update(TRANSLATIONS_301_309)
    return translations


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=101)
    parser.add_argument("--end", type=int, default=150)
    args = parser.parse_args()

    translations = load_translations(args.start, args.end)

    with open(QUIZ_PATH, encoding="utf-8") as f:
        quiz = json.load(f)

    quiz_by_id = {q["id"]: q for q in quiz}
    existing = []
    if OUT_PATH.exists():
        with open(OUT_PATH, encoding="utf-8") as f:
            existing = json.load(f)

    existing_ids = {q["id"] for q in existing}
    new_entries = []

    for qid in range(args.start, args.end + 1):
        if qid in existing_ids:
            continue
        if qid not in translations:
            raise KeyError(f"Missing translation for question {qid}")
        if qid not in quiz_by_id:
            raise KeyError(f"Question {qid} not found in quiz.json")

        q = quiz_by_id[qid]
        trans = translations[qid]
        entry = {
            "id": q["id"],
            "text": q["text"],
            "options": q["options"],
            "correct": q["correct"],
            "explanation": build_explanation(q, trans),
        }
        if "image" in q:
            entry["image"] = q["image"]
        new_entries.append(entry)

    combined = existing + new_entries
    combined.sort(key=lambda q: q["id"])

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Appended {len(new_entries)} questions to {OUT_PATH.name} ({len(combined)} total)")

    by_id = {q["id"]: q["explanation"] for q in combined}
    updated = 0
    for q in quiz:
        if q["id"] in by_id:
            q["explanation"] = by_id[q["id"]]
            updated += 1

    with open(QUIZ_PATH, "w", encoding="utf-8") as f:
        json.dump(quiz, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Updated {updated} explanations in quiz.json")

    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "build-quiz.js")],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    print(result.stdout.strip())
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
