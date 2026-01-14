# Care Phase Model

## Overview

The Care Phase Model is a time-based framework for categorizing mental health resources based on the urgency and timeline of care needed. This model helps crisis workers quickly identify the most appropriate resources for their clients based on where they are in their mental health journey.

**Implementation Reference**: Bead bp95

## Four Care Phases

### 1. Immediate Crisis (0-24 hours)

**Timeline**: Right now to within 24 hours
**Use Case**: Active crisis situations requiring immediate intervention

**Characteristics**:
- Suicidal ideation or attempts
- Psychotic episodes
- Severe panic attacks
- Violent behavior toward self or others
- Acute substance overdose
- Medical emergencies with psychiatric component

**Typical Resources**:
- Crisis hotlines (988, local crisis lines)
- Crisis stabilization units
- Emergency departments
- Mobile crisis teams
- Walk-in crisis centers (24/7)
- Police crisis intervention teams (CIT)

**Key Requirements**:
- Available 24/7
- No appointment needed
- Immediate response capability
- Walk-in or phone access
- Emergency medical clearance available

---

### 2. Acute Support (1-7 days)

**Timeline**: Within the next week
**Use Case**: Urgent but not immediate needs; recent crisis or rapid deterioration

**Characteristics**:
- Recent suicide attempt (stabilized)
- New onset of severe symptoms
- Medication stabilization needs
- Recent psychiatric hospitalization discharge
- Significant life stressors requiring rapid intervention
- Withdrawal from substances (medically stable)

**Typical Resources**:
- Urgent care psychiatric clinics
- Crisis respite centers
- Intensive outpatient programs (IOP)
- Same-day/next-day appointments
- Psychiatric urgent care
- Community mental health crisis teams

**Key Requirements**:
- Appointments within 72 hours
- Assessment and triage capability
- Medication management available
- Bridge to longer-term care
- May accept walk-ins during business hours

---

### 3. Recovery Support (1-12 weeks)

**Timeline**: Within the next 3 months
**Use Case**: Stabilization period following crisis; transitioning to longer-term care

**Characteristics**:
- Post-crisis stabilization
- Step-down from hospitalization
- Developing new coping skills
- Medication adjustment period
- Building support systems
- Working toward symptom management
- Trauma processing (recent events)

**Typical Resources**:
- Outpatient therapy (weekly)
- Partial hospitalization programs (PHP)
- Intensive outpatient programs (IOP)
- Group therapy programs
- Psychiatry follow-up
- Peer support groups
- Case management services
- Sober living facilities

**Key Requirements**:
- Regular appointment availability
- Evidence-based treatment modalities
- Coordination with other providers
- Progress monitoring
- Flexible scheduling
- Insurance accepted or sliding scale

---

### 4. Maintenance (Ongoing/Preventive)

**Timeline**: Long-term wellness and prevention
**Use Case**: Ongoing mental health management; prevention of relapse

**Characteristics**:
- Stable on current treatment
- Managing chronic conditions
- Maintenance therapy
- Medication monitoring
- Relapse prevention
- Wellness and self-care
- Life transitions support
- Preventive mental health care

**Typical Resources**:
- Outpatient therapists (monthly/bi-weekly)
- Psychiatry (quarterly check-ins)
- Wellness programs
- Support groups (NAMI, DBSA, AA/NA)
- Community mental health centers
- Telehealth therapy
- Coaching and life skills programs
- Peer support services

**Key Requirements**:
- Routine appointment scheduling
- Long-term provider relationships
- Preventive focus
- Flexible frequency (monthly, quarterly)
- Lower intensity than crisis care
- Emphasis on quality of life

---

## Implementation in Search

### Filter Behavior

When a user selects a care phase filter, the search results are gated into three tiers:

1. **Primary Tier**: Resources that specialize in the selected care phase
   - Displayed prominently with "Best Match" badge
   - Highest relevance scores
   - Most comprehensive service match

2. **Secondary Tier**: Resources that offer services for the care phase but may not specialize
   - Displayed with "Good Match" badge
   - Moderate relevance scores
   - Partial service match or broader scope

3. **Suppressed Tier**: Resources not appropriate for the selected care phase
   - Not shown in search results
   - Prevents inappropriate referrals
   - Protects client safety

### Phase Transitions

The care phase model acknowledges that clients often transition between phases:

- **Crisis → Acute**: Immediate danger passes, but intensive support still needed
- **Acute → Recovery**: Stabilization achieved, building long-term coping skills
- **Recovery → Maintenance**: Symptoms managed, focus shifts to prevention
- **Maintenance → Crisis**: Relapse or new crisis (requires immediate escalation)

**Search Recommendation**: When in doubt between two adjacent phases, search for the more urgent phase to ensure adequate support level.

### LLM Extraction Guidelines

The LLM filter extraction should identify care phase based on these keywords:

**Immediate Crisis**:
- "emergency", "suicide", "crisis", "immediate", "right now", "urgent help"
- "988", "hotline", "can't wait", "in danger"

**Acute Support**:
- "urgent", "this week", "recent", "just happened", "acute"
- "getting worse", "rapid", "soon", "next few days"

**Recovery Support**:
- "recovery", "stabilizing", "ongoing", "follow-up", "post-crisis"
- "therapy", "counseling", "treatment program", "getting better"

**Maintenance**:
- "preventive", "maintenance", "check-in", "managing", "stable"
- "wellness", "ongoing care", "regular", "long-term"

### Special Considerations

1. **Crisis Safety First**: When uncertainty exists, default to showing immediate crisis resources
2. **Resource Capacity**: Consider resource availability (some crisis centers may have waitlists for acute phase)
3. **Service Overlap**: Many resources serve multiple phases (e.g., IOP for both acute and recovery)
4. **Client Autonomy**: The model guides recommendations but should not prevent clients from accessing other resources if they choose

---

## API Implementation

### Request Example

```typescript
// LLM extraction identifies care phase from query
const filters: CanonicalSearchFilters = {
  care_phase: 'immediate_crisis',
  // ... other filters
};

// Search API uses care_phase to tier results
const response = await fetch(`/api/resources/search?care_phase=immediate_crisis`);
```

### Response Example

```typescript
{
  items: [
    {
      id: 'crisis-center-1',
      name: '24/7 Crisis Center',
      tier: 'primary',  // Best match for immediate_crisis
      match_reasons: [
        {
          field: 'care_phase',
          matched_value: 'immediate_crisis',
          explanation: 'Specializes in immediate crisis intervention'
        }
      ]
    },
    {
      id: 'mental-health-clinic-2',
      name: 'Community Mental Health',
      tier: 'secondary',  // Also offers crisis services but broader scope
      // ...
    }
  ]
}
```

---

## References

- **Bead ID**: bp95
- **Type Definition**: `types/search.ts:60-62`
- **UI Implementation**: `components/crisis/CrisisFilters.tsx:74-103`
- **LLM Extraction**: `app/api/llm/extract-filters/route.ts:25-35`
- **Search API**: `app/api/resources/search/route.ts:24`
- **Tier Display**: `components/crisis/CrisisResourceCard.tsx:39`

## Version History

- **v1.0** (2026-01-13): Initial care phase model specification
