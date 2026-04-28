import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

const DEFAULT_FAQS = [
  {
    question: "How do I check if I am registered to vote?",
    answer: "You can check your name on the official Electoral Search portal (electoralsearch.eci.gov.in) using your EPIC number or personal details."
  },
  {
    question: "What IDs are accepted at the polling station?",
    answer: "Voter ID card (EPIC), Aadhaar Card, MGNREGA Job Card, Passbooks with photograph, Health Insurance Smart Card, Driving License, Passport, etc."
  },
  {
    question: "What is the Model Code of Conduct?",
    answer: "It is a set of guidelines issued by the Election Commission for the conduct of political parties and candidates during elections, mainly regarding speeches, polling day, and manifestos."
  }
];

const FAQSection = () => {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [isOpen, setIsOpen] = useState({});

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!db) return;
      try {
        const faqRef = collection(db, 'faq_analytics');
        const q = query(faqRef, limit(5));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // Extract questions and create unique list
          const loggedQuestions = snapshot.docs.map(doc => doc.data().question);
          const uniqueQuestions = [...new Set(loggedQuestions)].filter(Boolean);
          
          if (uniqueQuestions.length > 0) {
            // Map to FAQ format (we'll need a generic answer or leave it for AI)
            const dynamicFaqs = uniqueQuestions.map(q => ({
              question: q,
              answer: "Ask our AI Chatbot for a detailed answer to this community question!"
            }));
            // Merge with defaults
            setFaqs([...DEFAULT_FAQS, ...dynamicFaqs].slice(0, 6));
          }
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  const toggleOpen = (index) => {
    setIsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-display font-bold text-primary mb-6 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-border rounded-lg bg-surface shadow-sm overflow-hidden">
            <button
              onClick={() => toggleOpen(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-primary hover:bg-bg/50 transition-colors duration-200"
              aria-expanded={isOpen[index]}
              aria-controls={`faq-answer-${index}`}
            >
              <span id={`faq-question-${index}`} className="text-sm md:text-base">{faq.question}</span>
              <span className="text-accent text-xl">{isOpen[index] ? '−' : '+'}</span>
            </button>
            <div 
              id={`faq-answer-${index}`}
              className={`px-6 py-4 bg-bg/30 text-sm text-text border-t border-border ${isOpen[index] ? 'block' : 'hidden'}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
