# Requirements Document

## Introduction

Formulation is the hardest skill in optimization for software engineers — translating a messy business problem into variables, constraints, and an objective. This spec covers Chapter 4, which teaches the recurring patterns that cover the vast majority of real-world optimization problems. Each pattern gets an interactive builder where students construct the formulation visually before seeing the LP.

**Depends on**: tutorial-framework, interactive-plot, wasm-solver-core

## Requirements

### Requirement 1: Pattern library with interactive builders

**User Story:** As an SDE learning OR, I want to see common optimization patterns as interactive visual problems, so that when I encounter a similar problem at work I recognize the structure and know how to model it.

#### Acceptance Criteria

1. THE SYSTEM SHALL present at least 6 formulation patterns, each with:
   - A one-paragraph plain-English template describing the problem structure
   - An interactive visual builder specific to the problem type
   - A "Reveal Formulation" toggle showing the LP alongside the visual
   - A solve-and-visualize step showing the solution mapped back to the visual
2. THE SYSTEM SHALL include these patterns:
   - **Assignment**: N items to M slots, each item assigned to exactly one slot (e.g., tasks to workers)
   - **Covering / Packing**: Select subsets to cover all requirements or fit within capacity (e.g., shift scheduling)
   - **Network Flow / Transportation**: Ship goods from sources to sinks along edges with capacities (e.g., warehouse → store routing)
   - **Blending / Diet**: Mix ingredients to meet requirements at minimum cost
   - **Scheduling**: Order tasks with precedence constraints and resource limits
   - **Facility Location**: Choose which facilities to open and assign customers (combines binary decisions with continuous flows)

### Requirement 2: Visual-first, math-second

**User Story:** As an engineer who thinks in systems, not equations, I want to build the model visually first and see the LP emerge from my choices, so that the math feels like a natural encoding of what I already understand.

#### Acceptance Criteria

1. WHEN a pattern is presented THE SYSTEM SHALL show the visual problem FIRST (e.g., a grid for assignment, a network for transportation) with NO LP notation visible
2. WHEN the student interacts with the visual builder (e.g., draws edges, assigns items) THE SYSTEM SHALL generate constraint descriptions in plain English beneath each action (e.g., "Each worker gets exactly one task")
3. WHEN the student clicks "Show the Math" THE SYSTEM SHALL reveal the LP formulation with variable names, constraints, and objective that map one-to-one to the visual elements — variables highlighted in the same color as the visual elements they represent
4. WHEN the LP is revealed THE SYSTEM SHALL allow the student to edit the LP and re-solve, seeing changes reflected in the visual

### Requirement 3: Build-it-yourself exercises

**User Story:** As a student practicing formulation, I want to try building a model myself before seeing the answer, so that I develop the skill of translating problems to math.

#### Acceptance Criteria

1. WHEN a pattern lesson includes an exercise THE SYSTEM SHALL present a problem description and an empty formulation builder
2. WHEN the student submits their formulation THE SYSTEM SHALL compare it to a reference solution — checking structural equivalence (correct variables, constraints covering the right logic), not syntactic equality
3. WHEN the student's formulation is incorrect THE SYSTEM SHALL highlight which constraint or variable is missing or wrong, with a hint (not the full answer)
4. WHEN the student's formulation is correct THE SYSTEM SHALL solve both formulations and verify they produce the same optimal value

### Requirement 4: Big-M warning

**User Story:** As an engineer who will inevitably reach for big-M formulations, I want to understand why they're dangerous before I use them in production, so that I avoid a common performance pitfall.

#### Acceptance Criteria

1. WHEN the facility location pattern is introduced THE SYSTEM SHALL demonstrate big-M constraints ("if facility is open, then capacity is available")
2. WHEN demonstrating big-M THE SYSTEM SHALL show the LP relaxation quality with a tight M vs. a loose M — visualize how the relaxation bound weakens with larger M
3. WHEN the LP relaxation bound is weak THE SYSTEM SHALL show the solver taking significantly more time (or more branch-and-bound nodes) to solve the MIP
