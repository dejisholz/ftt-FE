'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

const faqData: FaqItem[] = [
  {
    question: "What is CRYPTEN?",
    answer: "CRYPTO is a utility token based on the ERC20 standard. All transactions on the CRYPTEN platform will be carried out in CRYPTO. TheCRYPTO token will be freely tradable on major exchanges and is fully compatible with Ethereum wallets."
  },
  {
    question: "What is CRYPTO Token?",
    answer: "CRYPTO Token is our platform's native digital currency that facilitates transactions and provides access to premium features within our ecosystem."
  },
  {
    question: "What is the price of the CRYPTO Token?",
    answer: "The price of CRYPTO Token is determined by market dynamics and can be checked on our supported exchanges."
  },
  {
    question: "Why do you accept only Ether (ETH)?",
    answer: "We currently accept ETH as it provides secure, fast, and reliable transactions on the Ethereum network."
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