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
            const emojiElement = valueSpan.nextElementSibling;
            
            // Update value display and emoji
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = value;
                
                if (emojiElement && emojiElement.classList.contains('intensity-emoji')) {
                    emojiElement.textContent = this.getIntensityEmoji(value);
                    emojiElement.style.animation = 'none';
                    setTimeout(() => {
                        emojiElement.style.animation = 'pulse 2s infinite';
                    }, 10);
                }
            });
            
            // Initialize display
            const value = parseInt(slider.value);
            valueSpan.textContent = value;
            if (emojiElement && emojiElement.classList.contains('intensity-emoji')) {
                emojiElement.textContent = this.getIntensityEmoji(value);
            }
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
        
        // Populate form with entry data
        const form = document.getElementById('meal-form');
        const formData = new FormData(form);
        
        for (const [key, value] of Object.entries(entry)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
                // Update slider displays
                if (field.type === 'range') {
                    const valueSpan = field.nextElementSibling;
                    if (valueSpan) {
                        valueSpan.textContent = value;
                    }
                }
            }
        }

        // Switch to entry tab
        this.switchTab('entry');
        this.showNotification('Modification du repas en cours...', 'success');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    getIntensityEmoji(value) {
        const emojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
        return emojis[Math.min(value - 1, 9)] || '😐';
    }

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
                id: 'satisfaction_master',
                title: '⭐ Satisfaction Élevée',
                description: 'Maintenez une satisfaction moyenne de 4+',
                condition: () => this.calculateAverageSatisfaction() >= 4,
                unlocked: this.calculateAverageSatisfaction() >= 4
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
            case 'satisfaction_master':
                const avgSat = this.calculateAverageSatisfaction();
                return { current: Math.min(avgSat, 4).toFixed(1), total: 4, percentage: Math.min(avgSat / 4 * 100, 100) };
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
