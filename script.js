// Handle login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    if (response.ok) {
        alert('Login successful!');
        window.location.href = 'index.html'; // Redirect to the main page after login
    } else {
        alert(data.error);
    }
});

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
        alert('Registration successful!');
        window.location.href = 'login.html'; // Redirect to login page after registration
    } else {
        alert('Error registering');
    }
});

// Handle adding products
document.getElementById('addProductForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    const response = await fetch('http://localhost:3000/add-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, price })
    });

    if (response.ok) {
        alert('Product added successfully');
        window.location.reload(); // Reload page to reflect new products
    } else {
        alert('Error adding product');
    }
});

// Fetch and display products (no authentication required)
window.onload = async function () {
    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();
    const itemsDiv = document.getElementById('items');

    products.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('product');
        div.innerHTML = `
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Starting Price: $${product.price}</p>
            <p>Highest Bid: $${product.highestBid}</p>
            <input type="number" placeholder="Place your bid" id="bidAmount-${product._id}">
            <button onclick="placeBid('${product._id}')">Place Bid</button>
        `;
        itemsDiv.appendChild(div);
    });
};

// Handle placing a bid
async function placeBid(productId) {
    const bidAmount = document.getElementById(`bidAmount-${productId}`).value;
    const response = await fetch(`http://localhost:3000/bid/${productId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bidAmount })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        window.location.reload(); // Reload to update bids
    } else {
        alert(data.error);
    }
}

// Redirect to registration page
document.getElementById('registerLink').addEventListener('click', function () {
    window.location.href = 'register.html'; // Navigate to the registration page
});
