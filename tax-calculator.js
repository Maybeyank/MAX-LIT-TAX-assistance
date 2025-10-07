// --- JAVASCRIPT LOGIC FOR REAL-TIME TAX CALCULATION (Goal 1 & 5) ---

// Surcharges and Cess are constants applicable to both regimes
const CESS_RATE = 0.04; // 4% Health and Education Cess

/**
 * Calculates tax and cess under the New Tax Regime (Default).
 * @param {number} taxableIncome - The income after Standard Deduction and HRA (if applicable).
 * @returns {object} {tax: number, totalLiability: number}
 */
function calculateNewRegimeTax(taxableIncome) {
    // New Regime Slabs (AY 2025-26)
    const slabs = [
        { limit: 300000, rate: 0.00 },
        { limit: 700000, rate: 0.05 },
        { limit: 1000000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        // Income above 15 lakh taxed at 30%
    ];

    let tax = 0;
    let incomeRemaining = taxableIncome;
    let previousLimit = 0;
    
    // Apply Rebate u/s 87A (Full tax waiver if Net Taxable Income is up to 7,00,000)
    let rebate = 0;
    if (taxableIncome <= 700000) {
        rebate = Math.min(taxableIncome * 0.3, 25000) * 1; // Simplified, effectively makes tax zero up to 7L
    }

    // New Regime Slab Calculation
    for (const slab of slabs) {
        if (incomeRemaining <= previousLimit) break;
        
        const taxableInSlab = Math.min(slab.limit, incomeRemaining) - previousLimit;
        tax += taxableInSlab * slab.rate;
        previousLimit = slab.limit;
    }
    
    // For income above the last slab (15,00,000)
    if (incomeRemaining > 1500000) {
        tax += (incomeRemaining - 1500000) * 0.30;
    }

    // Apply Rebate (only if income is up to 7L)
    tax = Math.max(0, tax - rebate);

    const cess = tax * CESS_RATE;
    const totalLiability = tax + cess;

    return { tax: Math.round(tax), totalLiability: Math.round(totalLiability) };
}

/**
 * Calculates tax and cess under the Old Tax Regime.
 * @param {number} taxableIncome - The income after Standard Deduction and HRA.
 * @param {number} section80CDeductions - Combined deduction amount (initially 0, updated in next step).
 * @returns {object} {tax: number, totalLiability: number}
 */
function calculateOldRegimeTax(taxableIncome, section80CDeductions = 0) {
    
    let netTaxableIncome = taxableIncome - Math.min(section80CDeductions, 150000);

    // Old Regime Slabs (AY 2025-26) for non-senior citizens
    const slabs = [
        { limit: 250000, rate: 0.00 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        // Income above 10 lakh taxed at 30%
    ];

    let tax = 0;
    let incomeRemaining = netTaxableIncome;
    let previousLimit = 0;

    // Old Regime Slab Calculation
    for (const slab of slabs) {
        if (incomeRemaining <= previousLimit) break;
        
        const taxableInSlab = Math.min(slab.limit, incomeRemaining) - previousLimit;
        tax += taxableInSlab * slab.rate;
        previousLimit = slab.limit;
    }

    // For income above the last slab (10,00,000)
    if (incomeRemaining > 1000000) {
        tax += (incomeRemaining - 1000000) * 0.30;
    }

    // Apply Rebate u/s 87A (Full tax waiver if Net Taxable Income is up to 5,00,000)
    let rebate = 0;
    if (netTaxableIncome <= 500000) {
        rebate = Math.min(tax, 12500);
    }
    
    tax = Math.max(0, tax - rebate);

    const cess = tax * CESS_RATE;
    const totalLiability = tax + cess;

    return { tax: Math.round(tax), totalLiability: Math.round(totalLiability) };
}


/**
 * Main function to read inputs, calculate taxes, and update the UI.
 * (Goal 1, 5, 6: Transparency)
 */
function updateTaxSummary() {
    // 1. Get Raw Inputs
    const grossSalary = parseFloat(document.getElementById('salary').value) || 0;
    const otherIncome = parseFloat(document.getElementById('interest-income').value) || 0;
    const hraClaimed = parseFloat(document.getElementById('hra-claimed').value) || 0;

    // Default deductions (Standard Deduction is the major difference when no Chapter VI-A is claimed)
    const STANDARD_DEDUCTION = 50000;
    
    // 2. Calculate Taxable Income for each Regime (before Chapter VI-A Deductions)
    
    // A. New Regime: Only Standard Deduction is available for salaried employees.
    const taxableNewRegime = Math.max(0, (grossSalary - hraClaimed - STANDARD_DEDUCTION) + otherIncome);

    // B. Old Regime: Standard Deduction and HRA are available.
    // Note: Old Regime allows interest on House Loan and other deductions, which we currently set to 0.
    const taxableOldRegime = Math.max(0, (grossSalary - hraClaimed - STANDARD_DEDUCTION) + otherIncome);


    // 3. Calculate Tax Liability
    const taxNew = calculateNewRegimeTax(taxableNewRegime);
    const taxOld = calculateOldRegimeTax(taxableOldRegime); // Currently calculated without 80C, 80D etc.

    // 4. Update UI Elements
    
    // Helper function for currency formatting
    const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN')}`;
    
    document.getElementById('taxable-new').textContent = formatCurrency(taxableNewRegime);
    document.getElementById('taxable-old').textContent = formatCurrency(taxableOldRegime);
    
    document.getElementById('tax-due-new').textContent = formatCurrency(taxNew.totalLiability);
    document.getElementById('tax-due-old').textContent = formatCurrency(taxOld.totalLiability);
    
    // 5. Comparison Logic (Goal 5)
    const savings = Math.abs(taxNew.totalLiability - taxOld.totalLiability);
    document.getElementById('savings').textContent = formatCurrency(savings);

    const bestRegimeBox = document.querySelector('.regime-box.best');
    const oldRegimeBox = document.querySelector('.regime-box:not(.best)');

    let recommendedText = "Recommended Regime: ";
    
    if (taxNew.totalLiability < taxOld.totalLiability) {
        // New is better
        recommendedText += "New Tax Regime";
        bestRegimeBox.style.borderColor = 'var(--secondary-color)';
        bestRegimeBox.querySelector('h4').textContent = recommendedText;
        bestRegimeBox.querySelector('.savings-alert').textContent = formatCurrency(taxNew.totalLiability);
        oldRegimeBox.querySelector('.savings-alert').textContent = `₹ ${savings.toLocaleString('en-IN')} more tax`;
        oldRegimeBox.querySelector('.savings-alert').style.color = '#dc3545'; // Red for warning
    } else {
        // Old is better (or equal, but old provides room for 80C/80D)
        recommendedText += "Old Tax Regime (Check Deductions!)";
        bestRegimeBox.style.borderColor = '#dc3545'; // Highlight Old Regime benefit
        bestRegimeBox.querySelector('h4').textContent = recommendedText;
        bestRegimeBox.querySelector('.savings-alert').textContent = formatCurrency(taxOld.totalLiability);
        oldRegimeBox.querySelector('.savings-alert').textContent = `₹ ${savings.toLocaleString('en-IN')} more tax`;
        oldRegimeBox.querySelector('.savings-alert').style.color = 'var(--secondary-color)'; // Green for savings
    }
}

// 6. Event Listeners: Attach the update function to input changes
document.addEventListener('DOMContentLoaded', () => {
    // Select all input fields that affect the calculation
    const inputs = document.querySelectorAll('#salary, #interest-income, #hra-claimed');
    
    // Attach the updateTaxSummary function to the 'input' event of each field
    inputs.forEach(input => {
        input.addEventListener('input', updateTaxSummary);
    });
    
    // Run the summary update once on load to show initial 0 values
    updateTaxSummary();
});