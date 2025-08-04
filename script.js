/**
 * SmartCalc - Modern Calculator
 * Built with Vanilla JavaScript
 * Features: Basic operations, modulo, square, decimal support
 */

class SmartCalc {
    constructor() {
        // Calculator state
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.history = '';
        
        // DOM elements
        this.display = document.getElementById('display');
        this.historyDisplay = document.getElementById('history');
        
        // Initialize calculator
        this.init();
    }
    
    /**
     * Initialize calculator event listeners
     */
    init() {
        // Add event listeners for all buttons
        document.querySelectorAll('.btn-calc').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Prevent context menu on calculator
        document.querySelector('.calculator-container').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        console.log('SmartCalc initialized successfully! 🧮');
    }
    
    /**
     * Handle button click events
     * @param {HTMLElement} button - The clicked button
     */
    handleButtonClick(button) {
        // Add visual feedback
        this.addRippleEffect(button);
        
        // Handle different button types
        if (button.dataset.number !== undefined) {
            this.inputNumber(button.dataset.number);
        } else if (button.dataset.operator !== undefined) {
            this.inputOperator(button.dataset.operator);
        } else if (button.dataset.action !== undefined) {
            this.performAction(button.dataset.action);
        }
        
        // Update display
        this.updateDisplay();
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyPress(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.=Enter'.includes(key) || key === 'Escape' || key === 'Backspace') {
            e.preventDefault();
        }
        
        // Map keyboard keys to calculator functions
        if ('0123456789'.includes(key)) {
            this.inputNumber(key);
        } else if ('+-*/'.includes(key)) {
            this.inputOperator(key);
        } else if (key === '.') {
            this.performAction('decimal');
        } else if (key === '=' || key === 'Enter') {
            this.performAction('calculate');
        } else if (key === 'Escape') {
            this.performAction('clear');
        } else if (key === 'Backspace') {
            this.performAction('backspace');
        } else if (key === '%') {
            this.inputOperator('%');
        }
        
        this.updateDisplay();
    }
    
