// script.js

// BASE_URL for your Node.js backend API
const BASE_URL = 'http://localhost:3000/api'; // Adjust if your backend runs on a different port/host

// Global variables for user session
let currentUserId = null; // Stores the currently logged-in user's ID (from sheet)
let currentUserName = null; // Stores the currently logged-in user's name (from sheet)
let currentUserType = null; // Stores the currently logged-in user's type (Admin, Customer, Usthad)
let isAppReady = false; // Flag to indicate if initial data loading is complete

// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const loginSection = document.getElementById('login-section');
const adminLoginForm = document.getElementById('admin-login-form');
const customerSelectionArea = document.getElementById('customer-selection-area');
const showAdminLoginBtn = document.getElementById('showAdminLoginBtn');
const showCustomerLoginBtn = document.getElementById('showCustomerLoginBtn');
const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
const cancelCustomerLoginBtn = document.getElementById('cancelCustomerLoginBtn');
const adminLoginFormElement = document.getElementById('adminLoginForm');
const customerSelectDropdown = document.getElementById('customerSelectDropdown');
const proceedAsCustomerBtn = document.getElementById('proceedAsCustomerBtn');
const customerSearchInput = document.getElementById('customerSearchInput');
// const searchCustomerDropdownBtn = document.getElementById('searchCustomerDropdownBtn'); // Removed as redundant

const navLinks = document.querySelectorAll('.nav-link');
const sectionContents = document.querySelectorAll('.section-content');
const messageBox = document.getElementById('messageBox');
const loadingOverlay = document.getElementById('loadingOverlay');
const confirmationModal = document.getElementById('confirmationModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');
const confirmationModalTitle = document.getElementById('confirmationModalTitle');
const confirmationModalMessage = document.getElementById('confirmationModalMessage');

const logoutBtn = document.getElementById('logoutBtn');
const currentLoggedInUserIdDisplay = document.getElementById('currentLoggedInUserIdDisplay');

// Admin Dashboard Elements
const dashboardSection = document.getElementById('dashboard-section');
const totalBooksCount = document.getElementById('totalBooksCount');
const issuedBooksCount = document.getElementById('issuedBooksCount');
const totalUsersCount = document.getElementById('totalUsersCount');
const totalLibrariansCount = document.getElementById('totalLibrariansCount');
const customerRequestsList = document.getElementById('customerRequestsList');
const noCustomerRequestsMessage = document.getElementById('noCustomerRequestsMessage');

// Catalog Section Elements
const catalogSection = document.getElementById('catalog-section');
const bookForm = document.getElementById('bookForm');
const bookFormTitle = document.getElementById('bookFormTitle');
const bookFormSubmitBtn = document.getElementById('bookFormSubmitBtn');
const cancelBookEditBtn = document.getElementById('cancelBookEditBtn');
const bookCoverUrlInput = document.getElementById('bookCoverUrl');
// const bookCoverFileInput = document.getElementById('bookCoverFile'); // Removed from HTML
const bookCoverPreview = document.getElementById('bookCoverPreview');
const bookList = document.getElementById('bookList');
const noBooksMessage = document.getElementById('noBooksMessage');
const adminAuthorFilter = document.getElementById('adminAuthorFilter');
const adminYearFilter = document.getElementById('adminYearFilter');
const adminCategoryFilter = document.getElementById('adminCategoryFilter');
const applyAdminFiltersBtn = document.getElementById('applyAdminFiltersBtn');

// Issue/Return Section Elements
const issueSection = document.getElementById('issue-section');
const issueBookForm = document.getElementById('issueBookForm');
const catalogNumberSearch = document.getElementById('catalogNumberSearch');
const searchBookBtn = document.getElementById('searchBookBtn');
const issueUserIdSearch = document.getElementById('issueUserIdSearch');
const searchUserInIssueBtn = document.getElementById('searchUserInIssueBtn');
const issueLibrarianSelect = document.getElementById('issueLibrarianSelect');
const selectedBookDisplay = document.getElementById('selectedBookDisplay');
const selectedBookTitle = document.getElementById('selectedBookTitle');
const selectedBookAuthor = document.getElementById('selectedBookAuthor');
const selectedBookISBN = document.getElementById('selectedBookISBN');
const selectedBookCatalogNumber = document.getElementById('selectedBookCatalogNumber');
const selectedBookAvailableCopies = document.getElementById('selectedBookAvailableCopies');
const selectedUserDisplay = document.getElementById('selectedUserDisplay');
const selectedUserName = document.getElementById('selectedUserName');
const selectedUserClass = document.getElementById('selectedUserClass');
const issueBookSubmitBtn = document.getElementById('issueBookSubmitBtn');
const issuedBooksList = document.getElementById('issuedBooksList');
const noIssuedBooksMessage = document.getElementById('noIssuedBooksMessage');

let selectedBookForIssue = null;
let selectedUserForIssue = null;

// History Section Elements
const historySection = document.getElementById('history-section');
const historyUserIdSearch = document.getElementById('historyUserIdSearch');
const searchHistoryBtn = document.getElementById('searchHistoryBtn');
const historyTableBody = document.getElementById('historyTableBody');
const noHistoryMessage = document.getElementById('noHistoryMessage');

// User Management Section Elements
const userManagementSection = document.getElementById('user-management-section');
const addUserForm = document.getElementById('addUserForm');
const userFormTitle = document.getElementById('userFormTitle');
const userFormSubmitBtn = document.getElementById('userFormSubmitBtn');
const cancelUserEditBtn = document.getElementById('cancelUserEditBtn');
const newUserIdInput = document.getElementById('newUserId');
const newUserNameInput = document.getElementById('newUserName');
const newUserTypeSelect = document.getElementById('newUserType');
const newUserClassGroup = document.getElementById('newUserClassGroup');
const newUserClassSelect = document.getElementById('newUserClass');
const customerUserList = document.getElementById('customerUserList');
const noCustomerUsersMessage = document.getElementById('noCustomerUsersMessage');
const usthadUsersContainer = document.getElementById('usthadUsersContainer');
const noUsthadMessage = document.getElementById('noUsthadMessage');

// Librarian Section Elements
const librarianSection = document.getElementById('librarian-section');
const addLibrarianForm = document.getElementById('addLibrarianForm');
const librarianFormTitle = document.getElementById('librarianFormTitle');
const librarianFormSubmitBtn = document.getElementById('librarianFormSubmitBtn');
const cancelLibrarianEditBtn = document.getElementById('cancelLibrarianEditBtn');
const newLibrarianNameInput = document.getElementById('newLibrarianName');
const newLibrarianPositionInput = document.getElementById('newLibrarianPosition');
const librarianList = document.getElementById('librarianList');
const noLibrariansMessage = document.getElementById('noLibrariansMessage');

// Status Section Elements
const statusSection = document.getElementById('status-section');
const dbStatus = document.getElementById('dbStatus'); // Will show API status
const authStatus = document.getElementById('authStatus'); // Will show login status
const loggedInUserIdStatus = document.getElementById('loggedInUserIdStatus');

// Customer Section Elements
const customerSection = document.getElementById('customer-section');
const currentCustomerNameDisplay = document.getElementById('currentCustomerNameDisplay');
const customerBookSearchInput = document.getElementById('customerBookSearchInput');
const customerAuthorFilter = document.getElementById('customerAuthorFilter');
const customerYearFilter = document.getElementById('customerYearFilter');
const customerCategoryFilter = document.getElementById('customerCategoryFilter');
const applyCustomerFiltersBtn = document.getElementById('applyCustomerFiltersBtn');
const customerBookList = document.getElementById('customerBookList');
const noCustomerBooksMessage = document.getElementById('noCustomerBooksMessage');

// Global data arrays (for client-side caching and rendering)
let books = [];
let users = []; // Includes all users (Admin, Usthad, Customer)
let librarians = [];
let issuedBooks = [];
let history = [];
let customerRequests = [];

// Currently selected items for editing/issuing
let editingBookId = null;
let editingUserId = null;
let editingLibrarianId = null;
// selectedBookForIssue and selectedUserForIssue are already declared above

// Temporary global variables for pre-filling issue form from customer requests
let tempPrefillBookId = null;
let tempPrefillUserId = null;


// --- Utility Functions ---

