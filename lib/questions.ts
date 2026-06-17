export type Question = {
  id: number;
  part: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
};

// Source: Mission Pet Health — P&L Line-Item Definitions Pop Quiz job aid
// (Version 1, Feb 2026). 20-question bank; 10 are drawn at random per session.
export const questions: Question[] = [
  // Part 1 — P&L Report Types & Timing
  {
    id: 1,
    part: "Part 1 — P&L Report Types & Timing",
    question:
      "How often is the Annual Budget P&L sent, and what triggers its timing for a hospital that partnered BEFORE the budget year?",
    options: [
      "Quarterly; sent at the start of each fiscal quarter",
      "Once annually; sent in November or December of the prior year",
      "Once annually; sent in January or February of the budget year",
      "Monthly; sent at the same time as the Monthly P&L",
    ],
    correctIndex: 2,
    rationale:
      "The Annual Budget P&L is sent once annually; for hospitals that partnered before the budget year it arrives in January or February of that budget year.",
  },
  {
    id: 2,
    part: "Part 1 — P&L Report Types & Timing",
    question:
      "For a hospital that partners WITH Mission Pet Health during the budget year, when will it receive its first Annual Budget P&L?",
    options: [
      "In January of the following calendar year",
      "Immediately on the day of partnership",
      "The month following the partnership date",
      "90 days after the partnership date",
    ],
    correctIndex: 2,
    rationale:
      "For hospitals that partner during the budget year, the Budget P&L is sent the month following partnership.",
  },
  {
    id: 3,
    part: "Part 1 — P&L Report Types & Timing",
    question:
      "The Monthly P&L is typically distributed between which calendar days of the month following the reporting period?",
    options: ["1st–5th", "10th–12th", "15th–17th", "20th–22nd"],
    correctIndex: 3,
    rationale:
      "The Monthly P&L is distributed between the 20th–22nd calendar day of the following month (e.g., ~Feb 20–22 for January results).",
  },
  {
    id: 4,
    part: "Part 1 — P&L Report Types & Timing",
    question:
      "Which of the following best describes the data structure of the Monthly P&L?",
    options: [
      "Annual expectations by line-item by month with YoY growth and annual % of revenue",
      "Current MTD and YTD actuals vs. prior year (YoY) and vs. budget (B2A) by line-item",
      "Weekly revenue actuals versus quarterly forecasts",
      "Prior-year comparisons only, with no budget benchmarks",
    ],
    correctIndex: 1,
    rationale:
      "The Monthly P&L shows current MTD and YTD actuals vs. prior year (YoY growth) and vs. budget (B2A comparisons) by line-item.",
  },

  // Part 2 — Performance Metrics
  {
    id: 5,
    part: "Part 2 — Performance Metrics",
    question:
      'What is the minimum clinical charges threshold that qualifies a workday as a "Doctor Day" for an individual DVM?',
    options: ["Over $250", "Over $500", "Over $750", "Over $1,000"],
    correctIndex: 2,
    rationale:
      "A Doctor Day requires that an individual DVM has over $750 of clinical charges on that workday.",
  },
  {
    id: 6,
    part: "Part 2 — Performance Metrics",
    question: 'Which visit type was formerly referred to as "Out of Hospital" visits?',
    options: [
      "Online Visits",
      "Board/Groom Visits",
      "Clinical Visits",
      "Product Only Visits",
    ],
    correctIndex: 3,
    rationale:
      'Product Only Visits — total patient visits associated with product-only purchases — were formerly called "Out of Hospital" visits.',
  },
  {
    id: 7,
    part: "Part 2 — Performance Metrics",
    question:
      "Clinical Visits are defined as total patient visits associated with which of the following?",
    options: [
      "All visit types including boarding and online purchases",
      "Clinical services — DVM, invoiced in-hospital services and products",
      "Only DVM examinations, not tech appointments",
      "Any visit where a payment was collected in-hospital",
    ],
    correctIndex: 1,
    rationale:
      "Clinical Visits are total patient visits associated with clinical services: DVM, invoiced in-hospital services and products.",
  },
  {
    id: 8,
    part: "Part 2 — Performance Metrics",
    question: "How is Clinical ACT (Average Client Transaction) calculated?",
    options: [
      "Total Revenue divided by Total Visits",
      "Total Professional Services revenue only divided by Clinical Visits",
      "Total of Professional Services, Products/Pharmacy/Diet, and Other Revenue for in-hospital patients divided by Clinical Visits",
      "Total Revenue divided by total Doctor Days",
    ],
    correctIndex: 2,
    rationale:
      "Clinical ACT = (Professional Services + Products/Pharmacy/Diet + Other Revenue for in-hospital patients) ÷ Clinical Visits.",
  },
  {
    id: 9,
    part: "Part 2 — Performance Metrics",
    question: "Total ACT is calculated as:",
    options: [
      "The average of Clinical ACT, Board/Groom ACT, Product Only ACT, and Online ACT",
      "Total Clinical Revenue divided by Clinical Visits",
      "Total Revenue divided by Total Visits",
      "Total Revenue divided by total Doctor Days",
    ],
    correctIndex: 2,
    rationale:
      "Total ACT = Total Revenue ÷ Total Visits. It is not an average of the individual ACT figures.",
  },

  // Part 3 — Revenue & COGS Categories
  {
    id: 10,
    part: "Part 3 — Revenue & COGS Categories",
    question:
      "Exams, dentals, and surgeries performed by DVMs and technicians fall under which Revenue & COGS category?",
    options: [
      "In Clinic Products/Pharmacy/Diet",
      "Boarding/Grooming",
      "Professional Services",
      "Other",
    ],
    correctIndex: 2,
    rationale:
      "Professional Services captures Revenue & COGS for services rendered by DVMs and techs, including exams, dentals, and surgeries.",
  },
  {
    id: 11,
    part: "Part 3 — Revenue & COGS Categories",
    question:
      "Which Revenue & COGS line item captures HWFT, Rx, and Diet products sold in the clinic?",
    options: [
      "Professional Services",
      "In Clinic Products/Pharmacy/Diet",
      "Online",
      "Other",
    ],
    correctIndex: 1,
    rationale:
      "In Clinic Products/Pharmacy/Diet covers Revenue & COGS for products sold in clinic, including HWFT, Rx, and Diet.",
  },
  {
    id: 12,
    part: "Part 3 — Revenue & COGS Categories",
    question:
      "Cremation services, ancillary product sales, discounts, and refunds are classified under which Revenue & COGS category?",
    options: ["Professional Services", "Boarding/Grooming", "Online", "Other"],
    correctIndex: 3,
    rationale:
      '"Other" Revenue & COGS includes cremation services, ancillary product sales, discounts, and refunds.',
  },

  // Part 4 — Salaries, Wages & Benefits
  {
    id: 13,
    part: "Part 4 — Salaries, Wages & Benefits",
    question: "Veterinary Payroll covers which of the following pay types?",
    options: [
      "Expense related to 1099 DVMs only",
      "W2 DVM salaries, daily pay, hourly pay, and production pay",
      "All payroll — both DVMs and non-veterinary teammates",
      "DVM benefits and payroll taxes only",
    ],
    correctIndex: 1,
    rationale:
      "Veterinary Payroll covers W2 DVM compensation: salaries, daily pay, hourly pay, and production pay.",
  },
  {
    id: 14,
    part: "Part 4 — Salaries, Wages & Benefits",
    question: "DVM Contract Labor is specifically defined as:",
    options: [
      "Incentive compensation and 401(k) match for DVMs",
      "W2 DVM salaries and hourly pay",
      "Expense related to 1099 DVMs, including GP and Specialty Contract Labor",
      "Production pay adjustments for associate veterinarians",
    ],
    correctIndex: 2,
    rationale:
      "DVM Contract Labor = expense for 1099 DVMs (both GP and Specialty Contract Labor). W2 DVMs are covered under Veterinary Payroll.",
  },
  {
    id: 15,
    part: "Part 4 — Salaries, Wages & Benefits",
    question:
      "The Hospital Leader Incentive and Medical Lead Stipend paid to DVMs are included in which line item?",
    options: [
      "Veterinary Payroll",
      "DVM Contract Labor",
      "DVM Benefits & Payroll Taxes",
      "Non-Veterinary Benefits & Payroll Taxes",
    ],
    correctIndex: 2,
    rationale:
      "DVM Benefits & Payroll Taxes includes incentive-compensation items such as the Hospital Leader Incentive and Medical Lead Stipend.",
  },
  {
    id: 16,
    part: "Part 4 — Salaries, Wages & Benefits",
    question: "Total DVM Labor is the sum of which three line items?",
    options: [
      "Veterinary Payroll + Non-Veterinary Payroll + DVM Contract Labor",
      "Veterinary Payroll + DVM Contract Labor + DVM Benefits & Payroll Taxes",
      "DVM Contract Labor + DVM Benefits & Payroll Taxes + Non-Veterinary Benefits & Payroll Taxes",
      "Veterinary Payroll + Non-Veterinary Payroll + Non-Veterinary Benefits & Payroll Taxes",
    ],
    correctIndex: 1,
    rationale:
      "Total DVM Labor = Veterinary Payroll + DVM Contract Labor + DVM Benefits & Payroll Taxes.",
  },

  // Part 5 — Tier 2 Expenses
  {
    id: 17,
    part: "Part 5 — Tier 2 Expenses",
    question:
      "IT consulting, computer equipment, internet services, and practice management system expenses are all classified under which Tier 2 category?",
    options: [
      "Office Expense",
      "Medical Equipment",
      "Maintenance and Services",
      "Computer & Technology",
    ],
    correctIndex: 3,
    rationale:
      "Computer & Technology covers IT consulting, computer equipment and data management, internet services, and practice management systems.",
  },
  {
    id: 18,
    part: "Part 5 — Tier 2 Expenses",
    question:
      "Which Tier 2 expense category covers conference attendance, event hosting, marketing giveaways, and charitable contributions — and requires questions to be directed to the ROD?",
    options: [
      "Marketing",
      "Travel/Meals/Entertainment",
      "Culture & Community",
      "Continuing Education",
    ],
    correctIndex: 2,
    rationale:
      "Culture & Community covers marketing giveaways, conference attendance, event hosting, and charitable contributions; questions are directed to the ROD.",
  },

  // Part 6 — Tier 3 Expenses
  {
    id: 19,
    part: "Part 6 — Tier 3 Expenses",
    question:
      'Which of the following items is correctly classified under the Tier 3 "Utilities" line item?',
    options: [
      "IT consulting fees and practice management software",
      "Postage, shipping, and office supply purchases",
      "Electric, gas, telephone, cellular, trash removal, and water",
      "Equipment leases, copier warranties, and janitorial supplies",
    ],
    correctIndex: 2,
    rationale:
      "Utilities includes electric, gas, internet, television, telephone, cellular, trash removal, and water.",
  },
  {
    id: 20,
    part: "Part 6 — Tier 3 Expenses",
    question:
      "Subtenant rent income, credit card rebate income, and miscellaneous income are classified under which Tier 3 line item?",
    options: [
      "Professional Fees",
      "Taxes/Licenses",
      "Payment Processing/Bank Charges",
      "Other (Income)/Expense",
    ],
    correctIndex: 3,
    rationale:
      "Other (Income)/Expense captures subtenant rent income, miscellaneous income, and credit card rebate income.",
  },
];

export const QUIZ_SIZE = 10;

// Fisher–Yates shuffle (returns a new array; does not mutate the input).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
