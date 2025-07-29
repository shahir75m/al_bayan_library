  
        // Firebase imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        // Firebase Storage imports
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";


        // Global Firebase variables
        let app;
        let db;
        let auth;
        let storage; // Added Firebase Storage instance
        let userId; // This is the Firebase UID of the currently authenticated user
        let userRole = null; // 'Admin', 'Customer', or null initially
        let isAuthReady = false;

        // Global app and firebase config variables
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');


        // Global data arrays (for client-side caching and rendering)
        let books = [];
        let users = []; // Includes all users (Admin, Usthad, Customer) - NOW FETCHED FROM PUBLIC COLLECTION
        let librarians = [];
        let issuedBooks = [];
        let history = [];
        let customerRequests = [];

        // Currently selected items for editing/issuing
        let editingBookId = null;
        let editingUserId = null;
        let editingLibrarianId = null;
        let selectedBookForIssue = null;
        let selectedUserForIssue = null;
        let currentCustomerName = ''; // To store the name entered by the customer

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
            const messageBox = document.getElementById('messageBox');
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
            document.getElementById('loadingOverlay').classList.remove('hidden');
        }

        /**
         * Hides the loading overlay.
         */
        function hideLoading() {
            document.getElementById('loadingOverlay').classList.add('hidden');
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

        // --- Section Navigation and Role-based UI ---

        /**
         * Renders UI elements based on the user's role.
         */
        function renderUIBasedOnRole() {
            console.log("renderUIBasedOnRole called. Current userRole:", userRole, "Current userId:", userId);
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


            if (userRole === 'Admin') {
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
            } else if (userRole === 'Customer') {
                console.log("Rendering UI for Customer.");
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
            if (userId && userRole) {
                document.getElementById('currentLoggedInUserIdDisplay').textContent = `Current User: ${userId} (${userRole})`;
            }
        }

        /**
         * Handles navigation between different sections of the application.
         * @param {Event} event - The click event.
         */
        function navigateToSection(event) {
            console.log("navigateToSection called. Target:", event.currentTarget.dataset.section);
            // Prevent navigation if Firebase is not ready
            if (!isAuthReady || !db || !userId) {
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
            if (targetSectionId === 'dashboard-section') {
                updateDashboardCounts();
                renderCustomerRequests();
            } else if (targetSectionId === 'catalog-section') {
                // Reset filters when navigating to catalog section
                document.getElementById('adminAuthorFilter').value = '';
                document.getElementById('adminYearFilter').value = '';
                document.getElementById('adminCategoryFilter').value = '';
                renderBooks();
            } else if (targetSectionId === 'issue-section') {
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
                        console.warn('Pre-fill data for issue form not found. Data might be out of sync.');
                    }
                    // Clear temporary variables after use
                    tempPrefillBookId = null;
                    tempPrefillUserId = null;
                }
            } else if (targetSectionId === 'history-section') {
                renderHistoryTable();
            } else if (targetSectionId === 'user-management-section') {
                renderUsers();
                populateUserClassSelect();
                resetAddUserForm();
            } else if (targetSectionId === 'librarian-section') {
                renderLibrarians();
                resetAddLibrarianForm();
            } else if (targetSectionId === 'status-section') {
                updateStatusSection();
            } else if (targetSectionId === 'customer-section') {
                // Reset filters when navigating to customer section
                document.getElementById('customerBookSearchInput').value = '';
                document.getElementById('customerAuthorFilter').value = '';
                document.getElementById('customerYearFilter').value = '';
                document.getElementById('customerCategoryFilter').value = '';
                renderCustomerBooks();
                updateCustomerNameDisplay();
            }
        }

        // --- Dashboard Functions ---

        /**
         * Updates the counts on the dashboard.
         */
        function updateDashboardCounts() {
            document.getElementById('totalBooksCount').textContent = books.length;
            document.getElementById('issuedBooksCount').textContent = issuedBooks.length;
            document.getElementById('totalUsersCount').textContent = users.length;
            document.getElementById('totalLibrariansCount').textContent = librarians.length;
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
                    <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out mark-request-handled-btn" data-id="${request.id}">
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
                return;
            }
            const requestId = event.currentTarget.dataset.id;
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
                    const requestRef = doc(db, `artifacts/${appId}/public/data/customerRequests`, requestId);
                    await updateDoc(requestRef, { status: 'handled', handledDate: new Date().toISOString() });
                    // Removed showMessage('Request marked as handled successfully!', 'success'); // Removed as per request

                    // Store IDs in temporary globals for pre-filling the issue form
                    tempPrefillBookId = requestToHandle.bookId;
                    tempPrefillUserId = requestToHandle.customerId;

                    // Navigate to the Issue/Return section
                    const issueReturnNavLink = document.querySelector('.nav-link[data-section="issue-section"]');
                    if (issueReturnNavLink) {
                        issueReturnNavLink.click(); // Simulate click to navigate
                    }
                    // Removed showMessage('Request marked as handled. Navigating to Issue/Return form to complete issue.', 'info'); // Removed as per request

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
            if (selectedBookForIssue && selectedUserForIssue && selectedBookForIssue.availableCopies > 0) {
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
            if (!db || !userId || !isAuthReady || !storage) { // Added storage check
                showMessage('Database or Storage not ready. Please try again after a moment.', 'error');
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
                bookCoverUrl: form.bookCoverUrl.value.trim() // Will be updated if file is uploaded
            };

            const bookCoverFile = form.bookCoverFile.files[0]; // Get the selected file

            try {
                if (bookCoverFile) {
                    // Upload file to Firebase Storage
                    const fileExtension = bookCoverFile.name.split('.').pop();
                    const fileName = `${generateUniqueId()}.${fileExtension}`;
                    const storageRef = ref(storage, `artifacts/${appId}/users/${userId}/bookCovers/${fileName}`);
                    const uploadResult = await uploadBytes(storageRef, bookCoverFile);
                    bookData.bookCoverUrl = await getDownloadURL(uploadResult.ref);
                    showMessage('Book cover uploaded successfully!', 'success');
                } else if (bookData.bookCoverUrl && !isValidUrl(bookData.bookCoverUrl)) {
                    // If a URL is provided but it's invalid, clear it.
                    // Or, you might want to show an error and prevent submission.
                    bookData.bookCoverUrl = '';
                    showMessage('Invalid Book Cover URL provided. Using default placeholder.', 'info');
                }

                if (editingBookId) {
                    // Update existing book
                    const bookRef = doc(db, `artifacts/${appId}/users/${userId}/books`, editingBookId);
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

                    await updateDoc(bookRef, bookData);
                    showMessage('Book updated successfully!', 'success');
                } else {
                    // Add new book
                    bookData.id = generateUniqueId(); // Generate unique ID for new book
                    bookData.availableCopies = bookData.totalCopies; // Initially all copies are available
                    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/books`, bookData.id), bookData);
                    showMessage('Book added successfully!', 'success');
                }
                form.reset();
                resetBookForm();
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
            const bookCoverFile = document.getElementById('bookCoverFile');

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
                bookCoverFile.value = ''; // Clear file input when editing

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
            document.getElementById('bookCoverFile').value = ''; // Clear file input
        }

        /**
         * Deletes a book after confirmation.
         * @param {Event} event - The click event from the delete button.
         */
        async function deleteBook(event) {
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
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
                    await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/books`, bookId));
                    showMessage('Book deleted successfully!', 'success');
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
                        <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out return-book-btn" data-id="${issue.id}">
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
        function searchBookForIssue() {
            const catalogNumber = document.getElementById('catalogNumberSearch').value.trim();
            
            selectedBookForIssue = null; // Reset selected book

            if (!catalogNumber) {
                updateIssueFormDisplayAndButton(); // Update display to clear book info
                showMessage('Please enter a catalog number to search.', 'info');
                return;
            }

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
            updateIssueFormDisplayAndButton(); // Update display based on new selectedBookForIssue
        }

        /**
         * Searches for a user by ID for issuing.
         */
        function searchUserForIssue() {
            const userIdSearch = document.getElementById('issueUserIdSearch').value.trim();
            
            selectedUserForIssue = null; // Reset selected user

            if (!userIdSearch) {
                updateIssueFormDisplayAndButton(); // Update display to clear user info
                showMessage('Please enter a User ID to search.', 'info');
                return;
            }

            const user = users.find(u => u.id === userIdSearch);

            if (user) {
                selectedUserForIssue = user;
                showMessage(`User "${user.name}" found.`, 'success');
            } else {
                showMessage('User not found with this ID.', 'error');
            }
            updateIssueFormDisplayAndButton(); // Update display based on new selectedUserForIssue
        }

        /**
         * Handles the submission of the issue book form.
         * @param {Event} event - The form submission event.
         */
        async function handleIssueBookSubmit(event) {
            event.preventDefault();
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
                return;
            }
            showLoading();

            const librarianId = document.getElementById('issueLibrarianSelect').value;

            if (!selectedBookForIssue || !selectedUserForIssue || !librarianId) {
                showMessage('Please select a book, a user, and a librarian to issue.', 'error');
                hideLoading();
                return;
            }

            const issueData = {
                id: generateUniqueId(),
                bookId: selectedBookForIssue.id,
                userId: selectedUserForIssue.id,
                librarianId: librarianId,
                issueDate: new Date().toISOString(),
                returnDate: null, // Null until returned
            };

            try {
                // Add to issued books collection
                await setDoc(doc(db, `artifacts/${appId}/users/${userId}/issuedBooks`, issueData.id), issueData);

                // Update book's available copies
                const bookRef = doc(db, `artifacts/${appId}/users/${userId}/books`, selectedBookForIssue.id);
                await updateDoc(bookRef, {
                    availableCopies: selectedBookForIssue.availableCopies - 1
                });

                // Add to history
                const historyEntry = {
                    id: generateUniqueId(),
                    bookId: selectedBookForIssue.id,
                    bookTitle: selectedBookForIssue.title,
                    userId: selectedUserForIssue.id,
                    userName: selectedUserForIssue.name,
                    librarianId: librarianId,
                    librarianName: librarians.find(l => l.id === librarianId)?.name || 'Unknown',
                    issueDate: issueData.issueDate,
                    returnDate: null,
                    type: 'issue',
                };
                await setDoc(doc(db, `artifacts/${appId}/users/${userId}/history`, historyEntry.id), historyEntry);

                showMessage(`"${selectedBookForIssue.title}" issued to ${selectedUserForIssue.name} successfully!`, 'success');
                resetIssueBookForm();
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
                return;
            }
            const issueId = event.currentTarget.dataset.id;
            const issueToReturn = issuedBooks.find(issue => issue.id === issueId);

            if (!issueToReturn) {
                showMessage('Issued book record not found.', 'error');
                return;
            }

            const book = books.find(b => b.id === issueToReturn.bookId);
            const user = users.find(u => u.id === issueToReturn.userId);

            if (!book || !user) {
                showMessage('Associated book or user not found. Cannot return.', 'error');
                return;
            }

            const confirmed = await showConfirmationModal(
                'Return Book',
                `Are you sure you want to return "${book.title}" from ${user.name}?`
            );

            if (confirmed) {
                showLoading();
                try {
                    // Delete from issued books collection
                    await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/issuedBooks`, issueId));

                    // Update book's available copies
                    const bookRef = doc(db, `artifacts/${appId}/users/${userId}/books`, book.id);
                    await updateDoc(bookRef, {
                        availableCopies: book.availableCopies + 1
                    });

                    // Update history entry with return date
                    const historyRef = doc(db, `artifacts/${appId}/users/${userId}/history`, issueToReturn.id);
                    await updateDoc(historyRef, {
                        returnDate: new Date().toISOString(),
                        type: 'return', // Mark as returned
                    });

                    showMessage(`"${book.title}" returned by ${user.name} successfully!`, 'success');
                } catch (e) {
                    console.error("Error returning book: ", e);
                    showMessage('Failed to return book. Please try again.', 'error');
                } finally {
                    hideLoading();
                }
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
        function searchHistory() {
            const userIdToSearch = document.getElementById('historyUserIdSearch').value.trim();
            renderHistoryTable(userIdToSearch);
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
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
                // IMPORTANT: All user data (Admin, Customer, Usthad) is now stored in the public collection.
                const userRef = doc(db, `artifacts/${appId}/public/data/users`, userData.id);

                if (editingUserId) {
                    // Update existing user
                    await updateDoc(userRef, userData);
                    showMessage('User updated successfully!', 'success');
                } else {
                    // Check for duplicate ID if provided
                    const existingUserDoc = await getDoc(userRef);
                    if (existingUserDoc.exists()) {
                        showMessage('User ID already exists. Please use a different ID or leave it empty for auto-generation.', 'error');
                        hideLoading();
                        return;
                    }
                    // Add new user
                    await setDoc(userRef, userData);
                    showMessage('User added successfully!', 'success');
                }
                form.reset();
                resetAddUserForm();
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
                    document.getElementById('newUserClass').value = user.class || ''; // Set existing class or empty
                } else {
                    document.getElementById('newUserClassGroup').classList.add('hidden');
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
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
                    // IMPORTANT: Delete from the public users collection
                    await deleteDoc(doc(db, `artifacts/${appId}/public/data/users`, userIdToDelete));
                    showMessage('User deleted successfully!', 'success');
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
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
                    const librarianRef = doc(db, `artifacts/${appId}/users/${userId}/librarians`, editingLibrarianId);
                    await updateDoc(librarianRef, librarianData);
                    showMessage('Librarian updated successfully!', 'success');
                } else {
                    // Add new librarian
                    librarianData.id = generateUniqueId();
                    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/librarians`, librarianData.id), librarianData);
                    showMessage('Librarian added successfully!', 'success');
                }
                form.reset();
                resetAddLibrarianForm();
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
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
                return;
            }
            const librarianIdToDelete = event.currentTarget.dataset.id;
            const librarianToDelete = librarians.find(l => l.id === librarianIdToDelete);

            if (!librarianToDelete) {
                showMessage('Librarian not found.', 'error');
                return;
            }

            // Check if librarian has any issued books
            const hasIssuedBooks = issuedBooks.some(issue => issue.librarianId === librarianIdToDelete);
            if (hasIssuedBooks) {
                showMessage('Cannot delete librarian: This librarian has issued books.', 'error');
                return;
            }

            const confirmed = await showConfirmationModal(
                'Delete Librarian',
                `Are you sure you want to delete librarian "${librarianToDelete.name}"? This action cannot be undone.`
            );

            if (confirmed) {
                showLoading();
                try {
                    await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/librarians`, librarianIdToDelete));
                    showMessage('Librarian deleted successfully!', 'success');
                } catch (e) {
                    console.error("Error deleting librarian: ", e);
                    showMessage('Failed to delete librarian. Please try again.', 'error');
                } finally {
                    hideLoading();
                }
            }
        }

        // --- Status Section Functions ---

        /**
         * Updates the system status display.
         */
        function updateStatusSection() {
            document.getElementById('dbStatus').textContent = db ? 'Connected' : 'Disconnected';
            document.getElementById('dbStatus').className = db ? 'text-green-600' : 'text-red-600';

            document.getElementById('authStatus').textContent = auth.currentUser ? 'Authenticated' : 'Not Authenticated';
            document.getElementById('authStatus').className = auth.currentUser ? 'text-green-600' : 'text-red-600';

            document.getElementById('loggedInUserIdStatus').textContent = userId || 'Not available';
            document.getElementById('currentLoggedInUserIdDisplay').textContent = `Current User: ${userId || 'Not Authenticated'} (${userRole || 'Not Logged In'})`;
        }

        // --- Customer Specific Functions ---

        /**
         * Populates the customer select dropdown with users of type 'Customer'.
         * @param {Array} filteredCustomerUsers - Optional array of filtered customer users to display.
         */
        function populateCustomerSelectDropdown(filteredCustomerUsers = null) {
            console.log("populateCustomerSelectDropdown called. Users available:", users.length);
            const select = document.getElementById('customerSelectDropdown');
            select.innerHTML = '<option value="">-- Select Customer --</option>'; // Clear existing options

            const customersToDisplay = filteredCustomerUsers || users.filter(u => u.type === 'Customer');
            console.log("Customers to display:", customersToDisplay);

            customersToDisplay.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.id})`;
                select.appendChild(option);
            });

            // If only one customer is found, auto-select it
            if (customersToDisplay.length === 1) {
                select.value = customersToDisplay[0].id;
                document.getElementById('proceedAsCustomerBtn').disabled = false;
                console.log("Auto-selected single customer:", customersToDisplay[0].name);
            } else {
                document.getElementById('proceedAsCustomerBtn').disabled = !select.value;
            }
        }

        /**
         * Searches for a customer in the dropdown based on name or ID.
         */
        function searchCustomerDropdown() {
            console.log("searchCustomerDropdown called.");
            const searchTerm = document.getElementById('customerSearchInput').value.trim().toLowerCase();
            const customerUsers = users.filter(u => u.type === 'Customer');

            if (!searchTerm) {
                populateCustomerSelectDropdown(); // Reset to show all customers
                showMessage('Showing all customers.', 'info');
                return;
            }

            const filtered = customerUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.id.toLowerCase().includes(searchTerm)
            );

            populateCustomerSelectDropdown(filtered);

            if (filtered.length === 0) {
                showMessage('No matching customers found.', 'info');
            } else if (filtered.length === 1) {
                showMessage(`Found and selected "${filtered[0].name}".`, 'success');
            } else {
                showMessage(`Found ${filtered.length} matching customers. Please select from the dropdown.`, 'info');
            }
        }
        
        /**
         * Updates the displayed customer name on the customer page.
         */
        function updateCustomerNameDisplay() {
            console.log("updateCustomerNameDisplay called. currentCustomerName:", currentCustomerName);
            const customerNameSpan = document.getElementById('currentCustomerNameDisplay');
            if (userRole === 'Customer' && currentCustomerName) {
                customerNameSpan.textContent = currentCustomerName;
            } else {
                customerNameSpan.textContent = 'Customer'; // Default if name not found or not customer
            }
        }

        /**
         * Renders books for the customer view, including search and notify button, with filters.
         * @param {string} searchTerm - Optional search term (title, ISBN, catalog number).
         * @param {string} authorFilter - Filter by author (case-insensitive, partial match).
         * @param {number} yearFilter - Filter by publishing year.
         * @param {string} categoryFilter - Filter by category.
         */
        function renderCustomerBooks(searchTerm = '', authorFilter = '', yearFilter = '', categoryFilter = '') {
            console.log("renderCustomerBooks called with filters:", { searchTerm, authorFilter, yearFilter, categoryFilter });
            const customerBookListDiv = document.getElementById('customerBookList');
            customerBookListDiv.innerHTML = '';
            const noCustomerBooksMessage = document.getElementById('noCustomerBooksMessage');

            let filteredBooks = [...books]; // Start with a copy of all books

            // Apply search term (title, ISBN, catalog number)
            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                filteredBooks = filteredBooks.filter(book =>
                    (book.title && book.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (book.isbn && book.isbn.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (book.catalogNumber && book.catalogNumber.toLowerCase().includes(lowerCaseSearchTerm))
                );
            }

            // Apply author filter
            if (authorFilter) {
                const lowerCaseAuthorFilter = authorFilter.toLowerCase();
                filteredBooks = filteredBooks.filter(book =>
                    book.author && book.author.toLowerCase().includes(lowerCaseAuthorFilter)
                );
            }

            // Apply year filter
            if (yearFilter) {
                filteredBooks = filteredBooks.filter(book =>
                    book.publishingYear && book.publishingYear === parseInt(yearFilter)
                );
            }

            // Apply category filter
            if (categoryFilter) {
                const lowerCaseCategoryFilter = categoryFilter.toLowerCase();
                filteredBooks = filteredBooks.filter(book =>
                    book.category && book.category.toLowerCase() === lowerCaseCategoryFilter
                );
            }

            console.log("Filtered books count:", filteredBooks.length);

            if (filteredBooks.length === 0) {
                noCustomerBooksMessage.classList.remove('hidden');
                return;
            } else {
                noCustomerBooksMessage.classList.add('hidden');
            }

            // Group books by category for customer view
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
                const categorySection = document.createElement('div');
                categorySection.className = 'mb-8';
                categorySection.innerHTML = `
                    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">${category}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="customerBookGrid-${category.replace(/\s+/g, '-')}" >
                        <!-- Books will be inserted here -->
                    </div>
                `;
                customerBookListDiv.appendChild(categorySection);

                const bookGrid = document.getElementById(`customerBookGrid-${category.replace(/\s+/g, '-')}`);
                const sortedBooksInThisCategory = booksByCategory[category].sort((a, b) => a.title.localeCompare(b.title));

                sortedBooksInThisCategory.forEach(book => {
                    const issuedRecord = issuedBooks.find(issue => issue.bookId === book.id);
                    const borrower = issuedRecord ? users.find(u => u.id === issuedRecord.userId) : null;
                    
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
                        <img src="${finalCoverSrc}" alt="Book Cover" class="w-24 h-36 object-cover rounded-md mb-3 shadow-sm" onerror="this.onerror=null;this.src='https://placehold.co/100x150/cccccc/333333?text=N/A';">
                        <p class="text-lg font-semibold text-gray-800 mb-1 truncate w-full">${book.title}</p>
                        <p class="text-sm text-gray-600 mb-1">by ${book.author}</p>
                        <p class="text-sm text-gray-600 mb-3">Available: ${book.availableCopies}/${book.totalCopies}</p>
                        ${book.availableCopies > 0 ?
                            `<button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out notify-admin-btn" data-book-id="${book.id}" data-book-title="${book.title}">
                                <i class="fas fa-bell mr-2"></i> Notify Admin
                            </button>` :
                            `<p class="text-red-500 text-sm font-medium">Not Available</p>
                             ${borrower ? `<p class="text-xs text-gray-500 mt-1">Issued to: ${borrower.name}</p>` : ''}
                            `
                        }
                    `;
                    bookGrid.appendChild(card);
                });
            });

            document.querySelectorAll('.notify-admin-btn').forEach(button => {
                button.addEventListener('click', notifyAdminForBook);
            });
        }

        /**
         * Populates the year and category filter dropdowns for the customer catalog.
         */
        function populateCustomerFilters() {
            console.log("populateCustomerFilters called.");
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
         * Handles the "Notify Admin" button click from the customer view.
         * @param {Event} event - The click event.
         */
        async function notifyAdminForBook(event) {
            if (!db || !userId || !isAuthReady) { // Added isAuthReady check
                showMessage('Database not ready. Please try again after a moment.', 'error');
                return;
            }
            if (!currentCustomerName) {
                showMessage('Your name is not set. Please log out and log in again, or contact an administrator.', 'error');
                return;
            }

            const bookId = event.currentTarget.dataset.bookId;
            const bookTitle = event.currentTarget.dataset.bookTitle;

            const confirmed = await showConfirmationModal(
                'Notify Admin',
                `Are you sure you want to notify the admin that you need "${bookTitle}"?`
            );

            if (confirmed) {
                showLoading();
                try {
                    const requestData = {
                        id: generateUniqueId(),
                        bookId: bookId,
                        bookTitle: bookTitle,
                        customerId: userId, // Firebase UID of the customer
                        customerName: currentCustomerName, // Name entered by the customer
                        requestDate: new Date().toISOString(),
                        status: 'pending', // 'pending', 'handled'
                    };
                    // Store in a public collection for admin to see
                    await setDoc(doc(db, `artifacts/${appId}/public/data/customerRequests`, requestData.id), requestData);
                    showMessage(`Your request for "${bookTitle}" has been sent to the admin!`, 'success');
                } catch (e) {
                    console.error("Error notifying admin: ", e);
                    showMessage('Failed to send request. Please try again.', 'error');
                } finally {
                    hideLoading();
                }
            }
        }


        // --- Firebase Initialization and Listeners ---

        /**
         * Initializes Firebase and sets up real-time listeners.
         */
        async function initializeFirebaseAndListeners() {
            console.log("initializeFirebaseAndListeners called.");
            const splashScreen = document.getElementById('splashScreen');
            splashScreen.classList.remove('fade-out'); // Ensure splash screen is visible

            try {
                app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);
                storage = getStorage(app); // Initialize Firebase Storage

                // Authenticate user anonymously first
                if (typeof __initial_auth_token !== 'undefined') {
                    console.log("Signing in with custom token...");
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    console.log("Signing in anonymously...");
                    await signInAnonymously(auth);
                }

                // Listen for auth state changes
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        userId = user.uid;
                        isAuthReady = true;
                        console.log("Firebase Auth Ready. User ID:", userId);

                        // Fetch all users (from the public collection)
                        // This listener needs to be outside the role-check to always fetch all users
                        onSnapshot(collection(db, `artifacts/${appId}/public/data/users`), (snapshot) => {
                            users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            console.log("Users updated:", users);
                            // Only populate dropdown if customer selection is active
                            if (!document.getElementById('customer-selection-area').classList.contains('hidden')) {
                                populateCustomerSelectDropdown();
                            }
                            // Re-render other sections if data changes
                            if (document.getElementById('user-management-section').classList.contains('active')) {
                                renderUsers();
                            }
                            if (document.getElementById('issue-section').classList.contains('active')) {
                                // Re-run search functions to update display if data changes
                                if (document.getElementById('catalogNumberSearch').value.trim() || document.getElementById('issueUserIdSearch').value.trim()) {
                                    const book = books.find(b => b.catalogNumber === document.getElementById('catalogNumberSearch').value.trim());
                                    const user = users.find(u => u.id === document.getElementById('issueUserIdSearch').value.trim());
                                    selectedBookForIssue = book;
                                    selectedUserForIssue = user;
                                    updateIssueFormDisplayAndButton();
                                }
                                renderIssuedBooks();
                            }
                            if (document.getElementById('customer-section').classList.contains('active')) {
                                // Update currentCustomerName when users array updates
                                // Find the user in the *public* users array matching the *current Firebase UID*
                                const currentUserData = users.find(u => u.id === userId);
                                if (currentUserData && currentUserData.type === 'Customer') {
                                    currentCustomerName = currentUserData.name;
                                    updateCustomerNameDisplay();
                                }
                                // Re-render customer books with current filters
                                const currentSearchTerm = document.getElementById('customerBookSearchInput').value.trim();
                                const currentAuthorFilter = document.getElementById('customerAuthorFilter').value.trim();
                                const currentYearFilter = document.getElementById('customerYearFilter').value;
                                const currentCategoryFilter = document.getElementById('customerCategoryFilter').value;
                                renderCustomerBooks(currentSearchTerm, currentAuthorFilter, currentYearFilter, currentCategoryFilter);
                            }
                            updateDashboardCounts();
                        }, (error) => {
                            console.error("Error fetching users:", error);
                            showMessage('Error fetching users.', 'error');
                        });


                        // Now, check if this Firebase user already has a role assigned in Firestore (from the public collection)
                        const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
                        const userDocSnap = await getDoc(userDocRef);

                        if (userDocSnap.exists()) {
                            userRole = userDocSnap.data().type; // Get existing role
                            console.log("User document exists in public collection. User role set to:", userRole);
                            // If the user is a customer, set their name from the fetched user data
                            if (userRole === 'Customer') {
                                currentCustomerName = userDocSnap.data().name || '';
                                console.log("Customer name set to:", currentCustomerName);
                            }
                        } else {
                            // If user document doesn't exist in public collection, it means this is a new anonymous user.
                            // We don't assign a role immediately here. The user will choose via the login screen.
                            userRole = null; // Ensure role is null until explicitly chosen
                            console.log("User document does not exist in public collection. User role set to null.");
                        }
                        
                        updateStatusSection();
                        setupFirestoreListeners(); // Setup Firestore listeners only after auth and (potential) role are ready
                        renderUIBasedOnRole(); // Render UI based on determined role or show login options
                        
                        // Fade out splash screen after everything is loaded and rendered
                        splashScreen.classList.add('fade-out');
                        setTimeout(() => {
                            splashScreen.style.display = 'none';
                        }, 500); // Match CSS transition duration
                    } else {
                        userId = null;
                        userRole = null; // Reset role
                        isAuthReady = false;
                        currentCustomerName = ''; // Clear customer name on logout
                        console.log("Firebase Auth Not Ready. User signed out or not authenticated.");
                        updateStatusSection();
                        // Clear data if user logs out
                        books = [];
                        users = [];
                        librarians = [];
                        issuedBooks = [];
                        history = [];
                        customerRequests = [];
                        renderBooks();
                        renderUsers();
                        renderLibrarians();
                        renderIssuedBooks();
                        renderHistoryTable();
                        renderCustomerBooks();
                        renderCustomerRequests();
                        updateDashboardCounts();
                        renderUIBasedOnRole(); // Re-render UI to show logged out state
                        
                        // Ensure splash screen fades out even on logout/initial non-auth
                        splashScreen.classList.add('fade-out');
                        setTimeout(() => {
                            splashScreen.style.display = 'none';
                        }, 500); // Match CSS transition duration
                    }
                });

                showMessage('Firebase initialized.', 'info');
            } catch (e) {
                console.error("Error initializing Firebase: ", e);
                showMessage('Failed to initialize Firebase. Check console for details.', 'error');
                
                // Ensure splash screen fades out on error too
                splashScreen.classList.add('fade-out');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500); // Match CSS transition duration
            } finally {
                hideLoading(); // Hide the *regular* loading overlay if it was shown
            }
        }

        /**
         * Sets up real-time Firestore listeners for all collections.
         */
        function setupFirestoreListeners() {
            console.log("setupFirestoreListeners called. isAuthReady:", isAuthReady, "userId:", userId);
            if (!isAuthReady || !userId) {
                console.warn("Firestore listeners not set up: Auth not ready or userId is null.");
                return;
            }

            // Books Listener (Admin's private books)
            onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/books`), (snapshot) => {
                books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Books updated:", books);
                
                // Populate filter dropdowns whenever books data changes
                populateAdminFilters();
                populateCustomerFilters();

                if (document.getElementById('catalog-section').classList.contains('active')) {
                    // Re-render admin catalog with current filters
                    const currentAuthorFilter = document.getElementById('adminAuthorFilter').value.trim();
                    const currentYearFilter = document.getElementById('adminYearFilter').value;
                    const currentCategoryFilter = document.getElementById('adminCategoryFilter').value;
                    renderBooks(currentAuthorFilter, currentYearFilter, currentCategoryFilter);
                }
                if (document.getElementById('issue-section').classList.contains('active')) {
                    // Re-run search functions to update display if data changes
                    if (document.getElementById('catalogNumberSearch').value.trim() || document.getElementById('issueUserIdSearch').value.trim()) {
                        const book = books.find(b => b.catalogNumber === document.getElementById('catalogNumberSearch').value.trim());
                        const user = users.find(u => u.id === document.getElementById('issueUserIdSearch').value.trim());
                        selectedBookForIssue = book;
                        selectedUserForIssue = user;
                        updateIssueFormDisplayAndButton();
                    }
                    renderIssuedBooks();
                }
                if (document.getElementById('customer-section').classList.contains('active')) {
                    // Re-render customer books with current filters
                    const currentSearchTerm = document.getElementById('customerBookSearchInput').value.trim();
                    const currentAuthorFilter = document.getElementById('customerAuthorFilter').value.trim();
                    const currentYearFilter = document.getElementById('customerYearFilter').value;
                    const currentCategoryFilter = document.getElementById('customerCategoryFilter').value;
                    renderCustomerBooks(currentSearchTerm, currentAuthorFilter, currentYearFilter, currentCategoryFilter);
                }
                updateDashboardCounts();
            }, (error) => {
                console.error("Error fetching books:", error);
                showMessage('Error fetching books.', 'error');
            });

            // Librarians Listener (Admin's private librarians)
            onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/librarians`), (snapshot) => {
                librarians = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Librarians updated:", librarians);
                if (document.getElementById('librarian-section').classList.contains('active')) {
                    renderLibrarians();
                }
                updateDashboardCounts();
                populateLibrarianSelect();
                if (document.getElementById('issue-section').classList.contains('active')) {
                    renderIssuedBooks();
                }
            }, (error) => {
                console.error("Error fetching librarians:", error);
                showMessage('Error fetching librarians.', 'error');
            });

            // Issued Books Listener (Admin's private issued books)
            onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/issuedBooks`), (snapshot) => {
                issuedBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Issued books updated:", issuedBooks);
                if (document.getElementById('issue-section').classList.contains('active')) {
                    renderIssuedBooks();
                }
                if (document.getElementById('customer-section').classList.contains('active')) {
                    // Re-render customer books with current filters
                    const currentSearchTerm = document.getElementById('customerBookSearchInput').value.trim();
                    const currentAuthorFilter = document.getElementById('customerAuthorFilter').value.trim();
                    const currentYearFilter = document.getElementById('customerYearFilter').value;
                    const currentCategoryFilter = document.getElementById('customerCategoryFilter').value;
                    renderCustomerBooks(currentSearchTerm, currentAuthorFilter, currentYearFilter, currentCategoryFilter);
                }
                updateDashboardCounts();
            }, (error) => {
                console.error("Error fetching issued books:", error);
                showMessage('Error fetching issued books.', 'error');
            });

            // History Listener (Admin's private history)
            onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/history`), (snapshot) => {
                history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("History updated:", history);
                if (document.getElementById('history-section').classList.contains('active')) {
                    renderHistoryTable();
                }
            }, (error) => {
                console.error("Error fetching history:", error);
                showMessage('Error fetching history.', 'error');
            });

            // Customer Requests Listener (Public collection)
            onSnapshot(collection(db, `artifacts/${appId}/public/data/customerRequests`), (snapshot) => {
                customerRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Customer requests updated:", customerRequests);
                if (document.getElementById('dashboard-section').classList.contains('active') && userRole === 'Admin') {
                    renderCustomerRequests();
                }
            }, (error) => {
                console.error("Error fetching customer requests:", error);
                showMessage('Error fetching customer requests.', 'error');
            });
        }

        // --- Login Page Functions ---
        function showLoginOptions() {
            console.log("showLoginOptions called.");
            document.querySelectorAll('.section-content').forEach(section => section.classList.remove('active'));
            document.getElementById('login-section').classList.add('active');
            
            document.getElementById('admin-login-form').classList.add('hidden');
            document.getElementById('customer-selection-area').classList.add('hidden');
            document.getElementById('showAdminLoginBtn').classList.remove('hidden');
            document.getElementById('showCustomerLoginBtn').classList.remove('hidden');

            // Hide all nav links until logged in
            document.querySelectorAll('.nav-link').forEach(link => link.classList.add('hidden'));
            document.getElementById('logoutBtn').classList.add('hidden'); // Ensure logout is hidden
            document.getElementById('currentLoggedInUserIdDisplay').textContent = `Current User: Please Log In`;
        }

        function showAdminLoginForm() {
            console.log("showAdminLoginForm called.");
            document.getElementById('showAdminLoginBtn').classList.add('hidden');
            document.getElementById('showCustomerLoginBtn').classList.add('hidden');
            document.getElementById('admin-login-form').classList.remove('hidden');
            document.getElementById('adminLoginForm').reset(); // Clear form fields
        }

        async function handleAdminLogin(event) {
            event.preventDefault();
            console.log("handleAdminLogin called.");
            showLoading();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            // Hardcoded admin credentials for demonstration
            if (username === 'admin' && password === 'password123') {
                userRole = 'Admin';
                showMessage('Admin login successful!', 'success');
                console.log("Admin login successful. Calling renderUIBasedOnRole.");
                renderUIBasedOnRole(); // This will navigate to dashboard
            } else {
                showMessage('Invalid admin credentials.', 'error');
                console.log("Admin login failed.");
            }
            hideLoading();
        }

        function showCustomerSelection() {
            console.log("showCustomerSelection called.");
            document.getElementById('showAdminLoginBtn').classList.add('hidden');
            document.getElementById('showCustomerLoginBtn').classList.add('hidden');
            document.getElementById('customer-selection-area').classList.remove('hidden');
            document.getElementById('customerSelectDropdown').value = ''; // Reset dropdown
            document.getElementById('proceedAsCustomerBtn').disabled = true; // Disable button
            populateCustomerSelectDropdown(); // Populate with current customer users
        }

        async function handleCustomerProceed(event) {
            event.preventDefault();
            console.log("handleCustomerProceed called.");
            showLoading();
            const selectedCustomerId = document.getElementById('customerSelectDropdown').value;
            console.log("Selected Customer ID:", selectedCustomerId);

            if (!selectedCustomerId) {
                showMessage('Please select a customer.', 'error');
                hideLoading();
                console.log("No customer selected.");
                return;
            }

            // Ensure users array is populated before finding a user
            if (users.length === 0) {
                showMessage('User data is still loading. Please wait a moment.', 'info');
                hideLoading();
                console.log("Users array is empty. Cannot proceed.");
                return;
            }

            const selectedUser = users.find(u => u.id === selectedCustomerId);
            console.log("Found selected user:", selectedUser);

            if (selectedUser && selectedUser.type === 'Customer') {
                // When a customer logs in, their Firebase UID becomes the `userId`.
                // We need to ensure that the `currentCustomerName` is set based on the `selectedUser` from the public `users` array.
                // The `userId` (Firebase UID) will be used for private collections, but `currentCustomerName` comes from the selected public user.
                userRole = 'Customer';
                currentCustomerName = selectedUser.name; // Set the customer's name
                showMessage(`Logged in as Customer: ${currentCustomerName}`, 'success');
                console.log("Customer login successful. Calling renderUIBasedOnRole.");
                renderUIBasedOnRole(); // This will navigate to customer page
            } else {
                showMessage('Invalid customer selection.', 'error');
                console.log("Invalid customer selection.");
            }
            hideLoading();
        }

        /**
         * Handles the logout action.
         */
        async function handleLogout() {
            console.log("handleLogout called.");
            const confirmed = await showConfirmationModal(
                'Logout',
                'Are you sure you want to log out?'
            );

            if (confirmed) {
                showLoading();
                try {
                    // Sign out from Firebase Auth (if using persistent auth)
                    // For anonymous auth, simply resetting state and UI is enough
                    // await auth.signOut(); // Uncomment if using persistent Firebase Auth methods

                    userId = null;
                    userRole = null;
                    isAuthReady = false;
                    currentCustomerName = ''; // Clear customer name on logout
                    
                    // Clear local data
                    books = [];
                    users = [];
                    librarians = [];
                    issuedBooks = [];
                    history = [];
                    customerRequests = [];

                    showMessage('Logged out successfully!', 'info');
                    console.log("Logged out. Calling renderUIBasedOnRole.");
                    renderUIBasedOnRole(); // Revert to login screen
                } catch (e) {
                    console.error("Error during logout: ", e);
                    showMessage('Failed to log out. Please try again.', 'error');
                } finally {
                    hideLoading();
                }
            }
        }


        // --- Event Listeners ---
        window.onload = initializeFirebaseAndListeners;

        document.addEventListener('DOMContentLoaded', () => {
            // Login page buttons
            document.getElementById('showAdminLoginBtn').addEventListener('click', showAdminLoginForm);
            document.getElementById('showCustomerLoginBtn').addEventListener('click', showCustomerSelection);
            document.getElementById('cancelAdminLoginBtn').addEventListener('click', showLoginOptions);
            document.getElementById('cancelCustomerLoginBtn').addEventListener('click', showLoginOptions);

            // Login form submissions
            document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
            document.getElementById('customerSelectionForm').addEventListener('submit', handleCustomerProceed);
            document.getElementById('searchCustomerDropdownBtn').addEventListener('click', searchCustomerDropdown); // New search button listener
            document.getElementById('customerSelectDropdown').addEventListener('change', (event) => {
                document.getElementById('proceedAsCustomerBtn').disabled = !event.target.value;
            });


            // Logout button
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);

            // Navigation links (these will be hidden/shown by renderUIBasedOnRole)
            document.querySelectorAll('.nav-link').forEach(button => {
                button.addEventListener('click', navigateToSection);
            });

            // Book Form
            document.getElementById('bookForm').addEventListener('submit', handleBookFormSubmit);
            document.getElementById('cancelBookEditBtn').addEventListener('click', resetBookForm);
            // Live preview for book cover URL and File
            document.getElementById('bookCoverUrl').addEventListener('input', (event) => {
                const url = event.target.value.trim();
                const preview = document.getElementById('bookCoverPreview');
                if (url && isValidUrl(url)) {
                    preview.src = url;
                    preview.classList.remove('hidden');
                    document.getElementById('bookCoverFile').value = ''; // Clear file input if URL is entered
                } else {
                    // Only hide if file input is also empty
                    if (!document.getElementById('bookCoverFile').files[0]) {
                        preview.src = '';
                        preview.classList.add('hidden');
                    }
                }
            });
            document.getElementById('bookCoverFile').addEventListener('change', (event) => {
                const file = event.target.files[0];
                const preview = document.getElementById('bookCoverPreview');
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                    document.getElementById('bookCoverUrl').value = ''; // Clear URL input if file is selected
                } else {
                    // Only hide if URL input is also empty
                    if (!document.getElementById('bookCoverUrl').value.trim()) {
                        preview.src = '';
                        preview.classList.add('hidden');
                    }
                }
            });

            // Admin Catalog Filters
            document.getElementById('applyAdminFiltersBtn').addEventListener('click', () => {
                const authorFilter = document.getElementById('adminAuthorFilter').value.trim();
                const yearFilter = document.getElementById('adminYearFilter').value;
                const categoryFilter = document.getElementById('adminCategoryFilter').value;
                renderBooks(authorFilter, yearFilter, categoryFilter);
            });
            // Optional: Add event listeners for 'change' on selects and 'input' on text for live filtering
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

            // History Section
            document.getElementById('searchHistoryBtn').addEventListener('click', searchHistory);

            // User Management Form
            document.getElementById('addUserForm').addEventListener('submit', handleAddUserFormSubmit);
            document.getElementById('cancelUserEditBtn').addEventListener('click', resetAddUserForm);
            // Toggle class input based on user type
            document.getElementById('newUserType').addEventListener('change', (event) => {
                if (event.target.value === 'Customer') { // Class is relevant for Customer type
                    document.getElementById('newUserClassGroup').classList.remove('hidden');
                    // No 'required' attribute here, as class is optional for customers
                } else {
                    document.getElementById('newUserClassGroup').classList.add('hidden');
                    document.getElementById('newUserClass').value = ''; // Clear value if not customer
                }
            });

            // Librarian Form
            document.getElementById('addLibrarianForm').addEventListener('submit', handleAddLibrarianFormSubmit);
            document.getElementById('cancelLibrarianEditBtn').addEventListener('click', resetAddLibrarianForm);

            // Customer Section Filters
            document.getElementById('applyCustomerFiltersBtn').addEventListener('click', () => {
                const searchTerm = document.getElementById('customerBookSearchInput').value.trim();
                const authorFilter = document.getElementById('customerAuthorFilter').value.trim();
                const yearFilter = document.getElementById('customerYearFilter').value;
                const categoryFilter = document.getElementById('customerCategoryFilter').value;
                renderCustomerBooks(searchTerm, authorFilter, yearFilter, categoryFilter);
            });
            // Optional: Add event listeners for 'change' on selects and 'input' on text for live filtering
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
        });
