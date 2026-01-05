const translations = {
  fr: {
    appTitle: "Gestion de Restaurant",
    login: "Connexion",
    dashboard: "Dashboard",
    language: "Langue",
    add: "Ajouter",
    save: "Enregistrer",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    confirmed: "Confirmée",
    pending: "En attente",
    cancelled: "Annulée",
    numberOfPeople: "Nombre de personnes",
    reservationAdded: "Réservation ajoutée",
    reservationUpdated: "Réservation mise à jour",
    reservationDeleted: "Réservation supprimée",
    confirmDeleteReservation: "Supprimer cette réservation ?",
    addReservation: "Ajouter la réservation",
    noReservations: "Aucune réservation pour le moment",
    reservationsTitle: "Réservations",
    clientName: "Nom du client",
    date: "Date",
    time: "Heure",
    status: "Statut",
    actions: "Actions",
    employeesTitle: "Employés",
    name: "Nom",
    role: "Rôle",
    phone: "Téléphone",
    addEmployee: "Ajouter l'employé",
    employeeAdded: "Employé ajouté",
    employeeUpdated: "Employé mis à jour",
    employeeDeleted: "Employé supprimé",
    confirmDeleteEmployee: "Supprimer cet employé ?",
    role_server: "Serveur",
    role_cashier: "Caissier",
    role_manager: "Manager"
  },
  en: {
    appTitle: "Restaurant Management",
    login: "Login",
    dashboard: "Dashboard",
    language: "Language",
    add: "Add",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    numberOfPeople: "Number of people",
    reservationAdded: "Reservation added",
    reservationUpdated: "Reservation updated",
    reservationDeleted: "Reservation deleted",
    confirmDeleteReservation: "Delete this reservation?",
    addReservation: "Add reservation",
    noReservations: "No reservations yet",
    reservationsTitle: "Reservations",
    clientName: "Client name",
    date: "Date",
    time: "Time",
    status: "Status",
    actions: "Actions",
    employeesTitle: "Employees",
    name: "Name",
    role: "Role",
    phone: "Phone",
    addEmployee: "Add employee",
    employeeAdded: "Employee added",
    employeeUpdated: "Employee updated",
    employeeDeleted: "Employee deleted",
    confirmDeleteEmployee: "Delete this employee?",
    role_server: "Waiter",
    role_cashier: "Cashier",
    role_manager: "Manager"
  },
  ar: {
    appTitle: "إدارة المطعم",
    login: "تسجيل الدخول",
    dashboard: "لوحة التحكم",
    language: "اللغة",
    add: "إضافة",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    confirmed: "مؤكدة",
    pending: "قيد الانتظار",
    cancelled: "ملغاة",
    numberOfPeople: "عدد الأشخاص",
    reservationAdded: "تم إضافة الحجز",
    reservationUpdated: "تم تعديل الحجز",
    reservationDeleted: "تم حذف الحجز",
    confirmDeleteReservation: "هل تريد حذف هذا الحجز؟",
    addReservation: "إضافة حجز",
    noReservations: "لا توجد حجوزات حتى الآن",
    reservationsTitle: "الحجوزات",
    clientName: "اسم الزبون",
    date: "التاريخ",
    time: "الوقت",
    status: "الحالة",
    actions: "الإجراءات",
    employeesTitle: "الموظفون",
    name: "الاسم",
    role: "الدور",
    phone: "الهاتف",
    addEmployee: "إضافة موظف",
    employeeAdded: "تم إضافة الموظف",
    employeeUpdated: "تم تعديل الموظف",
    employeeDeleted: "تم حذف الموظف",
    confirmDeleteEmployee: "هل تريد حذف هذا الموظف؟",
    role_server: "نادل",
    role_cashier: "أمين صندوق",
    role_manager: "مدير"
  }
};

function getCurrentLanguage() {
  return localStorage.getItem('lang') || 'fr';
}

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  applyLanguage(lang);
}

function t(key) {
  const lang = getCurrentLanguage();
  return (translations[lang] && translations[lang][key]) || key;
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.placeholder !== undefined && el.tagName === 'INPUT') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  applyLanguage(getCurrentLanguage());
});
