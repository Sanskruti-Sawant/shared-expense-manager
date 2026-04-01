import React from 'react';

function Dashboard({ scrollY, users, expenses, settlements, loading }) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const averagePerPerson = users.length > 0 ? (totalExpenses / users.length).toFixed(2) : 0;

  return (
    <section className="hero" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
      <div className="hero-content">
        <div className="hero-text">
          <h2>
            <span className="highlight">Household</span> Dashboard
          </h2>
          <p>Track shared expenses, manage balances, and settle debts easily. Keep your household finances transparent and fair.</p>
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#9B8A95' }}>Total Expenses</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#D4A5A5' }}>
                ${totalExpenses.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'rgba(201, 176, 212, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: '#9B8A95' }}>Per Person Avg</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#C9B0D4' }}>
                ${averagePerPerson}
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #E8C4C4, #C9B0D4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9B8A95',
            fontSize: '4rem',
            flexDirection: 'column'
          }}>
            💼
            <div style={{ fontSize: '1rem', marginTop: '1rem', textAlign: 'center' }}>
              {users.length} members tracking expenses
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
