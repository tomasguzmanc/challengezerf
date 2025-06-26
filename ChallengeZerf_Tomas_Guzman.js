class Node {
    constructor(name,parent) {
        if (!name || name.includes('/')) throw new
        Error('Invalid name');
        this.name = name;
        this.parent = parent;
    }
}

class File extends Node {
    constructor(name,parent) {
        super(name,parent);
    }
}

class Directory extends Node {
    constructor (name,parent){
        super (name,parent);
        this.children = new Map();
    }

addChild(node) {
    if (this.children.has(node.name)) {
        throw new Error(`Node ${node.name} already exists`);
    }
    this.children.set(node.name, node);
}

getChild(childName) {
    return this.children.get(childName);
}

removeChild(childName){
    if(!this.children.has(childName)){
        throw new Error(`Node ${childName} does not exist`);
    }
}

listChildren() {
    return Array.from(this.children.keys());
}
}

class FileSystem {
    constructor() {
        this.root = new Directory('/', null);
        this.currentDir = this.root;
    }

    resolvePath(path) {
        let parts = path.split('/').filter(p => p && p !== '.');
        let current = path.startsWith('/') ? this.root : this.currentDir;

        for (let part of parts) {
            if (part === '..'){
                if (current.parent) current = current.parent;
                continue;
            }
            if (!(current instanceof Directory)) {
                throw new Error(`Path ${part} not found in ${path}`);
            }
            let next = current.getChild(part);
            if (!next) throw new Error(`Path ${part} not found in ${path}`);
            current = next;
        }
        return current;
    }

    cd(dirName) {
        let target = this.resolvePath(dirName);
        if (!(target instanceof Directory)) {
            throw new Error(`${dirName} iss not a Directory`);
        }
        this.currentDir = target;
    }

    touch(fileName) {
        let parts = fileName.split('/');
        let file = parts.pop();
        let dir = parts.lenght > 1 || fileName.startsWith('/')
        ?  this.resolvePath(parts.join('/') || '/')
        : this.currentDir;

        if (!(dir instanceof Directory)){
            throw new Error (`Target path is not a directory:${fileName}`);
        }
        dir.addChild(new File(file,dir));
    }
     mkdir(dirName) {
        let parts = dirName.split('/');
        let dir = parts.pop();
        let parent = parts.lenght > 1 || dirName.startsWith('/')
        ?  this.resolvePath(parts.join('/') || '/')
        : this.currentDir;

        if (!(parent instanceof Directory)){
            throw new Error (`Target path is not a directory:${dirName}`);
        }
        parent.addChild(new Directory(dir,parent));
     }

     ls(){
        return this.currentDir.listChildren();
     }

     pwd() {
        let path = [];
        let current = this.currentDir;
        while (current) {
            path.unshift(current.name);
            current = current.parent;
        }
        return path.join('/') || '/';
     }

     rm(name) {
        let parts = dirName.split('/');
        let targetName = parts.pop();
        let dir = parts.lenght > 1 || name.startsWith('/')
        ?  this.resolvePath(parts.join('/') || '/')
        : this.currentDir;

        if (!(dir instanceof Directory)){
            throw new Error (`Target path is not a directory:${name}`);
        }
        dir.removeChild(targetName);
     }

}

//Testing

function runTests() {
    const fs = new FileSystem();

    console.log('Test 1: Crear directorios y archivos');
    fs.mkdir('home');
    fs.mkdir('home/docs');
    fs.touch('home/docs/hola.txt');
    console.assert(fs.ls().includes('home'), 'home should exist');
    fs.cd('home/docs');
    console.assert(fs.ls().includes('hola.txt'), 'hello.txt should exist');
    console.log('Test 1 aprobado');

    console.log('Test 2: pwd');
    console.assert(fs.pwd() === '/home/docs', 'pwd should return /home/docs');
    console.log('Test 2 aprobado');

    console.log('Test 3: cd ..');
    fs.cd('..');
    console.assert(fs.pwd() === '/home', 'pwd should return /home');
    console.log('Test 3 aprobado');

    console.log('Test 4: Rutas absolutas');
    fs.mkdir('/files');
    fs.touch('/files/test.txt');
    fs.cd('/files');
    console.assert(fs.ls().includes('test.txt'), 'test.txt should exist in /files');
    console.log('Test 4 aprobado');

    console.log('Test 5: rm');
    fs.rm('test.txt');
    console.assert(!fs.ls().includes('test.txt'), 'test.txt should be removed');
    console.log('Test 5 aprobado');

    console.log('Test 6: Rutas compuestas (bonus)');
    fs.mkdir('/home/docs/2025');
    fs.touch('/home/docs/2025/note.txt');
    fs.cd('/home/docs/2025');
    console.assert(fs.ls().includes('note.txt'), 'note.txt should exist');
    console.assert(fs.pwd() === '/home/docs/2025', 'pwd should return /home/docs/2025');
    console.log('Test 6 aprobado');

    console.log('Test 7: Errores');
    try {
        fs.touch('note.txt'); // Archivo ya existe
        console.assert(false, 'Should throw error for duplicate file');
    } catch (e) {
        console.assert(e.message.includes('already exists'), 'Should detect duplicate');
    }
    try {
        fs.cd('invalid');
        console.assert(false, 'Should throw error for invalid path');
    } catch (e) {
        console.assert(e.message.includes('not found'), 'Should detect invalid path');
    }
    console.log('Test 7 aprobado');
}

// Ejecutar tests
runTests();