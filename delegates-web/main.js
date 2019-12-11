getFiles().then(initialize)

function getFiles() {
    return fetch('./files.json?' + Math.random())
        .then(res => res.json())
}

function initialize(files) {
    console.log(files);
}