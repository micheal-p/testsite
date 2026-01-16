// Finance Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('Finance Dashboard initializing...');
    initializeCharts();
    setupEventListeners();
    initializeData();
});

// Chart Instances
let budgetExecutionChart;
let fundingSourceChart;
let fundingTimelineChart;
let investmentDistributionChart;
let projectRoiChart;
let roiPredictionChart;
let cashflowChart;
let expenseCategoryChart;

// Initialize All Charts
function initializeCharts() {
    console.log('Initializing finance charts...');

    try {
        createBudgetExecutionChart();
        createFundingSourceChart();
        createFundingTimelineChart();
        createInvestmentDistributionChart();
        createProjectRoiChart();
        createRoiPredictionChart();
        createCashflowChart();
        createExpenseCategoryChart();
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Budget Execution Status Chart
function createBudgetExecutionChart() {
    const ctx = document.getElementById('budget-execution-chart');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const budgetData = [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400];
    const actualData = [380, 395, 410, 385, 420, 405, 425, 415, 430, 420, 440, 435];

    budgetExecutionChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Budget ($M)',
                data: budgetData,
                backgroundColor: 'rgba(0, 135, 81, 0.6)',
                borderColor: '#008751',
                borderWidth: 2
            }, {
                label: 'Actual Expenditure ($M)',
                data: actualData,
                backgroundColor: 'rgba(232, 197, 71, 0.6)',
                borderColor: '#E8C547',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Funding Source Composition Pie Chart
function createFundingSourceChart() {
    const ctx = document.getElementById('funding-source-chart');
    if (!ctx) return;

    fundingSourceChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['National Energy Fund', 'World Bank', 'African Development Bank', 'EU Aid', 'Bilateral Aid', 'Private Investment'],
            datasets: [{
                data: [42, 22, 14, 8, 6, 8],
                backgroundColor: [
                    'rgba(0, 135, 81, 0.8)',
                    'rgba(0, 168, 107, 0.8)',
                    'rgba(232, 197, 71, 0.8)',
                    'rgba(212, 168, 75, 0.8)',
                    'rgba(0, 99, 65, 0.8)',
                    'rgba(255, 200, 100, 0.8)'
                ],
                borderColor: [
                    '#008751', '#00A86B', '#E8C547', '#D4A84B', '#006341', '#FFC864'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: { size: 10 },
                        padding: 8
                    }
                }
            }
        }
    });
}

// Funding Disbursement Timeline Chart
function createFundingTimelineChart() {
    const ctx = document.getElementById('funding-timeline-chart');
    if (!ctx) return;

    const quarters = ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1 (Forecast)', '2025 Q2 (Forecast)'];
    const fundingData = [0.6, 1.2, 1.5, 0.5, 0.4, 0.6];

    fundingTimelineChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: quarters,
            datasets: [{
                label: 'Funding Received ($B)',
                data: fundingData,
                backgroundColor: 'rgba(0, 135, 81, 0.3)',
                borderColor: '#008751',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#008751',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 9 }
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 11 },
                        callback: function (value) {
                            return '$' + value + 'B';
                        }
                    }
                }
            }
        }
    });
}

