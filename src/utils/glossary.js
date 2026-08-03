export const GLOSSARY_TERMS = {
  'AIF': 'Alternative Investment Fund: High-yielding pooled investment vehicle designed for HNIs with min ₹1 Cr ticket size.',
  'PMS': 'Portfolio Management Service: Professional customized equity portfolio management for HNIs (min ₹50 Lakhs).',
  'SIP': 'Systematic Investment Plan: Disciplined monthly investing method in mutual funds to average market volatility.',
  'STP': 'Systematic Transfer Plan: Automated regular transfer from liquid/debt funds to equity funds for capital protection.',
  'SWP': 'Systematic Withdrawal Plan: Tax-efficient regular monthly payout stream from your mutual fund corpus for retirement.',
  'NCD': 'Non-Convertible Debenture: Fixed-income debt bond issued by corporations offering higher interest rates than bank FDs.',
  'FII': 'Foreign Institutional Investor: Foreign funds and banks whose large buying/selling heavily impacts Indian markets.',
  'DII': 'Domestic Institutional Investor: Indian mutual funds, LIC, and banks supporting domestic stock market liquidity.',
  'SIF': 'Specified Investment Fund: High-conviction specialized fund targeting high-growth sectors or strategies.',
  'EPF': 'Employee Provident Fund: Government-backed retirement scheme providing 8.25% p.a. tax-free interest for salaried professionals.',
  'EDLI': 'Employees Deposit Linked Insurance: Free life insurance cover up to ₹7 Lakhs provided to all active EPF account holders.',
  'FD': 'Fixed Deposit: Guaranteed interest term deposit with banks and financial institutions.',
};

export const findGlossaryTerm = (text) => {
  if (!text) return null;
  const upper = text.toUpperCase();
  for (const term of Object.keys(GLOSSARY_TERMS)) {
    if (upper.includes(term)) {
      return { term, definition: GLOSSARY_TERMS[term] };
    }
  }
  return null;
};
