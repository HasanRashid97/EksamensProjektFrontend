const deliveryUrl = 'http://localhost:8080/deliveries';
const droneUrl = 'http://localhost:8080/drones'


async function fetchDeliveries() {
    try {
        const response = await fetch(deliveryUrl);
        const deliveries = await response.json();
        displayDeliveries(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
    }
}


function displayDeliveries(deliveries) {
    const list = document.getElementById('levering-list');
    list.innerHTML = '';

    deliveries.sort((a, b) => new Date(a.forventetLevering) - new Date(b.forventetLevering));


    deliveries.forEach(delivery => {
        const listItem = document.createElement('li');

        // Extract the full date and time components
        const deliveryDateObj = new Date(delivery.forventetLevering);

        // Format the date part (e.g., 17/01/2025)
        const date = deliveryDateObj.toLocaleDateString('da-DK', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Extract and format the time part (e.g., 14:30)
        const hours = String(deliveryDateObj.getHours()).padStart(2, '0');
        const minutes = String(deliveryDateObj.getMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;  // Format as hh:mm

        // Combine both date and time
        const formattedDateTime = `${date}, ${time}`;

        if (!delivery.droneId) {
            listItem.classList.add('missing-drone');
            listItem.innerHTML = `
            <span class="delivery-id">ID: <strong>${delivery.id}</strong></span> . 
            <span class="pizza-title"><strong>${delivery.pizzaTitel}</strong></span> | 
            <span class="expected-time">Forventet: <strong>${formattedDateTime}</strong></span> | 
            <span class="status">Status: <strong>Mangler drone</strong></span>
            <button onclick="assignDrone(${delivery.id})" class="assign-button">Tildel drone</button>
        `;
        } else {
            listItem.classList.add('has-drone');
            listItem.innerHTML = `
            <span class="pizza-title"><strong>${delivery.pizzaTitel}</strong></span> - 
            <span class="expected-time">Forventet: <strong>${formattedDateTime}</strong></span> - 
            <span class="status">Status: <strong>Tildelt drone</strong></span> 
            <button onclick="finishDelivery(${delivery.id})" class="finish-button">Afslut levering</button>
        `;
        }

        list.appendChild(listItem);
    });
}


async function assignDrone(deliveryId) {
    try {
        const response = await fetch(`${deliveryUrl}/schedule?leveringId=${deliveryId}`, { method: 'POST' });
        const message = await response.text();
        alert(message);
        fetchDeliveries();
    } catch (error) {
        console.error('Error assigning drone:', error);
    }
}


async function finishDelivery(deliveryId) {
    try {
        const response = await fetch(`${deliveryUrl}/finish?leveringId=${deliveryId}`, { method: 'POST' });
        const message = await response.text();
        alert(message);
        fetchDeliveries();
    } catch (error) {
        console.error('Error finishing delivery:', error);
    }
}


async function fetchDrones() {
    try {
        const response = await fetch(`${droneUrl}`);
        const drones = await response.json();
        displayDrones(drones);
    } catch (error) {
        console.error('Error fetching drones:', error);
    }
}


function displayDrones(drones) {
    const droneList = document.getElementById('drone-list');
    droneList.innerHTML = '';

    drones.forEach(drone => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="drone-id">Drone ID: <strong>${drone.id}</strong></span> - 
            <span class="drone-serienummer">Serienummer: ${drone.serienummer}</span> - 
            <span class="drone-status">Status: <strong>${drone.status}</strong></span>
        `;
        droneList.appendChild(listItem);
    });
}


function createDrone() {
    fetch(`${droneUrl}/add`, { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Drone could not be created');
            }
            return response.json();
        })
        .then(data => {
            alert(`Drone created successfully: ${data.id}`);
            console.log(data);
            fetchDrones();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to create drone');
        });
}


function initialize() {
    fetchDeliveries();
    fetchDrones();
    setInterval(fetchDeliveries, 60000);
    document.getElementById('create-drone-button').addEventListener('click', createDrone);
}


document.addEventListener('DOMContentLoaded', initialize);