// Project Investment Distribution Chart
function createInvestmentDistributionChart() {
    const ctx = document.getElementById('investment-distribution-chart');
    if (!ctx) return;

    investmentDistributionChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Solar', 'Wind', 'Hydro', 'Gas', 'Grid', 'Storage', 'Microgrid', 'Training'],
            datasets: [{
                label: 'Investment ($M)',
                data: [920, 380, 420, 580, 720, 480, 340, 200],
                backgroundColor: [
                    'rgba(0, 135, 81, 0.7)',
                    'rgba(0, 168, 107, 0.7)',
                    'rgba(232, 197, 71, 0.7)',
                    'rgba(212, 168, 75, 0.7)',
                    'rgba(0, 99, 65, 0.7)',
                    'rgba(255, 200, 100, 0.7)',
                    'rgba(0, 75, 45, 0.7)',
                    'rgba(180, 160, 60, 0.7)'
                ],
                borderColor: [
                    '#008751', '#00A86B', '#E8C547', '#D4A84B', '#006341', '#FFC864', '#004B2D', '#B4A03C'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 10 },
                        callback: function (value) {
                            return '$' + value + 'M';
                        }
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Project ROI Bubble Chart
function createProjectRoiChart() {
    const ctx = document.getElementById('project-roi-chart');
    if (!ctx) return;

    projectRoiChart = new Chart(ctx.getContext('2d'), {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Solar Programs',
                data: [
                    { x: 120, y: 14.2, r: 25 },
                    { x: 85, y: 16.8, r: 18 },
                    { x: 150, y: 12.5, r: 32 },
                    { x: 95, y: 13.8, r: 22 },
                    { x: 110, y: 15.1, r: 20 }
                ],
                backgroundColor: 'rgba(255, 152, 0, 0.6)',
                borderColor: '#ff9800',
                borderWidth: 2
            }, {
                label: 'Wind Programs',
                data: [
                    { x: 180, y: 15.5, r: 35 },
                    { x: 140, y: 13.2, r: 28 },
                    { x: 200, y: 14.8, r: 40 }
                ],
                backgroundColor: 'rgba(33, 150, 243, 0.6)',
                borderColor: '#2196f3',
                borderWidth: 2
            }, {
                label: 'Storage Programs',
                data: [
                    { x: 180, y: 18.5, r: 38 },
                    { x: 165, y: 17.2, r: 35 }
                ],
                backgroundColor: 'rgba(255, 87, 34, 0.6)',
                borderColor: '#ff5722',
                borderWidth: 2
            }, {
                label: 'Microgrid Programs',
                data: [
                    { x: 45, y: 11.8, r: 15 },
                    { x: 65, y: 12.5, r: 18 },
                    { x: 55, y: 13.1, r: 16 }
                ],
                backgroundColor: 'rgba(156, 39, 176, 0.6)',
                borderColor: '#9c27b0',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Investment ($M)',
                        color: '#666',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#666', font: { size: 10 } }
                },
                y: {
                    title: {
                        display: true,
                        text: 'ROI (%)',
                        color: '#666',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#666', font: { size: 10 } }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: { size: 10 },
                        padding: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataPoint = context.raw;
                            return `${context.dataset.label}: $${dataPoint.x}M, ROI: ${dataPoint.y}%`;
                        }
                    }
                }
            }
        }
    });
}

// Investment Return Forecast Chart
function createRoiPredictionChart() {
    const ctx = document.getElementById('roi-prediction-chart');
    if (!ctx) return;

    const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const actualRoi = [10.5, 13.8, null, null, null, null, null];
    const predictedRoi = [10.5, 13.8, 15.2, 16.1, 16.8, 17.2, 17.5];

    roiPredictionChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Actual ROI',
                data: actualRoi,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#4caf50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }, {
                label: 'Forecast ROI',
                data: predictedRoi,
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.3)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff9800',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: { size: 10 },
                        padding: 8
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#666', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 11 },
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Cash Flow Chart
function createCashflowChart() {
    const ctx = document.getElementById('cashflow-chart');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const inflow = [280, 320, 295, 350, 380, 410, 390, 430, 460, 440, 480, 510];
    const outflow = [250, 280, 270, 300, 320, 350, 340, 370, 400, 390, 420, 450];

    cashflowChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Cash Inflow ($M)',
                data: inflow,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Cash Outflow ($M)',
                data: outflow,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: { size: 10 },
                        padding: 8
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#666', font: { size: 9 } }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        color: '#666',
                        font: { size: 10 },
                        callback: function (value) {
                            return '$' + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

// Expense Category Statistics Chart
function createExpenseCategoryChart() {
    const ctx = document.getElementById('expense-category-chart');
    if (!ctx) return;

    expenseCategoryChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Equipment Procurement', 'Construction', 'Personnel', 'Operations & Maintenance', 'Training', 'Other'],
            datasets: [{
                data: [35, 28, 15, 12, 5, 5],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(156, 39, 176, 0.8)',
                    'rgba(0, 188, 212, 0.8)',
                    'rgba(96, 125, 139, 0.8)'
                ],
                borderColor: [
                    '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#607d8b'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: { size: 10 },
                        padding: 8
                    }
                }
            }
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Refresh Button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }

    // Export Button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportFinanceData);
    }

    // Year Filter
    const yearFilter = document.getElementById('year-filter');
    if (yearFilter) {
        yearFilter.addEventListener('change', updateFinanceDashboard);
    }

    // Category Filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateFinanceDashboard);
    }

    // Project Status Filter
    const projectStatusFilter = document.getElementById('project-status-filter');
    if (projectStatusFilter) {
        projectStatusFilter.addEventListener('change', filterProjects);
    }
}

