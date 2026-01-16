// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard initializing...');
    initializeCharts();
    setupEventListeners();
    initializeData();
});

// Chart Instances
let supplyDemandChart;
let projectProgressChart;
let investmentFlowChart;
let investmentRoiChart;
let tradingVolumeChart;
let serviceTypeChart;
let budgetChart;
let fundingSourceChart;

// Initialize All Charts
function initializeCharts() {
    console.log('Initializing charts...');

    try {
        createSupplyDemandChart();
        createProjectProgressChart();
        createInvestmentFlowChart();
        createInvestmentRoiChart();
        createTradingVolumeChart();
        createServiceTypeChart();
        createBudgetChart();
        createFundingSourceChart();
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Energy Supply-Demand Chart (Area Chart)
function createSupplyDemandChart() {
    const ctx = document.getElementById('supply-demand-chart');
    if (!ctx) {
        console.warn('Supply demand chart canvas not found');
        return;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Realistic Nigeria generation data in MW (actual range 4,000-5,500 MW)
    const supplyData = [4250, 4380, 4520, 4680, 4890, 5120, 5280, 5324, 5180, 4950, 4720, 4580];
    const demandData = [8500, 8800, 9100, 9400, 9800, 10200, 10500, 10800, 10400, 9900, 9500, 9100];

    supplyDemandChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Generation (MW)',
                data: supplyData,
                backgroundColor: 'rgba(0, 135, 81, 0.3)',
                borderColor: '#008751',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Demand (MW)',
                data: demandData,
                backgroundColor: 'rgba(232, 197, 71, 0.3)',
                borderColor: '#E8C547',
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
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// NEAP Project Progress Chart (Bar Chart)
function createProjectProgressChart() {
    const ctx = document.getElementById('project-progress-chart');
    if (!ctx) {
        console.warn('Project progress chart canvas not found');
        return;
    }

    projectProgressChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Planning', 'Under Construction', 'Commissioned', 'Under Maintenance', 'Suspended'],
            datasets: [{
                label: 'Program Count',
                data: [18, 24, 42, 6, 5],
                backgroundColor: [
                    'rgba(0, 168, 107, 0.7)',
                    'rgba(0, 135, 81, 0.7)',
                    'rgba(232, 197, 71, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(183, 28, 28, 0.7)'
                ],
                borderColor: [
                    '#00A86B',
                    '#008751',
                    '#E8C547',
                    '#ff9800',
                    '#B71C1C'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
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
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Investment Flow Chart (Stacked Bar Chart)
function createInvestmentFlowChart() {
    const ctx = document.getElementById('investment-flow-chart');
    if (!ctx) {
        console.warn('Investment flow chart canvas not found');
        return;
    }

    investmentFlowChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Solar', 'Wind', 'Hydro', 'Gas', 'Grid Upgrade', 'Storage'],
            datasets: [{
                label: 'National Energy Fund ($M)',
                data: [580, 280, 420, 650, 380, 240],
                backgroundColor: 'rgba(0, 135, 81, 0.7)',
                borderColor: '#008751',
                borderWidth: 2
            }, {
                label: 'International Loan ($M)',
                data: [320, 180, 280, 220, 280, 180],
                backgroundColor: 'rgba(0, 168, 107, 0.7)',
                borderColor: '#00A86B',
                borderWidth: 2
            }, {
                label: 'Private Investment ($M)',
                data: [420, 220, 180, 380, 240, 160],
                backgroundColor: 'rgba(232, 197, 71, 0.7)',
                borderColor: '#E8C547',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                }
            }
        }
    });
}

// Investment Efficiency Bubble Chart
function createInvestmentRoiChart() {
    const ctx = document.getElementById('investment-roi-chart');
    if (!ctx) {
        console.warn('Investment ROI chart canvas not found');
        return;
    }

    investmentRoiChart = new Chart(ctx.getContext('2d'), {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Solar Programs',
                data: [
                    { x: 120, y: 14.2, r: 25 },
                    { x: 85, y: 16.8, r: 18 },
                    { x: 150, y: 12.5, r: 32 },
                    { x: 95, y: 13.8, r: 22 }
                ],
                backgroundColor: 'rgba(0, 135, 81, 0.6)',
                borderColor: '#008751',
                borderWidth: 2
            }, {
                label: 'Wind Programs',
                data: [
                    { x: 180, y: 15.5, r: 35 },
                    { x: 140, y: 13.2, r: 28 },
                    { x: 200, y: 14.8, r: 40 }
                ],
                backgroundColor: 'rgba(0, 168, 107, 0.6)',
                borderColor: '#00A86B',
                borderWidth: 2
            }, {
                label: 'Gas/Hydro Programs',
                data: [
                    { x: 80, y: 11.5, r: 15 },
                    { x: 110, y: 12.8, r: 20 }
                ],
                backgroundColor: 'rgba(232, 197, 71, 0.6)',
                borderColor: '#E8C547',
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
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Expected ROI (%)',
                        color: '#666',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#666',
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataPoint = context.raw;
                            return `${context.dataset.label}: $${dataPoint.x}M, ROI: ${dataPoint.y}%, Employment: ${dataPoint.r}M`;
                        }
                    }
                }
            }
        }
    });
}

