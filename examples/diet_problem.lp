\ Diet Problem
\ Find the cheapest combination of foods that meets
\ minimum nutritional requirements for protein, fat, and carbs.
Minimize
  cost: 2 bread + 3.5 milk + 8 cheese + 1.5 potato + 4.2 fish + 2.3 maize
Subject To
  protein: 0.1 bread + 0.15 milk + 0.25 cheese + 0.05 potato
           + 0.3 fish + 0.08 maize >= 55
  fat: 0.05 bread + 0.1 milk + 0.2 cheese + 0.02 potato
       + 0.15 fish + 0.04 maize >= 33
  carbs: 0.4 bread + 0.05 milk + 0.02 cheese + 0.3 potato
         + 0.01 fish + 0.35 maize >= 70
Bounds
  0 <= bread <= 10
  0 <= milk <= 10
  0 <= cheese <= 10
  0 <= potato <= 10
  0 <= fish <= 10
  0 <= maize <= 10
End