// Finance Data Sets for Simulation
const financeData = {
    '2024': {
        budget: 4.8,
        mobilized: 3.8,
        roi: 13.8,
        pending: 1.0,
        budgetExecution: [380, 395, 410, 385, 420, 405, 425, 415, 430, 420, 440, 435],
        actualExpense: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400],
        fundingTimeline: [0.6, 1.2, 1.5, 0.5],
        cashInflow: [280, 320, 295, 350, 380, 410, 390, 430, 460, 440, 480, 510],
        cashOutflow: [250, 280, 270, 300, 320, 350, 340, 370, 400, 390, 420, 450]
    },
    '2023': {
        budget: 4.2,
        mobilized: 3.1,
        roi: 11.7,
        pending: 1.1,
        budgetExecution: [340, 355, 370, 345, 380, 365, 385, 375, 390, 380, 400, 395],
        actualExpense: [360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360],
        fundingTimeline: [0.5, 0.9, 1.2, 0.5],
        cashInflow: [240, 280, 255, 310, 340, 370, 350, 390, 420, 400, 440, 470],
        cashOutflow: [210, 240, 230, 260, 280, 310, 300, 330, 360, 350, 380, 410]
    },
    '2025': {
        budget: 5.5,
        mobilized: 4.4,
        roi: 15.2,
        pending: 1.1,
        budgetExecution: [420, 435, 450, 425, 460, 445, 465, 455, 470, 460, 480, 475],
        actualExpense: [440, 440, 440, 440, 440, 440, 440, 440, 440, 440, 440, 440],
        fundingTimeline: [0.8, 1.5, 1.8, 0.7],
        cashInflow: [320, 360, 335, 390, 420, 450, 430, 470, 500, 480, 520, 550],
        cashOutflow: [290, 320, 310, 340, 360, 390, 380, 410, 440, 430, 460, 490]
    }
};

// Project Data
const projectsData = [
    { id: 'P001', name: 'Lagos 50MW Solar Power Plant', type: 'National Fund', investment: 120, disbursed: 90, progress: 75, roi: 14.2, status: 'active', category: 'investment' },
    { id: 'P002', name: 'Kaduna 100MW Solar Plant', type: 'World Bank Loan', investment: 85, disbursed: 85, progress: 100, roi: 16.8, status: 'completed', category: 'loan' },
    { id: 'P003', name: 'Niger Delta 50MW Wind Power', type: 'AfDB', investment: 95, disbursed: 85, progress: 90, roi: 13.5, status: 'active', category: 'loan' },
    { id: 'P004', name: 'Abuja Microgrid Phase 2', type: 'Private Investment', investment: 45, disbursed: 18, progress: 40, roi: 11.8, status: 'active', category: 'investment' },
    { id: 'P005', name: 'National Storage Center', type: 'National Fund + EU Grant', investment: 180, disbursed: 0, progress: 0, roi: null, status: 'planned', category: 'grant' },
    { id: 'P006', name: 'Rural Electrification Phase 3', type: 'Bilateral Aid (Germany)', investment: 65, disbursed: 52, progress: 80, roi: 15.2, status: 'active', category: 'grant' },
    { id: 'P007', name: 'Kano 80MW Gas Turbine', type: 'National Fund', investment: 150, disbursed: 120, progress: 85, roi: 12.4, status: 'active', category: 'investment' },
    { id: 'P008', name: 'Port Harcourt Grid Extension', type: 'World Bank Loan', investment: 110, disbursed: 110, progress: 100, roi: 14.8, status: 'completed', category: 'loan' }
];

