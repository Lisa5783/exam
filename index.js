// Переменные для хранения данных
let allCourses = []; // Все курсы (загружаются из API)
let filteredCourses = []; // Отфильтрованные курсы
let currentPage = 1; // Текущая страница
const ITEMS_PER_PAGE = 3; // Количество курсов на странице

// Функция для получения данных о курсах через API
async function fetchCourses() {
    const apiUrl = "http://cat-facts-api.std-900.ist.mospolytech.ru/api/courses?api_key=a2973cdd-d303-48f2-a6b6-78ff07878f95";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        allCourses = await response.json(); // Сохраняем все курсы в переменную
        console.log("Данные успешно загружены:", allCourses);
    } catch (error) {
        console.error("Ошибка при загрузке данных из API:", error);
        alert("Не удалось загрузить данные о курсах. Попробуйте позже.");
    }
}

// Загрузка данных при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCourses(); // Загружаем данные о курсах из API

    filteredCourses = [...allCourses]; // Изначально отображаем все курсы
    setupPagination(filteredCourses); // Настраиваем пагинацию для всех курсов
    renderCourses(filteredCourses, currentPage); // Отображаем первую страницу всех курсов
});


// Обработчик изменения уровня в выпадающем списке
document.getElementById("search-level").addEventListener("change", (event) => {
    const selectedLevel = event.target.value;
    filterCoursesByLevel(selectedLevel); // Фильтруем и обновляем отображение курсов
});

// Функция для фильтрации курсов по уровню
function filterCoursesByLevel(level) {
    // Проверяем выбранный уровень
    if (level === "allCourses") {
        filteredCourses = [...allCourses]; // Если выбран "Все курсы", копируем все курсы
    } else {
        filteredCourses = allCourses.filter(course => course.level === level); // Фильтруем по уровню
    }

    currentPage = 1; // Сбрасываем на первую страницу после фильтрации
    setupPagination(filteredCourses); // Настраиваем пагинацию для отфильтрованных данных
    renderCourses(filteredCourses, currentPage); // Отображаем первую страницу отфильтрованных данных
}