/**
 * Displays a custom message box with a given message and type.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success', 'error', 'info').
 */
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`; // Apply classes
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

/**
 * Shows the loading overlay.
 */
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

/**
 * Shows a custom confirmation modal.
 * @param {string} title - The title of the modal.
 * @param {string} message - The message to display.
 * @returns {Promise<boolean>} - A promise that resolves to true if confirmed, false otherwise.
 */
function showConfirmationModal(title, message) {
    return new Promise(resolve => {
        const modalOverlay = document.getElementById('confirmationModal');
        const modalTitle = document.getElementById('confirmationModalTitle');
        const modalMessage = document.getElementById('confirmationModalMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.add('show');

        const onYesClick = () => {
            modalOverlay.classList.remove('show');
            confirmYesBtn.removeEventListener('click', onYesClick);
            confirmNoBtn.removeEventListener('click', onNoClick);
            resolve(true);
        };

        const onNoClick = () => {
            modalOverlay.classList.remove('show');
            confirmYesBtn.removeEventListener('click', onYesClick);
            confirmNoBtn.removeEventListener('click', onNoClick);
            resolve(false);
        };

        confirmYesBtn.addEventListener('click', onYesClick);
        confirmNoBtn.addEventListener('click', onNoClick);
    });
}

/**
 * Generates a unique ID (UUID v4 like).
 * @returns {string} A unique ID.
 */
function generateUniqueId() {
    return crypto.randomUUID();
}

/**
 * Formats a Date object into a readable string (e.g., "YYYY-MM-DD").
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generates a consistent hex color from a string.
 * @param {string} str - The input string (e.g., ISBN).
 * @returns {string} A 6-digit hex color.
 */
function stringToHexColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

/**
 * Generic function to fetch data from the backend API.
 * @param {string} endpoint - The API endpoint (e.g., 'books', 'users').
 * @returns {Promise<Array|Object>} - The fetched data.
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        showMessage(`Failed to load ${endpoint}.`, 'error');
        return [];
    }
}

/**
 * Generic function to send data to the backend API (POST, PUT, DELETE).
 * @param {string} endpoint - The API endpoint.
 * @param {string} method - HTTP method ('POST', 'PUT', 'DELETE').
 * @param {Object} data - The data to send (for POST/PUT).
 * @returns {Promise<Object>} - The response from the API.
 */
async function sendData(endpoint, method, data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, options);
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
        }
        return responseData;
    } catch (error) {
        console.error(`Error ${method}ing data to ${endpoint}:`, error);
        showMessage(`Failed to ${method.toLowerCase()} data. Error: ${error.message}`, 'error');
        throw error; // Re-throw to allow calling functions to handle
    }
}

// --- Specific Data Fetching Functions ---
async function fetchBooks() {
    books = await fetchData('books');
}

async function fetchUsers() {
    users = await fetchData('users');
}

async function fetchLibrarians() {
    librarians = await fetchData('librarians');
}

async function fetchIssuedBooks() {
    issuedBooks = await fetchData('issuedbooks');
}

async function fetchHistory() {
    history = await fetchData('history');
}

async function fetchCustomerRequests() {
    customerRequests = await fetchData('customerrequests');
}


// --- Section Navigation and Role-based UI ---

/**
 * Renders UI elements based on the user's role.
 */
function renderUIBasedOnRole() {
    console.log("renderUIBasedOnRole called. Current userType:", currentUserType, "Current userId:", currentUserId);
    // Hide all sections initially
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    // Reset all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-gray-700', 'text-white');
        link.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
        link.classList.add('hidden'); // Hide all by default
    });

    // Hide login forms
    document.getElementById('admin-login-form').classList.add('hidden');
    document.getElementById('customer-selection-area').classList.add('hidden');
    document.getElementById('showAdminLoginBtn').classList.remove('hidden');
    document.getElementById('showCustomerLoginBtn').classList.remove('hidden');


    if (currentUserType === 'Admin') {
        console.log("Rendering UI for Admin.");
        // Show admin links
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.customer-only').forEach(el => el.classList.add('hidden'));
        document.getElementById('logoutBtn').classList.remove('hidden'); // Show logout for admin

        // Activate Dashboard by default for admin
        document.getElementById('dashboard-section').classList.add('active');
        document.querySelector('.nav-link[data-section="dashboard-section"]').classList.add('bg-gray-700', 'text-white');
        document.querySelector('.nav-link[data-section="dashboard-section"]').classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
        updateDashboardCounts();
        renderCustomerRequests(); // Render customer requests for admin
    } else if (currentUserType === 'Customer' || currentUserType === 'Usthad') {
        console.log("Rendering UI for Customer/Usthad.");
        // Show customer links
        document.querySelectorAll('.customer-only').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        document.getElementById('logoutBtn').classList.remove('hidden'); // Show logout for customer

        // Activate Customer Section by default for customer
        document.getElementById('customer-section').classList.add('active');
        document.querySelector('.nav-link[data-section="customer-section"]').classList.add('bg-gray-700', 'text-white');
        document.querySelector('.nav-link[data-section="customer-section"]').classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
        renderCustomerBooks(); // Render books for customer view
        updateCustomerNameDisplay(); // Update customer's name display
    } else {
        console.log("Rendering UI for Not Logged In.");
        // Default or loading state - show login section
        document.getElementById('login-section').classList.add('active');
        document.getElementById('logoutBtn').classList.add('hidden'); // Hide logout if not logged in
        document.getElementById('currentLoggedInUserIdDisplay').textContent = `Current User: Please Log In`;
    }
    if (currentUserId && currentUserType) {
        document.getElementById('currentLoggedInUserIdDisplay').textContent = `Current User: ${currentUserName} (${currentUserType} - ID: ${currentUserId})`;
    }
}

/**
 * Handles navigation between different sections of the application.
 * @param {Event} event - The click event.
 */
async function navigateToSection(event) {
    console.log("navigateToSection called. Target:", event.currentTarget.dataset.section);
    // Prevent navigation if app is not ready
    if (!isAppReady || !currentUserId) {
        showMessage('Library system is still loading. Please wait a moment.', 'info');
        return;
    }

    const targetSectionId = event.currentTarget.dataset.section;
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-gray-700', 'text-white');
        link.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
    });

    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Error: Section with ID "${targetSectionId}" not found.`);
        showMessage(`Error: Section "${targetSectionId}" not found.`, 'error');
    }
    
    event.currentTarget.classList.add('bg-gray-700', 'text-white');
    event.currentTarget.classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');

    // Trigger specific renders when navigating
    showLoading(); // Show loading for data refresh on navigation
    try {
        if (targetSectionId === 'dashboard-section') {
            await fetchAllData(); // Refresh all data for dashboard
            updateDashboardCounts();
            renderCustomerRequests();
        } else if (targetSectionId === 'catalog-section') {
            await fetchBooks(); // Refresh books
            // Reset filters when navigating to catalog section
            document.getElementById('adminAuthorFilter').value = '';
            document.getElementById('adminYearFilter').value = '';
            document.getElementById('adminCategoryFilter').value = '';
            populateAdminFilters(); // Repopulate filters with fresh data
            renderBooks();
        } else if (targetSectionId === 'issue-section') {
            await fetchIssuedBooks(); // Refresh issued books
            await fetchLibrarians(); // Refresh librarians
            renderIssuedBooks();
            populateLibrarianSelect();
            resetIssueBookForm(); // Clear form first

            // Check if there's prefill data from a customer request
            if (tempPrefillBookId && tempPrefillUserId) {
                const book = books.find(b => b.id === tempPrefillBookId);
                const user = users.find(u => u.id === tempPrefillUserId);

                if (book && user) {
                    selectedBookForIssue = book;
                    selectedUserForIssue = user;
                    // Populate the input fields directly for user clarity
                    document.getElementById('catalogNumberSearch').value = book.catalogNumber;
                    document.getElementById('issueUserIdSearch').value = user.id;
                    updateIssueFormDisplayAndButton(); // Update display with pre-filled data
                } else {
                    console.warn(`Pre-fill data for issue form not found. Book ID: ${tempPrefillBookId}, User ID: ${tempPrefillUserId}. Data might be out of sync.`);
                }
                // Clear temporary variables after use
                tempPrefillBookId = null;
                tempPrefillUserId = null;
            }
        } else if (targetSectionId === 'history-section') {
            await fetchHistory(); // Refresh history
            renderHistoryTable();
        } else if (targetSectionId === 'user-management-section') {
            await fetchUsers(); // Refresh users
            renderUsers();
            populateUserClassSelect();
            resetAddUserForm();
        } else if (targetSectionId === 'librarian-section') {
            await fetchLibrarians(); // Refresh librarians
            renderLibrarians();
            resetAddLibrarianForm();
        } else if (targetSectionId === 'status-section') {
            updateStatusSection(); // Status is local, no fetch needed
        } else if (targetSectionId === 'customer-section') {
            await fetchBooks(); // Refresh books for customer view
            // Reset filters when navigating to customer section
            document.getElementById('customerBookSearchInput').value = '';
            document.getElementById('customerAuthorFilter').value = '';
            document.getElementById('customerYearFilter').value = '';
            document.getElementById('customerCategoryFilter').value = '';
            populateCustomerFilters(); // Repopulate filters with fresh data
            renderCustomerBooks();
            updateCustomerNameDisplay();
        }
    } catch (error) {
        console.error("Error during navigation data refresh:", error);
        showMessage("Failed to refresh data for this section.", "error");
    } finally {
        hideLoading();
    }
}

/**
 * Updates the status section with current connection and user info.
 */
function updateStatusSection() {
    // DB Status is updated in fetchAllData
    authStatus.textContent = currentUserId ? 'Authenticated' : 'Not Authenticated';
    authStatus.className = currentUserId ? 'text-green-600' : 'text-red-600';
    loggedInUserIdStatus.textContent = currentUserId ? `${currentUserName} (${currentUserType} - ID: ${currentUserId})` : 'Not available';
}

/**
 * Handles user logout.
 */
function handleLogout() {
    currentUserId = null;
    currentUserName = null;
    currentUserType = null;
    showMessage('Logged out successfully!', 'info');
    renderUIBasedOnRole(); // Show login screen
    updateStatusSection(); // Update status display
}


// --- Dashboard Functions ---

/**
 * Updates the counts on the dashboard.
 */
function updateDashboardCounts() {
    totalBooksCount.textContent = books.length;
    issuedBooksCount.textContent = issuedBooks.length;
    totalUsersCount.textContent = users.length;
    totalLibrariansCount.textContent = librarians.length;
}

/**
 * Renders customer book requests for the admin.
 */