// Initialize Data
function initializeData() {
    console.log('Finance Dashboard initialized');
    renderProjectTable(projectsData);
}

// Refresh Data with Animation
function refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    const icon = refreshBtn.querySelector('i');

    if (icon) {
        icon.classList.add('fa-spin');
        refreshBtn.disabled = true;

        setTimeout(() => {
            updateKPIsWithVariation();
            updateChartsWithVariation();
            showNotification('Financial data refreshed successfully!', 'success');

            icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }, 1500);
    }
}

// Update KPIs with random variation
function updateKPIsWithVariation() {
    const yearFilter = document.getElementById('year-filter')?.value || '2024';
    const data = financeData[yearFilter];
    const variation = () => 0.98 + Math.random() * 0.04;

    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length >= 4) {
        kpiValues[0].textContent = '$' + (data.budget * variation()).toFixed(1) + 'B';
        kpiValues[1].textContent = '$' + (data.mobilized * variation()).toFixed(1) + 'B';
        kpiValues[2].textContent = (data.roi * variation()).toFixed(1) + '%';
        kpiValues[3].textContent = '$' + (data.pending * variation()).toFixed(1) + 'B';
    }
}

// Update Charts with variation
function updateChartsWithVariation() {
    const yearFilter = document.getElementById('year-filter')?.value || '2024';
    const data = financeData[yearFilter];

    if (budgetExecutionChart) {
        budgetExecutionChart.data.datasets[1].data = data.budgetExecution.map(v => v + Math.floor(Math.random() * 20 - 10));
        budgetExecutionChart.update('active');
    }

    if (cashflowChart) {
        cashflowChart.data.datasets[0].data = data.cashInflow.map(v => v + Math.floor(Math.random() * 30 - 15));
        cashflowChart.data.datasets[1].data = data.cashOutflow.map(v => v + Math.floor(Math.random() * 25 - 12));
        cashflowChart.update('active');
    }
}

// Update Dashboard (called when filters change)
function updateFinanceDashboard() {
    const yearFilter = document.getElementById('year-filter')?.value || '2024';
    const categoryFilter = document.getElementById('category-filter')?.value || 'all';
    const data = financeData[yearFilter];

    console.log('Filter changed:', yearFilter, categoryFilter);
    showNotification(`Loading ${yearFilter} data...`, 'info');

    // Update KPIs
    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length >= 4) {
        kpiValues[0].textContent = '$' + data.budget.toFixed(1) + 'B';
        kpiValues[1].textContent = '$' + data.mobilized.toFixed(1) + 'B';
        kpiValues[2].textContent = data.roi.toFixed(1) + '%';
        kpiValues[3].textContent = '$' + data.pending.toFixed(1) + 'B';
    }

    // Update Charts
    setTimeout(() => {
        if (budgetExecutionChart) {
            budgetExecutionChart.data.datasets[0].data = data.actualExpense;
            budgetExecutionChart.data.datasets[1].data = data.budgetExecution;
            budgetExecutionChart.update('active');
        }

        if (fundingTimelineChart) {
            fundingTimelineChart.data.datasets[0].data = data.fundingTimeline;
            fundingTimelineChart.update('active');
        }

        if (cashflowChart) {
            cashflowChart.data.datasets[0].data = data.cashInflow;
            cashflowChart.data.datasets[1].data = data.cashOutflow;
            cashflowChart.update('active');
        }

        // Filter projects by category
        let filteredProjects = projectsData;
        if (categoryFilter !== 'all') {
            filteredProjects = projectsData.filter(p => p.category === categoryFilter);
        }
        renderProjectTable(filteredProjects);

        showNotification(`Showing ${yearFilter} financial data`, 'success');
    }, 500);
}

