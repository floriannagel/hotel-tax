'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react'; // Using lucide-react for icons

const Home = () => {
  // --- State Management ---
  // Store an array of input objects, each with a unique id and a value
  const [inputs, setInputs] = useState([{ id: 1, value: '' }]);
  // A ref to keep track of the next unique ID for new inputs
  const nextId = useRef(2);

  // Store the formatted result parts
  const [result, setResult] = useState({ number: '0.00', currency: '€' });
  // Store any validation error messages
  const [error, setError] = useState('');
  // Control the visibility of the output card
  const [isResultVisible, setIsResultVisible] = useState(false);

  // --- Currency Formatter ---
  // Using de-DE locale for proper Euro formatting (e.g., 1.234,56 €)
  const currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- Input Handlers ---
  const handleInputChange = (id: number, value: string) => {
    const newInputs = inputs.map((input) =>
      input.id === id ? { ...input, value } : input
    );
    setInputs(newInputs);
    // Clear error message when user starts typing
    if (error) setError('');
  };

  const addInput = () => {
    setInputs([...inputs, { id: nextId.current, value: '' }]);
    nextId.current += 1;
  };

  const removeInput = (id: number) => {
    // Prevent removing the last input field
    if (inputs.length > 1) {
      setInputs(inputs.filter((input) => input.id !== id));
    }
  };

  // --- Main Calculation Function ---
  const handleCalculation = () => {
    let sum = 0;
    let hasError = false;

    for (const input of inputs) {
      // Treat empty inputs as zero
      if (input.value.trim() === '') continue;

      // Replace comma with a period for correct parsing
      const sanitizedValue = input.value.replace(',', '.');
      const numericValue = parseFloat(sanitizedValue);

      // Validate the input
      if (isNaN(numericValue) || numericValue < 0) {
        setError(
          'Bitte stellen Sie sicher, dass alle Beträge gültige, positive Zahlen sind.'
        );
        setIsResultVisible(false);
        hasError = true;
        break; // Stop on the first error
      }
      sum += numericValue;
    }

    if (hasError) return;

    // If validation passes, clear any previous error
    setError('');

    // Multiply the total sum by 0.05
    const finalResultValue = (sum / inputs.length) * 0.05;

    // Format the final result into its constituent parts
    const parts = currencyFormatter.formatToParts(finalResultValue);
    let currencySymbol = '€';
    let numberValue = '';

    parts.forEach((part) => {
      if (part.type === 'currency') {
        currencySymbol = part.value;
      } else if (
        ['integer', 'group', 'decimal', 'fraction'].includes(part.type)
      ) {
        numberValue += part.value;
      }
    });

    // Update state with the new result and make it visible
    setResult({ number: numberValue, currency: currencySymbol });
    setIsResultVisible(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-md space-y-6">
        {/* Input Card */}
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Hotel City Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.map((input, index) => (
              <div key={input.id} className="flex items-center space-x-2">
                <div className="flex-grow space-y-1">
                  <Label
                    htmlFor={`amount-input-${input.id}`}
                    className="sr-only"
                  >
                    Betrag {index + 1}
                  </Label>
                  <Input
                    id={`amount-input-${input.id}`}
                    type="text" // Use text to allow comma input
                    inputMode="decimal" // Suggest numeric keyboard on mobile
                    placeholder={`Betrag ${index + 1} (€)`}
                    value={input.value}
                    onChange={(e) =>
                      handleInputChange(input.id, e.target.value)
                    }
                    className={
                      error ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInput(input.id)}
                  disabled={inputs.length <= 1}
                  aria-label="Betrag entfernen"
                >
                  <Trash2
                    className={`h-4 w-4 ${inputs.length <= 1 ? 'text-slate-300' : 'text-slate-500'}`}
                  />
                </Button>
              </div>
            ))}
            {error && <p className="pt-1 text-sm text-red-500">{error}</p>}

            <Button
              variant="outline"
              onClick={addInput}
              className="flex w-full items-center gap-2 text-slate-600"
            >
              <PlusCircle className="h-4 w-4" />
              Betrag hinzufügen
            </Button>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCalculation} className="w-full">
              Berechnen
            </Button>
          </CardFooter>
        </Card>

        {/* Output Card - Rendered Conditionally */}
        {isResultVisible && (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 shadow-md duration-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">
                {`City Tax 5% (bei ${inputs.length} ${inputs.length > 1 ? 'Übernachtungen' : 'Übernachtung'})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="mr-2 text-3xl font-bold text-indigo-500">
                  {result.currency}
                </span>
                <span className="text-5xl font-extrabold text-slate-800">
                  {result.number}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
