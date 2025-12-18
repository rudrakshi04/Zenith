// Smart Expense Tracker - Main JavaScript
class ExpenseTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.categories = {
            food: { name: 'Food & Dining', icon: '🍽️', color: '#e07a5f' },
            transport: { name: 'Transportation', icon: '🚗', color: '#81a1c1' },
            shopping: { name: 'Shopping', icon: '🛍️', color: '#b893a3' },
            utilities: { name: 'Utilities', icon: '⚡', color: '#f2cc8f' },
            entertainment: { name: 'Entertainment', icon: '🎬', color: '#a8a3c7' },
            health: { name: 'Healthcare', icon: '🏥', color: '#7a9b76' },
            education: { name: 'Education', icon: '📚', color: '#5a9b9b' },
            other: { name: 'Other', icon: '📋', color: '#d4b896' }
        };
        this.currentFilter = 'all';
        this.transactionType = 'expense';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.renderTransactions();
        this.updateDashboard();
        this.initializeCharts();
        this.generateInsights();
        this.animateCounters();
    }

    setupEventListeners() {
        // Transaction form
        const form = document.getElementById('transaction-form');
        const expenseBtn = document.getElementById('expense-btn');
        const incomeBtn = document.getElementById('income-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        expenseBtn.addEventListener('click', () => this.setTransactionType('expense'));
        incomeBtn.addEventListener('click', () => this.setTransactionType('income'));
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }

    initializeAnimations() {
        // Initialize text splitting
        if (typeof Splitting !== 'undefined') {
            Splitting();
            
            // Animate split text
            anime({
                targets: '[data-splitting] .char',
                translateY: [100, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 1400,
                delay: anime.stagger(30)
            });
        }

        // Animate cards on load
        anime({
            targets: '.card',
            translateY: [50, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1000,
            delay: anime.stagger(100)
        });
    }

    setTransactionType(type) {
        this.transactionType = type;
        const expenseBtn = document.getElementById('expense-btn');
        const incomeBtn = document.getElementById('income-btn');
        
        if (type === 'expense') {
            expenseBtn.className = 'btn-primary flex-1 py-3 px-4 rounded-lg font-medium';
            incomeBtn.className = 'btn-secondary flex-1 py-3 px-4 rounded-lg font-medium';
        } else {
            incomeBtn.className = 'btn-primary flex-1 py-3 px-4 rounded-lg font-medium';
            expenseBtn.className = 'btn-secondary flex-1 py-3 px-4 rounded-lg font-medium';
        }
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;

        if (!amount || !description || !category) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            amount: this.transactionType === 'expense' ? -amount : amount,
            description,
            category,
            type: this.transactionType,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateDashboard();
        this.updateCharts();
        this.generateInsights();
        
        // Reset form
        document.getElementById('transaction-form').reset();
        this.showNotification('Transaction added successfully!', 'success');
        
        // Animate new transaction
        this.animateNewTransaction();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-green-100', 'border-green-300', 'text-green-700');
            btn.classList.add('border-gray-300');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        activeBtn.classList.add('bg-green-100', 'border-green-300', 'text-green-700');
        activeBtn.classList.remove('border-gray-300');
        
        this.renderTransactions();
    }

    renderTransactions() {
        const container = document.getElementById('transactions-list');
        let filteredTransactions = this.transactions;
        
        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }
        
        const recentTransactions = filteredTransactions.slice(0, 20);
        
        container.innerHTML = recentTransactions.map(transaction => {
            const category = this.categories[transaction.category];
            const isExpense = transaction.amount < 0;
            const amountClass = isExpense ? 'text-red-500' : 'text-green-500';
            const amountPrefix = isExpense ? '-' : '+';
            
            return `
                <div class="expense-item flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-green-200 transition-all">
                    <div class="flex items-center space-x-3">
                        <div class="category-icon" style="background-color: ${category.color}20; color: ${category.color};">
                            ${category.icon}
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${transaction.description}</p>
                            <p class="text-sm text-gray-500">${category.name} • ${this.formatDate(transaction.date)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold mono ${amountClass}">${amountPrefix}$${Math.abs(transaction.amount).toFixed(2)}</p>
                        <button onclick="expenseTracker.deleteTransaction(${transaction.id})" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Animate transactions
        anime({
            targets: '.expense-item',
            translateX: [-20, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(50)
        });
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.renderTransactions();
        this.updateDashboard();
        this.updateCharts();
        this.generateInsights();
        this.showNotification('Transaction deleted', 'info');
    }

    updateDashboard() {
        const currentBalance = this.calculateCurrentBalance();
        const monthlyIncome = this.calculateMonthlyIncome();
        const monthlyExpenses = this.calculateMonthlyExpenses();
        
        document.getElementById('current-balance').textContent = `$${currentBalance.toFixed(2)}`;
        
        // Animate balance change
        anime({
            targets: '#current-balance',
            scale: [1.1, 1],
            duration: 300,
            easing: 'easeOutExpo'
        });
    }

    calculateCurrentBalance() {
        return this.transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }

    calculateMonthlyIncome() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.amount > 0 && 
                       transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    calculateMonthlyExpenses() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return Math.abs(this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.amount < 0 && 
                       transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((total, transaction) => total + transaction.amount, 0));
    }

    initializeCharts() {
        this.initSpendingChart();
        this.initCategoryChart();
    }

    initSpendingChart() {
        const chartDom = document.getElementById('spending-chart');
        const myChart = echarts.init(chartDom);
        
        const last7Days = this.getLast7DaysData();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#7a9b76',
                textStyle: { color: '#2d3748' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: last7Days.map(d => d.date),
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11 }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11 },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            series: [{
                data: last7Days.map(d => d.amount),
                type: 'line',
                smooth: true,
                lineStyle: { color: '#7a9b76', width: 3 },
                itemStyle: { color: '#7a9b76' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(122, 155, 118, 0.3)' },
                            { offset: 1, color: 'rgba(122, 155, 118, 0.05)' }
                        ]
                    }
                }
            }]
        };
        
        myChart.setOption(option);
        this.spendingChart = myChart;
        
        // Animate chart
        setTimeout(() => {
            myChart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: last7Days.length - 1
            });
        }, 1000);
    }

    initCategoryChart() {
        const chartDom = document.getElementById('category-chart');
        const myChart = echarts.init(chartDom);
        
        const categoryData = this.getCategoryData();
        
        const option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#7a9b76',
                textStyle: { color: '#2d3748' },
                formatter: '{b}: ${c} ({d}%)'
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: categoryData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                }
            }]
        };
        
        myChart.setOption(option);
        this.categoryChart = myChart;
    }

    getLast7DaysData() {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayExpenses = this.transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate.toDateString() === date.toDateString() && t.amount < 0;
                })
                .reduce((total, t) => total + Math.abs(t.amount), 0);
            
            days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                amount: dayExpenses
            });
        }
        
        return days;
    }

    getCategoryData() {
        const categoryTotals = {};
        
        this.transactions
            .filter(t => t.amount < 0)
            .forEach(t => {
                const category = this.categories[t.category];
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += Math.abs(t.amount);
            });
        
        return Object.entries(categoryTotals).map(([key, value]) => ({
            name: this.categories[key].name,
            value: value,
            itemStyle: { color: this.categories[key].color }
        }));
    }

    updateCharts() {
        if (this.spendingChart) {
            const last7Days = this.getLast7DaysData();
            this.spendingChart.setOption({
                xAxis: { data: last7Days.map(d => d.date) },
                series: [{ data: last7Days.map(d => d.amount) }]
            });
        }
        
        if (this.categoryChart) {
            const categoryData = this.getCategoryData();
            this.categoryChart.setOption({
                series: [{ data: categoryData }]
            });
        }
    }

    generateInsights() {
        const insights = this.calculateInsights();
        const container = document.getElementById('insights-list');
        
        container.innerHTML = insights.map(insight => `
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-green-600 text-sm">${insight.icon}</span>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-800">${insight.title}</p>
                    <p class="text-xs text-gray-600">${insight.description}</p>
                </div>
            </div>
        `).join('');
        
        // Animate insights
        anime({
            targets: '#insights-list > div',
            translateX: [-20, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }

    calculateInsights() {
        const insights = [];
        const currentMonthExpenses = this.calculateMonthlyExpenses();
        const monthlyIncome = 5200; // Mock income
        const savingsRate = ((monthlyIncome - currentMonthExpenses) / monthlyIncome) * 100;
        
        // Savings insight
        if (savingsRate > 20) {
            insights.push({
                icon: '💰',
                title: 'Great Savings!',
                description: `You're saving ${savingsRate.toFixed(1)}% of your income this month.`
            });
        } else if (savingsRate < 10) {
            insights.push({
                icon: '⚠️',
                title: 'Low Savings',
                description: `Consider reducing expenses to increase your ${savingsRate.toFixed(1)}% savings rate.`
            });
        }
        
        // Category insights
        const categoryData = this.getCategoryData();
        const highestCategory = categoryData.reduce((max, cat) => 
            cat.value > max.value ? cat : max, { value: 0 });
        
        if (highestCategory.value > 0) {
            insights.push({
                icon: '📊',
                title: 'Top Spending Category',
                description: `${highestCategory.name} accounts for $${highestCategory.value.toFixed(2)} of your expenses.`
            });
        }
        
        // Weekly trend
        const last7Days = this.getLast7DaysData();
        const avgDailySpending = last7Days.reduce((sum, day) => sum + day.amount, 0) / 7;
        const todaySpending = last7Days[last7Days.length - 1].amount;
        
        if (todaySpending > avgDailySpending * 1.5) {
            insights.push({
                icon: '📈',
                title: 'High Daily Spending',
                description: `Today's spending ($${todaySpending.toFixed(2)}) is above your daily average.`
            });
        }
        
        return insights;
    }

    animateCounters() {
        const balanceEl = document.getElementById('current-balance');
        const targetBalance = this.calculateCurrentBalance();
        
        anime({
            targets: { value: 0 },
            value: targetBalance,
            duration: 2000,
            easing: 'easeOutExpo',
            update: function(anim) {
                balanceEl.textContent = `$${anim.animatables[0].target.value.toFixed(2)}`;
            }
        });
    }

    animateNewTransaction() {
        const firstTransaction = document.querySelector('.expense-item');
        if (firstTransaction) {
            anime({
                targets: firstTransaction,
                scale: [0.9, 1],
                backgroundColor: ['rgba(122, 155, 118, 0.2)', 'transparent'],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 500
        });
        
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                easing: 'easeInExpo',
                duration: 500,
                complete: () => notification.remove()
            });
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    handleNavigation(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Navigate to page
        if (href && href !== '#') {
            window.location.href = href;
        }
    }

    loadTransactions() {
        const saved = localStorage.getItem('expenseTrackerTransactions');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Return mock data for demonstration
        return [
            { id: 1, amount: -45.50, description: 'Grocery Store', category: 'food', type: 'expense', date: '2025-12-14T10:30:00Z', timestamp: 1734181800000 },
            { id: 2, amount: -25.00, description: 'Gas Station', category: 'transport', type: 'expense', date: '2025-12-14T08:15:00Z', timestamp: 1734173700000 },
            { id: 3, amount: 3200.00, description: 'Salary', category: 'other', type: 'income', date: '2025-12-13T09:00:00Z', timestamp: 1734086400000 },
            { id: 4, amount: -89.99, description: 'Online Shopping', category: 'shopping', type: 'expense', date: '2025-12-13T14:20:00Z', timestamp: 1734104400000 },
            { id: 5, amount: -15.50, description: 'Coffee Shop', category: 'food', type: 'expense', date: '2025-12-12T16:45:00Z', timestamp: 1734021900000 },
            { id: 6, amount: -120.00, description: 'Electric Bill', category: 'utilities', type: 'expense', date: '2025-12-12T11:00:00Z', timestamp: 1734009600000 },
            { id: 7, amount: -35.00, description: 'Movie Theater', category: 'entertainment', type: 'expense', date: '2025-12-11T19:30:00Z', timestamp: 1733940600000 },
            { id: 8, amount: 200.00, description: 'Freelance Payment', category: 'other', type: 'income', date: '2025-12-11T15:00:00Z', timestamp: 1733929200000 },
            { id: 9, amount: -67.80, description: 'Restaurant', category: 'food', type: 'expense', date: '2025-12-10T20:15:00Z', timestamp: 1733854500000 },
            { id: 10, amount: -42.30, description: 'Pharmacy', category: 'health', type: 'expense', date: '2025-12-10T13:30:00Z', timestamp: 1733837400000 }
        ];
    }

    saveTransactions() {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
    }
}

// Initialize the app
let expenseTracker;

document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
    
    // Handle window resize for charts
    window.addEventListener('resize', () => {
        if (expenseTracker.spendingChart) {
            expenseTracker.spendingChart.resize();
        }
        if (expenseTracker.categoryChart) {
            expenseTracker.categoryChart.resize();
        }
    });
});

// Export for global access
window.expenseTracker = expenseTracker;