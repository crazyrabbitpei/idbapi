var fs =require('fs');
function config(fin){
    try {
        service = JSON.parse(fs.readFileSync('./data/path'));
        var local = service['import'];
        var fcgi = service['fcgi'];
    } 
    catch (err) {
        console.error("read service error:"+err);
        process.exit(9);
    }

    try {
        service = JSON.parse(fs.readFileSync('./data/service'));
        var apiip = service['ip'];
        var apiport = service['port'];
    } 
    catch (err) {
        console.error("read service error:"+err);
        process.exit(9);
    }

    try {
        apikeys = JSON.parse(fs.readFileSync('./data/shadow'));
    } 
    catch (err) {
        console.error("read shadow error:"+err);
        process.exit(9);
    }
    fin(local,fcgi,apiip,apiport,apikeys);
}
exports.config = config;
