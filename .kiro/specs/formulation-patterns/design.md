# Formulation Patterns - Design

## Overview

Each formulation pattern is a self-contained lesson with a visual problem builder, a formulation generator, and a solve + visualize step. The visual builders are pattern-specific Svelte components (a grid for assignment, a network graph for transportation, etc.) that generate `PlotModel` or LP strings under the hood.

## Architecture

```
Visual Builder (pattern-specific)
        │
        ▼
┌──────────────────┐
│  Formulation      │  Visual interactions → LP constraints
│  Generator        │  (pattern-specific logic)
└────────┬─────────┘
         │
    ┌────┴─────┐
    ▼          ▼
LP String   Plain-English
(for solve) constraint descriptions
    │
    ▼
HiGHS solve → Solution → Map back to visual
```

## Pattern Components

### AssignmentBuilder.svelte
- **Visual**: Grid of rows (items) × columns (slots). Click to assign.
- **Constraints generated**: "Each row has exactly one assignment" (= 1), "Each column has at most one assignment" (<= 1)
- **Variables**: Binary x_{i,j}
- **Example**: 5 engineers assigned to 5 projects, with skill-based cost matrix

### TransportationBuilder.svelte
- **Visual**: Network graph with source nodes (left), sink nodes (right), edges between them. Drag to set capacity/cost on edges.
- **Constraints generated**: Supply limits at sources, demand requirements at sinks, flow conservation
- **Variables**: Continuous flow on each edge
- **Example**: 3 warehouses, 4 stores, shipping costs per unit

### DietBuilder.svelte
- **Visual**: Table of foods (rows) × nutrients (columns) with quantities. Sliders for food amounts.
- **Constraints generated**: Minimum nutrient requirements, maximum food limits
- **Variables**: Continuous amount of each food
- **Example**: Build a meal plan meeting protein/fat/carb requirements

### SchedulingBuilder.svelte
- **Visual**: Gantt chart with draggable task bars, precedence arrows, resource lanes
- **Constraints generated**: Precedence (task A before task B), resource capacity per time period
- **Variables**: Start time for each task (continuous or integer)
- **Example**: 8 construction tasks with dependencies and 2 crews

### FacilityLocationBuilder.svelte
- **Visual**: Map with candidate facility locations (toggleable) and customer locations. Assignment lines from customers to open facilities.
- **Constraints generated**: Open/close binary, capacity at each facility, each customer assigned to one facility, big-M linking
- **Variables**: Binary open/close, continuous assignment
- **Example**: Choose 3 of 6 warehouse locations to minimize shipping cost
- **Special**: Big-M demonstration with LP relaxation quality visualization

### Formulation Checker

For exercise mode: compare student formulation to reference.
- Parse both LP strings
- Check: same number of variables (by type), same number of constraints, same objective sense
- For each reference constraint, find a matching student constraint (same variables, same operator, same RHS within tolerance)
- Report: missing constraints, extra constraints, wrong variable types, wrong objective

This is approximate — formulations can be algebraically different but equivalent. The checker aims for "structurally similar," not "provably equivalent."

## Testing Strategy

- **Generator tests**: For each pattern, construct a visual state, generate LP string, parse it, verify structure
- **Solve tests**: For each pattern's example, solve the generated LP and verify optimal value against known answer
- **Checker tests**: Submit a correct formulation and an incorrect one, verify feedback
