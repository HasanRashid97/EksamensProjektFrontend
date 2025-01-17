const apiUrl = 'http://localhost:8080/deliveries'

// Funktion til at hente leveringer
async function fetchDeliveries() {
    try {
        const response = await fetch(apiUrl);
        const deliveries = await response.json();
        displayDeliveries(deliveries);
    } catch (error) {
        console.error('Fejl ved hentning af leveringer:', error);
    }
}

// Funktion til at vise leveringer på skærmen
function displayDeliveries(deliveries) {
    const list = document.getElementById('levering-list');
    list.innerHTML = ''; // Ryd listen før vi tilføjer nye elementer

    deliveries.sort((a, b) => new Date(a.forventetLevering) - new Date(b.forventetLevering));

    deliveries.forEach(delivery => {
        const listItem = document.createElement('li');

        if (!delivery.droneId) {
            listItem.classList.add('missing-drone');
            listItem.innerHTML = `
            <span class="pizza-title"><strong>${delivery.pizzaTitel}</strong></span> - 
            <span class="expected-time">Forventet: <strong>${new Date(delivery.forventetLevering).toLocaleString()}</strong></span> - 
            <span class="status">Status: <strong>Mangler drone</strong></span> 
            <button onclick="assignDrone(${delivery.id})" class="assign-button">Tildel drone</button>
        `;
        } else {
            listItem.classList.add('has-drone');
            listItem.innerHTML = `
            <span class="pizza-title"><strong>${delivery.pizzaTitel}</strong></span> - 
            <span class="expected-time">Forventet: <strong>${new Date(delivery.forventetLevering).toLocaleString()}</strong></span> - 
            <span class="status"><strong>Status:<strong> Tildelt drone</strong></span> 
            <button onclick="finishDelivery(${delivery.id})" class="finish-button">Afslut levering</button>
        `;
        }

        list.appendChild(listItem);
    });
}

// Funktion til at tildele en drone til en levering
async function assignDrone(deliveryId) {
    try {
        const response = await fetch(`http://localhost:8080/deliveries/schedule?leveringId=${deliveryId}`, { method: 'POST' });
        const message = await response.text();
        alert(message);
        fetchDeliveries(); // Opdater listen efter tildeling af drone
    } catch (error) {
        console.error('Fejl ved tildeling af drone:', error);
    }
}

// Funktion til at afslutte en levering
async function finishDelivery(deliveryId) {
    try {
        const response = await fetch(`http://localhost:8080/deliveries/finish?leveringId=${deliveryId}`, { method: 'POST' });
        const message = await response.text();
        alert(message);
        fetchDeliveries();
    } catch (error) {
        console.error('Fejl ved afslutning af levering:', error);
    }
}

function fetchDrones() {
    fetch('http://localhost:8080/drones') // Replace with your actual endpoint
        .then(response => response.json()) // Assuming the response is in JSON format
        .then(drones => {
            const droneList = document.getElementById('drone-list');
            droneList.innerHTML = ''; // Clear the list first

            drones.forEach(drone => {
                const li = document.createElement('li');
                li.textContent = `Drone ID: ${drone.id}, Serienummer: ${drone.serienummer}, Status: ${drone.status}`;
                droneList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching drones:', error);
        });
}

// Function to create a new drone by calling the backend API
function createDrone() {
    fetch('http://localhost:8080/drones/add', {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Drone could not be created');
            }
            return response.json(); // Parse the response body as JSON
        })
        .then(data => {
            alert('Drone created successfully: ' + data.id); // Optionally show a success message
            console.log(data); // Log the created drone object
            fetchDrones()
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to create drone'); // Show an error message
        });
}

// Start med at hente leveringer når siden indlæses
fetchDeliveries();

// Opdater leveringslisten hver 60. sekund
setInterval(fetchDeliveries, 60000);
document.getElementById('create-drone-button').addEventListener('click', createDrone);
document.addEventListener('DOMContentLoaded', fetchDrones);