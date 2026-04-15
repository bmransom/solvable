\ Production Mix Problem
\ A factory produces two products (x and y).
\ Each unit of x earns $5 profit, each unit of y earns $4.
\ Production is limited by capacity, machine time, and labor.
Maximize
  profit: 5 x + 4 y
Subject To
  capacity: x + y <= 10
  machine_time: 2 x + y <= 14
  labor: x + 3 y <= 18
Bounds
  0 <= x
  0 <= y
End
