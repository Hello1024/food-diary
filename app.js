// Food Diary App - Enhanced Interactive Version
class FoodDiaryApp {
    constructor() {
        this.entries = this.loadEntries();
        this.currentEditId = null;
        this.achievements = this.loadAchievements();
        this.stats = this.calculateStats();
        this.quotes = [
            "Chaque repas est une nouvelle opportunité de prendre soin de soi 🌟",
            "Écoutez votre corps, il vous guide vers ce dont vous avez besoin 💚",
            "La gratitude transforme un repas ordinaire en festin 🙏",
            "Mangez avec intention, savourez avec attention 🧘‍♀️",
            "Votre bien-être commence dans votre assiette ✨",
            "Chaque bouchée est un acte d'amour envers vous-même 💕",
            "L'équilibre n'est pas la perfection, c'est l'harmonie 🌈",
            "Votre voyage vers le bien-être est unique et précieux 🦋",
            "Célébrez chaque petit progrès, ils comptent énormément 🎉",
            "Vous méritez de vous nourrir avec bienveillance 🌸"
        ];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        // Google Sheets API configuration
        this.DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
        this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
        this.foo='7QVlGm1-2ueoGFo';
        this.API_KEY = 'AIzaSyBaQSsExrlKu6dMHXq_'+this.foo;
        this.CLIENT_ID = '417455950863-3tssvb2vtv0sr8u6ib4r793kri4nuj5v.apps.googleusercontent.com';
        this.gapi = null;
        this.isGoogleApiInitialized = false;
        this.isAuthorized = false;
        this.tokenClient = null;
        this.accessToken = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.setupIntensitySliders();
        this.setupInteractiveFeatures();
        this.renderHistory();
        this.setDefaultDate();
        this.updateDailyGoals();
        this.refreshQuote();
        this.applyTheme();
        this.checkAchievements();
        this.initializeGoogleAPI();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('meal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeal();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Export buttons
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('export-excel').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Daily export button
        document.getElementById('export-daily').addEventListener('click', () => {
            const selectedDate = document.getElementById('daily-export-date').value;
            this.exportDailyFormat(selectedDate);
        });

        // Google Sheets export button
        document.getElementById('export-google-sheets').addEventListener('click', () => {
            this.exportToGoogleSheets();
        });

        // Google authentication buttons
        document.getElementById('authorize-google').addEventListener('click', () => {
            this.handleAuthClick();
        });

        document.getElementById('signout-google').addEventListener('click', () => {
            this.handleSignoutClick();
        });

        // Clear history
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        // Form reset
        document.querySelector('button[type="reset"]').addEventListener('click', () => {
            this.resetForm();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Shake to clear (mobile)
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                this.handleShake(e);
            });
        }

        // FAB click
        document.getElementById('quick-add-fab').addEventListener('click', () => {
            this.quickAddMeal();
        });
    }

    setupTabs() {
        // Initialize tabs
        this.switchTab('entry');
    }

    setupIntensitySliders() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const valueSpan = slider.nextElementSibling;
            
