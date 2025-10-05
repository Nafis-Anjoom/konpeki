import { useState, useEffect, useRef, useCallback } from 'react';
import { getTransactions, addTransaction, getRules, addRule, reapplyRules, transcribeAudio, generateDsl } from './api';

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

function App() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [newTransaction, setNewTransaction] = useState<Omit<ITransaction, 'id'>>({
    merchant: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    account: '',
    category: '',
  });
  const [ruleDefinitionInput, setRuleDefinitionInput] = useState<string>(`transaction.merchant === "Walmart" && dayOfWeek(transaction.date) === 6 && transaction.amount < 80 -> "Hardware"`);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reapplyMessage, setReapplyMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State for audio recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // Use useRef for audio chunks
  const [transcribedText, setTranscribedText] = useState<string>('');
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const accountOptions = ["Checking", "Savings", "Credit Card", "Investment"];
  const merchantOptions = ["Walmart", "Target", "Starbucks", "Amazon", "Local Grocer", "Gas Station"];

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Clear after 5 seconds
  }, [setNotification]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
      const fetchedRules = await getRules();
      setRules(fetchedRules);
    } catch (err: Error) {
      console.error('Error fetching data:', err);
      setError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [setTransactions, setRules, setLoading, setError, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startRecording = async () => {
    console.log('Attempting to start recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log('MediaStream obtained:', stream);

      // Check for supported mime types
      const supportedMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg',
        'audio/wav',
        'audio/mpeg',
      ];
      let mimeType = '';
      for (const type of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported audio MIME type found for MediaRecorder.');
      }

      console.log('Using MIME type:', mimeType);
      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);
      audioChunksRef.current = []; // Clear chunks using ref
      setTranscribedText(''); // Clear previous transcription

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('ondataavailable fired with data size:', event.data.size);
          audioChunksRef.current.push(event.data); // Push to ref
        } else {
          console.log('ondataavailable fired with empty data.');
        }
      };

      recorder.onstop = async () => {
        console.log('MediaRecorder stopped. Total chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType }); // Use ref to create Blob
        console.log('Audio Blob created:', audioBlob.type, audioBlob.size, audioBlob);

        if (audioBlob.size === 0) {
          showNotification('Recording resulted in empty audio. Please ensure microphone is active and speaking.', 'error');
          return;
        }

        try {
          showNotification('Transcribing audio...', 'success');
          const result = await transcribeAudio(audioBlob);
          setTranscribedText(result.transcript);
          setNaturalLanguageInput(result.transcript); // Populate natural language input with transcript
          showNotification('Audio transcribed successfully!', 'success');
        } catch (err: Error) {
          console.error('Error during transcription:', err);
          showNotification(err.message || 'Failed to transcribe audio.', 'error');
        }
      };

      recorder.start();
      setIsRecording(true);
      showNotification('Recording started...', 'success');
    } catch (err: Error) {
      console.error('Error starting recording:', err);
      showNotification(err.message || 'Failed to start recording.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      console.log('Stopping recording...');
      mediaRecorder.stop();
      setIsRecording(false);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop()); // Stop microphone access
      showNotification('Recording stopped.', 'success');
    }
  };

  const handleGenerateDsl = async () => {
    if (!naturalLanguageInput.trim()) {
      showNotification('Please enter natural language text to generate DSL.', 'error');
      return;
    }
    try {
      showNotification('Generating DSL...', 'success');
      const result = await generateDsl(naturalLanguageInput);
      setRuleDefinitionInput(result.dsl);
      showNotification('DSL generated successfully!', 'success');
    } catch (err: Error) {
      console.error('Error generating DSL:', err);
      showNotification(err.message || 'Failed to generate DSL.', 'error');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction(newTransaction);
      setNewTransaction({
        merchant: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        account: '',
        category: '',
      });
      fetchData(); // Refresh data
      showNotification('Transaction added successfully!', 'success');
    } catch (err: Error) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRule({ ruleDefinition: ruleDefinitionInput });
      setRuleDefinitionInput(`transaction.merchant === "Walmart" && dayOfWeek(transaction.date) === 6 && transaction.amount < 80 -> "Hardware"`);
      fetchData(); // Refresh data
      showNotification('Rule added successfully!', 'success');
    } catch (err: Error) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleReapplyRules = async () => {
    try {
      const result = await reapplyRules();
      setReapplyMessage(result.message);
      fetchData(); // Refresh data to show updated categories
      showNotification(result.message, 'success');
    } catch (err: Error) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Smart Transaction Categorizer</h1>

      {notification && (
        <div
          className={`p-3 rounded mb-4 text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      {reapplyMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{reapplyMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transactions Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
          <form onSubmit={handleAddTransaction} className="bg-white p-4 rounded shadow-md mb-6">
            <h3 className="text-xl font-medium mb-3">Add New Transaction</h3>
            <div className="mb-2">
              <select
                value={newTransaction.merchant}
                onChange={(e) => setNewTransaction({ ...newTransaction, merchant: e.target.value })}
                className="border p-2 w-full rounded"
                required
              >
                <option value="" disabled>Select Merchant</option>
                {merchantOptions.map((merchant) => (
                  <option key={merchant} value={merchant}>{merchant}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div className="mb-2">
              <select
                value={newTransaction.account}
                onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                className="border p-2 w-full rounded"
                required
              >
                <option value="" disabled>Select Account</option>
                {accountOptions.map((account) => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Category (initial)"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Transaction
            </button>
          </form>

          <h3 className="text-xl font-medium mb-3">Existing Transactions</h3>
          <ul className="bg-white p-4 rounded shadow-md">
            {transactions.length === 0 ? (
              <li className="text-gray-500">No transactions yet.</li>
            ) : (
              transactions.map((t) => (
                <li key={t.id} className="border-b last:border-b-0 py-2">
                  <p><strong>{t.merchant}</strong> - ${t.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{t.date} | {t.account} | Category: <span className="font-semibold">{t.category}</span></p>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Rules Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Rules</h2>
          <form onSubmit={handleAddRule} className="bg-white p-4 rounded shadow-md mb-6">
            <h3 className="text-xl font-medium mb-3">Add New Rule</h3>

            {/* Level 3: Voice Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Voice Input (Whisper)</label>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              {transcribedText && (
                <p className="mt-2 text-sm text-gray-700">Transcribed: <span className="font-mono">{transcribedText}</span></p>
              )}
            </div>

            {/* Level 2: Natural Language Input (Gemini) */}
            <div className="mb-4">
              <label htmlFor="naturalLanguageInput" className="block text-gray-700 text-sm font-bold mb-2">
                Natural Language Rule (Gemini)
              </label>
              <textarea
                id="naturalLanguageInput"
                placeholder='e.g., "Categorize transactions from Starbucks as Coffee if amount is less than 10"'
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="border p-2 w-full rounded font-mono text-sm"
                rows={4}
              ></textarea>
              <button
                type="button"
                onClick={handleGenerateDsl}
                className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Generate Rule from Natural Language
              </button>
            </div>

            {/* Level 1: Direct DSL Input */}
            <div className="mb-2">
              <label htmlFor="ruleDefinitionInput" className="block text-gray-700 text-sm font-bold mb-2">
                DSL Rule (Direct Input)
              </label>
              <textarea
                id="ruleDefinitionInput"
                placeholder='Enter DSL Rule (e.g., transaction.merchant === "Walmart" && dayOfWeek(transaction.date) === 6 -> "Shopping")'
                value={ruleDefinitionInput}
                onChange={(e) => setRuleDefinitionInput(e.target.value)}
                className="border p-2 w-full rounded font-mono text-sm"
                rows={8}
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Use <code>transaction.field</code> (e.g., <code>transaction.amount</code>), <code>dayOfWeek(transaction.date)</code>, <code>month(transaction.date)</code>, <code>year(transaction.date)</code>.
                Operators: <code>===</code>, <code>!==</code>, <code>&&</code>, <code>||</code>, <code>&gt;</code>,<code>&lt;</code>, etc. String methods like <code>.includes("text")</code> and <code>new RegExp("pattern", "i").test(transaction.field)</code> are also available.
              </p>
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Rule
            </button>
          </form>

          <button
            onClick={handleReapplyRules}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-6 w-full"
          >
            Reapply All Rules
          </button>

          <h3 className="text-xl font-medium mb-3">Existing Rules</h3>
          <ul className="bg-white p-4 rounded shadow-md">
            {rules.length === 0 ? (
              <li className="text-gray-500">No rules yet.</li>
            ) : (
              rules.map((r) => {
                const parts = r.ruleDefinition.split('->');
                const conditionPart = parts[0] ? parts[0].trim() : '';
                const newCategoryPart = parts[1] ? parts[1].trim().replace(/^"|"$/g, '') : 'N/A';
                return (
                  <li key={r.id} className="border-b last:border-b-0 py-2">
                    <p><strong>New Category:</strong> {newCategoryPart}</p>
                    <div className="relative group">
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto pr-10">{conditionPart}</pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(r.ruleDefinition)}
                        className="absolute top-1 right-1 bg-gray-200 p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy rule to clipboard"
                      >
                        Copy
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
