# AI-Powered Transaction Analysis System

A **NestJS** backend that analyzes financial transactions using **OpenAI**. It:

1. **Normalizes Merchants**: Maps raw transaction descriptions to structured merchant info (merchant name, category, subcategory, etc.).  
2. **Detects Patterns**: Identifies recurring charges, subscriptions, and other patterns.  
3. **Processes CSV Files**: Accepts CSV uploads for bulk analysis.  
4. **Provides Summary Statistics**: Returns total spend, transaction count, average transaction, and distinct merchants.

---

## Features

- **Endpoints**
  - **`POST /api/upload`**  
    - Accepts a CSV file (via `multipart/form-data`).  
    - Returns a JSON object containing:
      1. **`normalized_transactions`**: Array of `{ original, normalized }`  
      2. **`detected_patterns`**: Recurring or subscription patterns  
      3. **`summary`**: `{ totalSpend, transactions, avgTransaction, merchants }`
  - **`POST /api/analyze/merchant`** (optional)  
    - Normalizes one or more transaction descriptions.  
  - **`POST /api/analyze/patterns`** (optional)  
    - Detects recurring patterns in a given set of transactions.

- **OpenAI Integration**  
  - Utilizes GPT-3.5 or higher models to interpret transaction data.  
  - Low `temperature` for consistent, stable outputs.

- **Scalable Architecture**  
  - **NestJS** for modular, testable structure  
  - Flexible for microservices or serverless deployment

---

## Requirements

- **Node.js** (version 16+ recommended)  
- **npm** or **yarn**  
- **OpenAI API Key** (in a `.env` or environment variable)  
- (Optional) **Docker** if container-based deployment is desired

### Environment Variables

Create a `.env` file at your project root. For example:
OPENAI_API_KEY=your-api-key-here PORT=3000

> **Note**: Keep your OpenAI API key private. Do **not** commit it to version control.