// Функция для отображения курсов на странице
function renderCourses(courses, page) {
    const coursesContainer = document.querySelector("#courses .row"); // Контейнер для курсов

    // Очищаем контейнер перед добавлением новых данных
    coursesContainer.innerHTML = "";

    // Рассчитываем индекс начала и конца текущей страницы
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Получаем данные для текущей страницы
    const coursesToRender = courses.slice(startIndex, endIndex);

    // Проверяем, есть ли курсы для отображения
    if (coursesToRender.length === 0) {
        coursesContainer.innerHTML = "<p>Курсы не найдены.</p>";
        return;
    }

    // Проходим по списку курсов и создаем карточки
    coursesToRender.forEach(course => {
        const courseCard = document.createElement("div");
        courseCard.className = "col-md-4 mb-3";

        courseCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${course.name}</h5>
                    <p class="card-text"><strong>Уровень:</strong> ${course.level}</p>
                    <button class="btn btn-primary btn-view-details" data-id="${course.id}">Подробнее</button>
                </div>
            </div>
        `;

        coursesContainer.appendChild(courseCard);
    });

    // Добавляем обработчики кликов на кнопки "Подробнее"
    document.querySelectorAll(".btn-view-details").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение
            const courseId = parseInt(e.target.getAttribute("data-id"));
            showCourseDetails(courseId);
        });
    });
}

// Функция настройки пагинации
function setupPagination(data) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Очищаем старые кнопки

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE); // Общее количество страниц

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        
        pageItem.innerHTML = `
            <a href="#" class="page-link">${i}</a>
        `;

        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            renderCourses(data, currentPage); // Переключаем страницу
            setupPagination(data); // Обновляем активную кнопку
        });

        paginationContainer.appendChild(pageItem);
    }
}

// Функция для отображения подробной информации о курсе в модальном окне
function showCourseDetails(courseId) {
    const selectedCourse = allCourses.find(course => course.id === courseId);

    if (!selectedCourse) {
        alert("Курс не найден!");
        return;
    }

    const modalContent = `
      <div class="modal-header">
          <h5 class="modal-title">${selectedCourse.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
          <p><strong>Описание:</strong> ${selectedCourse.description}</p>
          <p><strong>Преподаватель:</strong> ${selectedCourse.teacher}</p>
          <p><strong>Уровень:</strong> ${selectedCourse.level}</p>
          <p><strong>Длительность:</strong> ${selectedCourse.total_length} недель</p>
          <p><strong>Часы в неделю:</strong> ${selectedCourse.week_length}</p>
          <p><strong>Стоимость за час:</strong> ${selectedCourse.course_fee_per_hour} руб.</p>
          <p><strong>Доступные даты начала:</strong></p>
          <ul>${selectedCourse.start_dates.map(date => `<li>${new Date(date).toLocaleString()}</li>`).join("")}</ul>
      </div>`;
    
      document.querySelector("#courseModal .modal-content").innerHTML = modalContent;

      const modalInstance = new bootstrap.Modal(document.getElementById("courseModal"));
      modalInstance.show();
}

//РЕПЕТИТОРЫ

const ITEMS_PER_PAGE2 = 3; // Количество репетиторов на одной странице
let currentPage2 = 1; // Текущая страница
let allTutors = []; // Все репетиторы (загружаются из API)

// Загрузка данных при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
    await fetchTutors(); // Загружаем данные о репетиторах из API
    setupPagination2(allTutors); // Настраиваем пагинацию
    renderTutors(allTutors, currentPage2); // Отображаем первую страницу репетиторов
});

// Функция для получения данных о репетиторах через API
async function fetchTutors() {
    const apiUrl = "http://cat-facts-api.std-900.ist.mospolytech.ru/api/tutors?api_key=a2973cdd-d303-48f2-a6b6-78ff07878f95";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        allTutors = await response.json(); // Сохраняем всех репетиторов в переменную
        console.log("Данные о репетиторах успешно загружены:", allTutors);
    } catch (error) {
        console.error("Ошибка при загрузке данных о репетиторах:", error);
        alert("Не удалось загрузить данные о репетиторах. Попробуйте позже.");
    }
}

// Функция для отображения списка репетиторов на текущей странице
function renderTutors(tutors, page) {
    const tutorContainer = document.getElementById("tutor-container");

    // Очищаем контейнер перед добавлением новых данных
    tutorContainer.innerHTML = "";

    // Рассчитываем индекс начала и конца текущей страницы
    const startIndex = (page - 1) * ITEMS_PER_PAGE2;
    const endIndex = startIndex + ITEMS_PER_PAGE2;

    // Получаем данные для текущей страницы
    const tutorsToRender = tutors.slice(startIndex, endIndex);

    if (tutorsToRender.length === 0) {
        tutorContainer.innerHTML = "<p>Репетиторы не найдены.</p>";
        return;
    }

    // Создаем карточки для каждого репетитора
    tutorsToRender.forEach(tutor => {
        const tutorCard = document.createElement("div");
        tutorCard.className = "col-md-4"; // Используем сетку Bootstrap

        tutorCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${tutor.name}</h5>
                    <p><strong>Опыт:</strong> ${tutor.work_experience} лет</p>
                    <p><strong>Языки, которые знает:</strong> ${tutor.languages_spoken.join(", ")}</p>
                    <p><strong>Языки, которые преподаёт:</strong> ${tutor.languages_offered.join(", ")}</p>
                    <p><strong>Уровень:</strong> ${tutor.language_level}</p>
                    <p><strong>Цена за час:</strong> ${tutor.price_per_hour} руб.</p>
                </div>
            </div>
        `;

        tutorContainer.appendChild(tutorCard);
    });
}

// Функция настройки пагинации
function setupPagination2(data) {
    const paginationContainer = document.getElementById("pagination2");
    
    paginationContainer.innerHTML = ""; // Очищаем старые кнопки

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE2); // Общее количество страниц

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage2 ? "active" : ""}`;
        
        pageItem.innerHTML = `
            <a href="#" class="page-link">${i}</a>
        `;

        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage2 = i;
            renderTutors(data, currentPage2); // Переключаем страницу
            setupPagination2(data); // Обновляем активную кнопку
        });

        paginationContainer.appendChild(pageItem);
    }
}
