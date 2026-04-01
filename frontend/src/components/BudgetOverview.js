import React from 'react';
import { MdTrendingUp, MdRestaurant, MdHome, MdLightbulb, MdMovie, MdDirectionsCar, MdLocalShipping, MdBarChart } from 'react-icons/md';

function BudgetOverview({ scrollY, expenses }) {
  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Transport', 'Other'];

  const categoryIcons = {
    Food: <MdRestaurant />,
    Rent: <MdHome />,
    Utilities: <MdLightbulb />,
    Entertainment: <MdMovie />,
    Transport: <MdDirectionsCar />,
    Other: <MdLocalShipping />
  };

  const calculateByCategory = () => {
    const byCategory = {};
    categories.forEach(cat => byCategory[cat] = 0);

    expenses.forEach(exp => {
      if (byCategory.hasOwnProperty(exp.category)) {
        byCategory[exp.category] += parseFloat(exp.amount || 0);
      }
    });

    return byCategory;
  };

  const byCategory = calculateByCategory();
  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);

  return (
    <section className="categories" style={{ background: '#F3E5E8' }}>
      <h2 className="section-title"><MdTrendingUp style={{ marginRight: '0.5rem', display: 'inline' }} />Spending by Category</h2>
      <p className="section-subtitle">Where your money goes</p>

      <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {categories.map(cat => {
          const amount = byCategory[cat] || 0;
          const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

          return (
            <div key={cat} className="category-card">
              <h3 style={{ fontSize: '2.5rem' }}>{categoryIcons[cat] || <MdBarChart />}</h3>
              <h3 style={{ fontSize: '1.2rem' }}>{cat}</h3>
              <p style={{ fontSize: '0.9rem', color: '#D4A5A5', fontWeight: '600' }}>
                ${amount.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9B8A95' }}>
                {percentage}%
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(212, 165, 165, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#9B8A95', marginBottom: '0.5rem' }}>Total Monthly Spending</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#D4A5A5' }}>${total.toFixed(2)}</div>
      </div>
    </section>
  );
}

export default BudgetOverview;
