# Tier 2 Assessment Scoring System

## Overview
The Tier 2 Full Readiness Matrix uses a weighted scoring system across 3 pillars with 20 total dimensions.

## Scoring Structure

### Maturity Levels & Points
- **Basic**: 1 point
- **Emerging**: 2 points
- **Established**: 3 points
- **World Class**: 4 points

### Pillars & Dimensions

#### 1. Digitalization (9 dimensions)
- Data Foundation
- FAIR Data
- Governance and Stewardship
- Cybersecurity
- Physical-to-Digital Identification Systems
- Digital Workflows
- Smart Lab
- Centralized R&D Analytics and Dashboards
- AI/ML

**Max Raw Score**: 36 (9 dimensions × 4 points)

#### 2. Transformation (5 dimensions)
- Executive Sponsorship
- Digital Literacy and Upskilling
- Collaborative Digital Mindset
- Knowledge Management
- Change Management

**Max Raw Score**: 20 (5 dimensions × 4 points)

#### 3. Value Scaling (6 dimensions)
- Market and Product Insights Integration
- Supplier and Procurement Integration
- Customer-Centric Digitalization
- Manufacturing and Operations 4.0 Enablement
- External Partnerships, Digital Ecosystem

**Max Raw Score**: 24 (6 dimensions × 4 points)

## Score Calculation Formula

### 1. Raw Scores
- S1 = Digitalization raw score (0-36)
- S2 = Transformation raw score (0-20)
- S3 = Value Scaling raw score (0-24)
- Total Raw Score = S1 + S2 + S3 (0-80)

### 2. Weighted Raw Score
**Formula**: `S = w1 × (S1/S1_Max) + w2 × (S2/S2_Max) + w3 × (S3/S3_Max)`

Where:
- w1 = 0.4 (Digitalization weight)
- w2 = 0.3 (Transformation weight)
- w3 = 0.3 (Value Scaling weight)
- S1_Max = 36
- S2_Max = 20
- S3_Max = 24

**Result**: Weighted score from 0 to 1

### 3. Normalized Score
Convert weighted score (0-1) to percentage (0-100)

**Formula**: `Normalized Score = S × 100`

### 4. Normalized Shifted Score
Apply shift baseline to avoid scores below 20

**Formula**: `S_Norm = S_Base + (100 - S_Base) × S`

Where:
- S_Base = 20 (shift baseline)
- S = weighted score (0-1)

**Result**: Final score from 20 to 100

## Maturity Level Mapping

Based on Normalized Shifted Score:

| Score Range | Maturity Level | Scenario |
|------------|----------------|----------|
| 100 | World Class | World Class |
| 90-99 | World Class | Established/World Class |
| 80-89 | Established | Established |
| 70-79 | Established | Emerging/Established |
| 60-69 | Emerging | Emerging |
| 50-59 | Emerging | Basic/Emerging |
| 20-49 | Basic | Completely Basic |

## Example Calculation

**Scenario**: Organization with mixed maturity

Raw Scores:
- Digitalization: 18/36
- Transformation: 10/20
- Value Scaling: 12/24
- Total Raw: 40/80

Weighted Score:
```
S = 0.4 × (18/36) + 0.3 × (10/20) + 0.3 × (12/24)
S = 0.4 × 0.5 + 0.3 × 0.5 + 0.3 × 0.5
S = 0.2 + 0.15 + 0.15
S = 0.50
```

Normalized Score: 50

Normalized Shifted Score:
```
S_Norm = 20 + (100 - 20) × 0.50
S_Norm = 20 + 80 × 0.50
S_Norm = 20 + 40
S_Norm = 60
```

**Final Score**: 60 → **Emerging** maturity level

## Implementation

The scoring system is implemented in `/src/utils/tier2ScoreCalculator.ts` and automatically:
1. Calculates raw scores per pillar
2. Applies weighted formula
3. Normalizes to 0-100 scale
4. Applies shift baseline
5. Determines maturity level and scenario
6. Stores complete score breakdown in database
