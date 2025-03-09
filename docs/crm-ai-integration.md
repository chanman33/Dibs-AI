# CRM AI Integration

This document explains how the AI agent integrates with the CRM system to provide intelligent responses about client data.

## Overview

The CRM AI integration allows users to query client information using natural language. The AI agent can:

- Retrieve client information by ID, name, or email
- Find clients with a specific status
- Identify clients with upcoming follow-ups
- Provide property information related to clients

## How It Works

1. The user sends a message to the AI agent through the chat interface
2. The system analyzes the message for CRM-related queries using pattern matching
3. If a CRM query is detected, the system retrieves the relevant data from the database
4. The AI agent receives the CRM data along with the user's message
5. The AI agent formulates a response that incorporates the CRM data

## Query Examples

Users can ask questions about clients in various ways:

### Client Lookup

- "Tell me about client John Smith"
- "What do you know about Sarah Johnson?"
- "Show me information about client with id 123"
- "Find client with email john@example.com"
- "What's the status of Anthony Young's account?"
- "Find Anthony Young in the CRM"
- "Look up Emily Parker"

### Status Queries

- "Show me all active clients"
- "How many clients have status Lead?"
- "List closed status clients"

### Follow-up Queries

- "Who needs follow-ups in the next 7 days?"
- "Show clients with follow-ups within 14 days"
- "Which clients require follow-ups this week?"

### Property Queries

- "What do you know about John Smith's property?"
- "Tell me about Sarah Johnson's property details"
- "What property is Anthony Young interested in?"

## Technical Implementation

The integration consists of several components:

1. **CRM Tool** (`lib/tools/crm-tool.ts`): A class that provides methods for querying the CRM database
2. **CRM API Route** (`app/api/tools/crm/route.ts`): An API endpoint for direct CRM data access
3. **Chat Integration** (`app/api/chat/route.ts`): Logic to detect CRM queries in user messages and enhance AI responses

### Pattern Matching

The system uses regular expressions to detect CRM-related queries in user messages. These patterns are defined in the `processCRMQueries` function in `app/api/chat/route.ts`.

### Data Flow

1. User sends a message
2. `processCRMQueries` analyzes the message for CRM patterns
3. If a match is found, the appropriate CRM Tool method is called
4. The retrieved data is formatted as JSON
5. The data is added to the AI system prompt
6. The AI generates a response incorporating the CRM data

## Test Data

The system includes a set of test client data that can be used to test the CRM integration. The test data includes the following clients:

1. **Anthony Young**
   - Status: Active
   - Looking for a 3-bedroom house in the suburbs
   - Budget: $300,000 - $450,000
   - Property type: Single Family

2. **Emily Parker**
   - Status: Lead
   - Interested in downtown condos
   - Budget: $200,000 - $350,000
   - Property type: Condo

3. **Robert Johnson**
   - Status: Closed
   - Purchased a 4-bedroom house in Oakwood
   - Budget: $400,000 - $600,000
   - Property type: Single Family

4. **Jennifer Smith**
   - Status: Active
   - Looking for investment properties
   - Budget: $150,000 - $250,000
   - Property type: Multi-Family

5. **David Miller**
   - Status: Lost
   - Was looking for a luxury condo but decided to rent instead
   - Budget: $500,000 - $750,000
   - Property type: Condo

### Seeding Test Data

To seed the test data, make a GET request to the following endpoint:

```
GET /api/tools/crm/seed
```

This endpoint is only available in development mode. It will check if there are existing clients in the database, and if not, it will seed the test data.

## Extending the Integration

To add new query types:

1. Add new pattern matching in the `processCRMQueries` function
2. Implement any necessary methods in the `CRMTool` class
3. Update the system prompt instructions to guide the AI on how to use the new data

## Troubleshooting

If the AI agent isn't recognizing CRM queries:

1. Check the pattern matching in `processCRMQueries`
2. Verify that the CRM database contains the requested data
3. Look for errors in the server logs
4. Make sure the test data has been seeded (in development mode)

### Debug Logging

The CRM tool includes comprehensive debug logging that can help troubleshoot issues. Debug logs are only printed in development mode and include:

- Query parameters and results
- Database errors
- Pattern matching results

To view the debug logs, check the server console when making CRM-related queries.

## Advanced Features

For more complex queries, consider implementing a more sophisticated natural language understanding system. The current implementation uses regular expressions for pattern matching, which works well for common queries but may not handle more complex or ambiguous requests. 