function renderCustomerRequests() {
    const customerRequestsListDiv = document.getElementById('customerRequestsList');
    customerRequestsListDiv.innerHTML = '';
    const noCustomerRequestsMessage = document.getElementById('noCustomerRequestsMessage');

    const pendingRequests = customerRequests.filter(req => req.status === 'pending');

    if (pendingRequests.length === 0) {
        noCustomerRequestsMessage.classList.remove('hidden');
    } else {
        noCustomerRequestsMessage.classList.add('hidden');
    }

    // Sort by requestDate (most recent first)
    const sortedRequests = [...pendingRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    sortedRequests.forEach(request => {
        const book = books.find(b => b.id === request.bookId);
        const card = document.createElement('div');
        card.className = 'bg-white p-5 rounded-lg shadow-md border border-gray-200';
        card.innerHTML = `
            <p class="text-lg font-semibold text-gray-800 mb-2 truncate">Book: ${book ? book.title : 'Unknown'}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Requested by:</b> ${request.customerName} (${request.customerId})</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Request Date:</b> ${formatDate(request.requestDate)}</p>
            <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out mark-request-handled-btn" data-id="${request.id}" data-book-id="${request.bookId}" data-customer-id="${request.customerId}">
                <i class="fas fa-check-circle mr-2"></i> Mark as Handled & Issue
            </button>
        `;
        customerRequestsListDiv.appendChild(card);
    });

    document.querySelectorAll('.mark-request-handled-btn').forEach(button => {
        button.addEventListener('click', markCustomerRequestHandled);
    });
}

/**
 * Marks a customer request as handled and optionally prepares for book issue.
 * @param {Event} event - The click event.
 */
async function markCustomerRequestHandled(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const requestId = event.currentTarget.dataset.id;
    const bookId = event.currentTarget.dataset.bookId;
    const customerId = event.currentTarget.dataset.customerId;

    const requestToHandle = customerRequests.find(req => req.id === requestId);

    if (!requestToHandle) {
        showMessage('Request not found.', 'error');
        return;
    }

    const confirmed = await showConfirmationModal(
        'Handle Request',
        `Are you sure you want to mark the request for "${requestToHandle.bookTitle}" by "${requestToHandle.customerName}" as handled and proceed to issue the book?`
    );

    if (confirmed) {
        showLoading();
        try {
            await sendData(`customerrequests/${requestId}`, 'PUT', { status: 'handled', handledDate: new Date().toISOString() });
            showMessage('Request marked as handled successfully!', 'success');

            // Store IDs in temporary globals for pre-filling the issue form
            tempPrefillBookId = bookId;
            tempPrefillUserId = customerId;

            // Navigate to the Issue/Return section
            const issueReturnNavLink = document.querySelector('.nav-link[data-section="issue-section"]');
            if (issueReturnNavLink) {
                issueReturnNavLink.click(); // Simulate click to navigate
            }
        } catch (e) {
            console.error("Error handling request: ", e);
            showMessage('Failed to mark request as handled. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

/**
 * Updates the display for selected book and user in the issue form, and enables/disables the issue button.
 */
function updateIssueFormDisplayAndButton() {
    const selectedBookDisplay = document.getElementById('selectedBookDisplay');
    const selectedUserDisplay = document.getElementById('selectedUserDisplay');
    const issueBookSubmitBtn = document.getElementById('issueBookSubmitBtn');

    // Update Book Display
    if (selectedBookForIssue) {
        document.getElementById('selectedBookTitle').textContent = selectedBookForIssue.title;
        document.getElementById('selectedBookAuthor').textContent = selectedBookForIssue.author;
        document.getElementById('selectedBookISBN').textContent = selectedBookForIssue.isbn;
        document.getElementById('selectedBookCatalogNumber').textContent = selectedBookForIssue.catalogNumber;
        document.getElementById('selectedBookAvailableCopies').textContent = `${selectedBookForIssue.availableCopies}/${selectedBookForIssue.totalCopies}`;
        selectedBookDisplay.classList.remove('hidden');
    } else {
        selectedBookDisplay.classList.add('hidden');
    }

    // Update User Display
    if (selectedUserForIssue) {
        document.getElementById('selectedUserName').textContent = selectedUserForIssue.name;
        document.getElementById('selectedUserClass').textContent = `${selectedUserForIssue.type} - Class ${selectedUserForIssue.class || 'N/A'}`;
        selectedUserDisplay.classList.remove('hidden');
    } else {
        selectedUserDisplay.classList.add('hidden');
    }

    // Enable/Disable Issue Button
    if (selectedBookForIssue && selectedUserForIssue && selectedBookForIssue.availableCopies > 0 && issueLibrarianSelect.value) {
        issueBookSubmitBtn.disabled = false;
    } else {
        issueBookSubmitBtn.disabled = true;
    }
}


// --- Catalog (Book) Functions ---

/**
 * Renders the list of books, grouped by category, with optional filters.
 * @param {string} authorFilter - Filter by author (case-insensitive, partial match).
 * @param {number} yearFilter - Filter by publishing year.
 * @param {string} categoryFilter - Filter by category.
 */
function renderBooks(authorFilter = '', yearFilter = '', categoryFilter = '') {
    const bookListDiv = document.getElementById('bookList');
    bookListDiv.innerHTML = ''; // Clear previous content
    const noBooksMessage = document.getElementById('noBooksMessage');

    let filteredBooks = [...books]; // Start with a copy of all books

    // Apply filters
    if (authorFilter) {
        const lowerCaseAuthorFilter = authorFilter.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            book.author && book.author.toLowerCase().includes(lowerCaseAuthorFilter)
        );
    }
    if (yearFilter) {
        filteredBooks = filteredBooks.filter(book =>
            book.publishingYear && book.publishingYear === parseInt(yearFilter)
        );
    }
    if (categoryFilter) {
        const lowerCaseCategoryFilter = categoryFilter.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            book.category && book.category.toLowerCase() === lowerCaseCategoryFilter
        );
    }

    if (filteredBooks.length === 0) {
        noBooksMessage.classList.remove('hidden');
        return;
    } else {
        noBooksMessage.classList.add('hidden');
    }

    // Group books by category
    const booksByCategory = filteredBooks.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(booksByCategory).sort();

    sortedCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mb-8';
        categoryDiv.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">${category} Books</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cover</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Author</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ISBN</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Catalog No.</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Available</th>
                            <th class="px-4 py-2 border-b-2 border-gray-300 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bookTableBody-${category.replace(/\s+/g, '-')}" class="divide-y divide-gray-100">
                        <!-- Books will be inserted here -->
                    </tbody>
                </table>
            </div>
        `;
        bookListDiv.appendChild(categoryDiv);

        const tableBody = document.getElementById(`bookTableBody-${category.replace(/\s+/g, '-')}`);
        // Sort books within each category by title
        const sortedBooksInCategory = booksByCategory[category].sort((a, b) => a.title.localeCompare(b.title));

        sortedBooksInCategory.forEach(book => {
            const coverUrl = book.bookCoverUrl;
            let finalCoverSrc = '';
            if (coverUrl && isValidUrl(coverUrl)) {
                finalCoverSrc = coverUrl;
            } else {
                const coverIdentifier = book.isbn || book.title;
                const coverColor = stringToHexColor(coverIdentifier);
                const textColor = 'ffffff';
                finalCoverSrc = `https://placehold.co/50x75/${coverColor.substring(1)}/${textColor}?text=${encodeURIComponent(book.title.substring(0, Math.min(book.title.length, 5)))}`;
            }

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition duration-150 ease-in-out';
            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    <img src="${finalCoverSrc}" alt="Cover" class="w-10 h-15 object-cover rounded-sm shadow-xs mx-auto" onerror="this.onerror=null;this.src='https://placehold.co/50x75/cccccc/333333?text=N/A';">
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${book.title}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.author}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.isbn}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.catalogNumber}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.availableCopies}/${book.totalCopies}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-book-btn" data-id="${book.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-book-btn" data-id="${book.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-book-btn').forEach(button => {
        button.addEventListener('click', editBook);
    });
    document.querySelectorAll('.delete-book-btn').forEach(button => {
        button.addEventListener('click', deleteBook);
    });
}

/**
 * Populates the year and category filter dropdowns for the admin catalog.
 */
