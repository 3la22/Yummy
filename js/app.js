const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

let sidebarOpen = false;

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const hamburger = document.getElementById('hamburger');
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle('open', sidebarOpen);
  mainContent.classList.toggle('shifted', sidebarOpen);
  hamburger.classList.toggle('sidebar-open', sidebarOpen);
  if (sidebarOpen) {
    hamburger.style.left = '230px';
    hamburger.style.color = '#aaa';
  } else {
    hamburger.style.left = '10px';
    hamburger.style.color = '#333';
  }
}

function hideAllSections() {
  document.getElementById('mealsGrid').classList.add('hidden');
  document.getElementById('mealDetail').classList.add('hidden');
  document.getElementById('searchSection').classList.add('hidden');
  document.getElementById('categoriesSection').classList.add('hidden');
  document.getElementById('areaSection').classList.add('hidden');
  document.getElementById('ingredientsSection').classList.add('hidden');
  document.getElementById('contactSection').classList.add('hidden');
}

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  el.classList.remove('hidden');
}

async function fetchData(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function renderMeals(meals, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!meals || meals.length === 0) {
    container.innerHTML = '<p style="color:#aaa;padding:20px;grid-column:1/-1">No meals found.</p>';
    return;
  }
  const limited = meals.slice(0, 20);
  limited.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
      <div class="overlay">
        <h3>${meal.strMeal}</h3>
      </div>
    `;
    card.addEventListener('click', () => showMealDetail(meal.idMeal));
    container.appendChild(card);
  });
}

async function loadHomeMeals() {
  hideAllSections();
  const grid = document.getElementById('mealsGrid');
  grid.classList.remove('hidden');
  showLoading('mealsGrid');
  const data = await fetchData(`${BASE_URL}/search.php?s=`);
  renderMeals(data.meals, 'mealsGrid');
}

async function showMealDetail(id) {
  hideAllSections();
  const detail = document.getElementById('mealDetail');
  detail.classList.remove('hidden');
  detail.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const data = await fetchData(`${BASE_URL}/lookup.php?i=${id}`);
  const meal = data.meals[0];

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ name: ing, measure: meas });
    }
  }

  const tags = meal.strTags ? meal.strTags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '';

  const ingHTML = ingredients.map(i => `
    <li>
      <img src="https://www.themealdb.com/images/ingredients/${encodeURIComponent(i.name)}-Small.png" alt="${i.name}" onerror="this.style.display='none'" />
      <span>${i.name}</span>
      <span style="color:#e8a100;font-size:0.75rem">${i.measure}</span>
    </li>
  `).join('');

  detail.innerHTML = `
    <button class="back-btn" onclick="loadHomeMeals()"><i class="fas fa-arrow-left"></i> Back</button>
    <div class="meal-detail-inner">
      <div class="meal-detail-header">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <div class="meal-detail-info">
          <h1>${meal.strMeal}</h1>
          <div class="meal-meta">
            <span class="badge" onclick="showCategoryMeals('${meal.strCategory}')">${meal.strCategory}</span>
            <span class="badge" onclick="showAreaMeals('${meal.strArea}')">${meal.strArea}</span>
          </div>
          ${tags ? `<div class="meal-tags">${tags}</div>` : ''}
          <div class="meal-links">
            ${meal.strSource ? `<a href="${meal.strSource}" target="_blank"><i class="fas fa-link"></i> Source</a>` : ''}
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank"><i class="fab fa-youtube"></i> YouTube</a>` : ''}
          </div>
        </div>
      </div>
      <div class="meal-detail-body">
        <div class="meal-ingredients">
          <h2>Ingredients</h2>
          <ul>${ingHTML}</ul>
        </div>
        <div class="meal-instructions">
          <h2>Instructions</h2>
          <p>${meal.strInstructions}</p>
        </div>
      </div>
    </div>
  `;
}

function showSearch() {
  hideAllSections();
  document.getElementById('searchSection').classList.remove('hidden');
  document.getElementById('searchByName').value = '';
  document.getElementById('searchByLetter').value = '';
  document.getElementById('searchResults').innerHTML = '';
  toggleSidebar();
}

async function searchByName(val) {
  if (!val.trim()) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  const data = await fetchData(`${BASE_URL}/search.php?s=${val}`);
  renderMeals(data.meals, 'searchResults');
}

async function searchByLetter(val) {
  if (!val.trim()) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  const data = await fetchData(`${BASE_URL}/search.php?f=${val}`);
  renderMeals(data.meals, 'searchResults');
}

async function showCategories() {
  hideAllSections();
  const section = document.getElementById('categoriesSection');
  section.classList.remove('hidden');
  showLoading('categoriesGrid');
  const data = await fetchData(`${BASE_URL}/categories.php`);
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';
  data.categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" loading="lazy" />
      <h3>${cat.strCategory}</h3>
      <p>${cat.strCategoryDescription}</p>
    `;
    card.addEventListener('click', () => showCategoryMeals(cat.strCategory));
    grid.appendChild(card);
  });
  toggleSidebar();
}