// Trading Volume Line Chart
function createTradingVolumeChart() {
    const ctx = document.getElementById('trading-volume-chart');
    if (!ctx) {
        console.warn('Trading volume chart canvas not found');
        return;
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const volumeData = [1250, 1380, 1420, 1280, 1350, 1180, 1120];

    tradingVolumeChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Trading Volume (MWh)',
                data: volumeData,
                backgroundColor: 'rgba(0, 135, 81, 0.3)',
                borderColor: '#008751',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#008751',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
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
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Service Type Distribution Pie Chart
function createServiceTypeChart() {
    const ctx = document.getElementById('service-type-chart');
    if (!ctx) {
        console.warn('Service type chart canvas not found');
        return;
    }

    serviceTypeChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Grid Connection', 'Solar Power', 'Diesel Generators', 'Biogas', 'Microgrid'],
            datasets: [{
                data: [38, 32, 15, 8, 7],
                backgroundColor: [
                    'rgba(0, 135, 81, 0.8)',
                    'rgba(0, 168, 107, 0.8)',
                    'rgba(232, 197, 71, 0.8)',
                    'rgba(212, 168, 75, 0.8)',
                    'rgba(0, 99, 65, 0.8)'
                ],
                borderColor: [
                    '#008751',
                    '#00A86B',
                    '#E8C547',
                    '#D4A84B',
                    '#006341'
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
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                }
            }
        }
    });
}

// Budget vs Actual Expenditure Chart
function createBudgetChart() {
    const ctx = document.getElementById('budget-chart');
    if (!ctx) {
        console.warn('Budget chart canvas not found');
        return;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const budgetData = [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120];
    const actualData = [115, 118, 122, 116, 125, 121, 128, 124, 130, 127, 132, 129];

    budgetChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Budget ($M)',
                data: budgetData,
                borderColor: 'rgba(0, 0, 0, 0.3)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }, {
                label: 'Actual Expenditure ($M)',
                data: actualData,
                backgroundColor: 'rgba(0, 135, 81, 0.3)',
                borderColor: '#008751',
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
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Funding Source Composition Pie Chart
function createFundingSourceChart() {
    const ctx = document.getElementById('funding-source-chart');
    if (!ctx) {
        console.warn('Funding source chart canvas not found');
        return;
    }

    fundingSourceChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['National Energy Fund', 'International Bank Loan', 'Private Investment', 'Bilateral Aid', 'Other'],
            datasets: [{
                data: [42, 28, 18, 8, 4],
                backgroundColor: [
                    'rgba(0, 135, 81, 0.8)',
                    'rgba(0, 168, 107, 0.8)',
                    'rgba(232, 197, 71, 0.8)',
                    'rgba(212, 168, 75, 0.8)',
                    'rgba(0, 99, 65, 0.8)'
                ],
                borderColor: [
                    '#008751',
                    '#00A86B',
                    '#E8C547',
                    '#D4A84B',
                    '#006341'
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
                        font: {
                            size: 11
                        },
                        padding: 10
                    }
                }
            }
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Refresh Button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }

    // Export Button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Settings Button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // Time Filter
    const timeFilter = document.getElementById('time-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', updateDashboard);
    }

    // Region Filter
    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) {
        regionFilter.addEventListener('change', updateDashboard);
    }

    // Close Finance Modal
    const closeFinanceModal = document.getElementById('close-finance-modal');
    if (closeFinanceModal) {
        closeFinanceModal.addEventListener('click', function () {
            document.getElementById('finance-modal').classList.remove('active');
        });
    }

    // Click Outside Modal to Close
    const financeModal = document.getElementById('finance-modal');
    if (financeModal) {
        financeModal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
}

