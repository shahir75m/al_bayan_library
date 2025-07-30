// script.js
// Node.js jQuery integration
// Note: This script assumes you have included the jQuery library in your HTML file.

// BASE_URL for your Node.js backend API
const BASE_URL = 'http://localhost:3000/api';

// Global variables for user session
let currentUserId = null;
let currentUserName = null;
let currentUserType = null;
let isAppReady = false;

// DOM Elements using jQuery selectors
const $splashScreen = $('#splashScreen');
const $loginSection = $('#login-section');
const $adminLoginForm = $('#admin-login-form');
const $customerSelectionArea = $('#customer-selection-area');
const $showAdminLoginBtn = $('#showAdminLoginBtn');
const $showCustomerLoginBtn = $('#showCustomerLoginBtn');
const $cancelAdminLoginBtn = $('#cancelAdminLoginBtn');
const $cancelCustomerLoginBtn = $('#cancelCustomerLoginBtn');
const $adminLoginFormElement = $('#adminLoginForm');
const $customerSelectDropdown = $('#customerSelectDropdown');
const $proceedAsCustomerBtn = $('#proceedAsCustomerBtn');
const $customerSearchInput = $('#customerSearchInput');
const $searchCustomerDropdownBtn = $('#searchCustomerDropdownBtn');

const $navLinks = $('.nav-link');
const $sectionContents = $('.section-content');
const $messageBox = $('#messageBox');
const $loadingOverlay = $('#loadingOverlay');
const $confirmationModal = $('#confirmationModal');
const $confirmYesBtn = $('#confirmYesBtn');
const $confirmNoBtn = $('#confirmNoBtn');
const $confirmationModalTitle = $('#confirmationModalTitle');
const $confirmationModalMessage = $('#confirmationModalMessage');

const $logoutBtn = $('#logoutBtn');
const $currentLoggedInUserIdDisplay = $('#currentLoggedInUserIdDisplay');

// Admin Dashboard Elements
const $dashboardSection = $('#dashboard-section');
const $totalBooksCount = $('#totalBooksCount');
const $issuedBooksCount = $('#issuedBooksCount');
const $totalUsersCount = $('#totalUsersCount');
const $totalLibrariansCount = $('#totalLibrariansCount');
const $customerRequestsList = $('#customerRequestsList');
const $noCustomerRequestsMessage = $('#noCustomerRequestsMessage');

// Catalog Section Elements
const $catalogSection = $('#catalog-section');
const $bookForm = $('#bookForm');
const $bookFormTitle = $('#bookFormTitle');
const $bookFormSubmitBtn = $('#bookFormSubmitBtn');
const $cancelBookEditBtn = $('#cancelBookEditBtn');
const $bookCoverUrlInput = $('#bookCoverUrl');
const $bookCoverFileInput = $('#bookCoverFile');
const $bookCoverPreview = $('#bookCoverPreview');
const $bookList = $('#bookList');
const $noBooksMessage = $('#noBooksMessage');
const $adminAuthorFilter = $('#adminAuthorFilter');
const $adminYearFilter = $('#adminYearFilter');
const $adminCategoryFilter = $('#adminCategoryFilter');
const $applyAdminFiltersBtn = $('#applyAdminFiltersBtn');

// Issue/Return Section Elements
const $issueSection = $('#issue-section');
const $issueBookForm = $('#issueBookForm');
const $catalogNumberSearch = $('#catalogNumberSearch');
const $searchBookBtn = $('#searchBookBtn');
const $issueUserIdSearch = $('#issueUserIdSearch');
const $searchUserInIssueBtn = $('#searchUserInIssueBtn');
const $issueLibrarianSelect = $('#issueLibrarianSelect');
const $selectedBookDisplay = $('#selectedBookDisplay');
const $selectedBookTitle = $('#selectedBookTitle');
const $selectedBookAuthor = $('#selectedBookAuthor');
const $selectedBookISBN = $('#selectedBookISBN');
const $selectedBookCatalogNumber = $('#selectedBookCatalogNumber');
const $selectedBookAvailableCopies = $('#selectedBookAvailableCopies');
const $selectedUserDisplay = $('#selectedUserDisplay');
const $selectedUserName = $('#selectedUserName');
const $selectedUserClass = $('#selectedUserClass');
const $issueBookSubmitBtn = $('#issueBookSubmitBtn');
const $issuedBooksList = $('#issuedBooksList');
const $noIssuedBooksMessage = $('#noIssuedBooksMessage');

let selectedBookForIssue = null;
let selectedUserForIssue = null;

// History Section Elements
const $historySection = $('#history-section');
const $historyUserIdSearch = $('#historyUserIdSearch');
const $searchHistoryBtn = $('#searchHistoryBtn');
const $historyTableBody = $('#historyTableBody');
const $noHistoryMessage = $('#noHistoryMessage');

// User Management Section Elements
const $userManagementSection = $('#user-management-section');
const $addUserForm = $('#addUserForm');
const $userFormTitle = $('#userFormTitle');
const $userFormSubmitBtn = $('#userFormSubmitBtn');
const $cancelUserEditBtn = $('#cancelUserEditBtn');
const $newUserIdInput = $('#newUserId');
const $newUserNameInput = $('#newUserName');
const $newUserTypeSelect = $('#newUserType');
const $newUserClassGroup = $('#newUserClassGroup');
const $newUserClassSelect = $('#newUserClass');
const $customerUserList = $('#customerUserList');
const $noCustomerUsersMessage = $('#noCustomerUsersMessage');
const $usthadUsersContainer = $('#usthadUsersContainer');
const $noUsthadMessage = $('#noUsthadMessage');

// Librarian Section Elements
const $librarianSection = $('#librarian-section');
const $addLibrarianForm = $('#addLibrarianForm');
const $librarianFormTitle = $('#librarianFormTitle');
const $librarianFormSubmitBtn = $('#librarianFormSubmitBtn');
const $cancelLibrarianEditBtn = $('#cancelLibrarianEditBtn');
const $newLibrarianNameInput = $('#newLibrarianName');
const $newLibrarianPositionInput = $('#newLibrarianPosition');
const $librarianList = $('#librarianList');
const $noLibrariansMessage = $('#noLibrariansMessage');