async function showCategoryMeals(category) {
  hideAllSections();
  const grid = document.getElementById('mealsGrid');
  grid.classList.remove('hidden');
  showLoading('mealsGrid');
  const data = await fetchData(`${BASE_URL}/filter.php?c=${category}`);
  renderMeals(data.meals, 'mealsGrid');
}

async function showArea() {
  hideAllSections();
  const section = document.getElementById('areaSection');
  section.classList.remove('hidden');
  showLoading('areaGrid');
  const data = await fetchData(`${BASE_URL}/list.php?a=list`);
  const grid = document.getElementById('areaGrid');
  grid.innerHTML = '';
  data.meals.forEach(area => {
    const card = document.createElement('div');
    card.className = 'area-card';
    card.innerHTML = `
      <i class="fas fa-house-laptop"></i>
      <h3>${area.strArea}</h3>
    `;
    card.addEventListener('click', () => showAreaMeals(area.strArea));
    grid.appendChild(card);
  });
  toggleSidebar();
}

async function showAreaMeals(area) {
  hideAllSections();
  const grid = document.getElementById('mealsGrid');
  grid.classList.remove('hidden');
  showLoading('mealsGrid');
  const data = await fetchData(`${BASE_URL}/filter.php?a=${area}`);
  renderMeals(data.meals, 'mealsGrid');
}

async function showIngredients() {
  hideAllSections();
  const section = document.getElementById('ingredientsSection');
  section.classList.remove('hidden');
  showLoading('ingredientsGrid');
  const data = await fetchData(`${BASE_URL}/list.php?i=list`);
  const grid = document.getElementById('ingredientsGrid');
  grid.innerHTML = '';
  const limited = data.meals.slice(0, 20);
  limited.forEach(ing => {
    const card = document.createElement('div');
    card.className = 'ingredient-card';
    card.innerHTML = `
      <img src="https://www.themealdb.com/images/ingredients/${encodeURIComponent(ing.strIngredient)}-Small.png" alt="${ing.strIngredient}" onerror="this.style.display='none'" />
      <h3>${ing.strIngredient}</h3>
      <p>${ing.strDescription || ''}</p>
    `;
    card.addEventListener('click', () => showIngredientMeals(ing.strIngredient));
    grid.appendChild(card);
  });
  toggleSidebar();
}

async function showIngredientMeals(ingredient) {
  hideAllSections();
  const grid = document.getElementById('mealsGrid');
  grid.classList.remove('hidden');
  showLoading('mealsGrid');
  const data = await fetchData(`${BASE_URL}/filter.php?i=${ingredient}`);
  renderMeals(data.meals, 'mealsGrid');
}

function showContact() {
  hideAllSections();
  document.getElementById('contactSection').classList.remove('hidden');
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('formAlerts').classList.add('hidden');
  ['nameInput','emailInput','phoneInput','ageInput','passwordInput','repasswordInput'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('valid','invalid');
  });
  toggleSidebar();
}

function validateForm() {
  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const age = document.getElementById('ageInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const repass = document.getElementById('repasswordInput').value;

  const nameRegex = /^[a-zA-Z\s]{3,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;
  const ageRegex = /^(?:1[0-9]|[2-9][0-9]|1[0-4][0-9])$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const nameValid = nameRegex.test(name);
  const emailValid = emailRegex.test(email);
  const phoneValid = phoneRegex.test(phone);
  const ageValid = ageRegex.test(age);
  const passValid = passRegex.test(password);
  const repassValid = password === repass && repass !== '';

  applyValidation('nameInput', nameValid);
  applyValidation('emailInput', emailValid);
  applyValidation('phoneInput', phoneValid);
  applyValidation('ageInput', ageValid);
  applyValidation('passwordInput', passValid);
  applyValidation('repasswordInput', repassValid);

  const alerts = [];
  if (!nameValid && name) alerts.push({ id: 'nameAlert', msg: 'Name must be at least 3 letters, no numbers.' });
  if (!emailValid && email) alerts.push({ id: 'emailAlert', msg: 'Enter a valid email address.' });
  if (!phoneValid && phone) alerts.push({ id: 'phoneAlert', msg: 'Phone must be 10-15 digits.' });
  if (!ageValid && age) alerts.push({ id: 'ageAlert', msg: 'Age must be between 10 and 149.' });
  if (!passValid && password) alerts.push({ id: 'passwordAlert', msg: 'Password: 8+ chars, uppercase, lowercase, number.' });
  if (!repassValid && repass) alerts.push({ id: 'repassAlert', msg: 'Passwords do not match.' });

  const alertsDiv = document.getElementById('formAlerts');
  if (alerts.length > 0) {
    alertsDiv.classList.remove('hidden');
    alertsDiv.innerHTML = alerts.map(a => `<span>${a.msg}</span>`).join('');
  } else {
    alertsDiv.classList.add('hidden');
  }

  const allValid = nameValid && emailValid && phoneValid && ageValid && passValid && repassValid;
  document.getElementById('submitBtn').disabled = !allValid;
}

function applyValidation(id, isValid) {
  const el = document.getElementById(id);
  if (el.value.trim() === '') {
    el.classList.remove('valid', 'invalid');
  } else {
    el.classList.toggle('valid', isValid);
    el.classList.toggle('invalid', !isValid);
  }
}

loadHomeMeals();