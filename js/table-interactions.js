document.addEventListener('DOMContentLoaded', () => {
    const tables = document.querySelectorAll('.table-item-3d');
    const reservationForm = document.getElementById('reservationForm');
    const selectionFeedback = document.getElementById('selection-feedback');
    const selectionText = document.getElementById('selection-text');
    const partySizeInput = document.getElementById('partySize');
    const tablePreferenceSelect = document.getElementById('tablePreference');
    const locationSelect = document.getElementById('location');
    let selectedTable = null;

    // Function to handle table selection
    function selectTable(table) {
        // Remove previous selection
        if (selectedTable) {
            selectedTable.classList.remove('selected');
        }

        // Select new table
        selectedTable = table;
        table.classList.add('selected');

        // Get table info
        const tableNumber = table.dataset.table;
        const seats = table.querySelector('.table-shape').dataset.seats;
        const area = table.dataset.area;

        // Update selection feedback
        selectionText.textContent = `Selected: Table ${tableNumber} (${seats} seats) - ${area}`;
        selectionFeedback.classList.remove('hidden');

        // Add hidden input to form
        let tableInput = document.getElementById('selectedTable');
        if (!tableInput) {
            tableInput = document.createElement('input');
            tableInput.type = 'hidden';
            tableInput.id = 'selectedTable';
            tableInput.name = 'tableNumber';
            reservationForm.appendChild(tableInput);
        }
        tableInput.value = tableNumber;

        // Update location select based on area
        if (locationSelect) {
            switch(area) {
                case 'Window View':
                    locationSelect.value = 'indoor';
                    tablePreferenceSelect.value = 'window';
                    break;
                case 'Main Dining':
                    locationSelect.value = 'indoor';
                    tablePreferenceSelect.value = '';
                    break;
                case 'Private Corner':
                    locationSelect.value = 'private';
                    tablePreferenceSelect.value = 'corner';
                    break;
                default:
                    locationSelect.value = 'indoor';
            }
        }

        // Highlight the form to show it's ready for input
        reservationForm.classList.add('table-selected');
        setTimeout(() => reservationForm.classList.remove('table-selected'), 1500);
    }

    // Add click handlers to tables
    tables.forEach(table => {
        table.addEventListener('click', () => {
            const tableSeats = parseInt(table.querySelector('.table-shape').dataset.seats);
            const currentPartySize = parseInt(partySizeInput.value);

            if (currentPartySize > tableSeats) {
                alert(`This table only seats ${tableSeats} people. Please select a larger table or adjust your party size.`);
                return;
            }

            if (table.dataset.status !== 'available') {
                alert('This table is not available for the selected time.');
                return;
            }

            selectTable(table);
            
            // Scroll to form if it's not visible
            const formRect = reservationForm.getBoundingClientRect();
            if (formRect.top < 0 || formRect.bottom > window.innerHeight) {
                reservationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // Handle party size changes
    partySizeInput.addEventListener('change', () => {
        if (selectedTable) {
            const tableSeats = parseInt(selectedTable.querySelector('.table-shape').dataset.seats);
            const currentPartySize = parseInt(partySizeInput.value);

            if (currentPartySize > tableSeats) {
                alert(`Your party size exceeds the capacity of the selected table (${tableSeats} seats). Please select a different table.`);
                selectedTable.classList.remove('selected');
                selectedTable = null;
                selectionFeedback.classList.add('hidden');
                document.getElementById('selectedTable')?.remove();
                locationSelect.value = '';
                tablePreferenceSelect.value = '';
            }
        }
    });

    // Add form validation
    reservationForm.addEventListener('submit', (e) => {
        if (!selectedTable) {
            e.preventDefault();
            alert('Please select a table from the floor plan.');
            return;
        }
    });
});