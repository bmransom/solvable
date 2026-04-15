\ Portfolio Optimization (Simplified)
\ Allocate investment across 4 assets to maximize expected return,
\ subject to diversification and risk constraints.
\ Note: This is a linear approximation — true portfolio optimization
\ uses quadratic programming for the risk term.
Maximize
  expected_return: 0.12 stocks + 0.08 bonds + 0.10 real_estate + 0.05 cash
Subject To
  budget: stocks + bonds + real_estate + cash = 1
  max_risk: stocks + real_estate <= 0.6
  min_bonds: bonds >= 0.2
  min_cash: cash >= 0.05
Bounds
  0 <= stocks <= 0.5
  0 <= bonds <= 0.8
  0 <= real_estate <= 0.3
  0 <= cash <= 1
End
