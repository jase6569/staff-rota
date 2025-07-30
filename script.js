
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridWeek,dayGridMonth",
    },
    editable: true,
    selectable: true,
    events: loadEvents(),
    eventClick: function (info) {
      const confirmed = confirm(`Remove "${info.event.title}" from the calendar?`);
      if (confirmed) {
        info.event.remove();
        removeEvent(info.event);
        populateFilters();
      }
    },
  });

  calendar.render();

  document.getElementById("addMarketBtn").addEventListener("click", function () {
    const marketName = document.getElementById("marketName").value.trim();
    const marketDay = document.getElementById("marketDay").value;
    const staffName = document.getElementById("staffName").value.trim();

    if (!marketName || !staffName) {
      alert("Please enter both market name and staff name.");
      return;
    }

    const nextDate = getNextDayOfWeek(marketDay);
    const eventTitle = `${marketName} – ${staffName}`;
    const newEvent = {
      title: eventTitle,
      start: nextDate.toISOString().split("T")[0],
      allDay: true,
    };

    calendar.addEvent(newEvent);
    saveEvent(newEvent);
    populateFilters();

    document.getElementById("marketName").value = "";
    document.getElementById("staffName").value = "";
  });

  function getNextDayOfWeek(dayName) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = daysOfWeek.indexOf(dayName);

    let diff = targetIndex - todayIndex;
    if (diff < 0) diff += 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + diff);
    return nextDate;
  }

  function saveEvent(event) {
    const events = JSON.parse(localStorage.getItem("marketEvents") || "[]");
    events.push(event);
    localStorage.setItem("marketEvents", JSON.stringify(events));
  }

  function loadEvents() {
    return JSON.parse(localStorage.getItem("marketEvents") || "[]");
  }

  function removeEvent(targetEvent) {
    let events = JSON.parse(localStorage.getItem("marketEvents") || "[]");
    events = events.filter(e => !(e.title === targetEvent.title && e.start === targetEvent.startStr));
    localStorage.setItem("marketEvents", JSON.stringify(events));
  }

  function extractStaffFromTitle(title) {
    const parts = title.split("–");
    return parts.length > 1 ? parts[1].trim() : null;
  }

  function extractMarketFromTitle(title) {
    const parts = title.split("–");
    return parts.length > 1 ? parts[0].trim() : null;
  }

  function populateFilters() {
    const events = loadEvents();
    const staffSet = new Set();
    const marketSet = new Set();

    events.forEach(event => {
      const staff = extractStaffFromTitle(event.title);
      const market = extractMarketFromTitle(event.title);
      if (staff) staffSet.add(staff);
      if (market) marketSet.add(market);
    });

    const staffFilter = document.getElementById("staffFilter");
    staffFilter.innerHTML = '<option value="all">Show All</option>';
    [...staffSet].sort().forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      staffFilter.appendChild(option);
    });

    const marketFilter = document.getElementById("marketFilter");
    marketFilter.innerHTML = '<option value="all">Show All</option>';
    [...marketSet].sort().forEach(market => {
      const option = document.createElement("option");
      option.value = market;
      option.textContent = market;
      marketFilter.appendChild(option);
    });
  }

  function applyFilters() {
    const selectedStaff = document.getElementById("staffFilter").value;
    const selectedMarket = document.getElementById("marketFilter").value;

    const all = loadEvents();
    const filtered = all.filter(e => {
      const staffMatch = selectedStaff === "all" || extractStaffFromTitle(e.title) === selectedStaff;
      const marketMatch = selectedMarket === "all" || extractMarketFromTitle(e.title) === selectedMarket;
      return staffMatch && marketMatch;
    });

    calendar.removeAllEvents();
    filtered.forEach(e => calendar.addEvent(e));
  }

  document.getElementById("staffFilter").addEventListener("change", applyFilters);
  document.getElementById("marketFilter").addEventListener("change", applyFilters);

  populateFilters();
});
