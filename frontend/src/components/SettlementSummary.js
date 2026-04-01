import React from 'react';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { MdEmojiEvents } from 'react-icons/md';

function SettlementSummary({ scrollY, settlements }) {
  const getSettlementSummary = () => {
    const summary = [];
    if (!settlements || typeof settlements !== 'object') return summary;

    for (const userId in settlements) {
      const userBalance = settlements[userId];
      if (userBalance.balance !== 0) {
        summary.push({
          name: userBalance.name,
          balance: userBalance.balance,
          owes: userBalance.owes || {}
        });
      }
    }
    return summary;
  };

  const settlementList = getSettlementSummary();

  return (
    <section className="testimonials" style={{
      transform: `translateY(${scrollY * 0.08}px)`
    }}>
      <div className="testimonial-content">
        <div className="testimonial-text">
          <h2>Settlement Summary</h2>
          <p>Here's who owes what in your household. Settle these balances to keep things fair and transparent.</p>
          
          <div style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {settlementList.length > 0 ? (
              settlementList.map((person, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  background: person.balance > 0 ? 'rgba(212, 165, 165, 0.1)' : 'rgba(201, 176, 212, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  borderLeft: `4px solid ${person.balance > 0 ? '#D4A5A5' : '#C9B0D4'}`
                }}>
                  <div style={{ fontWeight: '600', color: '#6B5B68' }}>
                    {person.name}
                  </div>
                  <div style={{
                    marginTop: '0.25rem',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: person.balance > 0 ? '#D4A5A5' : '#C9B0D4'
                  }}>
                    {person.balance > 0 ? <><FaCreditCard style={{ display: 'inline', marginRight: '0.3rem' }} />Gets back</> : <><FaMoneyBillWave style={{ display: 'inline', marginRight: '0.3rem' }} />Owes</>} ${Math.abs(person.balance).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#9B8A95', textAlign: 'center', padding: '1rem' }}>
                <MdEmojiEvents style={{ display: 'inline', marginRight: '0.3rem', fontSize: '1.5rem' }} />
                All settled up!
              </p>
            )}
          </div>

          <a href="/settle" style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            color: '#9B7FB8',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Record a Payment →
          </a>
        </div>
        <div className="testimonial-image">
          <div style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8C4C4, #C9B0D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            flexDirection: 'column'
          }}>
            <FaMoneyBillWave size={80} />
            <div style={{ fontSize: '1rem', marginTop: '1rem', textAlign: 'center', color: '#9B8A95' }}>
              Balances Tracker
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettlementSummary;