// Status Section Elements
const $statusSection = $('#status-section');
const $dbStatus = $('#dbStatus');
const $authStatus = $('#authStatus');
const $loggedInUserIdStatus = $('#loggedInUserIdStatus');

// Customer Section Elements
const $customerSection = $('#customer-section');
const $currentCustomerNameDisplay = $('#currentCustomerNameDisplay');
const $customerBookSearchInput = $('#customerBookSearchInput');
const $customerAuthorFilter = $('#customerAuthorFilter');
const $customerYearFilter = $('#customerYearFilter');
const $customerCategoryFilter = $('#customerCategoryFilter');
const $applyCustomerFiltersBtn = $('#applyCustomerFiltersBtn');
const $customerBookList = $('#customerBookList');
const $noCustomerBooksMessage = $('#noCustomerBooksMessage');

// Global data arrays (for client-side caching and rendering)
let books = [];
let users = [];
let librarians = [];
let issuedBooks = [];
let history = [];
let customerRequests = [];

let editingBookId = null;
let editingUserId = null;
let editingLibrarianId = null;

let tempPrefillBookId = null;
let tempPrefillUserId = null;


// --- Utility Functions ---

function showMessage(message, type) {
    $messageBox.text(message).removeClass().addClass(`message-box show ${type}`);
    setTimeout(() => {
        $messageBox.removeClass('show');
    }, 3000);
}

function showLoading() {
    $loadingOverlay.removeClass('hidden');
}

function hideLoading() {
    $loadingOverlay.addClass('hidden');
}

function showConfirmationModal(title, message) {
    return new Promise(resolve => {
        $confirmationModalTitle.text(title);
        $confirmationModalMessage.text(message);
        $confirmationModal.addClass('show');

        const onYesClick = () => {
            $confirmationModal.removeClass('show');
            $confirmYesBtn.off('click', onYesClick);
            $confirmNoBtn.off('click', onNoClick);
            resolve(true);
        };

        const onNoClick = () => {
            $confirmationModal.removeClass('show');
            $confirmYesBtn.off('click', onYesClick);
            $confirmNoBtn.off('click', onNoClick);
            resolve(false);
        };

        $confirmYesBtn.on('click', onYesClick);
        $confirmNoBtn.on('click', onNoClick);
    });
}

function generateUniqueId() {
    return crypto.randomUUID();
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

// Rewritten fetchData using jQuery.ajax
function fetchData(endpoint) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${BASE_URL}/${endpoint}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                resolve(data);
            },
            error: function(xhr, status, error) {
                console.error(`Error fetching ${endpoint}:`, error);
                showMessage(`Failed to load ${endpoint}.`, 'error');
                reject([]);
            }
        });
    });
}

// Rewritten sendData using jQuery.ajax
function sendData(endpoint, method, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `${BASE_URL}/${endpoint}`,
            type: method,
            contentType: 'application/json',
            dataType: 'json',
            success: function(responseData) {
                resolve(responseData);
            },
            error: function(xhr, status, error) {
                const responseData = JSON.parse(xhr.responseText || '{}');
                const errorMessage = responseData.error || `HTTP error! status: ${xhr.status}`;
                console.error(`Error ${method}ing data to ${endpoint}:`, error);
                showMessage(`Failed to ${method.toLowerCase()} data. Error: ${errorMessage}`, 'error');
                reject(new Error(errorMessage));
            }
        };

        if (data) {
            options.data = JSON.stringify(data);
        }

        $.ajax(options);
    });
}


// --- Section Navigation and Role-based UI ---

function renderUIBasedOnRole() {
    console.log("renderUIBasedOnRole called. Current userType:", currentUserType, "Current userId:", currentUserId);
    $sectionContents.removeClass('active');
    $navLinks.removeClass('bg-gray-700 text-white').addClass('text-gray-300 hover:bg-gray-700 hover:text-white').addClass('hidden');

    $adminLoginForm.addClass('hidden');
    $customerSelectionArea.addClass('hidden');
    $showAdminLoginBtn.removeClass('hidden');
    $showCustomerLoginBtn.removeClass('hidden');


    if (currentUserType === 'Admin') {
        console.log("Rendering UI for Admin.");
        $('.admin-only').removeClass('hidden');
        $('.customer-only').addClass('hidden');
        $logoutBtn.removeClass('hidden');

        $dashboardSection.addClass('active');
        $navLinks.filter('[data-section="dashboard-section"]').removeClass('text-gray-300 hover:bg-gray-700 hover:text-white').addClass('bg-gray-700 text-white');
        updateDashboardCounts();
        renderCustomerRequests();
    } else if (currentUserType === 'Customer' || currentUserType === 'Usthad') {
        console.log("Rendering UI for Customer/Usthad.");
        $('.customer-only').removeClass('hidden');
        $('.admin-only').addClass('hidden');
        $logoutBtn.removeClass('hidden');

        $customerSection.addClass('active');
        $navLinks.filter('[data-section="customer-section"]').removeClass('text-gray-300 hover:bg-gray-700 hover:text-white').addClass('bg-gray-700 text-white');
        renderCustomerBooks();
        updateCustomerNameDisplay();
    } else {
        console.log("Rendering UI for Not Logged In.");
        $loginSection.addClass('active');
        $logoutBtn.addClass('hidden');
        $currentLoggedInUserIdDisplay.text(`Current User: Please Log In`);
    }
    if (currentUserId && currentUserType) {
        $currentLoggedInUserIdDisplay.text(`Current User: ${currentUserName} (${currentUserType} - ID: ${currentUserId})`);
    }
}