            // Update value display
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = value;
            });
            
            // Initialize display
            const value = parseInt(slider.value);
            valueSpan.textContent = value;
        });
    }

    setupInteractiveFeatures() {
        // Setup mood bubbles
        document.querySelectorAll('.mood-bubble').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                this.selectMoodBubble(e.target);
            });
        });

        // Setup star ratings
        this.setupStarRatings();

        // Setup photo upload
        const photoInput = document.getElementById('meal-photo');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }
    }

    setupStarRatings() {
        document.querySelectorAll('.star-rating').forEach(rating => {
            const stars = rating.querySelectorAll('.star');
            
            stars.forEach((star, index) => {
                // Remove any existing listeners
                star.replaceWith(star.cloneNode(true));
            });
            
            // Re-query after cloning
            const freshStars = rating.querySelectorAll('.star');
            
            freshStars.forEach((star, index) => {
                star.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.setStarRating(rating, index + 1);
                });

                star.addEventListener('mouseenter', (e) => {
                    this.highlightStars(rating, index + 1);
                });
                
                star.addEventListener('mouseleave', (e) => {
                    this.resetStarHighlight(rating);
                });
            });

            rating.addEventListener('mouseleave', () => {
                this.resetStarHighlight(rating);
            });
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (!dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Refresh content based on tab
        switch(tabName) {
            case 'entry':
                // Re-setup interactive features when switching to entry tab
                setTimeout(() => {
                    this.setupStarRatings();
                    this.setupInteractiveFeatures();
                }, 100);
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'stats':
                this.renderStats();
                break;
            case 'achievements':
                this.renderAchievements();
                break;
        }
    }

    saveMeal() {
        const formData = new FormData(document.getElementById('meal-form'));
        const entry = {
            id: this.currentEditId || Date.now(),
            timestamp: new Date().toISOString(),
            ...Object.fromEntries(formData.entries())
        };

        // Add intensity values
        entry.intensityBeforeText = entry.thoughtsBefore ? `${entry.thoughtsBefore} (Intensité: ${entry.intensityBefore}/10)` : '';
        entry.intensityDuringText = entry.thoughtsDuring ? `${entry.thoughtsDuring} (Intensité: ${entry.intensityDuring}/10)` : '';
        entry.intensityAfterText = entry.thoughtsAfter ? `${entry.thoughtsAfter} (Intensité: ${entry.intensityAfter}/10)` : '';
        entry.intensityPhysicalText = entry.physicalSensations ? `${entry.physicalSensations} (Intensité: ${entry.intensityPhysical}/10)` : '';
        entry.intensityBingeText = entry.bingeEpisode ? `${entry.bingeEpisode} (Intensité: ${entry.intensityBinge}/10)` : '';

        if (this.currentEditId) {
            // Update existing entry
            const index = this.entries.findIndex(e => e.id === this.currentEditId);
            if (index !== -1) {
                this.entries[index] = entry;
                this.showNotification('Repas modifié avec succès!', 'success');
            }
            this.currentEditId = null;
        } else {
            // Add new entry
            this.entries.unshift(entry);
            this.showNotification('Repas enregistré avec succès!', 'success');
        }

        this.saveEntries();
        this.resetForm();
        this.renderHistory();
        this.updateDailyGoals();
        this.checkAchievements();
        
        // Update stats if on stats tab
        if (document.getElementById('stats-tab').classList.contains('active')) {
            this.renderStats();
        }
        
        // Update achievements if on achievements tab
        if (document.getElementById('achievements-tab').classList.contains('active')) {
            this.renderAchievements();
        }
    }

    editMeal(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;

        this.currentEditId = id;
        
        // Reset form first
        this.resetForm();
        
        // Populate form with entry data
        const form = document.getElementById('meal-form');
        
        for (const [key, value] of Object.entries(entry)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && value !== undefined && value !== null && value !== '') {
                field.value = value;
                
                // Update slider displays
                if (field.type === 'range') {
                    const valueSpan = field.nextElementSibling;
                    if (valueSpan && valueSpan.classList.contains('intensity-value')) {
                        valueSpan.textContent = value;
                    }
                }
            }
        }

        // Handle star ratings
        if (entry.tasteRating) {
            const tasteStars = document.querySelectorAll('[data-rating="taste"] .star');
            tasteStars.forEach((star, index) => {
                if (index < parseInt(entry.tasteRating)) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
            document.getElementById('taste-rating-value').value = entry.tasteRating;
        }

        if (entry.satisfactionRating) {
            const satisfactionStars = document.querySelectorAll('[data-rating="satisfaction"] .star');
            satisfactionStars.forEach((star, index) => {
                if (index < parseInt(entry.satisfactionRating)) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
            document.getElementById('satisfaction-rating-value').value = entry.satisfactionRating;
        }

        // Handle mood bubbles - reset all first, then set selected ones
        document.querySelectorAll('.mood-bubble').forEach(bubble => {
            bubble.classList.remove('selected');
        });

        // Set selected mood bubbles based on entry data
        this.setMoodBubbleFromText(entry.thoughtsBefore, 'thoughts-before');
        this.setMoodBubbleFromText(entry.thoughtsDuring, 'thoughts-during');
        this.setMoodBubbleFromText(entry.thoughtsAfter, 'thoughts-after');
        this.setMoodBubbleFromText(entry.physicalSensations, 'physical-sensations');

        // Handle photo if it exists
        if (entry.mealPhoto) {
            const photoPreview = document.getElementById('photo-preview');
            const previewImage = document.getElementById('preview-image');
            const photoPlaceholder = document.querySelector('.photo-placeholder');
            
            if (photoPreview && previewImage && photoPlaceholder) {
                previewImage.src = entry.mealPhoto;
                photoPreview.style.display = 'block';
                photoPlaceholder.style.display = 'none';
            }
        }

        // Update submit button text
        const submitButton = document.querySelector('#meal-form button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '✏️ Modifier le repas';
        }

        // Switch to entry tab
        this.switchTab('entry');
        this.showNotification('Modification du repas en cours... Modifiez les champs et cliquez sur "Modifier le repas"', 'info');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setMoodBubbleFromText(text, fieldName) {
        if (!text) return;
        
        // Find mood bubbles for this field
        const moodBubblesContainer = document.querySelector(`[data-for="${fieldName}"]`);
        if (!moodBubblesContainer) return;
        
        const moodBubbles = moodBubblesContainer.querySelectorAll('.mood-bubble');
        
        // Simple text matching - look for mood keywords in the text
        const moodKeywords = {
            'anxious': ['anxieux', 'angoissé', 'inquiet'],
            'excited': ['excité', 'enthousiaste', 'impatient'],
            'neutral': ['neutre', 'normal', 'ordinaire'],
            'hungry': ['affamé', 'faim', 'fringale'],
            'stressed': ['stressé', 'tendu', 'nerveux'],
            'happy': ['heureux', 'content', 'joyeux'],
            'enjoying': ['savoureux', 'délicieux', 'bon'],
            'rushed': ['pressé', 'rapide', 'hâte'],
            'distracted': ['distrait', 'inattentif'],
            'social': ['social', 'convivial', 'compagnie'],
            'mindful': ['attentif', 'conscient', 'présent'],
            'guilty': ['coupable', 'honte', 'regret'],
            'satisfied': ['satisfait', 'rassasié', 'comblé'],
            'regretful': ['regret', 'déçu', 'remords'],
            'bloated': ['ballonné', 'gonflé', 'lourd'],
            'energized': ['énergisé', 'dynamique', 'vivifié'],
            'peaceful': ['paisible', 'calme', 'serein'],
            'sleepy': ['somnolent', 'endormi', 'fatigué'],
            'comfortable': ['confortable', 'bien', 'à l\'aise'],
            'full': ['plein', 'rassasié', 'repu'],
            'nauseous': ['nauséeux', 'écœuré', 'mal'],
            'light': ['léger', 'allégé'],
            'heavy': ['lourd', 'pesant'],
            'refreshed': ['rafraîchi', 'revigoré', 'restauré']
        };
        
        const textLower = text.toLowerCase();
        
        moodBubbles.forEach(bubble => {
            const moodType = bubble.dataset.mood;
            const keywords = moodKeywords[moodType];
            
            if (keywords && keywords.some(keyword => textLower.includes(keyword))) {
                bubble.classList.add('selected');
                if (bubble.dataset.color) {
                    bubble.style.backgroundColor = bubble.dataset.color;
                }
            }
        });
    }

    deleteMeal(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
            this.entries = this.entries.filter(e => e.id !== id);
            this.saveEntries();
            this.renderHistory();
            this.showNotification('Repas supprimé.', 'success');
        }
    }

    resetForm() {
        document.getElementById('meal-form').reset();
        this.currentEditId = null;
        this.setDefaultDate();
        
        // Reset slider displays
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const valueSpan = slider.nextElementSibling;
            if (valueSpan) {
                valueSpan.textContent = slider.value;
            }
        });
        
        // Reset star ratings
        document.querySelectorAll('.star-rating').forEach(rating => {
            const stars = rating.querySelectorAll('.star');
            stars.forEach(star => {
                star.classList.remove('active');
                star.style.filter = 'grayscale(100%)';
                star.style.opacity = '0.5';
                star.style.transform = 'scale(1)';
            });
            rating.removeAttribute('data-current-rating');
        });
        
        // Reset hidden inputs
        document.getElementById('taste-rating-value').value = '';
        document.getElementById('satisfaction-rating-value').value = '';
        
        // Reset mood bubbles
        document.querySelectorAll('.mood-bubble').forEach(bubble => {
            bubble.classList.remove('selected');
            bubble.style.backgroundColor = '';
        });
        
        // Reset photo
        this.removePhoto();

        // Reset submit button text
        const submitButton = document.querySelector('#meal-form button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '💾 Enregistrer le repas';
        }
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.entries.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <span class="emoji">🍽️</span>
                    <h3>Aucun repas enregistré</h3>
                    <p>Commencez par enregistrer votre premier repas dans l'onglet "Nouveau Repas".</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.entries.map(entry => {
            const date = new Date(entry.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-item-title">
                            ${entry.name} - ${entry.mealPeriod || 'Non spécifié'}
                        </div>
                        <div class="history-item-date">${date}</div>
                    </div>
                    <div class="history-item-content">
                        <strong>Lieu:</strong> ${entry.location || 'Non spécifié'}<br>
                        <strong>Composition:</strong> ${entry.mealComposition ? entry.mealComposition.substring(0, 100) + (entry.mealComposition.length > 100 ? '...' : '') : 'Non spécifié'}
                    </div>
                    <div class="history-item-actions">
                        <button class="btn-small edit" onclick="app.editMeal(${entry.id})">
                            ✏️ Modifier
                        </button>
                        <button class="btn-small delete" onclick="app.deleteMeal(${entry.id})">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        if (confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ? Cette action est irréversible.')) {
            this.entries = [];
            this.saveEntries();
            this.renderHistory();
            this.showNotification('Historique vidé.', 'success');
        }
    }

    exportToCSV() {
        if (this.entries.length === 0) {
            this.showNotification('Aucune donnée à exporter.', 'error');
            return;
        }

        const headers = [
            'Nom',
            'Matin',
            'Matinée', 
            'Midi',
            'Après-Midi',
            'Soir',
            'Date',
            'Heure et durée du repas',
            'Lieu',
            'Seul(e) ou en compagnie ? Avec qui ?',
            'Qui a préparé le repas ?',
            'Activités pendant le repas (en regardant un film, en discutant, …)',
            'Composition de votre repas (n\'oubliez pas les liquides ).',
            'Avez-vous fini votre repas ?',
            'Quelles sont vos pensées avant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Quelles sont vos pensées pendant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Quelles sont vos pensées après le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Décrivez vos sensations physiques après le repas. Précisez l\'intensité sur une échelle de 1 à 10.',
            'Avez-vous vomi, pris des laxatifs ou des diurétiques ?',
            'At/ou eu un accès de boulimique ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Avez-vous fait de l\'exercice ? Si oui lequel et combien de temps.',
            'Autres remarques.'
        ];

        const csvData = this.entries.map(entry => {
            const row = [
                entry.name || '',
                entry.mealPeriod === 'Matin' ? 'X' : '',
                entry.mealPeriod === 'Matinée' ? 'X' : '',
                entry.mealPeriod === 'Midi' ? 'X' : '',
                entry.mealPeriod === 'Après-Midi' ? 'X' : '',
                entry.mealPeriod === 'Soir' ? 'X' : '',
                entry.date || '',
                entry.mealTime || '',
                entry.location || '',
                entry.company || '',
                entry.whoPrepared || '',
                entry.activities || '',
                entry.mealComposition || '',
                entry.finishedMeal || '',
                entry.intensityBeforeText || '',
                entry.intensityDuringText || '',
                entry.intensityAfterText || '',
                entry.intensityPhysicalText || '',
                entry.purgingBehaviors || '',
                entry.intensityBingeText || '',
                entry.exercise || '',
                entry.otherRemarks || ''
            ];
            
            return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.map(h => `"${h}"`).join(','), ...csvData].join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `journal-alimentaire-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Export CSV téléchargé!', 'success');
    }

    exportToExcel() {
        // For a simple implementation, we'll use CSV format but with .xlsx extension
        // For full Excel support, you would need a library like SheetJS
        this.exportToCSV();
        
        // Change the last downloaded file name to .xlsx in notification
        this.showNotification('Export Excel téléchargé! (Format CSV compatible)', 'success');
    }

    exportDailyFormat(selectedDate) {
        if (!selectedDate) {
            this.showNotification('Veuillez sélectionner une date.', 'error');
            return;
        }

        // Filter entries for the selected date
        const dailyEntries = this.entries.filter(entry => entry.date === selectedDate);
        
        if (dailyEntries.length === 0) {
            this.showNotification('Aucune donnée trouvée pour cette date.', 'error');
            return;
        }

        // Define the meal periods as columns
        const mealPeriods = ['Matin', 'Matinée', 'Midi', 'Après-Midi', 'Soir'];
        
        // Define the row labels (meal details)
        const rowLabels = [
            'Date',
            'Heure et durée du repas',
            'Lieu',
            'Seul(e) ou en compagnie ? Avec qui ?',
            'Qui a préparé le repas ?',
            'Activités pendant le repas (en regardant un film, en discutant, …)',
            'Composition de votre repas (n\'oubliez pas les liquides).',
            'Avez-vous fini votre repas ?',
            'Évaluation du goût (sur 5)',
            'Évaluation de la satisfaction (sur 5)',
            'Quelles sont vos pensées avant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Quelles sont vos pensées pendant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Quelles sont vos pensées après le repas ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Décrivez vos sensations physiques après le repas. Précisez l\'intensité sur une échelle de 1 à 10.',
            'Avez-vous vomi, pris des laxatifs ou des diurétiques ?',
            'At/ou eu un accès de boulimique ? Précisez l\'intensité sur une échelle de 1 à 10.',
            'Avez-vous fait de l\'exercice ? Si oui lequel et combien de temps.',
            'Autres remarques.'
        ];

        // Create a map of entries by meal period
        const entriesByPeriod = {};
        dailyEntries.forEach(entry => {
            entriesByPeriod[entry.mealPeriod] = entry;
        });

        // Build the CSV with meal periods as headers
        const headers = ['Détails du repas', ...mealPeriods];
        
        const csvRows = [];
        csvRows.push(headers.map(h => `"${h}"`).join(','));

        // Create each row
        rowLabels.forEach(rowLabel => {
            const rowData = [rowLabel];
            
            mealPeriods.forEach(period => {
                const entry = entriesByPeriod[period];
                let cellValue = '';
                
                if (entry) {
                    switch (rowLabel) {
                        case 'Date':
                            cellValue = entry.date || '';
                            break;
                        case 'Heure et durée du repas':
                            cellValue = entry.mealTime || '';
                            break;
                        case 'Lieu':
                            cellValue = entry.location || '';
                            break;
                        case 'Seul(e) ou en compagnie ? Avec qui ?':
                            cellValue = entry.company || '';
                            break;
                        case 'Qui a préparé le repas ?':
                            cellValue = entry.whoPrepared || '';
                            break;
                        case 'Activités pendant le repas (en regardant un film, en discutant, …)':
                            cellValue = entry.activities || '';
                            break;
                        case 'Composition de votre repas (n\'oubliez pas les liquides).':
                            cellValue = entry.mealComposition || '';
                            break;
                        case 'Avez-vous fini votre repas ?':
                            cellValue = entry.finishedMeal || '';
                            break;
                        case 'Évaluation du goût (sur 5)':
                            cellValue = entry.tasteRating ? `${entry.tasteRating}/5` : '';
                            break;
                        case 'Évaluation de la satisfaction (sur 5)':
                            cellValue = entry.satisfactionRating ? `${entry.satisfactionRating}/5` : '';
                            break;
                        case 'Quelles sont vos pensées avant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.':
                            cellValue = entry.intensityBeforeText || '';
                            break;
                        case 'Quelles sont vos pensées pendant le repas ? Précisez l\'intensité sur une échelle de 1 à 10.':
                            cellValue = entry.intensityDuringText || '';
                            break;
                        case 'Quelles sont vos pensées après le repas ? Précisez l\'intensité sur une échelle de 1 à 10.':
                            cellValue = entry.intensityAfterText || '';
                            break;
                        case 'Décrivez vos sensations physiques après le repas. Précisez l\'intensité sur une échelle de 1 à 10.':
                            cellValue = entry.intensityPhysicalText || '';
                            break;
                        case 'Avez-vous vomi, pris des laxatifs ou des diurétiques ?':
                            cellValue = entry.purgingBehaviors || '';
                            break;
                        case 'At/ou eu un accès de boulimique ? Précisez l\'intensité sur une échelle de 1 à 10.':
                            cellValue = entry.intensityBingeText || '';
                            break;
                        case 'Avez-vous fait de l\'exercice ? Si oui lequel et combien de temps.':
                            cellValue = entry.exercise || '';
                            break;
                        case 'Autres remarques.':
                            cellValue = entry.otherRemarks || '';
                            break;
                    }
                }
                
                rowData.push(cellValue);
            });
            
            csvRows.push(rowData.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
        });

        const csv = csvRows.join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `journal-alimentaire-quotidien-${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Export quotidien pour le ${selectedDate} téléchargé!`, 'success');
    }

    // Google Sheets API Integration using new Google Identity Services
    async initializeGoogleAPI() {
        try {
            // Wait for both gapi and google to load
            if (typeof gapi === 'undefined' || typeof google === 'undefined') {
                console.log('Google APIs not loaded yet, will retry...');
                setTimeout(() => this.initializeGoogleAPI(), 1000);
                return;
            }

            // Initialize gapi client
            await new Promise((resolve, reject) => {
                gapi.load('client', resolve);
            });

            await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
            });

            // Initialize Google Identity Services
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (tokenResponse) => {
                    console.log('Token received:', tokenResponse);
                    if (tokenResponse.access_token) {
                        this.accessToken = tokenResponse.access_token;
                        this.isAuthorized = true;
                        this.updateAuthUI();
                        this.showNotification('Google connection successful!', 'success');
                    }
                },
            });

            this.isGoogleApiInitialized = true;
            console.log('Google Sheets API initialized with new Identity Services');

            // Show Google auth section
            document.getElementById('google-auth-section').style.display = 'block';
            this.updateAuthUI();

        } catch (error) {
            console.error('Error initializing Google API:', error);
            this.showNotification('Error initializing Google API. Check your API keys.', 'error');
        }
    }

    async handleAuthClick() {
        try {
            if (!this.tokenClient) {
                throw new Error('Token client not initialized');
            }
            
            // Request access token
            this.tokenClient.requestAccessToken({prompt: 'consent'});
        } catch (error) {
            console.error('Error during authentication:', error);
            this.showNotification('Error connecting to Google.', 'error');
        }
    }

    handleSignoutClick() {
        if (this.accessToken) {
            // Revoke the access token
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('Access token revoked');
            });
            this.accessToken = null;
        }
        this.isAuthorized = false;
        this.updateAuthUI();
        this.showNotification('Google disconnection successful.', 'info');
    }

    updateAuthUI() {
        const authorizeButton = document.getElementById('authorize-google');
        const signoutButton = document.getElementById('signout-google');
        const authStatus = document.getElementById('auth-status');
        const exportGoogleButton = document.getElementById('export-google-sheets');

        if (this.isAuthorized) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'inline-block';
            authStatus.innerHTML = '<span style="color: green;">✅ Connected to Google</span>';
            exportGoogleButton.disabled = false;
            exportGoogleButton.style.opacity = '1';
        } else {
            authorizeButton.style.display = 'inline-block';
            signoutButton.style.display = 'none';
            authStatus.innerHTML = '<span style="color: orange;">⚠️ Not connected</span>';
            exportGoogleButton.disabled = true;
            exportGoogleButton.style.opacity = '0.5';
        }
    }

    async exportToGoogleSheets() {
        if (!this.isGoogleApiInitialized) {
            this.showNotification('Google API is not yet initialized.', 'error');
            return;
        }

        if (!this.isAuthorized || !this.accessToken) {
            this.showNotification('Please connect to Google first.', 'error');
            return;
        }

        if (this.entries.length === 0) {
            this.showNotification('No data to export.', 'error');
            return;
        }

        try {
            // Set the access token for gapi client
            gapi.client.setToken({
                access_token: this.accessToken
            });

            this.showNotification('Creating Google Sheet...', 'info');

            // Create a new spreadsheet
            const spreadsheetResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: `Journal Alimentaire - ${new Date().toLocaleDateString('fr-FR')}`,
                },
                sheets: [
                    {
                        properties: {
                            title: 'Données des repas',
                            gridProperties: {
                                rowCount: this.entries.length + 10,
                                columnCount: 25
                            }
                        }
                    }
                ]
            });

            const spreadsheetId = spreadsheetResponse.result.spreadsheetId;
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

            // Prepare the data with headers
            const headers = [
                'Nom', 'Date', 'Période', 'Heure et durée', 'Lieu', 'Compagnie',
                'Qui a préparé', 'Activités', 'Composition', 'Repas terminé',
                'Note goût', 'Note satisfaction', 'Pensées avant', 'Pensées pendant',
                'Pensées après', 'Sensations physiques', 'Comportements',
                'Épisode boulimique', 'Exercice', 'Autres remarques'
            ];

            const data = [headers];

            // Add entry data
            this.entries.forEach(entry => {
                const row = [
                    entry.name || '',
                    entry.date || '',
                    entry.mealPeriod || '',
                    entry.mealTime || '',
                    entry.location || '',
                    entry.company || '',
                    entry.whoPrepared || '',
                    entry.activities || '',
                    entry.mealComposition || '',
                    entry.finishedMeal || '',
                    entry.tasteRating ? `${entry.tasteRating}/5` : '',
                    entry.satisfactionRating ? `${entry.satisfactionRating}/5` : '',
                    entry.intensityBeforeText || '',
                    entry.intensityDuringText || '',
                    entry.intensityAfterText || '',
                    entry.intensityPhysicalText || '',
                    entry.purgingBehaviors || '',
                    entry.intensityBingeText || '',
                    entry.exercise || '',
                    entry.otherRemarks || ''
                ];
                data.push(row);
            });

            // Add data to spreadsheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: 'A1',
                valueInputOption: 'RAW',
                resource: {
                    values: data
                }
            });

            // Apply formatting
            await this.formatGoogleSheet(spreadsheetId, data.length);

            // Open the spreadsheet
            window.open(spreadsheetUrl, '_blank');
            
            this.showNotification('Google Sheet created successfully! The file opens in a new tab.', 'success');

        } catch (error) {
            console.error('Error exporting to Google Sheets:', error);
            this.showNotification('Error exporting to Google Sheets: ' + error.message, 'error');
        }
    }

    async formatGoogleSheet(spreadsheetId, dataRowCount) {
        try {
            const requests = [
                // Format header row
                {
                    repeatCell: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: 20
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
                                textFormat: {
                                    foregroundColor: { red: 1, green: 1, blue: 1 },
                                    fontSize: 12,
                                    bold: true
                                },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                // Auto resize columns
                {
                    autoResizeDimensions: {
                        dimensions: {
                            sheetId: 0,
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: 20
                        }
                    }
                },
                // Add borders
                {
                    updateBorders: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: dataRowCount,
                            startColumnIndex: 0,
                            endColumnIndex: 20
                        },
                        top: { style: 'SOLID', width: 1, color: { red: 0.5, green: 0.5, blue: 0.5 } },
                        bottom: { style: 'SOLID', width: 1, color: { red: 0.5, green: 0.5, blue: 0.5 } },
                        left: { style: 'SOLID', width: 1, color: { red: 0.5, green: 0.5, blue: 0.5 } },
                        right: { style: 'SOLID', width: 1, color: { red: 0.5, green: 0.5, blue: 0.5 } },
                        innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } },
                        innerVertical: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
                    }
                },
                // Alternating row colors
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                sheetId: 0,
                                startRowIndex: 1,
                                endRowIndex: dataRowCount,
                                startColumnIndex: 0,
                                endColumnIndex: 20
                            }],
                            booleanRule: {
                                condition: {
                                    type: 'CUSTOM_FORMULA',
                                    values: [{ userEnteredValue: '=ISEVEN(ROW())' }]
                                },
                                format: {
                                    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 }
                                }
                            }
                        },
                        index: 0
                    }
                }
            ];

            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: { requests: requests }
            });

        } catch (error) {
            console.error('Error formatting Google Sheet:', error);
            // Don't throw here as the main export succeeded
        }
    }

    loadEntries() {
        try {
            const saved = localStorage.getItem('foodDiaryEntries');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading entries:', error);
            return [];
        }
    }

    saveEntries() {
        try {
            localStorage.setItem('foodDiaryEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            this.showNotification('Erreur lors de la sauvegarde.', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');

        // Play sound effect
        this.playSound(type);

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    // =================
    // INTERACTIVE FEATURES
    // =================



    selectMoodBubble(bubble) {
        const container = bubble.parentElement;
        container.querySelectorAll('.mood-bubble').forEach(b => b.classList.remove('selected'));
        bubble.classList.add('selected');
        bubble.style.backgroundColor = bubble.dataset.color;
        
        // Add bounce animation
        bubble.classList.add('bounce-in');
        setTimeout(() => {
            bubble.classList.remove('bounce-in');
        }, 600);

        // Add to textarea if exists
        const textareaId = container.dataset.for;
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            const currentValue = textarea.value;
            const moodText = bubble.textContent;
            if (!currentValue.includes(moodText)) {
                textarea.value = currentValue ? `${currentValue} ${moodText}` : moodText;
            }
        }
    }

    setStarRating(ratingContainer, rating) {
        const ratingType = ratingContainer.dataset.rating;
        const stars = ratingContainer.querySelectorAll('.star');
        
        console.log('Setting star rating:', ratingType, rating); // Debug log
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.style.filter = 'grayscale(0%)';
                star.style.opacity = '1';
                star.style.transform = 'scale(1.2)';
            } else {
                star.classList.remove('active');
                star.style.filter = 'grayscale(100%)';
                star.style.opacity = '0.5';
                star.style.transform = 'scale(1)';
            }
        });

        // Update hidden input
        const hiddenInput = document.getElementById(`${ratingType}-rating-value`);
        if (hiddenInput) {
            hiddenInput.value = rating;
            console.log('Updated hidden input:', hiddenInput.id, '=', rating); // Debug log
        }

        // Store the current rating on the container
        ratingContainer.setAttribute('data-current-rating', rating);

        // Visual feedback
        this.showNotification(`${ratingType === 'taste' ? 'Goût' : 'Satisfaction'}: ${rating}/5 ⭐`, 'success');
        this.playSound('success');
    }

    highlightStars(ratingContainer, rating) {
        const stars = ratingContainer.querySelectorAll('.star');
        const currentRating = parseInt(ratingContainer.getAttribute('data-current-rating')) || 0;
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.filter = 'grayscale(0%)';
                star.style.opacity = '1';
                star.style.transform = 'scale(1.15)';
            } else {
                // Keep active stars styled
                if (index < currentRating) {
                    star.style.filter = 'grayscale(0%)';
                    star.style.opacity = '1';
                    star.style.transform = 'scale(1.2)';
                } else {
                    star.style.filter = 'grayscale(100%)';
                    star.style.opacity = '0.5';
                    star.style.transform = 'scale(1)';
                }
            }
        });
    }

    resetStarHighlight(ratingContainer) {
        const stars = ratingContainer.querySelectorAll('.star');
        const currentRating = parseInt(ratingContainer.getAttribute('data-current-rating')) || 0;
        
        stars.forEach((star, index) => {
            if (index < currentRating) {
                // Keep active stars highlighted
                star.style.filter = 'grayscale(0%)';
                star.style.opacity = '1';
                star.style.transform = 'scale(1.2)';
            } else {
                star.style.filter = 'grayscale(100%)';
                star.style.opacity = '0.5';
                star.style.transform = 'scale(1)';
            }
        });
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            const placeholder = document.querySelector('.photo-placeholder');
            const img = document.getElementById('preview-image');
            
            img.src = e.target.result;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removePhoto() {
        const photoInput = document.getElementById('meal-photo');
        const preview = document.getElementById('photo-preview');
        const placeholder = document.querySelector('.photo-placeholder');
        
        photoInput.value = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    }

    refreshQuote() {
        const quoteElement = document.getElementById('daily-quote');
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        quoteElement.textContent = randomQuote;
        
        // Add animation
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.style.opacity = '1';
        }, 200);
    }

    updateDailyGoals() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.entries.filter(entry => entry.date === today);
        
        const goals = ['breakfast', 'lunch', 'dinner'];
        const periods = ['Matin', 'Midi', 'Soir'];
        
        goals.forEach((goal, index) => {
            const goalElement = document.querySelector(`[data-goal="${goal}"]`);
            const hasEntry = todayEntries.some(entry => 
                entry.mealPeriod === periods[index] || 
                (periods[index] === 'Matin' && entry.mealPeriod === 'Matinée')
            );
            
            if (hasEntry) {
                goalElement.classList.add('completed');
            } else {
                goalElement.classList.remove('completed');
            }
        });
    }

    calculateStats() {
        const stats = {
            totalMeals: this.entries.length,
            currentStreak: this.calculateStreak(),
            avgSatisfaction: this.calculateAverageSatisfaction(),
            dominantMood: this.findDominantMood()
        };
        return stats;
    }

    calculateStreak() {
        if (this.entries.length === 0) return 0;
        
        const dates = [...new Set(this.entries.map(entry => entry.date))].sort().reverse();
        let streak = 0;
        let currentDate = new Date();
        
        for (const date of dates) {
            const entryDate = new Date(date);
            const dayDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateAverageSatisfaction() {
        const satisfactionRatings = this.entries
            .filter(entry => entry.satisfactionRating)
            .map(entry => parseInt(entry.satisfactionRating));
        
        if (satisfactionRatings.length === 0) return 0;
        
        const avg = satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length;
        return Math.round(avg * 10) / 10;
    }

    findDominantMood() {
        const moods = {};
        this.entries.forEach(entry => {
            ['thoughtsBefore', 'thoughtsDuring', 'thoughtsAfter'].forEach(field => {
                if (entry[field]) {
                    const moodEmojis = entry[field].match(/[😰😊😐🤤😤😄😋⏰📱👥🧘😔😌😞🤢⚡☮️😴]/g);
                    if (moodEmojis) {
                        moodEmojis.forEach(emoji => {
                            moods[emoji] = (moods[emoji] || 0) + 1;
                        });
                    }
                }
            });
        });
        
        return Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b, '😊');
    }

    renderStats() {
        this.stats = this.calculateStats();
        
        document.getElementById('total-meals').textContent = this.stats.totalMeals;
        document.getElementById('current-streak').textContent = this.stats.currentStreak;
        document.getElementById('avg-satisfaction').textContent = this.stats.avgSatisfaction;
        document.getElementById('best-mood').textContent = this.stats.dominantMood;
        
        this.renderSatisfactionChart();
        this.renderMoodBreakdown();
    }

    renderSatisfactionChart() {
        const canvas = document.getElementById('satisfaction-chart');
        const ctx = canvas.getContext('2d');
        
        // Simple line chart implementation
        const recentEntries = this.entries
            .filter(entry => entry.satisfactionRating)
            .slice(-10)
            .map(entry => ({
                date: entry.date,
                satisfaction: parseInt(entry.satisfactionRating)
            }));
        
        if (recentEntries.length === 0) {
            ctx.fillText('Pas encore de données de satisfaction', 50, 100);
            return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple line chart
        ctx.beginPath();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        
        const width = canvas.width - 40;
        const height = canvas.height - 40;
        const stepX = width / (recentEntries.length - 1);
        
        recentEntries.forEach((entry, index) => {
            const x = 20 + index * stepX;
            const y = height - (entry.satisfaction / 5) * (height - 20) + 20;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw points
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.stroke();
    }

    renderMoodBreakdown() {
        const moodContainer = document.getElementById('mood-breakdown');
        const moods = {};
        
        this.entries.forEach(entry => {
            ['thoughtsBefore', 'thoughtsDuring', 'thoughtsAfter'].forEach(field => {
                if (entry[field]) {
                    const moodMatches = entry[field].match(/[😰😊😐🤤😤😄😋⏰📱👥🧘😔😌😞🤢⚡☮️😴]/g);
                    if (moodMatches) {
                        moodMatches.forEach(emoji => {
                            moods[emoji] = (moods[emoji] || 0) + 1;
                        });
                    }
                }
            });
        });
        
        const sortedMoods = Object.entries(moods)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);
        
        moodContainer.innerHTML = sortedMoods.map(([emoji, count]) => `
            <div class="mood-stat">
                <span class="mood-emoji">${emoji}</span>
                <span class="mood-count">${count} fois</span>
            </div>
        `).join('');
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_meal',
                title: '🍽️ Premier Repas',
                description: 'Enregistrez votre premier repas',
                condition: () => this.entries.length >= 1,
                unlocked: this.entries.length >= 1
            },
            {
                id: 'week_streak',
                title: '🔥 Une Semaine',
                description: '7 jours consécutifs d\'enregistrement',
                condition: () => this.calculateStreak() >= 7,
                unlocked: this.calculateStreak() >= 7
            },
            {
                id: 'photo_lover',
                title: '📸 Photographe Culinaire',
                description: 'Ajoutez 5 photos de repas',
                condition: () => this.entries.filter(e => e.mealPhoto).length >= 5,
                unlocked: this.entries.filter(e => e.mealPhoto).length >= 5
            },
            {
                id: 'mindful_eater',
                title: '🧘 Mangeur Conscient',
                description: 'Utilisez 10 bulles d\'humeur différentes',
                condition: () => this.getUsedMoods().length >= 10,
                unlocked: this.getUsedMoods().length >= 10
            },
            {
                id: 'consistent_logger',
                title: '📊 Régulier',
                description: 'Enregistrez 50 repas',
                condition: () => this.entries.length >= 50,
                unlocked: this.entries.length >= 50
            }
        ];
        
        this.achievements = achievements;
        this.saveAchievements();
    }

    getUsedMoods() {
        const moods = new Set();
        this.entries.forEach(entry => {
            ['thoughtsBefore', 'thoughtsDuring', 'thoughtsAfter'].forEach(field => {
                if (entry[field]) {
                    const moodMatches = entry[field].match(/[😰😊😐🤤😤😄😋⏰📱👥🧘😔😌😞🤢⚡☮️😴]/g);
                    if (moodMatches) {
                        moodMatches.forEach(emoji => moods.add(emoji));
                    }
                }
            });
        });
        return Array.from(moods);
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        const progressItems = document.getElementById('progress-items');
        
        // Render achievement cards
        achievementsGrid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.unlocked ? achievement.title.split(' ')[0] : '🔒'}</div>
                <div class="achievement-title">${achievement.title.split(' ').slice(1).join(' ')}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `).join('');
        
        // Render progress items for locked achievements
        const lockedAchievements = this.achievements.filter(a => !a.unlocked);
        progressItems.innerHTML = lockedAchievements.map(achievement => {
            const progress = this.calculateAchievementProgress(achievement);
            return `
                <div class="progress-item">
                    <div class="progress-title">${achievement.title}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="progress-text">${progress.current}/${progress.total}</div>
                </div>
            `;
        }).join('');
    }

    calculateAchievementProgress(achievement) {
        switch(achievement.id) {
            case 'first_meal':
                return { current: Math.min(this.entries.length, 1), total: 1, percentage: Math.min(this.entries.length * 100, 100) };
            case 'week_streak':
                return { current: Math.min(this.calculateStreak(), 7), total: 7, percentage: Math.min(this.calculateStreak() / 7 * 100, 100) };
            case 'photo_lover':
                const photos = this.entries.filter(e => e.mealPhoto).length;
                return { current: Math.min(photos, 5), total: 5, percentage: Math.min(photos / 5 * 100, 100) };
            case 'mindful_eater':
                const moodCount = this.getUsedMoods().length;
                return { current: Math.min(moodCount, 10), total: 10, percentage: Math.min(moodCount / 10 * 100, 100) };
            case 'consistent_logger':
                return { current: Math.min(this.entries.length, 50), total: 50, percentage: Math.min(this.entries.length / 50 * 100, 100) };
            default:
                return { current: 0, total: 1, percentage: 0 };
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }

    handleShake(event) {
        const acceleration = event.accelerationIncludingGravity;
        const threshold = 15;
        
        if (Math.abs(acceleration.x) > threshold || 
            Math.abs(acceleration.y) > threshold || 
            Math.abs(acceleration.z) > threshold) {
            
            const fab = document.getElementById('quick-add-fab');
            fab.classList.add('shake');
            setTimeout(() => {
                fab.classList.remove('shake');
            }, 500);
            
            // Clear form if on entry tab
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab.id === 'entry-tab') {
                this.resetForm();
                this.showNotification('Formulaire effacé! 🎲', 'success');
            }
        }
    }

    quickAddMeal() {
        this.switchTab('entry');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showNotification('Prêt à enregistrer un nouveau repas! 🚀', 'success');
    }

    playSound(type) {
        // Simple sound implementation
        if (type === 'success') {
            // Create a simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = type === 'success' ? 800 : 400;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('foodDiaryAchievements');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading achievements:', error);
            return [];
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('foodDiaryAchievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }
}

// Enhanced Excel Export with SheetJS (if library is available)
function enhancedExcelExport() {
    // This function would use SheetJS library for proper Excel export
    // For now, we'll stick with CSV which is compatible with Excel
    console.log('Enhanced Excel export would require SheetJS library');
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FoodDiaryApp();
    
    // Debug function for testing star ratings
    window.testStars = () => {
        console.log('Testing star ratings...');
        const starRatings = document.querySelectorAll('.star-rating');
        console.log('Found star rating containers:', starRatings.length);
        
        starRatings.forEach((rating, index) => {
            console.log(`Rating ${index + 1}:`, rating.dataset.rating);
            const stars = rating.querySelectorAll('.star');
            console.log(`  Stars found: ${stars.length}`);
            stars.forEach((star, starIndex) => {
                console.log(`    Star ${starIndex + 1} has click listener:`, star.onclick !== null);
            });
        });
    };
});

// Handle form validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('meal-form');
    
    // Custom validation messages
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('invalid', (e) => {
            if (field.validity.valueMissing) {
                field.setCustomValidity('Ce champ est obligatoire.');
            }
        });
        
        field.addEventListener('input', (e) => {
            field.setCustomValidity('');
        });
    });
});

// Utility functions
const utils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    truncateText: (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    escapeCSV: (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }
};

// Handle offline functionality
window.addEventListener('online', () => {
    if (window.app) {
        window.app.showNotification('Connexion rétablie!', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.showNotification('Mode hors ligne activé.', 'success');
    }
});

// Handle iOS viewport issues
function handleIOSViewport() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

document.addEventListener('DOMContentLoaded', handleIOSViewport);
