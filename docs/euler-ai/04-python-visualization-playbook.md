# Euler AI: Python Visualization Playbook

## Purpose
Enable Euler to produce reliable Python visualizations for actuarial risk explanation.

## Recommended Stack

- `pandas` for data shaping
- `numpy` for numerical calculations
- `matplotlib` and `seaborn` for static charts
- `plotly` for interactive dashboards (optional)

## Visualization Use Cases

1. Loss distribution histogram and density
2. Frequency vs severity comparison
3. Claims development over time
4. Sensitivity of premium to assumptions
5. VaR/TVaR threshold visualization

## Output Requirements for Euler

When Euler provides a chart workflow, require:

1. Input data columns list
2. Python code
3. Chart title and axis labels
4. One-paragraph actuarial interpretation
5. Caveats about assumptions and data limitations

## Validation Checklist

- Code runs without import errors
- Values used in chart match provided dataset
- Units/currency are clearly labeled
- Interpretation aligns with visual evidence
- No hidden transformations without explanation
