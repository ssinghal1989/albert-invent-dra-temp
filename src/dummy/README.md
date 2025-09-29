# Dummy Data System

This folder contains all the dummy data and services used for development when Amplify backend is not available.

## Structure

```
src/dummy/
├── data/
│   └── assessmentTemplates.ts    # Assessment template and previous assessment data
├── services/
│   ├── dummyApiService.ts        # Mimics Amplify API service
│   └── dummyAuthService.ts       # Mimics Amplify Auth service
└── README.md                     # This file
```

## Usage

The application automatically uses dummy data when Amplify is not configured. The main service files (`src/services/amplifyService.ts`) contain commented code showing where real Amplify calls would be made.

## Dummy Data Includes

### Assessment Templates
- Complete digital readiness assessment with 10 questions
- 4 maturity levels: Basic, Emerging, Established, World Class
- Proper scoring and section organization

### Previous Assessments
- 2 sample previous assessments with different scores
- Complete response data for testing the "view previous results" feature

### User Data
- Dummy user creation and management
- OTP verification simulation
- Company creation simulation

### Authentication
- Sign up/sign in simulation
- Email domain validation
- Session management

## Switching to Real Backend

To switch to the real Amplify backend:

1. Uncomment the Amplify configuration in `src/main.tsx`
2. Update `src/services/amplifyService.ts` to use real API calls instead of dummy ones
3. Remove or comment out dummy service imports

## Features Supported

- Complete Tier 1 assessment flow
- User registration and login
- OTP verification
- Score calculation and results
- Previous assessment viewing
- Tier 2 scheduling form
- All UI interactions and validations
- Loading states and animations
- Realistic API delays

## Questions Management

### Database Operations
- **Get All Questions**: Retrieve all questions with options
- **Get by Template**: Filter questions by assessment template
- **Get by Section**: Filter questions by section (digitalization, transformation, value_scaling)
- **Save Question**: Create new questions with multiple choice options
- **Update Question**: Modify existing questions and options
- **Delete Question**: Remove questions and associated options
- **Bulk Operations**: Save multiple questions at once

### Question Structure
```typescript
{
  id: string;
  templateId: string;
  sectionId: string;
  order: number;
  kind: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
  prompt: string;
  helpText?: string;
  required: boolean;
  metadata?: any;
  options: Array<{
    id: string;
    label: string;
    value: string;
    score?: number;
  }>;
}
```

### Admin Interface
- **Questions Manager**: Complete CRUD interface for questions
- **Form Validation**: Proper validation for all fields
- **Loading States**: Professional loading indicators
- **Bulk Operations**: Support for multiple question operations

All dummy services include realistic delays to simulate network requests and provide a realistic development experience. The system now includes comprehensive loading states with different delays for different operations:

### Loading Times
- Assessment template loading: 1.2s
- Assessment submission: 2s (scoring calculation)
- User creation: 1s
- OTP verification: 0.8s
- Tier 2 scheduling: 1.5s
- Previous assessments: 1s
- Questions loading: 1s
- Question saving: 1.2s
- Question deletion: 0.6s
- Bulk operations: 2s

## Default Questions Seeding

### Automatic Initialization
The application automatically initializes default questions on startup:
- **TIER1**: 10 comprehensive questions covering digitalization, transformation, and value scaling
- **TIER2**: 8 advanced questions for detailed assessment
- **Templates**: Creates assessment templates for both tiers

### Seeding Operations
- **Initialize**: `seedDataService.initializeDefaultQuestions()`
- **Reset**: `seedDataService.resetToDefaults('TIER1' | 'TIER2' | 'BOTH')`
- **Status**: `seedDataService.getQuestionCounts()`

### Question Structure
Each default question includes:
- Template and section assignment
- 4 maturity levels (Basic, Emerging, Established, World Class)
- Proper scoring (25, 50, 75, 100)
- Help text and metadata
- Pillar and dimension classification

### Loading Times
- **Initialization**: 2s (includes template creation)
- **Reset operations**: 2.5s (deletion + recreation)
- **Status checks**: 0.5s
- **Template creation**: 1s