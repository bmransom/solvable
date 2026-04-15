\ Transportation Problem
\ Ship goods from 2 warehouses to 3 stores at minimum cost.
\ Each warehouse has limited supply, each store has a demand to meet.
Minimize
  cost: 4 x11 + 8 x12 + 1 x13
      + 7 x21 + 3 x22 + 5 x23
Subject To
  supply1: x11 + x12 + x13 <= 300
  supply2: x21 + x22 + x23 <= 500
  demand1: x11 + x21 >= 200
  demand2: x12 + x22 >= 250
  demand3: x13 + x23 >= 150
Bounds
  0 <= x11
  0 <= x12
  0 <= x13
  0 <= x21
  0 <= x22
  0 <= x23
End
