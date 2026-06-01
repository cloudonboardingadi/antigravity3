# Admin API Reference — Sample Request Bodies

This file contains example `curl` commands and JSON payloads for all admin endpoints.
Use the JSON files in this directory as request bodies for bulk operations.

---

## Eligibility Questions

### List all questions
```bash
curl http://localhost:8000/api/admin/eligibility/
```

### Create a single question
```bash
curl -X POST http://localhost:8000/api/admin/eligibility/ \
  -H "Content-Type: application/json" \
  -d '{
    "section": "Basic Hosting & Project Eligibility",
    "title": "Are you planning to host your application/workload within the TCS managed cloud environment operated by the DIS/Platform team?",
    "note": null,
    "question_type": "single",
    "options": ["Yes", "No"],
    "correct_answer": "Yes",
    "fail_message": "DIS Managed Cloud onboarding is only for workloads hosted within the TCS managed cloud environment.",
    "sort_order": 1
  }'
```

### Bulk create questions (seed all 6)
```bash
curl -X POST http://localhost:8000/api/admin/eligibility/bulk \
  -H "Content-Type: application/json" \
  -d @sample_data/eligibility_questions.json
```

### Update a question
```bash
curl -X PUT http://localhost:8000/api/admin/eligibility/{question_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated question title",
    "fail_message": "Updated failure message"
  }'
```

### Delete a single question
```bash
curl -X DELETE http://localhost:8000/api/admin/eligibility/{question_id}
```

### Delete all questions
```bash
curl -X DELETE http://localhost:8000/api/admin/eligibility/
```

---

## Disclaimer Clauses

### List all clauses
```bash
curl http://localhost:8000/api/admin/disclaimer/
```

### Create a single clause
```bash
curl -X POST http://localhost:8000/api/admin/disclaimer/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Infrastructure Governance",
    "text": "All cloud infrastructure is provisioned, owned, and managed exclusively by the DIS/Platform team.",
    "sort_order": 1
  }'
```

### Bulk create clauses (seed all 8)
```bash
curl -X POST http://localhost:8000/api/admin/disclaimer/bulk \
  -H "Content-Type: application/json" \
  -d @sample_data/disclaimer_clauses.json
```

### Update a clause
```bash
curl -X PUT http://localhost:8000/api/admin/disclaimer/{clause_id} \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated clause text"
  }'
```

### Delete a single clause
```bash
curl -X DELETE http://localhost:8000/api/admin/disclaimer/{clause_id}
```

### Delete all clauses
```bash
curl -X DELETE http://localhost:8000/api/admin/disclaimer/
```