// Initialize Data
function initializeData() {
    console.log('Dashboard initialized');
    // Create settings modal dynamically
    createSettingsModal();
}

// Regional Data Sets for Simulation
const regionalData = {
    national: {
        generation: 5324,
        emissions: 98.2,
        investment: 4.2,
        progress: 58.7,
        supplyData: [4250, 4380, 4520, 4680, 4890, 5120, 5280, 5324, 5180, 4950, 4720, 4580],
        demandData: [8500, 8800, 9100, 9400, 9800, 10200, 10500, 10800, 10400, 9900, 9500, 9100],
        projects: { planning: 18, construction: 24, commissioned: 42, maintenance: 6, suspended: 5 }
    },
    north: {
        generation: 1420,
        emissions: 28.5,
        investment: 1.1,
        progress: 52.3,
        supplyData: [1180, 1220, 1280, 1350, 1380, 1420, 1450, 1480, 1420, 1380, 1320, 1280],
        demandData: [2800, 2900, 3000, 3100, 3200, 3350, 3450, 3550, 3400, 3250, 3100, 3000],
        projects: { planning: 6, construction: 8, commissioned: 12, maintenance: 2, suspended: 2 }
    },
    south: {
        generation: 1850,
        emissions: 32.4,
        investment: 1.4,
        progress: 68.2,
        supplyData: [1580, 1650, 1720, 1780, 1820, 1880, 1920, 1950, 1880, 1820, 1750, 1700],
        demandData: [3200, 3350, 3500, 3650, 3800, 4000, 4150, 4280, 4100, 3900, 3700, 3550],
        projects: { planning: 5, construction: 7, commissioned: 14, maintenance: 2, suspended: 1 }
    },
    west: {
        generation: 1280,
        emissions: 22.8,
        investment: 1.0,
        progress: 61.5,
        supplyData: [1050, 1100, 1150, 1200, 1250, 1320, 1350, 1380, 1320, 1280, 1220, 1180],
        demandData: [2100, 2200, 2300, 2400, 2500, 2650, 2750, 2850, 2700, 2550, 2400, 2300],
        projects: { planning: 4, construction: 5, commissioned: 10, maintenance: 1, suspended: 1 }
    },
    east: {
        generation: 774,
        emissions: 14.5,
        investment: 0.7,
        progress: 48.9,
        supplyData: [640, 680, 720, 760, 800, 850, 880, 920, 880, 820, 760, 720],
        demandData: [1600, 1700, 1800, 1900, 2000, 2150, 2250, 2350, 2200, 2050, 1900, 1800],
        projects: { planning: 3, construction: 4, commissioned: 6, maintenance: 1, suspended: 1 }
    }
};

// Time Period Multipliers
const timePeriodMultipliers = {
    '2024': 1.0,
    '2023': 0.92,
    'q4-2024': 1.05,
    'q3-2024': 0.98
};

// Refresh Data with Animation
function refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    const icon = refreshBtn.querySelector('i');

    if (icon) {
        icon.classList.add('fa-spin');
        refreshBtn.disabled = true;

        // Simulate API Call with realistic delay
        setTimeout(() => {
            // Add random variation to simulate live data
            updateKPIsWithVariation();
            updateChartsWithVariation();
            showNotification('Data refreshed successfully!', 'success');

            icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }, 1500);
    }
}

// Update KPI Data with random variation
function updateKPIsWithVariation() {
    const timeFilter = document.getElementById('time-filter')?.value || '2024';
    const regionFilter = document.getElementById('region-filter')?.value || 'national';
    const data = regionalData[regionFilter];
    const multiplier = timePeriodMultipliers[timeFilter];

    // Add small random variation (-2% to +2%)
    const variation = () => 0.98 + Math.random() * 0.04;

    // Update KPI values in DOM
    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length >= 4) {
        kpiValues[0].textContent = Math.round(data.generation * multiplier * variation()).toLocaleString() + ' MW';
        kpiValues[1].textContent = (data.emissions * multiplier * variation()).toFixed(1) + 'Mt';
        kpiValues[2].textContent = '$' + (data.investment * multiplier * variation()).toFixed(1) + 'B';
        kpiValues[3].textContent = (data.progress * multiplier * variation()).toFixed(1) + '%';
    }
}

