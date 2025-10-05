import { getTransactions, addTransaction, getRules, addRule, reapplyRules, generateDsl } from './controllers';

interface Request {
  url: string;
  method: string;
  body?: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => void;
}

export const handleRequest = async (req: Request, res: Response) => {
  if (req.url === '/api/transactions' && req.method === 'GET') {
    const transactions = await getTransactions();
    res.status(200).json(transactions);
  } else if (req.url === '/api/transactions' && req.method === 'POST') {
    const newTransaction = await addTransaction(req.body);
    res.status(201).json(newTransaction);
  } else if (req.url === '/api/rules' && req.method === 'GET') {
    const rules = await getRules();
    res.status(200).json(rules);
  } else if (req.url === '/api/rules' && req.method === 'POST') {
    const newRule = await addRule(req.body);
    res.status(201).json(newRule);
  } else if (req.url === '/api/reapply-rules' && req.method === 'POST') {
    const result = await reapplyRules();
    res.status(200).json(result);
  } else if (req.url === '/api/generate-dsl' && req.method === 'POST') {
    if (!req.body || !req.body.naturalLanguageText) {
      return res.status(400).json({ message: 'Missing naturalLanguageText in request body.' });
    }
    try {
      const { dsl } = await generateDsl(req.body.naturalLanguageText);
      res.status(200).json({ dsl });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to generate DSL.' });
    }
  } else {
    res.status(404).json({ message: 'Not Found' });
  }
};