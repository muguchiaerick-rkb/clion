# Euler AI: Data Requirements and Schema

## 1) Data You Need

## A. Knowledge Data (Documents)
- Actuarial mathematics notes and textbooks you are licensed to use
- Internal actuarial methodology notes
- Formula sheets and standards
- Model validation reports (redacted if needed)

## B. Supervised Training Data
- Q&A pairs (question, method, final answer)
- Worked examples with full derivations
- Error-correction examples (wrong approach -> corrected approach)

## C. Structured Numerical Data
- Mortality/lapse-like tables
- Claims frequency and severity datasets
- Exposure and premium records (anonymized)
- Economic assumptions (interest/inflation scenarios)

---

## 2) Minimum Dataset Package

Create these CSV files:

1. `questions.csv`
2. `worked_examples.csv`
3. `formula_catalog.csv`
4. `risk_scenarios.csv`
5. `visualization_tasks.csv`

---

## 3) Suggested Schemas

## `questions.csv`
- `id`
- `topic`
- `question_text`
- `difficulty`
- `expected_method`
- `expected_answer`
- `assumptions`
- `source_ref`

## `worked_examples.csv`
- `id`
- `topic`
- `problem_statement`
- `solution_steps`
- `final_result`
- `python_snippet`
- `validation_checks`
- `source_ref`

## `formula_catalog.csv`
- `id`
- `formula_name`
- `formula_latex`
- `variables_definition`
- `valid_conditions`
- `actuarial_use_case`
- `source_ref`

## `risk_scenarios.csv`
- `id`
- `line_of_business`
- `exposure`
- `frequency_params`
- `severity_params`
- `dependency_assumption`
- `target_metric` (VaR/TVaR/expected_loss)
- `notes`

## `visualization_tasks.csv`
- `id`
- `task_name`
- `input_columns`
- `chart_type`
- `python_library`
- `interpretation_goal`

---

## 4) Data Quality Rules

- No personally identifiable information
- Units and currency must be explicit
- Include date ranges and version tags
- Keep citation/source link for every row where possible
- Run consistency checks for missing values and invalid ranges

---

## 5) Example Starter Rows

```csv
id,topic,question_text,difficulty,expected_method,expected_answer,assumptions,source_ref
Q1,life_contingencies,"Compute EPV of a 10-year term insurance",medium,"discounted expectation","numeric EPV","constant interest and mortality table","licensed_notes_v1"
```

```csv
id,formula_name,formula_latex,variables_definition,valid_conditions,actuarial_use_case,source_ref
F1,"Net Premium","P = EPV(Benefits)/EPV(Premiums)","P premium; EPV expected present value","level premium setup","life insurance pricing","licensed_notes_v1"
```
