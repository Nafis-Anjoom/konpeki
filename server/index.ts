
import { connectDB } from "./db";
import { Transaction, Rule, ITransaction } from "./models";
import cors from "cors";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

const app = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return handleCors(request);
    }

    try {
      // API Routes
      if (path === "/api/transactions" && method === "GET") {
        const transactions = await Transaction.find().sort({ date: -1 });
        return createJsonResponse(transactions);
      }

      if (path === "/api/transactions" && method === "POST") {
        const newTransaction = await request.json();
        const transaction = new Transaction(newTransaction);
        await transaction.save();
        return createJsonResponse(transaction, 201);
      }

      if (path === "/api/rules" && method === "GET") {
        const rules = await Rule.find();
        return createJsonResponse(rules);
      }

      if (path === "/api/rules" && method === "POST") {
        const newRule = await request.json();
        const rule = new Rule(newRule);
        await rule.save();
        return createJsonResponse(rule, 201);
      }

      if (path === "/api/reapply-rules" && method === "POST") {
        const rules = await Rule.find();
        const transactions = await Transaction.find();
        let updatedCount = 0;

        for (const transaction of transactions) {
          let originalCategory = transaction.category;
          for (const rule of rules) {
            if (matchesRule(transaction, rule.conditions)) {
              transaction.category = rule.newCategory;
            }
          }
          if (originalCategory !== transaction.category) {
            await transaction.save();
            updatedCount++;
          }
        }
        return createJsonResponse({ message: `${updatedCount} transactions updated.` });
      }

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("Server Error:", error);
      return createJsonResponse({ message: "Internal Server Error" }, 500);
    }
  },
};

// Rule matching logic
function matchesRule(transaction: ITransaction, conditions: any): boolean {
  if (conditions.merchant && transaction.merchant.toLowerCase() !== conditions.merchant.toLowerCase()) {
    return false;
  }
  if (conditions.dayOfWeek !== undefined && transaction.date.getDay() !== conditions.dayOfWeek) {
    return false;
  }
  if (conditions.maxAmount !== undefined && transaction.amount > conditions.maxAmount) {
    return false;
  }
  if (conditions.account && transaction.account !== conditions.account) {
    return false;
  }
  return true;
}

// CORS handler
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function handleCors(request: Request): Response {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  } else {
    // Handle simple requests
    return new Response(null, {
      headers: {
        Allow: "GET, POST, OPTIONS",
      },
    });
  }
}

function createJsonResponse(body: any, status = 200): Response {
    const response = new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
    });
    return response;
}


console.log(`Server running on port ${PORT}`);

export default app;

