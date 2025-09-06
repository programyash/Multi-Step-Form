document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    const sidebarSteps = document.querySelectorAll('.sidebar .step-number');
    const btnNext = document.querySelector('.btn-next');
    const btnBack = document.querySelector('.btn-back');
    const btnConfirm = document.querySelector('.btn-confirm');
    const buttonContainer = document.querySelector('.button-container');
    const billingToggle = document.getElementById('billing-cycle');

    let currentStep = 0;

    const formData = {
        plan: 'Arcade',
        billing: 'monthly',
        addons: []
    };

    const updateStepVisibility = () => {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        sidebarSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        if (currentStep === steps.length - 1) { // Thank you step
            buttonContainer.style.display = 'none';
        } else {
            buttonContainer.style.display = 'flex';
        }

        btnBack.style.visibility = currentStep > 0 ? 'visible' : 'hidden';
        btnNext.style.display = currentStep === 3 ? 'none' : 'block';
        btnConfirm.style.display = currentStep === 3 ? 'block' : 'none';
    };

    const validateStep1 = () => {
        let isValid = true;
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        // Reset errors
        [nameInput, emailInput, phoneInput].forEach(input => {
            input.classList.remove('error');
            const errorMsg = input.previousElementSibling.querySelector('.error-message');
            if (errorMsg) errorMsg.classList.remove('active');
        });

        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            nameInput.previousElementSibling.querySelector('.error-message').classList.add('active');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
            emailInput.classList.add('error');
            emailInput.previousElementSibling.querySelector('.error-message').classList.add('active');
            isValid = false;
        }

        if (!phoneInput.value.trim()) {
            phoneInput.classList.add('error');
            phoneInput.previousElementSibling.querySelector('.error-message').classList.add('active');
            isValid = false;
        }

        return isValid;
    };

    const updateSummary = () => {
        const planNameEl = document.getElementById('summary-plan-name');
        const planPriceEl = document.getElementById('summary-plan-price');
        const addonsContainer = document.querySelector('.summary-addons');
        const totalPriceEl = document.getElementById('total-price');
        const totalLabel = document.querySelector('.summary-total span');

        const isYearly = formData.billing === 'yearly';
        const planType = isYearly ? 'Yearly' : 'Monthly';
        const priceSuffix = isYearly ? '/yr' : '/mo';

        const selectedPlanInput = document.querySelector('input[name="plan"]:checked');
        const planPrice = isYearly ? selectedPlanInput.dataset.priceYearly : selectedPlanInput.dataset.priceMonthly;

        planNameEl.textContent = `${formData.plan} (${planType})`;
        planPriceEl.textContent = `$${planPrice}${priceSuffix}`;

        addonsContainer.innerHTML = '';
        let totalAddonsPrice = 0;

        const selectedAddons = document.querySelectorAll('input[name="addon"]:checked');
        formData.addons = [];
        selectedAddons.forEach(addon => {
            const addonName = addon.value;
            const addonPrice = isYearly ? addon.dataset.priceYearly : addon.dataset.priceMonthly;
            totalAddonsPrice += parseInt(addonPrice);

            formData.addons.push({ name: addonName, price: addonPrice });

            const addonItem = document.createElement('div');
            addonItem.classList.add('summary-addon-item');
            addonItem.innerHTML = `
                <span>${addonName}</span>
                <span>+$${addonPrice}${priceSuffix}</span>
            `;
            addonsContainer.appendChild(addonItem);
        });

        const total = parseInt(planPrice) + totalAddonsPrice;
        totalLabel.textContent = `Total (per ${isYearly ? 'year' : 'month'})`;
        totalPriceEl.textContent = `+$${total}${priceSuffix}`;
    };

    btnNext.addEventListener('click', () => {
        let canProceed = true;
        if (currentStep === 0) {
            canProceed = validateStep1();
        } else if (currentStep === 3) {
            updateSummary();
        }

        if (canProceed && currentStep < steps.length - 1) {
            currentStep++;
            if (currentStep === 3) { // When moving to summary
                updateSummary();
            }
            updateStepVisibility();
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStepVisibility();
        }
    });

    btnConfirm.addEventListener('click', () => {
        if (currentStep === 3) {
            currentStep++;
            updateStepVisibility();
        }
    });

    billingToggle.addEventListener('change', () => {
        const isYearly = billingToggle.checked;
        formData.billing = isYearly ? 'yearly' : 'monthly';

        document.querySelector('.yearly-label').classList.toggle('active', isYearly);
        document.querySelector('.monthly-label').classList.toggle('active', !isYearly);

        document.querySelectorAll('.plan-price').forEach(priceEl => {
            priceEl.textContent = isYearly ? priceEl.dataset.yearly : priceEl.dataset.monthly;
        });
        document.querySelectorAll('.addon-price').forEach(priceEl => {
            priceEl.textContent = isYearly ? priceEl.dataset.yearly : priceEl.dataset.monthly;
        });
        document.querySelectorAll('.yearly-bonus').forEach(bonusEl => {
            bonusEl.style.display = isYearly ? 'block' : 'none';
        });
    });

    document.querySelectorAll('input[name="plan"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.plan = e.target.value;
        });
    });

    document.querySelector('.change-plan-btn').addEventListener('click', () => {
        currentStep = 1;
        updateStepVisibility();
    });

    updateStepVisibility();
});