// Filter Projects by Status
function filterProjects() {
    const statusFilter = document.getElementById('project-status-filter')?.value || 'all';
    const categoryFilter = document.getElementById('category-filter')?.value || 'all';

    let filteredProjects = projectsData;

    if (statusFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.category === categoryFilter);
    }

    renderProjectTable(filteredProjects);
    showNotification(`Showing ${filteredProjects.length} projects`, 'info');
}

// Render Project Table
function renderProjectTable(projects) {
    const tbody = document.querySelector('.investment-table tbody');
    if (!tbody) {
        console.error('Project table tbody not found');
        return;
    }

    // Clear existing content explicitly
    tbody.innerHTML = '';

    tbody.innerHTML = projects.map(project => `
        <tr>
            <td>${project.name}</td>
            <td>${project.type}</td>
            <td>$${project.investment}M</td>
            <td>$${project.disbursed}M</td>
            <td>${project.progress}%</td>
            <td>${project.roi ? project.roi + '%' : '-'}</td>
            <td><span class="status-badge status-${project.status}">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="viewProjectDetail('${project.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

// Export Finance Data to CSV
function exportFinanceData() {
    const yearFilter = document.getElementById('year-filter')?.value || '2024';
    const data = financeData[yearFilter];

    let csvContent = 'NEFUND Financial Dashboard Export\n';
    csvContent += `Year: ${yearFilter}\n`;
    csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

    csvContent += 'KEY PERFORMANCE INDICATORS\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Annual Budget,$${data.budget}B\n`;
    csvContent += `Mobilized Funds,$${data.mobilized}B\n`;
    csvContent += `Return on Investment,${data.roi}%\n`;
    csvContent += `Pending Disbursement,$${data.pending}B\n\n`;

    csvContent += 'PROGRAM LIST\n';
    csvContent += 'Program Name,Investment Type,Investment,Disbursed,Progress,ROI,Status\n';
    projectsData.forEach(p => {
        csvContent += `${p.name},${p.type},$${p.investment}M,$${p.disbursed}M,${p.progress}%,${p.roi || '-'},${p.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NEFUND_Finance_${yearFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('Financial data exported to CSV!', 'success');
}

// Show Notification Toast
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Navigate to Main Dashboard
function navigateToMain() {
    window.location.href = 'dashboard.html';
}

// View Project Details (Modal)
function viewProjectDetail(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'project-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-project-diagram"></i> ${project.name}</h3>
                <button class="close-btn" onclick="closeProjectModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="finance-kpi-grid">
                    <div class="finance-kpi-card">
                        <div class="finance-kpi-label">Total Investment</div>
                        <div class="finance-kpi-value">$${project.investment}M</div>
                    </div>
                    <div class="finance-kpi-card">
                        <div class="finance-kpi-label">Amount Disbursed</div>
                        <div class="finance-kpi-value">$${project.disbursed}M</div>
                    </div>
                    <div class="finance-kpi-card">
                        <div class="finance-kpi-label">Progress</div>
                        <div class="finance-kpi-value">${project.progress}%</div>
                    </div>
                    <div class="finance-kpi-card">
                        <div class="finance-kpi-label">ROI</div>
                        <div class="finance-kpi-value">${project.roi ? project.roi + '%' : 'N/A'}</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <p><strong>Funding Type:</strong> ${project.type}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${project.status}">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></p>
                    <p><strong>Category:</strong> ${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</p>
                </div>
                <div class="progress-bar-container" style="margin-top: 20px;">
                    <label>Disbursement Progress</label>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(project.disbursed / project.investment * 100)}%; background: linear-gradient(90deg, #008751, #00A86B);"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeProjectModal(); });
}

// Close Project Modal
function closeProjectModal() {
    const modal = document.getElementById('project-detail-modal');
    if (modal) modal.remove();
}

// Add New Project
function addNewProject() {
    showNotification('Opening new project form...', 'info');
}

// Global Functions
window.navigateToMain = navigateToMain;
window.viewProjectDetail = viewProjectDetail;
window.addNewProject = addNewProject;
window.closeProjectModal = closeProjectModal;
window.filterProjects = filterProjects;