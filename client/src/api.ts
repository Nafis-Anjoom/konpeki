const API_BASE_URL = 'http://localhost:3000/api'; // Assuming your backend runs on port 3000

interface ITransaction {
  id?: string;
  merchant: string;
  amount: number;
  date: string;
  account: string;
  category: string;
}

interface IRule {
  id?: string;
  ruleDefinition: string; // Changed to string for DSL
}

export const getTransactions = async (): Promise<ITransaction[]> => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export const addTransaction = async (transaction: Omit<ITransaction, 'id'>): Promise<ITransaction> => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    throw new Error('Failed to add transaction');
  }
  return response.json();
};

export const getRules = async (): Promise<IRule[]> => {
  const response = await fetch(`${API_BASE_URL}/rules`);
  if (!response.ok) {
    throw new Error('Failed to fetch rules');
  }
  return response.json();
};

export const addRule = async (rule: Omit<IRule, 'id'>): Promise<IRule> => {
  const response = await fetch(`${API_BASE_URL}/rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rule),
  });
  if (!response.ok) {
    throw new Error('Failed to add rule');
  }
  return response.json();
};

export const reapplyRules = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/reapply-rules`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reapply rules');
  }
  return response.json();
};

export const transcribeAudio = async (audioBlob: Blob): Promise<{ transcript: string }> => {
  const response = await fetch(`${API_BASE_URL}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': audioBlob.type,
    },
    body: audioBlob,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to transcribe audio');
  }
  return response.json();
};

export const generateDsl = async (naturalLanguageText: string): Promise<{ dsl: string }> => {
  const response = await fetch(`${API_BASE_URL}/generate-dsl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ naturalLanguageText }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate DSL');
  }
  return response.json();
};