// Admin Dashboard Dummy Data & Logic

const geoData = [
  {
    region: "North Central",
    states: ["Abuja", "Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
  },
  {
    region: "South West",
    states: ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
  },
  {
    region: "South East",
    states: ["Enugu", "Abia", "Anambra", "Ebonyi", "Imo"],
  },
  {
    region: "North West",
    states: [
      "Kano",
      "Kaduna",
      "Katsina",
      "Jigawa",
      "Kebbi",
      "Sokoto",
      "Zamfara",
    ],
  },
];

let vettingQueue = [
  {
    id: "v_001",
    fullName: "Ibrahim Musa",
    businessName: "Zuma Solar Ltd",
    nin: "54238812991",
    cacUrl: "https://storage.provider.com/cac/zuma_cert.pdf",
    status: "Pending",
    appliedDate: "2026-03-01",
  },
  {
    id: "v_002",
    fullName: "Blessing Udoh",
    businessName: "Sunshine Power",
    nin: "10985512234",
    cacUrl: "https://storage.provider.com/cac/sunshine_cert.pdf",
    status: "Pending",
    appliedDate: "2026-03-02",
  },
  {
    id: "v_003",
    fullName: "Abeeb Olowo",
    businessName: "Olowo Energy",
    nin: "88219914442",
    cacUrl: "https://storage.provider.com/cac/olowo_cert.pdf",
    status: "Verified",
    appliedDate: "2026-02-28",
  },
];

let loans = [
  {
    loanId: "LN-772",
    customer: "Chinedu Okoro",
    amount: 1250000,
    location: { state: "Enugu", region: "South East" },
    vendor: "Zuma Solar Ltd",
    status: "In Progress",
    items: ["3kVA Hybrid Inverter", "2x 200Ah Lithium Battery"],
  },
  {
    loanId: "LN-773",
    customer: "Fatima Yusuf",
    amount: 450000,
    location: { state: "Kano", region: "North West" },
    vendor: "Olowo Energy",
    status: "Given",
    items: ["500W Solar Panel Array"],
  },
  {
    loanId: "LN-774",
    customer: "Emeka John",
    amount: 2100000,
    location: { state: "Lagos", region: "South West" },
    vendor: "Sunshine Power",
    status: "Denied",
    items: [
      "5kVA Hybrid Inverter",
      "4x 200Ah Lithium Battery",
      "10x 500W Solar Panel",
    ],
  },
  {
    loanId: "LN-775",
    customer: "Sani Bello",
    amount: 3200000,
    location: { state: "Abuja", region: "North Central" },
    vendor: "Zuma Solar Ltd",
    status: "In Progress",
    items: [
      "10kVA Hybrid Inverter",
      "8x 200Ah Lithium Battery",
      "20x 500W Solar Panel",
    ],
  },
];

let vendors = [
  {
    vendorId: "VEN-001",
    businessName: "Zuma Solar Solutions",
    ownerName: "Ibrahim Musa",
    location: { state: "Abuja", region: "North Central" },
    kyc: { nin: "5423 **** 891", cacNumber: "RC-1234567" },
    status: "Active", // Mapped to accountStatus
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 142, listedProducts: 12, rating: 4.9 },
    products: [
      { name: "550W Mono Panel", category: "Panels", price: 95000, stock: 50 },
      {
        name: "5kVA Hybrid Inverter",
        category: "Inverters",
        price: 480000,
        stock: 8,
      },
    ],
  },
  {
    vendorId: "VEN-002",
    businessName: "Lekki Energy Hub",
    ownerName: "Oluwaseun Adeyemi",
    location: { state: "Lagos", region: "South West" },
    kyc: { nin: "1098 **** 234", cacNumber: "BN-9876543" },
    status: "Active",
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 89, listedProducts: 25, rating: 4.7 },
    products: [
      {
        name: "200Ah Gel Battery",
        category: "Batteries",
        price: 185000,
        stock: 40,
      },
    ],
  },
  {
    vendorId: "VEN-003",
    businessName: "Kano Power & Light",
    ownerName: "Aminu Bashir",
    location: { state: "Kano", region: "North West" },
    kyc: { nin: "8821 **** 442", cacNumber: "RC-5544332" },
    status: "Suspended",
    verificationStatus: "Sickout",
    metrics: { totalInstallments: 34, listedProducts: 5, rating: 3.2 },
    products: [
      { name: "Solar Water Pump", category: "Pumps", price: 220000, stock: 2 },
    ],
  },
  {
    vendorId: "VEN-004",
    businessName: "Enugu Renewables",
    ownerName: "Chuka Eke",
    location: { state: "Enugu", region: "South East" },
    kyc: { nin: "2233 **** 119", cacNumber: "RC-0099887" },
    status: "Suspended",
    verificationStatus: "Pending",
    metrics: { totalInstallments: 0, listedProducts: 0, rating: 0.0 },
    products: [],
  },
  {
    vendorId: "VEN-005",
    businessName: "Rivers State Solar Ltd",
    ownerName: "Tamuno George",
    location: { state: "Rivers", region: "South South" },
    kyc: { nin: "4455 **** 001", cacNumber: "RC-1122334" },
    status: "Active",
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 56, listedProducts: 18, rating: 4.5 },
    products: [
      {
        name: "Lithium Battery 10kWh",
        category: "Batteries",
        price: 1300000,
        stock: 5,
      },
    ],
  },
  {
    vendorId: "VEN-006",
    businessName: "Plateau SunTech",
    ownerName: "Nanle Jos",
    location: { state: "Plateau", region: "North Central" },
    kyc: { nin: "7766 **** 998", cacNumber: "BN-4455667" },
    status: "Active",
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 21, listedProducts: 7, rating: 4.2 },
    products: [
      {
        name: "Portable Solar Generator",
        category: "Kits",
        price: 150000,
        stock: 15,
      },
    ],
  },
  {
    vendorId: "VEN-007",
    businessName: "Ibadan Inverters",
    ownerName: "Abiola Ajayi",
    location: { state: "Oyo", region: "South West" },
    kyc: { nin: "3322 **** 554", cacNumber: "RC-8877665" },
    status: "Suspended",
    verificationStatus: "Sickout",
    metrics: { totalInstallments: 110, listedProducts: 30, rating: 2.8 },
    products: [
      {
        name: "Modified Sine Wave Inverter",
        category: "Inverters",
        price: 85000,
        stock: 100,
      },
    ],
  },
  {
    vendorId: "VEN-008",
    businessName: "Maiduguri Green Energy",
    ownerName: "Bukar Kyari",
    location: { state: "Borno", region: "North East" },
    kyc: { nin: "9900 **** 112", cacNumber: "RC-2233445" },
    status: "Active",
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 15, listedProducts: 4, rating: 4.0 },
    products: [
      {
        name: "Solar Street Light 100W",
        category: "Lighting",
        price: 45000,
        stock: 250,
      },
    ],
  },
  {
    vendorId: "VEN-009",
    businessName: "Delta Power Pros",
    ownerName: "Efe Okoro",
    location: { state: "Delta", region: "South South" },
    kyc: { nin: "1188 **** 776", cacNumber: "BN-6655443" },
    status: "Active",
    verificationStatus: "Pending",
    metrics: { totalInstallments: 0, listedProducts: 2, rating: 0.0 },
    products: [
      {
        name: "Deep Cycle AGM Battery",
        category: "Batteries",
        price: 140000,
        stock: 20,
      },
    ],
  },
  {
    vendorId: "VEN-010",
    businessName: "Kaduna Solar Coop",
    ownerName: "Sani Usman",
    location: { state: "Kaduna", region: "North West" },
    kyc: { nin: "6655 **** 223", cacNumber: "RC-9988776" },
    status: "Active",
    verificationStatus: "Admitted",
    metrics: { totalInstallments: 45, listedProducts: 10, rating: 4.6 },
    products: [
      {
        name: "Solar Charge Controller",
        category: "Controllers",
        price: 35000,
        stock: 60,
      },
    ],
  },
];

// Helper to show a mock email notification
function showMockEmail(message) {
  // Create toast container if it doesn't exist
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.background = "#0d3d44";
  toast.style.color = "white";
  toast.style.padding = "16px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
  toast.style.display = "flex";
  toast.style.alignItems = "flex-start";
  toast.style.gap = "12px";
  toast.style.maxWidth = "400px";
  toast.style.animation = "slideIn 0.3s ease-out forwards";
  toast.style.fontSize = "14px";
  toast.style.lineHeight = "1.4";

  toast.innerHTML = `
        <i class="fas fa-envelope" style="margin-top: 2px;"></i>
        <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Mock Email Sent</div>
            <div>${message}</div>
        </div>
        <button style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: auto; opacity: 0.7;" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  // Add keyframes for animation if not present
  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Export for usage across multiple files
window.evillageData = {
  geoData,
  vettingQueue,
  loans,
  vendors,
  showMockEmail,
};
