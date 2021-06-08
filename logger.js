function log(req, res, next){
    console.log('logeate...');
    next();
}

module.exports = log;
