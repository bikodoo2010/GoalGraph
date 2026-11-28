const messages = {
  en: {
    appName: "GoalGraph", tagline: "Make progress visible.", language: "Language",
    newGoal: "New goal", addChild: "Add subgoal", exportJson: "Export JSON", exportCsv: "Export CSV", importJson: "Import JSON",
    overview: "Overview", totalGoals: "Goals & steps", completed: "Completed", openTasks: "Open tasks", overdue: "Overdue",
    yourPlan: "Your plan", searchPlaceholder: "Search goals, notes, and tasks…", allStatuses: "All statuses",
    not_started: "Not started", in_progress: "In progress", completedStatus: "Completed", blocked: "Blocked", archived: "Archived",
    emptyTitle: "Start with one meaningful goal", emptyText: "Add a goal, break it into smaller steps, and track your progress here.",
    selectNode: "Select a goal to see its details.", details: "Details", title: "Title", description: "Description", descriptionPlaceholder: "What does success look like?",
    type: "Type", goal: "Goal", skill: "Skill", topic: "Topic", project: "Project", task: "Task", habit: "Habit", milestone: "Milestone",
    status: "Status", priority: "Priority", low: "Low", medium: "Medium", high: "High", deadline: "Deadline", notes: "Notes", notesPlaceholder: "Personal notes…",
    tasks: "Tasks", addTaskPlaceholder: "Add a task and press Enter", noTasks: "No tasks yet.", delete: "Delete", deleteConfirm: "Delete this item and all its subitems?",
    saveSaved: "All changes saved", saveSaving: "Saving…", saveUnsaved: "Unsaved changes", saveFailed: "Could not save. Export a backup before leaving.",
    importSuccess: "Backup imported successfully.", importError: "Could not import this file.", fileTooLarge: "File is too large. Maximum size is 2 MB.", invalidJson: "This is not valid GoalGraph JSON.",
    importConfirm: "Replace the current plan with this backup? This can be undone only by importing another backup.", exportDone: "File exported.",
    promptGoal: "Enter a goal name:", promptSubgoal: "Enter a subgoal name:", taskLimit: "This goal has reached the task limit.",
    footerLocal: "Your plan stays in this browser unless you export it.", migrationDone: "Your previous GoalGraph data was imported into V2.",
    noResults: "No matching goals found.", clearFilter: "Clear filters", confirmReset: "Clear all GoalGraph V2 data from this browser?",
    reset: "Reset data", dataSafety: "Data & privacy", localOnly: "Local storage only · No account · No server database",
    exportNote: "JSON keeps your complete plan. CSV is a spreadsheet-friendly, formula-safe summary.", root: "Main goal", progress: "Progress", due: "Due", children: "Subgoals",
    taskDone: "Task completed", taskOpen: "Task not completed", importLabel: "Choose a GoalGraph JSON backup", selectFile: "Select file", cancel: "Cancel",
  },
  ru: {
    appName: "GoalGraph", tagline: "Превращай цели в понятный план.", language: "Язык",
    newGoal: "Новая цель", addChild: "Добавить подцель", exportJson: "Экспорт JSON", exportCsv: "Экспорт CSV", importJson: "Импорт JSON",
    overview: "Обзор", totalGoals: "Цели и шаги", completed: "Завершено", openTasks: "Открытые задачи", overdue: "Просрочено",
    yourPlan: "Твой план", searchPlaceholder: "Поиск по целям, заметкам и задачам…", allStatuses: "Все статусы",
    not_started: "Не начато", in_progress: "В процессе", completedStatus: "Завершено", blocked: "Заблокировано", archived: "В архиве",
    emptyTitle: "Начни с одной важной цели", emptyText: "Добавь цель, разбей её на небольшие шаги и отслеживай прогресс здесь.",
    selectNode: "Выбери цель, чтобы увидеть подробности.", details: "Детали", title: "Название", description: "Описание", descriptionPlaceholder: "Как выглядит достигнутый результат?",
    type: "Тип", goal: "Цель", skill: "Навык", topic: "Тема", project: "Проект", task: "Задача", habit: "Привычка", milestone: "Этап",
    status: "Статус", priority: "Приоритет", low: "Низкий", medium: "Средний", high: "Высокий", deadline: "Срок", notes: "Заметки", notesPlaceholder: "Личные заметки…",
    tasks: "Задачи", addTaskPlaceholder: "Добавь задачу и нажми Enter", noTasks: "Пока нет задач.", delete: "Удалить", deleteConfirm: "Удалить этот элемент и все вложенные элементы?",
    saveSaved: "Все изменения сохранены", saveSaving: "Сохранение…", saveUnsaved: "Есть несохранённые изменения", saveFailed: "Не удалось сохранить. Экспортируй резервную копию перед выходом.",
    importSuccess: "Резервная копия успешно импортирована.", importError: "Не удалось импортировать файл.", fileTooLarge: "Файл слишком большой. Максимальный размер — 2 МБ.", invalidJson: "Это не корректный JSON-файл GoalGraph.",
    importConfirm: "Заменить текущий план этой резервной копией? Отменить это действие можно только повторным импортом.", exportDone: "Файл экспортирован.",
    promptGoal: "Введи название цели:", promptSubgoal: "Введи название подцели:", taskLimit: "Достигнут лимит задач для этой цели.",
    footerLocal: "План хранится в этом браузере, пока ты не экспортируешь его.", migrationDone: "Данные предыдущей версии GoalGraph перенесены в V2.",
    noResults: "Подходящие цели не найдены.", clearFilter: "Сбросить фильтры", confirmReset: "Удалить все данные GoalGraph V2 из этого браузера?",
    reset: "Сбросить данные", dataSafety: "Данные и конфиденциальность", localOnly: "Только локальное хранилище · Без аккаунта · Без базы на сервере",
    exportNote: "JSON сохраняет весь план. CSV — безопасная для формул сводка для таблиц.", root: "Главная цель", progress: "Прогресс", due: "Срок", children: "Подцели",
    taskDone: "Задача выполнена", taskOpen: "Задача не выполнена", importLabel: "Выбери резервную копию GoalGraph JSON", selectFile: "Выбрать файл", cancel: "Отмена",
  },
  kk: {
    appName: "GoalGraph", tagline: "Мақсаттарыңды нақты жоспарға айналдыр.", language: "Тіл",
    newGoal: "Жаңа мақсат", addChild: "Қосымша мақсат қосу", exportJson: "JSON экспорттау", exportCsv: "CSV экспорттау", importJson: "JSON импорттау",
    overview: "Шолу", totalGoals: "Мақсаттар мен қадамдар", completed: "Орындалды", openTasks: "Ашық тапсырмалар", overdue: "Мерзімі өтті",
    yourPlan: "Жоспарың", searchPlaceholder: "Мақсаттар, жазбалар және тапсырмалардан іздеу…", allStatuses: "Барлық мәртебелер",
    not_started: "Басталмады", in_progress: "Орындалуда", completedStatus: "Орындалды", blocked: "Тоқтап тұр", archived: "Мұрағатта",
    emptyTitle: "Бір маңызды мақсаттан баста", emptyText: "Мақсат қосып, оны шағын қадамдарға бөл де, осында нәтижесін бақыла.",
    selectNode: "Мәліметтерін көру үшін мақсатты таңда.", details: "Мәліметтер", title: "Атауы", description: "Сипаттамасы", descriptionPlaceholder: "Нәтиже қандай болуы керек?",
    type: "Түрі", goal: "Мақсат", skill: "Дағды", topic: "Тақырып", project: "Жоба", task: "Тапсырма", habit: "Әдет", milestone: "Кезең",
    status: "Мәртебесі", priority: "Маңыздылығы", low: "Төмен", medium: "Орташа", high: "Жоғары", deadline: "Мерзімі", notes: "Жазбалар", notesPlaceholder: "Жеке жазбалар…",
    tasks: "Тапсырмалар", addTaskPlaceholder: "Тапсырма жазып, Enter бас", noTasks: "Әзірге тапсырма жоқ.", delete: "Жою", deleteConfirm: "Бұл элементті және оның барлық ішкі элементтерін жоясың ба?",
    saveSaved: "Барлық өзгеріс сақталды", saveSaving: "Сақталуда…", saveUnsaved: "Сақталмаған өзгерістер бар", saveFailed: "Сақтау мүмкін болмады. Шығар алдында резервтік көшірме жаса.",
    importSuccess: "Резервтік көшірме сәтті импортталды.", importError: "Файлды импорттау мүмкін болмады.", fileTooLarge: "Файл тым үлкен. Ең үлкен өлшемі — 2 МБ.", invalidJson: "Бұл GoalGraph форматына сай JSON емес.",
    importConfirm: "Қазіргі жоспарды осы резервтік көшірмемен ауыстырасың ба? Бұл әрекетті тек басқа көшірмені импорттау арқылы қайтаруға болады.", exportDone: "Файл экспортталды.",
    promptGoal: "Мақсаттың атауын енгіз:", promptSubgoal: "Қосымша мақсаттың атауын енгіз:", taskLimit: "Бұл мақсаттағы тапсырмалар шегіне жеттің.",
    footerLocal: "Жоспарың экспорттамайынша осы браузерде сақталады.", migrationDone: "GoalGraph-тың алдыңғы нұсқасындағы деректер V2-ге көшірілді.",
    noResults: "Сәйкес мақсаттар табылмады.", clearFilter: "Сүзгілерді тазарту", confirmReset: "Осы браузердегі GoalGraph V2 деректерінің барлығын өшіресің бе?",
    reset: "Деректерді тазарту", dataSafety: "Деректер және құпиялылық", localOnly: "Тек жергілікті сақтау · Аккаунт жоқ · Серверлік дерекқор жоқ",
    exportNote: "JSON толық жоспарды сақтайды. CSV — кестелерге арналған, формуладан қорғалған қысқаша нұсқа.", root: "Негізгі мақсат", progress: "Прогресс", due: "Мерзімі", children: "Қосымша мақсаттар",
    taskDone: "Тапсырма орындалды", taskOpen: "Тапсырма орындалмады", importLabel: "GoalGraph JSON резервтік көшірмесін таңда", selectFile: "Файл таңдау", cancel: "Болдырмау",
  }
};

export function normalizeLocale(value) {
  return Object.hasOwn(messages, value) ? value : "en";
}

export function translate(locale, key) {
  const lang = messages[normalizeLocale(locale)];
  return lang[key] ?? messages.en[key] ?? key;
}

export function localeName(locale) {
  return ({ en: "English", ru: "Русский", kk: "Қазақша" })[normalizeLocale(locale)];
}
