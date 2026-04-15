# Implementation Plan

- [ ] 1. Build the formulation generator framework
  - Create `web/src/formulation/types.ts` with shared types for visual builders
  - Create `web/src/formulation/generator.ts` — base logic for converting visual state to LP string and plain-English constraint descriptions
  - Create `web/src/formulation/checker.ts` — structural comparison of student formulation to reference
  - Write unit tests for the checker with correct and incorrect formulations
  - _Requirements: FORM-2.2, FORM-2.3, FORM-3.2, FORM-3.3, FORM-3.4_

- [ ] 2. Build the Assignment pattern
  - Create `web/src/formulation/AssignmentBuilder.svelte` — grid of items × slots
  - Implement click-to-assign interaction
  - Generate LP string with binary assignment variables and row/column constraints
  - Generate plain-English descriptions
  - Solve and map solution back to visual (highlight assigned cells)
  - Write lesson content for Chapter 4 assignment section
  - _Requirements: FORM-1.1, FORM-1.2, FORM-2.1, FORM-2.2, FORM-2.3_

- [ ] 3. Build the Transportation / Network Flow pattern
  - Create `web/src/formulation/TransportationBuilder.svelte` — source/sink network
  - Implement edge cost/capacity editing
  - Generate LP string with flow variables and supply/demand/conservation constraints
  - Solve and show optimal flow on the network
  - Write lesson content
  - _Requirements: FORM-1.1, FORM-1.2, FORM-2.1, FORM-2.3_

- [ ] 4. Build the Diet / Blending pattern
  - Create `web/src/formulation/DietBuilder.svelte` — foods × nutrients table
  - Implement slider interaction for food amounts
  - Generate LP with continuous food variables and nutrient constraints
  - Connect to the existing diet_problem.lp example for verification
  - Write lesson content
  - _Requirements: FORM-1.1, FORM-1.2, FORM-2.1_

- [ ] 5. Build the Scheduling pattern
  - Create `web/src/formulation/SchedulingBuilder.svelte` — Gantt chart with drag
  - Implement precedence arrows and resource lanes
  - Generate LP with start-time variables and precedence/resource constraints
  - Write lesson content
  - _Requirements: FORM-1.1, FORM-1.2, FORM-2.1_

- [ ] 6. Build the Facility Location pattern with big-M demonstration
  - Create `web/src/formulation/FacilityLocationBuilder.svelte` — map with facilities and customers
  - Implement open/close toggles and assignment lines
  - Generate MIP with binary open/close variables and big-M linking constraints
  - Demonstrate LP relaxation quality: show relaxation bound with M=100 vs M=10000
  - Show solver time/node count difference between tight and loose M
  - Write lesson content emphasizing the big-M danger
  - _Requirements: FORM-1.1, FORM-1.2, FORM-4.1, FORM-4.2, FORM-4.3_

- [ ] 7. Build exercise mode for formulation patterns
  - Create `FormulationExercise.svelte` — problem description + empty editor + submit + feedback
  - Wire the formulation checker to compare student submission to reference
  - Display missing/wrong constraint hints without revealing the answer
  - On correct submission, solve both and verify same optimal value
  - _Requirements: FORM-3.1, FORM-3.2, FORM-3.3, FORM-3.4_
