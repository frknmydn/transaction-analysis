AI-Powered Transaction Analysis System
A NestJS backend that analyzes financial transactions using OpenAI. It:

Normalizes Merchants: Maps raw transaction descriptions to structured merchant info (merchant name, category, subcategory, etc.).
Detects Patterns: Identifies recurring charges, subscriptions, and other patterns.
Processes CSV Files: Accepts CSV upload for bulk analysis.
Provides Summary Statistics: Returns total spend, transaction count, average transaction, and distinct merchants.
Features
Endpoints

POST /api/upload:
Accepts a CSV file (multipart/form-data).
Returns a JSON object containing:
normalized_transactions: Array of { original, normalized }
detected_patterns: Array of recurring or subscription patterns
summary: { totalSpend, transactions, avgTransaction, merchants }
POST /api/analyze/merchant (optional): Normalizes a single or batch of transaction descriptions.
POST /api/analyze/patterns (optional): Detects recurring patterns in a given set of transactions.
OpenAI Integration

Utilizes GPT-3.5 or later models to interpret transaction data.
Low temperature for consistent, stable outputs.
Scalable Architecture

NestJS for modular, testable backend structure
Potential for microservices or serverless deployment
Requirements
Node.js (v16+ recommended)
npm or yarn
OpenAI API Key
(Optional) Docker if you want container-based deployment
Environment Variables
Create a .env file in the project root containing your OpenAI key and any other configs (example below). Make sure not to commit your actual key to version control:

bash
Kopyala
Düzenle
OPENAI_API_KEY=your-api-key-here
PORT=3000
Installation
Clone this repository:
bash
Kopyala
Düzenle
git clone https://github.com/your-username/transaction-analysis.git
cd transaction-analysis
Install dependencies:
bash
Kopyala
Düzenle
npm install
# or
yarn
Run in development:
bash
Kopyala
Düzenle
npm run start:dev
# or
yarn start:dev
This starts the NestJS server on http://localhost:3000 (configurable in .env).
Usage
1. Upload a CSV
Send a POST request to /api/upload with multipart/form-data containing your CSV file:

Example using curl:

bash
Kopyala
Düzenle
curl -X POST -F "file=@path/to/transactions.csv" http://localhost:3000/api/upload
2. Sample Response
A successful response (HTTP 200) will look like:

json
Kopyala
Düzenle
{
  "normalized_transactions": [
    {
      "original": "AMZN MKTP US*Z1234ABC",
      "normalized": {
        "merchant": "Amazon",
        "category": "Shopping",
        "subCategory": "Online Retail",
        "confidence": 0.95,
        "isSubscription": false,
        "flags": []
      }
    },
    {
      "original": "NETFLIX",
      "normalized": {
        "merchant": "Netflix",
        "category": "Entertainment",
        "subCategory": "Streaming Service",
        "confidence": 0.98,
        "isSubscription": true,
        "flags": ["subscription"]
      }
    }
  ],
  "detected_patterns": [
    {
      "type": "subscription",
      "merchant": "Netflix",
      "amount": 19.99,
      "frequency": "monthly",
      "confidence": 0.98,
      "next_expected": "2024-02-15"
    }
  ],
  "summary": {
    "totalSpend": 955.83,
    "transactions": 26,
    "avgTransaction": 36.76,
    "merchants": 12
  }
}
Fields:

normalized_transactions
Array of objects describing each transaction’s original string and the AI-inferred normalized data.

detected_patterns
Array of detected recurring patterns, e.g. subscriptions or repeated charges.

summary

totalSpend: Total negative-spend amount (e.g., sum of debits).
transactions: Count of (negative) transactions or overall transaction count (configurable logic).
avgTransaction: Average transaction size.
merchants: Number of unique merchants encountered.
Project Structure
bash
Kopyala
Düzenle
src/
  ├─ ai/
  │   ├─ open-ai.module.ts
  │   └─ open-ai.service.ts       
  ├─ merchant-analysis/
  │   ├─ dtos/normalize-merchant.dto.ts
  │   ├─ interfaces/normalized-merchant.interface.ts
  │   └─ merchant-analysis.service.ts
  ├─ pattern-analysis/
  │   ├─ pattern-analysis.service.ts
  └─ upload/
      ├─ upload.controller.ts     
      ├─ upload.module.ts
      ├─ upload.service.ts        