function populateAdminFilters() {
    const years = [...new Set(books.map(book => book.publishingYear).filter(year => year))].sort((a, b) => b - a);
    const categories = [...new Set(books.map(book => book.category).filter(category => category))].sort();

    const yearSelect = document.getElementById('adminYearFilter');
    const categorySelect = document.getElementById('adminCategoryFilter');

    yearSelect.innerHTML = '<option value="">All Years</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}


/**
 * Validates if a string is a valid URL.
 * @param {string} string - The string to validate.
 * @returns {boolean} True if valid URL, false otherwise.
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Handles adding or updating a book.
 * @param {Event} event - The form submission event.
 */
async function handleBookFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();

    const form = event.target;
    const bookData = {
        title: form.title.value,
        author: form.author.value,
        isbn: form.isbn.value,
        catalogNumber: form.catalogNumber.value,
        publishingYear: parseInt(form.publishingYear.value),
        publisher: form.publisher.value,
        bookPrice: parseFloat(form.bookPrice.value),
        category: form.category.value,
        totalCopies: parseInt(form.totalCopies.value),
        read: form.read.checked,
        bookCoverUrl: form.bookCoverUrl.value.trim()
    };

    if (bookData.bookCoverUrl && !isValidUrl(bookData.bookCoverUrl)) {
        showMessage('Invalid Book Cover URL provided. Please enter a valid URL or leave it empty.', 'error');
        hideLoading();
        return;
    }

    try {
        if (editingBookId) {
            // Update existing book
            const existingBook = books.find(b => b.id === editingBookId);
            if (!existingBook) {
                showMessage('Book not found for update.', 'error');
                hideLoading();
                return;
            }

            // Calculate available copies based on new totalCopies and existing issued copies
            const issuedCount = existingBook.totalCopies - existingBook.availableCopies;
            bookData.availableCopies = bookData.totalCopies - issuedCount;
            if (bookData.availableCopies < 0) {
                showMessage('Cannot reduce total copies below currently issued copies.', 'error');
                hideLoading();
                return;
            }

            await sendData(`books/${editingBookId}`, 'PUT', bookData);
            showMessage('Book updated successfully!', 'success');
        } else {
            // Add new book
            bookData.id = generateUniqueId(); // Generate unique ID for new book
            bookData.availableCopies = bookData.totalCopies; // Initially all copies are available
            await sendData('books', 'POST', bookData);
            showMessage('Book added successfully!', 'success');
        }
        form.reset();
        resetBookForm();
        await fetchBooks(); // Refresh books after CUD operation
        populateAdminFilters(); // Repopulate filters after book change
        renderBooks(); // Re-render books
    } catch (e) {
        console.error("Error adding/updating book: ", e);
        showMessage('Failed to save book. Please try again. Error: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Populates the book form for editing.
 * @param {Event} event - The click event from the edit button.
 */
function editBook(event) {
    const bookId = event.currentTarget.dataset.id;
    const book = books.find(b => b.id === bookId);
    const bookCoverPreview = document.getElementById('bookCoverPreview');
    // const bookCoverFile = document.getElementById('bookCoverFile'); // No longer used for upload

    if (book) {
        editingBookId = bookId;
        document.getElementById('bookFormTitle').textContent = 'Edit Book';
        document.getElementById('bookFormSubmitBtn').innerHTML = '<i class="fas fa-save mr-3"></i> Update Book';
        document.getElementById('cancelBookEditBtn').classList.remove('hidden');

        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('catalogNumber').value = book.catalogNumber;
        document.getElementById('publishingYear').value = book.publishingYear;
        document.getElementById('publisher').value = book.publisher;
        document.getElementById('bookPrice').value = book.bookPrice;
        document.getElementById('category').value = book.category;
        document.getElementById('totalCopies').value = book.totalCopies;
        document.getElementById('read').checked = book.read;
        document.getElementById('bookCoverUrl').value = book.bookCoverUrl || ''; // Populate URL field
        // bookCoverFile.value = ''; // No longer relevant

        if (book.bookCoverUrl && isValidUrl(book.bookCoverUrl)) {
            bookCoverPreview.src = book.bookCoverUrl;
            bookCoverPreview.classList.remove('hidden');
        } else {
            bookCoverPreview.src = '';
            bookCoverPreview.classList.add('hidden');
        }
    }
}

/**
 * Resets the book form to "Add New Book" state.
 */
function resetBookForm() {
    editingBookId = null;
    document.getElementById('bookForm').reset();
    document.getElementById('bookFormTitle').textContent = 'Add New Book';
    document.getElementById('bookFormSubmitBtn').innerHTML = '<i class="fas fa-plus-circle mr-3"></i> Add Book';
    document.getElementById('cancelBookEditBtn').classList.add('hidden');
    document.getElementById('bookCoverPreview').src = ''; // Clear preview
    document.getElementById('bookCoverPreview').classList.add('hidden'); // Hide preview
    // document.getElementById('bookCoverFile').value = ''; // No longer relevant
}

/**
 * Deletes a book after confirmation.
 * @param {Event} event - The click event from the delete button.
 */
async function deleteBook(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const bookId = event.currentTarget.dataset.id;
    const bookToDelete = books.find(b => b.id === bookId);

    if (!bookToDelete) {
        showMessage('Book not found.', 'error');
        return;
    }

    if (bookToDelete.availableCopies < bookToDelete.totalCopies) {
        showMessage('Cannot delete book: Some copies are currently issued.', 'error');
        return;
    }

    const confirmed = await showConfirmationModal(
        'Delete Book',
        `Are you sure you want to delete "${bookToDelete.title}" by ${bookToDelete.author}? This action cannot be undone.`
    );

    if (confirmed) {
        showLoading();
        try {
            await sendData(`books/${bookId}`, 'DELETE');
            showMessage('Book deleted successfully!', 'success');
            await fetchBooks(); // Refresh books after CUD operation
            populateAdminFilters(); // Repopulate filters after book change
            renderBooks(); // Re-render books
        } catch (e) {
            console.error("Error deleting book: ", e);
            showMessage('Failed to delete book. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Issue/Return Functions ---

/**
 * Renders the list of currently issued books.
 */
function renderIssuedBooks() {
    const issuedBooksListDiv = document.getElementById('issuedBooksList');
    issuedBooksListDiv.innerHTML = ''; // Clear previous content
    const noIssuedBooksMessage = document.getElementById('noIssuedBooksMessage');

    if (issuedBooks.length === 0) {
        noIssuedBooksMessage.classList.remove('hidden');
        return;
    } else {
        noIssuedBooksMessage.classList.add('hidden');
    }

    // Sort issued books by issueDate (most recent first)
    const sortedIssuedBooks = [...issuedBooks].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    sortedIssuedBooks.forEach(issue => {
        const book = books.find(b => b.id === issue.bookId);
        const user = users.find(u => u.id === issue.userId);
        const librarian = librarians.find(l => l.id === issue.librarianId);

        if (book && user && librarian) {
            const card = document.createElement('div');
            card.className = 'bg-white p-5 rounded-lg shadow-md border border-gray-200';
            card.innerHTML = `
                <p class="text-lg font-semibold text-gray-800 mb-2 truncate">${book.title}</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Issued to:</b> ${user.name} (${user.type} - Class ${user.class || 'N/A'})</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Issued by:</b> ${librarian.name}</p>
                <p class="text-sm text-gray-600 mb-3"><strong>Issue Date:</b> ${formatDate(issue.issueDate)}</p>
                <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out return-book-btn" data-id="${issue.id}" data-book-id="${book.id}" data-user-id="${user.id}">
                    <i class="fas fa-undo mr-2"></i> Return Book
                </button>
            `;
            issuedBooksListDiv.appendChild(card);
        }
    });

    document.querySelectorAll('.return-book-btn').forEach(button => {
        button.addEventListener('click', returnBook);
    });
}

/**
 * Populates the librarian select dropdown in the issue book form.
 */
function populateLibrarianSelect() {
    const select = document.getElementById('issueLibrarianSelect');
    select.innerHTML = '<option value="">-- Select Librarian --</option>'; // Clear existing options

    librarians.forEach(librarian => {
        const option = document.createElement('option');
        option.value = librarian.id;
        option.textContent = librarian.name;
        select.appendChild(option);
    });
}

/**
 * Searches for a book by catalog number for issuing.
 */
async function searchBookForIssue() {
    const catalogNumber = document.getElementById('catalogNumberSearch').value.trim();
    
    selectedBookForIssue = null; // Reset selected book

    if (!catalogNumber) {
        updateIssueFormDisplayAndButton(); // Update display to clear book info
        showMessage('Please enter a catalog number to search.', 'info');
        return;
    }

    showLoading();
    try {
        // Re-fetch books to ensure latest data
        await fetchBooks();
        const book = books.find(b => b.catalogNumber === catalogNumber);

        if (book) {
            if (book.availableCopies > 0) {
                selectedBookForIssue = book;
                showMessage(`Book "${book.title}" found.`, 'success');
            } else {
                showMessage('No copies of this book are currently available.', 'error');
            }
        } else {
            showMessage('Book not found with this catalog number.', 'error');
        }
    } catch (error) {
        console.error("Error searching book for issue:", error);
        showMessage("Failed to search for book.", "error");
    } finally {
        hideLoading();
        updateIssueFormDisplayAndButton(); // Update display based on new selectedBookForIssue
    }
}

/**
 * Searches for a user by ID for issuing.
 */
async function searchUserForIssue() {
    const userIdSearch = document.getElementById('issueUserIdSearch').value.trim();
    
    selectedUserForIssue = null; // Reset selected user

    if (!userIdSearch) {
        updateIssueFormDisplayAndButton(); // Update display to clear user info
        showMessage('Please enter a User ID to search.', 'info');
        return;
    }

    showLoading();
    try {
        // Re-fetch users to ensure latest data
        await fetchUsers();
        const user = users.find(u => u.id === userIdSearch);

        if (user) {
            selectedUserForIssue = user;
            showMessage(`User "${user.name}" found.`, 'success');
        } else {
            showMessage('User not found with this ID.', 'error');
        }
    } catch (error) {
        console.error("Error searching user for issue:", error);
        showMessage("Failed to search for user.", "error");
    } finally {
        hideLoading();
        updateIssueFormDisplayAndButton(); // Update display based on new selectedUserForIssue
    }
}

/**
 * Handles the submission of the issue book form.
 * @param {Event} event - The form submission event.
 */
async function handleIssueBookSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();

    const librarianId = document.getElementById('issueLibrarianSelect').value;
    const librarianName = librarians.find(l => l.id === librarianId)?.name || 'Unknown';

    if (!selectedBookForIssue || !selectedUserForIssue || !librarianId) {
        showMessage('Please select a book, a user, and a librarian to issue.', 'error');
        hideLoading();
        return;
    }

    const confirmed = await showConfirmationModal(
        'Issue Book',
        `Are you sure you want to issue "${selectedBookForIssue.title}" to "${selectedUserForIssue.name}"?`
    );
    if (!confirmed) {
        hideLoading();
        return;
    }

    try {
        // Decrement available copies of the book (via backend)
        const updatedBook = { ...selectedBookForIssue, availableCopies: selectedBookForIssue.availableCopies - 1 };
        await sendData(`books/${selectedBookForIssue.id}`, 'PUT', updatedBook);

        // Add entry to issuedBooks collection (via backend)
        const issueData = {
            id: generateUniqueId(),
            bookId: selectedBookForIssue.id,
            bookTitle: selectedBookForIssue.title,
            bookCatalogNumber: selectedBookForIssue.catalogNumber,
            userId: selectedUserForIssue.id,
            userName: selectedUserForIssue.name,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            librarianId: librarianId,
            librarianName: librarianName,
            returned: false
        };
        await sendData('issuedbooks', 'POST', issueData);

        // Add entry to history collection (via backend)
        const historyEntry = {
            id: generateUniqueId(), // Unique ID for history entry
            bookId: selectedBookForIssue.id,
            bookTitle: selectedBookForIssue.title,
            userId: selectedUserForIssue.id,
            userName: selectedUserForIssue.name,
            librarianId: librarianId,
            librarianName: librarianName,
            issueDate: issueData.issueDate,
            returnDate: null,
            type: 'issue',
            issueRecordId: issueData.id // Link to the issued book record
        };
        await sendData('history', 'POST', historyEntry);

        showMessage(`"${selectedBookForIssue.title}" issued to ${selectedUserForIssue.name} successfully!`, 'success');
        resetIssueBookForm();
        await fetchAllData(); // Refresh all data after CUD operations
        renderIssuedBooks(); // Re-render issued books list
        updateDashboardCounts(); // Update dashboard counts
    } catch (e) {
        console.error("Error issuing book: ", e);
        showMessage('Failed to issue book. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Handles returning a book.
 * @param {Event} event - The click event from the return button.
 */
async function returnBook(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const issueId = event.currentTarget.dataset.id;
    const bookId = event.currentTarget.dataset.bookId;
    const userId = event.currentTarget.dataset.userId;

    const issueToReturn = issuedBooks.find(issue => issue.id === issueId);
    if (!issueToReturn) {
        showMessage('Issued book record not found.', 'error');
        return;
    }

    const book = books.find(b => b.id === bookId);
    const user = users.find(u => u.id === userId);

    if (!book || !user) {
        showMessage('Associated book or user not found. Cannot return.', 'error');
        return;
    }

    const confirmed = await showConfirmationModal(
        'Return Book',
        `Are you sure you want to return "${book.title}" from ${user.name}?`
    );
    if (!confirmed) return;

    showLoading();
    try {
        // Update issued book record to returned (via backend)
        await sendData(`issuedbooks/${issueId}`, 'PUT', { returned: true, returnDate: new Date().toISOString() });

        // Increment available copies of the book (via backend)
        const updatedBook = { ...book, availableCopies: book.availableCopies + 1 };
        await sendData(`books/${book.id}`, 'PUT', updatedBook);

        // Update history entry with return date (via backend)
        // Find the history entry linked to this issueId
        const historyEntry = history.find(h => h.issueRecordId === issueId);
        if (historyEntry) {
            await sendData(`history/${historyEntry.id}`, 'PUT', { returnDate: new Date().toISOString(), type: 'return' });
        } else {
            console.warn("No matching history entry found for issueId:", issueId + ". A new history entry will not be created for this return.");
            // Optionally, create a new history entry if one wasn't found (e.g., if issue was manual)
            // This depends on your backend's history handling logic.
        }

        showMessage(`"${book.title}" returned by ${user.name} successfully!`, 'success');
        await fetchAllData(); // Refresh all data after CUD operations
        renderIssuedBooks(); // Re-render issued books list
        updateDashboardCounts(); // Update dashboard counts
    } catch (e) {
        console.error("Error returning book: ", e);
        showMessage('Failed to return book. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Resets the issue book form.
 */
function resetIssueBookForm() {
    document.getElementById('issueBookForm').reset();
    selectedBookForIssue = null;
    selectedUserForIssue = null;
    updateIssueFormDisplayAndButton(); // Clear display and disable button
}

// --- History Functions ---

/**
 * Renders the transaction history table.
 * @param {string} filterUserId - Optional User ID to filter history by.
 */
function renderHistoryTable(filterUserId = '') {
    const historyTableBody = document.getElementById('historyTableBody');
    historyTableBody.innerHTML = ''; // Clear previous content
    const noHistoryMessage = document.getElementById('noHistoryMessage');

    const filteredHistory = filterUserId
        ? history.filter(entry => entry.userId === filterUserId)
        : history;

    if (filteredHistory.length === 0) {
        noHistoryMessage.classList.remove('hidden');
        return;
    } else {
        noHistoryMessage.classList.add('hidden');
    }

    // Sort history by issueDate (most recent first)
    const sortedHistory = [...filteredHistory].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    sortedHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition duration-150 ease-in-out';
        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${entry.bookTitle}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${entry.userName} (${entry.userId})</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${formatDate(entry.issueDate)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${entry.returnDate ? formatDate(entry.returnDate) : 'Pending'}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${entry.librarianName}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

/**
 * Handles searching history by user ID.
 */
async function searchHistory() {
    const userIdToSearch = document.getElementById('historyUserIdSearch').value.trim();
    showLoading();
    try {
        await fetchHistory(); // Refresh history data
        renderHistoryTable(userIdToSearch);
    } catch (error) {
        console.error("Error searching history:", error);
        showMessage("Failed to search history.", "error");
    } finally {
        hideLoading();
    }
}

// --- User Management Functions ---

/**
 * Populates the user class select dropdown (1-6).
 */
function populateUserClassSelect() {
    const select = document.getElementById('newUserClass');
    select.innerHTML = '<option value="">-- Select Class (Optional) --</option>'; // Clear existing options and add optional hint
    for (let i = 1; i <= 6; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Class ${i}`;
        select.appendChild(option);
    }
}

/**
 * Renders the list of users, grouped by class for customers and separately for Usthad and Admin.
 */
function renderUsers() {
    const customerUserListDiv = document.getElementById('customerUserList');
    customerUserListDiv.innerHTML = ''; // Clear previous customer content
    const usthadUsersContainer = document.getElementById('usthadUsersContainer');
    usthadUsersContainer.innerHTML = ''; // Clear previous usthad content
    
    // Note: Admin users are not explicitly rendered here as they are typically a single, privileged account.
    // If you need to manage multiple admin accounts, you would add a similar section for them.

    const noCustomerUsersMessage = document.getElementById('noCustomerUsersMessage');
    const noUsthadMessage = document.getElementById('noUsthadMessage');

    const customerUsers = users.filter(u => u.type === 'Customer');
    const usthadUsers = users.filter(u => u.type === 'Usthad');

    if (customerUsers.length === 0) {
        noCustomerUsersMessage.classList.remove('hidden');
    } else {
        noCustomerUsersMessage.classList.add('hidden');
    }

    if (usthadUsers.length === 0) {
        noUsthadMessage.classList.remove('hidden');
    } else {
        noUsthadMessage.classList.add('hidden');
    }

    // Group customer users by class
    const customersByClass = customerUsers.reduce((acc, user) => {
        const userClass = user.class || 'Unassigned'; // Use 'Unassigned' for customers without a class
        if (!acc[userClass]) {
            acc[userClass] = [];
        }
        acc[userClass].push(user);
        return acc;
    }, {});

    // Sort classes numerically, treating 'Unassigned' as last
    const sortedClasses = Object.keys(customersByClass).sort((a, b) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        return parseInt(a) - parseInt(b);
    });

    sortedClasses.forEach(userClass => {
        const classColumn = document.createElement('div');
        classColumn.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200';
        classColumn.innerHTML = `
            <h4 class="text-md font-semibold text-gray-800 mb-3">Class ${userClass}</h4>
            <ul class="space-y-2" id="customerListClass-${userClass}"></ul>
        `;
        customerUserListDiv.appendChild(classColumn);

        const ul = document.getElementById(`customerListClass-${userClass}`);
        // Sort customers within each class by name
        const sortedCustomersInClass = customersByClass[userClass].sort((a, b) => a.name.localeCompare(b.name));

        sortedCustomersInClass.forEach(user => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between text-sm text-gray-700';
            li.innerHTML = `
                <span>${user.name} <span class="text-xs text-gray-500">(${user.id})</span></span>
                <div>
                    <button class="text-indigo-600 hover:text-indigo-900 mr-2 edit-user-btn" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-user-btn" data-id="${user.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            ul.appendChild(li);
        });
    });

    // Render Usthad users
    // Sort Usthad users by name
    const sortedUsthadUsers = usthadUsers.sort((a, b) => a.name.localeCompare(b.name));

    sortedUsthadUsers.forEach(user => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200';
        card.innerHTML = `
            <p class="text-md font-semibold text-gray-800 mb-1 truncate">${user.name}</p>
            <p class="text-sm text-gray-600 mb-2">ID: <span class="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">${user.id}</span></p>
            <div class="flex justify-end space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900 edit-user-btn" data-id="${user.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-user-btn" data-id="${user.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        usthadUsersContainer.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', editUser);
    });
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', deleteUser);
    });
}

/**
 * Handles adding or updating a user.
 * @param {Event} event - The form submission event.
 */
async function handleAddUserFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();

    const form = event.target;
    const userData = {
        id: form.newUserId.value.trim() || generateUniqueId(),
        name: form.newUserName.value.trim(),
        type: form.newUserType.value,
        class: null, // Default to null
    };

    // Only set class if user type is 'Customer' and a class is selected
    if (userData.type === 'Customer' && form.newUserClass.value) {
        userData.class = parseInt(form.newUserClass.value);
        // Basic validation for class
        if (isNaN(userData.class) || userData.class < 1 || userData.class > 6) {
            showMessage('Please select a valid class for customers (1-6) or leave it blank.', 'error');
            hideLoading();
            return;
        }
    } else {
        userData.class = null; // Ensure class is null for Usthad/Admin or if no class selected for Customer
    }

    try {
        if (editingUserId) {
            // Update existing user
            await sendData(`users/${editingUserId}`, 'PUT', userData);
            showMessage('User updated successfully!', 'success');
        } else {
            // Check for duplicate ID if provided
            const existingUser = users.find(u => u.id === userData.id);
            if (existingUser) {
                showMessage('User ID already exists. Please use a different ID or leave it empty for auto-generation.', 'error');
                hideLoading();
                return;
            }
            // Add new user
            await sendData('users', 'POST', userData);
            showMessage('User added successfully!', 'success');
        }
        form.reset();
        resetAddUserForm();
        await fetchUsers(); // Refresh users after CUD operation
        renderUsers(); // Re-render users
        updateDashboardCounts(); // Update dashboard counts
    } catch (e) {
        console.error("Error adding/updating user: ", e);
        showMessage('Failed to save user. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Populates the user form for editing.
 * @param {Event} event - The click event from the edit button.
 */
function editUser(event) {
    const userIdToEdit = event.currentTarget.dataset.id;
    const user = users.find(u => u.id === userIdToEdit);

    if (user) {
        editingUserId = userIdToEdit;
        document.getElementById('userFormTitle').textContent = 'Edit User';
        document.getElementById('userFormSubmitBtn').innerHTML = '<i class="fas fa-save mr-3"></i> Update User';
        document.getElementById('cancelUserEditBtn').classList.remove('hidden');

        document.getElementById('newUserId').value = user.id;
        document.getElementById('newUserId').readOnly = true; // Prevent changing ID during edit
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserType').value = user.type;

        // Show/hide class based on user type
        if (user.type === 'Customer') { // Class is relevant for Customer type
            document.getElementById('newUserClassGroup').classList.remove('hidden');
            document.getElementById('newUserClass').setAttribute('required', 'true'); // Make class required for customers
            document.getElementById('newUserClass').value = user.class || ''; // Set existing class or empty
        } else {
            document.getElementById('newUserClassGroup').classList.add('hidden');
            document.getElementById('newUserClass').removeAttribute('required'); // Remove required for non-customers
            document.getElementById('newUserClass').value = ''; // Clear class for non-customers
        }
    }
}

/**
 * Resets the user form to "Add New User" state.
 */
function resetAddUserForm() {
    editingUserId = null;
    document.getElementById('addUserForm').reset();
    document.getElementById('userFormTitle').textContent = 'Add New User';
    document.getElementById('userFormSubmitBtn').innerHTML = '<i class="fas fa-user-plus mr-3"></i> Add User';
    document.getElementById('cancelUserEditBtn').classList.add('hidden');
    document.getElementById('newUserId').readOnly = false; // Allow ID input again
    // By default, hide class group and set type to empty
    document.getElementById('newUserClassGroup').classList.add('hidden');
    document.getElementById('newUserClass').value = '';
    document.getElementById('newUserType').value = '';
}

/**
 * Deletes a user after confirmation.
 * @param {Event} event - The click event from the delete button.
 */
async function deleteUser(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const userIdToDelete = event.currentTarget.dataset.id;
    const userToDelete = users.find(u => u.id === userIdToDelete);

    if (!userToDelete) {
        showMessage('User not found.', 'error');
        return;
    }

    // Check if user has any issued books
    const hasIssuedBooks = issuedBooks.some(issue => issue.userId === userIdToDelete);
    if (hasIssuedBooks) {
        showMessage('Cannot delete user: This user currently has books issued.', 'error');
        return;
    }

    const confirmed = await showConfirmationModal(
        'Delete User',
        `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.id})? This action cannot be undone.`
    );

    if (confirmed) {
        showLoading();
        try {
            await sendData(`users/${userIdToDelete}`, 'DELETE');
            showMessage('User deleted successfully!', 'success');
            await fetchUsers(); // Refresh users after CUD operation
            renderUsers(); // Re-render users
            updateDashboardCounts(); // Update dashboard counts
        } catch (e) {
            console.error("Error deleting user: ", e);
            showMessage('Failed to delete user. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Librarian Management Functions ---

/**
 * Renders the list of librarians.
 */
function renderLibrarians() {
    const librarianListDiv = document.getElementById('librarianList');
    librarianListDiv.innerHTML = ''; // Clear previous content
    const noLibrariansMessage = document.getElementById('noLibrariansMessage');

    if (librarians.length === 0) {
        noLibrariansMessage.classList.remove('hidden');
        return;
    } else {
        noLibrariansMessage.classList.add('hidden');
    }

    // Sort librarians by name
    const sortedLibrarians = [...librarians].sort((a, b) => a.name.localeCompare(b.name));

    sortedLibrarians.forEach(librarian => {
        const card = document.createElement('div');
        card.className = 'bg-white p-5 rounded-lg shadow-md border border-gray-200';
        card.innerHTML = `
            <p class="text-lg font-semibold text-gray-800 mb-1 truncate">${librarian.name}</p>
            <p class="text-sm text-gray-600 mb-3">${librarian.position}</p>
            <div class="flex justify-end space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900 edit-librarian-btn" data-id="${librarian.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-librarian-btn" data-id="${librarian.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        librarianListDiv.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-librarian-btn').forEach(button => {
        button.addEventListener('click', editLibrarian);
    });
    document.querySelectorAll('.delete-librarian-btn').forEach(button => {
        button.addEventListener('click', deleteLibrarian);
    });
}

/**
 * Handles adding or updating a librarian.
 * @param {Event} event - The form submission event.
 */
async function handleAddLibrarianFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();

    const form = event.target;
    const librarianData = {
        name: form.newLibrarianName.value.trim(),
        position: form.newLibrarianPosition.value.trim(),
    };

    try {
        if (editingLibrarianId) {
            // Update existing librarian
            await sendData(`librarians/${editingLibrarianId}`, 'PUT', librarianData);
            showMessage('Librarian updated successfully!', 'success');
        } else {
            // Add new librarian
            librarianData.id = generateUniqueId();
            await sendData('librarians', 'POST', librarianData);
            showMessage('Librarian added successfully!', 'success');
        }
        form.reset();
        resetAddLibrarianForm();
        await fetchLibrarians(); // Refresh librarians after CUD operation
        renderLibrarians(); // Re-render librarians
        updateDashboardCounts(); // Update dashboard counts
        populateLibrarianSelect(); // Update librarian dropdown in issue section
    } catch (e) {
        console.error("Error adding/updating librarian: ", e);
        showMessage('Failed to save librarian. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Populates the librarian form for editing.
 * @param {Event} event - The click event from the edit button.
 */
function editLibrarian(event) {
    const librarianIdToEdit = event.currentTarget.dataset.id;
    const librarian = librarians.find(l => l.id === librarianIdToEdit);

    if (librarian) {
        editingLibrarianId = librarianIdToEdit;
        document.getElementById('librarianFormTitle').textContent = 'Edit Librarian';
        document.getElementById('librarianFormSubmitBtn').innerHTML = '<i class="fas fa-save mr-3"></i> Update Librarian';
        document.getElementById('cancelLibrarianEditBtn').classList.remove('hidden');

        document.getElementById('newLibrarianName').value = librarian.name;
        document.getElementById('newLibrarianPosition').value = librarian.position;
    }
}

/**
 * Resets the librarian form to "Add New Librarian" state.
 */
function resetAddLibrarianForm() {
    editingLibrarianId = null;
    document.getElementById('addLibrarianForm').reset();
    document.getElementById('librarianFormTitle').textContent = 'Add New Librarian';
    document.getElementById('librarianFormSubmitBtn').innerHTML = '<i class="fas fa-user-plus mr-3"></i> Add Librarian';
    document.getElementById('cancelLibrarianEditBtn').classList.add('hidden');
}

/**
 * Deletes a librarian after confirmation.
 * @param {Event} event - The click event from the delete button.
 */
async function deleteLibrarian(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const librarianIdToDelete = event.currentTarget.dataset.id;
    const librarianToDelete = librarians.find(l => l.id === librarianIdToDelete);

    if (!librarianToDelete) {
        showMessage('Librarian not found.', 'error');
        return;
    }

    // Check if librarian has any issued books that are not yet returned
    const librarianHasActiveIssues = issuedBooks.some(issue => issue.librarianId === librarianIdToDelete && issue.returned === false);

    if (librarianHasActiveIssues) {
        showMessage('Cannot delete librarian: This librarian has active issued books.', 'error');
        return;
    }

    const confirmed = await showConfirmationModal(
        'Delete Librarian',
        `Are you sure you want to delete librarian "${librarianToDelete.name}"? This action cannot be undone.`
    );

    if (confirmed) {
        showLoading();
        try {
            await sendData(`librarians/${librarianIdToDelete}`, 'DELETE');
            showMessage('Librarian deleted successfully!', 'success');
            await fetchLibrarians(); // Refresh librarians after CUD operation
            renderLibrarians(); // Re-render librarians
            updateDashboardCounts(); // Update dashboard counts
            populateLibrarianSelect(); // Update librarian dropdown in issue section
        } catch (e) {
            console.error("Error deleting librarian: ", e);
            showMessage('Failed to delete librarian. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}


// --- Event Handlers for Customer Section ---

/**
 * Updates the customer's name display on the customer page.
 */
function updateCustomerNameDisplay() {
    if (currentUserName) {
        document.getElementById('currentCustomerNameDisplay').textContent = currentUserName;
    } else {
        document.getElementById('currentCustomerNameDisplay').textContent = 'Customer';
    }
}

/**
 * Populates the year and category filter dropdowns for the customer catalog.
 */
function populateCustomerFilters() {
    const years = [...new Set(books.map(book => book.publishingYear).filter(year => year))].sort((a, b) => b - a);
    const categories = [...new Set(books.map(book => book.category).filter(category => category))].sort();

    const yearSelect = document.getElementById('customerYearFilter');
    const categorySelect = document.getElementById('customerCategoryFilter');

    yearSelect.innerHTML = '<option value="">All Years</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

/**
 * Renders the list of books for the customer view, grouped by category, with optional filters.
 * @param {string} searchTerm - Search term for title, ISBN, or catalog number.
 * @param {string} authorFilter - Filter by author (case-insensitive, partial match).
 * @param {number} yearFilter - Filter by publishing year.
 * @param {string} categoryFilter - Filter by category.
 */
function renderCustomerBooks(searchTerm = '', authorFilter = '', yearFilter = '', categoryFilter = '') {
    const customerBookListDiv = document.getElementById('customerBookList');
    customerBookListDiv.innerHTML = ''; // Clear previous content
    const noCustomerBooksMessage = document.getElementById('noCustomerBooksMessage');

    let filteredBooks = [...books]; // Start with a copy of all books

    // Apply search term
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            (book.title && book.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (book.isbn && book.isbn.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (book.catalogNumber && book.catalogNumber.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }

    // Apply filters
    if (authorFilter) {
        const lowerCaseAuthorFilter = authorFilter.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            book.author && book.author.toLowerCase().includes(lowerCaseAuthorFilter)
        );
    }
    if (yearFilter) {
        filteredBooks = filteredBooks.filter(book =>
            book.publishingYear && book.publishingYear === parseInt(yearFilter)
        );
    }
    if (categoryFilter) {
        const lowerCaseCategoryFilter = categoryFilter.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
            book.category && book.category.toLowerCase() === lowerCaseCategoryFilter
        );
    }

    if (filteredBooks.length === 0) {
        noCustomerBooksMessage.classList.remove('hidden');
        return;
    } else {
        noCustomerBooksMessage.classList.add('hidden');
    }

    // Group books by category
    const booksByCategory = filteredBooks.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(booksByCategory).sort();

    sortedCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mb-8';
        categoryDiv.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">${category} Books</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="customerBookCards-${category.replace(/\s+/g, '-')}">
                <!-- Book cards will be inserted here -->
            </div>
        `;
        customerBookListDiv.appendChild(categoryDiv);

        const bookCardsContainer = document.getElementById(`customerBookCards-${category.replace(/\s+/g, '-')}`);
        // Sort books within each category by title
        const sortedBooksInCategory = booksByCategory[category].sort((a, b) => a.title.localeCompare(b.title));

        sortedBooksInCategory.forEach(book => {
            const coverUrl = book.bookCoverUrl;
            let finalCoverSrc = '';
            if (coverUrl && isValidUrl(coverUrl)) {
                finalCoverSrc = coverUrl;
            } else {
                const coverIdentifier = book.isbn || book.title;
                const coverColor = stringToHexColor(coverIdentifier);
                const textColor = 'ffffff';
                finalCoverSrc = `https://placehold.co/100x150/${coverColor.substring(1)}/${textColor}?text=${encodeURIComponent(book.title.substring(0, Math.min(book.title.length, 10)))}`;
            }

            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center';
            card.innerHTML = `
                <img src="${finalCoverSrc}" alt="Cover" class="w-24 h-36 object-cover rounded-md shadow-sm mb-3" onerror="this.onerror=null;this.src='https://placehold.co/100x150/cccccc/333333?text=N/A';">
                <p class="text-lg font-semibold text-gray-800 mb-1 truncate w-full">${book.title}</p>
                <p class="text-sm text-gray-600 mb-2">${book.author}</p>
                <p class="text-xs text-gray-500 mb-3">Available: ${book.availableCopies}/${book.totalCopies}</p>
                <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out request-book-btn ${book.availableCopies <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-book-id="${book.id}" data-book-title="${book.title}" data-catalog-number="${book.catalogNumber}" ${book.availableCopies <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-hand-paper mr-2"></i> Request Book
                </button>
            `;
            bookCardsContainer.appendChild(card);
        });
    });

    document.querySelectorAll('.request-book-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const bookId = event.currentTarget.dataset.bookId;
            const bookTitle = event.currentTarget.dataset.bookTitle;
            const catalogNumber = event.currentTarget.dataset.catalogNumber;
            handleBookRequest(bookId, bookTitle, catalogNumber);
        });
    });
}

/**
 * Handles a customer requesting a book.
 * @param {string} bookId - The ID of the book being requested.
 * @param {string} bookTitle - The title of the book being requested.
 * @param {string} catalogNumber - The catalog number of the book.
 */
async function handleBookRequest(bookId, bookTitle, catalogNumber) {
    if (!currentUserId || !currentUserName) {
        showMessage('Please log in as a customer to request books.', 'info');
        return;
    }

    const confirmed = await showConfirmationModal('Request Book', `Are you sure you want to request "${bookTitle}"?`);
    if (!confirmed) return;

    showLoading();
    try {
        // Check book availability again (by re-fetching)
        await fetchBooks();
        const bookData = books.find(b => b.id === bookId);

        if (!bookData || bookData.availableCopies <= 0) {
            showMessage('This book is currently out of stock or not found.', 'error');
            hideLoading();
            return;
        }

        // Check if the user already has this book issued and not returned (by re-fetching)
        await fetchIssuedBooks();
        const userHasThisBook = issuedBooks.some(issue =>
            issue.userId === currentUserId &&
            issue.bookId === bookId &&
            issue.returned === false
        );

        if (userHasThisBook) {
            showMessage('You already have this book issued.', 'info');
            hideLoading();
            return;
        }

        // Decrement available copies (via backend)
        const updatedBook = { ...bookData, availableCopies: bookData.availableCopies - 1 };
        await sendData(`books/${bookId}`, 'PUT', updatedBook);

        // Create an "issue request" (via backend)
        const requestData = {
            id: generateUniqueId(),
            bookId: bookId,
            bookTitle: bookTitle,
            bookCatalogNumber: catalogNumber,
            customerId: currentUserId, // ID of the customer
            customerName: currentUserName, // Name of the customer
            requestDate: new Date().toISOString(),
            status: 'pending', // Status: pending, handled
        };
        await sendData('customerrequests', 'POST', requestData);

        showMessage('Book request submitted successfully! Please wait for admin approval.', 'success');
        await fetchAllData(); // Refresh all data, including customerRequests and books
        renderCustomerBooks(); // Re-render customer catalog to reflect availability change
    } catch (error) {
        console.error('Error submitting book request:', error);
        showMessage('Failed to submit book request.', 'error');
    } finally {
        hideLoading();
    }
}


// --- Initial Data Fetching and App Initialization ---

/**
 * Fetches all necessary data from the backend.
 */
async function fetchAllData() {
    showLoading();
    try {
        // Fetch all data concurrently
        await Promise.all([
            fetchBooks(),
            fetchUsers(),
            fetchLibrarians(),
            fetchIssuedBooks(),
            fetchHistory(),
            fetchCustomerRequests()
        ]);

        dbStatus.textContent = 'Connected (API)';
        dbStatus.className = 'text-green-600';
        console.log("All data fetched successfully.");
    } catch (error) {
        dbStatus.textContent = 'Disconnected (API Error)';
        dbStatus.className = 'text-red-600';
        console.error("Error fetching all initial data:", error);
        showMessage("Failed to load initial data. Please check backend connection.", "error");
    } finally {
        hideLoading();
    }
}

/**
 * Initializes the application, fetches initial data, and sets up the UI.
 */
window.onload = async () => {
    // Ensure splash screen is visible initially
    splashScreen.classList.remove('fade-out');
    splashScreen.style.display = 'flex'; // Ensure it's displayed

    // Simulate initial loading delay for splash screen
    await new Promise(resolve => setTimeout(resolve, 1500)); // Show splash for 1.5 seconds

    await fetchAllData(); // Fetch all data first

    // After data is fetched, set app as ready
    isAppReady = true;

    // Fade out splash screen
    splashScreen.classList.add('fade-out');
    splashScreen.addEventListener('transitionend', () => {
        splashScreen.remove(); // Remove from DOM after transition
    }, { once: true }); // Ensure listener is removed after first use

    // Initial UI render (will show login options)
    renderUIBasedOnRole();
    updateStatusSection();
    populateAdminFilters(); // Populate filters on initial load
    populateCustomerFilters(); // Populate customer filters on initial load
};


// --- Login Section Event Listeners ---

showAdminLoginBtn.addEventListener('click', () => {
    adminLoginForm.classList.remove('hidden');
    customerSelectionArea.classList.add('hidden');
});

/**
 * Populates the customer select dropdown with filtered users.
 * @param {Array} [filteredUsers=users] - Optional array of users to populate, defaults to all users.
 */
function populateCustomerSelectDropdown(filteredUsers = users) {
    const customerSelectDropdown = document.getElementById('customerSelectDropdown');
    customerSelectDropdown.innerHTML = '<option value="">-- Select Customer --</option>'; // Clear existing options

    const customerAndUsthadUsers = filteredUsers.filter(u => u.type === 'Customer' || u.type === 'Usthad');

    customerAndUsthadUsers.sort((a, b) => a.name.localeCompare(b.name)).forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.type}${user.class ? ' - Class ' + user.class : ''})`;
        customerSelectDropdown.appendChild(option);
    });
    // Ensure button is disabled if no option selected
    proceedAsCustomerBtn.disabled = !customerSelectDropdown.value;
}

showCustomerLoginBtn.addEventListener('click', async () => {
    adminLoginForm.classList.add('hidden');
    customerSelectionArea.classList.remove('hidden');
    showLoading();
    try {
        await fetchUsers(); // Ensure users are fresh for dropdown
        populateCustomerSelectDropdown(); // Populate customer dropdown
    } catch (error) {
        console.error("Error populating customer dropdown:", error);
        showMessage("Failed to load customer list.", "error");
    } finally {
        hideLoading();
    }
});

cancelAdminLoginBtn.addEventListener('click', () => {
    adminLoginForm.classList.add('hidden');
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
});

cancelCustomerLoginBtn.addEventListener('click', () => {
    customerSelectionArea.classList.add('hidden');
    customerSelectDropdown.value = '';
    proceedAsCustomerBtn.disabled = true;
    customerSearchInput.value = '';
});

// Admin Login Form Submission
adminLoginFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoading();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    // --- DEMO ADMIN LOGIN ---
    // In a real application, you would send these credentials to your backend
    // (e.g., POST /api/admin/login) and the backend would verify them against
    // your Google Sheet or a more secure authentication system.
    // For this frontend-only demo, we'll hardcode the check.
    if (username === 'admin' && password === 'password123') {
        // Simulate finding an admin user from the fetched users list
        const adminUser = users.find(u => u.type === 'Admin');
        if (adminUser) {
            currentUserId = adminUser.id;
            currentUserName = adminUser.name;
            currentUserType = 'Admin';
            showMessage('Admin login successful!', 'success');
            renderUIBasedOnRole(); // This will navigate to dashboard
        } else {
            showMessage('Admin user data not found in backend. Please add an Admin user.', 'error');
        }
    } else {
        showMessage('Invalid admin credentials.', 'error');
    }
    hideLoading();
});

// Customer Selection Dropdown Change
customerSelectDropdown.addEventListener('change', () => {
    if (customerSelectDropdown.value) {
        proceedAsCustomerBtn.disabled = false;
    } else {
        proceedAsCustomerBtn.disabled = true;
    }
});

// Customer Search Input (for dropdown filtering)
customerSearchInput.addEventListener('input', async () => {
    await fetchUsers(); // Ensure users are fresh
    const searchTerm = customerSearchInput.value.toLowerCase();
    const allUsers = users; // Use the globally fetched users
    const filteredUsers = allUsers.filter(user =>
        (user.type === 'Customer' || user.type === 'Usthad') &&
        (user.name.toLowerCase().includes(searchTerm) || user.id.toLowerCase().includes(searchTerm))
    );
    populateCustomerSelectDropdown(filteredUsers);
});


// Proceed as Customer Button
proceedAsCustomerBtn.addEventListener('click', async () => {
    const selectedCustomerId = customerSelectDropdown.value;
    if (selectedCustomerId) {
        showLoading();
        try {
            await fetchUsers(); // Ensure users are fresh
            const userData = users.find(u => u.id === selectedCustomerId);

            if (userData && (userData.type === 'Customer' || userData.type === 'Usthad')) {
                currentUserId = selectedCustomerId;
                currentUserName = userData.name;
                currentUserType = userData.type; // Should be 'Customer' or 'Usthad'
                showMessage(`Welcome, ${currentUserName}!`, 'success');
                renderUIBasedOnRole(); // This will navigate to customer page
            } else {
                showMessage('Selected user data not found or is not a customer/usthad.', 'error');
            }
        } catch (error) {
            console.error('Error proceeding as customer:', error);
            showMessage('Failed to log in as customer.', 'error');
        } finally {
            hideLoading();
        }
    } else {
        showMessage('Please select a customer.', 'info');
    }
});


// --- Navigation ---
navLinks.forEach(link => {
    link.addEventListener('click', navigateToSection);
});

logoutBtn.addEventListener('click', handleLogout);

// Book Cover URL/File handling (only URL input is supported now)
bookCoverUrlInput.addEventListener('input', () => {
    const url = bookCoverUrlInput.value.trim();
    if (url && isValidUrl(url)) {
        bookCoverPreview.src = url;
        bookCoverPreview.classList.remove('hidden');
    } else {
        bookCoverPreview.src = '';
        bookCoverPreview.classList.add('hidden');
    }
});

// Admin Catalog Filters
// Removed redundant applyAdminFiltersBtn listener and added live filtering
document.getElementById('adminAuthorFilter').addEventListener('input', () => {
    const authorFilter = document.getElementById('adminAuthorFilter').value.trim();
    const yearFilter = document.getElementById('adminYearFilter').value;
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    renderBooks(authorFilter, yearFilter, categoryFilter);
});
document.getElementById('adminYearFilter').addEventListener('change', () => {
    const authorFilter = document.getElementById('adminAuthorFilter').value.trim();
    const yearFilter = document.getElementById('adminYearFilter').value;
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    renderBooks(authorFilter, yearFilter, categoryFilter);
});
document.getElementById('adminCategoryFilter').addEventListener('change', () => {
    const authorFilter = document.getElementById('adminAuthorFilter').value.trim();
    const yearFilter = document.getElementById('adminYearFilter').value;
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    renderBooks(authorFilter, yearFilter, categoryFilter);
});


// Issue Book Form
document.getElementById('searchBookBtn').addEventListener('click', searchBookForIssue);
document.getElementById('searchUserInIssueBtn').addEventListener('click', searchUserForIssue);
document.getElementById('issueBookForm').addEventListener('submit', handleIssueBookSubmit);
document.getElementById('issueLibrarianSelect').addEventListener('change', updateIssueFormDisplayAndButton);


// History Section
document.getElementById('searchHistoryBtn').addEventListener('click', searchHistory);

// User Management Form
document.getElementById('addUserForm').addEventListener('submit', handleAddUserFormSubmit);
document.getElementById('cancelUserEditBtn').addEventListener('click', resetAddUserForm);
// Toggle class input based on user type
document.getElementById('newUserType').addEventListener('change', (event) => {
    if (event.target.value === 'Customer') { // Class is relevant for Customer type
        document.getElementById('newUserClassGroup').classList.remove('hidden');
        document.getElementById('newUserClass').setAttribute('required', 'true'); // Make class required for customers
    } else {
        document.getElementById('newUserClassGroup').classList.add('hidden');
        document.getElementById('newUserClass').removeAttribute('required'); // Remove required for non-customers
        document.getElementById('newUserClass').value = ''; // Clear value if not customer
    }
});

// Librarian Form
document.getElementById('addLibrarianForm').addEventListener('submit', handleAddLibrarianFormSubmit);
document.getElementById('cancelLibrarianEditBtn').addEventListener('click', resetAddLibrarianForm);

// Customer Section Filters
// Removed redundant applyCustomerFiltersBtn listener and added live filtering
document.getElementById('customerBookSearchInput').addEventListener('input', () => {
    const searchTerm = document.getElementById('customerBookSearchInput').value.trim();
    const authorFilter = document.getElementById('customerAuthorFilter').value.trim();
    const yearFilter = document.getElementById('customerYearFilter').value;
    const categoryFilter = document.getElementById('customerCategoryFilter').value;
    renderCustomerBooks(searchTerm, authorFilter, yearFilter, categoryFilter);
});
document.getElementById('customerAuthorFilter').addEventListener('input', () => {
    const searchTerm = document.getElementById('customerBookSearchInput').value.trim();
    const authorFilter = document.getElementById('customerAuthorFilter').value.trim();
    const yearFilter = document.getElementById('customerYearFilter').value;
    const categoryFilter = document.getElementById('customerCategoryFilter').value;
    renderCustomerBooks(searchTerm, authorFilter, yearFilter, categoryFilter);
});
document.getElementById('customerYearFilter').addEventListener('change', () => {
    const searchTerm = document.getElementById('customerBookSearchInput').value.trim();
    const authorFilter = document.getElementById('customerAuthorFilter').value.trim();
    const yearFilter = document.getElementById('customerYearFilter').value;
    const categoryFilter = document.getElementById('customerCategoryFilter').value;
    renderCustomerBooks(searchTerm, authorFilter, yearFilter, categoryFilter);
});
document.getElementById('customerCategoryFilter').addEventListener('change', () => {
    const searchTerm = document.getElementById('customerBookSearchInput').value.trim();
    const authorFilter = document.getElementById('customerAuthorFilter').value.trim();
    const yearFilter = document.getElementById('customerYearFilter').value;
    const categoryFilter = document.getElementById('customerCategoryFilter').value;
    renderCustomerBooks(searchTerm, authorFilter, yearFilter, categoryFilter);
});

// Initial render of user classes for new user form
populateUserClassSelect();
// Initially hide class group until a type is selected
document.getElementById('newUserClassGroup').classList.add('hidden');