// Update KPI Data (called by filter changes)
function updateKPIs() {
    const timeFilter = document.getElementById('time-filter')?.value || '2024';
    const regionFilter = document.getElementById('region-filter')?.value || 'national';
    const data = regionalData[regionFilter];
    const multiplier = timePeriodMultipliers[timeFilter];

    // Update KPI values in DOM
    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length >= 4) {
        kpiValues[0].textContent = Math.round(data.generation * multiplier).toLocaleString() + ' MW';
        kpiValues[1].textContent = (data.emissions * multiplier).toFixed(1) + 'Mt';
        kpiValues[2].textContent = '$' + (data.investment * multiplier).toFixed(1) + 'B';
        kpiValues[3].textContent = (data.progress * multiplier).toFixed(1) + '%';
    }
}

// Update Charts with variation for refresh
function updateChartsWithVariation() {
    const regionFilter = document.getElementById('region-filter')?.value || 'national';
    const data = regionalData[regionFilter];

    // Update supply/demand chart with variation
    if (supplyDemandChart) {
        supplyDemandChart.data.datasets[0].data = data.supplyData.map(v => v + Math.floor(Math.random() * 100 - 50));
        supplyDemandChart.data.datasets[1].data = data.demandData.map(v => v + Math.floor(Math.random() * 200 - 100));
        supplyDemandChart.update('active');
    }

    // Update project progress chart
    if (projectProgressChart) {
        const p = data.projects;
        projectProgressChart.data.datasets[0].data = [
            p.planning + Math.floor(Math.random() * 3 - 1),
            p.construction + Math.floor(Math.random() * 3 - 1),
            p.commissioned + Math.floor(Math.random() * 3 - 1),
            p.maintenance + Math.floor(Math.random() * 2 - 1),
            p.suspended
        ];
        projectProgressChart.update('active');
    }
}

// Update Dashboard (called when filters change)
function updateDashboard() {
    const timeFilter = document.getElementById('time-filter')?.value || '2024';
    const regionFilter = document.getElementById('region-filter')?.value || 'national';
    const data = regionalData[regionFilter];
    const multiplier = timePeriodMultipliers[timeFilter];

    console.log('Filter changed:', timeFilter, regionFilter);

    // Show loading state
    showNotification(`Loading ${regionFilter.toUpperCase()} data for ${timeFilter}...`, 'info');

    // Update KPIs
    updateKPIs();

    // Update Charts with regional data
    setTimeout(() => {
        if (supplyDemandChart) {
            supplyDemandChart.data.datasets[0].data = data.supplyData.map(v => Math.round(v * multiplier));
            supplyDemandChart.data.datasets[1].data = data.demandData.map(v => Math.round(v * multiplier));
            supplyDemandChart.update('active');
        }

        if (projectProgressChart) {
            const p = data.projects;
            projectProgressChart.data.datasets[0].data = [p.planning, p.construction, p.commissioned, p.maintenance, p.suspended];
            projectProgressChart.update('active');
        }

        showNotification(`Showing ${regionFilter.toUpperCase()} region data`, 'success');
    }, 500);
}

// Export Data Function - Generates CSV
function exportData() {
    console.log('Exporting dashboard data...');

    const timeFilter = document.getElementById('time-filter')?.value || '2024';
    const regionFilter = document.getElementById('region-filter')?.value || 'national';
    const data = regionalData[regionFilter];
    const multiplier = timePeriodMultipliers[timeFilter];

    // Create CSV content
    let csvContent = 'NEFUND Dashboard Export\n';
    csvContent += `Region: ${regionFilter.toUpperCase()}\n`;
    csvContent += `Time Period: ${timeFilter}\n`;
    csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

    csvContent += 'KEY PERFORMANCE INDICATORS\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Grid Generation Capacity,${Math.round(data.generation * multiplier)} MW\n`;
    csvContent += `Carbon Emissions,${(data.emissions * multiplier).toFixed(1)} Mt\n`;
    csvContent += `Total Investment,$${(data.investment * multiplier).toFixed(1)}B\n`;
    csvContent += `NEAP Progress,${(data.progress * multiplier).toFixed(1)}%\n\n`;

    csvContent += 'MONTHLY GENERATION DATA (MW)\n';
    csvContent += 'Month,Generation,Demand\n';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month, i) => {
        csvContent += `${month},${Math.round(data.supplyData[i] * multiplier)},${Math.round(data.demandData[i] * multiplier)}\n`;
    });

    csvContent += '\nPROJECT STATUS\n';
    csvContent += 'Status,Count\n';
    csvContent += `Planning,${data.projects.planning}\n`;
    csvContent += `Under Construction,${data.projects.construction}\n`;
    csvContent += `Commissioned,${data.projects.commissioned}\n`;
    csvContent += `Under Maintenance,${data.projects.maintenance}\n`;
    csvContent += `Suspended,${data.projects.suspended}\n`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NEFUND_Dashboard_${regionFilter}_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('Dashboard data exported to CSV!', 'success');
}

