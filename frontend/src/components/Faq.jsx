import React, { useEffect, useState } from 'react';
import './Faq.css';
import { CORE_BASE_URL } from '../constants';
import { jwtDecode } from 'jwt-decode';

const Faq = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      const url = CORE_BASE_URL + 'faq';
      const body = {
        name: jwtDecode(localStorage.getItem('token')).name,
        email: jwtDecode(localStorage.getItem('token')).email,
        dept: jwtDecode(localStorage.getItem('token')).desig === 'admin' ?
         jwtDecode(localStorage.getItem('token')).dept : 'devops'
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error('HTTP error! Something went wrong');
        }

        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFaqs();
  }, []);

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <h3 className="faq-question">{faq.question}</h3>
          <p className="faq-answer">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default Faq;