    /**
     * Input a number
     * @param {string} num - The number to input
     */
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        // Limit input length to prevent overflow
        if (this.currentInput.length > 12) {
            this.currentInput = this.currentInput.slice(0, 12);
        }
    }
    
    /**
     * Input an operator
     * @param {string} nextOperator - The operator to input
     */
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        // If there's no previous input, set it to current input
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            // Perform calculation if there's a pending operation
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            // Handle calculation errors
            if (newValue === null) {
                return;
            }
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        
        // Update history display
        this.updateHistory();
    }
    
    /**
     * Perform various calculator actions
     * @param {string} action - The action to perform
     */
    performAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'calculate':
                this.performCalculation();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'toggle-sign':
                this.toggleSign();
                break;
            case 'square':
                this.square();
                break;
            case 'backspace':
                this.backspace();
                break;
        }
    }
    
    /**
     * Clear all calculator state
     */
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.history = '';
        this.clearError();
    }
    
    /**
     * Perform the final calculation
     */
    performCalculation() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            if (newValue === null) {
                return;
            }
            
            // Update history with complete calculation
            this.history = `${this.formatNumber(currentValue)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(inputValue)} =`;
            
            this.currentInput = String(newValue);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
        }
    }
    
    /**
     * Add decimal point to current input
     */
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
    }
    
    /**
     * Toggle the sign of current input
     */
    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.charAt(0) === '-' 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
    }
    
    /**
     * Square the current input
     */
    square() {
        const inputValue = parseFloat(this.currentInput);
        const result = inputValue * inputValue;
        
        this.history = `${this.formatNumber(inputValue)}² =`;
        this.currentInput = String(result);
        this.waitingForOperand = true;
    }
    
    /**
     * Remove last character from current input
     */
    backspace() {
        if (!this.waitingForOperand) {
            this.currentInput = this.currentInput.length > 1 
                ? this.currentInput.slice(0, -1) 
                : '0';
        }
    }
    
    /**
     * Perform mathematical calculation
     * @param {number} firstOperand - First number
     * @param {number} secondOperand - Second number
     * @param {string} operator - Mathematical operator
     * @returns {number|null} - Result or null if error
     */
    calculate(firstOperand, secondOperand, operator) {
        try {
            let result;
            
            switch (operator) {
                case '+':
                    result = firstOperand + secondOperand;
                    break;
                case '-':
                    result = firstOperand - secondOperand;
                    break;
                case '*':
                    result = firstOperand * secondOperand;
                    break;
                case '/':
                    if (secondOperand === 0) {
                        this.showError('Cannot divide by zero');
                        return null;
                    }
                    result = firstOperand / secondOperand;
                    break;
                case '%':
                    result = firstOperand % secondOperand;
                    break;
                default:
                    return null;
            }
            
            // Handle very large or very small numbers
            if (!isFinite(result)) {
                this.showError('Result too large');
                return null;
            }
            
            // Round to prevent floating point precision issues
            result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
            
            return result;
        } catch (error) {
            this.showError('Calculation error');
            return null;
        }
    }
    
    /**
     * Update the calculator display
     */
    updateDisplay() {
        // Format the current input for display
        const displayValue = this.formatNumber(parseFloat(this.currentInput));
        this.display.innerText = displayValue;
        
        // Update history display
        this.historyDisplay.innerText = this.history;
        
        // Add animation class
        this.display.classList.add('updated');
        setTimeout(() => {
            this.display.classList.remove('updated');
        }, 200);
    }
    
    /**
     * Update the history display
     */
    updateHistory() {
        if (this.previousInput !== '' && this.operator) {
            this.history = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`;
        }
    }
    
    /**
     * Format number for display
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        if (isNaN(num)) return '0';
        
        // Handle very large numbers with scientific notation
        if (Math.abs(num) >= 1e12) {
            return num.toExponential(6);
        }
        
        // Handle very small numbers
        if (Math.abs(num) < 1e-6 && num !== 0) {
            return num.toExponential(6);
        }
        
        // Regular formatting
        const str = num.toString();
        
        // Limit decimal places for display
        if (str.includes('.') && str.split('.')[1].length > 8) {
            return num.toFixed(8).replace(/\.?0+$/, '');
        }
        
        return str;
    }
    
    /**
     * Get display symbol for operator
     * @param {string} operator - Mathematical operator
     * @returns {string} - Display symbol
     */
    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷',
            '%': '%'
        };
        return symbols[operator] || operator;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.display.innerText = 'Error';
        this.display.classList.add('error');
        this.historyDisplay.innerText = message;
        
        // Auto-clear error after 2 seconds
        setTimeout(() => {
            this.clear();
            this.updateDisplay();
        }, 2000);
    }
    
    /**
     * Clear error state
     */
    clearError() {
        this.display.classList.remove('error');
    }
    
    /**
     * Add ripple effect to button
     * @param {HTMLElement} button - Button element
     */
    addRippleEffect(button) {
        // Remove existing ripple
        button.classList.remove('ripple');
        
        // Add ripple effect
        setTimeout(() => {
            button.classList.add('ripple');
        }, 10);
        
        // Remove ripple after animation
        setTimeout(() => {
            button.classList.remove('ripple');
        }, 300);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create calculator instance
    const calculator = new SmartCalc();
    
    // Add some fun console messages
    console.log('🧮 SmartCalc loaded successfully!');
    console.log('💡 Try using keyboard shortcuts:');
    console.log('   • Numbers: 0-9');
    console.log('   • Operators: +, -, *, /, %');
    console.log('   • Decimal: .');
    console.log('   • Calculate: Enter or =');
    console.log('   • Clear: Escape');
    console.log('   • Backspace: Backspace');
    
    // Add service worker for PWA capabilities (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    }
});

// Add CSS animation for updated display
const style = document.createElement('style');
style.textContent = `
    .display-current.updated {
        animation: pulse 0.2s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .btn-calc.ripple {
        animation: buttonPress 0.3s ease-out;
    }
    
    @keyframes buttonPress {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);