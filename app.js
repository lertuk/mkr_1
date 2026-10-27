"use strict";
// 2. Типізація стану додатку
let plants = [];
let editingId = null;
// 3. Отримуємо DOM-елементи з суворим приведенням типів (Type Casting)
const form = document.getElementById('plant-form');
const idInput = document.getElementById('plant-id');
const nameInput = document.getElementById('plant-name');
const speciesInput = document.getElementById('plant-species');
const roomInput = document.getElementById('plant-room');
const dateInput = document.getElementById('plant-date');
const frequencyInput = document.getElementById('plant-freq');
const notesInput = document.getElementById('plant-notes');
const searchInput = document.getElementById('search-name');
const filterSelect = document.getElementById('filter-room');
const plantsList = document.getElementById('plants-list');
const cancelBtn = document.getElementById('cancel-btn');
const submitBtn = document.getElementById('submit-btn');
// Елементи навігації
const btnApp = document.getElementById('btn-app');
const btnCondition = document.getElementById('btn-condition');
const appView = document.getElementById('app-view');
const conditionView = document.getElementById('condition-view');
// --- РОБОТА З LOCALSTORAGE ---
function loadPlantsFromStorage() {
    const storedData = localStorage.getItem('plantsData');
    if (storedData) {
        plants = JSON.parse(storedData);
    }
    renderPlants(plants);
}
function savePlantsToStorage() {
    localStorage.setItem('plantsData', JSON.stringify(plants));
}
// --- CRUD ОПЕРАЦІЇ ---
// Create & Update
function handleFormSubmit(event) {
    event.preventDefault();
    // Збираємо типізовані дані з форми
    const plantData = {
        id: editingId ? editingId : crypto.randomUUID(), // Генеруємо унікальний ID, якщо це новий запис
        name: nameInput.value.trim(),
        species: speciesInput.value.trim(),
        room: roomInput.value,
        lastWatered: dateInput.value,
        frequency: parseInt(frequencyInput.value, 10),
        notes: notesInput.value.trim()
    };
    if (editingId) {
        // UPDATE
        plants = plants.map((p) => p.id === editingId ? plantData : p);
        editingId = null;
        submitBtn.textContent = 'Зберегти запис';
        cancelBtn.classList.add('hidden');
    }
    else {
        // CREATE
        plants.push(plantData);
    }
    savePlantsToStorage();
    form.reset();
    applyFilters();
}
// Read (Відображення)
function renderPlants(plantsToRender) {
    plantsList.innerHTML = ''; // Очищаємо контейнер
    if (plantsToRender.length === 0) {
        plantsList.innerHTML = '<p>Не знайдено жодної рослини.</p>';
        return;
    }
    plantsToRender.forEach((plant) => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.innerHTML = `
            <h3>${plant.name}</h3>
            <p><strong>Вид:</strong> ${plant.species}</p>
            <p><strong>Кімната:</strong> ${plant.room}</p>
            <p><strong>Останній полив:</strong> ${plant.lastWatered}</p>
            <p><strong>Частота (днів):</strong> ${plant.frequency}</p>
            <p><strong>Примітка:</strong> ${plant.notes || '-'}</p>
            <div class="card-actions">
                <button class="btn-edit" onclick="editPlant('${plant.id}')">Редагувати</button>
                <button class="btn-delete" onclick="deletePlant('${plant.id}')">Видалити</button>
            </div>
        `;
        plantsList.appendChild(card);
    });
}
window.editPlant = (id) => {
    const plantToEdit = plants.find(p => p.id === id);
    if (!plantToEdit)
        return;
    editingId = plantToEdit.id;
    nameInput.value = plantToEdit.name;
    speciesInput.value = plantToEdit.species;
    roomInput.value = plantToEdit.room;
    dateInput.value = plantToEdit.lastWatered;
    frequencyInput.value = plantToEdit.frequency.toString();
    notesInput.value = plantToEdit.notes;
    submitBtn.textContent = 'Оновити запис';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
// Delete
window.deletePlant = (id) => {
    const isConfirmed = confirm('Ви дійсно хочете видалити цей запис?');
    if (isConfirmed) {
        plants = plants.filter((p) => p.id !== id);
        savePlantsToStorage();
        applyFilters();
    }
};
function cancelEdit() {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Зберегти запис';
    cancelBtn.classList.add('hidden');
}
// --- ПОШУК ТА ФІЛЬТРАЦІЯ ---
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const filterRoom = filterSelect.value;
    const filteredPlants = plants.filter((plant) => {
        const matchesSearch = plant.name.toLowerCase().includes(searchText);
        const matchesRoom = filterRoom ? plant.room === filterRoom : true;
        return matchesSearch && matchesRoom;
    });
    renderPlants(filteredPlants);
}
// --- НАВІГАЦІЯ (Додаток / Умова) ---
function switchTab(viewMode) {
    if (viewMode === 'app') {
        appView.classList.remove('hidden');
        conditionView.classList.add('hidden');
        btnApp.classList.add('active');
        btnCondition.classList.remove('active');
    }
    else {
        appView.classList.add('hidden');
        conditionView.classList.remove('hidden');
        btnApp.classList.remove('active');
        btnCondition.classList.add('active');
    }
}
// --- ДОДАВАННЯ СЛУХАЧІВ ПОДІЙ ---
form.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', cancelEdit);
searchInput.addEventListener('input', applyFilters);
filterSelect.addEventListener('change', applyFilters);
btnApp.addEventListener('click', () => switchTab('app'));
btnCondition.addEventListener('click', () => switchTab('condition'));
// Ініціалізація додатку при завантаженні
document.addEventListener('DOMContentLoaded', loadPlantsFromStorage);
