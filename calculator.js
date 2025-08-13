// Global variable to store pricing data
let pricingData = {};

function getFileSizeLimit(sizeCategory) {
    const limits = {
        'small': 10,
        'medium': 50,
        'large': 100
    };
    return limits[sizeCategory] || 0;
}

function renderAllPlans() {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = '';
    
    Object.keys(pricingData).forEach(platformKey => {
        const platform = pricingData[platformKey];
        
        const platformCard = document.createElement('div');
        platformCard.className = 'platform-card';
        
        const platformHeader = document.createElement('div');
        platformHeader.className = 'platform-header';
        platformHeader.style.backgroundColor = platform.color;
        platformHeader.innerHTML = `<h3 class="platform-name">${platform.name}</h3>`;
        
        const plansContainer = document.createElement('div');
        plansContainer.className = 'plans-container';
        
        platform.plans.forEach(plan => {
            const planItem = document.createElement('div');
            planItem.className = 'plan-item';
            
            planItem.innerHTML = `
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">${plan.price}</div>
                <div class="plan-features">${plan.features}</div>
            `;
            
            plansContainer.appendChild(planItem);
        });
        
        platformCard.appendChild(platformHeader);
        platformCard.appendChild(plansContainer);
        resultsSection.appendChild(platformCard);
    });
}

function checkPlanMatch(plan, userInputs) {
    const pdfCountMatch = plan.maxPdfs >= userInputs.pdfCount;
    const fileSizeMatch = getFileSizeLimit(plan.maxFileSize) >= getFileSizeLimit(userInputs.fileSize);
    const adFreeMatch = userInputs.adFree ? plan.adFree : true;
    
    let pageSizeMatch = false;
    if (userInputs.pageCount === 'small' && (plan.maxPages === 'small' || plan.maxPages === 'medium' || plan.maxPages === 'large')) {
        pageSizeMatch = true;
    } else if (userInputs.pageCount === 'medium' && (plan.maxPages === 'medium' || plan.maxPages === 'large')) {
        pageSizeMatch = true;
    } else if (userInputs.pageCount === 'large' && plan.maxPages === 'large') {
        pageSizeMatch = true;
    }
    
    return pdfCountMatch && fileSizeMatch && pageSizeMatch && adFreeMatch;
}

function renderResults() {
    const pdfCount = parseInt(document.getElementById('pdfCount').value) || 1;
    const fileSize = document.getElementById('fileSize').value;
    const pageCount = document.getElementById('pageCount').value;
    const adFree = document.getElementById('adFree').checked;
    
    const userInputs = {
        pdfCount,
        fileSize,
        pageCount,
        adFree
    };
    
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = '';
    
    Object.keys(pricingData).forEach(platformKey => {
        const platform = pricingData[platformKey];
        
        const platformCard = document.createElement('div');
        platformCard.className = 'platform-card';
        
        const platformHeader = document.createElement('div');
        platformHeader.className = 'platform-header';
        platformHeader.style.backgroundColor = platform.color;
        platformHeader.innerHTML = `<h3 class="platform-name">${platform.name}</h3>`;
        
        const plansContainer = document.createElement('div');
        plansContainer.className = 'plans-container';
        
        // Find the first matching plan for this platform
        let highlightedPlanIndex = -1;
        for (let i = 0; i < platform.plans.length; i++) {
            if (checkPlanMatch(platform.plans[i], userInputs)) {
                highlightedPlanIndex = i;
                break;
            }
        }
        
        platform.plans.forEach((plan, index) => {
            const planItem = document.createElement('div');
            planItem.className = 'plan-item';
            
            // Only highlight the first matching plan
            if (index === highlightedPlanIndex) {
                planItem.classList.add('highlighted');
            }
            
            planItem.innerHTML = `
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">${plan.price}</div>
                <div class="plan-features">${plan.features}</div>
            `;
            
            plansContainer.appendChild(planItem);
        });
        
        platformCard.appendChild(platformHeader);
        platformCard.appendChild(plansContainer);
        resultsSection.appendChild(platformCard);
    });
}

// Auto-resize functionality for iframe embedding
function resizeIframe() {
    const height = document.body.scrollHeight;
    window.parent.postMessage({
        type: 'resize',
        height: height
    }, '*');
}

// Load pricing data from JSON file
async function loadPricingData() {
    try {
        const response = await fetch('pricing-data.json');
        pricingData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading pricing data:', error);
        return false;
    }
}

// Initialize the calculator
async function initCalculator() {
    // Load pricing data first
    const dataLoaded = await loadPricingData();
    
    if (!dataLoaded) {
        console.error('Failed to load pricing data');
        return;
    }
    
    // Event listener - only button triggers calculation
    document.getElementById('calculateBtn').addEventListener('click', renderResults);
    
    // Initial render - show all plans without highlighting
    renderAllPlans();
    
    // Resize on load and when content changes
    window.addEventListener('load', resizeIframe);
    document.addEventListener('DOMContentLoaded', resizeIframe);
    
    // Use ResizeObserver for dynamic content changes
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(resizeIframe);
        resizeObserver.observe(document.body);
    }
    
    // Fallback for older browsers
    let lastHeight = 0;
    setInterval(() => {
        const currentHeight = document.body.scrollHeight;
        if (currentHeight !== lastHeight) {
            lastHeight = currentHeight;
            resizeIframe();
        }
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}