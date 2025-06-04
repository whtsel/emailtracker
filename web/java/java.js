document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const tabFree = document.getElementById('tabFree');
    const tabPremium = document.getElementById('tabPremium');
    const freeSite = document.getElementById('freeSite');
    const premiumSite = document.getElementById('premiumSite');

    const baseEmailFreeInput = document.getElementById('baseEmailFree');
    const generateBtnFree = document.getElementById('generateBtnFree');
    const emailListFree = document.getElementById('emailListFree');
    const checkboxFree = document.getElementById('checkboxFree');
    const checkboxContainerFree = document.getElementById('checkboxContainerFree');
    const copyBtnFree = document.getElementById('copyBtnFree');
    const copyFeedbackFree = document.getElementById('copyFeedbackFree');

    const baseEmailPremiumInput = document.getElementById('baseEmailPremium');
    const generateBtnPremium = document.getElementById('generateBtnPremium');
    const emailListPremium = document.getElementById('emailListPremium');
    const checkboxPremium = document.getElementById('checkboxPremium');
    const checkboxContainerPremium = document.getElementById('checkboxContainerPremium');
    const copyBtnPremium = document.getElementById('copyBtnPremium');
    const copyFeedbackPremium = document.getElementById('copyFeedbackPremium');

    const youtubeLinkArea = document.getElementById('youtubeLinkArea');
    const youtubeLink = document.getElementById('youtubeLink');
    const passkeyInput = document.getElementById('passkeyInput');
    const passkeyOkBtn = document.getElementById('passkeyOkBtn');

    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorButtons = document.querySelectorAll('.close-button, #modalCloseBtn');

    const choiceModal = document.getElementById('choiceModal');
    const choiceYesBtn = document.getElementById('choiceYesBtn');
    const choiceNoBtn = document.getElementById('choiceNoBtn');

    // New Ad Carousel Modal elements
    const adCarouselModal = document.getElementById('adCarouselModal');
    const adDisplayArea = adCarouselModal.querySelector('.ad-display-area');
    const adCounterSpan = document.getElementById('adCounter');
    const closeAdCarouselBtn = document.getElementById('closeAdCarouselBtn');


    // Define constants for passkey and YouTube URL
    const CORRECT_PASSKEY = "5mr5ttv";
    const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Google"; // Placeholder YouTube channel
    const AD_DISPLAY_DURATION = 12 * 1000; // 12 seconds in milliseconds

    // State variables for Premium logic
    let youtubeLinkClickedTime = 0; // Timestamp when YouTube link was clicked
    let premiumGenerateClicked = false; // Flag if generate button was clicked in premium
    let userChoseYouTube = false; // Flag if user explicitly chose YouTube in the modal
    let currentAdIndex = 0;
    let adIntervalId = null;

    /**
     * Displays a custom modal with a given error message.
     * @param {string} message - The message to display in the modal.
     */
    function showModal(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex'; // Use flexbox for centering
    }

    /**
     * Hides the custom error modal.
     */
    function hideErrorModal() {
        errorModal.style.display = 'none';
    }

    /**
     * Displays the choice modal.
     */
    function showChoiceModal() {
        choiceModal.style.display = 'flex';
    }

    /**
     * Hides the choice modal.
     */
    function hideChoiceModal() {
        choiceModal.style.display = 'none';
    }

    /**
     * Displays the ad carousel modal.
     */
    function showAdCarouselModal() {
        adCarouselModal.style.display = 'flex';
        closeAdCarouselBtn.classList.add('hidden'); // Hide close button initially
    }

    /**
     * Hides the ad carousel modal and clears any running ad interval.
     */
    function hideAdCarouselModal() {
        adCarouselModal.style.display = 'none';
        if (adIntervalId) {
            clearInterval(adIntervalId);
            adIntervalId = null;
        }
        currentAdIndex = 0; // Reset ad index
        adDisplayArea.innerHTML = ''; // Clear ad content
    }

    // Add event listeners to all elements that should close the error modal
    closeErrorButtons.forEach(button => {
        button.addEventListener('click', hideErrorModal);
    });

    // Close modal if the user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === errorModal) {
            hideErrorModal();
        }
        if (event.target === choiceModal) {
            hideChoiceModal();
        }
        // Do NOT close adCarouselModal on outside click, it's timed.
    });

    // Close button for Ad Carousel Modal
    closeAdCarouselBtn.addEventListener('click', () => {
        hideAdCarouselModal();
    });


    /**
     * Switches the active site view (Free or Premium).
     * Updates tab button styles accordingly.
     * @param {string} siteToShow - 'free' or 'premium'.
     */
    function switchTab(siteToShow) {
        if (siteToShow === 'free') {
            freeSite.classList.remove('hidden');
            premiumSite.classList.add('hidden');
            tabFree.classList.add('active', 'bg-indigo-600', 'text-white');
            tabFree.classList.remove('bg-gray-200', 'text-gray-800');
            tabPremium.classList.remove('active', 'bg-indigo-600', 'text-white');
            tabPremium.classList.add('bg-gray-200', 'text-gray-800');
        } else {
            premiumSite.classList.remove('hidden');
            freeSite.classList.add('hidden');
            tabPremium.classList.add('active', 'bg-indigo-600', 'text-white');
            tabPremium.classList.remove('bg-gray-200', 'text-gray-800');
            tabFree.classList.remove('active', 'bg-indigo-600', 'text-gray-800');
            tabFree.classList.add('bg-gray-200', 'text-gray-800');
        }
        // Reset premium state when switching tabs
        youtubeLinkClickedTime = 0;
        premiumGenerateClicked = false;
        userChoseYouTube = false;
        youtubeLinkArea.classList.add('hidden');
        hideAdCarouselModal(); // Ensure ad modal is hidden
        passkeyInput.value = ''; // Clear passkey
        resetCheckboxes(); // Reset checkbox states
    }

    // Set the initial active tab to 'free' when the page loads
    switchTab('free');

    // Add event listeners for tab switching
    tabFree.addEventListener('click', () => switchTab('free'));
    tabPremium.addEventListener('click', () => switchTab('premium'));

    /**
     * Resets the visual state of both checkboxes.
     */
    function resetCheckboxes() {
        checkboxFree.classList.remove('green', 'bounce-animation');
        checkboxContainerFree.classList.remove('green-border');
        checkboxPremium.classList.remove('green', 'bounce-animation');
        checkboxContainerPremium.classList.remove('green-border');
    }

    /**
     * Activates the bounce animation and green fill for a given checkbox.
     * @param {HTMLElement} checkboxElement - The SVG checkbox element.
     * @param {HTMLElement} containerElement - The checkbox container element.
     */
    function activateCheckboxAnimation(checkboxElement, containerElement) {
        checkboxElement.classList.add('green');
        containerElement.classList.add('green-border');
        checkboxElement.classList.remove('bounce-animation'); // Remove to allow re-triggering
        void checkboxElement.offsetWidth; // Trigger reflow
        checkboxElement.classList.add('bounce-animation');
    }

    /**
     * Validates if a given string is a correctly formatted email address.
     * @param {string} email - The email string to validate.
     * @returns {boolean} True if the email is valid, false otherwise.
     */
    function isValidEmail(email) {
        // Basic regex for email validation (covers common formats)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Generates all unique dot variations for the username part of a Gmail address.
     * Gmail ignores periods in usernames, so 'a.b.c' is treated the same as 'abc'.
     * This function creates all possible permutations of dot placements.
     * For a username of length N, there are 2^(N-1) possible variations.
     * @param {string} username - The username part of the email (e.g., "selormbless").
     * @returns {Set<string>} A Set containing unique dot-variant usernames.
     */
    function generateDotVariations(username) {
        const variations = new Set();
        const n = username.length;

        // If the username is empty, return an empty set.
        if (n === 0) {
            return variations;
        }
        // If username has only one character, there are no places to insert dots.
        if (n === 1) {
            variations.add(username);
            return variations;
        }

        // Iterate through all possible bitmasks for dot placement.
        // A bitmask of length (n-1) determines whether a dot is placed after each character
        // (from the first character up to the second-to-last character).
        for (let i = 0; i < (1 << (n - 1)); i++) {
            let currentVariation = "";
            for (let j = 0; j < n; j++) {
                currentVariation += username[j];
                // If it's not the last character and the j-th bit in the mask is set, add a dot.
                if (j < n - 1 && (i & (1 << j))) {
                    currentVariation += ".";
                }
            }
            variations.add(currentVariation);
        }
        return variations;
    }

    /**
     * Generates a list of sub-email addresses based on dot variations for Gmail.
     * It extracts the username and domain, generates dot variations, and reconstructs emails.
     * It also ensures the base email is included and handles non-Gmail domains.
     * @param {string} baseEmail - The original email address (e.g., "selormbless81@gmail.com").
     * @param {number} [limit=Infinity] - Optional limit to the number of emails to generate.
     * @returns {string[]} An array of generated email addresses. Returns empty array on error.
     */
    function generateSubEmails(baseEmail, limit = Infinity) {
        if (!isValidEmail(baseEmail)) {
            showModal("Please enter a valid email address format (e.g., user@domain.com).");
            return [];
        }

        const parts = baseEmail.split('@');
        // Remove any existing dots from the username part before generating new variations
        const username = parts[0].replace(/\./g, '');
        const domain = parts[1];

        // This tool specifically leverages the Gmail dot trick
        if (domain.toLowerCase() !== 'gmail.com') {
            showModal("This email generation feature is specifically designed for Gmail addresses only (due to how Gmail handles periods).");
            return [];
        }

        const dotVariations = Array.from(generateDotVariations(username));
        const generatedEmails = dotVariations.map(variation => `${variation}@${domain}`);

        // Ensure the original email (without any extra dots if it had them) is always included
        const cleanedBaseEmail = `${username}@${domain}`;
        if (!generatedEmails.includes(cleanedBaseEmail)) {
             generatedEmails.unshift(cleanedBaseEmail);
        }

        // Return only the limited number of emails if a limit is provided (for the free version)
        return generatedEmails.slice(0, limit);
    }

    /**
     * Displays the next ad in the carousel.
     */
    function showNextAd() {
        // Clear previous ad content
        adDisplayArea.innerHTML = '';

        if (currentAdIndex < 15) {
            adCounterSpan.textContent = (currentAdIndex + 1);
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-item active-ad';
            adDiv.innerHTML = `<p>Ad ${currentAdIndex + 1} of 15</p>`; // Ad content
            adDisplayArea.appendChild(adDiv);
            currentAdIndex++;
        } else {
            // All ads displayed, stop interval
            if (adIntervalId) {
                clearInterval(adIntervalId);
                adIntervalId = null;
            }
            // Hide the modal after all ads are shown
            hideAdCarouselModal();
            // After ads, automatically proceed with passkey check
            passkeyOkBtn.click();
        }
    }

    /**
     * Initiates the display of 15 ads in a carousel.
     */
    function startAdCarousel() {
        showAdCarouselModal();
        currentAdIndex = 0; // Reset ad index
        showNextAd(); // Show the first ad

        // Set interval for subsequent ads
        adIntervalId = setInterval(showNextAd, AD_DISPLAY_DURATION);
    }


    /**
     * Copies the text content of a given email list to the clipboard.
     * @param {HTMLElement} emailListElement - The UL element containing the emails.
     * @param {HTMLElement} feedbackElement - The span element for "Copied!" feedback.
     */
    function copyEmailsToClipboard(emailListElement, feedbackElement) {
        const emails = Array.from(emailListElement.children).map(li => li.textContent).join('\n');
        if (emails.length === 0) {
            showModal("No emails to copy.");
            return;
        }

        // Create a temporary textarea to copy text from
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = emails;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            feedbackElement.classList.add('show');
            setTimeout(() => {
                feedbackElement.classList.remove('show');
            }, 1500); // Hide "Copied!" after 1.5 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showModal('Failed to copy emails to clipboard. Please try manually.');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    }


    // --- Free Site Logic ---
    generateBtnFree.addEventListener('click', () => {
        const baseEmail = baseEmailFreeInput.value.trim();
        emailListFree.innerHTML = ''; // Clear previous results
        resetCheckboxes(); // Reset checkbox before attempting generation

        if (!baseEmail) {
            showModal("Please enter a base email to generate sub-emails for the Free Version.");
            return;
        }

        // Simulate ad display by disabling button and showing a message
        generateBtnFree.textContent = "Loading Ads...";
        generateBtnFree.disabled = true;

        // After a short delay (simulating ad loading), generate and display emails
        setTimeout(() => {
            const emails = generateSubEmails(baseEmail, 20); // Limit to 20 for free version
            if (emails.length > 0) {
                emails.forEach(email => {
                    const li = document.createElement('li');
                    li.textContent = email;
                    emailListFree.appendChild(li);
                });
                activateCheckboxAnimation(checkboxFree, checkboxContainerFree); // Activate animation on success
            } else {
                const li = document.createElement('li');
                li.textContent = "No emails generated. Please check your input and ensure it's a valid Gmail address.";
                emailListFree.appendChild(li);
            }
            generateBtnFree.textContent = "Generate Emails"; // Reset button text
            generateBtnFree.disabled = false; // Re-enable button
        }, 1500); // 1.5 second delay to simulate ad loading
    });

    // Copy button for Free Version
    copyBtnFree.addEventListener('click', () => {
        copyEmailsToClipboard(emailListFree, copyFeedbackFree);
    });


    // --- Premium Site Logic ---
    generateBtnPremium.addEventListener('click', () => {
        const baseEmail = baseEmailPremiumInput.value.trim();
        emailListPremium.innerHTML = ''; // Clear previous results
        hideAdCarouselModal(); // Ensure ad modal is hidden
        resetCheckboxes(); // Reset checkbox before attempting generation

        if (!baseEmail) {
            showModal("Please enter a base email to generate sub-emails for the Premium Version.");
            return;
        }

        // Display the YouTube link area
        youtubeLinkArea.classList.remove('hidden');
        premiumGenerateClicked = true; // Set flag
        youtubeLinkClickedTime = 0; // Reset YouTube click time
        userChoseYouTube = false; // Reset user choice
    });

    // Copy button for Premium Version
    copyBtnPremium.addEventListener('click', () => {
        copyEmailsToClipboard(emailListPremium, copyFeedbackPremium);
    });

    // Track YouTube link click time
    youtubeLink.addEventListener('click', () => {
        youtubeLinkClickedTime = Date.now();
        userChoseYouTube = true; // User explicitly chose YouTube
    });

    // Passkey validation and email generation for Premium site
    passkeyOkBtn.addEventListener('click', () => {
        const baseEmail = baseEmailPremiumInput.value.trim();
        const enteredPasskey = passkeyInput.value.trim();
        emailListPremium.innerHTML = ''; // Clear previous results
        youtubeLinkArea.classList.add('hidden'); // Hide YouTube link area after passkey attempt
        hideAdCarouselModal(); // Ensure ad modal is hidden
        resetCheckboxes(); // Reset checkbox before attempting generation

        if (!baseEmail) {
            showModal("Please enter a base email first in the Premium Version.");
            return;
        }

        // Ensure "Generate All Emails" was clicked first
        if (!premiumGenerateClicked) {
            showModal("Please click 'Generate All Emails' first to proceed.");
            return;
        }

        // Original logic for YouTube link/passkey flow
        const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
        const timeElapsed = Date.now() - youtubeLinkClickedTime;

        let shouldShowChoiceModal = false;

        if (!userChoseYouTube) {
            // Case 1: User has NOT clicked the YouTube link at all
            shouldShowChoiceModal = true;
        } else if (timeElapsed < threeMinutes) {
            // Case 2: User HAS clicked the YouTube link, but not for 3 minutes or more
            shouldShowChoiceModal = true;
        }

        if (shouldShowChoiceModal) {
            showChoiceModal();
        } else {
            // Proceed with passkey check
            if (enteredPasskey === CORRECT_PASSKEY) {
                const emails = generateSubEmails(baseEmail);
                if (emails.length > 0) {
                    emails.forEach(email => {
                        const li = document.createElement('li');
                        li.textContent = email;
                        emailListPremium.appendChild(li);
                    });
                    activateCheckboxAnimation(checkboxPremium, checkboxContainerPremium);
                } else {
                    const li = document.createElement('li');
                    li.textContent = "No emails generated. Please check your input and ensure it's a valid Gmail address.";
                    emailListPremium.appendChild(li);
                }
                passkeyInput.value = '';
            } else {
                showModal("Incorrect Passkey! Please try again. ❗");
                passkeyInput.value = '';
            }
        }
    });

    // Event listeners for the choice modal buttons
    choiceYesBtn.addEventListener('click', () => {
        hideChoiceModal();
        window.open(YOUTUBE_CHANNEL_URL, '_blank'); // Open YouTube channel
        userChoseYouTube = true; // Mark that user chose YouTube
        // Optionally, if you want to immediately generate emails after choosing YouTube:
        // passkeyOkBtn.click(); // This would re-trigger the passkey logic, now with userChoseYouTube true
    });

    choiceNoBtn.addEventListener('click', () => {
        hideChoiceModal();
        startAdCarousel(); // Start the ad carousel instead of displaying grid ads
        userChoseYouTube = false; // Mark that user chose ads
    });
});