async function navigateToSection(event) {
    const targetSectionId = $(event.currentTarget).data('section');
    console.log("navigateToSection called. Target:", targetSectionId);

    if (!isAppReady || !currentUserId) {
        showMessage('Library system is still loading. Please wait a moment.', 'info');
        return;
    }

    $sectionContents.removeClass('active');
    $navLinks.removeClass('bg-gray-700 text-white').addClass('text-gray-300 hover:bg-gray-700 hover:text-white');

    const $targetSection = $(`#${targetSectionId}`);
    if ($targetSection.length) {
        $targetSection.addClass('active');
    } else {
        console.error(`Error: Section with ID "${targetSectionId}" not found.`);
        showMessage(`Error: Section "${targetSectionId}" not found.`, 'error');
    }

    $(event.currentTarget).removeClass('text-gray-300 hover:bg-gray-700 hover:text-white').addClass('bg-gray-700 text-white');

    showLoading();
    try {
        if (targetSectionId === 'dashboard-section') {
            await fetchAllData();
            updateDashboardCounts();
            renderCustomerRequests();
        } else if (targetSectionId === 'catalog-section') {
            await fetchBooks();
            $adminAuthorFilter.val('');
            $adminYearFilter.val('');
            $adminCategoryFilter.val('');
            renderBooks();
        } else if (targetSectionId === 'issue-section') {
            await fetchIssuedBooks();
            await fetchLibrarians();
            renderIssuedBooks();
            populateLibrarianSelect();
            resetIssueBookForm();

            if (tempPrefillBookId && tempPrefillUserId) {
                const book = books.find(b => b.id === tempPrefillBookId);
                const user = users.find(u => u.id === tempPrefillUserId);

                if (book && user) {
                    selectedBookForIssue = book;
                    selectedUserForIssue = user;
                    $catalogNumberSearch.val(book.catalogNumber);
                    $issueUserIdSearch.val(user.id);
                    updateIssueFormDisplayAndButton();
                } else {
                    console.warn('Pre-fill data for issue form not found. Data might be out of sync.');
                }
                tempPrefillBookId = null;
                tempPrefillUserId = null;
            }
        } else if (targetSectionId === 'history-section') {
            await fetchHistory();
            renderHistoryTable();
        } else if (targetSectionId === 'user-management-section') {
            await fetchUsers();
            renderUsers();
            populateUserClassSelect();
            resetAddUserForm();
        } else if (targetSectionId === 'librarian-section') {
            await fetchLibrarians();
            renderLibrarians();
            resetAddLibrarianForm();
        } else if (targetSectionId === 'status-section') {
            updateStatusSection();
        } else if (targetSectionId === 'customer-section') {
            await fetchBooks();
            $customerBookSearchInput.val('');
            $customerAuthorFilter.val('');
            $customerYearFilter.val('');
            $customerCategoryFilter.val('');
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

// --- Dashboard Functions ---

function updateDashboardCounts() {
    $totalBooksCount.text(books.length);
    $issuedBooksCount.text(issuedBooks.length);
    $totalUsersCount.text(users.length);
    $totalLibrariansCount.text(librarians.length);
}

function renderCustomerRequests() {
    $customerRequestsList.empty();
    const pendingRequests = customerRequests.filter(req => req.status === 'pending');

    if (pendingRequests.length === 0) {
        $noCustomerRequestsMessage.removeClass('hidden');
    } else {
        $noCustomerRequestsMessage.addClass('hidden');
    }

    const sortedRequests = [...pendingRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    sortedRequests.forEach(request => {
        const book = books.find(b => b.id === request.bookId);
        const card = $('<div>').addClass('bg-white p-5 rounded-lg shadow-md border border-gray-200');
        card.html(`
            <p class="text-lg font-semibold text-gray-800 mb-2 truncate">Book: ${book ? book.title : 'Unknown'}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Requested by:</strong> ${request.customerName} (${request.customerId})</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Request Date:</strong> ${formatDate(request.requestDate)}</p>
            <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out mark-request-handled-btn" data-id="${request.id}" data-book-id="${request.bookId}" data-customer-id="${request.customerId}">
                <i class="fas fa-check-circle mr-2"></i> Mark as Handled & Issue
            </button>
        `);
        $customerRequestsList.append(card);
    });

    $('.mark-request-handled-btn').on('click', markCustomerRequestHandled);
}

async function markCustomerRequestHandled(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const requestId = $(event.currentTarget).data('id');
    const bookId = $(event.currentTarget).data('book-id');
    const customerId = $(event.currentTarget).data('customer-id');

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

            tempPrefillBookId = bookId;
            tempPrefillUserId = customerId;

            const $issueReturnNavLink = $navLinks.filter('[data-section="issue-section"]');
            if ($issueReturnNavLink.length) {
                $issueReturnNavLink.trigger('click');
            }
        } catch (e) {
            console.error("Error handling request: ", e);
            showMessage('Failed to mark request as handled. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

function updateIssueFormDisplayAndButton() {
    if (selectedBookForIssue) {
        $selectedBookTitle.text(selectedBookForIssue.title);
        $selectedBookAuthor.text(selectedBookForIssue.author);
        $selectedBookISBN.text(selectedBookForIssue.isbn);
        $selectedBookCatalogNumber.text(selectedBookForIssue.catalogNumber);
        $selectedBookAvailableCopies.text(`${selectedBookForIssue.availableCopies}/${selectedBookForIssue.totalCopies}`);
        $selectedBookDisplay.removeClass('hidden');
    } else {
        $selectedBookDisplay.addClass('hidden');
    }

    if (selectedUserForIssue) {
        $selectedUserName.text(selectedUserForIssue.name);
        $selectedUserClass.text(`${selectedUserForIssue.type} - Class ${selectedUserForIssue.class || 'N/A'}`);
        $selectedUserDisplay.removeClass('hidden');
    } else {
        $selectedUserDisplay.addClass('hidden');
    }

    if (selectedBookForIssue && selectedUserForIssue && selectedBookForIssue.availableCopies > 0 && $issueLibrarianSelect.val()) {
        $issueBookSubmitBtn.prop('disabled', false);
    } else {
        $issueBookSubmitBtn.prop('disabled', true);
    }
}


// --- Catalog (Book) Functions ---

function renderBooks(authorFilter = '', yearFilter = '', categoryFilter = '') {
    $bookList.empty();
    const filteredBooks = books.filter(book => {
        const authorMatch = !authorFilter || (book.author && book.author.toLowerCase().includes(authorFilter.toLowerCase()));
        const yearMatch = !yearFilter || (book.publishingYear && book.publishingYear === parseInt(yearFilter));
        const categoryMatch = !categoryFilter || (book.category && book.category.toLowerCase() === categoryFilter.toLowerCase());
        return authorMatch && yearMatch && categoryMatch;
    });

    if (filteredBooks.length === 0) {
        $noBooksMessage.removeClass('hidden');
        return;
    } else {
        $noBooksMessage.addClass('hidden');
    }

    const booksByCategory = filteredBooks.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {});

    const sortedCategories = Object.keys(booksByCategory).sort();

    sortedCategories.forEach(category => {
        const categoryDiv = $('<div>').addClass('mb-8');
        categoryDiv.html(`
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
                    </tbody>
                </table>
            </div>
        `);
        $bookList.append(categoryDiv);

        const $tableBody = $(`#bookTableBody-${category.replace(/\s+/g, '-')}`);
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

            const $row = $('<tr>').addClass('hover:bg-gray-50 transition duration-150 ease-in-out');
            $row.html(`
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
            `);
            $tableBody.append($row);
        });
    });

    $('.edit-book-btn').on('click', editBook);
    $('.delete-book-btn').on('click', deleteBook);
}

function populateAdminFilters() {
    const years = [...new Set(books.map(book => book.publishingYear).filter(year => year))].sort((a, b) => b - a);
    const categories = [...new Set(books.map(book => book.category).filter(category => category))].sort();

    const $yearSelect = $('#adminYearFilter');
    const $categorySelect = $('#adminCategoryFilter');

    $yearSelect.html('<option value="">All Years</option>');
    years.forEach(year => {
        $yearSelect.append($('<option>').val(year).text(year));
    });

    $categorySelect.html('<option value="">All Categories</option>');
    categories.forEach(category => {
        $categorySelect.append($('<option>').val(category).text(category));
    });
}


function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

async function handleBookFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();

    const form = $(event.target);
    const bookData = {
        title: form.find('#title').val(),
        author: form.find('#author').val(),
        isbn: form.find('#isbn').val(),
        catalogNumber: form.find('#catalogNumber').val(),
        publishingYear: parseInt(form.find('#publishingYear').val()),
        publisher: form.find('#publisher').val(),
        bookPrice: parseFloat(form.find('#bookPrice').val()),
        category: form.find('#category').val(),
        totalCopies: parseInt(form.find('#totalCopies').val()),
        read: form.find('#read').prop('checked'),
        bookCoverUrl: form.find('#bookCoverUrl').val().trim()
    };

    if (bookData.bookCoverUrl && !isValidUrl(bookData.bookCoverUrl)) {
        showMessage('Invalid Book Cover URL provided. Please enter a valid URL or leave it empty.', 'error');
        hideLoading();
        return;
    }

    try {
        if (editingBookId) {
            const existingBook = books.find(b => b.id === editingBookId);
            if (!existingBook) {
                showMessage('Book not found for update.', 'error');
                hideLoading();
                return;
            }

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
            bookData.id = generateUniqueId();
            bookData.availableCopies = bookData.totalCopies;
            await sendData('books', 'POST', bookData);
            showMessage('Book added successfully!', 'success');
        }
        form.trigger('reset');
        resetBookForm();
        await fetchBooks();
        renderBooks();
    } catch (e) {
        console.error("Error adding/updating book: ", e);
        showMessage('Failed to save book. Please try again. Error: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

function editBook(event) {
    const bookId = $(event.currentTarget).data('id');
    const book = books.find(b => b.id === bookId);

    if (book) {
        editingBookId = bookId;
        $bookFormTitle.text('Edit Book');
        $bookFormSubmitBtn.html('<i class="fas fa-save mr-3"></i> Update Book');
        $cancelBookEditBtn.removeClass('hidden');

        $('#title').val(book.title);
        $('#author').val(book.author);
        $('#isbn').val(book.isbn);
        $('#catalogNumber').val(book.catalogNumber);
        $('#publishingYear').val(book.publishingYear);
        $('#publisher').val(book.publisher);
        $('#bookPrice').val(book.bookPrice);
        $('#category').val(book.category);
        $('#totalCopies').val(book.totalCopies);
        $('#read').prop('checked', book.read);
        $('#bookCoverUrl').val(book.bookCoverUrl || '');

        if (book.bookCoverUrl && isValidUrl(book.bookCoverUrl)) {
            $bookCoverPreview.attr('src', book.bookCoverUrl).removeClass('hidden');
        } else {
            $bookCoverPreview.attr('src', '').addClass('hidden');
        }
    }
}

function resetBookForm() {
    editingBookId = null;
    $bookForm.trigger('reset');
    $bookFormTitle.text('Add New Book');
    $bookFormSubmitBtn.html('<i class="fas fa-plus-circle mr-3"></i> Add Book');
    $cancelBookEditBtn.addClass('hidden');
    $bookCoverPreview.attr('src', '').addClass('hidden');
}

async function deleteBook(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const bookId = $(event.currentTarget).data('id');
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
            await fetchBooks();
            renderBooks();
        } catch (e) {
            console.error("Error deleting book: ", e);
            showMessage('Failed to delete book. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Issue/Return Functions ---

function renderIssuedBooks() {
    $issuedBooksList.empty();
    if (issuedBooks.length === 0) {
        $noIssuedBooksMessage.removeClass('hidden');
        return;
    } else {
        $noIssuedBooksMessage.addClass('hidden');
    }
    const sortedIssuedBooks = [...issuedBooks].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    sortedIssuedBooks.forEach(issue => {
        const book = books.find(b => b.id === issue.bookId);
        const user = users.find(u => u.id === issue.userId);
        const librarian = librarians.find(l => l.id === issue.librarianId);
        if (book && user && librarian) {
            const $card = $('<div>').addClass('bg-white p-5 rounded-lg shadow-md border border-gray-200');
            $card.html(`
                <p class="text-lg font-semibold text-gray-800 mb-2 truncate">${book.title}</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Issued to:</strong> ${user.name} (${user.type} - Class ${user.class || 'N/A'})</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Issued by:</strong> ${librarian.name}</p>
                <p class="text-sm text-gray-600 mb-3"><strong>Issue Date:</strong> ${formatDate(issue.issueDate)}</p>
                <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out return-book-btn" data-id="${issue.id}" data-book-id="${book.id}" data-user-id="${user.id}">
                    <i class="fas fa-undo mr-2"></i> Return Book
                </button>
            `);
            $issuedBooksList.append($card);
        }
    });
    $('.return-book-btn').on('click', returnBook);
}

function populateLibrarianSelect() {
    $issueLibrarianSelect.html('<option value="">-- Select Librarian --</option>');
    librarians.forEach(librarian => {
        $issueLibrarianSelect.append($('<option>').val(librarian.id).text(librarian.name));
    });
}

async function searchBookForIssue() {
    const catalogNumber = $catalogNumberSearch.val().trim();
    selectedBookForIssue = null;
    if (!catalogNumber) {
        updateIssueFormDisplayAndButton();
        showMessage('Please enter a catalog number to search.', 'info');
        return;
    }
    showLoading();
    try {
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
        updateIssueFormDisplayAndButton();
    }
}

async function searchUserForIssue() {
    const userIdSearch = $issueUserIdSearch.val().trim();
    selectedUserForIssue = null;
    if (!userIdSearch) {
        updateIssueFormDisplayAndButton();
        showMessage('Please enter a User ID to search.', 'info');
        return;
    }
    showLoading();
    try {
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
        updateIssueFormDisplayAndButton();
    }
}

async function handleIssueBookSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();
    const librarianId = $issueLibrarianSelect.val();
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
        const updatedBook = { ...selectedBookForIssue, availableCopies: selectedBookForIssue.availableCopies - 1 };
        await sendData(`books/${selectedBookForIssue.id}`, 'PUT', updatedBook);
        const issueData = {
            id: generateUniqueId(),
            bookId: selectedBookForIssue.id,
            bookTitle: selectedBookForIssue.title,
            bookCatalogNumber: selectedBookForIssue.catalogNumber,
            userId: selectedUserForIssue.id,
            userName: selectedUserForIssue.name,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            librarianId: librarianId,
            librarianName: librarianName,
            returned: false
        };
        await sendData('issuedbooks', 'POST', issueData);

        const historyEntry = {
            id: generateUniqueId(),
            bookId: selectedBookForIssue.id,
            bookTitle: selectedBookForIssue.title,
            bookCatalogNumber: selectedBookForIssue.catalogNumber,
            userId: selectedUserForIssue.id,
            userName: selectedUserForIssue.name,
            type: 'issue',
            date: new Date().toISOString(),
            librarianId: librarianId,
            librarianName: librarianName
        };
        await sendData('history', 'POST', historyEntry);
        showMessage('Book issued successfully!', 'success');
        resetIssueBookForm();
        await fetchIssuedBooks();
        renderIssuedBooks();
        await fetchBooks(); // Update the catalog count
    } catch (e) {
        console.error("Error issuing book: ", e);
        showMessage('Failed to issue book. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function resetIssueBookForm() {
    $issueBookForm.trigger('reset');
    selectedBookForIssue = null;
    selectedUserForIssue = null;
    updateIssueFormDisplayAndButton();
}

async function returnBook(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const issueId = $(event.currentTarget).data('id');
    const issuedBookEntry = issuedBooks.find(issue => issue.id === issueId);
    if (!issuedBookEntry) {
        showMessage('Issued book entry not found.', 'error');
        return;
    }
    const confirmed = await showConfirmationModal(
        'Return Book',
        `Are you sure you want to mark "${issuedBookEntry.bookTitle}" as returned?`
    );
    if (confirmed) {
        showLoading();
        try {
            // Update issued book entry to returned
            await sendData(`issuedbooks/${issueId}`, 'PUT', { returned: true, returnDate: new Date().toISOString() });

            // Increment available copies of the book (via backend)
            const bookToReturn = books.find(b => b.id === issuedBookEntry.bookId);
            if (bookToReturn) {
                const updatedBook = { ...bookToReturn, availableCopies: bookToReturn.availableCopies + 1 };
                await sendData(`books/${bookToReturn.id}`, 'PUT', updatedBook);
            }

            // Add return entry to history
            const historyEntry = {
                id: generateUniqueId(),
                bookId: issuedBookEntry.bookId,
                bookTitle: issuedBookEntry.bookTitle,
                bookCatalogNumber: issuedBookEntry.bookCatalogNumber,
                userId: issuedBookEntry.userId,
                userName: issuedBookEntry.userName,
                type: 'return',
                date: new Date().toISOString(),
                librarianId: currentUserId,
                librarianName: currentUserName
            };
            await sendData('history', 'POST', historyEntry);
            showMessage('Book returned successfully!', 'success');
            await fetchIssuedBooks();
            renderIssuedBooks();
            await fetchBooks();
        } catch (e) {
            console.error("Error returning book: ", e);
            showMessage('Failed to return book. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- History Functions ---

function renderHistoryTable() {
    $historyTableBody.empty();
    if (history.length === 0) {
        $noHistoryMessage.removeClass('hidden');
        return;
    } else {
        $noHistoryMessage.addClass('hidden');
    }
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    sortedHistory.forEach(entry => {
        const row = $('<tr>');
        row.html(`
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${formatDate(entry.date)}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${entry.type === 'issue' ? 'Issued' : 'Returned'}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${entry.bookTitle}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${entry.userName} (${entry.userId})</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${entry.librarianName}</td>
        `);
        $historyTableBody.append(row);
    });
}

async function searchHistory() {
    const userId = $historyUserIdSearch.val().trim();
    if (userId) {
        showLoading();
        try {
            history = await fetchData(`history?userId=${userId}`);
            renderHistoryTable();
        } catch (e) {
            console.error("Error fetching history:", e);
            showMessage("Failed to fetch history.", "error");
        } finally {
            hideLoading();
        }
    } else {
        showMessage('Please enter a User ID to search history.', 'info');
    }
}

// --- User Management Functions ---

function renderUsers() {
    $customerUserList.empty();
    $usthadUsersContainer.empty();
    const customerUsers = users.filter(user => user.type === 'Customer');
    const usthadUsers = users.filter(user => user.type === 'Usthad');

    if (customerUsers.length === 0) {
        $noCustomerUsersMessage.removeClass('hidden');
    } else {
        $noCustomerUsersMessage.addClass('hidden');
        customerUsers.forEach(user => {
            const row = $('<tr>').addClass('hover:bg-gray-50 transition duration-150 ease-in-out');
            row.html(`
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${user.id}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${user.name}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${user.class}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-user-btn" data-id="${user.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-user-btn" data-id="${user.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </td>
            `);
            $customerUserList.append(row);
        });
    }

    if (usthadUsers.length === 0) {
        $noUsthadMessage.removeClass('hidden');
    } else {
        $noUsthadMessage.addClass('hidden');
        usthadUsers.forEach(user => {
            const card = $('<div>').addClass('bg-white p-5 rounded-lg shadow-md border border-gray-200');
            card.html(`
                <p class="text-lg font-semibold text-gray-800 mb-2 truncate">${user.name}</p>
                <p class="text-sm text-gray-600 mb-1">ID: ${user.id}</p>
                <button class="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out edit-user-btn" data-id="${user.id}">
                    <i class="fas fa-edit mr-2"></i> Edit
                </button>
                <button class="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150 ease-in-out delete-user-btn" data-id="${user.id}">
                    <i class="fas fa-trash-alt mr-2"></i> Delete
                </button>
            `);
            $usthadUsersContainer.append(card);
        });
    }

    $('.edit-user-btn').on('click', editUser);
    $('.delete-user-btn').on('click', deleteUser);
}

function populateUserClassSelect() {
    // This function can be kept as is since it populates a standard dropdown
}

function handleUserTypeChange() {
    if ($newUserTypeSelect.val() === 'Customer') {
        $newUserClassGroup.removeClass('hidden');
    } else {
        $newUserClassGroup.addClass('hidden');
    }
}

async function handleAddUserFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();
    const form = $(event.target);
    const userType = $newUserTypeSelect.val();
    const userData = {
        name: $newUserNameInput.val(),
        type: userType,
        id: $newUserIdInput.val()
    };
    if (userType === 'Customer') {
        userData.class = $newUserClassSelect.val();
    }
    try {
        if (editingUserId) {
            await sendData(`users/${editingUserId}`, 'PUT', userData);
            showMessage('User updated successfully!', 'success');
        } else {
            await sendData('users', 'POST', userData);
            showMessage('User added successfully!', 'success');
        }
        resetAddUserForm();
        await fetchUsers();
        renderUsers();
    } catch (e) {
        console.error("Error adding/updating user: ", e);
        showMessage('Failed to save user. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function resetAddUserForm() {
    editingUserId = null;
    $addUserForm.trigger('reset');
    $userFormTitle.text('Add New User');
    $userFormSubmitBtn.html('<i class="fas fa-user-plus mr-3"></i> Add User');
    $cancelUserEditBtn.addClass('hidden');
    $newUserClassGroup.addClass('hidden');
}

function editUser(event) {
    const userId = $(event.currentTarget).data('id');
    const user = users.find(u => u.id === userId);
    if (user) {
        editingUserId = userId;
        $userFormTitle.text('Edit User');
        $userFormSubmitBtn.html('<i class="fas fa-save mr-3"></i> Update User');
        $cancelUserEditBtn.removeClass('hidden');
        $newUserIdInput.val(user.id).prop('disabled', true);
        $newUserNameInput.val(user.name);
        $newUserTypeSelect.val(user.type).prop('disabled', true);
        if (user.type === 'Customer') {
            $newUserClassGroup.removeClass('hidden');
            $newUserClassSelect.val(user.class);
        } else {
            $newUserClassGroup.addClass('hidden');
        }
    }
}

async function deleteUser(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const userId = $(event.currentTarget).data('id');
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
        showMessage('User not found.', 'error');
        return;
    }
    const confirmed = await showConfirmationModal(
        'Delete User',
        `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.id})? This action cannot be undone.`
    );
    if (confirmed) {
        showLoading();
        try {
            await sendData(`users/${userId}`, 'DELETE');
            showMessage('User deleted successfully!', 'success');
            await fetchUsers();
            renderUsers();
        } catch (e) {
            console.error("Error deleting user: ", e);
            showMessage('Failed to delete user. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Librarian Management Functions ---

function renderLibrarians() {
    $librarianList.empty();
    if (librarians.length === 0) {
        $noLibrariansMessage.removeClass('hidden');
        return;
    } else {
        $noLibrariansMessage.addClass('hidden');
    }
    librarians.forEach(librarian => {
        const row = $('<tr>').addClass('hover:bg-gray-50 transition duration-150 ease-in-out');
        row.html(`
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${librarian.id}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${librarian.name}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${librarian.position}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-librarian-btn" data-id="${librarian.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-librarian-btn" data-id="${librarian.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `);
        $librarianList.append(row);
    });
    $('.edit-librarian-btn').on('click', editLibrarian);
    $('.delete-librarian-btn').on('click', deleteLibrarian);
}

function resetAddLibrarianForm() {
    editingLibrarianId = null;
    $addLibrarianForm.trigger('reset');
    $librarianFormTitle.text('Add New Librarian');
    $librarianFormSubmitBtn.html('<i class="fas fa-user-plus mr-3"></i> Add Librarian');
    $cancelLibrarianEditBtn.addClass('hidden');
    $('#new-librarian-id').val(generateUniqueId()).prop('disabled', false); // Enable ID field for new entry
}

async function handleAddLibrarianFormSubmit(event) {
    event.preventDefault();
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    showLoading();
    const form = $(event.target);
    const librarianData = {
        id: $('#new-librarian-id').val(),
        name: $newLibrarianNameInput.val(),
        position: $newLibrarianPositionInput.val()
    };
    try {
        if (editingLibrarianId) {
            await sendData(`librarians/${editingLibrarianId}`, 'PUT', librarianData);
            showMessage('Librarian updated successfully!', 'success');
        } else {
            await sendData('librarians', 'POST', librarianData);
            showMessage('Librarian added successfully!', 'success');
        }
        resetAddLibrarianForm();
        await fetchLibrarians();
        renderLibrarians();
    } catch (e) {
        console.error("Error adding/updating librarian: ", e);
        showMessage('Failed to save librarian. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function editLibrarian(event) {
    const librarianId = $(event.currentTarget).data('id');
    const librarian = librarians.find(l => l.id === librarianId);
    if (librarian) {
        editingLibrarianId = librarianId;
        $librarianFormTitle.text('Edit Librarian');
        $librarianFormSubmitBtn.html('<i class="fas fa-save mr-3"></i> Update Librarian');
        $cancelLibrarianEditBtn.removeClass('hidden');
        $('#new-librarian-id').val(librarian.id).prop('disabled', true);
        $newLibrarianNameInput.val(librarian.name);
        $newLibrarianPositionInput.val(librarian.position);
    }
}

async function deleteLibrarian(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('App not ready. Please try again after a moment.', 'error');
        return;
    }
    const librarianId = $(event.currentTarget).data('id');
    const librarianToDelete = librarians.find(l => l.id === librarianId);
    if (!librarianToDelete) {
        showMessage('Librarian not found.', 'error');
        return;
    }
    const confirmed = await showConfirmationModal(
        'Delete Librarian',
        `Are you sure you want to delete librarian "${librarianToDelete.name}"? This action cannot be undone.`
    );
    if (confirmed) {
        showLoading();
        try {
            await sendData(`librarians/${librarianId}`, 'DELETE');
            showMessage('Librarian deleted successfully!', 'success');
            await fetchLibrarians();
            renderLibrarians();
        } catch (e) {
            console.error("Error deleting librarian: ", e);
            showMessage('Failed to delete librarian. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Status Section Functions ---

function updateStatusSection() {
    $dbStatus.text('Connected via Node.js API');
    if (currentUserId) {
        $authStatus.text('Logged In');
    } else {
        $authStatus.text('Logged Out');
    }
    $loggedInUserIdStatus.text(currentUserId || 'N/A');
}

// --- Customer Section Functions ---

function renderCustomerBooks() {
    $customerBookList.empty();
    const filteredBooks = books.filter(book => {
        const searchTerm = $customerBookSearchInput.val().toLowerCase();
        const authorFilter = $customerAuthorFilter.val().toLowerCase();
        const yearFilter = $customerYearFilter.val();
        const categoryFilter = $customerCategoryFilter.val().toLowerCase();

        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        const authorMatch = book.author.toLowerCase().includes(searchTerm);
        const searchMatch = titleMatch || authorMatch;

        const authorFilterMatch = !authorFilter || (book.author && book.author.toLowerCase().includes(authorFilter));
        const yearFilterMatch = !yearFilter || (book.publishingYear && book.publishingYear === parseInt(yearFilter));
        const categoryFilterMatch = !categoryFilter || (book.category && book.category.toLowerCase() === categoryFilter);

        return searchMatch && authorFilterMatch && yearFilterMatch && categoryFilterMatch;
    });

    if (filteredBooks.length === 0) {
        $noCustomerBooksMessage.removeClass('hidden');
        return;
    } else {
        $noCustomerBooksMessage.addClass('hidden');
    }

    const booksByCategory = filteredBooks.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {});

    const sortedCategories = Object.keys(booksByCategory).sort();

    sortedCategories.forEach(category => {
        const categoryDiv = $('<div>').addClass('mb-8');
        categoryDiv.html(`
            <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">${category} Books</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            </div>
        `);
        $customerBookList.append(categoryDiv);
        const $cardContainer = categoryDiv.find('.grid');

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
                finalCoverSrc = `https://placehold.co/150x225/${coverColor.substring(1)}/${textColor}?text=${encodeURIComponent(book.title.substring(0, Math.min(book.title.length, 10)))}`;
            }

            const isAvailable = book.availableCopies > 0;
            const card = $('<div>').addClass('bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full');
            card.html(`
                <div class="relative">
                    <img src="${finalCoverSrc}" alt="Book Cover" class="w-full h-48 object-cover object-center transform transition-transform duration-300 hover:scale-105" onerror="this.onerror=null;this.src='https://placehold.co/150x225/cccccc/333333?text=N/A';">
                    <span class="absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
                        ${isAvailable ? 'Available' : 'Issued'}
                    </span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-1 leading-tight">${book.title}</h4>
                        <p class="text-sm text-gray-600">by ${book.author}</p>
                    </div>
                    <div class="mt-4">
                        <button class="w-full px-4 py-2 text-white font-semibold rounded-lg ${isAvailable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}" ${isAvailable ? '' : 'disabled'} data-id="${book.id}">
                            <i class="fas fa-hand-pointer mr-2"></i> Request Book
                        </button>
                    </div>
                </div>
            `);
            $cardContainer.append(card);
        });
    });

    $customerBookList.find('button').on('click', requestBookByCustomer);
}

function populateCustomerFilters() {
    const years = [...new Set(books.map(book => book.publishingYear).filter(year => year))].sort((a, b) => b - a);
    const categories = [...new Set(books.map(book => book.category).filter(category => category))].sort();

    const $yearSelect = $('#customerYearFilter');
    const $categorySelect = $('#customerCategoryFilter');

    $yearSelect.html('<option value="">All Years</option>');
    years.forEach(year => {
        $yearSelect.append($('<option>').val(year).text(year));
    });

    $categorySelect.html('<option value="">All Categories</option>');
    categories.forEach(category => {
        $categorySelect.append($('<option>').val(category).text(category));
    });
}

function updateCustomerNameDisplay() {
    if (currentUserName) {
        $currentCustomerNameDisplay.text(`Welcome, ${currentUserName}!`);
    } else {
        $currentCustomerNameDisplay.text('Welcome!');
    }
}

async function requestBookByCustomer(event) {
    if (!isAppReady || !currentUserId) {
        showMessage('Please log in to request a book.', 'error');
        return;
    }
    const bookId = $(event.currentTarget).data('id');
    const bookToRequest = books.find(b => b.id === bookId);
    if (!bookToRequest || bookToRequest.availableCopies <= 0) {
        showMessage('This book is not available for request at the moment.', 'error');
        return;
    }
    const confirmed = await showConfirmationModal(
        'Request Book',
        `Are you sure you want to request "${bookToRequest.title}"?`
    );
    if (confirmed) {
        showLoading();
        try {
            const requestData = {
                id: generateUniqueId(),
                bookId: bookToRequest.id,
                bookTitle: bookToRequest.title,
                customerId: currentUserId,
                customerName: currentUserName,
                requestDate: new Date().toISOString(),
                status: 'pending'
            };
            await sendData('customerrequests', 'POST', requestData);
            showMessage('Book request sent successfully! An admin will review it shortly.', 'success');
        } catch (e) {
            console.error("Error requesting book: ", e);
            showMessage('Failed to send book request. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }
}

// --- Combined Data Fetching and Initialization ---

async function fetchAllData() {
    const promises = [
        fetchBooks(),
        fetchUsers(),
        fetchLibrarians(),
        fetchIssuedBooks(),
        fetchHistory(),
        fetchCustomerRequests()
    ];
    await Promise.allSettled(promises);
}

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

// --- Event Listeners and Initial Setup ---
function bindEventListeners() {
    $navLinks.on('click', navigateToSection);
    $showAdminLoginBtn.on('click', () => $adminLoginForm.removeClass('hidden'));
    $showCustomerLoginBtn.on('click', () => {
        $customerSelectionArea.removeClass('hidden');
        renderCustomerSelectDropdown();
    });
    $cancelAdminLoginBtn.on('click', () => $adminLoginForm.addClass('hidden'));
    $cancelCustomerLoginBtn.on('click', () => $customerSelectionArea.addClass('hidden'));
    $adminLoginFormElement.on('submit', handleAdminLogin);
    $proceedAsCustomerBtn.on('click', handleCustomerLogin);
    $logoutBtn.on('click', logout);

    // Book Management
    $bookForm.on('submit', handleBookFormSubmit);
    $cancelBookEditBtn.on('click', resetBookForm);
    $applyAdminFiltersBtn.on('click', () => renderBooks($adminAuthorFilter.val(), $adminYearFilter.val(), $adminCategoryFilter.val()));
    $bookCoverUrlInput.on('input', () => {
        const url = $bookCoverUrlInput.val();
        if (isValidUrl(url)) {
            $bookCoverPreview.attr('src', url).removeClass('hidden');
        } else {
            $bookCoverPreview.addClass('hidden').attr('src', '');
        }
    });

    // Issue/Return
    $searchBookBtn.on('click', searchBookForIssue);
    $searchUserInIssueBtn.on('click', searchUserForIssue);
    $issueBookSubmitBtn.on('click', handleIssueBookSubmit);
    $issueLibrarianSelect.on('change', updateIssueFormDisplayAndButton);

    // History
    $searchHistoryBtn.on('click', searchHistory);

    // User Management
    $newUserTypeSelect.on('change', handleUserTypeChange);
    $addUserForm.on('submit', handleAddUserFormSubmit);
    $cancelUserEditBtn.on('click', resetAddUserForm);

    // Librarian Management
    $addLibrarianForm.on('submit', handleAddLibrarianFormSubmit);
    $cancelLibrarianEditBtn.on('click', resetAddLibrarianForm);

    // Customer Section
    $applyCustomerFiltersBtn.on('click', () => renderCustomerBooks());
    $customerBookSearchInput.on('input', () => renderCustomerBooks());
    $customerAuthorFilter.on('change', () => renderCustomerBooks());
    $customerYearFilter.on('change', () => renderCustomerBooks());
    $customerCategoryFilter.on('change', () => renderCustomerBooks());
}

async function initializeApp() {
    showLoading();
    try {
        await fetchAllData();
        renderUIBasedOnRole();
        populateAdminFilters();
        populateCustomerFilters();
        populateUserClassSelect();
        bindEventListeners();
        console.log("App initialization complete.");
        isAppReady = true;
        // Hide splash screen after all data is loaded and rendered
        $splashScreen.addClass('hidden');
    } catch (e) {
        console.error("Failed to initialize app:", e);
        showMessage("Initial data loading failed. Please check the backend connection and reload the page.", 'error');
    } finally {
        hideLoading();
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const userId = $('#admin-id').val().trim();
    const password = $('#admin-password').val().trim();
    const adminUser = users.find(u => u.id === userId && u.type === 'Admin');

    if (adminUser) {
        // Since we are not using a real authentication system, we'll just check for a valid ID and a non-empty password
        if (password) {
            currentUserId = adminUser.id;
            currentUserName = adminUser.name;
            currentUserType = adminUser.type;
            renderUIBasedOnRole();
            showMessage(`Welcome back, Admin ${currentUserName}!`, 'success');
        } else {
            showMessage('Please enter a password.', 'error');
        }
    } else {
        showMessage('Invalid Admin ID or password.', 'error');
    }
}

function renderCustomerSelectDropdown() {
    const customerUsers = users.filter(u => u.type === 'Customer' || u.type === 'Usthad');
    const $dropdown = $customerSelectDropdown;
    $dropdown.empty().append($('<option>').val('').text('-- Select Your Name --'));
    customerUsers.forEach(user => {
        $dropdown.append($('<option>').val(user.id).text(user.name));
    });
}

function handleCustomerLogin() {
    const userId = $customerSelectDropdown.val();
    if (!userId) {
        showMessage('Please select your name from the dropdown.', 'error');
        return;
    }
    const customerUser = users.find(u => u.id === userId);
    if (customerUser) {
        currentUserId = customerUser.id;
        currentUserName = customerUser.name;
        currentUserType = customerUser.type;
        renderUIBasedOnRole();
        showMessage(`Welcome, ${currentUserName}!`, 'success');
    } else {
        showMessage('Invalid selection. Please try again.', 'error');
    }
}

function logout() {
    currentUserId = null;
    currentUserName = null;
    currentUserType = null;
    isAppReady = false;
    // Re-initialize app to reset state and show login screen
    initializeApp();
    showMessage('You have been logged out.', 'info');
}

// Kick-off the application
$(document).ready(function() {
    initializeApp();
});
