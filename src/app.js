const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const hbs = create({ extname: '.handlebars' });

// Configuración de Handlebars
app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar datos en formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let products = [];

app.get('/', (req, res) => {
    res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products });
});

app.post('/products', (req, res) => {
    const { product } = req.body;
    products.push(product);
    io.emit('productListUpdate', products);
    res.status(201).send({ message: 'Producto agregado' });
});

app.delete('/products/:productName', (req, res) => {
    const { productName } = req.params;
    products = products.filter(product => product !== productName);
    io.emit('productListUpdate', products);
    res.status(200).send({ message: 'Producto eliminado' });
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
