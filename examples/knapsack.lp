\ 0-1 Knapsack Problem
\ Select items to maximize total value without exceeding
\ the knapsack weight capacity of 50 units.
Maximize
  value: 60 item1 + 100 item2 + 120 item3 + 80 item4 + 50 item5
Subject To
  weight: 10 item1 + 20 item2 + 30 item3 + 15 item4 + 25 item5 <= 50
Binary
  item1 item2 item3 item4 item5
End
