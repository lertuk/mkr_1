interface PlantRecord {
    id: string;
    name: string;
    species: string;
    room: string;
    lastWatered: string; // YYYY-MM-DD
    frequency: number;
    notes: string;
}

// Розширюємо глобальний об'єкт Window, щоб уникнути використання `any` для onclick в HTML
declare global {
    interface Window {
        editPlant: (id: string) => void;
        deletePlant: (id: string) => void;
    }
}

// Стан додатку
let plants: PlantRecord[] = [];
let editingId: string | null = null;

// DOM елементи
const form = document.getElementById('plant-form') as HTMLFormElement;
const nameInput = document.getElementById('plant-name') as HTMLInputElement;
const speciesInput = document.getElementById('plant-species') as HTMLInputElement;
const roomInput = document.getElementById('plant-room') as HTMLSelectElement;
const dateInput = document.getElementById('plant-date') as HTMLInputElement;
const freqInput = document.getElementById('plant-freq') as HTMLInputElement;
const notesInput = document.getElementById('plant-notes') as HTMLTextAreaElement;

const searchInput = document.getElementById('search-name') as HTMLInputElement;
const filterSelect = document.getElementById('filter-room') as HTMLSelectElement;
const sortSelect = document.getElementById('sort-plants') as HTMLSelectElement; // Додано для сортування
const plantsList = document.getElementById('plants-list') as HTMLDivElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

const btnApp = document.getElementById('btn-app') as HTMLButtonElement;
const btnCondition = document.getElementById('btn-condition') as HTMLButtonElement;
const appView = document.getElementById('app-view') as HTMLElement;
const conditionView = document.getElementById('condition-view') as HTMLElement;

// --- Робота з localStorage ---

function loadPlantsFromStorage() {
    const stored = localStorage.getItem('plantsData');
    if (stored) {
        plants = JSON.parse(stored);
    }
    renderPlants(plants);
}

function savePlantsToStorage() {
    localStorage.setItem('plantsData', JSON.stringify(plants));
}

// --- CRUD ---

function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();

    const plantData: PlantRecord = {
        id: editingId || crypto.randomUUID(),
        name: nameInput.value.trim(),
        species: speciesInput.value.trim(),
        room: roomInput.value,
        lastWatered: dateInput.value,
        frequency: parseInt(freqInput.value, 10),
        notes: notesInput.value.trim()
    };

    if (editingId) {
        plants = plants.map(p => p.id === editingId ? plantData : p);
        editingId = null;
        submitBtn.textContent = 'Зберегти запис';
        cancelBtn.classList.add('hidden');
    } else {
        plants.push(plantData);
    }

    savePlantsToStorage();
    form.reset();
    applyFilters();
}

function renderPlants(data: PlantRecord[]) {
    plantsList.innerHTML = '';

    if (!data.length) {
        plantsList.innerHTML = '<p>Не знайдено жодної рослини.</p>';
        return;
    }

    data.forEach(plant => {
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

// Глобальні функції для виклику з HTML
window.editPlant = (id: string) => {
    const plant = plants.find(p => p.id === id);
    if (!plant) return;

    editingId = plant.id;
    nameInput.value = plant.name;
    speciesInput.value = plant.species;
    roomInput.value = plant.room;
    dateInput.value = plant.lastWatered;
    freqInput.value = plant.frequency.toString();
    notesInput.value = plant.notes;

    submitBtn.textContent = 'Оновити запис';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePlant = (id: string) => {
    if (confirm('Ви дійсно хочете видалити цей запис?')) {
        plants = plants.filter(p => p.id !== id);
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

// --- Пошук, Фільтрація, Сортування ---

function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const room = filterSelect.value;
    const sort = sortSelect?.value || 'name-asc';

    // Фільтруємо за назвою/видом та кімнатою
    let result = plants.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search) || p.species.toLowerCase().includes(search);
        const matchRoom = room ? p.room === room : true;
        return matchSearch && matchRoom;
    });

    // Сортуємо
    result.sort((a, b) => {
        switch (sort) {
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'date-new': return new Date(b.lastWatered).getTime() - new Date(a.lastWatered).getTime();
            case 'date-old': return new Date(a.lastWatered).getTime() - new Date(b.lastWatered).getTime();
            default: return 0;
        }
    });

    renderPlants(result);
}

// --- Навігація ---

function switchTab(tab: 'app' | 'condition') {
    const isApp = tab === 'app';
    appView.classList.toggle('hidden', !isApp);
    conditionView.classList.toggle('hidden', isApp);
    btnApp.classList.toggle('active', isApp);
    btnCondition.classList.toggle('active', !isApp);
}

// --- Ініціалізація та слухачі ---

form.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', cancelEdit);
searchInput.addEventListener('input', applyFilters);
filterSelect.addEventListener('change', applyFilters);
if (sortSelect) sortSelect.addEventListener('change', applyFilters);

btnApp.addEventListener('click', () => switchTab('app'));
btnCondition.addEventListener('click', () => switchTab('condition'));

document.addEventListener('DOMContentLoaded', loadPlantsFromStorage);