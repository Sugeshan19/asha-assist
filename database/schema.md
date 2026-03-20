# ASHA Assist MongoDB Schema

## Collections

### `users`
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: `asha | doctor | admin`
- `phone`: String
- `village`: String
- `district`: String
- `assignedVillages`: String[]
- `isActive`: Boolean
- `lastLogin`: Date
- `createdAt`, `updatedAt`: Date

### `patients`
- `_id`: ObjectId
- `patientId`: String (unique, e.g., `PA00001`)
- `name`: String
- `age`: Number
- `gender`: `male | female | other`
- `phone`: String
- `village`: String
- `district`: String
- `state`: String
- `location`: GeoJSON Point `{ type, coordinates: [lng, lat] }`
- `symptoms`: String[]
- `vitals`: Array of embedded vital records
- `prescriptionPhoto`: String
- `registeredBy`: ObjectId -> `users`
- `lastScreeningId`: ObjectId -> `screenings`
- `currentRiskLevel`: `Low | Medium | High | Unknown`
- `notes`: String
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Date

Indexes:
- `location` as `2dsphere`
- `village`
- `currentRiskLevel`

### `screenings`
- `_id`: ObjectId
- `patient`: ObjectId -> `patients`
- `conductedBy`: ObjectId -> `users`
- `symptoms`: String[]
- `vitals`: Object
- `inputMethod`: `text | voice | form`
- `rawVoiceInput`: String
- `aiResult`: Object
  - `diseasePrediction`: String
  - `riskLevel`: `Low | Medium | High`
  - `recommendation`: String
  - `confidence`: Number
  - `differentials`: Array
  - `aiModel`: String
- `doctorReview`: Object
- `alertSent`: Boolean
- `alertId`: ObjectId -> `alerts`
- `status`: `pending | reviewed | resolved`
- `createdAt`, `updatedAt`: Date

Indexes:
- `(patient, createdAt desc)`
- `aiResult.riskLevel`

### `alerts`
- `_id`: ObjectId
- `patient`: ObjectId -> `patients`
- `screening`: ObjectId -> `screenings`
- `alertedBy`: ObjectId -> `users`
- `alertedDoctor`: ObjectId -> `users`
- `alertType`: `sms | push | email | system`
- `message`: String
- `recipientPhone`: String
- `riskLevel`: `Low | Medium | High`
- `disease`: String
- `village`: String
- `twilioSid`: String
- `status`: `sent | failed | pending | acknowledged`
- `errorMessage`: String
- `acknowledgedAt`: Date
- `createdAt`, `updatedAt`: Date

### `villages`
- `_id`: ObjectId
- `name`: String
- `district`: String
- `state`: String
- `location`: GeoJSON Point
- `population`: Number
- `assignedAsha`: ObjectId[] -> `users`
- `phcName`: String
- `phcDistance`: Number
- `stats`: Object
  - `totalPatients`
  - `highRiskCount`
  - `activeCases`
  - `lastUpdated`
- `createdAt`, `updatedAt`: Date

Indexes:
- unique `(name, district)`
- `location` as `2dsphere`