// Settings Modal
function createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content settings-modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-cog"></i> Dashboard Settings</h3>
                <button id="close-settings-modal" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h4>Display Options</h4>
                    <label class="settings-option">
                        <input type="checkbox" id="auto-refresh" checked>
                        <span>Auto-refresh data (every 5 minutes)</span>
                    </label>
                    <label class="settings-option">
                        <input type="checkbox" id="show-animations" checked>
                        <span>Enable chart animations</span>
                    </label>
                    <label class="settings-option">
                        <input type="checkbox" id="dark-mode">
                        <span>Dark mode (coming soon)</span>
                    </label>
                </div>
                <div class="settings-section">
                    <h4>Data Preferences</h4>
                    <label class="settings-option">
                        <span>Default Region:</span>
                        <select id="default-region">
                            <option value="national">National</option>
                            <option value="north">Northern</option>
                            <option value="south">Southern</option>
                            <option value="west">Western</option>
                            <option value="east">Eastern</option>
                        </select>
                    </label>
                    <label class="settings-option">
                        <span>Data Currency:</span>
                        <select id="currency-pref">
                            <option value="usd">USD ($)</option>
                            <option value="ngn">NGN (₦)</option>
                        </select>
                    </label>
                </div>
                <div class="settings-section">
                    <h4>Notifications</h4>
                    <label class="settings-option">
                        <input type="checkbox" id="alert-notifications" checked>
                        <span>Show system alerts</span>
                    </label>
                    <label class="settings-option">
                        <input type="checkbox" id="sound-notifications">
                        <span>Enable sound notifications</span>
                    </label>
                </div>
                <div class="settings-actions">
                    <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                    <button class="btn" onclick="closeSettingsModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal events
    document.getElementById('close-settings-modal')?.addEventListener('click', closeSettingsModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSettingsModal();
    });
}

// Open Settings Modal
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close Settings Modal
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save Settings
function saveSettings() {
    const settings = {
        autoRefresh: document.getElementById('auto-refresh')?.checked,
        showAnimations: document.getElementById('show-animations')?.checked,
        darkMode: document.getElementById('dark-mode')?.checked,
        defaultRegion: document.getElementById('default-region')?.value,
        currency: document.getElementById('currency-pref')?.value,
        alertNotifications: document.getElementById('alert-notifications')?.checked,
        soundNotifications: document.getElementById('sound-notifications')?.checked
    };

    localStorage.setItem('nefundSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
    closeSettingsModal();
}

// Show Notification Toast
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Navigate to System
function navigateToSystem(system) {
    console.log('Navigating to system:', system);
    alert('Entering ' + system.toUpperCase() + ' System');
}

// Navigate to Finance Module (Modal)
function navigateToFinance() {
    const modal = document.getElementById('finance-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Navigate to Finance Dashboard Page
function navigateToFinancePage() {
    window.location.href = 'finance.html';
}

// View Project Details
function viewProjectDetail() {
    console.log('Viewing project detail');
    alert('View Project Details Page');
}

// 添加新警报
function addAlert(type, title, time, detail) {
    const alertList = document.getElementById('alert-list');
    if (!alertList) return;

    const alertItem = document.createElement('div');
    alertItem.className = `alert-item alert-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'critical') iconClass = 'fa-bolt';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    alertItem.innerHTML = `
        <div class="alert-icon"><i class="fas ${iconClass}"></i></div>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-time">${time}</div>
            <div class="alert-detail">${detail}</div>
        </div>
    `;

    alertList.insertBefore(alertItem, alertList.firstChild);
}

// Add News Update
function addNews(title, time) {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';

    newsItem.innerHTML = `
        <div class="news-icon"><i class="fas fa-check-circle"></i></div>
        <div class="news-content">
            <div class="news-title">${title}</div>
            <div class="news-time">${time}</div>
        </div>
    `;

    newsList.insertBefore(newsItem, newsList.firstChild);
}

// 全局函数暴露
window.navigateToSystem = navigateToSystem;
window.navigateToFinance = navigateToFinance;
window.navigateToFinancePage = navigateToFinancePage;
window.viewProjectDetail = viewPro