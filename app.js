const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const Joi = require('joi');
const app = express();
const morgan = require('morgan');

app.use(express.json());


app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//Configuración de entornos
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));

//uso de middleware de tercero - Morgan
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado');    
    debug('morgan está habilitado');

}

//Trabajos con la base de datos
debug('conectando con la base de datos...');


//app.use(logger);

/* app.use(function(req, res, next){
    console.log('Autenticando')
    next();
})*/

const usuarios = [
    {id:1, nombre:'nacho'},
    {id:2, nombre:'pancho'},
    {id:3, nombre:'xavi'}
];

app.get('/', (req, res) => {
    res.send('hola desde express');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('el usuario no fue encontrado');
    res.send(usuario);
});

app.get('/api/usuarios/:year/:month', (req, res) => {
    res.send(req.query);
});

app.post('/api/usuarios', (req, res ) => {

     const schema = Joi.object({
        nombre: Joi.string()
            .min(3)
            .required()
        });
        const {error, value} = validarUsuario(req.body.nombre);
        if(!error){
            const usuario= {
                id: usuarios.length + 1,
                nombre: value.nombre
            };
            usuarios.push(usuario);
            res.send(usuario);
        }else{
            const mensaje = error.details[0].message;
            res.status(400).send(mensaje);
        }

    });

app.put('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('el usuario no fue encontrado');
        return;
    }    
    
    const {error, value} = validarUsuario(req.body.nombre);
        if(error){
            const mensaje = error.details[0].message;
            res.status(400).send(mensaje);
            return;
        }

        usuario.nombre = value.nombre;
        res.send(usuario);
    });

    app.delete('/api/usuarios/:id', (req, res) => {
        let usuario = existeUsuario(req.params.id);
        if(!usuario){
            res.status(404).send('el usuario no fue encontrado');
            return;
        }

        //identificar el índice
        const index = usuarios.indexOf(usuario);
        usuarios.splice(index, 1);

        res.send(usuario);
    });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Eescuchando en el puerto ${port}`);
})

function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string()
            .min(3)
            .required()
        });
        return(schema.validate({ nombre: nom }));
}