'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <div
      className="group border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
            : 'bg-gray-100 group-hover:bg-blue-100'
            }`}>
            <HelpCircle
              className={`transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`}
              size={20}
            />
          </div>
          <h3 className={`text-lg font-semibold transition-colors duration-300 pr-4 ${isOpen ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'
            }`}>
            {question}
          </h3>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${isOpen
            ? 'bg-blue-600 rotate-180'
            : 'bg-gray-100 group-hover:bg-blue-100 hover:bg-blue-200'
            }`}
          aria-label={isOpen ? "Collapse answer" : "Expand answer"}
        >
          {isOpen ? (
            <Minus className="text-white" size={20} strokeWidth={3} />
          ) : (
            <Plus className="text-gray-600 group-hover:text-blue-600" size={20} strokeWidth={3} />
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'
          }`}
      >
        <div className="p-6 pt-0 pl-20 bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
          <p className="text-gray-700 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the Smart Paste feature work?",
      answer: "Simply copy a customer's message from WhatsApp (containing their name, phone, and address), then paste it into Reseller Pro. Our intelligent system automatically extracts and organizes all the information into the right fields. No manual typing needed!"
    },
    {
      question: "Can I use Reseller Pro with Instagram as well?",
      answer: "Yes! While we integrate directly with WhatsApp for automated messaging, you can manually add orders from Instagram or any other platform. Copy-paste customer details from Instagram DMs just like WhatsApp, and manage everything in one dashboard."
    },
    {
      question: "What happens when I exceed 10 orders on the free plan?",
      answer: "You'll receive a notification when approaching your limit. You can upgrade to Pro for unlimited orders anytime, or wait until next month when your order count resets. Your existing data stays safe and accessible."
    },
    {
      question: "Is my customer data secure and private?",
      answer: "Absolutely. All your data is encrypted and stored securely. We never share your customer information with anyone. Your business data is completely private and belongs only to you."
    },
    {
      question: "Do I need any technical knowledge to get started?",
      answer: "Not at all! Reseller Pro is designed to be simple and intuitive. If you can use WhatsApp, you can use Reseller Pro. Setup takes less than 5 minutes, and our interface is straightforward with no learning curve."
    },
    {
      question: "Can I send messages to dealers directly from the app?",
      answer: "Yes! With one click, you can send pre-formatted messages to your dealers via WhatsApp. The app creates the perfect message format with order details, and opens WhatsApp ready to send. It saves you tons of time on repetitive communication."
    },
    {
      question: "How do branded invoices work?",
      answer: "You can upload your business logo and set your business name in settings. When you generate invoices, they'll automatically include your branding, making you look more professional to your customers. The invoices are clean, modern, and ready to share."
    },
    {
      question: "Can I cancel or downgrade my plan anytime?",
      answer: "Yes, you have complete flexibility. Downgrade to the free plan or cancel anytime with no questions asked. Your data remains accessible even if you downgrade, and you can upgrade again whenever you're ready."
    },
    {
      question: "What kind of support do you provide?",
      answer: "Free plan users get email support with response within 24-48 hours. Pro and Business plan users get priority support with faster response times. We're committed to helping you succeed with Reseller Pro."
    },
    {
      question: "Will there be more features in the future?",
      answer: "Definitely! We're actively developing new features including an AI Chat Assistant for automatic customer replies, advanced analytics dashboard, and more integrations. As an early user, you'll get access to new features as they launch."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 -z-10" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
            <Sparkles size={16} />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Reseller Pro. Can't find what you're looking for?
            <a href="mailto:resellerpro@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Contact us
            </a>
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            Still have questions?
          </h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We're here to help! Reach out to our team and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:resellerpro@gmail.com"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Email Us
            </a>
            <a
              href="tel:+917025302327"
              className="px-8 py-4 bg-transparent text-white rounded-xl hover:bg-white/10 transition-all font-semibold border-2 border-white/30 backdrop-blur-sm"
            >
              Call +91 7025302327
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}