'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

const faqData: FaqItem[] = [
  {
    question: "Is my Payment information (transaction hash) secure?",
    answer: "Absolutely. All payments are processed through encrypted, secure channels."
  },
  {
    question: "How long does my membership remain active?",
    answer: "Membership is valid for 30 days, after which you'll be automatically removed unless you renew."
  },
  {
    question: "Can I make payment from my Bybit or KuCoin account?",
    answer: "Yes. You can make payment via your Bybit account, Remitano account, Gate.io account, KuCoin account and pretty much any other CREDIBLE crypto wallet out there that uses the TRON blockchain network. Just ensure you select the \"TRON (TRC20) network\", and that you enter the correct wallet address while making payment."
  },
  {
    question: "Do you accept Bitcoin, usdt, BNB, etc?",
    answer: "Currently, we only accept payments in USDT (using the TRC20 network), to ensure fast and seamless payment transactions for your subscription."
  }
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-black/30 p-3 rounded-lg inline-block">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-300 mb-8 bg-black/30 p-3 rounded-lg">
        Some of the most common questions we receive from our community. In case you have any other questions or need assistance, please contact us at <a href="mailto:freetradementorship@gmail.com" className="text-teal-400">freetradementorship@gmail.com</a>.
      </p>
      
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="bg-[#2A1245] rounded-xl overflow-hidden">
            <div 
              className="flex items-center justify-between cursor-pointer p-4 hover:bg-[#351856] transition-colors duration-200" 
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            >
              <h3 className="text-lg font-medium text-white">{faq.question}</h3>
              <span className="material-icons text-teal-400">
                {openIndex === index ? 'remove' : 'add'}
              </span>
            </div>
            {openIndex === index && (
              <div className="bg-black/30 p-4 text-gray-300 border-t border-gray-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 